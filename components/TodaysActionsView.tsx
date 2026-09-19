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
      <div 
        className="rounded-2xl p-5 md:p-6 bg-white border border-slate-200 shadow-xs relative overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div 
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold mb-2 bg-indigo-50 text-indigo-700 border border-indigo-100"
            >
              <Zap className="h-3.5 w-3.5 text-indigo-600" /> Action-First Engine
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-slate-900">Today&apos;s Actions (Tindakan Hari Ini)</h2>
            <p className="text-xs md:text-sm mt-1 text-slate-500">
              Sabtu, 19 Sep 2026 — Daftar tugas berurutan prioritas langsung dengan tombol aksi 1-klik.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateTab('whatsapp')}
              className="px-4 py-2 rounded-xl text-white font-bold text-xs flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 transition-all shrink-0 shadow-xs"
            >
              <MessageSquare className="h-4 w-4" /> WA Proxy Hub
            </button>
          </div>
        </div>

        {/* Action Counters Bar */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
          <div className="rounded-xl p-3 bg-slate-50 border border-slate-200/80">
            <span className="text-xs font-bold text-amber-700">Client Follow-up</span>
            <p className="text-xl font-black text-slate-900 mt-0.5">{clientFollowups.length} Project</p>
          </div>
          <div className="rounded-xl p-3 bg-slate-50 border border-slate-200/80">
            <span className="text-xs font-bold text-rose-700">Notary Terlambat</span>
            <p className="text-xl font-black text-slate-900 mt-0.5">{notaryDelays.length} Project</p>
          </div>
          <div className="rounded-xl p-3 bg-slate-50 border border-slate-200/80">
            <span className="text-xs font-bold text-indigo-700">Menunggu Review</span>
            <p className="text-xl font-black text-slate-900 mt-0.5">{pendingReviews.length} Dokumen</p>
          </div>
          <div className="rounded-xl p-3 bg-slate-50 border border-slate-200/80">
            <span className="text-xs font-bold text-purple-700">Project Critical</span>
            <p className="text-xl font-black text-slate-900 mt-0.5">{criticalProjects.length} Risk High</p>
          </div>
        </div>
      </div>

      {/* Filter Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <span className="text-xs font-bold flex items-center gap-1 shrink-0 text-slate-400">
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
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Priority Actions Card List */}
      <div className="space-y-3">
        {filteredWorkOrders.length === 0 ? (
          <div className="rounded-2xl p-8 text-center bg-white border border-slate-200 shadow-xs">
            <CheckCircle className="h-10 w-10 mx-auto mb-2 text-emerald-500" />
            <h3 className="font-bold text-slate-900">Semua Tindakan Selesai!</h3>
            <p className="text-xs mt-1 text-slate-500">Tidak ada item yang membutuhkan follow-up untuk filter ini.</p>
          </div>
        ) : (
          filteredWorkOrders.map((wo) => {
            const healthBadge = {
              CRITICAL: { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' },
              HIGH_RISK: { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' },
              WARNING: { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' },
              ON_TRACK: { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0' }
            }[wo.health || 'ON_TRACK'];

            const blockedBadge = {
              CLIENT: { bg: '#FFFBEB', text: '#D97706' },
              NOTARY: { bg: '#FEF2F2', text: '#DC2626' },
              ADMIN: { bg: '#EFF6FF', text: '#2563EB' },
              SYSTEM: { bg: '#EEF2FF', text: '#4F46E5' },
              EXTERNAL: { bg: '#F1F5F9', text: '#475569' },
              NONE: { bg: '#ECFDF5', text: '#059669' }
            }[wo.blockedOn || 'NONE'];

            const isSent = sentReminders[wo.id];

            return (
              <div
                key={wo.id}
                className="rounded-2xl p-4 md:p-5 bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-black text-indigo-600">{wo.woNumber}</span>
                      <span 
                        className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide"
                        style={{ background: healthBadge.bg, color: healthBadge.text, border: `1px solid ${healthBadge.border}` }}
                      >
                        {wo.health}
                      </span>
                      <span 
                        className="px-2 py-0.5 rounded text-[10px] font-bold"
                        style={{ background: blockedBadge.bg, color: blockedBadge.text }}
                      >
                        Blocked on: {wo.blockedOn}
                      </span>
                    </div>

                    <h4 className="text-base font-extrabold text-slate-900">{wo.clientName}</h4>
                    <p className="text-xs text-slate-500">{wo.serviceName}</p>

                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700 pt-1">
                      <Clock className="h-3.5 w-3.5 text-amber-500" />
                      <span>Follow up {wo.blockedOn === 'NOTARY' ? 'Notaris Soebagjo untuk upload Minuta Akta Final' : wo.blockedOn === 'CLIENT' ? 'Klien untuk unggah Surat Pernyataan Merek' : 'Dokumen Draf RUPS & persetujuan Manager'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                    {wo.blockedOn === 'NOTARY' && (
                      <button
                        onClick={() => handleReminder(wo.id, 'Notaris Soebagjo', 'Notary')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                          isSent
                            ? 'bg-slate-100 text-slate-500 border border-slate-200'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                      >
                        <Send className="h-3.5 w-3.5" />
                        {isSent ? 'Reminder Terkirim ✓' : 'Hubungi Notaris (WA)'}
                      </button>
                    )}

                    {wo.blockedOn === 'CLIENT' && (
                      <button
                        onClick={() => handleReminder(wo.id, wo.clientName, 'Client')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                          isSent
                            ? 'bg-slate-100 text-slate-500 border border-slate-200'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        }`}
                      >
                        <Send className="h-3.5 w-3.5" />
                        {isSent ? 'Reminder Terkirim ✓' : 'Kirim Reminder Client'}
                      </button>
                    )}

                    {wo.blockedOn === 'ADMIN' && (
                      <button
                        onClick={() => onOpenReview(wo.id)}
                        className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white transition-all shadow-xs"
                      >
                        <FileCheck2 className="h-3.5 w-3.5" />
                        Buka Review
                      </button>
                    )}

                    <button
                      onClick={() => onOpenReview(wo.id)}
                      className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
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
