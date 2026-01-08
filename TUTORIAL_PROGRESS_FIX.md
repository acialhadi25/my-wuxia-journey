# Tutorial Progress Loading Fix

## Problem
Saat browser di-reload di tengah tutorial:
1. ❌ Hanya menampilkan chat terakhir, bukan semua history
2. ❌ Step kembali ke 1 padahal seharusnya di step 2
3. ✅ Pilihan (choices) sudah benar - menggunakan yang terakhir di-generate

## Root Cause

### Issue 1: Hanya Menyimpan Step Terakhir
`saveTutorialProgress()` hanya menyimpan:
- Step number
- Narrative terakhir
- Choices terakhir
- Player choice

**TIDAK menyimpan:**
- Semua messages (chat history)
- Tutorial history lengkap

### Issue 2: Step Calculation Salah
```typescript
// SALAH - step di localStorage sudah 1-indexed
setCurrentStep(localProgress.step - 1);

// BENAR - langsung gunakan step dari storage
setCurrentStep(localProgress.step);
```

### Issue 3: Hanya Load Message Terakhir
```typescript
// SALAH - hanya load narrative terakhir
if (localProgress.narrative) {
  const narrativeMessage: GameMessage = {
    id: crypto.randomUUID(),
    type: 'tutorial',
    content: localProgress.narrative,
    timestamp: new Date(),
  };
  setMessages([narrativeMessage]); // ❌ Replace semua messages
}
```

## Solution

### 1. Update `autoSaveService.ts`

**Tambah Parameter di `saveTutorialProgress()`:**
```typescript
export async function saveTutorialProgress(
  characterId: string,
  step: number,
  narrative: string,
  choices: any[],
  playerChoice?: string,
  allMessages?: any[],      // ✅ BARU: Simpan semua messages
  tutorialHistory?: string  // ✅ BARU: Simpan full history
): Promise<boolean>
```

**Update localStorage Save:**
```typescript
localStorage.setItem(localKey, JSON.stringify({
  step,
  narrative,
  choices,
  playerChoice,
  allMessages: allMessages || [],      // ✅ Simpan semua messages
  tutorialHistory: tutorialHistory || '', // ✅ Simpan full history
  savedAt: new Date().toISOString()
}));
```

**Update Return Type di `loadTutorialProgress()`:**
```typescript
export async function loadTutorialProgress(characterId: string): Promise<{
  step: number;
  narrative: string;
  choices: any[];
  playerChoice?: string;
  allMessages?: any[];      // ✅ BARU
  tutorialHistory?: string; // ✅ BARU
} | null>
```

### 2. Update `TutorialScreen.tsx`

**Update `autoSave()` Function:**
```typescript
const autoSave = async (
  step: number, 
  narrative: string, 
  choices: any[], 
  playerChoice?: string,
  messagesToSave?: GameMessage[],  // ✅ BARU: Accept messages
  historyToSave?: string           // ✅ BARU: Accept history
) => {
  // Use provided messages or current state
  const finalMessages = messagesToSave || messages;
  const finalHistory = historyToSave || tutorialHistory;
  
  // Save with full history
  await saveTutorialProgress(
    character.id, 
    step, 
    narrative, 
    choices, 
    playerChoice,
    finalMessages,  // ✅ Pass all messages
    finalHistory    // ✅ Pass full history
  );
}
```

**Update `loadExistingTutorialOrGenerate()`:**
```typescript
if (localProgress && localProgress.step > 0) {
  // ✅ FIX: Gunakan step langsung (sudah 1-indexed)
  setCurrentStep(localProgress.step);
  
  // ✅ FIX: Restore semua messages jika ada
  if (localProgress.allMessages && localProgress.allMessages.length > 0) {
    console.log('Restoring', localProgress.allMessages.length, 'messages');
    setMessages(localProgress.allMessages);
  } else if (localProgress.narrative) {
    // Fallback: hanya narrative terakhir
    setMessages([narrativeMessage]);
  }
  
  // ✅ FIX: Restore full history
  if (localProgress.tutorialHistory) {
    setTutorialHistory(localProgress.tutorialHistory);
  }
}
```

