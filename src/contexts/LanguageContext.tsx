import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type Language = 'en' | 'id';

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translations
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Title Screen
    'title.main': 'My Wuxia Journey',
    'title.subtitle': 'AI Jianghu',
    'title.start': 'Begin Journey',
    'title.continue': 'Continue Journey',
    'title.newGame': 'New Game',
    'title.options': 'Options',
    
    // Options
    'options.title': 'Options',
    'options.language': 'Language',
    'options.close': 'Close',
    'options.english': 'English',
    'options.indonesian': 'Indonesian',
    
    // Character Creation
    'creation.title': 'Choose Your Name',
    'creation.gender': 'Select your gender:',
    'creation.male': 'Male',
    'creation.female': 'Female',
    'creation.rollFate': 'Roll Fate (AI Generated)',
    'creation.selectCheat': 'Select Your Cheat',
    'creation.confirm': 'Confirm Your Path',
    'creation.back': 'Back',
    'creation.next': 'Next',
    'creation.awaken': 'Awaken',
    
    // Game
    'game.status': 'Status',
    'game.cultivation': 'Cultivation',
    'game.location': 'Location',
    'game.time': 'Time',
    'game.saving': 'Saving...',
    'game.typeAction': 'Type your own action...',
    'game.expressFreely': 'Express yourself freely. The Jianghu responds to your actions.',
  },
  id: {
    // Title Screen
    'title.main': 'Perjalanan Wuxia Saya',
    'title.subtitle': 'AI Jianghu',
    'title.start': 'Mulai Perjalanan',
    'title.continue': 'Lanjutkan Perjalanan',
    'title.newGame': 'Game Baru',
    'title.options': 'Pengaturan',
    
    // Options
    'options.title': 'Pengaturan',
    'options.language': 'Bahasa',
    'options.close': 'Tutup',
    'options.english': 'Inggris',
    'options.indonesian': 'Indonesia',
    
    // Character Creation
    'creation.title': 'Pilih Nama Anda',
    'creation.gender': 'Pilih jenis kelamin:',
    'creation.male': 'Laki-laki',
    'creation.female': 'Perempuan',
    'creation.rollFate': 'Gulung Takdir (AI Generated)',
    'creation.selectCheat': 'Pilih Jari Emas Anda',
    'creation.confirm': 'Konfirmasi Jalan Anda',
    'creation.back': 'Kembali',
    'creation.next': 'Lanjut',
    'creation.awaken': 'Bangkit',
    
    // Game
    'game.status': 'Status',
    'game.cultivation': 'Kultivasi',
    'game.location': 'Lokasi',
    'game.time': 'Waktu',
    'game.saving': 'Menyimpan...',
    'game.typeAction': 'Ketik aksi Anda sendiri...',
    'game.expressFreely': 'Ekspresikan diri Anda dengan bebas. Jianghu merespons tindakan Anda.',
  }
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    // Load from localStorage or default to English
    const saved = localStorage.getItem('game_language');
    return (saved as Language) || 'en';
  });
  const [isInitialized, setIsInitialized] = useState(false);

  // Load language from database when user logs in (only once on mount)
  useEffect(() => {
    if (isInitialized) return;
    
    const loadLanguageFromDB = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('language_preference')
            .eq('id', user.id)
            .single();
          
          if (profile && profile.language_preference) {
            const dbLanguage = profile.language_preference as Language;
            const currentLanguage = localStorage.getItem('game_language') as Language || 'en';
            
            if (dbLanguage !== currentLanguage) {
              console.log('Loading language from database:', dbLanguage);
              setLanguageState(dbLanguage);
              localStorage.setItem('game_language', dbLanguage);
            }
          }
        }
      } catch (error) {
        console.log('Could not load language from database:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    loadLanguageFromDB();
  }, [isInitialized]);

  // Save language to localStorage and database when it changes
  useEffect(() => {
    if (!isInitialized) return; // Don't save during initial load
    
    // Save to localStorage
    localStorage.setItem('game_language', language);
    console.log('Language changed to:', language);
    
    // Save to database if user is logged in
    const saveLanguageToDB = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { error } = await supabase
            .from('profiles')
            .update({ language_preference: language })
            .eq('id', user.id);
          
          if (error) {
            console.error('Failed to save language to database:', error);
          } else {
            console.log('Language saved to database:', language);
          }
        }
      } catch (error) {
        console.log('Could not save language to database:', error);
      }
    };

    saveLanguageToDB();
  }, [language, isInitialized]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Helper function to get language instruction for AI prompts
export function getLanguageInstruction(language: Language): string {
  if (language === 'id') {
    return `CRITICAL: You MUST respond in Indonesian (Bahasa Indonesia). All narrative, dialogue, system messages, and choices MUST be in Indonesian. Use Indonesian names for locations, techniques, and items when appropriate. Maintain the Wuxia/Xianxia atmosphere while using Indonesian language.`;
  }
  return `Respond in English. Use appropriate Wuxia/Xianxia terminology and atmosphere.`;
}
