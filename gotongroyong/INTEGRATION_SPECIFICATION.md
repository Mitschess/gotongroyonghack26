# Integration Specification

Semua integrasi eksternal berada di `packages/providers` dan mengimplementasikan interface berikut. Kode domain tidak pernah mengimpor SDK vendor secara langsung.

| Interface | Implementasi MVP | Detail |
|---|---|---|
| PaymentProvider | 1 gateway lokal (TBD) | PAYMENT_SYSTEM.md bagian 3 |
| WhatsAppProvider | WhatsApp Business Platform (langsung atau BSP) | WHATSAPP_INTEGRATION.md bagian 3 |
| EmailProvider | Provider transactional email (TBD) | Di bawah |
| StorageProvider | S3-compatible | Di bawah |
| MalwareScanner | ClamAV | Di bawah |
| DocumentClassifier, OcrExtractor | Opsional | AI_FEATURES.md |
| Clock | System clock, fake clock untuk test | Di bawah |

```ts
interface EmailProvider {
  send(input: { to: string; subject: string; html: string; text: string; tags?: string[] }): Promise<{ providerId: string }>;
  verifyWebhook(headers: Record<string, string>, rawBody: Buffer): boolean;
  parseWebhook(rawBody: Buffer): { providerId: string; status: 'DELIVERED' | 'BOUNCED' | 'COMPLAINED' }[];
}

interface StorageProvider {
  presignPut(key: string, opts: { contentType: string; contentLength: number; ttlSeconds: number }): Promise<string>;
  presignGet(key: string, opts: { ttlSeconds: number; downloadName: string }): Promise<string>;
  head(key: string): Promise<{ size: number; contentType: string } | null>;
  getStream(key: string): Promise<Readable>;
  move(fromKey: string, toKey: string): Promise<void>;
  deleteAllVersions(key: string): Promise<void>;
}

interface MalwareScanner {
  scan(stream: Readable): Promise<{ result: 'CLEAN' | 'INFECTED' | 'ERROR'; signature?: string }>;
}

interface Clock { now(): Date; }
```

## Aturan Adapter

| Aturan | Detail |
|---|---|
| INT-001 | Setiap adapter memetakan status vendor ke enum kanonik |
| INT-002 | Setiap call keluar punya timeout (default 10 detik) dan circuit breaker |
| INT-003 | Raw request dan response disimpan redacted untuk debugging selama 14 hari |
| INT-004 | Adapter menyediakan fake implementation untuk test |
| INT-005 | Penggantian provider tidak mengubah skema database kecuali kolom `provider` |

## Checklist Validasi Provider (TECHNICAL_VALIDATION_REQUIRED)

| Provider | Hal yang wajib divalidasi |
|---|---|
| Payment | Metode tersedia, skema signature webhook, API status query, perilaku retry webhook, laporan settlement, sandbox |
| WhatsApp | Proses verifikasi bisnis, biaya, template approval, jendela layanan, batas kirim, retensi media, skema signature |
| Email | Domain authentication (SPF, DKIM, DMARC), webhook bounce |
| Storage | Region, SSE, versioning, lifecycle, object lock |
| AI | Lokasi pemrosesan, kebijakan penggunaan data, akurasi pada sampel |
