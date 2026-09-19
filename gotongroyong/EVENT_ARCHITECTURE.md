# Event Architecture

## 1. Pola

Transactional outbox + queue (BullMQ di Redis). Tidak memakai event bus terdistribusi pada MVP (prinsip Do Not Overengineer).

```text
Service transaction -> insert outbox_events -> commit
Outbox relay (poll 1 detik, FOR UPDATE SKIP LOCKED) -> publish ke queue -> set published_at
Consumer -> cek processed_events(consumer, event_id) -> proses -> insert processed_events (satu transaksi)
```

Jaminan: at-least-once delivery. Idempotency di consumer membuat efeknya exactly-once.

## 2. Envelope

```json
{
  "eventId": "0191f4...",
  "eventType": "document.verified",
  "occurredAt": "2026-09-19T07:12:03Z",
  "aggregateType": "document",
  "aggregateId": "0191f3...",
  "projectId": "0191f0...",
  "actor": { "type": "SYSTEM", "label": "system:document" },
  "schemaVersion": 1,
  "payload": {}
}
```

## 3. Katalog Event

| Event | Producer | Consumer | Payload inti |
|---|---|---|---|
| order.created | Order | Notification | orderId, clientId, amount |
| payment.confirmed | Payment | Project, Notification, Analytics | paymentId, orderId, amount |
| payment.failed | Payment | Notification | paymentId, reason |
| project.created | Project | Workflow, Notification, Messaging | projectId, serviceType, templateVersion |
| company_data.submitted | Project | Workflow, Notification | projectId, submittedBy |
| data.validated | Project | Workflow, SLA, Assignment | projectId, validatedBy |
| data.rejected | Project | Workflow, Notification | projectId, items[] |
| notary.assigned | Assignment | Notification, Workflow | projectId, notaryId |
| notary.accepted | Assignment | Workflow, Notification | projectId, notaryId |
| notary.declined | Assignment | Assignment, Escalation | projectId, notaryId, reason |
| document.uploaded | Document | Document worker | documentId, versionId, source |
| document.verified | Document | Workflow, Notification, Risk | documentId, type, projectId |
| document.needs_review | Document | Todo, Notification | documentId, reasons[] |
| document.rejected | Document | Notification, Workflow | documentId, reason |
| draft.approved | Project | Workflow | projectId |
| draft.revision_requested | Project | Workflow, Notification | projectId, note |
| signing.scheduled | Project | SLA, Notification | projectId, scheduledAt |
| signing.completed | Project | SLA, Workflow | projectId |
| task.activated | Workflow | Notification, SLA | taskId, ownerRole |
| task.completed | Workflow | Workflow, SLA, Escalation, Risk | taskId |
| task.overdue | SLA | Escalation, Notification | taskId, overdueMinutes |
| sla.warning | SLA | Notification | entity, health |
| sla.breached | SLA | Escalation, Notification | entity |
| escalation.triggered | Escalation | Notification | escalationId, level |
| escalation.resolved | Escalation | Notification | escalationId |
| final_qa.approved | Project | Project, Delivery | projectId, approvedBy |
| final_qa.rejected | Project | Workflow, Notification | projectId, rejectedBy, items[] |
| project.completed | Project | Delivery, Analytics | projectId |
| document.delivered | Delivery | Project, Notification, Analytics | projectId, channel |
| delivery.failed | Delivery | Escalation, Todo | projectId, channel, error |
| message.received | Messaging | Relay, Risk, AI intent (P2) | messageId, projectId |

## 4. Retry dan Failure

| Aspek | Aturan |
|---|---|
| Retry default | 5 kali, backoff eksponensial dari 10 detik, maksimal 30 menit |
| Error permanen | Validation error atau state invalid langsung ke dead letter tanpa retry |
| Dead letter | Queue `*.dlq`. Alert. Admin teknis dapat replay dari dashboard queue. |
| Poison message | Masuk DLQ setelah retry habis. Tidak memblokir antrean. |
| Urutan | Event per aggregate diproses berurutan dengan BullMQ group key = `aggregateId` (TECHNICAL_VALIDATION_REQUIRED pada fitur grouping versi terpilih). Consumer tetap memakai state guard. |
| Outbox macet | Alert jika ada outbox tidak terpublikasi lebih dari 2 menit |

## 5. Background Jobs

| Job | Frekuensi | Timeout | Retry | Idempotency | Jika gagal |
|---|---|---|---|---|---|
| outbox.relay | Loop 1 detik | 10 detik | Otomatis loop berikut | `published_at` | Alert setelah 2 menit lag |
| sla.evaluate | 5 menit | 2 menit | Run berikutnya | Simpan threshold terakhir | Alert jika 3 run berturut gagal |
| reminder.dispatch | Event-driven | 30 detik | 5 | dedup_key notifikasi | Fallback channel |
| escalation.check | 5 menit | 2 menit | Run berikutnya | Unique index eskalasi terbuka | Alert |
| document.process | Event-driven | 5 menit | 3 | status dokumen | NEEDS_REVIEW + alert |
| document.scan | Event-driven | 2 menit | 3 | scan_result | Status tetap SCANNING, alert, review manual |
| ocr.process (P2) | Event-driven | 5 menit | 2 | versionId | Lewati OCR, tetap alur manual |
| wa.inbound.process | Event-driven | 1 menit | 5 | unique provider_event_id | DLQ + alert |
| wa.outbound.send | Event-driven | 30 detik | 5 | notification_delivery id | Fallback email |
| notification.dispatch | Event-driven | 30 detik | 5 | unique (notification_id, channel) | Fallback |
| payment.process | Event-driven | 1 menit | 5 | status guard | DLQ + alert kritis |
| payment.reconcile.pending | 15 menit | 5 menit | Run berikutnya | status guard | Alert |
| payment.reconcile.daily | Harian 02:00 | 30 menit | 3 | Tanggal | Alert |
| order.expire | 5 menit | 1 menit | Run berikutnya | status guard | Alert |
| risk.compute | 15 menit + event | 2 menit | Run berikutnya | Overwrite nilai | Nilai lama tetap tampil |
| analytics.aggregate.daily | Harian 01:00 | 30 menit | 3 | Upsert per tanggal | Alert |
| delivery.dispatch | Event-driven | 1 menit | 5 per channel | delivery id | Fallback lalu eskalasi L2 |
| retention.enforce | Harian 03:00 | 1 jam | 3 | Status purge | Alert |
| audit.verify-chain | Harian 04:00 | 30 menit | 1 | Read-only | Alert kritis |
| upload.cleanup | 15 menit | 5 menit | Run berikutnya | Status UPLOADING | Log |
| wa.resolution.expire | 5 menit | 1 menit | Run berikutnya | Status dokumen | Log |

Scheduler memakai repeatable jobs BullMQ dengan satu instance leader (lock Redis) untuk mencegah eksekusi ganda.
