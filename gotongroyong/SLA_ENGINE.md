# SLA Engine

## 1. Business Calendar

| Parameter | Default | Status |
|---|---|---|
| Timezone | Asia/Jakarta | ASSUMPTION A-005 |
| Hari kerja | Senin sampai Jumat | ASSUMPTION A-006 |
| Jam kerja | 09:00 sampai 17:00 (8 jam) | ASSUMPTION A-006 |
| Hari libur | Tabel `holidays`, diisi Super Admin per tahun (libur nasional dan cuti bersama) | ASSUMPTION A-008 |
| 1 business day | 480 business minutes | Turunan jam kerja |

Kalender disimpan di tabel `business_calendars`. Satu kalender default. Skema mendukung kalender per Notary di masa depan (contoh: Notary di zona WITA).

### Fungsi inti

```ts
businessMinutesBetween(start: Instant, end: Instant, cal: Calendar): number
addBusinessMinutes(start: Instant, minutes: number, cal: Calendar): Instant
```

Aturan:
- Hitung per hari kalender dalam zona kalender.
- Potong interval dengan jam kerja hari itu.
- Lewati weekend dan tanggal di `holidays`.
- Event di luar jam kerja mulai dihitung pada awal jam kerja berikutnya.
- Semua timestamp disimpan dalam UTC (`timestamptz`).

## 2. Dua Clock Resmi

| Clock | Mulai | Berhenti | Pause | Target default |
|---|---|---|---|---|
| Task Clock | Task menjadi OPEN | Task COMPLETED, SKIPPED, CANCELLED | Project ON_HOLD, pause SIGNING_SCHEDULED pada task signing | Per task template |
| Project Clock | Stage DATA_VALIDATION selesai | Project COMPLETED | `blocked_on = CLIENT`, ON_HOLD, EXTERNAL_DEPENDENCY, SIGNING_SCHEDULED | 5 business days |

Resolusi K-01: target "1 hari per tahap" diterapkan sebagai target task internal. Target "5 hari total" diterapkan pada Project Clock yang hanya menghitung waktu proses internal.

`REQUIRES BUSINESS DECISION`: apakah janji 5 hari ke Client dihitung dengan cara yang sama.

## 3. Pause

Interval pause disimpan di tabel `sla_pauses` (`clock_type`, `clock_owner_id`, `reason`, `started_at`, `ended_at`, `created_by`, `note`).

```text
elapsed = businessMinutesBetween(clock_start, now) - Σ businessMinutesBetween(pause.start, pause.end or now)
```

Pause WAITING_CLIENT dibuat dan ditutup otomatis oleh engine saat `blocked_on` berubah. Pause lain dibuat manual dan wajib memiliki alasan (BR-SLA-005).

## 4. Threshold dan Health

Health dihitung dari rasio `r = elapsed / target`.

### Policy Project (`PROJECT_STANDARD_5D`)

| Hari proyek | Rentang elapsed | r | Health | Aksi |
|---|---|---|---|---|
| Day 1 | 0 sampai < 1 bd | < 0.2 | ON_TRACK | Tidak ada |
| Day 2 | 1 sampai < 2 bd | 0.2 sampai < 0.4 | ON_TRACK | Reminder ke primary admin |
| Day 3 | 2 sampai < 3 bd | 0.4 sampai < 0.6 | WARNING | Notif SLA_WARNING ke admin |
| Day 4 | 3 sampai < 4 bd | 0.6 sampai < 0.8 | HIGH_RISK | Notif urgent ke admin dan Notary |
| Day 5 | 4 sampai < 5 bd | 0.8 sampai < 1.0 | CRITICAL | Eskalasi L2_ADMIN |
| Breach | >= 5 bd | >= 1.0 | CRITICAL + `sla_breached` | Eskalasi L3_SUPER_ADMIN, notif SLA_BREACH |

### Policy Task Internal (`*_STANDARD_nH`)

| r | Health | Aksi |
|---|---|---|
| < 0.6 | ON_TRACK | Tidak ada |
| 0.6 sampai < 0.8 | WARNING | Reminder ke owner |
| 0.8 sampai < 1.0 | HIGH_RISK | Reminder ke owner, info ke admin |
| >= 1.0 | CRITICAL + `sla_breached` | Eskalasi (lihat ESCALATION_ENGINE.md) |

### Policy Task Client (`CLIENT_CADENCE`)

| Elapsed | Aksi |
|---|---|
| 1 bd | Reminder ke Client (email dan in-app. WhatsApp template jika `FEATURE_WA_OUTBOUND=true`, P1) |
| 2 bd | Reminder kedua dan follow-up task untuk Admin |
| 3 bd | Reminder ketiga, health task HIGH_RISK di dashboard Admin |
| 5 bd | Notif Admin "Client tidak responsif", usulan ON_HOLD |

Task Client tidak memicu eskalasi ke Super Admin (BR-SLA-004).

## 5. Konfigurasi SLA Policy

```json
{
  "code": "NOTARY_STANDARD_8H",
  "version": 2,
  "target_business_minutes": 480,
  "thresholds": { "warning": 0.6, "high_risk": 0.8, "breach": 1.0 },
  "reminder_at": [0.6, 0.8],
  "escalation": { "l2_after_breach_minutes": 120, "l3_after_breach_minutes": 480 },
  "calendar_code": "DEFAULT"
}
```

Perubahan policy membuat versi baru. Task yang sudah OPEN memakai versi saat task dibuka.

## 6. Job Evaluasi

| Job | Frekuensi | Aksi |
|---|---|---|
| `sla.evaluate` | Setiap 5 menit | Hitung elapsed dan health semua task dan project aktif |
| `reminder.dispatch` | Dipicu perubahan health | Kirim reminder sesuai aturan (nama job kanonik di EVENT_ARCHITECTURE.md) |

Idempotency: engine menyimpan `health`, `last_threshold_crossed`, dan `sla_breached` di baris task atau project. Aksi hanya berjalan saat threshold baru dilewati. Evaluasi berulang tidak menghasilkan notifikasi ganda.

Presisi: jitter maksimal 5 menit dapat diterima. Laporan SLA memakai timestamp transisi aktual, bukan waktu job.

## 7. Pencegahan Salah Hitung

| Risiko | Kontrol |
|---|---|
| Libur belum diisi | Alert ke Super Admin jika tabel holidays untuk tahun berjalan kosong per 1 Desember tahun sebelumnya |
| Perubahan kalender di tengah proyek | Recompute elapsed dari interval tersimpan, bukan dari akumulasi |
| Downtime scheduler | Job menghitung ulang dari timestamp. Tidak ada state yang bergantung pada tick |
| Pause lupa ditutup | Pause manual punya `expected_end_at`. Lewat batas memicu notif Admin |
