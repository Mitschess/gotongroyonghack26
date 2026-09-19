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
  Archive,
  Scale,
  Sparkles,
  Zap,
  MessageSquare,
  Wand2,
  FileCheck2,
  UserCheck,
  ChevronRight
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
    { id: 'todays_actions', label: "Today's Actions", icon: Zap, roles: ['super_admin', 'admin', 'technical'] },
    { id: 'public_form', label: 'Back Data & ZIP Notaris', icon: Archive, roles: ['super_admin', 'admin', 'technical', 'finance', 'notary'] },
    { id: 'whatsapp', label: 'WA Proxy Hub', icon: MessageSquare, roles: ['super_admin', 'admin', 'technical', 'finance', 'notary'] },
    { id: 'ai', label: 'AI Suite & OCR', icon: Wand2, roles: ['super_admin', 'admin', 'technical'] },
    { id: 'notary_tasks', label: 'Tugas Notaris', icon: FileCheck2, roles: ['notary', 'super_admin', 'admin'] },

    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['super_admin', 'admin', 'technical', 'finance', 'notary', 'client'] },
    { id: 'workorders', label: 'Work Orders', icon: FolderKanban, roles: ['super_admin', 'admin', 'technical', 'client', 'notary'] },
    { id: 'clients', label: 'Klien & Perusahaan', icon: Users, roles: ['super_admin', 'admin', 'technical', 'finance'] },
    { id: 'services', label: 'Layanan Legalitas', icon: BookOpen, roles: ['super_admin', 'admin', 'technical', 'client'] },
    { id: 'documents', label: 'Dokumen Legal', icon: FileText, roles: ['super_admin', 'admin', 'technical', 'client', 'notary'] },
    { id: 'approvals', label: 'Persetujuan', icon: CheckSquare, badge: pendingApprovalsCount, roles: ['super_admin', 'admin', 'technical'] },
    { id: 'calendar', label: 'Kalender & Deadline', icon: Calendar, roles: ['super_admin', 'admin', 'technical'] },
    { id: 'finance', label: 'Keuangan & Invoice', icon: CreditCard, roles: ['super_admin', 'admin', 'finance'] },
    { id: 'reports', label: 'Laporan', icon: BarChart3, roles: ['super_admin', 'admin', 'finance'] },
    { id: 'audit', label: 'Audit Trail', icon: ShieldAlert, roles: ['super_admin', 'admin'] },
  ];

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(userRole));

  return (
    <aside 
      className="hidden lg:flex w-64 flex-col shrink-0 select-none bg-white border-r border-slate-200"
    >
      {/* Brand Header */}
      <div className="flex h-14 items-center gap-3 px-5 shrink-0 border-b border-slate-200">
        <div 
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 shadow-sm shrink-0"
        >
          <Scale className="h-4 w-4 text-white" />
        </div>
        <div>
          <h1 className="text-sm font-extrabold tracking-tight text-slate-900 flex items-center gap-1.5">
            LexiFlow
            <span 
              className="text-[9px] font-extrabold uppercase tracking-widest px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-600 border border-indigo-200"
            >
              PRO
            </span>
          </h1>
          <p className="text-[10px] font-semibold text-slate-500">Legal Work OS</p>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto no-scrollbar py-3 px-3 space-y-0.5">
        <p className="px-3 pb-2 pt-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
          Menu Operasional
        </p>
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`group flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                isActive
                  ? 'bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon 
                  className={`h-4 w-4 shrink-0 transition-colors ${
                    isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                  }`} 
                />
                <span className="truncate">{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {item.badge && item.badge > 0 ? (
                  <span 
                    className="rounded-full px-1.5 py-0.2 text-[9px] font-black bg-amber-100 text-amber-700 border border-amber-200"
                  >
                    {item.badge}
                  </span>
                ) : null}
                {isActive && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-indigo-600" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer Status */}
      <div className="p-3 shrink-0 border-t border-slate-200">
        <div className="rounded-xl p-3 bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Gotong Royong AI</span>
          </div>
          <p className="mt-1 text-[10px] text-slate-500 leading-tight">
            OCR, WA Proxy & Workflow terintegrasi.
          </p>
        </div>
      </div>
    </aside>
  );
}
