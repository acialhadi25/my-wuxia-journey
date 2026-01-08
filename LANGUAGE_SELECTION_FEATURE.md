# Language Selection Feature

## Overview
Implementasi sistem pemilihan bahasa yang memungkinkan user memilih bahasa untuk AI responses (narasi, dialog, pilihan aksi, dll). Bahasa yang tersedia: **English** dan **Indonesian**.

## Features

### 1. Language Context & Provider
**File: `src/contexts/LanguageContext.tsx`**

Context global untuk manage language state di seluruh aplikasi.

**Features:**
- ✅ Language state management (en/id)
- ✅ Persistent storage (localStorage)
- ✅ Translation function `t(key)`
- ✅ Language instruction generator untuk AI prompts

**API:**
```typescript
const { language, setLanguage, t } = useLanguage();

// Get current language
console.log(language); // 'en' or 'id'

// Change language
setLanguage('id');

// Translate UI text
const title = t('title.main'); // "My Wuxia Journey" or "Perjalanan Wuxia Saya"
```

**Helper Function:**
```typescript
getLanguageInstruction(language: 'en' | 'id'): string
// Returns instruction for AI to respond in selected language
```

### 2. Options Dialog
**File: `src/components/OptionsDialog.tsx`**

Modal dialog untuk settings dengan language selection.

**Features:**
- ✅ Beautiful modal dengan backdrop blur
- ✅ Flag icons untuk visual language selection (🇬🇧 🇮🇩)
- ✅ Active state dengan gold highlight
- ✅ Touch-optimized buttons
- ✅ Responsive design (mobile-first)
- ✅ Smooth animations

**UI Elements:**
- Header dengan Globe icon
- Language selection grid (2 columns)
- Visual feedback untuk selected language
- Close button

### 3. Title Screen Integration
**File: `src/components/TitleScreen.tsx`**

Menambahkan Options button di title screen.

**Changes:**
- ✅ Options button (Settings icon) di top-right corner
- ✅ Translated UI text menggunakan `t()` function
- ✅ Options dialog integration
- ✅ Responsive positioning

### 4. AI Integration
**Files: `src/services/deepseekService.ts`, `src/services/gameService.ts`**

AI akan merespons dalam bahasa yang dipilih.

**Implementation:**
```typescript
// deepseekService.ts
static async generateNarrative(
  character: Character,
  action: string,
  context: {
    // ... other context
    language?: 'en' | 'id'; // NEW
  }
): Promise<DeepseekResponse> {
  const languageInstruction = getLanguageInstruction(language);
  
  // Add to system prompt
  const systemPrompt = basePrompt + `\n\n${languageInstruction}`;
  
  // Add to user message
  messages.push({
    role: 'user',
    content: `${action}\n\n${languageInstruction}`
  });
}
```

**Language Instructions:**

**English:**
```
Respond in English. Use appropriate Wuxia/Xianxia terminology and atmosphere.
```

**Indonesian:**
```
CRITICAL: You MUST respond in Indonesian (Bahasa Indonesia). 
All narrative, dialogue, system messages, and choices MUST be in Indonesian. 
Use Indonesian names for locations, techniques, and items when appropriate. 
Maintain the Wuxia/Xianxia atmosphere while using Indonesian language.
```

### 5. Game Screen Integration
**File: `src/components/GameScreen.tsx`**

Pass language ke AI generation functions.

**Changes:**
```typescript
const { language } = useLanguage();

// Pass to generateNarrative
const response = await generateNarrative(
  character, 
  action, 
  characterId, 
  language // NEW
);
```

## Translations

### Current Translations
**File: `src/contexts/LanguageContext.tsx`**

```typescript
const translations = {
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
    
    // ... more translations
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
    
    // ... more translations
  }
};
```

### Adding New Translations

1. Add key to both `en` and `id` objects in `LanguageContext.tsx`
2. Use in component: `const text = t('your.key')`

Example:
```typescript
// Add to translations
en: {
  'game.health': 'Health',
},
id: {
  'game.health': 'Kesehatan',
}

// Use in component
const healthLabel = t('game.health');
```

## User Flow

### First Time User:
```
1. Open app → Default language: English
2. Click Options button (⚙️) on title screen
3. Select language (🇬🇧 or 🇮🇩)
4. Language saved to localStorage
5. UI updates immediately
6. AI will respond in selected language
```

