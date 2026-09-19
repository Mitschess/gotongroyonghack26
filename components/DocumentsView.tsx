'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  Upload, 
  Search, 
  Filter, 
  History, 
  Download, 
  Eye, 
  Lock, 
  ShieldCheck, 
  FolderKanban, 
  Plus, 
  X, 
  FileCheck,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { LegalDocument, DocumentCategory, Client, WorkOrder, User } from '../types/legal';
import { scopeDocuments } from '../lib/iam';

interface DocumentsViewProps {
  documents: LegalDocument[];
  clients: Client[];
  workOrders: WorkOrder[];
  currentUser: User;
  onUploadDocument: (newDoc: Partial<LegalDocument>) => void;
}

export default function DocumentsView({
  documents,
  clients,
  workOrders,
  currentUser,
  onUploadDocument
}: DocumentsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedDoc, setSelectedDoc] = useState<LegalDocument | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<LegalDocument | null>(null);

  // Upload Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DocumentCategory>('Identity');
  const [clientId, setClientId] = useState('');
  const [workOrderId, setWorkOrderId] = useState('');
  const [accessLevel, setAccessLevel] = useState<'Public' | 'Restricted' | 'Confidential'>('Restricted');
  const [notes, setNotes] = useState('');

  const categories: DocumentCategory[] = [
    'Identity',
    'Company Document',
    'License',
    'Contract',
    'Government Document',
    'Supporting Document',
    'Other'
  ];

  // Scoped documents via IAM Policy
  const scopedDocs = scopeDocuments(documents, currentUser, workOrders);

  const filteredDocs = scopedDocs.filter(d => {
    const matchesSearch = d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          d.docNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          d.clientName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'all' || d.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !clientId) return;

    const client = clients.find(c => c.id === clientId);
    const wo = workOrders.find(w => w.id === workOrderId);

    onUploadDocument({
      title,
      category,
      clientId,
      clientName: client?.name || 'Client',
      workOrderId: wo?.id,
      workOrderNumber: wo?.woNumber,
      currentVersion: 1,
      fileType: 'PDF',
      fileSize: '1.5 MB',
      uploadedBy: 'Budi Santoso, S.H.',
      uploadedAt: '2026-09-19 11:00',
      accessLevel,
      versions: [
        {
          version: 1,
          fileName: `${title.replace(/\s+/g, '_')}_V1.pdf`,
          fileSize: '1.5 MB',
          uploadedBy: 'Budi Santoso, S.H.',
          uploadedAt: '2026-09-19 11:00',
          notes: notes || 'Versi pertama diunggah'
        }
      ]
    });

    setShowUploadModal(false);
    setTitle('');
    setNotes('');
  };

  const handleDownload = (doc: LegalDocument) => {
    const textContent = `LEGAL DOCUMENT ARCHIVE - LEXIFLOW SYSTEM\n\nTitle: ${doc.title}\nDoc No: ${doc.docNumber}\nClient: ${doc.clientName}\nCategory: ${doc.category}\nVersion: V${doc.currentVersion}\nUploaded By: ${doc.uploadedBy}\nTimestamp: ${doc.uploadedAt}\nAccess Level: ${doc.accessLevel}\n\n[OFFICIAL LEGAL COPY - SECURED BY LEXIFLOW LEGAL WORK OS]`;
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.docNumber}_${doc.title.replace(/\s+/g, '_')}_V${doc.currentVersion}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-500" /> Document Management & Audit Repository
          </h2>
          <p className="text-xs text-slate-500">Penyimpanan terstruktur, categorizing, version control (V1, V2, V3), dan hak akses (FR-17 s.d. FR-21)</p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-md transition-all self-start sm:self-auto"
        >
          <Upload className="h-4 w-4" /> Unggah Dokumen Baru
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-sm">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari judul dokumen, nomor berkas, nama klien..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Filter className="h-3.5 w-3.5" /> Kategori:
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-2 py-1 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none"
          >
            <option value="all">Semua Kategori</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => {
          const accessColor = {
            Public: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
            Restricted: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
            Confidential: 'bg-rose-500/10 text-rose-500 border-rose-500/30'
          }[doc.accessLevel];

          return (
            <div
              key={doc.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">{doc.docNumber}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${accessColor}`}>
                    {doc.accessLevel}
                  </span>
                </div>

                <h3 className="mt-3 text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-start gap-2">
                  <FileText className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                  <span>{doc.title}</span>
                </h3>

                <div className="mt-3 space-y-1 text-xs text-slate-500">
                  <p><strong>Klien:</strong> {doc.clientName}</p>
                  <p><strong>Kategori:</strong> <span className="font-semibold text-slate-700 dark:text-slate-300">{doc.category}</span></p>
                  {doc.workOrderNumber && (
                    <p><strong>Work Order:</strong> <span className="font-mono text-indigo-500">{doc.workOrderNumber}</span></p>
                  )}
                </div>

                {/* Version & File details */}
                <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-950 p-2.5 text-xs">
                  <span className="flex items-center gap-1 font-bold text-indigo-600 dark:text-indigo-400">
                    <History className="h-3.5 w-3.5" /> Versi V{doc.currentVersion} ({doc.versions.length} Revisi)
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">{doc.fileType} • {doc.fileSize}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedDoc(doc)}
                  className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-slate-200 dark:border-slate-800 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <History className="h-3.5 w-3.5 text-indigo-500" /> History Versi (FR-19)
                </button>
                <button
                  onClick={() => setPreviewDoc(doc)}
                  className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100"
                  title="Preview Dokumen"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDownload(doc)}
                  className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100"
                  title="Unduh Dokumen (FR-21)"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Version History Modal Drawer (FR-19) */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="font-mono text-xs font-bold text-indigo-500">{selectedDoc.docNumber}</span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Riwayat Versi Dokumen (Document Versioning)</h3>
              </div>
              <button onClick={() => setSelectedDoc(null)} className="text-slate-400">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {selectedDoc.versions.map((ver) => (
                <div key={ver.version} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                      <History className="h-3.5 w-3.5" /> Versi {ver.version} ({ver.fileName})
                    </span>
                    <span className="text-[10px] text-slate-400">{ver.uploadedAt}</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">Catatan Revisi: {ver.notes || '-'}</p>
                  <p className="mt-1 text-[11px] text-slate-400">Pengunggah: {ver.uploadedBy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Simulated Document Previewer Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-500" />
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">{previewDoc.title}</h3>
                  <p className="text-[11px] text-slate-500">{previewDoc.docNumber} • Versi V{previewDoc.currentVersion}</p>
                </div>
              </div>
              <button onClick={() => setPreviewDoc(null)} className="text-slate-400">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 min-h-[300px] rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center font-black text-6xl rotate-12 text-slate-900 dark:text-white uppercase select-none">
                LEXIFLOW OFFICIAL LEGAL DOC
              </div>
              <ShieldCheck className="h-16 w-16 text-indigo-500 mb-3" />
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">{previewDoc.title}</h4>
              <p className="text-xs text-slate-500 max-w-md mt-1">
                Dokumen resmi ini terdaftar dalam sistem manajemen operasional legalitas LexiFlow untuk Klien: <strong>{previewDoc.clientName}</strong>.
              </p>
              <div className="mt-6 flex items-center gap-3">
                <button
                  onClick={() => handleDownload(previewDoc)}
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 text-xs shadow-md"
                >
                  <Download className="h-4 w-4" /> Download File Resmi (.txt / .pdf)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal (FR-17, FR-18) */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Unggah Dokumen Legal Baru</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Judul Dokumen:</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: SK Kemenkumham Pendirian PT"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Kategori Dokumen:</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as DocumentCategory)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 focus:outline-none"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Hak Akses:</label>
                  <select
                    value={accessLevel}
                    onChange={(e) => setAccessLevel(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 focus:outline-none"
                  >
                    <option value="Restricted">Restricted (Staff & Manager)</option>
                    <option value="Confidential">Confidential (Internal Only)</option>
                    <option value="Public">Public (Klien Boleh Akses)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Pilih Klien:</label>
                <select
                  required
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 focus:outline-none"
                >
                  <option value="">-- Pilih Klien --</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Hubungkan ke Work Order (Opsional):</label>
                <select
                  value={workOrderId}
                  onChange={(e) => setWorkOrderId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 focus:outline-none"
                >
                  <option value="">-- Tidak Terhubung ke WO --</option>
                  {workOrders.map(w => (
                    <option key={w.id} value={w.id}>{w.woNumber} - {w.clientName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Catatan Versi / Keterangan File:</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="rounded-xl border px-4 py-2 font-semibold hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 text-white px-5 py-2 font-bold shadow-md"
                >
                  Unggah Dokumen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
