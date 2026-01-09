import { useState, useRef, useEffect, useCallback } from 'react';
import * as React from 'react';
import { Character, GameMessage, GameChoice, Technique, InventoryItem, CultivationRealm, REALM_MAX_QI, REALM_MAX_HEALTH } from '@/types/game';
import { StoryMessage } from './StoryMessage';
import { ActionInput } from './ActionInput';
import { StatusPanel } from './StatusPanel';
import { CultivationPanel } from './CultivationPanel';
import { InventoryPanel } from './InventoryPanel';
import { TechniquesPanel } from './TechniquesPanel';
import { GoldenFingerPanel } from './GoldenFingerPanel';
import { MemoryPanel } from './MemoryPanel';
import { DaoMasterMessage } from './DaoMasterMessage';
import { createTutorialHandlers } from './GameScreen.tutorial';
import { Button } from '@/components/ui/button';
import { MobileButton } from './MobileButton';
import { SEO } from './SEO';
import { NarrativeSkeleton } from './LoadingSkeleton';
import { User, MapPin, Clock, LogOut, Sparkles, Save, Swords, Package, Brain } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { saveToLocalStorage, autoSaveCharacter, saveLastChoices, loadLastChoices } from '@/services/autoSaveService';
import { useLanguage } from '@/contexts/LanguageContext';
import { validateAction } from '@/lib/validation';
import { gameNotify, notify } from '@/lib/notifications';
import { trackGameEvent, trackGameTiming } from '@/lib/analytics';
import { perf } from '@/lib/performance';
import { useRegeneration } from '@/hooks/useRegeneration';
import { RegenerationService } from '@/services/regenerationService';
import { TutorialService } from '@/services/tutorialService';
import {
  generateNarrative,
  saveCharacterToDatabase,
  updateCharacterInDatabase,
  saveStoryEvent,
  updateNPCRelationship,
  saveChatMessage,
  addToGraveyard,
  convertAIResponseToMessages,
  applyStatChanges,
  addTechnique,
  updateTechniqueMastery,
  addItem,
  consumeItem,
  loadCharacterWithDetails,
  AIResponse
} from '@/services/gameService';

type GameScreenProps = {
  character: Character;
  onUpdateCharacter: (character: Character) => void;
  userId?: string;
  savedCharacterId?: string | null;
  onSignOut?: () => void;
};

const initialMessages: GameMessage[] = [
  {
    id: '1',
    type: 'system',
    content: 'Your journey begins...',
    timestamp: new Date(),
  },
];

