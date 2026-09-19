# Notification System

## 1. Arsitektur

```text
Domain event -> Notification rules -> notifications (1 per recipient) -> notification_deliveries (1 per channel)
-> queue per channel -> ChannelProvider -> delivery status
```

```ts
interface NotificationChannel {
  code: 'IN_APP' | 'WHATSAPP' | 'EMAIL' | 'PUSH';
  send(delivery: NotificationDelivery): Promise<{ providerId?: string }>;
}
```

In-app selalu dibuat. Channel lain ditentukan oleh rules dan preferensi user.

## 2. Tipe dan Channel Default

| Tipe | Penerima | In-app | WhatsApp | Email | Catatan |
|---|---|---|---|---|---|
| TASK_ASSIGNED | Owner | Ya | Ya | Tidak | |
| TASK_COMPLETED | Admin (digest) | Ya | Tidak | Tidak | |
| DOCUMENT_UPLOADED | Pihak terkait | Ya | Ya | Tidak | Link portal, bukan file |
| DOCUMENT_NEEDS_REVIEW | Primary admin | Ya | Tidak | Tidak | Masuk Today's Actions |
| PAYMENT_RECEIVED | Client | Ya | Ya | Ya | Receipt terlampir di email |
| PAYMENT_FAILED | Client | Ya | Ya | Ya | |
| REMINDER | Owner task | Ya | Ya | Ya (Client) | Sesuai SLA policy |
| SLA_WARNING | Admin | Ya | Tidak | Tidak | |
| SLA_BREACH | Admin, Super Admin | Ya | Ya | Ya | |
| ESCALATION | Sesuai level | Ya | Ya | Ya | |
| PROJECT_COMPLETED | Admin, Super Admin | Ya | Tidak | Tidak | |
| DOCUMENT_DELIVERED | Client | Ya | Ya | Ya | Channel utama delivery |
| DELIVERY_FAILED | Primary admin | Ya | Ya | Tidak | |

## 3. Aturan

| ID | Aturan |
|---|---|
| NOTIF-R01 | Dedup key `type:recipient:entity_id:threshold`. Notifikasi dengan key sama dalam 4 jam diabaikan. |
| NOTIF-R02 | Quiet hours 21:00 sampai 07:00 zona kalender untuk WhatsApp dan email. Pengecualian: ESCALATION L3 (REQUIRES BUSINESS DECISION). |
| NOTIF-R03 | Fallback: WhatsApp FAILED setelah retry menjadi email. Email FAILED dicatat. In-app selalu tersedia. |
| NOTIF-R04 | Notifikasi Client tidak pernah memuat informasi internal (health, eskalasi, catatan internal). |
| NOTIF-R05 | Template notifikasi berversi dan dapat diubah Super Admin. Variabel wajib divalidasi saat simpan. |
| NOTIF-R06 | TASK_COMPLETED untuk Admin dikirim sebagai digest per jam untuk menekan noise. |

## 4. Preferensi

User dapat mematikan channel WhatsApp atau email untuk tipe non-kritis. Tipe kritis tidak dapat dimatikan: PAYMENT_RECEIVED, DOCUMENT_DELIVERED, ESCALATION (internal).

## 5. Retry

| Channel | Retry | Backoff |
|---|---|---|
| WhatsApp | 5 | Eksponensial 30 detik sampai 30 menit |
| Email | 5 | Eksponensial 1 menit sampai 1 jam |
| Push | 3 | 1 menit, 5 menit, 15 menit |
