import { supabase } from '@/integrations/supabase/client';
import { Character, GameMessage, GameChoice, Technique, InventoryItem, CultivationRealm, REALM_MAX_QI, REALM_MAX_HEALTH, getNextRealm } from '@/types/game';
import { DeepseekService, DeepseekResponse } from './deepseekService';

export type AIResponse = DeepseekResponse;

export type StoryEvent = {
  id: string;
  character_id: string;
  event_type: string;
  summary: string;
  details?: any;
  importance: number;
  chapter: number;
  created_at: string;
};

export type NPCRelationship = {
  id: string;
  character_id: string;
  npc_name: string;
  npc_description?: string;
  favor: number;
  grudge: number;
  status: string;
  last_interaction?: string;
};

export async function generateNarrative(
  character: Character,
  action: string,
  characterId?: string,
  language?: 'en' | 'id', // Add language parameter
  additionalContext?: {
    currentLocation?: string;
    currentChapter?: number;
  }
): Promise<AIResponse> {
  try {
    // Fetch story events, NPC relationships, techniques, and items
    let storyEvents: StoryEvent[] = [];
    let npcRelationships: NPCRelationship[] = [];
    let techniques: any[] = [];
    let inventory: any[] = [];
    let recentMessages: any[] = [];

    if (characterId) {
      const [eventsResult, npcResult, techniquesResult, itemsResult, messagesResult] = await Promise.all([
        supabase
          .from('story_events')
          .select('*')
          .eq('character_id', characterId)
          .order('importance', { ascending: false })
          .limit(20),
        supabase
          .from('npc_relationships')
          .select('*')
          .eq('character_id', characterId),
        supabase
          .from('character_techniques')
          .select('*')
          .eq('character_id', characterId),
        supabase
          .from('character_items')
          .select('*')
          .eq('character_id', characterId),
        supabase
          .from('chat_messages')
          .select('*')
          .eq('character_id', characterId)
          .order('created_at', { ascending: false })
          .limit(10)
      ]);

      if (eventsResult.data) storyEvents = eventsResult.data as StoryEvent[];
      if (npcResult.data) npcRelationships = npcResult.data as NPCRelationship[];
      if (techniquesResult.data) techniques = techniquesResult.data;
      if (itemsResult.data) inventory = itemsResult.data;
      if (messagesResult.data) recentMessages = messagesResult.data.reverse();
    }

    // Use Deepseek service with language parameter and memory context
    const response = await DeepseekService.generateNarrative(character, action, {
      recentMessages,
      storyEvents,
      npcRelationships,
      techniques,
      inventory,
      language, // Pass language to Deepseek
      characterId, // Pass characterId for memory system
      currentLocation: additionalContext?.currentLocation,
      currentChapter: additionalContext?.currentChapter
    });

    return response;
  } catch (error) {
    console.error('Error generating narrative:', error);
    throw error;
  }
}