**Update AI Generation Save:**
```typescript
// Setelah AI generate, simpan dengan messages dan history yang sudah diupdate
const narrativeMessage: GameMessage = { ... };
const updatedMessages = [...messages, narrativeMessage];
setMessages(updatedMessages);

const updatedHistory = tutorialHistory + '\n' + step.narrative;
setTutorialHistory(updatedHistory);

// ✅ Pass updated messages dan history ke autoSave
await autoSave(
  currentStep + 1, 
  step.narrative, 
  step.choices, 
  undefined, 
  updatedMessages,  // ✅ Explicit messages
  updatedHistory    // ✅ Explicit history
);
```

**Update Choice Handling:**
```typescript
const handleChoice = async (choice: GameChoice) => {
  // Buat choice message
  const choiceMessage: GameMessage = { ... };
  
  // Update messages dan history DULU
  const updatedMessages = [...messages, choiceMessage];
  setMessages(updatedMessages);
  
  const updatedHistory = tutorialHistory + `\nPlayer chose: ${choice.text}`;
  setTutorialHistory(updatedHistory);
  
  // ✅ Save dengan updated messages dan history
  await autoSave(
    currentStep + 1, 
    '', 
    [], 
    choice.text, 
    updatedMessages, 
    updatedHistory
  );
  
  // Lanjut ke step berikutnya
  setCurrentStep(currentStep + 1);
  await generateTutorialStep(choice.text);
};
```

## Testing

### Test 1: Multiple Steps dengan Reload
1. ✅ Mulai tutorial baru
2. ✅ Tunggu AI generate step 1
3. ✅ Pilih choice
4. ✅ Tunggu AI generate step 2
5. ✅ **RELOAD BROWSER**
6. ✅ **VERIFY**: 
   - Step masih di 2 (bukan kembali ke 1)
   - Semua messages muncul (step 1 narrative, choice, step 2 narrative)
   - Choices yang ditampilkan adalah dari step 2

### Test 2: Reload di Berbagai Titik
1. ✅ Reload setelah step 1 narrative → restore dengan benar
2. ✅ Reload setelah pilih choice → restore dengan choice tersimpan
3. ✅ Reload setelah step 2 narrative → restore semua history
4. ✅ Reload setelah step 3 → semua 3 steps muncul

### Test 3: Console Verification
```
// Saat save
Tutorial auto-saved at step: 2 with 3 messages

// Saat load
Found local tutorial progress at step: 2
Restoring 3 messages from localStorage
```

## Expected Behavior After Fix

### Sebelum Fix
```
Step 1: "Narrative 1" + Choice
Step 2: "Narrative 2" + Choice
[RELOAD]
❌ Step: 1 (salah, harusnya 2)
❌ Messages: ["Narrative 2"] (hanya terakhir)
✅ Choices: [Step 2 choices] (benar)
```

### Setelah Fix
```
Step 1: "Narrative 1" + Choice
Step 2: "Narrative 2" + Choice
[RELOAD]
✅ Step: 2 (benar)
✅ Messages: ["Narrative 1", "Choice 1", "Narrative 2"] (semua)
✅ Choices: [Step 2 choices] (benar)
```

## Files Modified

1. ✅ `src/services/autoSaveService.ts`
   - Added `allMessages` and `tutorialHistory` parameters
   - Updated save and load functions
   - Updated return types

2. ✅ `src/components/TutorialScreen.tsx`
   - Updated `autoSave()` to accept messages and history
   - Fixed `loadExistingTutorialOrGenerate()` step calculation
   - Fixed message restoration to load all messages
   - Updated all autoSave calls to pass explicit messages and history
   - Fixed `handleChoice()` to save updated state

## Summary

Masalah utama adalah:
1. **Data yang disimpan tidak lengkap** - hanya step terakhir
2. **Step calculation salah** - mengurangi 1 dari step yang sudah benar
3. **Message restoration salah** - hanya load message terakhir

Solusinya:
1. **Simpan semua messages dan history** di localStorage
2. **Gunakan step langsung** tanpa modifikasi
3. **Restore semua messages** saat load, bukan hanya terakhir
4. **Pass explicit state** ke autoSave untuk menghindari race condition

Sekarang tutorial akan restore dengan sempurna termasuk semua chat history dan step yang benar!
