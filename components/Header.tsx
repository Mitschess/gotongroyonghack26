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
    'super_admin': { bg: '#EEF2FF', text: '#4F46E5', border: '#C7D2FE' },
    'admin':       { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' },
    'technical':   { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0' },
    'finance':     { bg: '#ECFEFF', text: '#0891B2', border: '#A5F3FC' },
    'notary':      { bg: '#F3E8FF', text: '#7E22CE', border: '#E9D5FF' },
    'client':      { bg: '#FDF2F8', text: '#DB2777', border: '#FBCFE8' },
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
          {['super_admin', 'admin', 'technical', 'finance'].includes(currentUser.role) && (
            <button
              onClick={onOpenNewClient}
              className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
            >
              <Building2 className="h-3.5 w-3.5 text-indigo-600" />
              + Client
            </button>
          )}
          {['super_admin', 'admin', 'technical'].includes(currentUser.role) && (
            <button
              onClick={onOpenNewWO}
              className="flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-xs cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              Buat Work Order
            </button>
          )}
          {currentUser.role === 'client' && (
            <button
              onClick={() => onOpenNewWO()}
              className="flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-xs cursor-pointer"
            >
              Lihat Order Saya
            </button>
          )}
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
            className="flex items-center gap-2.5 p-1 pl-1.5 pr-3 rounded-full hover:bg-slate-100/80 transition-all duration-200 group cursor-pointer"
          >
            <div className="relative shrink-0">
              <div 
                className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-black text-white bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-sm ring-2 ring-indigo-500/20 group-hover:ring-indigo-500/40 transition-all"
              >
                {currentUser.name.substring(0, 2).toUpperCase()}
              </div>
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>
            
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight flex items-center gap-1">
                {currentUser.name.split(' ')[0]}
              </p>
              <span 
                className="inline-block text-[9px] font-extrabold px-1.5 py-0.2 rounded-full capitalize"
                style={{ background: rc.bg, color: rc.text, border: `1px solid ${rc.border}` }}
              >
                {currentUser.role.replace('_', ' ')}
              </span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600 transition-transform group-hover:translate-y-0.5" />
          </button>

          {showRoleMenu && (
            <div 
              className="absolute right-0 mt-2 w-72 rounded-2xl p-3 shadow-2xl bg-white border border-slate-200/90 z-50 animate-in fade-in zoom-in-95 duration-150"
            >
              {/* User Identity Header */}
              <div className="p-3 mb-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-black text-white bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-xs shrink-0">
                  {currentUser.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-extrabold text-slate-900 truncate">{currentUser.name}</p>
                  <p className="text-[10px] text-slate-500 truncate">{currentUser.email}</p>
                  <span 
                    className="inline-block text-[9px] font-bold px-2 py-0.2 rounded-full mt-1 capitalize"
                    style={{ background: rc.bg, color: rc.text, border: `1px solid ${rc.border}` }}
                  >
                    {currentUser.role.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="px-2 py-1 mb-1">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Simulasi Role (RBAC)</p>
              </div>

              <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
                {users.map((u) => {
                  const urc = roleColors[u.role];
                  const isCurrent = u.id === currentUser.id;
                  return (
                    <button
                      key={u.id}
                      onClick={() => { onRoleChange(u); setShowRoleMenu(false); }}
                      className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs transition-all ${
                        isCurrent
                          ? 'bg-indigo-50 text-indigo-700 font-extrabold border border-indigo-100'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <p className="font-bold truncate text-xs">{u.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{u.department}</p>
                      </div>
                      <span 
                        className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold capitalize"
                        style={{ background: urc.bg, color: urc.text, border: `1px solid ${urc.border}` }}
                      >
                        {u.role.replace('_', ' ')}
                      </span>
                    </button>
                  );
                })}
              </div>

              {onLogout && (
                <div className="pt-2 mt-2 border-t border-slate-100">
                  <button
                    onClick={() => { setShowRoleMenu(false); onLogout(); }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100/80 transition-all"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Keluar (Logout IAM)</span>
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