### Returning User:
```
1. Open app → Language loaded from localStorage
2. UI shows in saved language
3. AI responds in saved language
4. Can change anytime via Options
```

## Storage

**localStorage Key:** `game_language`

**Values:** `'en'` or `'id'`

**Example:**
```javascript
localStorage.getItem('game_language'); // 'id'
```

## Testing

### Test Language Selection:
1. ✅ Open title screen
2. ✅ Click Options button (top-right)
3. ✅ Select Indonesian (🇮🇩)
4. ✅ Verify UI text changes to Indonesian
5. ✅ Close and reopen app
6. ✅ Verify language persists

### Test AI Response:
1. ✅ Set language to Indonesian
2. ✅ Create character and start game
3. ✅ Take any action
4. ✅ Verify AI responds in Indonesian
5. ✅ Verify choices are in Indonesian
6. ✅ Switch to English
7. ✅ Take another action
8. ✅ Verify AI responds in English

### Test Persistence:
1. ✅ Set language to Indonesian
2. ✅ Reload browser (F5)
3. ✅ Verify language is still Indonesian
4. ✅ Verify AI still responds in Indonesian

## Console Logs

When language changes:
```
Language changed to: id
```

When AI generates response:
```
Sending request to Deepseek API...
// System prompt includes language instruction
```

## UI Components Affected

### Translated:
- ✅ Title Screen (buttons, text)
- ✅ Options Dialog (all text)

### Not Yet Translated (Future):
- Character Creation screen
- Game Screen UI elements
- Status Panel
- Cultivation Panel

**Note:** AI responses (narrative, dialogue, choices) ARE translated based on language selection.

## Architecture

```
App.tsx
  └─ LanguageProvider (wraps entire app)
      ├─ TitleScreen
      │   ├─ useLanguage() → get t() function
      │   └─ OptionsDialog
      │       └─ useLanguage() → get/set language
      │
      └─ GameScreen
          ├─ useLanguage() → get current language
          └─ generateNarrative(language) → AI responds in language
```

## Benefits

✅ **User Choice**: Users can choose their preferred language
✅ **Persistent**: Language choice saved across sessions
✅ **Seamless**: UI and AI responses both use selected language
✅ **Extensible**: Easy to add more languages
✅ **Type-Safe**: TypeScript ensures correct usage
✅ **Performance**: No API calls for translations (all local)

## Future Enhancements

### More Languages:
- Chinese (Simplified/Traditional)
- Japanese
- Korean
- Spanish
- Portuguese

### More Translations:
- Character Creation UI
- Game Screen UI
- Status Panel
- Cultivation Panel
- Error messages
- Toast notifications

### Advanced Features:
- Auto-detect browser language
- Language-specific fonts
- RTL support (for Arabic, Hebrew)
- Voice narration in selected language

## Files Modified

1. **New Files:**
   - `src/contexts/LanguageContext.tsx` - Language context & provider
   - `src/components/OptionsDialog.tsx` - Options modal

2. **Modified Files:**
   - `src/App.tsx` - Added LanguageProvider wrapper
   - `src/components/TitleScreen.tsx` - Added Options button & translations
   - `src/services/deepseekService.ts` - Added language parameter
   - `src/services/gameService.ts` - Pass language to Deepseek
   - `src/components/GameScreen.tsx` - Use language from context

## Code Examples

### Using Language in Component:
```typescript
import { useLanguage } from '@/contexts/LanguageContext';

function MyComponent() {
  const { language, setLanguage, t } = useLanguage();
  
  return (
    <div>
      <h1>{t('title.main')}</h1>
      <button onClick={() => setLanguage('id')}>
        Switch to Indonesian
      </button>
      <p>Current: {language}</p>
    </div>
  );
}
```

### Adding Language to AI Call:
```typescript
import { useLanguage } from '@/contexts/LanguageContext';

function GameComponent() {
  const { language } = useLanguage();
  
  const handleAction = async (action: string) => {
    const response = await generateNarrative(
      character,
      action,
      characterId,
      language // Pass current language
    );
  };
}
```

## Notes

- Language selection affects BOTH UI text AND AI responses
- Default language is English if not set
- Language persists in localStorage
- No server-side storage needed for language preference
- AI instructions are injected into both system prompt and user message for reliability
