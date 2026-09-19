'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  Scan, 
  FileCheck, 
  AlertTriangle, 
  Bot, 
  Copy, 
  CheckCircle2, 
  Wand2, 
  ShieldAlert, 
  ArrowRight,
  Upload
} from 'lucide-react';
import { WorkOrder, LegalDocument, KtpOcrResult } from '../types/legal';

interface AIFeaturesViewProps {
  workOrders: WorkOrder[];
  documents: LegalDocument[];
  onApplyOcrData: (data: Partial<KtpOcrResult>) => void;
}

export default function AIFeaturesView({
  workOrders,
  documents,
  onApplyOcrData
}: AIFeaturesViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'ocr' | 'classifier' | 'missing' | 'generator'>('ocr');
  
  // OCR Demo State
  const [isProcessingOcr, setIsProcessingOcr] = useState(false);
  const [ocrResult, setOcrResult] = useState<KtpOcrResult | null>(null);

  // AI Follow-up Draft State
  const [selectedWoId, setSelectedWoId] = useState<string>(workOrders[0]?.id || 'wo-101');
  const [generatedDraft, setGeneratedDraft] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const currentWo = workOrders.find(w => w.id === selectedWoId) || workOrders[0];

  const handleSimulateOcr = () => {
    setIsProcessingOcr(true);
    setTimeout(() => {
      setOcrResult({
        nik: '3174091802880005',
        nama: 'HENDRA WIJAYA',
        alamat: 'JL. RASUNA SAID NO. 18, RT 004/RW 002, KUNINGAN, JAKARTA SELATAN',
        tanggalLahir: '18 FEBRUARI 1988',
        confidence: 0.96,
        status: 'SUCCESS'
      });
      setIsProcessingOcr(false);
    }, 1200);
  };

  const handleGenerateDraft = () => {
    const draft = `Halo Yth. Bp/Ibu ${currentWo.clientName},

Kami dari tim Legal OS LexiFlow ingin menginformasikan bahwa proses pengurusan [${currentWo.serviceName}] (${currentWo.woNumber}) saat ini berada pada tahap: ${currentWo.actionRequired || 'Penyiapan Berkas'}.

Mohon bantuannya untuk mengunggah dokumen pendukung agar proses berjalan tepat waktu. Terima kasih!`;
    setGeneratedDraft(draft);
  };

  const handleCopyDraft = () => {
    navigator.clipboard.writeText(generatedDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 pb-20 md:pb-6">
      {/* Top Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-purple-900 via-slate-900 to-indigo-950 p-4 md:p-6 text-white shadow-lg border border-purple-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold mb-2">
              <Sparkles className="h-3.5 w-3.5" /> AI Legal Assistant (BR-AI-001 Compliant)
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight">AI Suite & Automation Tools</h2>
            <p className="text-xs md:text-sm text-slate-300 mt-1">
              AI sebagai pembantu verifikasi (Human in the loop). Tidak pernah mengubah status project secara otomatis tanpa persetujuan manusia.
            </p>
          </div>
        </div>

        {/* Feature Sub-Navigation */}
        <div className="mt-4 flex items-center gap-2 overflow-x-auto pt-3 border-t border-purple-800/60 no-scrollbar">
          {[
            { id: 'ocr', label: 'OCR KTP Prefill', icon: Scan },
            { id: 'classifier', label: 'Document Classifier', icon: FileCheck },
            { id: 'missing', label: 'Missing Doc Check', icon: ShieldAlert },
            { id: 'generator', label: 'Smart Follow-up Draft', icon: Wand2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon className="h-3.5 w-3.5" /> {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sub-Tab 1: OCR KTP Prefill */}
      {activeSubTab === 'ocr' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Scan className="h-4 w-4 text-purple-500" /> Upload Foto KTP Klien
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">AI akan mengekstrak NIK, Nama, dan Alamat secara otomatis.</p>
            </div>

            <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center hover:border-purple-500/50 transition-all bg-slate-50 dark:bg-slate-950">
              <Upload className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Pilih Foto KTP atau Gunakan Kamera Mobile</p>
              <p className="text-[10px] text-slate-400 mt-1">Format: JPG, PNG, WEBP (Max 5MB)</p>
              <button
                onClick={handleSimulateOcr}
                disabled={isProcessingOcr}
                className="mt-4 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/30"
              >
                {isProcessingOcr ? 'Memproses OCR AI...' : 'Jalankan Simulasi OCR KTP'}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Hasil Extracted Fields</h3>
              {ocrResult && (
                <span className="px-2 py-0.5 text-[10px] font-extrabold rounded bg-emerald-500/20 text-emerald-400">
                  Confidence: {Math.round(ocrResult.confidence * 100)}%
                </span>
              )}
            </div>

            {!ocrResult ? (
              <p className="py-8 text-center text-xs text-slate-400">Klik tombol di sebelah kiri untuk menguji ekstraksi OCR.</p>
            ) : (
              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400">NIK (Nomor Induk Kependudukan)</span>
                  <p className="font-mono font-bold text-slate-900 dark:text-slate-100 mt-0.5">{ocrResult.nik}</p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400">NAMA LENGKAP</span>
                  <p className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">{ocrResult.nama}</p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400">ALAMAT LENGKAP</span>
                  <p className="font-medium text-slate-900 dark:text-slate-100 mt-0.5">{ocrResult.alamat}</p>
                </div>

                <button
                  onClick={() => onApplyOcrData(ocrResult)}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-600/30"
                >
                  <CheckCircle2 className="h-4 w-4" /> Prefill ke Form Registrasi Klien
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sub-Tab 2: Document Classifier */}
      {activeSubTab === 'classifier' && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-purple-500" /> Automated Document Classifier (Threshold &gt;= 0.90)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Dokumen dengan confidence &lt; 0.90 atau kategori legal-critical (Akta, SK, RUPS) wajib diverifikasi manual.
            </p>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {documents.map((doc) => {
              const confidence = doc.aiConfidence || 0.94;
              const isVerified = confidence >= 0.90;

              return (
                <div key={doc.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">{doc.docNumber}</span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                        isVerified ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                      }`}>
                        AI Confidence: {Math.round(confidence * 100)}%
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">{doc.title}</h4>
                    <p className="text-xs text-slate-500">{doc.clientName} — {doc.category}</p>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
                      {isVerified ? 'AUTO_VERIFIED' : 'NEEDS_HUMAN_REVIEW'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sub-Tab 3: Missing Document Check */}
      {activeSubTab === 'missing' && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-purple-500" /> Missing Document Detector (Rule-based)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Membandingkan slot wajib vs dokumen terverifikasi pada tiap project.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {workOrders.map((wo) => (
              <div key={wo.id} className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-950 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">{wo.woNumber}</span>
                  <span className="text-[10px] text-slate-400">{wo.serviceName}</span>
                </div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">{wo.clientName}</h4>

                <div className="pt-2 text-xs space-y-1">
                  <p className="text-[11px] font-bold text-slate-500">Status Kelengkapan Dokumen:</p>
                  <div className="flex items-center justify-between text-[11px] text-emerald-600 dark:text-emerald-400">
                    <span>✓ KTP & NPWP Direktur</span>
                    <span>VERIFIED</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-rose-500 font-semibold">
                    <span>! Surat Pernyataan Kepemilikan</span>
                    <span>MISSING</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-Tab 4: Smart Follow-up Generator */}
      {activeSubTab === 'generator' && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Wand2 className="h-4 w-4 text-purple-500" /> Smart AI Follow-up Draft Generator
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Membuat draf pesan WhatsApp sopan & profesional secara instan.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Pilih Work Order Target:</label>
              <select
                value={selectedWoId}
                onChange={(e) => setSelectedWoId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {workOrders.map(w => (
                  <option key={w.id} value={w.id}>{w.woNumber} - {w.clientName}</option>
                ))}
              </select>

              <button
                onClick={handleGenerateDraft}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-purple-600/30"
              >
                <Wand2 className="h-4 w-4" /> Generate Draf Pesan
              </button>
            </div>

            <div className="md:col-span-2 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Hasil Draf AI:</span>
                {generatedDraft && (
                  <button
                    onClick={handleCopyDraft}
                    className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 transition-all"
                  >
                    <Copy className="h-3.5 w-3.5" /> {copied ? 'Tersalin!' : 'Salin Pesan'}
                  </button>
                )}
              </div>

              <textarea
                rows={6}
                value={generatedDraft}
                onChange={(e) => setGeneratedDraft(e.target.value)}
                placeholder="Klik 'Generate Draf Pesan' untuk membuat template..."
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500 font-sans"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
