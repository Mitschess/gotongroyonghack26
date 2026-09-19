# Workflow

## 1. Konsep

| Konsep | Penjelasan |
|---|---|
| Workflow template | Definisi stage dan task untuk satu service type. Berversi. |
| Stage template | Tahap berurutan dalam template |
| Task template | Tugas dalam stage, dengan owner role, completion mode, SLA, dependency |
| Project stage | Instansiasi stage template pada satu project |
| Task | Instansiasi task template pada satu project |

Template disimpan di database dan dapat diubah Super Admin. Perubahan membuat versi baru. Project berjalan tetap memakai versi lama (BR-PROJECT-003).

Engine tidak memakai BPMN. Engine memakai DAG sederhana: stage berurutan, task dalam stage boleh paralel, dependency antar task boleh lintas stage.

## 2. Template PT (`PT_STANDARD` v1)

`LEGAL_REVIEW_REQUIRED`: urutan dan nama tahap wajib dikonfirmasi oleh Notaris mitra sebelum go-live. Template ini adalah baseline operasional, bukan pernyataan prosedur hukum.

| # | Stage | Task | Owner | Mode | Evidence / Event | SLA target |
|---|---|---|---|---|---|---|
| 1 | DATA_SUBMISSION | Isi form data perusahaan | CLIENT | EVENT | `company_data.submitted` | Client cadence |
| 1 | DATA_SUBMISSION | Upload KTP setiap pendiri dan pengurus | CLIENT | EVIDENCE | KTP x n | Client cadence |
| 1 | DATA_SUBMISSION | Upload NPWP setiap pendiri | CLIENT | EVIDENCE | NPWP x n | Client cadence |
| 1 | DATA_SUBMISSION | Upload bukti domisili | CLIENT | EVIDENCE | DOMICILE_PROOF | Client cadence |
| 2 | DATA_VALIDATION | Validasi data dan dokumen identitas | ADMIN | EVENT | `data.validated` | 4 business hours |
| 3 | NOTARY_ACCEPTANCE | Konfirmasi usulan Notary | ADMIN | EVENT | `notary.assigned` | 2 business hours |
| 3 | NOTARY_ACCEPTANCE | Terima penugasan | NOTARY | EVENT | `notary.accepted` | 4 business hours |
| 4 | DRAFT_DEED | Upload draft akta pendirian | NOTARY | EVIDENCE | DRAFT_DEED | 8 business hours |
| 5 | CLIENT_DRAFT_REVIEW | Review dan setujui draft | CLIENT | EVENT | `draft.approved` | Client cadence |
| 6 | SIGNING | Jadwalkan penandatanganan | NOTARY | EVENT | `signing.scheduled` | 4 business hours |
| 6 | SIGNING | Upload surat kuasa (kondisional) | NOTARY | EVIDENCE | POWER_OF_ATTORNEY | 8 business hours |
| 6 | SIGNING | Konfirmasi penandatanganan selesai | NOTARY | EVENT | `signing.completed` | Pause SIGNING_SCHEDULED |
| 7 | DEED_FINALIZATION | Upload akta final | NOTARY | EVIDENCE | DEED | 8 business hours |
| 8 | REGISTRATION | Upload bukti pengesahan/pendaftaran | NOTARY | EVIDENCE | REGISTRATION_PROOF | 8 business hours |
| 9 | FINAL_QA | Periksa paket dokumen final | ADMIN | EVENT | `final_qa.approved` | 4 business hours |
| 10 | DELIVERY | Kirim dokumen ke Client | SYSTEM | EVENT | `document.delivered` | 1 business hour |

Catatan:
- Task surat kuasa aktif jika `company_data.representation = BY_PROXY`.
- Pada stage 5, `draft.revision_requested` membuka ulang task stage 4 sebagai versi revisi. Batas revisi default 3 kali (`REQUIRES BUSINESS DECISION`).
- Deliverable stage 8 (contoh: SK pengesahan, NIB, NPWP badan) dikonfigurasi per paket di `service_deliverables`. `LEGAL_REVIEW_REQUIRED`.

## 3. Template CV (`CV_STANDARD` v1)

Perbedaan dengan PT:

| Aspek | PT | CV |
|---|---|---|
| Struktur data | Pemegang saham, direksi, dewan komisaris, modal | Sekutu aktif, sekutu pasif (komanditer), modal sekutu |
| Stage 8 | REGISTRATION: bukti pengesahan badan hukum | REGISTRATION: bukti pendaftaran CV |
| Form schema | `company_data_pt.v1` | `company_data_cv.v1` |
| Deliverable | Dikonfigurasi per paket | Dikonfigurasi per paket |

`LEGAL_REVIEW_REQUIRED`: dasar pendaftaran CV (Permenkumham terkait pendaftaran persekutuan) dan daftar dokumen wajib.

Stage lain memakai struktur yang sama. Template tetap terpisah agar perubahan satu layanan tidak mengubah layanan lain.

## 4. Definisi Template (Contoh YAML)

```yaml
code: PT_STANDARD
version: 1
service_type: PT
stages:
  - code: DRAFT_DEED
    order: 4
    tasks:
      - code: UPLOAD_DRAFT_DEED
        title: "Upload draft akta pendirian"
        owner_role: NOTARY
        completion_mode: EVIDENCE
        required_document_type: DRAFT_DEED
        sla_policy: NOTARY_STANDARD_8H
        priority: P2_HIGH
        depends_on: [ACCEPT_ASSIGNMENT]
        client_label: "Notaris menyiapkan draft akta"
```

## 5. Engine Behavior

| Trigger | Aksi engine |
|---|---|
| `project.created` | Instansiasi stage dan task. Stage 1 ACTIVE. Task tanpa dependency OPEN. |
| Task COMPLETED | Evaluasi dependency. Task yang semua dependency-nya selesai berubah BLOCKED -> OPEN. |
| Semua task wajib di stage COMPLETED atau SKIPPED | Stage COMPLETED. Stage berikutnya ACTIVE. Update `project.status` sesuai mapping. |
| Task kondisional tidak berlaku | Task SKIPPED dengan `skip_reason`. |
| `draft.revision_requested` | Task UPLOAD_DRAFT_DEED dibuka ulang (BR-TASK-007). `revision_count` naik. |

Semua langkah di atas berjalan dalam satu transaksi database per event dan menulis outbox event `task.completed`, `task.activated`, `stage.completed`.

## 6. Smart To-Do Engine

Setiap user melihat task miliknya dan task follow-up yang ia pantau.

**Priority score** (0 sampai 100):

```text
score = 40 * H + 25 * O + 20 * R + 15 * B
H = {ON_TRACK:0, WARNING:0.4, HIGH_RISK:0.7, CRITICAL:1.0}   (health task)
O = min(1, overdue_business_hours / 8)
R = project_risk_score / 100
B = min(1, jumlah task lain yang menunggu task ini / 3)
```

Bobot adalah `ASSUMPTION A-012`. Kalibrasi setelah 3 bulan data.

**Follow-up task untuk Admin** dibuat otomatis oleh aturan:

| Kondisi | Task Admin |
|---|---|
| Task Client OPEN melewati 2 business days | "Follow-up Client: {task}" |
| Task Notary health HIGH_RISK | "Follow-up Notary: {task}" |
| Dokumen NEEDS_REVIEW | "Review dokumen {type}" |
| Delivery FAILED | "Tangani kegagalan delivery" |
| Pesan WhatsApp tanpa project terselesaikan | "Tentukan project untuk pesan" |
