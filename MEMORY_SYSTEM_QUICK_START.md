# Memory System - Quick Start Guide 🚀

## Untuk Player

### Cara Membuka Memory Panel
1. Klik ikon **Brain (🧠)** di header game (sebelah kanan Golden Finger)
2. Panel akan slide in dari kanan
3. Memory akan load otomatis

### Cara Mencari Memory
1. Gunakan **search bar** di atas untuk mencari kata kunci
2. Pilih **tipe event** dari dropdown (combat, social, dll)
3. Pilih **level kepentingan** dari dropdown (critical, important, dll)
4. Hasil akan update secara instant

### Cara Melihat Detail Memory
1. **Klik** card memory manapun
2. Modal akan terbuka dengan detail lengkap
3. Klik **X** atau di luar modal untuk menutup

---

## Untuk Developer

### Menyimpan Memory Baru
```typescript
import { MemoryService } from '@/services/memoryService';

await MemoryService.storeMemory({
  characterId: character.id,
  timestamp: Date.now(),
  chapter: currentChapter,
  eventType: 'combat',
  summary: 'Defeated Elder Zhao',
  fullNarrative: 'Full story here...',
  importance: 'critical',
  importanceScore: 9,
  emotion: 'pride',
  location: 'Sky Sect',
  involvedNPCs: ['Elder Zhao'],
  tags: ['combat', 'victory'],
  keywords: ['defeated', 'elder', 'zhao'],
  karmaChange: -10,
  statChanges: { strength: 5 }
});
```

### Query Memory
```typescript
const results = await MemoryService.queryMemories({
  characterId: character.id,
  queryText: 'Zhao Wei',
  limit: 5,
  similarityThreshold: 0.3
});
```

### Build Memory Context untuk AI
```typescript
const context = await MemoryService.buildMemoryContext(
  character.id,
  'Enter Sky Sect',
  'Sky Sect',
  currentChapter
);
```

### Get Memory Statistics
```typescript
const stats = await MemoryService.getMemoryStats(character.id);
console.log(stats.totalEvents); // Total memory count
console.log(stats.criticalEvents); // Critical memories
console.log(stats.mostRetrievedEvents); // Most referenced
```

---

## Database Migration

### Menjalankan Migration
```bash
# Di Supabase Dashboard:
# 1. Buka SQL Editor
# 2. Copy isi file: supabase/migrations/20260109000006_create_memory_events.sql
# 3. Paste dan Run
# 4. Enable pgvector extension jika belum:
CREATE EXTENSION IF NOT EXISTS vector;
```

---

## Memory Event Types

### 22 Tipe Event
- `combat` - Pertempuran
- `social` - Interaksi sosial
- `cultivation` - Kultivasi
- `betrayal` - Pengkhianatan
- `alliance` - Aliansi
- `murder` - Pembunuhan
- `rescue` - Penyelamatan
- `theft` - Pencurian
- `discovery` - Penemuan
- `breakthrough` - Breakthrough kultivasi
- `death` - Kematian
- `romance` - Romansa
- `grudge` - Dendam
- `favor` - Hutang budi
- `sect_event` - Event sect
- `treasure` - Harta karun
- `technique_learned` - Belajar teknik
- `item_obtained` - Mendapat item
- `location_discovered` - Menemukan lokasi
- `npc_met` - Bertemu NPC
- `quest_completed` - Quest selesai
- `other` - Lainnya

---

## Importance Levels

### 5 Level Kepentingan
- `critical` (9-10) - Event yang mengubah hidup (breakthrough, kematian, pengkhianatan besar)
- `important` (7-8) - Event signifikan (combat penting, aliansi, teknik baru)
- `moderate` (5-6) - Event notable (interaksi NPC, item bagus, lokasi baru)
- `minor` (3-4) - Event biasa (interaksi NPC reguler, item biasa)
- `trivial` (1-2) - Event tidak penting (jangan simpan ini)

---

## Emotion Types

