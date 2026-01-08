import { useState, useRef, useEffect, useCallback } from 'react';
import { Character, GameMessage, GameChoice, Technique, InventoryItem, CultivationRealm, REALM_MAX_QI, REALM_MAX_HEALTH } from '@/types/game';
import { StoryMessage } from './StoryMessage';
import { ActionInput } from './ActionInput';
import { StatusPanel } from './StatusPanel';
import { CultivationPanel } from './CultivationPanel';
import { Button } from '@/components/ui/button';
import { User, MapPin, Clock, LogOut, Sparkles, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { saveToLocalStorage, autoSaveCharacter, saveLastChoices, loadLastChoices } from '@/services/autoSaveService';
import { useLanguage } from '@/contexts/LanguageContext';
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
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentLocation, setCurrentLocation] = useState('Starting Location');
  const [timeElapsed, setTimeElapsed] = useState('Day 1');
  const [currentChapter, setCurrentChapter] = useState(1);
  const [characterId, setCharacterId] = useState<string | null>(initialSavedId || null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { language } = useLanguage(); // Get current language
  const hasInitialized = useRef(false);

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
                { id: '2', text: 'Rest and meditate', type: 'action' },
                { id: '3', text: 'Look for opportunities', type: 'action' }
              ]);
            }
            
            setIsLoading(false);
            return;
          }
        }
        
        // Generate awakening scenario as opening narrative
        console.log('Generating awakening scenario...');
        const response = await generateNarrative(
          character,
          `This is the awakening scenario - the very beginning of ${character.name}'s journey. 

Character Background:
- Name: ${character.name}
- Gender: ${character.visualTraits?.gender || 'Unknown'}
- Origin: ${character.origin}
- Golden Finger: ${character.goldenFinger.name} - ${character.goldenFinger.effect}

Create an immersive awakening scene where ${character.name} discovers their ${character.goldenFinger.name}. This is a pivotal moment - describe:
1. The circumstances of the awakening (dramatic and fitting to their origin)
2. How the ${character.goldenFinger.name} manifests for the first time
3. The immediate sensations and realizations ${character.name} experiences
4. Set the stage for their journey in the Jianghu

Make it personal, dramatic, and memorable. This is the start of their legend.`,
          charId,
          language // Pass language
        );

        await processAIResponse(response, charId);
        
      } catch (error) {
        console.error('Failed to initialize game:', error);
        toast({
          title: "Connection Error",
          description: "Failed to connect to the world. Please try again.",
          variant: "destructive"
        });
        
        // Fallback to static opening
        generateFallbackOpening();
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
      { id: '1', text: 'Accept the humiliation silently (Mental +5)', type: 'action', checkType: 'intelligence' },
      { id: '2', text: 'Challenge the messenger to a duel', type: 'combat', checkType: 'strength' },
      { id: '3', text: 'Smile mysteriously and walk away', type: 'action', checkType: 'charisma' },
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

    // IMMEDIATELY update character state in UI
    onUpdateCharacter(updatedCharacter);
    
    // IMMEDIATELY save character to database with all changes
    console.log('💾 Saving character updates to database...');
    console.log('Stats:', updatedCharacter.stats);
    console.log('Health:', updatedCharacter.health, '/', updatedCharacter.maxHealth);
    console.log('Qi:', updatedCharacter.qi, '/', updatedCharacter.maxQi);
    console.log('Cultivation:', updatedCharacter.cultivationProgress, '%');
    
    await updateCharacterInDatabase(charId, {
      stats: updatedCharacter.stats,
      health: updatedCharacter.health,
      max_health: updatedCharacter.maxHealth,
      qi: updatedCharacter.qi,
      max_qi: updatedCharacter.maxQi,
      karma: updatedCharacter.karma,
      realm: updatedCharacter.realm,
      cultivation_progress: updatedCharacter.cultivationProgress,
      breakthrough_ready: updatedCharacter.breakthroughReady,
      current_location: response.new_location || currentLocation,
      time_elapsed: response.time_passed || timeElapsed
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

    // Save important events to memory
    if (response.event_to_remember) {
      await saveStoryEvent(charId, {
        ...response.event_to_remember,
        chapter: currentChapter
      });
    }

    // Handle death
    if (response.is_death && userId) {
      await addToGraveyard(character, response.death_cause || 'Unknown', charId, userId);
      toast({
        title: "You Have Fallen",
        description: response.death_cause || "Your journey ends here...",
        variant: "destructive"
      });
    }
  };

  const handleAction = useCallback(async (action: string) => {
    if (isLoading || !characterId) return;
    
    setIsLoading(true);
    
    // Add user action to messages
    const userAction: GameMessage = {
      id: crypto.randomUUID(),
      type: 'action',
      content: action,
      timestamp: new Date(),
      speaker: character.name,
    };
    setMessages(prev => [...prev, userAction]);
    setChoices([]);

    // Save user message
    await saveChatMessage(characterId, 'user', action, 'action', character.name);

    try {
      const response = await generateNarrative(character, action, characterId, language); // Pass language
      await processAIResponse(response, characterId);
    } catch (error) {
      console.error('Error generating narrative:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('Rate limit')) {
        toast({
          title: "Too Many Requests",
          description: "Please wait a moment before taking another action.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "The Heavens Are Silent",
          description: "Failed to receive guidance from the world. Try again.",
          variant: "destructive"
        });
      }

      // Provide fallback choices
      setChoices([
        { id: '1', text: 'Try again', type: 'action' },
        { id: '2', text: 'Do something else', type: 'action' },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [character, characterId, isLoading, currentChapter, currentLocation, timeElapsed]);

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

    toast({
      title: "Meditation Complete",
      description: `Qi +${qiGained}, Cultivation +${cultivationGained}%`
    });
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

      toast({
        title: "Breakthrough Success!",
        description: `You have ascended to ${newRealm}!`,
      });
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

      toast({
        title: "Breakthrough Failed",
        description: "You suffered Qi Deviation!",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative">
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
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsStatusOpen(true)}
              className="h-9 w-9 sm:h-10 sm:w-10 md:h-11 md:w-11 text-white/70 hover:text-gold hover:bg-white/10 touch-manipulation"
            >
              <User className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsCultivationOpen(true)}
              className={cn(
                "h-9 w-9 sm:h-10 sm:w-10 md:h-11 md:w-11 hover:bg-white/10 touch-manipulation",
                character.breakthroughReady ? 'text-gold animate-pulse' : 'text-white/70 hover:text-gold'
              )}
            >
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
            </Button>
          </div>
          
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

      {/* Story Stream */}
      <div 
        ref={scrollRef}
        className="relative z-10 flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 md:space-y-6 scrollbar-hide max-w-4xl mx-auto w-full"
      >
        {messages.map((message, index) => (
          <StoryMessage 
            key={message.id} 
            message={message}
            isLatest={index === messages.length - 1}
          />
        ))}
        
        {isLoading && (
          <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 md:p-5 bg-black/40 backdrop-blur-md rounded-xl border border-white/10">
            <div className="flex gap-1 sm:gap-1.5">
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-gold rounded-full animate-pulse" />
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-gold rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-gold rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
            </div>
            <span className="text-xs sm:text-sm md:text-base text-white/50">The world responds...</span>
          </div>
        )}
      </div>

      {/* Bottom fade overlay */}
      <div className="sticky bottom-0 pointer-events-none z-10">
        <div className="h-8 sm:h-12 bg-gradient-to-t from-black/90 to-transparent" />
      </div>

      {/* Action Input */}
      <div className="sticky bottom-0 z-20 bg-black/80 backdrop-blur-md border-t border-white/10 p-3 sm:p-4 md:p-6 safe-area-bottom">
        <div className="max-w-4xl mx-auto">
          <ActionInput
            choices={choices}
            onAction={handleAction}
            isLoading={isLoading}
          />
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
      />

      {/* Cultivation Panel */}
      <CultivationPanel
        character={character}
        isOpen={isCultivationOpen}
        onClose={() => setIsCultivationOpen(false)}
        onMeditationComplete={handleMeditationComplete}
        onBreakthroughAttempt={handleBreakthroughAttempt}
      />
    </div>
  );
}
