# Deployment

## 1. Environment

| Env | Tujuan | Data |
|---|---|---|
| local | Development | Docker Compose, fake provider |
| staging | QA dan UAT | Data sintetis, sandbox provider |
| production | Operasional | Data nyata |

## 2. Topologi Production (Baseline)

| Komponen | Deployment | Skala awal |
|---|---|---|
| web (Next.js) | Container, managed container platform region Jakarta | 2 instance |
| api (NestJS) | Container | 2 instance |
| worker | Container | 2 instance (concurrency per queue dikonfigurasi) |
| scheduler | Bagian dari worker dengan leader lock | 1 aktif |
| clamav | Container internal | 1 instance |
| PostgreSQL | Managed, high availability, PITR aktif | 1 primary + standby |
| Redis | Managed, persistence AOF | 1 node + replika (TBD) |
| Object storage | Managed S3-compatible, versioning aktif | |
| CDN/WAF | Di depan web dan api | |

Kubernetes tidak dipakai pada MVP. Managed container platform cukup dan lebih murah dioperasikan.

`REQUIRES BUSINESS DECISION`: pilihan cloud provider. Syarat: region Indonesia, managed PostgreSQL dengan PITR, KMS, object storage.

## 3. CI/CD

```text
Push PR -> lint, typecheck, unit, integration (Testcontainers), permission tests, SAST, dependency scan
Merge main -> build image (tag commit SHA) -> deploy staging -> migrasi -> E2E smoke
Release tag -> approval manual -> migrasi production -> deploy rolling -> smoke test -> monitor 30 menit
```

## 4. Migrasi Database

- Migrasi bersifat expand-then-contract. Kolom baru ditambah dulu, kode lama tetap jalan, kolom lama dihapus di rilis berikutnya.
- Migrasi dijalankan sebagai job terpisah sebelum rollout.
- Rollback kode tidak menjalankan down-migration otomatis.

## 5. Backup dan Disaster Recovery

| Target | Nilai | Alasan |
|---|---|---|
| RPO database | <= 15 menit | PITR managed PostgreSQL mendukung, kehilangan data pembayaran dan dokumen berdampak tinggi |
| RTO | <= 4 jam | Tim kecil, single region, prosedur restore terdokumentasi |
| Backup database | PITR + snapshot harian, retensi 30 hari | TBD retensi final (LEGAL_REVIEW_REQUIRED) |
| Backup storage | Versioning + replikasi bucket | |
| Uji restore | Setiap 3 bulan | Backup tanpa uji restore tidak dapat dipercaya |

Nilai RPO dan RTO adalah titik awal. `TBD: Requires business validation`.

## 6. Rilis Aman

Feature flag untuk: auto-verify dokumen, AI classifier, WhatsApp relay, auto-confirm Notary. Semua dimatikan saat go-live lalu diaktifkan bertahap.
