# Legality Workflow Management Platform: Documentation Index

Dokumen ini adalah single source of truth untuk membangun platform manajemen workflow legalitas PT dan CV.

| Atribut | Nilai |
|---|---|
| Versi | 1.0.0 |
| Tanggal | 2026-09-19 |
| Status | Draft for Review |
| Bahasa UI produk | Bahasa Indonesia |
| Bahasa istilah teknis | Inggris |

## Cara Membaca

1. Baca `00_DISCOVERY_AND_DESIGN.md` untuk hasil analisis requirement (Phase 1 dan 2).
2. Baca `PRD.md` sebagai dokumen induk requirement.
3. Buka dokumen modul untuk detail teknis.
4. Baca `CONSISTENCY_AUDIT.md` untuk konflik yang sudah diselesaikan (Phase 4).
5. Baca `DEVELOPMENT_READINESS.md` sebelum sprint pertama (Phase 5).

## Aturan Otoritas Dokumen

Jika dua dokumen berbeda, gunakan urutan otoritas berikut:

1. `BUSINESS_RULES.md` (enumerasi kanonik dan aturan bisnis)
2. `STATE_MACHINE.md` (transisi status)
3. `DATABASE_SCHEMA.md` (struktur data)
4. `PRD.md` (requirement)
5. Dokumen modul lain

## Penanda Status

| Tag | Arti |
|---|---|
| `ASSUMPTION` | Asumsi kerja. Berlaku sampai dibantah. |
| `OPEN QUESTION` | Pertanyaan terbuka. Tidak memblokir development. |
| `TBD` | Nilai belum ditentukan. |
| `REQUIRES BUSINESS DECISION` | Butuh keputusan owner atau management. |
| `LEGAL_REVIEW_REQUIRED` | Butuh konfirmasi konsultan hukum atau notaris. |
| `TECHNICAL_VALIDATION_REQUIRED` | Butuh proof of concept atau verifikasi provider. |

## Konvensi ID

| Prefix | Arti | Contoh |
|---|---|---|
| `FR-<DOMAIN>-NNN` | Functional requirement | FR-SLA-003 |
| `NFR-<AREA>-NNN` | Non-functional requirement | NFR-SEC-002 |
| `BR-<DOMAIN>-NNN` | Business rule | BR-DOC-004 |
| `US-NNN` | User story | US-007 |
| `AC-NNN` | Acceptance criteria | AC-012 |
| `EC-NN` | Edge case | EC-05 |
| `TC-NNN` | Test case | TC-031 |
| `A-NNN` | Assumption | A-004 |
| `Q-NNN` | Open question | Q-002 |
| `ADR-NNN` | Architecture decision | ADR-003 |
| `K-NN` | Konflik atau ambiguitas | K-01 |

## Daftar Dokumen

| # | File | Isi |
|---|---|---|
| 0 | 00_DISCOVERY_AND_DESIGN.md | Phase 1 discovery dan Phase 2 design |
| 1 | PRD.md | Dokumen induk requirement |
| 2 | PRODUCT_OVERVIEW.md | Visi, nilai per role, glossary |
| 3 | USER_ROLES.md | Definisi role dan scope data |
| 4 | USER_FLOWS.md | 12 diagram alur (Mermaid) |
| 5 | BUSINESS_RULES.md | Enumerasi kanonik dan aturan bisnis |
| 6 | WORKFLOW.md | Workflow engine, template PT dan CV |
| 7 | STATE_MACHINE.md | Transition matrix semua entitas |
| 8 | SLA_ENGINE.md | Business calendar, clock, health |
| 9 | ESCALATION_ENGINE.md | Level, aturan, lifecycle eskalasi |
| 10 | NOTIFICATION_SYSTEM.md | Channel, tipe, fallback |
| 11 | DOCUMENT_MANAGEMENT.md | Pipeline dokumen dan verifikasi |
| 12 | WHATSAPP_INTEGRATION.md | Proxy komunikasi dan routing |
| 13 | PAYMENT_SYSTEM.md | Order, pembayaran, webhook, refund |
| 14 | DATABASE_SCHEMA.md | Logical schema dan constraint |
| 15 | ERD.md | Conceptual dan logical ERD |
| 16 | API_SPECIFICATION.md | Kontrak REST API |
| 17 | AUTHORIZATION.md | RBAC dan permission matrix |
| 18 | SECURITY.md | Kontrol keamanan dan threat model |
| 19 | PRIVACY.md | Pelindungan data pribadi |
| 20 | EVENT_ARCHITECTURE.md | Event, outbox, background jobs |
| 21 | (dihapus, duplikat #10) | Lihat NOTIFICATION_SYSTEM.md |
| 22 | AUDIT_LOG.md | Audit trail |
| 23 | UX_SPECIFICATION.md | UX per role |
| 24 | DESIGN_SYSTEM.md | Token dan komponen |
| 25 | ANALYTICS.md | Definisi metrik |
| 26 | AI_FEATURES.md | Batas dan desain fitur AI |
| 27 | ERROR_HANDLING.md | Kode error dan retry |
| 28 | EDGE_CASES.md | 31 edge case (EC-01 sampai EC-31) |
| 29 | TESTING_STRATEGY.md | Strategi dan skenario uji |
| 30 | DEPLOYMENT.md | Topologi dan pipeline rilis |
| 31 | ENVIRONMENT_VARIABLES.md | Konfigurasi environment |
| 32 | INTEGRATION_SPECIFICATION.md | Interface provider |
| 33 | IMPLEMENTATION_PLAN.md | Phase 0 sampai 14 |
| 34 | MVP_SCOPE.md | Prioritas P0 sampai P3 |
| 35 | FUTURE_ROADMAP.md | Rencana pasca-MVP |
| 36 | ASSUMPTIONS.md | Asumsi dan pertanyaan terbuka |
| 37 | SYSTEM_ARCHITECTURE.md | Arsitektur baseline |
| 38 | RISK_ENGINE.md | Operational Risk Score |
| 39 | OBSERVABILITY.md | Log, metrik, alert |
| 40 | CONSISTENCY_AUDIT.md | Phase 4 audit silang |
| 41 | DEVELOPMENT_READINESS.md | Phase 5 readiness report |
