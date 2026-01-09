# OpenAI Setup Guide (Optional)

## Status: OPTIONAL - Untuk Meningkatkan Akurasi Embeddings

Memory system **SUDAH BERFUNGSI** tanpa OpenAI menggunakan fallback hash-based embeddings. Setup ini **OPSIONAL** untuk meningkatkan akurasi similarity search.

---

## Kapan Perlu OpenAI?

### Gunakan Fallback (Sekarang) ✅
- Testing dan development
- MVP dan small-scale production
- Budget terbatas
- Keyword-based search sudah cukup

### Upgrade ke OpenAI (Nanti) 🚀
- Production dengan banyak user
- Butuh semantic search yang sangat akurat
- AI perlu memahami context dan meaning
- Ada budget untuk API costs (~$0.02 per 1M tokens)

---

## Cara Setup OpenAI (Nanti)

### Step 1: Dapatkan API Key

1. **Daftar di OpenAI**
   - Buka: https://platform.openai.com
   - Sign up atau login

2. **Buat API Key**
   - Klik profile → "API keys"
   - Klik "Create new secret key"
   - Copy key (format: `sk-...`)
   - **SIMPAN KEY INI!** (tidak bisa dilihat lagi)

3. **Top Up Balance** (Opsional)
   - Minimum: $5
   - Untuk testing: $5-10 sudah cukup lama
   - Untuk production: sesuaikan dengan usage

### Step 2: Update .env

Buka file `.env` dan uncomment + isi OpenAI API key:

```env
# OpenAI Configuration (Optional - for better embeddings)
VITE_OPENAI_API_KEY="sk-your-actual-api-key-here"
```

**Ganti `sk-your-actual-api-key-here` dengan API key yang Anda dapat!**

### Step 3: Restart Dev Server

```bash
# Stop dev server (Ctrl+C)
npm run dev
```

### Step 4: Test

Memory system akan otomatis:
- ✅ Detect OpenAI API key
- ✅ Generate embeddings menggunakan OpenAI
- ✅ Store ke Pinecone dengan vector embeddings
- ✅ Similarity search lebih akurat

---

## Perbandingan

### Fallback Hash-Based (Sekarang)

**Cara Kerja**:
```typescript
// Simple hash dari text
function hashEmbedding(text: string): number[] {
  const hash = simpleHash(text);
  return convertToVector(hash); // 1536 dimensions
}
```

**Search Example**:
```
Query: "Elder Zhao"
Matches:
  ✅ "Defeated Elder Zhao" (exact match)
  ✅ "Elder Zhao seeks revenge" (exact match)
  ❌ "Old man at sect" (no match - different words)
```

**Pros**:
- ✅ Gratis
- ✅ Cepat
- ✅ Tidak perlu API key

**Cons**:
- ⚠️ Hanya keyword matching
- ⚠️ Tidak semantic understanding

### OpenAI Embeddings (Setelah Setup)

**Cara Kerja**:
```typescript
// Real vector embeddings dari OpenAI
async function openaiEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text
  });
  return response.data[0].embedding; // 1536 dimensions
}
```

**Search Example**:
```
Query: "old man at sect"
Matches:
  ✅ "Defeated Elder Zhao" (semantic match - elder = old man)
  ✅ "Elder Zhao seeks revenge" (semantic match)
  ✅ "Old man at sect" (exact match)
  ✅ "Met sect elder" (semantic match)
```

**Pros**:
- ✅ Semantic understanding
- ✅ Sangat akurat
- ✅ AI lebih pintar

**Cons**:
- ❌ Ada biaya (~$0.02 per 1M tokens)
- ❌ Perlu API key

---

## Biaya Estimasi

### OpenAI Embeddings Pricing

**Model**: `text-embedding-3-small`
**Price**: $0.02 per 1M tokens

**Estimasi Usage**:
```
1 memory = ~200 tokens (rata-rata)
1000 memories = 200,000 tokens = $0.004 (~Rp 64)
10,000 memories = 2M tokens = $0.04 (~Rp 640)
100,000 memories = 20M tokens = $0.40 (~Rp 6,400)
```