export async function saveCharacterToDatabase(character: Character, userId: string): Promise<string> {
  const { data, error } = await supabase
    .from('characters')
    .insert({
      user_id: userId,
      name: character.name,
      origin: character.origin,
      spirit_root: character.spiritRoot,
      realm: character.realm,
      golden_finger: character.goldenFinger,
      stats: character.stats,
      qi: character.qi,
      max_qi: character.maxQi,
      health: character.health,
      max_health: character.maxHealth,
      stamina: character.stamina || 100,
      max_stamina: character.maxStamina || 100,
      karma: character.karma,
      cultivation_progress: character.cultivationProgress,
      breakthrough_ready: character.breakthroughReady,
      inventory: [],
      visual_traits: character.visualTraits,
      current_location: 'Starting Location',
      current_chapter: 1,
      time_elapsed: 'Day 1',
      tutorial_completed: character.tutorialCompleted || false,
      golden_finger_unlocked: character.goldenFingerUnlocked || false,
      current_tutorial_step: 0,
      active_effects: character.activeEffects || [],
      last_regeneration: character.lastRegeneration || Date.now()
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving character:', error);
    throw error;
  }

  return data.id;
}

export async function updateCharacterInDatabase(
  characterId: string,
  updates: Partial<{
    realm: string;
    stats: any;
    qi: number;
    max_qi: number;
    health: number;
    max_health: number;
    stamina: number;
    max_stamina: number;
    karma: number;
    cultivation_progress: number;
    breakthrough_ready: boolean;
    inventory: any[];
    visual_traits: any;
    current_location: string;
    current_chapter: number;
    time_elapsed: string;
    is_alive: boolean;
    tutorial_completed: boolean;
    golden_finger_unlocked: boolean;
    active_effects: any[];
    last_regeneration: number;
  }>
): Promise<void> {
  // Try to update with all fields first
  let { error } = await supabase
    .from('characters')
    .update(updates)
    .eq('id', characterId);

  // If error is about missing columns, retry without those columns
  if (error && error.message?.includes('column')) {
    console.warn('Some columns not found in database, retrying without them:', error.message);
    
    // Remove fields that might not exist yet
    const { active_effects, last_regeneration, ...safeUpdates } = updates;
    
    const { error: retryError } = await supabase
      .from('characters')
      .update(safeUpdates)
      .eq('id', characterId);
    
    if (retryError) {
      console.error('Error updating character:', retryError);
      throw retryError;
    }
    
    console.log('✅ Character updated successfully (without new columns)');
    return;
  }

  if (error) {
    console.error('Error updating character:', error);
    throw error;
  }
}

export async function addTechnique(
  characterId: string,
  technique: {
    name: string;
    type: string;
    element?: string | null;
    rank: string;
    description: string;
    qi_cost: number;
    cooldown?: string;
  }
): Promise<string> {
  const { data, error } = await supabase
    .from('character_techniques')
    .insert({
      character_id: characterId,
      name: technique.name,
      type: technique.type,
      element: technique.element,
      rank: technique.rank,
      description: technique.description,
      qi_cost: technique.qi_cost,
      cooldown: technique.cooldown,
      mastery: 0
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding technique:', error);
    throw error;
  }

  return data.id;
}

export async function updateTechniqueMastery(
  characterId: string,
  techniqueName: string,
  masteryChange: number
): Promise<void> {
  // Get current technique
  const { data: technique } = await supabase
    .from('character_techniques')
    .select('*')
    .eq('character_id', characterId)
    .eq('name', techniqueName)
    .maybeSingle();

  if (technique) {
    const newMastery = Math.min(100, Math.max(0, technique.mastery + masteryChange));
    await supabase
      .from('character_techniques')
      .update({ mastery: newMastery })
      .eq('id', technique.id);
  }
}

export async function addItem(
  characterId: string,
  item: {
    name: string;
    type: string;
    rarity: string;
    quantity: number;
    description: string;
    effects?: Record<string, any>;
  }
): Promise<string> {
  // Check if item already exists
  const { data: existing } = await supabase
    .from('character_items')
    .select('*')
    .eq('character_id', characterId)
    .eq('name', item.name)
    .maybeSingle();

  if (existing) {
    // Add to quantity
    await supabase
      .from('character_items')
      .update({ quantity: existing.quantity + item.quantity })
      .eq('id', existing.id);
    return existing.id;
  }

  const { data, error } = await supabase
    .from('character_items')
    .insert({
      character_id: characterId,
      name: item.name,
      type: item.type,
      rarity: item.rarity,
      quantity: item.quantity,
      description: item.description,
      effects: item.effects || {}
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding item:', error);
    throw error;
  }

  return data.id;
}

export async function consumeItem(
  characterId: string,
  itemName: string
): Promise<void> {
  const { data: item } = await supabase
    .from('character_items')
    .select('*')
    .eq('character_id', characterId)
    .eq('name', itemName)
    .maybeSingle();

  if (item) {
    if (item.quantity <= 1) {
      await supabase.from('character_items').delete().eq('id', item.id);
    } else {
      await supabase
        .from('character_items')
        .update({ quantity: item.quantity - 1 })
        .eq('id', item.id);
    }
  }
}

export async function removeItem(
  characterId: string,
  itemName: string
): Promise<void> {
  await supabase
    .from('character_items')
    .delete()
    .eq('character_id', characterId)
    .eq('name', itemName);
}

export async function saveStoryEvent(
  characterId: string,
  event: {
    summary: string;
    importance: number;
    type: string;
    chapter: number;
    details?: any;
  }
): Promise<void> {
  const { error } = await supabase
    .from('story_events')
    .insert({
      character_id: characterId,
      event_type: event.type,
      summary: event.summary,
      importance: event.importance,
      chapter: event.chapter,
      details: event.details
    });

  if (error) {
    console.error('Error saving story event:', error);
    throw error;
  }
}

export async function updateNPCRelationship(
  characterId: string,
  npcName: string,
  favorChange: number,
  grudgeChange: number,
  newStatus?: string,
  lastInteraction?: string
): Promise<void> {
  // First try to get existing relationship
  const { data: existing } = await supabase
    .from('npc_relationships')
    .select('*')
    .eq('character_id', characterId)
    .eq('npc_name', npcName)
    .maybeSingle();

  if (existing) {
    // Update existing
    const { error } = await supabase
      .from('npc_relationships')
      .update({
        favor: existing.favor + favorChange,
        grudge: existing.grudge + grudgeChange,
        status: newStatus || existing.status,
        last_interaction: lastInteraction || existing.last_interaction
      })
      .eq('id', existing.id);

    if (error) {
      console.error('Error updating NPC relationship:', error);
    }
  } else {
    // Create new
    const { error } = await supabase
      .from('npc_relationships')
      .insert({
        character_id: characterId,
        npc_name: npcName,
        favor: favorChange,
        grudge: grudgeChange,
        status: newStatus || 'neutral',
        last_interaction: lastInteraction
      });

    if (error) {
      console.error('Error creating NPC relationship:', error);
    }
  }
}

export async function saveChatMessage(
  characterId: string,
  role: string,
  content: string,
  messageType: string,
  speaker?: string
): Promise<void> {
  const { error } = await supabase
    .from('chat_messages')
    .insert({
      character_id: characterId,
      role,
      content,
      message_type: messageType,
      speaker
    });

  if (error) {
    console.error('Error saving chat message:', error);
  }
}

export async function addToGraveyard(
  character: Character,
  causeOfDeath: string,
  characterId?: string,
  userId?: string
): Promise<void> {
  const { error } = await supabase
    .from('graveyard')
    .insert({
      user_id: userId,
      original_character_id: characterId,
      name: character.name,
      origin: character.origin,
      final_realm: character.realm,
      cause_of_death: causeOfDeath,
      total_karma: character.karma,
      achievements: []
    });

  if (error) {
    console.error('Error adding to graveyard:', error);
  }
}

export function applyStatChanges(
  character: Character,
  response: AIResponse
): Character {
  const changes = response.stat_changes || {};
  const cultivationChange = response.cultivation_progress_change || 0;
  
  let newCultivationProgress = character.cultivationProgress + cultivationChange;
  let breakthroughReady = character.breakthroughReady;
  let newRealm = character.realm;
  let newMaxQi = character.maxQi;
  let newMaxHealth = character.maxHealth;
  
  // Check for breakthrough
  if (newCultivationProgress >= 100) {
    breakthroughReady = true;
    newCultivationProgress = 100;
  }
  
  // Handle realm advancement
  if (response.new_realm) {
    newRealm = response.new_realm;
    newCultivationProgress = 0;
    breakthroughReady = false;
    newMaxQi = REALM_MAX_QI[newRealm];
    newMaxHealth = REALM_MAX_HEALTH[newRealm];
  }

  // Calculate new strength (needed for stamina calculation)
  const newStrength = Math.max(1, character.stats.strength + (changes.strength || 0));
  
  // Calculate max stamina based on new strength
  const newMaxStamina = 100 + (newStrength * 5);
  
  // Apply stamina change, clamped between 0 and max
  const currentStamina = character.stamina || newMaxStamina;
  const newStamina = Math.max(0, Math.min(newMaxStamina, currentStamina + (changes.stamina || 0)));

  return {
    ...character,
    health: Math.max(0, Math.min(newMaxHealth, character.health + (changes.health || 0))),
    qi: Math.max(0, Math.min(newMaxQi, character.qi + (changes.qi || 0))),
    stamina: newStamina,
    maxStamina: newMaxStamina,
    maxQi: newMaxQi,
    maxHealth: newMaxHealth,
    karma: character.karma + (changes.karma || 0),
    cultivationProgress: newCultivationProgress,
    breakthroughReady,
    realm: newRealm,
    stats: {
      ...character.stats,
      strength: newStrength,
      agility: Math.max(1, character.stats.agility + (changes.agility || 0)),
      intelligence: Math.max(1, character.stats.intelligence + (changes.intelligence || 0)),
      charisma: Math.max(1, character.stats.charisma + (changes.charisma || 0)),
      luck: Math.max(1, character.stats.luck + (changes.luck || 0)),
      cultivation: character.stats.cultivation + (changes.cultivation || 0),
    }
  };
}

export function convertAIResponseToMessages(
  response: AIResponse,
  character: Character
): { messages: GameMessage[], choices: GameChoice[] } {
  const messages: GameMessage[] = [];

  // Add main narrative
  if (response.narrative) {
    messages.push({
      id: crypto.randomUUID(),
      type: 'narration',
      content: response.narrative,
      timestamp: new Date()
    });
  }

  // Add system message if present
  if (response.system_message) {
    messages.push({
      id: crypto.randomUUID(),
      type: 'system',
      content: response.system_message,
      timestamp: new Date()
    });
  }

  // Convert suggested actions to choices
  const choices: GameChoice[] = (response.suggested_actions || []).map((action, index) => ({
    id: crypto.randomUUID(),
    text: action.text,
    type: action.type as 'action' | 'combat' | 'flee' | 'dialogue',
    checkType: action.check_type as any
  }));

  return { messages, choices };
}

export async function loadCharacterWithDetails(characterId: string): Promise<{
  techniques: Technique[];
  inventory: InventoryItem[];
}> {
  const [techniquesResult, itemsResult] = await Promise.all([
    supabase.from('character_techniques').select('*').eq('character_id', characterId),
    supabase.from('character_items').select('*').eq('character_id', characterId)
  ]);

  const techniques: Technique[] = (techniquesResult.data || []).map((t: any) => ({
    id: t.id,
    name: t.name,
    type: t.type,
    element: t.element,
    rank: t.rank,
    mastery: t.mastery,
    description: t.description,
    effects: t.effects,
    qiCost: t.qi_cost,
    cooldown: t.cooldown
  }));

  const inventory: InventoryItem[] = (itemsResult.data || []).map((i: any) => ({
    id: i.id,
    name: i.name,
    type: i.type,
    rarity: i.rarity,
    quantity: i.quantity,
    description: i.description,
    effects: i.effects,
    equipped: i.equipped
  }));

  return { techniques, inventory };
}

// Tutorial Step Database Functions
export async function saveTutorialStep(
  characterId: string,
  stepNumber: number,
  narrative: string,
  choices: Array<{ id: string; text: string; outcome: string }>,
  statChanges?: { qi?: number; health?: number; karma?: number },
  isAwakening: boolean = false
): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('tutorial_steps')
      .insert({
        character_id: characterId,
        step_number: stepNumber,
        narrative,
        choices,
        stat_changes: statChanges || {},
        is_awakening: isAwakening,
      })
      .select('id')
      .single();

    if (error) {
      // If table doesn't exist yet, just log and return a fake ID
      if (error.message.includes('relation "tutorial_steps" does not exist')) {
        console.log('Tutorial steps table does not exist yet, skipping database save');
        return 'fake-id-' + Date.now();
      }
      console.error('Error saving tutorial step:', error);
      throw error;
    }

    return data.id;
  } catch (error) {
    console.error('Error in saveTutorialStep:', error);
    // Return fake ID to continue execution
    return 'fake-id-' + Date.now();
  }
}

export async function updateTutorialStepChoice(
  characterId: string,
  stepNumber: number,
  playerChoice: string
): Promise<void> {
  const { error } = await supabase
    .from('tutorial_steps')
    .update({ player_choice: playerChoice })
    .eq('character_id', characterId)
    .eq('step_number', stepNumber);

  if (error) {
    console.error('Error updating tutorial step choice:', error);
    throw error;
  }
}

export async function getTutorialSteps(characterId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('tutorial_steps')
      .select('*')
      .eq('character_id', characterId)
      .order('step_number', { ascending: true });

    if (error) {
      // If table doesn't exist yet, return empty array
      if (error.message.includes('relation "tutorial_steps" does not exist')) {
        console.log('Tutorial steps table does not exist yet, returning empty array');
        return [];
      }
      console.error('Error fetching tutorial steps:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getTutorialSteps:', error);
    return []; // Return empty array if any error occurs
  }
}

export async function updateCharacterTutorialProgress(
  characterId: string,
  currentStep: number,
  completed: boolean = false,
  goldenFingerUnlocked: boolean = false
): Promise<void> {
  try {
    const { error } = await supabase
      .from('characters')
      .update({
        current_tutorial_step: currentStep,
        tutorial_completed: completed,
        golden_finger_unlocked: goldenFingerUnlocked,
      })
      .eq('id', characterId);

    if (error) {
      // If columns don't exist yet, just log and continue
      if (error.message.includes('column') && error.message.includes('does not exist')) {
        console.log('Tutorial columns do not exist yet in characters table, skipping update');
        return;
      }
      console.error('Error updating character tutorial progress:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in updateCharacterTutorialProgress:', error);
    // Don't throw, just log and continue
  }
}
