/**
 * Memory System Types
 * For long-term event storage and retrieval using vector embeddings
 */

export type MemoryImportance = 'trivial' | 'minor' | 'moderate' | 'important' | 'critical';

export type MemoryEventType = 
  | 'combat'
  | 'social'
  | 'cultivation'
  | 'betrayal'
  | 'alliance'
  | 'murder'
  | 'rescue'
  | 'theft'
  | 'discovery'
  | 'breakthrough'
  | 'death'
  | 'romance'
  | 'grudge'
  | 'favor'
  | 'sect_event'
  | 'treasure'
  | 'technique_learned'
  | 'item_obtained'
  | 'location_discovered'
  | 'npc_met'
  | 'quest_completed'
  | 'other';

export type MemoryEmotion = 
  | 'joy'
  | 'anger'
  | 'fear'
  | 'sadness'
  | 'disgust'
  | 'surprise'
  | 'pride'
  | 'shame'
  | 'guilt'
  | 'gratitude'
  | 'hatred'
  | 'love'
  | 'neutral';

/**
 * Core memory event structure
 */
export interface MemoryEvent {
  id: string;
  characterId: string;
  timestamp: number;
  chapter: number;
  
  // Event details
  eventType: MemoryEventType;
  summary: string; // Short summary for display
  fullNarrative: string; // Complete narrative text
  
  // Importance and emotion
  importance: MemoryImportance;
  importanceScore: number; // 0-10 scale
  emotion?: MemoryEmotion;
  
  // Context
  location: string;
  involvedNPCs: string[]; // NPC IDs or names
  involvedItems?: string[]; // Item IDs
  involvedTechniques?: string[]; // Technique names
  
  // Tags for retrieval
  tags: string[];
  keywords: string[];
  
  // Consequences
  karmaChange?: number;
  statChanges?: Record<string, number>;
  relationshipChanges?: Array<{
    npcId: string;
    favorChange?: number;
    grudgeChange?: number;
  }>;
  
  // Vector embedding (for similarity search)
  embedding?: number[]; // 1536-dim vector from OpenAI
  
  // Metadata
  createdAt: number;
  retrievalCount: number; // How many times this memory was retrieved
  lastRetrieved?: number;
}

/**
 * Memory query for retrieval
 */
export interface MemoryQuery {
  characterId: string;
  queryText: string; // Natural language query
  
  // Filters
  eventTypes?: MemoryEventType[];
  minImportance?: MemoryImportance;
  involvedNPCs?: string[];
  location?: string;
  chapterRange?: { min?: number; max?: number };
  timeRange?: { start?: number; end?: number };
  
  // Retrieval settings
  limit?: number; // Max results (default: 5)
  similarityThreshold?: number; // 0-1 (default: 0.7)
  includeContext?: boolean; // Include surrounding events
}

/**
 * Memory retrieval result
 */
export interface MemoryResult {
  event: MemoryEvent;
  similarity: number; // 0-1 similarity score
  relevanceReason?: string; // Why this memory is relevant
}

/**
 * Memory statistics
 */
export interface MemoryStats {
  totalEvents: number;
  eventsByType: Record<MemoryEventType, number>;
  eventsByImportance: Record<MemoryImportance, number>;
  mostRetrievedEvents: MemoryEvent[];
  recentEvents: MemoryEvent[];
  criticalEvents: MemoryEvent[];
}

/**
 * Memory context for AI prompt
 */
export interface MemoryContext {
  relevantMemories: MemoryResult[];
  totalMemoriesSearched: number;
  queryUsed: string;
  contextSummary: string; // Human-readable summary of memories
}

/**
 * Calculate importance score from importance level
 */
export function getImportanceScore(importance: MemoryImportance): number {
  switch (importance) {
    case 'trivial': return 1;
    case 'minor': return 3;
    case 'moderate': return 5;
    case 'important': return 7;
    case 'critical': return 10;
  }
}

/**
 * Determine importance level from score
 */
export function getImportanceLevel(score: number): MemoryImportance {
  if (score >= 9) return 'critical';
  if (score >= 7) return 'important';
  if (score >= 5) return 'moderate';
  if (score >= 3) return 'minor';
  return 'trivial';
}

/**
 * Calculate memory decay factor based on time and retrieval count
 * More retrieved memories stay relevant longer
 */
export function calculateMemoryDecay(
  event: MemoryEvent,
  currentTime: number
): number {
  const ageInDays = (currentTime - event.timestamp) / (1000 * 60 * 60 * 24);
  const retrievalBonus = Math.min(event.retrievalCount * 0.1, 0.5);
  
  // Decay formula: starts at 1.0, decays over time, but retrieval slows decay
  const baseDecay = Math.exp(-ageInDays / 30); // 30-day half-life
  const adjustedDecay = baseDecay + retrievalBonus;
  
  return Math.min(adjustedDecay, 1.0);
}

/**
 * Determine if an event should trigger a callback/consequence
 */
export function shouldTriggerCallback(
  event: MemoryEvent,
  currentChapter: number,
  minChapterGap: number = 5
): boolean {
  const chapterGap = currentChapter - event.chapter;
  
  // Critical events can trigger callbacks sooner
  if (event.importance === 'critical' && chapterGap >= 3) {
    return true;
  }
  
  // Important events need more time
  if (event.importance === 'important' && chapterGap >= minChapterGap) {
    return true;
  }
  
  // Moderate events need even more time
  if (event.importance === 'moderate' && chapterGap >= minChapterGap * 2) {
    return true;
  }
  
  return false;
}

/**
 * Extract keywords from text for tagging
 */
export function extractKeywords(text: string): string[] {
  // Remove common words
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
    'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'
  ]);
  
  // Extract words
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.has(word));
  
  // Count frequency
  const frequency: Record<string, number> = {};
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });
  
  // Return top keywords
  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}

/**
 * Format memory for AI prompt
 */
export function formatMemoryForPrompt(result: MemoryResult): string {
  const { event, similarity } = result;
  
  return `
[Memory from Chapter ${event.chapter}] (Relevance: ${(similarity * 100).toFixed(0)}%)
Location: ${event.location}
Event: ${event.summary}
${event.involvedNPCs.length > 0 ? `NPCs Involved: ${event.involvedNPCs.join(', ')}` : ''}
${event.karmaChange ? `Karma Impact: ${event.karmaChange > 0 ? '+' : ''}${event.karmaChange}` : ''}
`.trim();
}

/**
 * Format multiple memories for AI prompt
 */
export function formatMemoriesForPrompt(results: MemoryResult[]): string {
  if (results.length === 0) {
    return 'No relevant past memories found.';
  }
  
  const formatted = results.map(formatMemoryForPrompt).join('\n\n');
  
  return `
RELEVANT PAST MEMORIES (${results.length}):
${formatted}

These memories should influence NPC reactions, world state, and narrative callbacks.
`.trim();
}
