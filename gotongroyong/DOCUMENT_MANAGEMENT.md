# Document Management

## 1. Prinsip

File terunggah tidak sama dengan workflow selesai (BR-DOC-001). Setiap file melewati pipeline berikut:

```text
Upload -> Integrity check -> Malware scan -> Project resolution -> Type classification
-> Slot matching -> Duplicate check -> Verification decision -> Task matching -> Task update -> Audit
```

## 2. Sumber Dokumen

| Source | Cara masuk | Project context | Tipe dokumen |
|---|---|---|---|
| WEB | Presigned upload dari slot dokumen di workspace | Pasti (dari URL workspace) | Dideklarasikan oleh slot |
| WHATSAPP | Lampiran pesan ke nomor platform | Diselesaikan oleh algoritma resolusi | Diklasifikasi |
| API | `POST /projects/{id}/documents` dengan API key internal | Pasti | Dideklarasikan |
| INTERNAL | Admin atau Super Admin upload atas nama pihak lain | Pasti | Dideklarasikan, `on_behalf_of` wajib |

## 3. Metadata

| Field | Keterangan |
|---|---|
| `document_id` | UUID |
| `project_id` | Nullable hanya saat PENDING_RESOLUTION |
| `document_type` | Enum `document_type` |
| `slot_key` | Kunci slot, contoh `KTP:person_7f3a` atau `DRAFT_DEED` |
| `uploaded_by`, `on_behalf_of` | User ID |
| `source` | WEB, WHATSAPP, API, INTERNAL |
| `current_version_id` | Versi aktif |
| `status` | Enum `document_status` |
| `content_review_status` | NOT_REQUIRED, PENDING, APPROVED, REJECTED |
| `classification_method` | DECLARED, CLASSIFIER, MANUAL |
| `classification_confidence` | 0 sampai 1 |
| `workflow_stage_code` | Stage saat upload |
| `task_id` | Task yang dipenuhi (nullable) |
| `is_final` | True untuk dokumen dalam paket final |

Metadata per versi: `version_no`, `storage_key`, `mime_type` (hasil sniffing), `file_size`, `sha256`, `page_count`, `original_filename`, `scan_result`, `uploaded_at`.

## 4. Validasi File

| Kontrol | Aturan default | Status |
|---|---|---|
| Ekstensi dan MIME | PDF, JPG, JPEG, PNG. MIME dari magic bytes, bukan dari header client. | Final |
| Ukuran maksimal | 20 MB per file | TBD business validation |
| Integritas | SHA-256 dihitung server setelah upload. Ukuran wajib cocok dengan upload intent. | Final |
| Keterbacaan | PDF dapat di-parse, gambar dapat di-decode, halaman >= 1 | Final |
| PDF aktif | PDF dengan JavaScript atau embedded file ditolak | Final |
| Malware | ClamAV. Hasil positif menjadi QUARANTINED. | Final |
| Enkripsi PDF | PDF terproteksi password menjadi NEEDS_REVIEW | Final |

## 5. Keputusan Verifikasi Otomatis

Dokumen berubah ke VERIFIED otomatis hanya jika semua syarat terpenuhi:

1. Scan bersih dan file dapat dibaca.
2. Project terselesaikan dengan metode `WORKSPACE`, `REPLY_CONTEXT`, atau `EXPLICIT_CODE`.
3. Uploader memiliki role yang sama dengan owner task yang meminta tipe tersebut, dan task berstatus OPEN atau IN_PROGRESS.
4. Tipe dokumen memenuhi salah satu:
   - DECLARED dan classifier (jika aktif) tidak memberi tipe lain dengan confidence >= 0.90.
   - CLASSIFIER dengan confidence >= `DOC_AUTO_VERIFY_THRESHOLD` (default 0.90). Jalur ini hanya aktif jika `FEATURE_AUTO_VERIFY=true` (setelah TV-04 lulus). Jika flag mati, dokumen CLASSIFIER selalu NEEDS_REVIEW.
5. Bukan duplikat.
6. Stage aktif memang meminta tipe tersebut.

Jika satu syarat gagal, status menjadi NEEDS_REVIEW dengan `review_reasons[]`. Contoh: `LOW_CONFIDENCE`, `TYPE_MISMATCH`, `PROJECT_AMBIGUOUS`, `UNEXPECTED_STAGE`, `ENCRYPTED_PDF`.

### Dua Level Verifikasi

| Level | Arti | Siapa |
|---|---|---|
| `status = VERIFIED` | File valid, tipe benar, milik project yang benar | Sistem atau Admin |
| `content_review_status = APPROVED` | Isi dokumen benar secara substansi | Manusia |

