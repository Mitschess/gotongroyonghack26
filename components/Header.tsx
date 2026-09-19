'use client';

import React, { useState } from 'react';
import { 
  Bell, 
  Search, 
  Plus, 
  ChevronDown, 
  Building2,
  Settings,
  LogOut
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
  onLogout?: () => void;
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
  activeTab,
  onLogout
}: HeaderProps) {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const roleColors: Record<UserRole, { bg: string; text: string; border: string }> = {
    'Super Admin':        { bg: '#EEF2FF', text: '#4F46E5', border: '#C7D2FE' },
    'Manager/Supervisor': { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' },
    'Legal Staff':        { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0' },
    'Admin':              { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' },
    'Finance':            { bg: '#ECFEFF', text: '#0891B2', border: '#A5F3FC' },
    'Client':             { bg: '#FDF2F8', text: '#DB2777', border: '#FBCFE8' },
  };

  const rc = roleColors[currentUser.role];

  return (
    <header
      className="sticky top-0 z-30 flex h-14 w-full items-center justify-between px-4 md:px-6 bg-white border-b border-slate-200 transition-colors select-none"
    >
      {/* Left: Search Input */}
      <div className="flex items-center gap-3 flex-1 max-w-sm">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder={`Cari di ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl py-1.5 pl-8 pr-4 text-xs bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Quick Actions */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={onOpenNewClient}
            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all"
          >
            <Building2 className="h-3.5 w-3.5 text-indigo-600" />
            + Client
          </button>
          <button
            onClick={onOpenNewWO}
            className="flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            Buat Work Order
          </button>
        </div>

        {/* Divider */}
        <div className="h-5 w-px hidden sm:block bg-slate-200" />

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span 
                className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-black text-white bg-rose-500"
              >
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div 
              className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl p-4 shadow-xl bg-white border border-slate-200 z-50 animate-in fade-in duration-150"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-indigo-600" />
                  <h4 className="text-sm font-extrabold text-slate-900">Notifikasi System</h4>
                </div>
                <span 
                  className="rounded-full px-2 py-0.5 text-xs font-bold bg-indigo-50 text-indigo-600 border border-indigo-100"
                >
                  {unreadCount} Baru
                </span>
              </div>

              <div className="mt-3 max-h-72 overflow-y-auto divide-y divide-slate-100 pr-1">
                {notifications.length === 0 ? (
                  <p className="py-6 text-center text-xs text-slate-500">Tidak ada notifikasi saat ini.</p>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => onMarkNotificationRead(notif.id)}
                      className="cursor-pointer py-3 transition-all rounded-xl px-2 -mx-2 hover:bg-slate-50"
                      style={{ opacity: notif.read ? 0.5 : 1 }}
                    >
                      <div className="flex items-start justify-between">
                        <p className="text-xs font-bold text-slate-900">{notif.title}</p>
                        <span className="text-[10px] text-slate-400 shrink-0 ml-2">{notif.timestamp}</span>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-600">{notif.message}</p>
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
            className="flex items-center gap-2 rounded-xl p-1.5 pr-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all"
          >
            <div 
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-bold text-white bg-indigo-600 shrink-0 shadow-xs"
            >
              {currentUser.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-slate-900 leading-tight">{currentUser.name.split(' ')[0]}</p>
              <span 
                className="text-[9px] font-bold px-1.5 py-0.2 rounded"
                style={{ background: rc.bg, color: rc.text, border: `1px solid ${rc.border}` }}
              >
                {currentUser.role}
              </span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {showRoleMenu && (
            <div 
              className="absolute right-0 mt-2 w-64 rounded-2xl p-3 shadow-xl bg-white border border-slate-200 z-50 animate-in fade-in duration-150"
            >
              <div className="px-2 py-1.5 mb-2 border-b border-slate-100">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Simulasi Role User</p>
                <p className="text-xs text-slate-500 mt-0.5">Pilih pengguna untuk menguji akses:</p>
              </div>

              <div className="space-y-1">
                {users.map((u) => {
                  const urc = roleColors[u.role];
                  return (
                    <button
                      key={u.id}
                      onClick={() => { onRoleChange(u); setShowRoleMenu(false); }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition-all ${
                        u.id === currentUser.id
                          ? 'bg-indigo-50 text-indigo-700 font-bold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div>
                        <p className="font-semibold">{u.name}</p>
                        <span className="text-[10px] text-slate-400">{u.department}</span>
                      </div>
                      <span 
                        className="rounded px-1.5 py-0.2 text-[9px] font-bold"
                        style={{ background: urc.bg, color: urc.text, border: `1px solid ${urc.border}` }}
                      >
                        {u.role}
                      </span>
                    </button>
                  );
                })}
              </div>

              {onLogout && (
                <div className="pt-2 mt-2 border-t border-slate-100">
                  <button
                    onClick={() => { setShowRoleMenu(false); onLogout(); }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 transition-all"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Keluar (Halaman Login)</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