export function GameScreen({ character, onUpdateCharacter, userId, savedCharacterId: initialSavedId, onSignOut }: GameScreenProps) {
  const [messages, setMessages] = useState<GameMessage[]>(initialMessages);
  const [choices, setChoices] = useState<GameChoice[]>([]);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isCultivationOpen, setIsCultivationOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isTechniquesOpen, setIsTechniquesOpen] = useState(false);
  const [isGoldenFingerOpen, setIsGoldenFingerOpen] = useState(false);
  const [isMemoryOpen, setIsMemoryOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentLocation, setCurrentLocation] = useState('Starting Location');
  const [timeElapsed, setTimeElapsed] = useState('Day 1');
  const [currentChapter, setCurrentChapter] = useState(1);
  const [characterId, setCharacterId] = useState<string | null>(initialSavedId || null);
  const [awakeningActionCount, setAwakeningActionCount] = useState(0);
  
  // Tutorial states
  const [tutorialActive, setTutorialActive] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [tutorialHighlight, setTutorialHighlight] = useState<string | undefined>();
  const [showDaoMaster, setShowDaoMaster] = useState(false);
  const [daoMasterMessage, setDaoMasterMessage] = useState('');
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();
  const hasInitialized = useRef(false);

  // Enable regeneration system
  useRegeneration(character, onUpdateCharacter, true);

  // Set up realtime subscription for character updates
  useEffect(() => {
    if (!characterId) return;

    const channel = supabase
      .channel(`character-${characterId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'characters',
          filter: `id=eq.${characterId}`
        },
        (payload) => {
          console.log('Character updated:', payload);
          // Could sync updates from other devices here
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [characterId]);

  // Save character and start the game
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const initializeGame = async () => {
      try {
        setIsLoading(true);
        
        let charId = characterId;
        
        // Only save new character if we don't have a saved one
        if (!charId && userId) {
          charId = await saveCharacterToDatabase(character, userId);
          setCharacterId(charId);
        }
        
        if (!charId) {
          throw new Error('Failed to create character');
        }
        
        // Load existing messages if continuing
        if (initialSavedId) {
          // First, check tutorial status from character prop (already loaded)
          console.log('📊 Character tutorial status:', {
            completed: character.tutorialCompleted,
            step: character.tutorialStep
          });
          
          // Check if tutorial is still in progress
          if (!character.tutorialCompleted && (character.tutorialStep || 0) < 15) {
            const currentStep = character.tutorialStep || 0;
            
            console.log(`🎓 Tutorial in progress (step ${currentStep}) after reload...`);
            
            // Load existing messages
            const { data: existingMessages } = await supabase
              .from('chat_messages')
              .select('*')
              .eq('character_id', charId)
              .order('created_at', { ascending: true });
            
            if (existingMessages && existingMessages.length > 0) {
              const loadedMessages: GameMessage[] = existingMessages.map(msg => ({
                id: msg.id,
                type: msg.message_type as any,
                content: msg.content,
                timestamp: new Date(msg.created_at),
                speaker: msg.speaker || undefined
              }));
              setMessages(loadedMessages);
              console.log('Loaded', loadedMessages.length, 'messages from database');
            }
            
            // Start or resume tutorial based on step
            if (tutorialHandlers) {
              if (currentStep === 0) {
                console.log('🎓 Starting tutorial from beginning...');
                await tutorialHandlers.startTutorial();
              } else {
                console.log(`🎓 Resuming tutorial at step ${currentStep}...`);
                await tutorialHandlers.resumeTutorial(currentStep);
              }
            }
            
            setIsLoading(false);
            return;
          }
          
          // Tutorial completed or not started - load normal game state
          const { data: existingMessages } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('character_id', charId)
            .order('created_at', { ascending: true });
          
          if (existingMessages && existingMessages.length > 0) {
            const loadedMessages: GameMessage[] = existingMessages.map(msg => ({
              id: msg.id,
              type: msg.message_type as any,
              content: msg.content,
              timestamp: new Date(msg.created_at),
              speaker: msg.speaker || undefined
            }));
            setMessages(loadedMessages);
            
            console.log('Loaded', loadedMessages.length, 'messages from database');
            
            // Try to load last choices
            const lastChoices = await loadLastChoices(charId);
            if (lastChoices && lastChoices.length > 0) {
              console.log('Loaded last choices:', lastChoices);
              setChoices(lastChoices);
            } else {
              // Show generic choices if no saved choices found
              console.log('No saved choices found, using default choices');
              setChoices([
                { id: '1', text: 'Continue exploring', type: 'action' },
                { id: '2', text: 'Rest and meditate', type: 'action' }
              ]);
            }
            
            setIsLoading(false);
            return;
          }
        }
        
        // Check if tutorial should start or resume
        if (!character.tutorialCompleted) {
          const currentStep = character.tutorialStep || 0;
          
          if (currentStep === 0) {
            // Start new tutorial
            console.log('🎓 Starting tutorial for new character...');
            if (tutorialHandlers) {
              await tutorialHandlers.startTutorial();
            }
          } else if (currentStep < 15) {
            // Resume tutorial
            console.log(`🎓 Resuming tutorial at step ${currentStep}...`);
            if (tutorialHandlers) {
              await tutorialHandlers.resumeTutorial(currentStep);
            }
          } else {
            // Tutorial marked incomplete but at step 15 - complete it
            console.log('🎓 Completing unfinished tutorial...');
            if (tutorialHandlers) {
              await tutorialHandlers.completeTutorial();
            }
          }
          
          setIsLoading(false);
          return;
        }
        
        // Tutorial already completed - generate AI awakening scenario
        console.log('Generating awakening scenario...');
        const response = await generateNarrative(
          character,
          `OPENING SCENE - This is the VERY FIRST moment of ${character.name}'s journey. You are the director/narrator.

CHARACTER CONTEXT:
- Name: ${character.name}
- Gender: ${character.visualTraits?.gender || 'Unknown'}
- Origin Story: ${character.origin}
- Golden Finger: ${character.goldenFinger.name} - ${character.goldenFinger.effect}

CRITICAL INSTRUCTIONS FOR OPENING SCENE:
1. **START SLOWLY AND IMMERSIVELY**: Begin with the character in their current situation based on their origin
   - If they're a beggar, start with them cold and hungry on the streets
   - If they're a fallen noble, start with them in the ruins of their home
   - If they're a slave, start with them working in harsh conditions
   - Set the scene with sensory details: weather, sounds, smells, physical sensations

2. **BUILD THE MOMENT**: Show their current struggle or situation
   - What are they doing right now?
   - What are they feeling physically and emotionally?
   - What immediate problem or challenge are they facing?
   - Make the player FEEL their desperation or situation

3. **NATURAL AWAKENING**: The Golden Finger awakens naturally from the situation
   - Don't just say "it awakened" - show the PROCESS
   - Describe the physical sensations step by step
   - Show their confusion, fear, then realization
   - Make it feel earned and dramatic

4. **END WITH A CHOICE**: Leave them in a moment where they must decide what to do next
   - Don't resolve everything immediately
   - Create tension and uncertainty
   - Give them agency to respond to this new power

EXAMPLE STRUCTURE:
"[Setting the scene with sensory details - 3-4 sentences]
[Character's current struggle/situation - 2-3 sentences]
[Something triggers the awakening - 1-2 sentences]
[Physical sensations of awakening - 3-4 sentences]
[Character's realization and immediate reaction - 2-3 sentences]
[Current situation and what they can do now - 1-2 sentences]"

EXAMPLE OF GOOD OPENING:
"Malam itu, hujan deras mengguyur Desa Qingfeng tanpa henti. ${character.name} menggigil di bawah atap kuil tua yang hampir roboh, tubuhnya basah kuyup dan perutnya keroncongan. Sudah tiga hari ${character.visualTraits?.gender === 'Male' ? 'dia' : 'dia'} tidak makan, dan tubuhnya hampir tidak memiliki tenaga lagi. Di sudut kuil, ${character.visualTraits?.gender === 'Male' ? 'dia' : 'dia'} melihat sebuah gulungan kulit tua yang tergeletak di antara puing-puing. Dengan tangan gemetar, ${character.visualTraits?.gender === 'Male' ? 'dia' : 'dia'} meraihnya. Saat jari-jarinya menyentuh gulungan itu, sesuatu yang aneh terjadi. Panas yang membakar menjalar dari telapak tangannya, naik melalui lengan, dan meledak di dadanya. ${character.name} terjatuh, tubuhnya kejang, mulutnya terbuka dalam teriakan bisu. Dalam pikirannya, ribuan gambar berkilauan—teknik-teknik kuno, rahasia kultivasi, kekuatan yang tak terbayangkan. Ketika rasa sakit mereda, ${character.visualTraits?.gender === 'Male' ? 'dia' : 'dia'} terbaring terengah-engah, merasakan sesuatu yang berbeda dalam tubuhnya. Sesuatu yang kuat. Sesuatu yang berbahaya. Hujan masih turun deras di luar, tapi sekarang ${character.name} tidak lagi merasa kedinginan. ${character.visualTraits?.gender === 'Male' ? 'Dia' : 'Dia'} menatap tangannya yang gemetar, merasakan energi aneh mengalir di bawah kulitnya. Apa yang baru saja terjadi? Dan apa yang harus ${character.visualTraits?.gender === 'Male' ? 'dia' : 'dia'} lakukan sekarang?"

IMPORTANT - AWAKENING PROGRESSION:
- This is just the BEGINNING of the awakening process
- DO NOT set "golden_finger_awakened": true yet
- The awakening should take 2-4 player actions to complete
- Guide the player through the awakening with suggested_actions
- Only set "golden_finger_awakened": true when:
  * They have fully experienced and understood their power
  * They have successfully used it at least once
  * The awakening process is complete, not just starting

Remember: This is the FIRST scene. Make it immersive, dramatic, and set the tone for the entire journey. The player should feel like they're LIVING this moment, not just reading about it.`,
          charId,
          language // Pass language
        );

        await processAIResponse(response, charId);
        
      } catch (error) {
        console.error('Failed to initialize game:', error);
        
        // Only show fallback if we don't have any messages yet
        if (messages.length <= 1) {
          notify.error('Connection Error', 'Failed to connect to the world. Using fallback story.');
          generateFallbackOpening();
        } else {
          // If we already have messages, just log the error
          console.warn('Error during initialization, but messages already loaded');
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeGame();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const generateFallbackOpening = () => {
    const openingMessages: GameMessage[] = [];
    
    if (character.origin === 'Broken Meridians') {
      openingMessages.push({
        id: crypto.randomUUID(),
        type: 'narration',
        content: `The morning sun casts long shadows across the Xiao family courtyard. You, ${character.name}, stand before the ancestral hall, where your meridian examination results were just announced. "Trash talent," they whispered. Your fiancée's family representative has arrived.`,
        timestamp: new Date(),
      });
      
      openingMessages.push({
        id: crypto.randomUUID(),
        type: 'dialogue',
        content: '"Young Master Xiao," the messenger sneers, barely concealing his contempt. "The Liu family has decided to... reconsider the engagement. Miss Liu deserves someone with actual potential."',
        timestamp: new Date(),
        speaker: 'Liu Family Messenger',
      });
    } else {
      openingMessages.push({
        id: crypto.randomUUID(),
        type: 'narration',
        content: `You take a deep breath. The weight of your ${character.goldenFinger.name} pulses within you, a secret power that none can see. Around you, the world of Jianghu awaits—full of danger, opportunity, and the promise of immortality.`,
        timestamp: new Date(),
      });
    }

    setMessages(prev => [...prev, ...openingMessages]);
    setChoices([
      { id: '1', text: 'Accept the humiliation silently', type: 'action', checkType: 'intelligence' },
      { id: '2', text: 'Challenge the messenger to a duel', type: 'combat', checkType: 'strength' }
    ]);
  };

  const processAIResponse = async (response: AIResponse, charId: string) => {
    const { messages: newMessages, choices: newChoices } = convertAIResponseToMessages(response, character);
    
    setMessages(prev => [...prev, ...newMessages]);
    setChoices(newChoices);
    
    // Save choices immediately to localStorage and database
    if (newChoices && newChoices.length > 0) {
      await saveLastChoices(charId, newChoices);
    }

    // Save messages to database
    for (const msg of newMessages) {
      await saveChatMessage(charId, 'assistant', msg.content, msg.type, msg.speaker);
    }

    // Update location and time if changed
    if (response.new_location) {
      setCurrentLocation(response.new_location);
    }
    if (response.time_passed) {
      setTimeElapsed(response.time_passed);
    }

    // Apply stat changes and get updated character
    let updatedCharacter = applyStatChanges(character, response);
    
    // Add new techniques
    if (response.new_techniques?.length) {
      for (const tech of response.new_techniques) {
        await addTechnique(charId, tech);
        gameNotify.techniqueLearn(tech.name);
        trackGameEvent.techniqueLearn(tech.name);
      }
      // Reload techniques
      const { techniques } = await loadCharacterWithDetails(charId);
      updatedCharacter.techniques = techniques;
    }

    // Update technique mastery
    if (response.technique_mastery_changes?.length) {
      for (const change of response.technique_mastery_changes) {
        await updateTechniqueMastery(charId, change.name, change.mastery_change);
      }
      // Reload techniques to get updated mastery
      const { techniques } = await loadCharacterWithDetails(charId);
      updatedCharacter.techniques = techniques;
    }

    // Add new items
    if (response.new_items?.length) {
      for (const item of response.new_items) {
        await addItem(charId, item);
        gameNotify.itemObtained(item.name, item.rarity);
        trackGameEvent.itemObtained(item.name, item.rarity);
      }
      const { inventory } = await loadCharacterWithDetails(charId);
      updatedCharacter.inventory = inventory;
    }

    // Consume items
    if (response.items_consumed?.length) {
      for (const itemName of response.items_consumed) {
        await consumeItem(charId, itemName);
      }
      // Reload inventory
      const { inventory } = await loadCharacterWithDetails(charId);
      updatedCharacter.inventory = inventory;
    }

    // Update NPC relationships
    if (response.npc_updates) {
      for (const npc of response.npc_updates) {
        await updateNPCRelationship(charId, npc.name, npc.favor_change, npc.grudge_change, npc.new_status);
      }
    }

    // Add new effects
    if (response.effects_to_add?.length) {
      for (const effectData of response.effects_to_add) {
        const effect = {
          id: crypto.randomUUID(),
          name: effectData.name,
          type: effectData.type,
          description: effectData.description,
          duration: effectData.duration,
          startTime: Date.now(),
          statModifiers: effectData.statModifiers,
          regenModifiers: effectData.regenModifiers,
          damageOverTime: effectData.damageOverTime,
          maxStatModifiers: effectData.maxStatModifiers,
          isPermanent: effectData.isPermanent || effectData.duration === -1,
          stackable: effectData.stackable || false,
          stacks: 1,
        };
        
        updatedCharacter = RegenerationService.addEffect(updatedCharacter, effect);
        
        // Notify player
        const effectIcon = effectData.type === 'buff' || effectData.type === 'blessing' ? '✨' : 
                          effectData.type === 'debuff' ? '⚠️' :
                          effectData.type === 'poison' ? '☠️' :
                          effectData.type === 'curse' ? '👿' :
                          effectData.type === 'qi_deviation' ? '💥' : '🔮';
        
        notify.info(`${effectIcon} ${effectData.name}`, effectData.description);
      }
    }

    // Remove effects
    if (response.effects_to_remove?.length) {
      for (const effectName of response.effects_to_remove) {
        updatedCharacter = RegenerationService.removeEffect(updatedCharacter, effectName);
        notify.success('Effect Removed', `${effectName} has been removed`);
      }
    }

    // IMMEDIATELY update character state in UI
    onUpdateCharacter(updatedCharacter);
    
    // IMMEDIATELY save character to database with all changes
    console.log('💾 Saving character updates to database...');
    console.log('Stats:', updatedCharacter.stats);
    console.log('Health:', updatedCharacter.health, '/', updatedCharacter.maxHealth);
    console.log('Qi:', updatedCharacter.qi, '/', updatedCharacter.maxQi);
    console.log('Cultivation:', updatedCharacter.cultivationProgress, '%');
    
    // Check if Golden Finger awakened
    if (response.golden_finger_awakened && !character.goldenFingerUnlocked) {
      console.log('🌟 GOLDEN FINGER AWAKENED!');
      updatedCharacter.goldenFingerUnlocked = true;
      
      // Show special notification
      gameNotify.achievementUnlocked(`${character.goldenFinger.name} Awakened!`);
      
      // Add system message
      const awakeningMessage: GameMessage = {
        id: crypto.randomUUID(),
        type: 'system',
        content: `✨ ${character.goldenFinger.name} has fully awakened! You can now use custom actions to express yourself freely in the Jianghu.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, awakeningMessage]);
      await saveChatMessage(charId, 'system', awakeningMessage.content, 'system');
    }
    
    // FALLBACK: Auto-awaken after 6 actions if AI hasn't triggered it yet
    if (!character.goldenFingerUnlocked && !response.golden_finger_awakened) {
      const newCount = awakeningActionCount + 1;
      setAwakeningActionCount(newCount);
      console.log(`🔄 Awakening progress: ${newCount}/6 actions`);
      
      if (newCount >= 6) {
        console.log('🌟 AUTO-AWAKENING: 6 actions completed, forcing Golden Finger awakening');
        updatedCharacter.goldenFingerUnlocked = true;
        
        // Show special notification
        gameNotify.achievementUnlocked(`${character.goldenFinger.name} Awakened!`);
        
        // Add system message
        const awakeningMessage: GameMessage = {
          id: crypto.randomUUID(),
          type: 'system',
          content: `✨ ${character.goldenFinger.name} has fully awakened! You can now use custom actions to express yourself freely in the Jianghu.`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, awakeningMessage]);
        await saveChatMessage(charId, 'system', awakeningMessage.content, 'system');
        
        // Reset counter
        setAwakeningActionCount(0);
      }
    }
    
    await updateCharacterInDatabase(charId, {
      stats: updatedCharacter.stats,
      health: Math.round(updatedCharacter.health),
      max_health: updatedCharacter.maxHealth,
      qi: Math.round(updatedCharacter.qi),
      max_qi: updatedCharacter.maxQi,
      stamina: Math.round(updatedCharacter.stamina || 100),
      max_stamina: updatedCharacter.maxStamina || 100,
      karma: updatedCharacter.karma,
      realm: updatedCharacter.realm,
      cultivation_progress: updatedCharacter.cultivationProgress,
      breakthrough_ready: updatedCharacter.breakthroughReady,
      current_location: response.new_location || currentLocation,
      time_elapsed: response.time_passed || timeElapsed,
      golden_finger_unlocked: updatedCharacter.goldenFingerUnlocked,
      active_effects: updatedCharacter.activeEffects || [],
      last_regeneration: updatedCharacter.lastRegeneration || Date.now()
    });
    
    console.log('✅ Character updates saved to database');

    // AUTO-SAVE to localStorage after database save
    setIsSaving(true);
    try {
      saveToLocalStorage({
        characterId: charId,
        character: updatedCharacter,
        currentPhase: 'playing',
        currentLocation: response.new_location || currentLocation,
        timeElapsed: response.time_passed || timeElapsed,
        currentChapter,
        lastChoices: newChoices // Save choices in game state
      });
      
      console.log('✅ Game state auto-saved to localStorage');
    } catch (error) {
      console.error('❌ Auto-save to localStorage failed:', error);
    } finally {
      setIsSaving(false);
    }

    // Save important events to memory using new Memory System
    if (response.event_to_remember) {
      try {
        const { MemoryService } = await import('@/services/memoryService');
        const { extractKeywords, getImportanceScore } = await import('@/types/memory');
        
        // Store in new memory system
        await MemoryService.storeMemory({
          characterId: charId,
          timestamp: Date.now(),
          chapter: currentChapter,
          eventType: response.event_to_remember.event_type,
          summary: response.event_to_remember.summary,
          fullNarrative: response.narrative,
          importance: response.event_to_remember.importance,
          importanceScore: getImportanceScore(response.event_to_remember.importance),
          emotion: response.event_to_remember.emotion,
          location: response.new_location || currentLocation,
          involvedNPCs: response.event_to_remember.involved_npcs || [],
          tags: response.event_to_remember.tags || [],
          keywords: extractKeywords(response.narrative),
          karmaChange: response.stat_changes?.karma,
          statChanges: response.stat_changes,
          relationshipChanges: response.npc_updates?.map(npc => ({
            npcId: npc.name,
            favorChange: npc.favor_change,
            grudgeChange: npc.grudge_change
          }))
        });
        
        console.log(`📝 Memory stored: ${response.event_to_remember.summary}`);
      } catch (error) {
        console.error('Failed to store memory:', error);
      }
      
      // Also save to old story_events table for backward compatibility
      // Convert importance string to number
      const importanceMap: Record<string, number> = {
        'trivial': 1,
        'minor': 3,
        'moderate': 5,
        'important': 7,
        'critical': 10
      };
      const importanceScore = importanceMap[response.event_to_remember.importance.toLowerCase()] || 5;
      
      await saveStoryEvent(charId, {
        summary: response.event_to_remember.summary,
        importance: importanceScore,
        type: response.event_to_remember.event_type,
        chapter: currentChapter
      });
    }
    
    // Handle memory callbacks (when past events trigger consequences)
    if (response.memory_callback) {
      console.log(`🔄 Memory callback triggered: ${response.memory_callback.callback_type}`);
      console.log(`   ${response.memory_callback.description}`);
      
      // Show notification for dramatic callbacks
      if (response.memory_callback.callback_type === 'revenge') {
        notify.warning('Past Returns', 'Your past actions have consequences...');
      } else if (response.memory_callback.callback_type === 'gratitude') {
        notify.success('Karma Returns', 'Your good deeds are remembered!');
      }
    }

    // Handle death
    if (response.is_death && userId) {
      await addToGraveyard(character, response.death_cause || 'Unknown', charId, userId);
      gameNotify.death(response.death_cause || 'Your journey ends here...');
      trackGameEvent.errorOccurred('Character Death', response.death_cause || 'Unknown');
    }
    
    // Notify cultivation breakthrough
    if (response.new_realm) {
      gameNotify.cultivationBreakthrough(response.new_realm);
      trackGameEvent.cultivationBreakthrough(response.new_realm);
    }
  };

  // Initialize tutorial handlers (after processAIResponse is defined)
  const tutorialHandlers = React.useMemo(() => {
    if (!characterId) return null;
    
    return createTutorialHandlers(
      character,
      characterId,
      language,
      {
        setTutorialActive,
        setTutorialStep,
        setShowDaoMaster,
        setDaoMasterMessage,
        setMessages,
        setChoices,
        setTutorialHighlight,
        setIsStatusOpen,
        setIsInventoryOpen,
        setIsTechniquesOpen,
        setIsCultivationOpen,
        setIsGoldenFingerOpen,
        setIsMemoryOpen,
        onUpdateCharacter
      },
      processAIResponse
    );
  }, [characterId, character, language, processAIResponse]);

  const handleUseItem = async (item: InventoryItem) => {
    if (!characterId) return;

    try {
      // Show using item message
      const useMessage: GameMessage = {
        id: crypto.randomUUID(),
        type: 'action',
        content: `You use ${item.name}...`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, useMessage]);

      // Apply item effects
      let updatedCharacter = { ...character };
      
      if (item.effects) {
        // Apply stat changes from item effects
        if (item.effects.health) {
          updatedCharacter.health = Math.min(
            updatedCharacter.health + (item.effects.health as number),
            updatedCharacter.maxHealth
          );
        }
        if (item.effects.qi) {
          updatedCharacter.qi = Math.min(
            updatedCharacter.qi + (item.effects.qi as number),
            updatedCharacter.maxQi
          );
        }
        if (item.effects.stamina) {
          updatedCharacter.stamina = Math.min(
            updatedCharacter.stamina + (item.effects.stamina as number),
            updatedCharacter.maxStamina
          );
        }

        // Add buff effects if specified
        if (item.effects.buff) {
          const buffEffect = item.effects.buff as any;
          if (!updatedCharacter.activeEffects) {
            updatedCharacter.activeEffects = [];
          }
          updatedCharacter.activeEffects.push({
            id: crypto.randomUUID(),
            name: buffEffect.name || `${item.name} Effect`,
            type: 'buff',
            description: buffEffect.description || `Effect from ${item.name}`,
            duration: buffEffect.duration || 300,
            startTime: Date.now(),
            statModifiers: buffEffect.statModifiers,
            regenModifiers: buffEffect.regenModifiers,
          });
        }
      }
      
      // AUTO-REMOVE HUNGER EFFECTS when consuming food items
      if ((item.type === 'pill' || item.type === 'misc') && (item.effects?.health || item.effects?.stamina)) {
        const hungerEffects = ['Kelaparan', 'Kelaparan Parah', 'Kelaparan Akut', 'Starving', 'Hunger'];
        hungerEffects.forEach(effectName => {
          updatedCharacter = RegenerationService.removeEffect(updatedCharacter, effectName);
        });
        console.log('🍖 Removed hunger effects after consuming food');
      }

      // Consume the item (reduce quantity)
      updatedCharacter.inventory = updatedCharacter.inventory.map(invItem => {
        if (invItem.id === item.id) {
          return {
            ...invItem,
            quantity: invItem.quantity - 1
          };
        }
        return invItem;
      }).filter(invItem => invItem.quantity > 0); // Remove items with 0 quantity

      // Update character state
      onUpdateCharacter(updatedCharacter);

      // Save to database
      await updateCharacterInDatabase(characterId, {
        health: Math.round(updatedCharacter.health),
        qi: Math.round(updatedCharacter.qi),
        stamina: Math.round(updatedCharacter.stamina),
        inventory: updatedCharacter.inventory,
        active_effects: updatedCharacter.activeEffects || []
      });

      // Show result message
      const effectsText = Object.entries(item.effects || {})
        .map(([key, value]) => `${key}: +${value}`)
        .join(', ');
      
      const resultMessage: GameMessage = {
        id: crypto.randomUUID(),
        type: 'system',
        content: `✨ ${item.name} consumed! ${effectsText}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, resultMessage]);

      notify.success('Item Used', `${item.name} has been consumed`);
      trackGameEvent.itemUsed(item.name);

    } catch (error) {
      console.error('Error using item:', error);
      notify.error('Failed to use item', 'Please try again');
    }
  };

  const handleAction = useCallback(async (action: string) => {
    if (isLoading || !characterId) return;
    
    // If tutorial is active, use tutorial flow
    if (tutorialActive && tutorialHandlers) {
      setIsLoading(true);
      try {
        await tutorialHandlers.handleTutorialAction();
      } catch (error) {
        console.error('Tutorial action failed:', error);
      } finally {
        setIsLoading(false);
      }
      return;
    }
    
    // Validate action input
    const validation = validateAction(action);
    if (!validation.success) {
      notify.error('Invalid Action', validation.error);
      return;
    }
    
    const sanitizedAction = validation.data!;
    
    setIsLoading(true);
    
    // Track action
    trackGameEvent.actionTaken(sanitizedAction);
    
    // Add user action to messages
    const userAction: GameMessage = {
      id: crypto.randomUUID(),
      type: 'action',
      content: sanitizedAction,
      timestamp: new Date(),
      speaker: character.name,
    };
    setMessages(prev => [...prev, userAction]);
    setChoices([]);

    // Save user message
    await saveChatMessage(characterId, 'user', sanitizedAction, 'action', character.name);

    try {
      // Measure AI response time
      perf.start('AI Response');
      const response = await generateNarrative(
        character, 
        sanitizedAction, 
        characterId, 
        language,
        {
          currentLocation,
          currentChapter
        }
      );
      const responseTime = perf.end('AI Response');
      
      // Track response time
      trackGameTiming.aiResponseTime(responseTime);
      
      await processAIResponse(response, characterId);
    } catch (error) {
      console.error('Error generating narrative:', error);
      perf.end('AI Response', false);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Track error
      trackGameEvent.errorOccurred('AI Generation', errorMessage);
      
      if (errorMessage.includes('Rate limit')) {
        notify.error('Too Many Requests', 'Please wait a moment before taking another action.');
      } else {
        gameNotify.aiError();
      }

      // Provide fallback choices
      setChoices([
        { id: '1', text: 'Try again', type: 'action' },
        { id: '2', text: 'Do something else', type: 'action' },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [character, characterId, isLoading, currentChapter, currentLocation, timeElapsed, language]);

  const handleMeditationComplete = async (qiGained: number, cultivationGained: number) => {
    if (!characterId) return;

    const newQi = Math.min(character.maxQi, character.qi + qiGained);
    const newCultivation = Math.min(100, character.cultivationProgress + cultivationGained);
    const breakthroughReady = newCultivation >= 100;

    const updatedCharacter: Character = {
      ...character,
      qi: newQi,
      cultivationProgress: newCultivation,
      breakthroughReady
    };

    onUpdateCharacter(updatedCharacter);
    
    await updateCharacterInDatabase(characterId, {
      qi: newQi,
      cultivation_progress: newCultivation,
      breakthrough_ready: breakthroughReady
    });

    // Add message about meditation
    const meditationMessage: GameMessage = {
      id: crypto.randomUUID(),
      type: 'system',
      content: `Meditation complete! Qi +${qiGained}, Cultivation Progress +${cultivationGained}%${breakthroughReady ? ' ⚡ You are ready for breakthrough!' : ''}`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, meditationMessage]);
    await saveChatMessage(characterId, 'system', meditationMessage.content, 'system');

    gameNotify.cultivationBreakthrough(`Qi +${qiGained}, Cultivation +${cultivationGained}%`);
  };

  const handleBreakthroughAttempt = async (success: boolean, newRealm?: CultivationRealm, damage?: number) => {
    if (!characterId) return;

    if (success && newRealm) {
      const newMaxQi = REALM_MAX_QI[newRealm];
      const newMaxHealth = REALM_MAX_HEALTH[newRealm];
      
      const updatedCharacter: Character = {
        ...character,
        realm: newRealm,
        cultivationProgress: 0,
        breakthroughReady: false,
        maxQi: newMaxQi,
        maxHealth: newMaxHealth,
        qi: newMaxQi, // Full qi after breakthrough
        health: newMaxHealth // Full health after breakthrough
      };

      onUpdateCharacter(updatedCharacter);
      
      await updateCharacterInDatabase(characterId, {
        realm: newRealm,
        cultivation_progress: 0,
        breakthrough_ready: false,
        max_qi: newMaxQi,
        max_health: newMaxHealth,
        qi: newMaxQi,
        health: newMaxHealth
      });

      // Save as important event
      await saveStoryEvent(characterId, {
        summary: `Breakthrough to ${newRealm} realm achieved!`,
        importance: 5,
        type: 'cultivation',
        chapter: currentChapter
      });

      const successMessage: GameMessage = {
        id: crypto.randomUUID(),
        type: 'system',
        content: `🌟 BREAKTHROUGH SUCCESS! 🌟\nYou have ascended to the ${newRealm} realm!\nMax Qi: ${newMaxQi}, Max Health: ${newMaxHealth}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, successMessage]);
      await saveChatMessage(characterId, 'system', successMessage.content, 'system');

      gameNotify.cultivationBreakthrough(newRealm);
    } else {
      // Failure - Qi Deviation
      const healthLoss = damage || Math.floor(character.maxHealth * 0.3);
      const cultivationLoss = Math.floor(character.cultivationProgress * 0.5);
      
      const updatedCharacter: Character = {
        ...character,
        health: Math.max(1, character.health - healthLoss),
        cultivationProgress: Math.max(0, character.cultivationProgress - cultivationLoss),
        breakthroughReady: false
      };

      onUpdateCharacter(updatedCharacter);
      
      await updateCharacterInDatabase(characterId, {
        health: updatedCharacter.health,
        cultivation_progress: updatedCharacter.cultivationProgress,
        breakthrough_ready: false
      });

      const failMessage: GameMessage = {
        id: crypto.randomUUID(),
        type: 'system',
        content: `⚠️ QI DEVIATION! ⚠️\nBreakthrough failed! You suffer internal injuries.\nHealth -${healthLoss}, Cultivation -${cultivationLoss}%`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, failMessage]);
      await saveChatMessage(characterId, 'system', failMessage.content, 'system');

      notify.error('Breakthrough Failed', 'You suffered Qi Deviation!');
    }
  };

  return (
    <>
      <SEO 
        title="Game"
        description={`${character.name}'s cultivation journey - ${character.realm} realm cultivator`}
      />
      
      <div className="min-h-screen flex flex-col relative h-screen overflow-hidden">
        {/* Background Image */}
        <div 
          className="fixed inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: 'url(/assets/backgrounds/wuxia-serene.jpg)',
          }}
        />
        
        {/* Dark Overlay */}
        <div className="fixed inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/90" />
        
        {/* Header */}
        <header className="sticky top-0 z-40 bg-black/60 backdrop-blur-md border-b border-white/10">
          <div className="flex items-center justify-between p-2 sm:p-3 md:p-4 max-w-4xl mx-auto">
            {/* Memory Button - Left Side */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsMemoryOpen(true)}
              className={cn(
                "h-9 w-9 sm:h-10 sm:w-10 md:h-11 md:w-11 text-white/70 hover:text-purple-400 hover:bg-white/10 touch-manipulation",
                tutorialHighlight === 'memory' && 'animate-pulse ring-4 ring-yellow-400 ring-offset-2 ring-offset-black'
              )}
            >
              <Brain className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
            </Button>
          
            {/* Center - Location & Time Info */}
            <div className="text-center flex-1 px-1 sm:px-2 min-w-0">
              <div className="flex items-center gap-1 sm:gap-2 justify-center flex-wrap">
                <p className="text-xs sm:text-sm text-white/60 flex items-center gap-1">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" /> 
                  <span className="truncate max-w-[100px] sm:max-w-[150px] md:max-w-none">{currentLocation}</span>
                </p>
                {isSaving && (
                  <div className="flex items-center gap-1 text-xs text-white/50">
                    <Save className="w-3 h-3 animate-pulse" />
                    <span className="hidden md:inline">Saving...</span>
                  </div>
                )}
              </div>
              <p className="text-xs sm:text-sm text-gold flex items-center gap-1 justify-center mt-0.5">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" /> 
                <span className="truncate">{timeElapsed}</span>
              </p>
            </div>
          
            {/* Logout Button - Right Side */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onSignOut}
              className="h-9 w-9 sm:h-10 sm:w-10 md:h-11 md:w-11 text-white/70 hover:text-red-400 hover:bg-white/10 touch-manipulation"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
            </Button>
          </div>
        </header>

      {/* Story Stream - Scrollable with padding for fixed elements */}
      <div 
        ref={scrollRef}
        className="relative z-10 flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 md:space-y-6 scrollbar-hide max-w-4xl mx-auto w-full"
        style={{ 
          paddingBottom: '280px', // Space for action input + bottom nav (increased)
          height: 'calc(100vh - 64px)' // Full height minus header
        }}
      >
        {/* Dao Master Message - Show above other messages during tutorial */}
        {showDaoMaster && daoMasterMessage && (
          <DaoMasterMessage 
            message={daoMasterMessage}
            stepNumber={tutorialStep}
            totalSteps={15}
          />
        )}
        
        {messages.map((message, index) => (
          <StoryMessage 
            key={message.id} 
            message={message}
            isLatest={index === messages.length - 1}
          />
        ))}
        
        {isLoading && <NarrativeSkeleton />}
      </div>

      {/* Gradient Overlay - Fades story messages before action area */}
      <div className="fixed bottom-[72px] left-0 right-0 h-12 z-15 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none" />

      {/* Action Input - Extended background to cover gap completely */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-black backdrop-blur-md px-3 pt-2 pb-[72px]">
        <div className="max-w-4xl mx-auto">
          <ActionInput
            choices={choices}
            onAction={handleAction}
            isLoading={isLoading}
            allowCustomAction={character.goldenFingerUnlocked ?? false}
          />
        </div>
        {/* Border separator */}
        <div className="absolute top-0 left-0 right-0 h-px bg-white/10" />
      </div>

      {/* Bottom Navigation Menu - On top of action background */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-black backdrop-blur-md safe-area-bottom">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-5 gap-0">
            {/* Status Button */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsStatusOpen(true)}
              className={cn(
                "flex flex-col items-center gap-1 h-auto py-3 px-2 text-white/70 hover:text-gold hover:bg-white/10 touch-manipulation rounded-none border-r border-white/5",
                tutorialHighlight === 'status' && 'animate-pulse ring-2 ring-inset ring-yellow-400 bg-yellow-400/10'
              )}
            >
              <User className="w-5 h-5" />
              <span className="text-[10px] font-medium">Status</span>
            </Button>

            {/* Cultivation Button */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsCultivationOpen(true)}
              className={cn(
                "flex flex-col items-center gap-1 h-auto py-3 px-2 hover:bg-white/10 touch-manipulation rounded-none border-r border-white/5",
                character.breakthroughReady ? 'text-gold animate-pulse' : 'text-white/70 hover:text-gold',
                tutorialHighlight === 'cultivation' && 'ring-2 ring-inset ring-yellow-400 bg-yellow-400/10'
              )}
            >
              <Sparkles className="w-5 h-5" />
              <span className="text-[10px] font-medium">Cultivation</span>
            </Button>

            {/* Techniques Button */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsTechniquesOpen(true)}
              className={cn(
                "flex flex-col items-center gap-1 h-auto py-3 px-2 text-white/70 hover:text-purple-400 hover:bg-white/10 touch-manipulation relative rounded-none border-r border-white/5",
                tutorialHighlight === 'techniques' && 'animate-pulse ring-2 ring-inset ring-yellow-400 bg-yellow-400/10'
              )}
            >
              <div className="relative">
                <Swords className="w-5 h-5" />
                {character.techniques && character.techniques.length > 0 && (
                  <span className="absolute -top-2 -right-2 w-4 h-4 bg-purple-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                    {character.techniques.length}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">Techniques</span>
            </Button>

            {/* Inventory Button */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsInventoryOpen(true)}
              className={cn(
                "flex flex-col items-center gap-1 h-auto py-3 px-2 text-white/70 hover:text-blue-400 hover:bg-white/10 touch-manipulation relative rounded-none border-r border-white/5",
                tutorialHighlight === 'inventory' && 'animate-pulse ring-2 ring-inset ring-yellow-400 bg-yellow-400/10'
              )}
            >
              <div className="relative">
                <Package className="w-5 h-5" />
                {character.inventory && character.inventory.length > 0 && (
                  <span className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                    {character.inventory.length}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">Inventory</span>
            </Button>

            {/* Golden Finger Button */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsGoldenFingerOpen(true)}
              className={cn(
                "flex flex-col items-center gap-1 h-auto py-3 px-2 hover:bg-white/10 touch-manipulation rounded-none",
                character.goldenFingerUnlocked ? 'text-gold hover:text-gold' : 'text-white/40 hover:text-white/60',
                tutorialHighlight === 'goldenFinger' && 'ring-2 ring-inset ring-yellow-400 bg-yellow-400/10'
              )}
            >
              <Sparkles className="w-5 h-5 fill-current" />
              <span className="text-[10px] font-medium">Power</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Status Panel Overlay */}
      {isStatusOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
          onClick={() => setIsStatusOpen(false)}
        />
      )}
      
      {/* Status Panel */}
      <StatusPanel
        character={character}
        isOpen={isStatusOpen}
        onClose={() => setIsStatusOpen(false)}
        onPanelClose={() => tutorialHandlers?.handleButtonInteraction()}
      />

      {/* Cultivation Panel Overlay */}
      {isCultivationOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
          onClick={() => setIsCultivationOpen(false)}
        />
      )}

      {/* Cultivation Panel */}
      <CultivationPanel
        character={character}
        isOpen={isCultivationOpen}
        onClose={() => setIsCultivationOpen(false)}
        onMeditationComplete={handleMeditationComplete}
        onBreakthroughAttempt={handleBreakthroughAttempt}
        onPanelClose={() => tutorialHandlers?.handleButtonInteraction()}
      />

      {/* Inventory Panel Overlay */}
      {isInventoryOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
          onClick={() => setIsInventoryOpen(false)}
        />
      )}

      {/* Inventory Panel */}
      <InventoryPanel
        character={character}
        isOpen={isInventoryOpen}
        onClose={() => setIsInventoryOpen(false)}
        onUseItem={handleUseItem}
        onPanelClose={() => tutorialHandlers?.handleButtonInteraction()}
      />

      {/* Techniques Panel Overlay */}
      {isTechniquesOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
          onClick={() => setIsTechniquesOpen(false)}
        />
      )}

      {/* Techniques Panel */}
      <TechniquesPanel
        character={character}
        isOpen={isTechniquesOpen}
        onClose={() => setIsTechniquesOpen(false)}
        onPanelClose={() => tutorialHandlers?.handleButtonInteraction()}
      />

      {/* Golden Finger Panel */}
      <GoldenFingerPanel
        character={character}
        isOpen={isGoldenFingerOpen}
        onClose={() => setIsGoldenFingerOpen(false)}
        onUseAbility={(abilityId) => {
          setIsGoldenFingerOpen(false);
          handleAction(`Use Golden Finger ability: ${abilityId}`);
        }}
        onPanelClose={() => tutorialHandlers?.handleButtonInteraction()}
      />

      {/* Memory Panel Overlay */}
      {isMemoryOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
          onClick={() => setIsMemoryOpen(false)}
        />
      )}

      {/* Memory Panel */}
      <MemoryPanel
        character={character}
        isOpen={isMemoryOpen}
        onClose={() => setIsMemoryOpen(false)}
        currentChapter={currentChapter}
        onPanelClose={() => tutorialHandlers?.handleButtonInteraction()}
      />
      </div>
    </>
  );
}
