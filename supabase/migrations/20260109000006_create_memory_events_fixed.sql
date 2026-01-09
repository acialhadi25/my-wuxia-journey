-- ============================================
-- Memory Events Table Migration (Fixed)
-- ============================================
-- This migration creates the memory_events table for the Long-Term Memory System
-- It enables pgvector extension first, then creates the table

-- ============================================
-- STEP 1: Enable pgvector extension
-- ============================================
-- This is required for vector embeddings support
CREATE EXTENSION IF NOT EXISTS vector;

-- Verify extension is enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'vector'
  ) THEN
    RAISE EXCEPTION 'pgvector extension failed to install. Please enable it manually in Database > Extensions.';
  ELSE
    RAISE NOTICE '✅ pgvector extension enabled';
  END IF;
END $$;

-- ============================================
-- STEP 2: Create memory_events table
-- ============================================
CREATE TABLE IF NOT EXISTS public.memory_events (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  
  -- Temporal information
  timestamp BIGINT NOT NULL, -- Unix timestamp in milliseconds
  chapter INTEGER NOT NULL, -- Game chapter when event occurred
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Event classification
  event_type TEXT NOT NULL CHECK (event_type IN (
    'combat', 'social', 'cultivation', 'betrayal', 'alliance', 
    'murder', 'rescue', 'theft', 'discovery', 'breakthrough', 
    'death', 'romance', 'grudge', 'favor', 'sect_event', 
    'treasure', 'technique_learned', 'item_obtained', 
    'location_discovered', 'npc_met', 'quest_completed', 'other'
  )),
  
  -- Memory content
  summary TEXT NOT NULL, -- Brief 1-sentence summary
  full_narrative TEXT NOT NULL, -- Complete narrative of the event
  
  -- Importance and emotion
  importance TEXT NOT NULL CHECK (importance IN ('trivial', 'minor', 'moderate', 'important', 'critical')),
  importance_score INTEGER NOT NULL CHECK (importance_score BETWEEN 1 AND 10),
  emotion TEXT CHECK (emotion IN (
    'joy', 'anger', 'fear', 'sadness', 'disgust', 'surprise',
    'pride', 'shame', 'guilt', 'gratitude', 'hatred', 'love', 'neutral'
  )),
  
  -- Context information
  location TEXT NOT NULL,
  involved_npcs TEXT[] DEFAULT '{}', -- Array of NPC names
  tags TEXT[] DEFAULT '{}', -- Searchable tags
  keywords TEXT[] DEFAULT '{}', -- Extracted keywords for search
  
  -- Vector embedding for similarity search
  embedding VECTOR(1536), -- OpenAI embedding dimensions
  
  -- Consequences
  karma_change INTEGER DEFAULT 0,
  stat_changes JSONB DEFAULT '{}',
  relationship_changes JSONB DEFAULT '[]',
  
  -- Retrieval tracking
  retrieval_count INTEGER DEFAULT 0,
  last_retrieved BIGINT -- Unix timestamp in milliseconds
);

-- ============================================
-- STEP 3: Create indexes for performance
-- ============================================

-- Primary lookup indexes
CREATE INDEX IF NOT EXISTS idx_memory_events_character_id 
ON public.memory_events(character_id);

