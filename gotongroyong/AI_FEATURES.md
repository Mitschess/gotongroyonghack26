# AI Features

## 1. Prinsip

AI adalah helper, bukan sumber kebenaran legal (BR-AI-001). Setiap hasil AI yang berdampak penting dapat diverifikasi manusia.

| Aturan | Detail |
|---|---|
| AI-R01 | AI tidak pernah menyetujui konten dokumen legal-critical |
| AI-R02 | AI tidak pernah mengubah status project |
| AI-R03 | Setiap output AI menyimpan `model`, `model_version`, `confidence`, `input_ref`, `created_at` |
| AI-R04 | Semua fitur AI dapat dimatikan per fitur lewat feature flag tanpa merusak alur manual |
| AI-R05 | Data dikirim ke provider AI hanya jika syarat privasi terpenuhi (PRIVACY.md) |

## 2. Fitur dan Prioritas

| Fitur | Prioritas | Input | Output | Pemakai | Dampak jika salah | Kontrol |
|---|---|---|---|---|---|---|
| Document classification | P1 | Halaman pertama dokumen (gambar atau teks) | Tipe + confidence | Document pipeline | Task salah selesai | Threshold 0.90, gerbang manusia untuk legal-critical, review override rate dipantau |
| OCR KTP untuk prefill | P2 | Foto KTP | Nama, NIK, alamat | Form Client | Data salah di akta | Client dan Admin wajib konfirmasi setiap field |
| Missing document detection | P1 (rule-based) | Slot wajib vs dokumen VERIFIED | Daftar kurang | Client, Admin | Reminder salah | Rule deterministik, bukan AI |
| Message intent detection | P2 | Teks pesan | Intent (pertanyaan status, kirim dokumen, keluhan) | Inbox Admin | Prioritas salah | Hanya label, tidak memicu aksi |
| Message summarization | P3 | Thread project | Ringkasan | Admin, SA | Ringkasan keliru | Label "Ringkasan otomatis", link ke thread asli |
| Project risk detection | P1 (rule-based) | Faktor RISK_ENGINE | Skor | Dashboard | Prioritas salah | Formula transparan |
| Smart follow-up suggestion | P3 | Konteks task | Draft pesan follow-up | Admin | Pesan tidak pas | Admin mengedit sebelum kirim |

Missing document detection dan risk detection sengaja rule-based. Aturan deterministik lebih mudah diaudit dan sudah cukup untuk kebutuhan tersebut.

## 3. Interface

```ts
interface DocumentClassifier {
  classify(input: { versionId: string; mimeType: string; firstPageImage?: Buffer; text?: string }):
    Promise<{ type: DocumentType; confidence: number; model: string; modelVersion: string }>;
}
interface OcrExtractor {
  extractKtp(image: Buffer): Promise<{ fields: Record<string, { value: string; confidence: number }> }>;
}
```

Implementasi MVP classifier: provider LLM multimodal atau OCR + aturan. `TECHNICAL_VALIDATION_REQUIRED`: akurasi pada sampel minimal 200 dokumen nyata yang sudah dianonimkan sebelum fitur diaktifkan.

## 4. Evaluasi

| Metrik | Target awal |
|---|---|
| Precision classifier pada confidence >= 0.90 | >= 98% sebelum auto-verify aktif (TBD setelah uji sampel) |
| Review override rate | Dipantau mingguan. Kenaikan memicu evaluasi ulang threshold. |
