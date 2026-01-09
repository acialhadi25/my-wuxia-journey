import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TitleScreen } from '@/components/TitleScreen';
import { CharacterCreation } from '@/components/CharacterCreation';
import { TutorialScreen } from '@/components/TutorialScreen';
import { GameScreen } from '@/components/GameScreen';
import { SEO } from '@/components/SEO';
import { Character } from '@/types/game';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { LogOut, User, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { trackGameEvent } from '@/lib/analytics';
import { perf } from '@/lib/performance';

type GamePhase = 'title' | 'creation' | 'tutorial' | 'playing' | 'loading-save';

const Index = () => {
  const [gamePhase, setGamePhase] = useState<GamePhase>('title');
  const [character, setCharacter] = useState<Character | null>(null);
  const [savedCharacterId, setSavedCharacterId] = useState<string | null>(null);
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Track session start
  useEffect(() => {
    const sessionStart = Date.now();
    
    return () => {
      const sessionDuration = Date.now() - sessionStart;
      trackGameEvent.sessionDuration(sessionDuration);
    };
  }, []);

  // Check for existing character on login
  useEffect(() => {
    if (user && !loading) {
      checkExistingCharacter();
    }
  }, [user, loading]);

  const checkExistingCharacter = async () => {
    if (!user) return;

    perf.start('Load Character');
    
    try {
      const { data, error } = await supabase
        .from('characters')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_alive', true)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        // Found a saved character - also load techniques and items
        const [techniquesResult, itemsResult] = await Promise.all([
          supabase.from('character_techniques').select('*').eq('character_id', data.id),
          supabase.from('character_items').select('*').eq('character_id', data.id)
        ]);

        const loadedCharacter: Character = {
          id: data.id,
          name: data.name,
          origin: data.origin,
          spiritRoot: data.spirit_root as any,
          realm: data.realm as any,
          goldenFinger: data.golden_finger as any,
          stats: data.stats as any,
          qi: data.qi,
          maxQi: data.max_qi,
          health: data.health,
          maxHealth: data.max_health,
          karma: data.karma,
          cultivationProgress: (data as any).cultivation_progress || 0,
          breakthroughReady: (data as any).breakthrough_ready || false,
          techniques: (techniquesResult.data || []).map((t: any) => ({
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
          })),
          inventory: (itemsResult.data || []).map((i: any) => ({
            id: i.id,
            name: i.name,
            type: i.type,
            rarity: i.rarity,
            quantity: i.quantity,
            description: i.description,
            effects: i.effects,
            equipped: i.equipped
          })),
          relationships: [],
          visualTraits: data.visual_traits as any,
          // Use database fields first, fallback to localStorage if needed
          tutorialCompleted: data.tutorial_completed ?? 
                           localStorage.getItem(`tutorial_completed_${data.id}`) === 'true',
          goldenFingerUnlocked: data.golden_finger_unlocked ?? 
                               localStorage.getItem(`golden_finger_unlocked_${data.id}`) === 'true',
        };
        setCharacter(loadedCharacter);
        setSavedCharacterId(data.id);
        
        perf.end('Load Character');
      }
    } catch (error) {
      console.error('Error checking for saved character:', error);
      perf.end('Load Character', false);
    }
  };

  const handleStartGame = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (character && savedCharacterId) {
      // Always go directly to playing - no separate tutorial phase
      console.log('Loading game screen');
      setGamePhase('playing');
    } else {
      // Start new game
      setGamePhase('creation');
    }
  };

  const handleNewGame = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    // Delete old character if exists
    if (character && character.id) {
      try {
        console.log('=== DELETING OLD CHARACTER ===');
        console.log('Character ID:', character.id);
        console.log('Character Name:', character.name);
        
        // Delete related data first (foreign key constraints)
        console.log('Deleting related data...');
        
        const deletionResults = await Promise.allSettled([
          supabase.from('chat_messages').delete().eq('character_id', character.id),
          supabase.from('story_events').delete().eq('character_id', character.id),
          supabase.from('npc_relationships').delete().eq('character_id', character.id),
          supabase.from('character_techniques').delete().eq('character_id', character.id),
          supabase.from('character_items').delete().eq('character_id', character.id),
          supabase.from('tutorial_steps').delete().eq('character_id', character.id),
        ]);
        
        // Log results
        const tableNames = ['chat_messages', 'story_events', 'npc_relationships', 'character_techniques', 'character_items', 'tutorial_steps'];
        deletionResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            const { error, count } = result.value;
            if (error) {
              console.error(`❌ ${tableNames[index]}: ${error.message}`);
            } else {
              console.log(`✅ ${tableNames[index]}: ${count || 0} rows deleted`);
            }
          } else {
            console.error(`❌ ${tableNames[index]}: ${result.reason}`);
          }
        });
        
        // Delete character
        console.log('Deleting character record...');
        const { error: charError, count: charCount } = await supabase
          .from('characters')
          .delete()
          .eq('id', character.id);
        
        if (charError) {
          console.error('❌ Character deletion error:', charError);
          throw charError;
        } else {
          console.log(`✅ Character deleted: ${charCount || 0} rows`);
        }
        
        // Clear localStorage
        console.log('Clearing localStorage...');
        localStorage.removeItem(`game_state_${character.id}`);
        localStorage.removeItem(`tutorial_progress_${character.id}`);
        localStorage.removeItem(`tutorial_completed_${character.id}`);
        localStorage.removeItem(`golden_finger_unlocked_${character.id}`);
        console.log('✅ localStorage cleared');
        
        console.log('=== OLD CHARACTER DELETED SUCCESSFULLY ===');
        
        toast({
          title: "Previous Character Deleted",
          description: "Starting fresh with a new character.",
        });
      } catch (error) {
        console.error('=== ERROR DELETING OLD CHARACTER ===');
        console.error(error);
        toast({
          title: "Warning",
          description: "Could not delete old character data. Continuing anyway.",
          variant: "destructive",
        });
      }
    }
    
    setCharacter(null);
    setSavedCharacterId(null);
    setGamePhase('creation');
  };

  const handleCharacterComplete = (newCharacter: Character) => {
    setCharacter(newCharacter);
    setSavedCharacterId(newCharacter.id);
    
    // Go directly to playing - no separate tutorial
    setGamePhase('playing');
  };

  const handleTutorialComplete = (updatedCharacter: Character) => {
    // This is no longer used, but keep for compatibility
    setCharacter(updatedCharacter);
    setGamePhase('playing');
  };

  const handleBackToTitle = () => {
    setGamePhase('title');
  };

  const handleUpdateCharacter = (updatedCharacter: Character) => {
    setCharacter(updatedCharacter);
  };

  const handleSignOut = async () => {
    await signOut();
    setCharacter(null);
    setSavedCharacterId(null);
    setGamePhase('title');
    toast({
      title: "Farewell, Cultivator",
      description: "Your progress has been saved."
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen ink-wash-bg flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-gold animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your journey...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Home"
        description="Embark on an AI-powered cultivation journey in the world of Wuxia. Create your character, unlock golden fingers, and forge your path to immortality."
      />
      <div className="min-h-screen">
        {/* User Status Bar - only show on title */}
        {gamePhase === 'title' && (
        <div className="absolute top-4 right-4 z-50">
          {user ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg border border-border">
                <User className="w-4 h-4 text-jade-glow" />
                <span className="text-sm text-foreground/80">
                  {user.email?.split('@')[0]}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="ink"
              size="sm"
              onClick={() => navigate('/auth')}
            >
              <User className="w-4 h-4 mr-2" />
              Login
            </Button>
          )}
        </div>
      )}

      {gamePhase === 'title' && (
        <TitleScreen 
          onStart={handleStartGame}
          onNewGame={handleNewGame}
          hasSavedGame={!!character}
          isLoggedIn={!!user}
        />
      )}
      
      {gamePhase === 'creation' && user && (
        <CharacterCreation 
          onComplete={handleCharacterComplete}
          onBack={handleBackToTitle}
          userId={user.id}
        />
      )}
      
      {gamePhase === 'tutorial' && character && user && (
        <TutorialScreen
          character={character}
          onComplete={handleTutorialComplete}
          onBack={() => setGamePhase('creation')}
        />
      )}

      {gamePhase === 'playing' && character && user && (
        <GameScreen 
          character={character}
          onUpdateCharacter={handleUpdateCharacter}
          userId={user.id}
          savedCharacterId={savedCharacterId}
          onSignOut={handleSignOut}
        />
      )}
      </div>
    </>
  );
};

export default Index;