CREATE INDEX IF NOT EXISTS idx_memory_events_timestamp 
ON public.memory_events(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_memory_events_chapter 
ON public.memory_events(chapter);

-- Search and filter indexes
CREATE INDEX IF NOT EXISTS idx_memory_events_event_type 
ON public.memory_events(event_type);

CREATE INDEX IF NOT EXISTS idx_memory_events_importance 
ON public.memory_events(importance);

CREATE INDEX IF NOT EXISTS idx_memory_events_location 
ON public.memory_events(location);

-- Array search indexes (GIN for array contains operations)
CREATE INDEX IF NOT EXISTS idx_memory_events_involved_npcs 
ON public.memory_events USING GIN(involved_npcs);

CREATE INDEX IF NOT EXISTS idx_memory_events_tags 
ON public.memory_events USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_memory_events_keywords 
ON public.memory_events USING GIN(keywords);

-- Vector similarity search index (IVFFlat for fast approximate search)
-- Note: This index is created after some data is inserted for better performance
-- You can create it manually later with:
-- CREATE INDEX idx_memory_events_embedding ON public.memory_events 
-- USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- ============================================
-- STEP 4: Create helper functions
-- ============================================

-- Function to search memories by similarity
CREATE OR REPLACE FUNCTION search_memories(
  query_character_id UUID,
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.3,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  character_id UUID,
  event_timestamp BIGINT,
  chapter INTEGER,
  event_type TEXT,
  summary TEXT,
  full_narrative TEXT,
  importance TEXT,
  importance_score INTEGER,
  emotion TEXT,
  location TEXT,
  involved_npcs TEXT[],
  tags TEXT[],
  keywords TEXT[],
  karma_change INTEGER,
  stat_changes JSONB,
  relationship_changes JSONB,
  retrieval_count INTEGER,
  last_retrieved BIGINT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    me.id,
    me.character_id,
    me.timestamp AS event_timestamp,
    me.chapter,
    me.event_type,
    me.summary,
    me.full_narrative,
    me.importance,
    me.importance_score,
    me.emotion,
    me.location,
    me.involved_npcs,
    me.tags,
    me.keywords,
    me.karma_change,
    me.stat_changes,
    me.relationship_changes,
    me.retrieval_count,
    me.last_retrieved,
    1 - (me.embedding <=> query_embedding) AS similarity
  FROM public.memory_events me
  WHERE me.character_id = query_character_id
    AND me.embedding IS NOT NULL
    AND 1 - (me.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;

-- Function to get memory statistics
CREATE OR REPLACE FUNCTION get_memory_stats(query_character_id UUID)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'totalEvents', COUNT(*),
    'criticalEvents', (
      SELECT json_agg(json_build_object('id', id, 'summary', summary, 'chapter', chapter))
      FROM public.memory_events
      WHERE character_id = query_character_id AND importance = 'critical'
      ORDER BY timestamp DESC
      LIMIT 10
    ),
    'mostRetrievedEvents', (
      SELECT json_agg(json_build_object('id', id, 'summary', summary, 'retrievalCount', retrieval_count))
      FROM public.memory_events
      WHERE character_id = query_character_id AND retrieval_count > 0
      ORDER BY retrieval_count DESC
      LIMIT 10
    ),
    'recentEvents', (
      SELECT json_agg(json_build_object('id', id, 'summary', summary, 'chapter', chapter))
      FROM public.memory_events
      WHERE character_id = query_character_id
      ORDER BY timestamp DESC
      LIMIT 10
    )
  ) INTO result
  FROM public.memory_events
  WHERE character_id = query_character_id;
  
  RETURN result;
END;
$$;

-- ============================================
-- STEP 5: Enable Row Level Security (RLS)
-- ============================================

ALTER TABLE public.memory_events ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access memories for their own characters
CREATE POLICY "Users can view their own character memories"
ON public.memory_events
FOR SELECT
USING (
  character_id IN (
    SELECT id FROM public.characters 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert memories for their own characters"
ON public.memory_events
FOR INSERT
WITH CHECK (
  character_id IN (
    SELECT id FROM public.characters 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own character memories"
ON public.memory_events
FOR UPDATE
USING (
  character_id IN (
    SELECT id FROM public.characters 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own character memories"
ON public.memory_events
FOR DELETE
USING (
  character_id IN (
    SELECT id FROM public.characters 
    WHERE user_id = auth.uid()
  )
);

-- ============================================
-- STEP 6: Add comments for documentation
-- ============================================

COMMENT ON TABLE public.memory_events IS 'Stores character memories for the Long-Term Memory System with vector embeddings for similarity search';
COMMENT ON COLUMN public.memory_events.embedding IS 'Vector embedding (1536 dimensions) for semantic similarity search using OpenAI text-embedding-3-small';
COMMENT ON COLUMN public.memory_events.importance_score IS 'Numeric importance score (1-10) for ranking and filtering';
COMMENT ON COLUMN public.memory_events.retrieval_count IS 'Number of times this memory has been retrieved by the AI';

-- ============================================
-- STEP 7: Verification
-- ============================================

DO $$
BEGIN
  -- Check if table exists
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'memory_events'
  ) THEN
    RAISE NOTICE '✅ memory_events table created successfully';
  ELSE
    RAISE EXCEPTION '❌ memory_events table creation failed';
  END IF;
  
  -- Check if functions exist
  IF EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'search_memories'
  ) THEN
    RAISE NOTICE '✅ search_memories function created successfully';
  ELSE
    RAISE WARNING '⚠️ search_memories function not found';
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'get_memory_stats'
  ) THEN
    RAISE NOTICE '✅ get_memory_stats function created successfully';
  ELSE
    RAISE WARNING '⚠️ get_memory_stats function not found';
  END IF;
END $$;

-- ============================================
-- Migration Complete!
-- ============================================
-- The memory_events table is now ready to use.
-- The Long-Term Memory System can now store and retrieve memories with vector embeddings.
