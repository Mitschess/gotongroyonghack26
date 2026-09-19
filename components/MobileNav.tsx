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
  UserCheck
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
    { id: 'todays_actions', label: 'Tindakan', icon: Zap, roles: ['Super Admin', 'Manager/Supervisor', 'Legal Staff', 'Admin'] },
    { id: 'workorders', label: 'Work Order', icon: FolderKanban, roles: ['Super Admin', 'Manager/Supervisor', 'Legal Staff', 'Admin', 'Client'] },
    { id: 'whatsapp', label: 'WA Proxy', icon: MessageSquare, roles: ['Super Admin', 'Manager/Supervisor', 'Legal Staff', 'Admin', 'Notary', 'Client'] },
    { id: 'ai', label: 'AI Helper', icon: Sparkles, roles: ['Super Admin', 'Manager/Supervisor', 'Legal Staff', 'Admin'] },
  ];

  const moreMenuItems = [
    { id: 'dashboard', label: 'Dashboard Utama', icon: Zap },
    { id: 'clients', label: 'Klien & Perusahaan', icon: Users },
    { id: 'services', label: 'Layanan Legalitas', icon: BookOpen },
    { id: 'documents', label: 'Dokumen Legal', icon: FileText },
    { id: 'approvals', label: 'Persetujuan Approval', icon: CheckSquare, badge: pendingApprovalsCount },
    { id: 'calendar', label: 'Kalender Deadline', icon: Calendar },
    { id: 'finance', label: 'Keuangan & Invoice', icon: CreditCard },
    { id: 'reports', label: 'Laporan Pekerjaan', icon: BarChart3 },
    { id: 'audit', label: 'Audit Trail & Log', icon: ShieldAlert },
  ];

  const filteredPrimaryTabs = primaryMobileTabs.filter(t => t.roles.includes(userRole));

  return (
    <>
      {/* Mobile Bottom Navigation Bar (Visible on mobile/tablet screens < lg) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-2xl">
        {filteredPrimaryTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setIsMoreOpen(false);
              }}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                isActive ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-indigo-500/20 text-indigo-400' : ''}`}>
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-[10px] mt-0.5">{tab.label}</span>
            </button>
          );
        })}

        <button
          onClick={() => setIsMoreOpen(!isMoreOpen)}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
            isMoreOpen ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-xl transition-all ${isMoreOpen ? 'bg-indigo-500/20 text-indigo-400' : ''}`}>
            {isMoreOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </div>
          <span className="text-[10px] mt-0.5">Lainnya</span>
        </button>
      </nav>

      {/* Mobile "More" Drawer Sheet */}
      {isMoreOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-slate-950/80 backdrop-blur-sm flex flex-col justify-end p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3 mb-16 shadow-2xl max-h-[75vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Modul Tambahan OS</h3>
              <button
                onClick={() => setIsMoreOpen(false)}
                className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white"
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
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMoreOpen(false);
                    }}
                    className={`flex items-center gap-2.5 p-3 rounded-2xl border text-xs font-bold transition-all ${
                      isActive
                        ? 'border-indigo-500 bg-indigo-600 text-white'
                        : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                    {item.badge && item.badge > 0 ? (
                      <span className="ml-auto px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[9px] font-black">
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
