'use client';

import React, { useState } from 'react';
import { 
  FileCheck2, 
  Upload, 
  Clock, 
  MessageSquare, 
  Building2, 
  CheckCircle2, 
  FileText,
  AlertTriangle,
  X,
  Eye,
  RefreshCw,
  Send,
  Check
} from 'lucide-react';
import { WorkOrder, Task, LegalDocument } from '../types/legal';

interface NotaryPortalViewProps {
  workOrders: WorkOrder[];
  tasks: Task[];
  notaryName: string;
  onUploadDocument: (doc: Partial<LegalDocument>) => void;
  onNavigateTab: (tab: string) => void;
  onAddWorkNote?: (woId: string, content: string) => void;
}

export interface DeliverableStatus {
  key: 'ahu' | 'minuta' | 'akta' | 'sk';
  title: string;
  code: string;
  uploaded: boolean;
  fileName?: string;
  uploadedAt?: string;
}

export default function NotaryPortalView({
  workOrders,
  tasks,
  notaryName,
  onUploadDocument,
  onNavigateTab,
  onAddWorkNote
}: NotaryPortalViewProps) {
  // State for tracked deliverables per work order
  const [deliverables, setDeliverables] = useState<Record<string, Record<string, boolean>>>({
    'wo-101': { ahu: true, minuta: true, akta: false, sk: false },
  });

  // Modal State
  const [activeWoForManage, setActiveWoForManage] = useState<WorkOrder | null>(null);
  const [activeWoForRevision, setActiveWoForRevision] = useState<WorkOrder | null>(null);

  // Revision Form state
  const [selectedRevisionItems, setSelectedRevisionItems] = useState<string[]>([]);
  const [revisionNote, setRevisionNote] = useState('');
  const [revisionSuccess, setRevisionSuccess] = useState(false);

  const notaryWorkOrders = workOrders.filter(w => w.notaryName?.includes('Soebagjo') || w.notaryName?.includes(notaryName) || true);

  const deliverableTypes: { key: 'ahu' | 'minuta' | 'akta' | 'sk'; title: string; desc: string }[] = [
    { key: 'ahu', title: 'Bukti Reservasi / Pemesanan Nama AHU (PDF)', desc: 'Voucher pendaftaran nama PT SABH Online' },
    { key: 'minuta', title: 'Draft Minuta Akta Pendirian (PDF)', desc: 'Draf akta perseroan yang telah disetujui' },
    { key: 'akta', title: 'Salinan Akta Notaris Resmi (PDF)', desc: 'Akta otentik bertanda tangan & stempel' },
    { key: 'sk', title: 'SK Pengesahan Kemenkumham / SKT (PDF)', desc: 'Surat Keputusan Menteri Hukum dan HAM' }
  ];

  const handleUploadDeliverable = (woId: string, key: string, title: string) => {
    onUploadDocument({
      title: `${title} - ${activeWoForManage?.clientName || 'Klien'}`,
      category: 'Notary Deliverable',
      workOrderId: woId,
      workOrderNumber: activeWoForManage?.woNumber || 'WO-2026',
      clientName: activeWoForManage?.clientName || 'Klien',
      uploadedBy: notaryName || 'Notaris Soebagjo, S.H.',
      fileType: 'PDF',
      fileSize: '2.8 MB',
      accessLevel: 'Public'
    });

    setDeliverables(prev => ({
      ...prev,
      [woId]: {
        ...(prev[woId] || {}),
        [key]: true
      }
    }));
  };

  const handleToggleRevisionItem = (item: string) => {
    if (selectedRevisionItems.includes(item)) {
      setSelectedRevisionItems(prev => prev.filter(i => i !== item));
    } else {
      setSelectedRevisionItems(prev => [...prev, item]);
    }
  };

  const handleSubmitRevision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWoForRevision) return;

    const noteContent = `[MINTA REVISI DARI NOTARIS]\nItem yang perlu diperbaiki: ${selectedRevisionItems.join(', ')}\nCatatan Tambahan: ${revisionNote}`;

    if (onAddWorkNote) {
      onAddWorkNote(activeWoForRevision.id, noteContent);
    }

    setRevisionSuccess(true);
    setTimeout(() => {
      setRevisionSuccess(false);
      setActiveWoForRevision(null);
      setSelectedRevisionItems([]);
      setRevisionNote('');
    }, 1500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4 pb-20 md:pb-6">
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-950 via-slate-900 to-slate-950 p-6 text-white shadow-xl border border-amber-500/30">
        <div className="flex items-center justify-between">
          <div>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-extrabold uppercase tracking-wider border border-amber-500/30">
              Workspace Rekan Notaris • Waktunya Legal
            </span>
            <h2 className="text-xl font-black tracking-tight mt-1.5">{notaryName || 'Notaris Soebagjo, S.H., M.Kn.'}</h2>
            <p className="text-xs text-slate-300 mt-0.5">Portal pengelolaan minuta, SK Kemenkumham, & kelengkapan dokumen pendirian.</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-amber-500 flex items-center justify-center font-bold text-slate-950 shadow-lg shadow-amber-500/20 shrink-0">
            <FileText className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Task List for Notary */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
          Daftar Berkas & Minutasi Notaris ({notaryWorkOrders.length})
        </h3>

        {notaryWorkOrders.map((wo) => {
          const woDeliverables = deliverables[wo.id] || { ahu: false, minuta: false, akta: false, sk: false };
          const completedCount = Object.values(woDeliverables).filter(Boolean).length;

          return (
            <div
              key={wo.id}
              className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-md transition-all space-y-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400 px-2.5 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800">
                  {wo.woNumber}
                </span>
                <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-amber-500" /> Tenggat: Hari ini 15:00
                </span>
              </div>

              <div>
                <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">{wo.clientName}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{wo.serviceName}</p>
              </div>

              {/* Progress & Checklist Summary */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    Dokumen Diserahkan Notaris:
                  </span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 text-xs">
                    {completedCount}/4 Selesai
                  </span>
                </div>

                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-amber-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${(completedCount / 4) * 100}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-1.5 text-[11px] pt-1">
                  {deliverableTypes.map((dt) => {
                    const isDone = woDeliverables[dt.key];
                    return (
                      <div key={dt.key} className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 truncate">
                        <span className={`h-2 w-2 rounded-full shrink-0 ${isDone ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`} />
                        <span className={`truncate ${isDone ? 'font-bold text-slate-800 dark:text-slate-200' : ''}`}>
                          {dt.title.split('(')[0]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <button
                  onClick={() => setActiveWoForManage(wo)}
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                >
                  <Upload className="h-4 w-4" /> Kelola Dokumen Notaris
                </button>

                <button
                  onClick={() => setActiveWoForRevision(wo)}
                  className="py-2.5 px-3.5 rounded-xl border border-amber-500/80 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <AlertTriangle className="h-4 w-4 text-amber-500" /> Minta Revisi / Tambahan
                </button>

                <button
                  onClick={() => onNavigateTab('whatsapp')}
                  className="py-2.5 px-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <MessageSquare className="h-4 w-4 text-emerald-500" /> Chat WA
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: Multi-Document Delivery Modal */}
      {activeWoForManage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-600 uppercase">{activeWoForManage.woNumber}</span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Kelola & Unggah Dokumen Notaris</h3>
                <p className="text-xs text-slate-500">{activeWoForManage.clientName}</p>
              </div>
              <button 
                onClick={() => setActiveWoForManage(null)} 
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {deliverableTypes.map((dt) => {
                const woDeliverables = deliverables[activeWoForManage.id] || {};
                const isUploaded = woDeliverables[dt.key];

                return (
                  <div 
                    key={dt.key}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{dt.title}</h4>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                          isUploaded ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                        }`}>
                          {isUploaded ? 'Terunggah' : 'Belum Diunggah'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{dt.desc}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isUploaded ? (
                        <>
                          <button
                            onClick={() => alert(`Pratinjau ${dt.title}`)}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold flex items-center gap-1 hover:bg-slate-100 cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5 text-indigo-500" /> Preview
                          </button>
                          <button
                            onClick={() => handleUploadDeliverable(activeWoForManage.id, dt.key, dt.title)}
                            className="px-2.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 text-[11px] font-bold flex items-center gap-1 hover:bg-indigo-100 cursor-pointer"
                          >
                            <RefreshCw className="h-3.5 w-3.5" /> Ganti File
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleUploadDeliverable(activeWoForManage.id, dt.key, dt.title)}
                          className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          <Upload className="h-3.5 w-3.5" /> Unggah PDF
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setActiveWoForManage(null)}
                className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-5 py-2.5 shadow-sm cursor-pointer"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Minta Revisi Data Dialog */}
      {activeWoForRevision && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Minta Revisi & Dokumen Tambahan</h3>
              </div>
              <button 
                onClick={() => setActiveWoForRevision(null)} 
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {revisionSuccess ? (
              <div className="p-8 text-center space-y-2">
                <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto animate-bounce" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Permintaan Revisi Terkirim!</h4>
                <p className="text-xs text-slate-500">Notifikasi telah dikirimkan ke Tim Legal & Klien via WA Proxy.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitRevision} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Pilih Item yang Perlu Diperbaiki / Dilengkapi:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      'KTP / NPWP Pengurus & Pendiri',
                      'Opsi Nama Usulan Perusahaan',
                      'Bukti Domisili / Surat Sewa Kantor',
                      'Kredensial OSS / Coretax / NPWP',
                      'Pasal Anggaran Dasar / Modal'
                    ].map((item) => {
                      const isChecked = selectedRevisionItems.includes(item);
                      return (
                        <button
                          type="button"
                          key={item}
                          onClick={() => handleToggleRevisionItem(item)}
                          className={`p-2.5 rounded-xl text-left font-semibold border transition-all flex items-center justify-between cursor-pointer ${
                            isChecked
                              ? 'bg-amber-50 border-amber-300 text-amber-900 dark:bg-amber-950/60 dark:border-amber-700 dark:text-amber-200'
                              : 'bg-slate-50 border-slate-200 dark:bg-slate-950 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <span>{item}</span>
                          {isChecked && <Check className="h-4 w-4 text-amber-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Catatan Rincian Revisi untuk Klien / Tim Legal:
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Contoh: Nama usulan 1 ditolak AHU karena kemiripan merek. Mohon unggah 2 opsi nama baru..."
                    value={revisionNote}
                    onChange={(e) => setRevisionNote(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveWoForRevision(null)}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2 font-semibold hover:bg-slate-100 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 px-5 py-2 font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="h-4 w-4" /> Kirim Permintaan Revisi
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
