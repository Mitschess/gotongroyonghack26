'use client';

import React, { useState } from 'react';
import { 
  Zap, 
  FolderKanban, 
  MessageSquare, 
  Sparkles, 
  Menu, 
  X, 
  Users, 
  BookOpen, 
  FileText, 
  CheckSquare, 
  Calendar, 
  CreditCard, 
  BarChart3, 
  ShieldAlert,
  UserCheck,
  LayoutDashboard
} from 'lucide-react';
import { UserRole } from '../types/legal';

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingApprovalsCount: number;
  userRole: UserRole;
}

export default function MobileNav({
  activeTab,
  setActiveTab,
  pendingApprovalsCount,
  userRole
}: MobileNavProps) {
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const primaryMobileTabs = [
    { id: 'todays_actions', label: 'Tindakan', icon: Zap, roles: ['super_admin', 'admin', 'technical'] },
    { id: 'workorders', label: 'Work Order', icon: FolderKanban, roles: ['super_admin', 'admin', 'technical', 'client'] },
    { id: 'whatsapp', label: 'WA Proxy', icon: MessageSquare, roles: ['super_admin', 'admin', 'technical', 'finance', 'notary', 'client'] },
    { id: 'ai', label: 'AI Suite', icon: Sparkles, roles: ['super_admin', 'admin', 'technical'] },
  ];

  const moreMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'clients', label: 'Klien & Perusahaan', icon: Users },
    { id: 'services', label: 'Layanan Legalitas', icon: BookOpen },
    { id: 'documents', label: 'Dokumen Legal', icon: FileText },
    { id: 'approvals', label: 'Persetujuan', icon: CheckSquare, badge: pendingApprovalsCount },
    { id: 'calendar', label: 'Kalender Deadline', icon: Calendar },
    { id: 'finance', label: 'Keuangan & Invoice', icon: CreditCard },
    { id: 'reports', label: 'Laporan', icon: BarChart3 },
    { id: 'audit', label: 'Audit Trail', icon: ShieldAlert },
  ];

  const filteredPrimaryTabs = primaryMobileTabs.filter(t => t.roles.includes(userRole));

  return (
    <>
      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 px-2 py-2 flex items-center justify-around bg-white/95 backdrop-blur-md border-t border-slate-200">
        {filteredPrimaryTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setIsMoreOpen(false); }}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                isActive ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all mb-0.5 ${
                isActive ? 'bg-indigo-50 text-indigo-600' : 'bg-transparent'
              }`}>
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-[9px] font-bold">{tab.label}</span>
            </button>
          );
        })}

        <button
          onClick={() => setIsMoreOpen(!isMoreOpen)}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
            isMoreOpen ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <div className={`p-1.5 rounded-xl transition-all mb-0.5 ${
            isMoreOpen ? 'bg-indigo-50 text-indigo-600' : 'bg-transparent'
          }`}>
            {isMoreOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </div>
          <span className="text-[9px] font-bold">Menu</span>
        </button>
      </nav>

      {/* Mobile "More" Sheet */}
      {isMoreOpen && (
        <div className="lg:hidden fixed inset-0 z-30 flex flex-col justify-end p-4 animate-in fade-in duration-200 bg-slate-950/40 backdrop-blur-xs">
          <div className="rounded-3xl p-4 space-y-3 mb-20 max-h-[75vh] overflow-y-auto bg-white border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Modul Tambahan</h3>
              <button
                onClick={() => setIsMoreOpen(false)}
                className="p-1.5 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {moreMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setIsMoreOpen(false); }}
                    className={`flex items-center gap-2.5 p-3 rounded-2xl text-xs font-bold transition-all border ${
                      isActive 
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-600' 
                        : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                    {item.badge && item.badge > 0 ? (
                      <span className="ml-auto px-1.5 py-0.5 rounded-full text-[9px] font-black bg-amber-100 text-amber-700 border border-amber-200">
                        {item.badge}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
