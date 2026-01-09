/**
 * Memory Service
 * Handles long-term memory storage and retrieval using Pinecone vector database
 */

import { 
  MemoryEvent, 
  MemoryQuery, 
  MemoryResult, 
  MemoryStats,
  MemoryContext,
  extractKeywords,
  getImportanceScore,
  calculateMemoryDecay
} from '@/types/memory';

// Pinecone client will be initialized lazily
let pineconeInitialized = false;

/**
 * Initialize Pinecone connection
 */
async function initializePinecone() {
  if (pineconeInitialized) return;
  
  const apiKey = import.meta.env.VITE_PINECONE_API_KEY;
  
  if (!apiKey) {
    console.warn('Pinecone API key not found. Memory system will use fallback storage.');
    return;
  }
  
  try {
    // Pinecone initialization will be done via REST API
    // No need for SDK in browser environment
    pineconeInitialized = true;
    console.log('✅ Pinecone memory system initialized');
  } catch (error) {
    console.error('Failed to initialize Pinecone:', error);
  }
}

/**
 * Generate embedding for text using OpenAI-compatible API
 * For now, we'll use a simple hash-based approach as fallback
 * In production, this should call OpenAI embeddings API
 */
async function generateEmbedding(text: string): Promise<number[]> {
  // TODO: Implement actual embedding generation
  // For now, return a mock embedding
  // In production: call OpenAI embeddings API or use local model
  
  // Simple hash-based embedding (1536 dimensions to match OpenAI)
  const embedding = new Array(1536).fill(0);
  
  // Use text hash to generate pseudo-embedding
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i);
    hash = hash & hash;
  }
  
  // Distribute hash across embedding dimensions
  for (let i = 0; i < 1536; i++) {
    embedding[i] = Math.sin(hash + i) * 0.5;
  }
  
  return embedding;
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  if (normA === 0 || normB === 0) return 0;
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Memory Service Class
 */
export class MemoryService {
  private static memoryCache: Map<string, MemoryEvent[]> = new Map();
  
  /**
   * Store a memory event
   */
  static async storeMemory(event: Omit<MemoryEvent, 'id' | 'embedding' | 'createdAt' | 'retrievalCount'>): Promise<MemoryEvent> {
    await initializePinecone();
    
    // Generate embedding for the event
    const embeddingText = `${event.summary} ${event.fullNarrative} ${event.tags.join(' ')} ${event.keywords.join(' ')}`;
    const embedding = await generateEmbedding(embeddingText);
    
    // Create full memory event
    const memoryEvent: MemoryEvent = {
      ...event,
      id: crypto.randomUUID(),
      embedding,
      createdAt: Date.now(),
      retrievalCount: 0,
    };
    
    // Store in cache
    const characterMemories = this.memoryCache.get(event.characterId) || [];
    characterMemories.push(memoryEvent);
    this.memoryCache.set(event.characterId, characterMemories);
    
    // TODO: Store in Pinecone
    // In production: upsert to Pinecone index
    
    // Store in Supabase as backup
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      // @ts-ignore - memory_events table not yet in generated types
      await supabase.from('memory_events').insert({
        id: memoryEvent.id,
        character_id: memoryEvent.characterId,
        timestamp: memoryEvent.timestamp,
        chapter: memoryEvent.chapter,
        event_type: memoryEvent.eventType,
        summary: memoryEvent.summary,
        full_narrative: memoryEvent.fullNarrative,
        importance: memoryEvent.importance,
        importance_score: memoryEvent.importanceScore,
        emotion: memoryEvent.emotion,
        location: memoryEvent.location,
        involved_npcs: memoryEvent.involvedNPCs,
        involved_items: memoryEvent.involvedItems,
        involved_techniques: memoryEvent.involvedTechniques,
        tags: memoryEvent.tags,
        keywords: memoryEvent.keywords,
        karma_change: memoryEvent.karmaChange,
        stat_changes: memoryEvent.statChanges,
        relationship_changes: memoryEvent.relationshipChanges,
        embedding: memoryEvent.embedding,
        created_at: new Date(memoryEvent.createdAt).toISOString(),
        retrieval_count: 0,
      });
    } catch (error) {
      console.error('Failed to store memory in Supabase:', error);
    }
    
