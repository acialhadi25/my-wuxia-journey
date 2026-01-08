# Fix: AI Merespon dalam Bahasa yang Salah saat Character Creation

## Masalah
User sudah memilih bahasa Indonesia di OptionsDialog, tapi saat character creation (fate generation dan tutorial), AI masih merespon dalam bahasa Inggris.

## Penyebab
Fungsi `generateFate()` dan `generateTutorial()` di `deepseekService.ts` tidak menggunakan parameter `language` dan tidak menambahkan instruksi bahasa ke prompt yang dikirim ke Deepseek API.

Hanya fungsi `generateNarrative()` yang sudah menggunakan `getLanguageInstruction()`.

## Solusi

### 1. Update `generateFate()` di `deepseekService.ts`
- Tambahkan parameter `language: 'en' | 'id' = 'en'`
- Panggil `getLanguageInstruction(language)` 
- Tambahkan `languageInstruction` ke system prompt dan user message

### 2. Update `generateTutorial()` di `deepseekService.ts`
- Tambahkan `language?: 'en' | 'id'` ke params
- Panggil `getLanguageInstruction(language)`
- Tambahkan `languageInstruction` ke system prompt dan user message

### 3. Update `CharacterCreation.tsx`
- Sudah menggunakan `useLanguage()` hook
- Update pemanggilan: `DeepseekService.generateFate(name, gender, language)`

### 4. Update `TutorialScreen.tsx`
- Import `useLanguage` dari `@/contexts/LanguageContext`
- Tambahkan `const { language } = useLanguage();`
- Update pemanggilan: tambahkan `language` ke params `generateTutorial()`

### 5. Tambahkan Retry Logic untuk Network Errors
- Refactor `generateNarrative()` untuk menambahkan retry logic dengan exponential backoff
- Pisahkan logic ke `_generateNarrativeAttempt()` sebagai private method
- Retry hingga 3x untuk network errors (ERR_HTTP2_PROTOCOL_ERROR, Failed to fetch, dll)
- Tambahkan timeout 30 detik untuk mencegah hanging
- Tidak retry untuk auth atau rate limit errors

## Testing
1. Pilih bahasa Indonesia di Options
2. Buat character baru
3. Roll fate - seharusnya backstory dalam bahasa Indonesia
4. Pilih golden finger dan lanjut ke tutorial
5. Tutorial narrative seharusnya dalam bahasa Indonesia
6. Jika terjadi network error, sistem akan retry otomatis hingga 3x

## File yang Diubah
- `src/services/deepseekService.ts`
- `src/components/CharacterCreation.tsx`
- `src/components/TutorialScreen.tsx`

## Error Handling
Network errors seperti `ERR_HTTP2_PROTOCOL_ERROR` sekarang ditangani dengan:
- Retry otomatis hingga 3 kali
- Exponential backoff (1s, 2s, 4s)
- Timeout 30 detik per request
- Error message yang lebih jelas untuk user