| Tipe | content_review default | Gerbang manusia |
|---|---|---|
| KTP, KK, NPWP, DOMICILE_PROOF | PENDING | Admin di DATA_VALIDATION (BR-DOC-004) |
| DRAFT_DEED | PENDING | Client di CLIENT_DRAFT_REVIEW |
| POWER_OF_ATTORNEY | NOT_REQUIRED | Tidak ada. Dicek di Final QA jika termasuk paket. |
| DEED, REGISTRATION_PROOF, FINAL_DOCUMENT | PENDING | Admin di FINAL_QA (BR-DOC-003) |
| SUPPORTING | NOT_REQUIRED | Tidak ada |

Task upload selesai saat `status = VERIFIED`. Stage validasi dan QA memastikan isi. Dengan pola ini Admin tidak memeriksa setiap file saat masuk, tetapi tidak ada dokumen legal yang terkirim tanpa pemeriksaan manusia.

## 6. Slot dan Versioning

- Slot = `(project_id, slot_key)`. KTP per orang memakai `person_id` dari form data perusahaan.
- Upload baru pada slot yang sama membuat versi baru.
- Saat versi baru VERIFIED, versi lama menjadi SUPERSEDED (BR-DOC-006).
- Versi REJECTED tidak menggantikan versi VERIFIED yang ada.
- Semua versi tetap tersimpan sampai kebijakan retensi berlaku.

## 7. Duplicate Detection

| Kasus | Deteksi | Aksi |
|---|---|---|
| Hash sama, slot sama | `sha256` sama pada versi slot tersebut | Tolak sebagai duplikat, balas "file sudah diterima" |
| Hash sama, slot berbeda, project sama | `sha256` sama pada project | NEEDS_REVIEW dengan `DUPLICATE_OTHER_SLOT` |
| Hash sama, project berbeda | `sha256` sama lintas project | NEEDS_REVIEW dengan `CROSS_PROJECT_DUPLICATE`, alert Admin (indikasi salah kirim) |

## 8. Klasifikasi

Urutan klasifikasi:
1. DECLARED dari slot (web, API, internal).
2. Kode dokumen di caption WhatsApp. Contoh: `#AKTA`, `#DRAFT`, `#KUASA`.
3. Heuristik nama file (`draft`, `akta`, `kuasa`, `sk`).
4. AI classifier (lihat AI_FEATURES.md), jika aktif.

Hasil akhir memakai confidence tertinggi. Heuristik nama file maksimal confidence 0.70 sehingga tidak pernah auto-verify sendirian.

## 9. Storage

| Aspek | Keputusan |
|---|---|
| Provider | S3-compatible di balik interface `StorageProvider` |
| Bucket | Privat. Public access diblokir di level bucket. |
| Key | `projects/{project_id}/documents/{document_id}/v{n}/{random_uuid}.{ext}`. Tidak ada PII di key. |
| Enkripsi | Server-side encryption di storage, TLS in transit |
| Upload | Presigned PUT, TTL 15 menit, content-length dan content-type dikunci |
| Download | Presigned GET, TTL 5 menit, dibuat setelah cek otorisasi, dicatat `DOCUMENT_DOWNLOADED` |
| Karantina | File QUARANTINED dipindah ke prefix `quarantine/` dengan akses Super Admin saja |
| Versioning bucket | Aktif untuk proteksi hapus tidak sengaja |
| Backup | Replikasi ke bucket kedua (TBD lokasi, LEGAL_REVIEW_REQUIRED) |

## 10. Review Queue

Admin melihat antrean dokumen NEEDS_REVIEW milik project yang ia tangani. Layar review menampilkan preview, tipe usulan, confidence, alasan review, dan tombol: Verifikasi, Ubah tipe lalu verifikasi, Pindah project, Tolak. Penolakan wajib alasan dan otomatis dikirim ke pengunggah dengan bahasa yang mudah dipahami.

## 11. Final Document Delivery

```text
FINAL_QA approved -> dokumen paket is_final = true -> project COMPLETED
-> job delivery.dispatch -> notifikasi Client berisi link portal
-> channel WhatsApp -> fallback email -> in-app selalu
-> status DELIVERED saat minimal satu channel SENT
-> Client membuka atau mengunduh -> delivery READ, audit DOCUMENT_DOWNLOADED
```

Default: link portal yang membutuhkan login. Lampiran file langsung via WhatsApp nonaktif (K-08, `REQUIRES BUSINESS DECISION`).
