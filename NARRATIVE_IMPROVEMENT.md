# Peningkatan Kualitas Narasi AI

## Masalah Sebelumnya
Narasi AI terlalu singkat dan terputus-putus:
- Adegan langsung loncat tanpa transisi
- Kurang deskriptif dan detail
- Tidak menunjukkan proses, hanya hasil
- Terasa seperti summary, bukan cerita yang mengalir

**Contoh Narasi Buruk:**
```
"You practiced the technique. You got stronger."
```

## Solusi yang Diimplementasikan

### 1. Enhanced System Prompt dengan Panduan Narasi

Menambahkan **5 Prinsip Utama** untuk gaya narasi:

#### A. FLOWING NARRATIVE (Narasi Mengalir)
- Setiap scene harus mengalir natural dari aksi sebelumnya
- TIDAK ada lompatan scene atau time skip tanpa transisi
- Menunjukkan perjalanan, bukan hanya tujuan
- Koneksi: aksi player → reaksi langsung → konsekuensi → situasi baru

#### B. RICH DESCRIPTIONS (Deskripsi Kaya)
- Detail sensori: apa yang karakter lihat, dengar, rasakan, cium
- Detail lingkungan: cuaca, pencahayaan, atmosfer
- Emosi dan sensasi fisik karakter
- Metafora dan simile dari sastra Tiongkok

#### C. SHOW, DON'T TELL (Tunjukkan, Jangan Beritahu)
Contoh transformasi:
- ❌ "He practiced the fist technique"
- ✅ "His fists cut through the cold night air, each punch accompanied by the whistle of wind. Sweat dripped from his brow as he repeated the sequence—step, pivot, strike—feeling the crude power building in his meridians with each repetition."

#### D. CONTINUOUS FLOW (Alur Berkelanjutan)
- Mulai dari akhir aksi terakhir
- Tunjukkan transisi antar momen
- Bangun tension secara bertahap
- Akhiri dengan hook natural untuk pilihan berikutnya

#### E. IMMERSIVE DETAILS (Detail Imersif)
- NPC punya kepribadian, motivasi, dan reaksi
- Lokasi punya atmosfer dan sejarah
- Teknik punya efek visual dan sensasi fisik
- Kultivasi punya efek nyata pada tubuh dan spirit

### 2. Template Struktur Narasi

```
1. OPENING (2-3 kalimat): 
   - Set scene dengan detail sensori
   - Koneksi ke aksi sebelumnya

2. ACTION UNFOLDS (4-6 kalimat):
   - Tunjukkan karakter melakukan aksi step-by-step
   - Detail kaya dan deskriptif

3. IMMEDIATE CONSEQUENCES (2-3 kalimat):
   - Sensasi fisik
   - Reaksi emosional
   - Respons lingkungan

4. OUTCOME & HOOK (1-2 kalimat):
   - Nyatakan hasil
   - Hint apa yang akan terjadi selanjutnya
```

### 3. Panduan Detail Sensori

**Visual:**
- "Moonlight painted silver streaks across the training yard"
- "His eyes blazed with golden light"

**Sound:**
- "The whistle of wind through his fists"
- "Distant thunder rumbled like an angry dragon"

**Touch:**
- "Cold sweat trickled down his spine"
- "Qi burned through his meridians like liquid fire"

**Smell:**
- "The acrid scent of burnt incense"
- "Fresh blood mixed with the earthy smell of rain"

**Emotion:**
- "Pride swelled in his chest"
- "Humiliation burned hotter than any flame"

### 4. Frasa Transisi

Untuk menghubungkan scene dengan smooth:
- "As the last echoes faded..."
- "In that moment..."
- "Without hesitation..."
- "The night deepened as..."
- "Hours passed in focused concentration..."
- "Just as he completed the movement..."
- "Before he could react..."

### 5. Peningkatan Teknis

**Panjang Narasi:**
- Sebelumnya: 2-4 kalimat, max 150 kata
- Sekarang: 150-250 kata dengan detail kaya

**Max Tokens:**
- Sebelumnya: 2500 tokens
- Sekarang: 3500 tokens (untuk narasi lebih panjang)

**Gaya Penulisan:**
- Menggunakan gaya Chinese web novel
- Bahasa puitis dan dramatis
- Setiap momen terasa sinematik dan imersif

## Contoh Perbandingan

### ❌ SEBELUM (Buruk):
```
"You practiced the Mountain-Shattering Fist in secret. 
Your technique improved. Strength +1, Agility +1."
```

### ✅ SESUDAH (Bagus):
```
"Under the pale moonlight filtering through bamboo leaves, you retreated 
to the secluded grove behind the outer disciples' quarters. The night air 
was crisp, carrying the scent of pine and distant incense from the main 
hall. You recalled Senior Brother Zhang's movements—the way his feet 
pivoted, how his waist twisted to generate explosive force, the precise 
angle of his fist at impact. 

Your first attempt was clumsy, your stance too wide, but you persisted. 
Again and again, you threw the punch, feeling the burn in your shoulders, 
the strain in your legs. Sweat soaked through your robes despite the cold. 
By the fiftieth repetition, something began to shift. Your body remembered 
the rhythm. Your fist cut through the air with a sharp whistle.

By the hundredth repetition, you felt it—a faint stirring of qi in your 
dantian, crude and unrefined, but undeniably there. Your muscles screamed 
in protest, but a fierce satisfaction burned in your chest. This was just 
the beginning. The path of cultivation had opened before you, one painful 
punch at a time."
```

## Hasil yang Diharapkan

1. **Narasi Lebih Panjang**: 150-250 kata per response
2. **Detail Sensori Kaya**: Setiap scene punya visual, sound, touch, smell
3. **Alur Mengalir**: Tidak ada lompatan scene tiba-tiba
4. **Proses Ditunjukkan**: Bukan hanya hasil, tapi bagaimana prosesnya
5. **Imersif**: Player merasa benar-benar ada di dunia Wuxia
6. **Dramatis**: Gaya Chinese web novel yang epik dan puitis

## File yang Dimodifikasi

- `src/services/deepseekService.ts`
  - Enhanced WUXIA_SYSTEM_PROMPT dengan 5 prinsip narasi
  - Template struktur narasi
  - Panduan detail sensori
  - Frasa transisi
  - Contoh narasi yang baik
  - Increased max_tokens dari 2500 → 3500
  - Enhanced user message dengan contoh konkret

## Testing

Untuk menguji peningkatan:
1. Buat karakter baru atau lanjutkan game
2. Pilih aksi apapun (misal: "Practice the technique")
3. Perhatikan narasi yang dihasilkan:
   - Apakah panjangnya 150-250 kata?
   - Apakah ada detail sensori (visual, sound, touch, smell)?
   - Apakah alurnya mengalir tanpa lompatan?
   - Apakah proses ditunjukkan, bukan hanya hasil?
   - Apakah terasa imersif dan dramatis?

## Catatan

- AI sekarang akan menghasilkan narasi yang lebih panjang dan detail
- Setiap aksi akan terasa lebih sinematik dan imersif
- Transisi antar scene akan lebih smooth
- Gaya penulisan mengikuti Chinese web novel (dramatis, puitis, epik)
- Response time mungkin sedikit lebih lama karena narasi lebih panjang