**Kesimpulan**: Sangat murah! $5 bisa untuk ~125,000 memories.

---

## Code Changes (Automatic)

Memory system sudah siap untuk OpenAI! Tidak perlu ubah code.

### Detection Logic (Already Implemented)

```typescript
// In memoryService.ts
async function generateEmbedding(text: string): Promise<number[]> {
  // Check if OpenAI API key exists
  if (import.meta.env.VITE_OPENAI_API_KEY) {
    // Use OpenAI embeddings
    return await generateOpenAIEmbedding(text);
  } else {
    // Use fallback hash-based embeddings
    return generateHashEmbedding(text);
  }
}
```

**Automatic Switching**:
- Jika ada `VITE_OPENAI_API_KEY` → Gunakan OpenAI
- Jika tidak ada → Gunakan fallback
- Tidak perlu ubah code!

---

## Testing

### Setelah Setup OpenAI

1. **Restart dev server**
2. **Create new character**
3. **Generate memories**
4. **Test semantic search**:
   ```
   Search: "old cultivator"
   Should find: "Elder Zhao", "Sect Master", etc.
   ```

### Verify OpenAI Usage

**Check Console**:
```
✅ OpenAI API key detected
✅ Generating embeddings with OpenAI
✅ Embedding generated: 1536 dimensions
✅ Stored to Pinecone
```

**Check Pinecone Dashboard**:
- Record count bertambah
- Vectors tersimpan dengan benar

---

## Troubleshooting

### API Key Invalid

**Problem**: OpenAI API key tidak valid
**Solution**:
1. Cek format key (harus `sk-...`)
2. Cek key tidak expired
3. Generate key baru jika perlu

### Insufficient Balance

**Problem**: OpenAI balance habis
**Solution**:
1. Top up balance di OpenAI dashboard
2. Minimum $5
3. Set usage limits untuk kontrol budget

### Rate Limit Error

**Problem**: Too many requests
**Solution**:
1. OpenAI free tier: 3 requests/minute
2. Paid tier: 3,500 requests/minute
3. Add retry logic (already implemented)

---

## Monitoring

### OpenAI Dashboard

**URL**: https://platform.openai.com/usage

**Metrics**:
- Total requests
- Total tokens used
- Cost per day/month
- Remaining balance

### Set Budget Limits

1. Buka OpenAI dashboard
2. Settings → Billing → Usage limits
3. Set hard limit (contoh: $10/month)
4. Get email alert saat mendekati limit

---

## Rollback to Fallback

Jika ingin kembali ke fallback (gratis):

1. **Comment out OpenAI key** di `.env`:
   ```env
   # VITE_OPENAI_API_KEY="sk-..."
   ```

2. **Restart dev server**

3. **Done!** Memory system otomatis pakai fallback

---

## Best Practices

### Development
- ✅ Gunakan fallback (gratis)
- ✅ Test dengan keyword search
- ✅ Simpan OpenAI untuk production

### Staging
- ✅ Test OpenAI dengan budget kecil ($5)
- ✅ Verify semantic search works
- ✅ Monitor usage dan cost

### Production
- ✅ Gunakan OpenAI untuk best experience
- ✅ Set usage limits
- ✅ Monitor cost regularly
- ✅ Optimize queries untuk efisiensi

---

## Summary

**Sekarang**:
- ✅ Placeholder sudah ada di `.env`
- ✅ Memory system works dengan fallback
- ✅ Siap untuk upgrade kapan saja

**Nanti** (Saat Ada Budget):
1. Daftar OpenAI
2. Dapatkan API key
3. Uncomment dan isi di `.env`
4. Restart dev server
5. Enjoy semantic search! 🚀

**Status**: READY FOR FUTURE UPGRADE ✅

---

**Created**: January 9, 2026
**Priority**: LOW (optional enhancement)
**Cost**: ~$0.02 per 1M tokens
**Benefit**: Much better similarity search accuracy
