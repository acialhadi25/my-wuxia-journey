// Tutorial-related functions for GameScreen
// This file contains all tutorial logic to keep GameScreen.tsx cleaner

import { Character, GameMessage, GameChoice } from '@/types/game';
import { TutorialService } from '@/services/tutorialService';
import { gameNotify, notify } from '@/lib/notifications';
import { updateCharacterInDatabase, saveChatMessage, generateNarrative } from '@/services/gameService';

export interface TutorialHandlers {
  startTutorial: () => Promise<void>;
  resumeTutorial: (step: number) => Promise<void>;
  handleTutorialAction: () => Promise<void>;
  completeTutorial: () => Promise<void>;
  handleButtonInteraction: () => Promise<void>;
}

export function createTutorialHandlers(
  character: Character,
  characterId: string | null,
  language: 'en' | 'id',
  setters: {
    setTutorialActive: (active: boolean) => void;
    setTutorialStep: (step: number) => void;
    setShowDaoMaster: (show: boolean) => void;
    setDaoMasterMessage: (msg: string) => void;
    setMessages: React.Dispatch<React.SetStateAction<GameMessage[]>>;
    setChoices: React.Dispatch<React.SetStateAction<GameChoice[]>>;
    setTutorialHighlight: (highlight?: string) => void;
    setIsStatusOpen: (open: boolean) => void;
    setIsInventoryOpen: (open: boolean) => void;
    setIsTechniquesOpen: (open: boolean) => void;
    setIsCultivationOpen: (open: boolean) => void;
    setIsGoldenFingerOpen: (open: boolean) => void;
    setIsMemoryOpen: (open: boolean) => void;
    onUpdateCharacter: (char: Character) => void;
  },
  processAIResponse: (response: any, charId: string) => Promise<void>
): TutorialHandlers {
  
  const startTutorial = async () => {
    if (!characterId) {
      console.error('Cannot start tutorial: no character ID');
      return;
    }
    
    try {
      console.log('🎓 Starting tutorial...');
      
      // Execute step 1
      const result = await TutorialService.executeStep(1, character, language);
      
      // Show Dao Master message
      setters.setDaoMasterMessage(result.daoMasterMessage);
      setters.setShowDaoMaster(true);
      
      // Add narrative message
      const narrativeMsg: GameMessage = {
        id: crypto.randomUUID(),
        type: 'narration',
        content: result.narrative,
        timestamp: new Date()
      };
      setters.setMessages(prev => [...prev, narrativeMsg]);
      await saveChatMessage(characterId, 'narrative', narrativeMsg.content, 'system');
      
      // Add single action choice
      setters.setChoices([{
        id: '1',
        text: result.actionText,
        type: 'action'
      }]);
      
      // Update character with auto-actions
      setters.onUpdateCharacter(result.updatedCharacter);
      
      // Save to database (ignore type errors for tutorial_step - will be fixed after migration)
      await updateCharacterInDatabase(characterId, {
        tutorial_step: 1,
        health: Math.round(result.updatedCharacter.health),
        qi: Math.round(result.updatedCharacter.qi),
        stamina: Math.round(result.updatedCharacter.stamina),
        active_effects: result.updatedCharacter.activeEffects || []
      } as any);
      
      setters.setTutorialStep(1);
      setters.setTutorialActive(true);
      
      // Highlight button if needed
      if (result.highlightButton) {
        setters.setTutorialHighlight(result.highlightButton);
      }
      
      console.log('✅ Tutorial step 1 started');
      
    } catch (error) {
      console.error('Failed to start tutorial:', error);
      notify.error('Tutorial Error', 'Failed to start tutorial. Please refresh.');
    }
  };

  const resumeTutorial = async (step: number) => {
    if (!characterId) return;
    
    try {
      console.log(`🎓 Resuming tutorial at step ${step}...`);
      
      // Execute current step
      const result = await TutorialService.executeStep(step, character, language);
      
      // Show Dao Master message
      setters.setDaoMasterMessage(result.daoMasterMessage);
      setters.setShowDaoMaster(true);
      
      // Add narrative
      const narrativeMsg: GameMessage = {
        id: crypto.randomUUID(),
        type: 'narration',
        content: result.narrative,
        timestamp: new Date()
      };
      setters.setMessages(prev => [...prev, narrativeMsg]);
      
      // Add action choice
      setters.setChoices([{
        id: String(step),
        text: result.actionText,
        type: 'action'
      }]);
      
      setters.setTutorialStep(step);
      setters.setTutorialActive(true);
      
      if (result.highlightButton) {
        setters.setTutorialHighlight(result.highlightButton);
      }
      
      console.log(`✅ Tutorial resumed at step ${step}`);
      
    } catch (error) {
      console.error('Failed to resume tutorial:', error);
    }
  };

  const handleTutorialAction = async () => {
    if (!characterId) return;
    
    const currentStep = character.tutorialStep || 0;
    const nextStep = currentStep + 1;
    
    if (nextStep > 15) {
      await completeTutorial();
      return;
    }
    
    try {
      console.log(`🎓 Executing tutorial step ${nextStep}...`);
      
      // Execute next step
      const result = await TutorialService.executeStep(nextStep, character, language);
      
      // Show Dao Master message
      setters.setDaoMasterMessage(result.daoMasterMessage);
      setters.setShowDaoMaster(true);
      
      // Add narrative
      const narrativeMsg: GameMessage = {
        id: crypto.randomUUID(),
        type: 'narration',
        content: result.narrative,
        timestamp: new Date()
      };
      setters.setMessages(prev => [...prev, narrativeMsg]);
      await saveChatMessage(characterId, 'narrative', narrativeMsg.content, 'system');
      
      // Update character first (apply auto-actions)
      const updatedChar = TutorialService.completeStep(result.updatedCharacter);
      setters.onUpdateCharacter(updatedChar);
      
      // Check if this step requires user interaction with a button
      const stepData = await import('@/data/tutorialSteps').then(m => m.tutorialSteps[nextStep - 1]);
      
      if (stepData.waitForUserAction && stepData.highlightButton) {
        // This step requires user to click a highlighted button
        console.log(`⏸️ WAITING for user to click: ${stepData.highlightButton}`);
        console.log(`🚫 Action choice BLOCKED until button clicked`);
        
        // ❌ DO NOT show action choices - force user to click button
        setters.setChoices([]);
        
        // Highlight the button (yellow pulsing)
        setters.setTutorialHighlight(stepData.highlightButton);
        
        // Auto-open panel if specified (after small delay for better UX)
        if (stepData.panelToOpen) {
          setTimeout(() => {
            switch (stepData.panelToOpen) {
              case 'status': setters.setIsStatusOpen(true); break;
              case 'inventory': setters.setIsInventoryOpen(true); break;
              case 'techniques': setters.setIsTechniquesOpen(true); break;
              case 'cultivation': setters.setIsCultivationOpen(true); break;
              case 'goldenFinger': setters.setIsGoldenFingerOpen(true); break;
              case 'memory': setters.setIsMemoryOpen(true); break;
            }
          }, 800); // Delay so user can see the highlight first
        }
        
        // Save progress
        await updateCharacterInDatabase(characterId, {
          tutorial_step: nextStep,
          tutorial_completed: result.isComplete,
          health: Math.round(updatedChar.health),
          qi: Math.round(updatedChar.qi),
          stamina: Math.round(updatedChar.stamina),
          stats: updatedChar.stats,
          inventory: updatedChar.inventory,
          active_effects: updatedChar.activeEffects || [],
          golden_finger_unlocked: updatedChar.goldenFingerUnlocked
        } as any);
        
        setters.setTutorialStep(nextStep);
        
        // ⏸️ STOP HERE - Wait for user to click the highlighted button
        // The button click will trigger panel open/close
        // After panel interaction, we need a way to show action choice
        // This will be handled by a separate function when panel closes
        
      } else {
        // Normal step - show action choice immediately
        if (!result.isComplete) {
          setters.setChoices([{
            id: String(nextStep),
            text: result.actionText,
            type: 'action'
          }]);
        } else {
          // Tutorial complete - will switch to AI
          await completeTutorial();
          return;
        }
        
        // Save to database
        await updateCharacterInDatabase(characterId, {
          tutorial_step: nextStep,
          tutorial_completed: result.isComplete,
          health: Math.round(updatedChar.health),
          qi: Math.round(updatedChar.qi),
          stamina: Math.round(updatedChar.stamina),
          stats: updatedChar.stats,
          inventory: updatedChar.inventory,
          active_effects: updatedChar.activeEffects || [],
          golden_finger_unlocked: updatedChar.goldenFingerUnlocked
        } as any);
        
        setters.setTutorialStep(nextStep);
        setters.setTutorialHighlight(result.highlightButton);
      }
      
      console.log(`✅ Tutorial step ${nextStep} setup complete`);
      
    } catch (error) {
      console.error('Failed to execute tutorial step:', error);
      notify.error('Tutorial Error', 'Failed to proceed. Please try again.');
    }
  };
  
  // Called when user clicks highlighted button or closes panel during tutorial
  const handleButtonInteraction = async () => {
    if (!characterId) return;
    
    const currentStep = character.tutorialStep || 0;
    
    // Only proceed if we're in a tutorial step that requires button interaction
    if (currentStep === 0 || currentStep > 15) return;
    
    try {
      // Get step data to check if this step requires user action
      const stepData = await import('@/data/tutorialSteps').then(m => m.tutorialSteps[currentStep - 1]);
      
      // Only show action choice if this step was waiting for user action
      if (!stepData.waitForUserAction) {
        console.log(`⏭️ Step ${currentStep} doesn't require button interaction, skipping`);
        return;
      }
      
      const result = await TutorialService.executeStep(currentStep, character, language);
      
      console.log(`✅ User interacted with button at step ${currentStep}, showing action choice now`);
      
      // Clear highlight
      setters.setTutorialHighlight(undefined);
      
      // NOW show the action choice
      if (!result.isComplete) {
        setters.setChoices([{
          id: String(currentStep),
          text: result.actionText,
          type: 'action'
        }]);
      }
      
    } catch (error) {
      console.error('Failed to handle button interaction:', error);
    }
  };

  const completeTutorial = async () => {
    if (!characterId) return;
    
    try {
      console.log('🎉 Completing tutorial...');
      
      // Mark tutorial as complete
      const updatedChar = TutorialService.completeTutorial(character);
      setters.onUpdateCharacter(updatedChar);
      
      // Save to database (ignore type errors for tutorial_step - will be fixed after migration)
      await updateCharacterInDatabase(characterId, {
        tutorial_completed: true,
        tutorial_step: 15,
        golden_finger_unlocked: true
      } as any);
      
      setters.setTutorialActive(false);
      setters.setShowDaoMaster(false);
      setters.setTutorialHighlight(undefined);
      
      console.log('📐 Layout should remain consistent - tutorial flags cleared');
      console.log('   - tutorialActive: false');
      console.log('   - showDaoMaster: false');
      console.log('   - tutorialHighlight: undefined');
      
      // Show completion message
      gameNotify.achievementUnlocked('Tutorial Complete!');
      
      const completionMsg: GameMessage = {
        id: crypto.randomUUID(),
        type: 'system',
        content: language === 'id' 
          ? '✨ Tutorial selesai! Petualanganmu yang sesungguhnya dimulai sekarang...'
          : '✨ Tutorial complete! Your true adventure begins now...',
        timestamp: new Date()
      };
      setters.setMessages(prev => [...prev, completionMsg]);
      await saveChatMessage(characterId, 'system', completionMsg.content, 'system');
      
      // Generate first AI narrative
      console.log('🤖 Generating first AI narrative...');
      const response = await generateNarrative(
        updatedChar,
        `Tutorial just completed. Character ${updatedChar.name} understands their Golden Finger (${updatedChar.goldenFinger.name}) and basic mechanics.

They are standing at the entrance of a cave, looking out at the vast cultivation world.

Generate the FIRST real adventure scene. What do they see? What opportunities or dangers await? 
Make it exciting and set up the beginning of their journey.`,
        characterId,
        language
      );
      
      await processAIResponse(response, characterId);
      
      console.log('✅ Tutorial completed, AI narrative generated');
      
      // Ensure choices are set (fallback if AI doesn't provide choices)
      // This prevents layout collapse after tutorial
      setTimeout(() => {
        setters.setChoices(prev => {
          if (prev.length === 0) {
            console.log('⚠️ No choices after tutorial, adding fallback choices');
            return [
              { id: '1', text: language === 'id' ? 'Jelajahi area sekitar' : 'Explore the surroundings', type: 'action' },
              { id: '2', text: language === 'id' ? 'Bermeditasi sejenak' : 'Meditate for a moment', type: 'action' }
            ];
          }
          return prev;
        });
      }, 1000); // Wait 1 second for AI response to process
      
    } catch (error) {
      console.error('Failed to complete tutorial:', error);
      notify.error('Tutorial Error', 'Failed to complete tutorial. Please refresh.');
    }
  };

  return {
    startTutorial,
    resumeTutorial,
    handleTutorialAction,
    completeTutorial,
    handleButtonInteraction
  };
}