### 13 Tipe Emosi
- `joy` - Kegembiraan
- `anger` - Kemarahan
- `fear` - Ketakutan
- `sadness` - Kesedihan
- `disgust` - Jijik
- `surprise` - Kejutan
- `pride` - Kebanggaan
- `shame` - Malu
- `guilt` - Rasa bersalah
- `gratitude` - Rasa terima kasih
- `hatred` - Kebencian
- `love` - Cinta
- `neutral` - Netral

---

## Memory Callbacks

### 5 Tipe Callback
- `revenge` - NPC balas dendam untuk tindakan masa lalu
- `gratitude` - NPC berterima kasih untuk kebaikan masa lalu
- `recognition` - NPC mengenali player dari reputasi
- `reputation` - Fame/infamy mempengaruhi interaksi
- `consequence` - Konsekuensi dari tindakan masa lalu

---

## Tips & Best Practices

### Untuk Player
1. **Browse regularly** - Lihat memory panel secara berkala untuk mengenang perjalanan
2. **Use search** - Gunakan search untuk menemukan event spesifik
3. **Check critical** - Filter by critical untuk melihat event terpenting
4. **Watch retrieval count** - Memory dengan retrieval tinggi sering direferensi AI

### Untuk Developer
1. **Store important events only** - Jangan simpan event trivial
2. **Use proper event types** - Pilih tipe yang paling sesuai
3. **Score importance correctly** - Gunakan skala 1-10 dengan bijak
4. **Add relevant tags** - Tags membantu search dan filtering
5. **Include NPCs** - Selalu list NPC yang terlibat
6. **Set emotion** - Emotion menambah depth pada memory

---

## Troubleshooting

### Memory tidak muncul
- Cek apakah migration sudah dijalankan
- Cek apakah pgvector extension sudah enabled
- Cek console untuk error

### Search tidak bekerja
- Pastikan keyword extraction berfungsi
- Cek apakah embeddings tersimpan
- Coba search dengan kata yang lebih spesifik

### AI tidak reference memory
- Cek apakah memory context terkirim ke AI
- Cek similarity threshold (default 0.3)
- Cek apakah memory cukup relevan

---

## Performance Tips

### Optimasi Query
```typescript
// Gunakan limit untuk membatasi hasil
const results = await MemoryService.queryMemories({
  characterId: character.id,
  queryText: 'combat',
  limit: 10, // Jangan terlalu besar
  similarityThreshold: 0.3
});
```

### Optimasi Storage
```typescript
// Batch store jika menyimpan banyak memory
const memories = [...]; // Array of memories
for (const memory of memories) {
  await MemoryService.storeMemory(memory);
}
```

---

## File Locations

### Source Files
- Types: `src/types/memory.ts`
- Service: `src/services/memoryService.ts`
- UI: `src/components/MemoryPanel.tsx`
- Integration: `src/components/GameScreen.tsx`

### Database
- Migration: `supabase/migrations/20260109000006_create_memory_events.sql`
- Table: `memory_events`

### Documentation
- Phase 1: `MEMORY_SYSTEM_PHASE1.md`
- Phase 2: `MEMORY_SYSTEM_PHASE2_COMPLETE.md`
- Phase 3: `MEMORY_SYSTEM_PHASE3_COMPLETE.md`
- Summary: `SESSION_MEMORY_SYSTEM_COMPLETE.md`
- Ringkasan: `RINGKASAN_MEMORY_SYSTEM.md`
- Quick Start: `MEMORY_SYSTEM_QUICK_START.md` (file ini)

---

## Support

### Jika Ada Masalah
1. Cek dokumentasi lengkap di file-file di atas
2. Cek console browser untuk error
3. Cek Supabase logs untuk database error
4. Cek TypeScript diagnostics

### Jika Butuh Enhancement
1. Lihat "Future Enhancements" di `SESSION_MEMORY_SYSTEM_COMPLETE.md`
2. Sistem sudah extensible dan mudah dikembangkan
3. Semua code terdokumentasi dengan baik

---

**Status**: PRODUCTION READY ✅
**Version**: 1.0.0
**Last Updated**: January 9, 2026
