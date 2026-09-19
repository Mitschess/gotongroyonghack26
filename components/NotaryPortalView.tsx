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
  Smartphone
} from 'lucide-react';
import { WorkOrder, Task, LegalDocument } from '../types/legal';

interface NotaryPortalViewProps {
  workOrders: WorkOrder[];
  tasks: Task[];
  notaryName: string;
  onUploadDocument: (doc: Partial<LegalDocument>) => void;
  onNavigateTab: (tab: string) => void;
}

export default function NotaryPortalView({
  workOrders,
  tasks,
  notaryName,
  onUploadDocument,
  onNavigateTab
}: NotaryPortalViewProps) {
  const [uploadedTasks, setUploadedTasks] = useState<Record<string, boolean>>({});

  const notaryWorkOrders = workOrders.filter(w => w.notaryName?.includes('Soebagjo') || w.notaryName?.includes(notaryName) || true);

  const handleUploadMinuta = (wo: WorkOrder) => {
    onUploadDocument({
      title: `Minuta Akta Pendirian Final - ${wo.clientName}`,
      category: 'Company Document',
      workOrderId: wo.id,
      workOrderNumber: wo.woNumber,
      clientName: wo.clientName,
      uploadedBy: notaryName || 'Notaris Soebagjo, S.H.',
      fileType: 'PDF',
      fileSize: '3.4 MB',
      accessLevel: 'Confidential'
    });

    setUploadedTasks(prev => ({ ...prev, [wo.id]: true }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-20 md:pb-6">
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-950 via-slate-900 to-slate-950 p-5 text-white shadow-xl border border-amber-500/30">
        <div className="flex items-center justify-between">
          <div>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
              Workspace Rekan Notaris
            </span>
            <h2 className="text-xl font-black tracking-tight mt-1">{notaryName || 'Notaris Soebagjo, S.H., M.Kn.'}</h2>
            <p className="text-xs text-slate-300 mt-0.5">Daftar tugas & unggah dokumen minuta legalitas.</p>
          </div>
          <div className="h-10 w-10 rounded-2xl bg-amber-500 flex items-center justify-center font-bold text-slate-950 shadow-lg shadow-amber-500/20">
            <FileText className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Task List for Notary */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
          Daftar Tugas Minutasi Akta ({notaryWorkOrders.length})
        </h3>

        {notaryWorkOrders.map((wo) => {
          const isUploaded = uploadedTasks[wo.id];
          return (
            <div
              key={wo.id}
              className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm hover:shadow-md transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">{wo.woNumber}</span>
                <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-amber-500" /> Tenggat: Hari ini 15:00
                </span>
              </div>

              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{wo.clientName}</h4>
                <p className="text-xs text-slate-500">{wo.serviceName}</p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Dokumen yang Diharapkan:</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">Draft Minuta Akta Final (PDF)</p>
                </div>

                <span className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold ${
                  isUploaded ? 'bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/20 text-amber-500'
                }`}>
                  {isUploaded ? 'VERIFIED' : 'PENDING'}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => handleUploadMinuta(wo)}
                  disabled={isUploaded}
                  className={`py-2.5 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    isUploaded
                      ? 'bg-emerald-500/20 text-emerald-600 cursor-default'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                  }`}
                >
                  <Upload className="h-4 w-4" />
                  {isUploaded ? 'Dokumen Berhasil Diunggah' : 'Upload Minuta Akta'}
                </button>

                <button
                  onClick={() => onNavigateTab('whatsapp')}
                  className="py-2.5 px-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <MessageSquare className="h-4 w-4 text-emerald-500" /> Chat Proxy WA Klien
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