    console.log(`📝 Memory stored: ${event.summary} (Importance: ${event.importance})`);
    
    return memoryEvent;
  }
  
  /**
   * Query memories using semantic search
   */
  static async queryMemories(query: MemoryQuery): Promise<MemoryResult[]> {
    await initializePinecone();
    
    // Generate query embedding
    const queryEmbedding = await generateEmbedding(query.queryText);
    
    // Get character memories from cache
    let memories = this.memoryCache.get(query.characterId) || [];
    
    // If cache is empty, load from Supabase
    if (memories.length === 0) {
      memories = await this.loadMemoriesFromDatabase(query.characterId);
    }
    
    // Apply filters
    let filteredMemories = memories;
    
    if (query.eventTypes && query.eventTypes.length > 0) {
      filteredMemories = filteredMemories.filter(m => 
        query.eventTypes!.includes(m.eventType)
      );
    }
    
    if (query.minImportance) {
      const minScore = getImportanceScore(query.minImportance);
      filteredMemories = filteredMemories.filter(m => 
        m.importanceScore >= minScore
      );
    }
    
    if (query.involvedNPCs && query.involvedNPCs.length > 0) {
      filteredMemories = filteredMemories.filter(m =>
        m.involvedNPCs.some(npc => query.involvedNPCs!.includes(npc))
      );
    }
    
    if (query.location) {
      filteredMemories = filteredMemories.filter(m =>
        m.location.toLowerCase().includes(query.location!.toLowerCase())
      );
    }
    
    if (query.chapterRange) {
      filteredMemories = filteredMemories.filter(m => {
        if (query.chapterRange!.min && m.chapter < query.chapterRange!.min) return false;
        if (query.chapterRange!.max && m.chapter > query.chapterRange!.max) return false;
        return true;
      });
    }
    
    // Calculate similarity scores
    const results: MemoryResult[] = filteredMemories.map(memory => {
      const similarity = memory.embedding 
        ? cosineSimilarity(queryEmbedding, memory.embedding)
        : 0.5; // Default similarity if no embedding
      
      // Apply decay factor
      const decay = calculateMemoryDecay(memory, Date.now());
      const adjustedSimilarity = similarity * (0.7 + decay * 0.3);
      
      return {
        event: memory,
        similarity: adjustedSimilarity,
        relevanceReason: this.generateRelevanceReason(memory, query),
      };
    });
    
    // Filter by similarity threshold
    const threshold = query.similarityThreshold || 0.6;
    const relevantResults = results.filter(r => r.similarity >= threshold);
    
    // Sort by similarity (descending)
    relevantResults.sort((a, b) => b.similarity - a.similarity);
    
    // Limit results
    const limit = query.limit || 5;
    const limitedResults = relevantResults.slice(0, limit);
    
    // Update retrieval counts
    limitedResults.forEach(result => {
      result.event.retrievalCount++;
      result.event.lastRetrieved = Date.now();
    });
    
    console.log(`🔍 Memory query: "${query.queryText}" - Found ${limitedResults.length} relevant memories`);
    
    return limitedResults;
  }
  
  /**
   * Load memories from database
   */
  private static async loadMemoriesFromDatabase(characterId: string): Promise<MemoryEvent[]> {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      // @ts-ignore - memory_events table not yet in generated types
      const { data, error } = await supabase
        // @ts-ignore
        .from('memory_events')
        .select('*')
        .eq('character_id', characterId)
        .order('timestamp', { ascending: false });
      
      if (error) throw error;
      
      const memories: MemoryEvent[] = (data || []).map((row: any) => ({
        id: row.id,
        characterId: row.character_id,
        timestamp: row.timestamp,
        chapter: row.chapter,
        eventType: row.event_type,
        summary: row.summary,
        fullNarrative: row.full_narrative,
        importance: row.importance,
        importanceScore: row.importance_score,
        emotion: row.emotion,
        location: row.location,
        involvedNPCs: row.involved_npcs || [],
        involvedItems: row.involved_items,
        involvedTechniques: row.involved_techniques,
        tags: row.tags || [],
        keywords: row.keywords || [],
        karmaChange: row.karma_change,
        statChanges: row.stat_changes,
        relationshipChanges: row.relationship_changes,
        embedding: row.embedding,
        createdAt: new Date(row.created_at).getTime(),
        retrievalCount: row.retrieval_count || 0,
        lastRetrieved: row.last_retrieved ? new Date(row.last_retrieved).getTime() : undefined,
      }));
      
      // Cache the memories
      this.memoryCache.set(characterId, memories);
      
      return memories;
    } catch (error) {
      console.error('Failed to load memories from database:', error);
      return [];
    }
  }
  
  /**
   * Generate relevance reason for a memory
   */
  private static generateRelevanceReason(memory: MemoryEvent, query: MemoryQuery): string {
    const reasons: string[] = [];
    
    if (query.involvedNPCs && memory.involvedNPCs.some(npc => query.involvedNPCs!.includes(npc))) {
      reasons.push('involves same NPC');
    }
    
    if (query.location && memory.location.toLowerCase().includes(query.location.toLowerCase())) {
      reasons.push('same location');
    }
    
    if (memory.importance === 'critical' || memory.importance === 'important') {
      reasons.push('high importance');
    }
    
    if (memory.karmaChange && Math.abs(memory.karmaChange) >= 10) {
      reasons.push('significant karma impact');
    }
    
    return reasons.length > 0 ? reasons.join(', ') : 'semantic similarity';
  }
  
  /**
   * Get memory statistics for a character
   */
  static async getMemoryStats(characterId: string): Promise<MemoryStats> {
    const memories = this.memoryCache.get(characterId) || await this.loadMemoriesFromDatabase(characterId);
    
    const eventsByType: any = {};
    const eventsByImportance: any = {};
    
    memories.forEach(memory => {
      eventsByType[memory.eventType] = (eventsByType[memory.eventType] || 0) + 1;
      eventsByImportance[memory.importance] = (eventsByImportance[memory.importance] || 0) + 1;
    });
    
    const mostRetrieved = [...memories]
      .sort((a, b) => b.retrievalCount - a.retrievalCount)
      .slice(0, 10);
    
    const recent = [...memories]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10);
    
    const critical = memories.filter(m => m.importance === 'critical');
    
    return {
      totalEvents: memories.length,
      eventsByType,
      eventsByImportance,
      mostRetrievedEvents: mostRetrieved,
      recentEvents: recent,
      criticalEvents: critical,
    };
  }
  
  /**
   * Build memory context for AI prompt
   */
  static async buildMemoryContext(
    characterId: string,
    currentSituation: string,
    options?: {
      includeNPCs?: string[];
      includeLocation?: string;
      maxMemories?: number;
    }
  ): Promise<MemoryContext> {
    const query: MemoryQuery = {
      characterId,
      queryText: currentSituation,
      involvedNPCs: options?.includeNPCs,
      location: options?.includeLocation,
      limit: options?.maxMemories || 5,
      similarityThreshold: 0.6,
    };
    
    const results = await this.queryMemories(query);
    
    // Generate context summary
    const contextSummary = results.length > 0
      ? `Found ${results.length} relevant past memories that may influence this situation.`
      : 'No directly relevant past memories found.';
    
    return {
      relevantMemories: results,
      totalMemoriesSearched: this.memoryCache.get(characterId)?.length || 0,
      queryUsed: currentSituation,
      contextSummary,
    };
  }
  
  /**
   * Clear memory cache (useful for testing)
   */
  static clearCache() {
    this.memoryCache.clear();
  }
}
