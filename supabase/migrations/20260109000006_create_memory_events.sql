-- Create memory_events table for long-term memory storage
CREATE TABLE IF NOT EXISTS memory_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  
  -- Timing
  timestamp BIGINT NOT NULL,
  chapter INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Event details
  event_type TEXT NOT NULL,
  summary TEXT NOT NULL,
  full_narrative TEXT NOT NULL,
  
  -- Importance and emotion
  importance TEXT NOT NULL CHECK (importance IN ('trivial', 'minor', 'moderate', 'important', 'critical')),
  importance_score INTEGER NOT NULL CHECK (importance_score >= 0 AND importance_score <= 10),
  emotion TEXT,
  
  -- Context
  location TEXT NOT NULL,
  involved_npcs TEXT[] DEFAULT '{}',
  involved_items TEXT[],
  involved_techniques TEXT[],
  
  -- Tags and keywords
  tags TEXT[] DEFAULT '{}',
  keywords TEXT[] DEFAULT '{}',
  
  -- Consequences
  karma_change INTEGER,
  stat_changes JSONB,
  relationship_changes JSONB,
  
  -- Vector embedding for similarity search
  embedding VECTOR(1536), -- OpenAI embedding dimension
  
  -- Retrieval tracking
  retrieval_count INTEGER DEFAULT 0,
  last_retrieved TIMESTAMPTZ,
  
  -- Indexes
  CONSTRAINT memory_events_character_id_fkey FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_memory_events_character_id ON memory_events(character_id);
CREATE INDEX IF NOT EXISTS idx_memory_events_timestamp ON memory_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_memory_events_chapter ON memory_events(chapter);
CREATE INDEX IF NOT EXISTS idx_memory_events_event_type ON memory_events(event_type);
CREATE INDEX IF NOT EXISTS idx_memory_events_importance ON memory_events(importance_score DESC);
CREATE INDEX IF NOT EXISTS idx_memory_events_location ON memory_events(location);
CREATE INDEX IF NOT EXISTS idx_memory_events_involved_npcs ON memory_events USING GIN(involved_npcs);
CREATE INDEX IF NOT EXISTS idx_memory_events_tags ON memory_events USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_memory_events_keywords ON memory_events USING GIN(keywords);

-- Create index for vector similarity search (requires pgvector extension)
-- Note: This requires pgvector extension to be enabled
-- Run: CREATE EXTENSION IF NOT EXISTS vector;
CREATE INDEX IF NOT EXISTS idx_memory_events_embedding ON memory_events USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Enable Row Level Security
ALTER TABLE memory_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own character memories"
  ON memory_events FOR SELECT
  USING (
    character_id IN (
      SELECT id FROM characters WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert memories for their characters"
  ON memory_events FOR INSERT
  WITH CHECK (
    character_id IN (
      SELECT id FROM characters WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own character memories"
  ON memory_events FOR UPDATE
  USING (
    character_id IN (
      SELECT id FROM characters WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own character memories"
  ON memory_events FOR DELETE
  USING (
    character_id IN (
      SELECT id FROM characters WHERE user_id = auth.uid()
    )
  );

-- Create function to search memories by similarity
CREATE OR REPLACE FUNCTION search_memories(
  query_embedding VECTOR(1536),
  query_character_id UUID,
  match_threshold FLOAT DEFAULT 0.6,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  character_id UUID,
  summary TEXT,
  full_narrative TEXT,
  importance TEXT,
  importance_score INTEGER,
  location TEXT,
  chapter INTEGER,
  involved_npcs TEXT[],
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    me.id,
    me.character_id,
    me.summary,
    me.full_narrative,
    me.importance,
    me.importance_score,
    me.location,
    me.chapter,
    me.involved_npcs,
    1 - (me.embedding <=> query_embedding) AS similarity
  FROM memory_events me
  WHERE me.character_id = query_character_id
    AND 1 - (me.embedding <=> query_embedding) > match_threshold
  ORDER BY me.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Create function to get memory statistics
CREATE OR REPLACE FUNCTION get_memory_stats(query_character_id UUID)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_events', COUNT(*),
    'critical_events', COUNT(*) FILTER (WHERE importance = 'critical'),
    'important_events', COUNT(*) FILTER (WHERE importance = 'important'),
    'average_importance', AVG(importance_score),
    'most_common_type', (
      SELECT event_type
      FROM memory_events
      WHERE character_id = query_character_id
      GROUP BY event_type
      ORDER BY COUNT(*) DESC
      LIMIT 1
    ),
    'most_retrieved', (
      SELECT json_agg(json_build_object(
        'summary', summary,
        'retrieval_count', retrieval_count
      ))
      FROM (
        SELECT summary, retrieval_count
        FROM memory_events
        WHERE character_id = query_character_id
        ORDER BY retrieval_count DESC
        LIMIT 5
      ) AS top_memories
    )
  ) INTO result
  FROM memory_events
  WHERE character_id = query_character_id;
  
  RETURN result;
END;
$$;

-- Add comment
COMMENT ON TABLE memory_events IS 'Stores long-term memory events for characters using vector embeddings for semantic search';
