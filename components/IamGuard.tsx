'use client';

import React from 'react';
import { ShieldAlert, Lock, ArrowLeft, ShieldCheck, UserCheck } from 'lucide-react';
import { UserRole } from '../types/legal';
import { ROLE_DETAILS, IAM_DEFAULT_LANDING } from '../lib/iam';

interface IamGuardProps {
  userRole: UserRole;
  userName: string;
  tabId: string;
  onNavigateTab: (tab: string) => void;
}

export default function IamGuard({ userRole, userName, tabId, onNavigateTab }: IamGuardProps) {
  const roleInfo = ROLE_DETAILS[userRole];
  const defaultTab = IAM_DEFAULT_LANDING[userRole] || 'dashboard';

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
      <div className="max-w-md w-full rounded-3xl p-8 bg-white border border-slate-200 shadow-xl relative overflow-hidden">
        {/* Top Decorative IAM Header */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-rose-500 via-amber-500 to-indigo-600" />

        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 shadow-sm">
          <Lock className="h-8 w-8" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-3 bg-rose-100 text-rose-700 border border-rose-200">
          <ShieldAlert className="h-3.5 w-3.5" /> IAM Policy Enforcement — Akses Dibatasi
        </div>

        <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Akses Modul Tidak Diizinkan
        </h3>

        <p className="mt-2 text-xs text-slate-500 leading-relaxed">
          Akun Anda <strong className="text-slate-900">{userName}</strong> memiliki wewenang role <span className={`px-2 py-0.5 rounded font-extrabold text-[10px] ${roleInfo.badgeBg}`}>{roleInfo.badgeText}</span>.
        </p>

        <div className="my-5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-left text-xs space-y-2">
          <div className="flex items-center justify-between font-bold text-slate-800">
            <span>Modul yang Diminta:</span>
            <span className="font-mono text-indigo-600 uppercase text-[11px]">{tabId}</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Sesuai kebijakan keamanan data LexiFlow Legal Work OS (Role-Based Access Control), role ini tidak diberikan izin untuk membaca atau memodifikasi data pada modul ini.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => onNavigateTab(defaultTab)}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" /> Kembali ke Landing Page ({defaultTab.replace('_', ' ').toUpperCase()})
          </button>
        </div>
      </div>
    </div>
  );
}
