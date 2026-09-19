'use client';

import React, { useState } from 'react';
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
  ChevronRight,
  ChevronDown,
  Layers
} from 'lucide-react';
import { UserRole } from '../types/legal';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingApprovalsCount: number;
  userRole: UserRole;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
  badge?: number;
}

interface MenuGroup {
  groupLabel: string;
  items: MenuItem[];
  defaultOpen?: boolean;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  pendingApprovalsCount,
  userRole
}: SidebarProps) {
  const isStaffRole = ['super_admin', 'admin', 'technical'].includes(userRole);

  // Grouped menu structure for staff/admin roles
  const menuGroups: MenuGroup[] = [
    {
      groupLabel: 'Quick Actions',
      defaultOpen: true,
      items: [
        { id: 'todays_actions', label: "Today's Actions", icon: Zap, roles: ['super_admin', 'admin', 'technical'] },
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['super_admin', 'admin', 'technical', 'finance', 'notary', 'client'] },
      ]
    },
    {
      groupLabel: 'Manajemen',
      defaultOpen: true,
      items: [
        { id: 'workorders', label: 'Work Orders', icon: FolderKanban, roles: ['super_admin', 'admin', 'technical', 'client', 'notary'] },
        { id: 'clients', label: 'Klien & Perusahaan', icon: Users, roles: ['super_admin', 'admin', 'technical', 'finance'] },
        { id: 'services', label: 'Layanan Legalitas', icon: BookOpen, roles: ['super_admin', 'admin', 'technical', 'client'] },
        { id: 'approvals', label: 'Persetujuan', icon: CheckSquare, badge: pendingApprovalsCount, roles: ['super_admin', 'admin', 'technical'] },
        { id: 'whatsapp', label: 'WA Proxy Hub', icon: MessageSquare, roles: ['super_admin', 'admin', 'technical', 'finance', 'notary', 'client'] },
      ]
    },
    {
      groupLabel: 'Notaris',
      defaultOpen: true,
      items: [
        { id: 'notary_tasks', label: 'Tugas Notaris', icon: FileCheck2, roles: ['notary'] },
        { id: 'public_form', label: 'Back Data & ZIP', icon: Archive, roles: ['notary'] },
      ]
    },
    {
      groupLabel: 'Keuangan & Laporan',
      defaultOpen: false,
      items: [
        { id: 'finance', label: 'Invoice & Billing', icon: CreditCard, roles: ['finance'] },
        { id: 'reports', label: 'Laporan', icon: BarChart3, roles: ['super_admin', 'admin', 'finance'] },
      ]
    },
    {
      groupLabel: 'Sistem',
      defaultOpen: false,
      items: [
        { id: 'audit', label: 'Audit Trail', icon: ShieldAlert, roles: ['super_admin', 'admin'] },
      ]
    },
  ];

  // For non-staff roles, use flat list
  const flatMenuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['super_admin', 'admin', 'technical', 'finance', 'notary', 'client'] },
    { id: 'workorders', label: 'Work Orders', icon: FolderKanban, roles: ['super_admin', 'admin', 'technical', 'client', 'notary'] },
    { id: 'services', label: 'Layanan Legalitas', icon: BookOpen, roles: ['super_admin', 'admin', 'technical', 'client'] },
    { id: 'whatsapp', label: 'WA Proxy Hub', icon: MessageSquare, roles: ['super_admin', 'admin', 'technical', 'finance', 'notary', 'client'] },
    { id: 'clients', label: 'Klien & Perusahaan', icon: Users, roles: ['super_admin', 'admin', 'technical', 'finance'] },
    { id: 'notary_tasks', label: 'Tugas Notaris', icon: FileCheck2, roles: ['notary'] },
    { id: 'public_form', label: 'Back Data & ZIP', icon: Archive, roles: ['notary'] },
    { id: 'finance', label: 'Invoice & Billing', icon: CreditCard, roles: ['finance'] },
    { id: 'reports', label: 'Laporan', icon: BarChart3, roles: ['super_admin', 'admin', 'finance'] },
    { id: 'client_portal', label: 'Portal Klien', icon: Layers, roles: ['client'] },
  ];

  // Determine which groups have active items to auto-open
  const groupsWithActiveTab = menuGroups
    .filter(g => g.items.some(i => i.id === activeTab && i.roles.includes(userRole)))
    .map(g => g.groupLabel);

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    menuGroups.forEach(g => {
      initial[g.groupLabel] = g.defaultOpen || groupsWithActiveTab.includes(g.groupLabel);
    });
    return initial;
  });

  const toggleGroup = (label: string) => {
    setOpenGroups(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const renderMenuItem = (item: MenuItem) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;
    return (
      <button
        key={item.id}
        onClick={() => setActiveTab(item.id)}
        className={`group flex w-full items-center justify-between rounded-lg px-2.5 py-[7px] text-[12px] font-semibold transition-all cursor-pointer ${
          isActive
            ? 'bg-indigo-50 text-indigo-700 font-bold'
            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
        }`}
      >
        <div className="flex items-center gap-2">
          <Icon 
            className={`h-[15px] w-[15px] shrink-0 transition-colors ${
              isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-500'
            }`} 
          />
          <span className="truncate">{item.label}</span>
        </div>
        <div className="flex items-center gap-1">
          {item.badge && item.badge > 0 ? (
            <span 
              className="rounded-full px-1.5 text-[9px] font-black bg-amber-100 text-amber-700 border border-amber-200 leading-[16px]"
            >
              {item.badge}
            </span>
          ) : null}
          {isActive && <ChevronRight className="h-3 w-3 shrink-0 text-indigo-500" />}
        </div>
      </button>
    );
  };

  return (
    <aside 
      className="hidden lg:flex w-[230px] flex-col shrink-0 select-none bg-white border-r border-slate-200"
    >
      {/* Brand Header */}
      <div className="flex h-14 items-center gap-2.5 px-4 shrink-0 border-b border-slate-200">
        <div 
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 shadow-sm shrink-0"
        >
          <Scale className="h-3.5 w-3.5 text-white" />
        </div>
        <div>
          <h1 className="text-[13px] font-extrabold tracking-tight text-slate-900 flex items-center gap-1.5">
            LexiFlow
            <span 
              className="text-[8px] font-extrabold uppercase tracking-widest px-1 rounded bg-indigo-50 text-indigo-600 border border-indigo-200"
            >
              PRO
            </span>
          </h1>
          <p className="text-[9px] font-semibold text-slate-400">Legal Work OS</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto no-scrollbar py-2 px-2.5">
        {isStaffRole ? (
          /* Grouped Navigation for Staff/Admin */
          <div className="space-y-0.5">
            {menuGroups.map((group) => {
              const visibleItems = group.items.filter(i => i.roles.includes(userRole));
              if (visibleItems.length === 0) return null;
              
              const isOpen = openGroups[group.groupLabel] ?? true;
              const hasActive = visibleItems.some(i => i.id === activeTab);

              return (
                <div key={group.groupLabel}>
                  <button
                    onClick={() => toggleGroup(group.groupLabel)}
                    className={`flex w-full items-center justify-between px-2.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wider rounded-md transition-all cursor-pointer ${
                      hasActive ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <span>{group.groupLabel}</span>
                    <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isOpen ? '' : '-rotate-90'}`} />
                  </button>
                  
                  {isOpen && (
                    <div className="space-y-px pb-1">
                      {visibleItems.map(renderMenuItem)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* Flat Navigation for Client/Notary/Finance */
          <div className="space-y-px pt-1">
            <p className="px-2.5 pb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Menu
            </p>
            {flatMenuItems
              .filter(item => item.roles.includes(userRole))
              .map(renderMenuItem)
            }
          </div>
        )}
      </div>

      {/* Footer Status */}
      <div className="p-2.5 shrink-0 border-t border-slate-100">
        <div className="rounded-lg p-2.5 bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-600">
            <Sparkles className="h-3 w-3" />
            <span>Gotong Royong AI</span>
          </div>
          <p className="mt-0.5 text-[9px] text-slate-400 leading-tight">
            OCR, WA Proxy & Workflow.
          </p>
        </div>
      </div>
    </aside>
  );
}
