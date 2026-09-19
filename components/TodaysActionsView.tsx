'use client';

import React, { useState } from 'react';
import { 
  AlertCircle, 
  Clock, 
  MessageSquare, 
  FileCheck2, 
  UserCheck, 
  Send, 
  ShieldAlert, 
  CheckCircle,
  Zap,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { WorkOrder, Task, LegalDocument, SlaHealth, BlockedOn } from '../types/legal';

interface TodaysActionsViewProps {
  workOrders: WorkOrder[];
  tasks: Task[];
  documents: LegalDocument[];
  onNavigateTab: (tab: string) => void;
  onSendWhatsappReminder: (woId: string, recipientName: string, role: string) => void;
  onOpenReview: (woId: string) => void;
}

export default function TodaysActionsView({
  workOrders,
  tasks,
  documents,
  onNavigateTab,
  onSendWhatsappReminder,
  onOpenReview
}: TodaysActionsViewProps) {
  const [filterRole, setFilterRole] = useState<'ALL' | 'CLIENT' | 'NOTARY' | 'ADMIN'>('ALL');
  const [sentReminders, setSentReminders] = useState<Record<string, boolean>>({});

  // Compute Today's Actions breakdown
  const clientFollowups = workOrders.filter(w => w.blockedOn === 'CLIENT' && w.status !== 'Completed');
  const notaryDelays = workOrders.filter(w => w.blockedOn === 'NOTARY' && w.status !== 'Completed');
  const pendingReviews = workOrders.filter(w => (w.blockedOn === 'ADMIN' || w.status === 'Review') && w.status !== 'Completed');
  const criticalProjects = workOrders.filter(w => w.health === 'CRITICAL' || w.health === 'HIGH_RISK');

  // Filter list
  const filteredWorkOrders = workOrders.filter(w => {
    if (w.status === 'Completed') return false;
    if (filterRole === 'CLIENT') return w.blockedOn === 'CLIENT';
    if (filterRole === 'NOTARY') return w.blockedOn === 'NOTARY';
    if (filterRole === 'ADMIN') return w.blockedOn === 'ADMIN';
    return true;
  });

  const handleReminder = (woId: string, name: string, role: string) => {
    onSendWhatsappReminder(woId, name, role);
    setSentReminders(prev => ({ ...prev, [woId]: true }));
  };

  return (
    <div className="space-y-4 pb-16 md:pb-6">
      {/* Top Banner - Action First */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4 md:p-6 text-white shadow-lg border border-indigo-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold mb-2">
              <Zap className="h-3.5 w-3.5" /> Gotong Royong Engine: Action-First
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight">Today&apos;s Actions (Tindakan Hari Ini)</h2>
            <p className="text-xs md:text-sm text-slate-300 mt-1">
              Sabtu, 19 Sep 2026 — Daftar tugas berurutan prioritas langsung dengan tombol aksi 1-klik.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateTab('whatsapp')}
              className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/30"
            >
              <MessageSquare className="h-4 w-4" /> WA Proxy Hub
            </button>
          </div>
        </div>

        {/* Action Counters Bar */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 border-t border-slate-800">
          <div className="rounded-xl bg-slate-800/80 p-2.5 border border-slate-700">
            <span className="text-[11px] font-semibold text-amber-400">Client Follow-up</span>
            <p className="text-lg font-black text-white mt-0.5">{clientFollowups.length} Project</p>
          </div>
          <div className="rounded-xl bg-slate-800/80 p-2.5 border border-slate-700">
            <span className="text-[11px] font-semibold text-rose-400">Notary Terlambat</span>
            <p className="text-lg font-black text-white mt-0.5">{notaryDelays.length} Project</p>
          </div>
          <div className="rounded-xl bg-slate-800/80 p-2.5 border border-slate-700">
            <span className="text-[11px] font-semibold text-blue-400">Menunggu Review</span>
            <p className="text-lg font-black text-white mt-0.5">{pendingReviews.length} Dokumen</p>
          </div>
          <div className="rounded-xl bg-slate-800/80 p-2.5 border border-slate-700">
            <span className="text-[11px] font-semibold text-purple-400">Project Critical</span>
            <p className="text-lg font-black text-white mt-0.5">{criticalProjects.length} Risk High</p>
          </div>
        </div>
      </div>

      {/* Filter Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <span className="text-xs font-bold text-slate-500 flex items-center gap-1 shrink-0">
          <Filter className="h-3.5 w-3.5" /> Filter:
        </span>
        {[
          { key: 'ALL', label: 'Semua Aksi (All)' },
          { key: 'CLIENT', label: 'Tunggu Client' },
          { key: 'NOTARY', label: 'Tunggu Notaris' },
          { key: 'ADMIN', label: 'Review Admin' },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setFilterRole(item.key as any)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              filterRole === item.key
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Priority Actions Card List */}
      <div className="space-y-3">
        {filteredWorkOrders.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center">
            <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
            <h3 className="font-bold text-slate-900 dark:text-slate-100">Semua Tindakan Selesai!</h3>
            <p className="text-xs text-slate-500 mt-1">Tidak ada item yang membutuhkan follow-up untuk filter ini.</p>
          </div>
        ) : (
          filteredWorkOrders.map((wo) => {
            const healthBadge = {
              CRITICAL: 'bg-rose-500/10 text-rose-600 border-rose-500/30',
              HIGH_RISK: 'bg-orange-500/10 text-orange-600 border-orange-500/30',
              WARNING: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
              ON_TRACK: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
            }[wo.health || 'ON_TRACK'];

            const blockedBadge = {
              CLIENT: 'bg-amber-500/10 text-amber-600',
              NOTARY: 'bg-rose-500/10 text-rose-600',
              ADMIN: 'bg-blue-500/10 text-blue-600',
              SYSTEM: 'bg-purple-500/10 text-purple-600',
              EXTERNAL: 'bg-slate-500/10 text-slate-600',
              NONE: 'bg-emerald-500/10 text-emerald-600'
            }[wo.blockedOn || 'NONE'];

            const isSent = sentReminders[wo.id];

            return (
              <div
                key={wo.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">{wo.woNumber}</span>
                      <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md border ${healthBadge}`}>
                        {wo.health || 'ON_TRACK'}
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${blockedBadge}`}>
                        Blocked on: {wo.blockedOn || 'NONE'}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{wo.clientName}</h3>
                    <p className="text-xs text-slate-500">{wo.serviceName}</p>

                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 pt-1">
                      <Clock className="h-3.5 w-3.5 text-amber-500" />
                      <span className="font-medium text-amber-600 dark:text-amber-400">
                        {wo.actionRequired || 'Perlu penanganan staf'}
                      </span>
                    </div>
                  </div>

                  {/* 1-Click Action Buttons */}
                  <div className="shrink-0 flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                    {wo.blockedOn === 'NOTARY' && (
                      <button
                        onClick={() => handleReminder(wo.id, wo.notaryName || 'Notaris', 'Notary')}
                        disabled={isSent}
                        className={`w-full sm:w-auto px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                          isSent
                            ? 'bg-emerald-500/20 text-emerald-600 cursor-default'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30'
                        }`}
                      >
                        <Send className="h-3.5 w-3.5" />
                        {isSent ? 'Reminder Terkirim!' : 'Hubungi Notaris (WA)'}
                      </button>
                    )}

                    {wo.blockedOn === 'CLIENT' && (
                      <button
                        onClick={() => handleReminder(wo.id, wo.clientName, 'Client')}
                        disabled={isSent}
                        className={`w-full sm:w-auto px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                          isSent
                            ? 'bg-emerald-500/20 text-emerald-600 cursor-default'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30'
                        }`}
                      >
                        <Send className="h-3.5 w-3.5" />
                        {isSent ? 'Reminder Terkirim!' : 'Kirim Reminder Client'}
                      </button>
                    )}

                    {(wo.blockedOn === 'ADMIN' || wo.status === 'Review') && (
                      <button
                        onClick={() => onOpenReview(wo.id)}
                        className="w-full sm:w-auto px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-amber-500/20"
                      >
                        <FileCheck2 className="h-3.5 w-3.5" />
                        Buka Review
                      </button>
                    )}

                    <button
                      onClick={() => onNavigateTab('workorders')}
                      className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                      title="Lihat Detail Work Order"
                    >
                      <ArrowUpRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
