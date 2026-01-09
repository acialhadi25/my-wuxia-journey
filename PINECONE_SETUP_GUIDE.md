# Panduan Setup Pinecone untuk Memory System

## Status Saat Ini

✅ **API Key sudah ada** di `.env`
❌ **Index belum dibuat** - perlu dibuat di dashboard

---

## Langkah-Langkah Setup

### 1. Buat Index di Pinecone Dashboard

**Lokasi**: Dashboard Pinecone → Sidebar kiri → **"Indexes"**

#### Klik "Create Index"

Isi form dengan nilai berikut:

| Field | Value | Penjelasan |
|-------|-------|------------|
| **Name** | `wuxia-memories` | Nama index untuk memory system |
| **Dimensions** | `1536` | Ukuran vector untuk OpenAI embeddings |
| **Metric** | `cosine` | Metrik untuk similarity search |
| **Cloud Provider** | `AWS` atau `GCP` | Pilih yang tersedia |
| **Region** | `us-east-1` | Pilih yang terdekat dengan user |

#### Klik "Create Index"

Tunggu beberapa menit sampai index selesai dibuat (status: Ready).

---

### 2. Catat Informasi Index

Setelah index dibuat, catat informasi berikut:

1. **Index Name**: `wuxia-memories` (yang Anda buat)
2. **Environment**: Contoh: `us-east-1-aws` atau `gcp-starter`
3. **Index Host**: Contoh: `wuxia-memories-xxxxx.svc.pinecone.io`

---

### 3. Update File .env

Buka file `.env` dan uncomment + isi nilai berikut:

```env
# Pinecone Vector Database Configuration
VITE_PINECONE_API_KEY="pcsk_4o3rWc_7TZbpmZprMTKiZaQM333WxFr1gAaQFNanavKxRFw4QBww4gvPw2imU5rWkCkUui"
VITE_PINECONE_INDEX_NAME="wuxia-memories"  # Nama index yang dibuat
VITE_PINECONE_ENVIRONMENT="us-east-1-aws"  # Environment dari dashboard
```

**Ganti nilai sesuai dengan yang Anda catat di step 2!**

---

### 4. Update .env.example (Opsional)

Untuk dokumentasi, update juga `.env.example`:

```env
# Pinecone Vector Database Configuration
VITE_PINECONE_API_KEY="your_pinecone_api_key_here"
VITE_PINECONE_INDEX_NAME="wuxia-memories"
VITE_PINECONE_ENVIRONMENT="us-east-1-aws"
```

---

## Verifikasi Setup

### Cek di Dashboard Pinecone

1. Buka **Indexes** di sidebar
2. Pastikan index `wuxia-memories` ada
3. Status harus **"Ready"** (hijau)
4. Dimensions: **1536**
5. Metric: **cosine**

### Cek di Aplikasi

Setelah setup selesai, memory system akan:
- ✅ Menyimpan embeddings ke Pinecone
- ✅ Query similarity search dari Pinecone
- ✅ Retrieval memory lebih akurat

---

## Catatan Penting

### Saat Ini (Tanpa Pinecone)

Memory system menggunakan **fallback hash-based embeddings**:
- ✅ Berfungsi normal
- ⚠️ Similarity search kurang akurat
- ⚠️ Hanya menggunakan keyword matching

### Setelah Setup Pinecone

Memory system akan menggunakan **real vector embeddings**:
- ✅ Similarity search sangat akurat
- ✅ Semantic understanding lebih baik
- ✅ AI dapat menemukan memory yang relevan

---

## Troubleshooting

### Index Creation Failed

**Problem**: Index gagal dibuat
**Solution**: 
- Cek quota di dashboard (Starter plan: 1 index gratis)
- Pastikan nama index unik
- Coba region lain jika gagal

### API Key Invalid

**Problem**: API key tidak valid
**Solution**:
- Generate API key baru di dashboard
- Copy key yang benar ke `.env`
- Restart dev server

### Connection Error

**Problem**: Tidak bisa connect ke Pinecone
**Solution**:
- Cek internet connection
- Pastikan API key benar
- Pastikan index sudah Ready (tidak Initializing)

---

## Alternatif: Tetap Gunakan Fallback

Jika Anda tidak ingin setup Pinecone sekarang, memory system tetap berfungsi dengan fallback:

**Kelebihan**:
- ✅ Tidak perlu setup eksternal
- ✅ Gratis sepenuhnya
- ✅ Sudah berfungsi

**Kekurangan**:
- ⚠️ Similarity search kurang akurat
- ⚠️ Hanya keyword-based matching
- ⚠️ Tidak ada semantic understanding

**Kesimpulan**: Untuk MVP dan testing, fallback sudah cukup. Untuk production dengan banyak user, Pinecone sangat direkomendasikan.

---

## Biaya Pinecone

### Starter Plan (FREE)
- ✅ 1 index gratis
- ✅ 100K vectors
- ✅ 2M queries/month
- ✅ Cukup untuk testing dan small-scale production

### Standard Plan ($70/month)
- Unlimited indexes
- Unlimited vectors
- Unlimited queries
- Production-ready

**Rekomendasi**: Mulai dengan Starter plan (gratis) untuk testing.

---

## Next Steps

### Jika Setup Pinecone Sekarang:
1. ✅ Buat index di dashboard
2. ✅ Update `.env` dengan index info
3. ✅ Restart dev server
4. ✅ Test memory system

### Jika Tidak Setup Sekarang:
1. ✅ Memory system tetap berfungsi dengan fallback
2. ✅ Setup Pinecone nanti saat production
3. ✅ Tidak ada perubahan code diperlukan

---

## Summary

**Yang Sudah Ada**:
- ✅ API Key di `.env`
- ✅ Memory system code ready
- ✅ Fallback embeddings working

**Yang Perlu Dilakukan** (Opsional):
1. Buat index `wuxia-memories` di dashboard
2. Update `.env` dengan index name dan environment
3. Restart dev server

**Status**: Memory system **SUDAH BERFUNGSI** dengan atau tanpa Pinecone! Setup Pinecone hanya untuk meningkatkan akurasi similarity search.

---

**Dibuat**: January 9, 2026
**Status**: OPTIONAL ENHANCEMENT
**Priority**: LOW (system already working with fallback)
