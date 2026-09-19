'use client';

import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Send, 
  Download, 
  Plus, 
  ExternalLink,
  ShieldCheck,
  Phone,
  Mail,
  Building2,
  FileCheck,
  Trash2
} from 'lucide-react';
import { Client, LegalDocument } from '../types/legal';
import JSZip from 'jszip';

export interface RequiredDocItem {
  id: string;
  title: string;
  category: string;
  isMandatory: boolean;
  status: 'TERVALIDASI' | 'MENUNGGU_REVIEW' | 'BELUM_DIUNGGAH';
  uploadedFile?: {
    fileName: string;
    fileSize: string;
    uploadedAt: string;
  };
}

interface ClientDocumentDrawerProps {
  client: Client;
  documents: LegalDocument[];
  onClose: () => void;
  onSendWhatsappReminder?: (clientName: string, phone: string, missingItems: string[]) => void;
  onUploadDocument?: (doc: Partial<LegalDocument>) => void;
}

export default function ClientDocumentDrawer({
  client,
  documents,
  onClose,
  onSendWhatsappReminder,
  onUploadDocument
}: ClientDocumentDrawerProps) {
  // Mock default required documents per client type
  const [docChecklist, setDocChecklist] = useState<RequiredDocItem[]>([
    {
      id: 'req-1',
      title: 'e-KTP Direktur & Pengurus',
      category: 'Identity',
      isMandatory: true,
      status: 'TERVALIDASI',
      uploadedFile: { fileName: `KTP_Direktur_${client.picName.replace(/\s+/g, '_')}.pdf`, fileSize: '1.4 MB', uploadedAt: '2026-09-12' }
    },
    {
      id: 'req-2',
      title: 'NPWP Pribadi Pengurus',
      category: 'Identity',
      isMandatory: true,
      status: 'TERVALIDASI',
      uploadedFile: { fileName: `NPWP_Pengurus_${client.picName.replace(/\s+/g, '_')}.pdf`, fileSize: '850 KB', uploadedAt: '2026-09-12' }
    },
    {
      id: 'req-3',
      title: 'Bukti Sewa Domisili / PBB Kantor',
      category: 'Supporting Document',
      isMandatory: true,
      status: 'MENUNGGU_REVIEW',
      uploadedFile: { fileName: 'Surat_Sewa_Domisili_Gedung.pdf', fileSize: '2.8 MB', uploadedAt: '2026-09-15' }
    },
    {
      id: 'req-4',
      title: 'Draft Opsi Nama Usulan Perusahaan',
      category: 'Company Document',
      isMandatory: true,
      status: 'BELUM_DIUNGGAH'
    },
    {
      id: 'req-5',
      title: 'Kredensial OSS & Coretax DJP',
      category: 'License',
      isMandatory: false,
      status: 'BELUM_DIUNGGAH'
    }
  ]);

  const [statusFilter, setStatusFilter] = useState<'ALL' | 'BELUM' | 'REVIEW' | 'VALIDATED'>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [newDocCategory, setNewDocCategory] = useState('Supporting Document');
  const [newDocMandatory, setNewDocMandatory] = useState(true);
  const [isZipping, setIsZipping] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Statistics
  const totalRequired = docChecklist.length;
  const completedCount = docChecklist.filter(d => d.status === 'TERVALIDASI').length;
  const pendingReviewCount = docChecklist.filter(d => d.status === 'MENUNGGU_REVIEW').length;
  const missingCount = docChecklist.filter(d => d.status === 'BELUM_DIUNGGAH').length;
  const progressPercent = Math.round((completedCount / totalRequired) * 100);

  // Filtered Checklist
  const filteredChecklist = docChecklist.filter(item => {
    if (statusFilter === 'BELUM') return item.status === 'BELUM_DIUNGGAH';
    if (statusFilter === 'REVIEW') return item.status === 'MENUNGGU_REVIEW';
    if (statusFilter === 'VALIDATED') return item.status === 'TERVALIDASI';
    return true;
  });

  const handleAddRequirement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName) return;

    const newItem: RequiredDocItem = {
      id: `req-${Date.now()}`,
      title: newDocName,
      category: newDocCategory,
      isMandatory: newDocMandatory,
      status: 'BELUM_DIUNGGAH'
    };

    setDocChecklist(prev => [...prev, newItem]);
    setNewDocName('');
    setShowAddModal(false);
    showToast(`Syarat dokumen "${newDocName}" berhasil ditambahkan.`);
  };

  const handleValidateDoc = (id: string) => {
    setDocChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, status: 'TERVALIDASI' } : item
    ));
    showToast('Dokumen berhasil dikonfirmasi & divalidasi!');
  };

  const handleUploadSim = (id: string, title: string) => {
    const fakeFileName = `${title.replace(/[^a-zA-Z0-9]/g, '_')}_Uploaded.pdf`;
    setDocChecklist(prev => prev.map(item => {
      if (item.id !== id) return item;
      return {
        ...item,
        status: 'MENUNGGU_REVIEW',
        uploadedFile: {
          fileName: fakeFileName,
          fileSize: '2.1 MB',
          uploadedAt: new Date().toISOString().slice(0, 10)
        }
      };
    }));

    if (onUploadDocument) {
      onUploadDocument({
        title,
        category: 'Identity',
        clientId: client.id,
        clientName: client.name,
        fileType: 'PDF',
        fileSize: '2.1 MB'
      });
    }

    showToast(`Berkas ${fakeFileName} berhasil diunggah!`);
  };

  const handleRemindViaWa = (specificDocTitle?: string) => {
    const missingTitles = specificDocTitle 
      ? [specificDocTitle] 
      : docChecklist.filter(d => d.status === 'BELUM_DIUNGGAH').map(d => d.title);

    if (missingTitles.length === 0) {
      showToast('Seluruh dokumen sudah lengkap!');
      return;
    }

    if (onSendWhatsappReminder) {
      onSendWhatsappReminder(client.name, client.picPhone, missingTitles);
    }

    showToast(`Pesan pengingat WA terkirim ke ${client.picName} (${client.picPhone})`);
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    const zip = new JSZip();

    let manifest = `DOCUMENT AUDIT CHECKLIST - ${client.name}\n`;
    manifest += `ID Klien: ${client.clientCode}\n`;
    manifest += `PIC: ${client.picName} (${client.picPhone})\n`;
    manifest += `Kelengkapan: ${completedCount}/${totalRequired} (${progressPercent}% Selesai)\n\n`;
    manifest += `DAFTAR SYARAT DOKUMEN:\n`;

    docChecklist.forEach((doc, idx) => {
      manifest += `${idx + 1}. [${doc.status}] ${doc.title} (${doc.isMandatory ? 'Wajib' : 'Opsional'})\n`;
    });

    zip.file('00_Audited_Checklist.txt', manifest);

    const uploadedItems = docChecklist.filter(d => d.uploadedFile);
    const folder = zip.folder('Berkas_Klien');

    uploadedItems.forEach(item => {
      if (item.uploadedFile && folder) {
        folder.file(
          item.uploadedFile.fileName,
          `FILE SAMPLE CONVERTED - ${item.title}\nClient: ${client.name}\nVerified Date: ${item.uploadedFile.uploadedAt}`
        );
      }
    });

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bundel_Dokumen_${client.clientCode}_${client.name.replace(/[^a-zA-Z0-9]/g, '_')}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsZipping(false);
    showToast('Bundel ZIP dokumen berhasil diunduh!');
  };

  const showToast = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      {/* Slide-over Drawer Panel */}
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800">
                {client.clientCode}
              </span>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {client.type}
              </span>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">{client.name}</h2>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1">
              <span className="flex items-center gap-1">
                <Phone className="h-3.5 w-3.5 text-emerald-500" /> PIC: <strong className="text-slate-700 dark:text-slate-300">{client.picName}</strong> ({client.picPhone})
              </span>
              <span className="flex items-center gap-1">
                <Mail className="h-3.5 w-3.5 text-indigo-500" /> {client.email}
              </span>
            </div>
          </div>

          {/* Progress Meter Bar */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-indigo-600" /> Audit Kelengkapan Berkas Klien
              </span>
              <span className={`font-black text-xs px-2 py-0.5 rounded-full ${
                progressPercent === 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {progressPercent}% Lengkap ({completedCount}/{totalRequired} Selesai)
              </span>
            </div>

            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  progressPercent === 100 ? 'bg-emerald-500' : progressPercent > 50 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Filter Pills & Dynamic Input Trigger */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1 text-xs">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                statusFilter === 'ALL'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              Semua ({totalRequired})
            </button>
            <button
              onClick={() => setStatusFilter('BELUM')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                statusFilter === 'BELUM'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              Belum Lengkap ({missingCount})
            </button>
            <button
              onClick={() => setStatusFilter('REVIEW')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                statusFilter === 'REVIEW'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              Perlu Review ({pendingReviewCount})
            </button>
            <button
              onClick={() => setStatusFilter('VALIDATED')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                statusFilter === 'VALIDATED'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              Tervalidasi ({completedCount})
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 font-bold text-xs flex items-center gap-1 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" /> Tambah Syarat Dokumen
          </button>
        </div>

        {/* Action Success Toast Banner */}
        {actionSuccessMsg && (
          <div className="mx-4 mt-3 p-3 rounded-xl bg-emerald-500 text-slate-950 text-xs font-extrabold flex items-center justify-between shadow-md animate-in fade-in">
            <span>{actionSuccessMsg}</span>
            <CheckCircle2 className="h-4 w-4" />
          </div>
        )}

        {/* Document Checklist Table */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredChecklist.length === 0 ? (
            <div className="p-8 text-center space-y-2 text-slate-400">
              <FileCheck className="h-10 w-10 mx-auto text-slate-300" />
              <p className="text-xs font-semibold">Tidak ada dokumen pada filter ini.</p>
            </div>
          ) : (
            filteredChecklist.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-indigo-300 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-100">{item.title}</h4>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                        item.isMandatory 
                          ? 'bg-rose-50 text-rose-600 border border-rose-200' 
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {item.isMandatory ? 'Wajib' : 'Opsional'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">Kategori: {item.category}</p>
                  </div>

                  {/* Status Badge */}
                  <span className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold shrink-0 ${
                    item.status === 'TERVALIDASI'
                      ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                      : item.status === 'MENUNGGU_REVIEW'
                      ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                      : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                  }`}>
                    {item.status === 'TERVALIDASI' ? 'Tervalidasi' : item.status === 'MENUNGGU_REVIEW' ? 'Menunggu Review' : 'Belum Diunggah'}
                  </span>
                </div>

                {/* Upload Metadata Preview if Uploaded */}
                {item.uploadedFile && (
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="h-4 w-4 text-indigo-500 shrink-0" />
                      <div className="truncate">
                        <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{item.uploadedFile.fileName}</p>
                        <p className="text-[10px] text-slate-400">{item.uploadedFile.fileSize} • Uploaded {item.uploadedFile.uploadedAt}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => alert(`Pratinjau dokumen ${item.uploadedFile?.fileName}`)}
                      className="text-[11px] font-bold text-indigo-600 hover:underline shrink-0"
                    >
                      Preview
                    </button>
                  </div>
                )}

                {/* Inline Actions */}
                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => handleUploadSim(item.id, item.title)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <Upload className="h-3 w-3" /> Upload File
                  </button>

                  {item.status !== 'TERVALIDASI' && item.uploadedFile && (
                    <button
                      onClick={() => handleValidateDoc(item.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <CheckCircle2 className="h-3 w-3" /> Validasi
                    </button>
                  )}

                  {item.status === 'BELUM_DIUNGGAH' && (
                    <button
                      onClick={() => handleRemindViaWa(item.title)}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 font-bold text-[11px] flex items-center gap-1 cursor-pointer ml-auto"
                    >
                      <Send className="h-3 w-3" /> Minta via WA
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Action Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            onClick={() => handleRemindViaWa()}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <Send className="h-4 w-4" /> Ingatkan Belum Lengkap via WA
          </button>

          <button
            onClick={handleDownloadZip}
            disabled={isZipping}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            <span>{isZipping ? 'Mengemas ZIP...' : 'Download Bundel ZIP'}</span>
          </button>
        </div>
      </div>

      {/* Dynamic Requirement Input Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">Tambah Syarat Dokumen Custom</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddRequirement} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Dokumen / Syarat:</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Bukti Transfer DP 50%, Pasfoto Direktur..."
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Kategori:</label>
                <select
                  value={newDocCategory}
                  onChange={(e) => setNewDocCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 focus:outline-none"
                >
                  <option value="Identity">Identity (KTP/NPWP)</option>
                  <option value="Company Document">Company Document (Akta/SK)</option>
                  <option value="License">License (NIB/Permit)</option>
                  <option value="Supporting Document">Supporting Document</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="mandatoryCheck"
                  checked={newDocMandatory}
                  onChange={(e) => setNewDocMandatory(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="mandatoryCheck" className="font-bold text-slate-700 dark:text-slate-300">
                  Dokumen Wajib (Mandatory)
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2 font-semibold hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 shadow-xs"
                >
                  Simpan Syarat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
