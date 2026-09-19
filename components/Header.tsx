'use client';

import React, { useState } from 'react';
import { 
  Bell, 
  Search, 
  Plus, 
  ShieldCheck, 
  UserCheck, 
  ChevronDown, 
  Sparkles, 
  CheckCircle2,
  Clock,
  FileText,
  Building2,
  Briefcase
} from 'lucide-react';
import { User, UserRole, NotificationItem } from '../types/legal';

interface HeaderProps {
  currentUser: User;
  users: User[];
  onRoleChange: (user: User) => void;
  notifications: NotificationItem[];
  onMarkNotificationRead: (id: string) => void;
  onOpenNewWO: () => void;
  onOpenNewClient: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeTab: string;
}

export default function Header({
  currentUser,
  users,
  onRoleChange,
  notifications,
  onMarkNotificationRead,
  onOpenNewWO,
  onOpenNewClient,
  searchQuery,
  setSearchQuery,
  activeTab
}: HeaderProps) {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const roleColors: Record<UserRole, string> = {
    'Super Admin': 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
    'Manager/Supervisor': 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
    'Legal Staff': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    'Admin': 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
    'Finance': 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
    'Client': 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 px-4 md:px-6 backdrop-blur-md transition-colors">
      {/* Search Input */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder={`Cari project, client, dokumen di ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-2 pl-9 pr-4 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
        </div>
      </div>

      {/* Action Buttons & Profile Controls */}
      <div className="flex items-center gap-3">
        {/* Quick Action Buttons */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={onOpenNewClient}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
          >
            <Building2 className="h-3.5 w-3.5 text-indigo-500" />
            + Client Baru
          </button>
          <button
            onClick={onOpenNewWO}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            Buat Work Order
          </button>
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-xl border border-slate-200 dark:border-slate-800 p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xl z-50">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-indigo-500" />
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Notifikasi Sistem</h4>
                </div>
                <span className="rounded-full bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  {unreadCount} Baru
                </span>
              </div>

              <div className="mt-3 max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 pr-1">
                {notifications.length === 0 ? (
                  <p className="py-6 text-center text-xs text-slate-500">Tidak ada notifikasi saat ini.</p>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => onMarkNotificationRead(notif.id)}
                      className={`cursor-pointer py-3 transition-colors ${
                        notif.read ? 'opacity-60' : 'bg-indigo-50/40 dark:bg-indigo-950/20 px-2 rounded-lg'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">{notif.title}</p>
                        <span className="text-[10px] text-slate-400">{notif.timestamp}</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{notif.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Role Switcher & User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-1.5 pr-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white shadow-inner">
              {currentUser.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-tight">{currentUser.name}</p>
              <span className={`mt-0.5 inline-block rounded border px-1.5 py-0.2 text-[10px] font-semibold ${roleColors[currentUser.role]}`}>
                {currentUser.role}
              </span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {/* Role Selection Menu */}
          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-xl z-50">
              <div className="px-2 py-1.5 border-b border-slate-100 dark:border-slate-800">
                <p className="text-[11px] font-semibold uppercase text-slate-400">Simulasi Akses User Role (RBAC)</p>
                <p className="text-xs text-slate-500">Pilih role untuk menguji tampilan & izin:</p>
              </div>

              <div className="mt-2 space-y-1">
                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      onRoleChange(u);
                      setShowRoleMenu(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition-all ${
                      u.id === currentUser.id
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 font-bold text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <p>{u.name}</p>
                      <span className="text-[10px] text-slate-400">{u.department}</span>
                    </div>
                    <span className={`rounded border px-1.5 py-0.5 text-[9px] font-semibold ${roleColors[u.role]}`}>
                      {u.role}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
