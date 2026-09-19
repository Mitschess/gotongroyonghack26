# Operational Risk Score

Skor ini mengukur risiko operasional keterlambatan. Skor ini bukan penilaian risiko hukum.

## 1. Formula

```text
score = min(100, round(30*S_sla + 20*S_docs + 15*S_client + 15*S_notary + 5*S_admin + 10*S_block + 5*S_pay))
```

| Faktor | Definisi (nilai 0 sampai 1) |
|---|---|
| S_sla | `min(1, project_elapsed_bd / project_target_bd)`. 0 sebelum Project Clock mulai. |
| S_docs | Dokumen wajib stage aktif yang belum VERIFIED dibagi total dokumen wajib stage aktif |
| S_client | Jika `blocked_on = CLIENT`: `min(1, client_idle_bd / 3)`. Selain itu 0. |
| S_notary | Jika `blocked_on = NOTARY`: `min(1, notary_idle_bd / 2)`. Selain itu 0. |
| S_admin | Jika `blocked_on = ADMIN`: `min(1, admin_idle_bh / 8)`. Selain itu 0. |
| S_block | 1 jika ada dokumen NEEDS_REVIEW lebih dari 4 business hours, pesan tanpa project, atau delivery FAILED. Selain itu 0. |
| S_pay | 1 jika ada permintaan refund atau selisih nominal pembayaran. Selain itu 0. |

`idle` = business time sejak aktivitas terakhir pihak tersebut pada project (upload, pesan, aksi task).

## 2. Level

| Skor | Level |
|---|---|
| 0 sampai 24 | LOW |
| 25 sampai 49 | MEDIUM |
| 50 sampai 74 | HIGH |
| 75 sampai 100 | CRITICAL |

## 3. Relasi dengan Health

| Indikator | Sumber | Pemakaian |
|---|---|---|
| Health | Waktu saja | Warna status, pemicu eskalasi |
| Risk Score | Komposit | Urutan prioritas, dashboard risiko |

Risk Score tidak memicu eskalasi di MVP. Ini mencegah dua mekanisme eskalasi yang saling tumpang tindih.

## 4. Operasional

- Job `risk.compute` berjalan setiap 15 menit dan setelah event `task.completed`, `document.verified`, `message.received`.
- Hasil disimpan di `projects.risk_score`, `projects.risk_level`, dan snapshot harian di `risk_snapshots`.
- Bobot dan batas adalah `ASSUMPTION A-012`. Kalibrasi dengan data 3 bulan: bandingkan skor Day 2 terhadap breach aktual.
