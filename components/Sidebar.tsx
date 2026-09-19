'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Users, 
  BookOpen, 
  FileText, 
  CheckSquare, 
  Calendar, 
  CreditCard, 
  BarChart3, 
  ShieldAlert,
  Scale,
  Sparkles,
  Zap,
  MessageSquare,
  Wand2,
  FileCheck2,
  UserCheck
} from 'lucide-react';
import { UserRole } from '../types/legal';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingApprovalsCount: number;
  userRole: UserRole;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  pendingApprovalsCount,
  userRole
}: SidebarProps) {
  const menuItems = [
    { id: 'todays_actions', label: "Today's Actions", icon: Zap, roles: ['Super Admin', 'Manager/Supervisor', 'Legal Staff', 'Admin'] },
    { id: 'whatsapp', label: 'WA Proxy Hub', icon: MessageSquare, roles: ['Super Admin', 'Manager/Supervisor', 'Legal Staff', 'Admin', 'Notary', 'Client'] },
    { id: 'ai', label: 'AI Suite & OCR', icon: Wand2, roles: ['Super Admin', 'Manager/Supervisor', 'Legal Staff', 'Admin'] },
    { id: 'notary_tasks', label: 'Tugas Notaris', icon: FileCheck2, roles: ['Notary', 'Super Admin', 'Manager/Supervisor'] },
    { id: 'client_portal', label: 'Client Mobile Timeline', icon: UserCheck, roles: ['Client', 'Super Admin'] },
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard, roles: ['Super Admin', 'Manager/Supervisor', 'Legal Staff', 'Admin', 'Finance', 'Client'] },
    { id: 'workorders', label: 'Work Orders / Task', icon: FolderKanban, roles: ['Super Admin', 'Manager/Supervisor', 'Legal Staff', 'Admin', 'Client'] },
    { id: 'clients', label: 'Klien & Perusahaan', icon: Users, roles: ['Super Admin', 'Manager/Supervisor', 'Legal Staff', 'Admin', 'Finance'] },
    { id: 'services', label: 'Layanan Legalitas', icon: BookOpen, roles: ['Super Admin', 'Manager/Supervisor', 'Legal Staff', 'Admin', 'Client'] },
    { id: 'documents', label: 'Dokumen Legal', icon: FileText, roles: ['Super Admin', 'Manager/Supervisor', 'Legal Staff', 'Admin', 'Client'] },
    { id: 'approvals', label: 'Persetujuan (Approval)', icon: CheckSquare, badge: pendingApprovalsCount, roles: ['Super Admin', 'Manager/Supervisor', 'Legal Staff'] },
    { id: 'calendar', label: 'Kalender & Deadline', icon: Calendar, roles: ['Super Admin', 'Manager/Supervisor', 'Legal Staff', 'Admin'] },
    { id: 'finance', label: 'Keuangan & Invoice', icon: CreditCard, roles: ['Super Admin', 'Manager/Supervisor', 'Finance', 'Admin'] },
    { id: 'reports', label: 'Laporan Pekerjaan', icon: BarChart3, roles: ['Super Admin', 'Manager/Supervisor', 'Finance'] },
    { id: 'audit', label: 'Audit Trail & Admin', icon: ShieldAlert, roles: ['Super Admin', 'Manager/Supervisor'] },
  ];

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(userRole));

  return (
    <aside className="hidden lg:flex w-64 border-r border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-100 flex-col justify-between shrink-0">
      <div>
        {/* Brand Header */}
        <div className="flex h-16 items-center gap-3 px-6 border-b border-slate-800">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 text-white shadow-lg shadow-indigo-500/20">
            <Scale className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
              LexiFlow <span className="text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">PRO</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">Gotong Royong Legal OS</p>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="p-3 space-y-1 max-h-[calc(100vh-160px)] overflow-y-auto">
          <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Modul System</p>
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && item.badge > 0 ? (
                  <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-extrabold text-slate-950">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <Sparkles className="h-4 w-4" />
            <span>Mobile-First Gotong Royong</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400 leading-tight">
            Sistem terintegrasi WhatsApp Proxy, Action-First & AI Assistant.
          </p>
        </div>
      </div>
    </aside>
  );
}

