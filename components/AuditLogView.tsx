'use client';

import React, { useState } from 'react';
import { 
  ShieldAlert, 
  UserCheck, 
  Shield, 
  KeyRound, 
  Activity, 
  Search, 
  Filter,
  Lock,
  CheckCircle2
} from 'lucide-react';
import { ActivityLog, User } from '../types/legal';

interface AuditLogViewProps {
  activityLogs: ActivityLog[];
  users: User[];
}

export default function AuditLogView({
  activityLogs,
  users
}: AuditLogViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'audit' | 'users'>('audit');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = activityLogs.filter(l => {
    return l.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
           l.targetObject.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-indigo-500" /> Audit Trail & System Administration
          </h2>
          <p className="text-xs text-slate-500">Pencatatan aktivitas sensitif pengguna, ip address, dan peran sistem (FR-37)</p>
        </div>

        {/* Subtab Toggle */}
        <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1">
          <button
            onClick={() => setActiveSubTab('audit')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeSubTab === 'audit'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Activity className="h-3.5 w-3.5" /> Log Aktivitas (Audit Trail)
          </button>
          <button
            onClick={() => setActiveSubTab('users')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeSubTab === 'users'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <UserCheck className="h-3.5 w-3.5" /> Daftar User & Roles (RBAC)
          </button>
        </div>
      </div>

      {activeSubTab === 'audit' ? (
        <div className="space-y-4">
          {/* Search */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-sm flex items-center gap-2">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari log berdasarkan nama user, aksi, atau objek..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
            />
          </div>

          {/* Audit Logs Table */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Pengguna (User)</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Tindakan / Action</th>
                    <th className="py-3.5 px-4">Objek / Target Data</th>
                    <th className="py-3.5 px-4">Waktu (Timestamp)</th>
                    <th className="py-3.5 px-4">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">{log.userName}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-500">
                          {log.userRole}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-indigo-600 dark:text-indigo-400">{log.action}</td>
                      <td className="py-3 px-4">{log.targetObject}</td>
                      <td className="py-3 px-4 font-mono text-slate-500">{log.timestamp}</td>
                      <td className="py-3 px-4 font-mono text-slate-400">{log.ipAddress || '127.0.0.1'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Users & Roles Management Table */
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Nama Pengguna</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Role Hak Akses</th>
                  <th className="py-3.5 px-4">Departemen</th>
                  <th className="py-3.5 px-4">Izin Akses Utama</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">{u.name}</td>
                    <td className="py-3 px-4 text-slate-500">{u.email}</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-indigo-600 text-white">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">{u.department}</td>
                    <td className="py-3 px-4 text-slate-500">
                      {u.role === 'Super Admin' && 'Full Access All Modules'}
                      {u.role === 'Manager/Supervisor' && 'Approval, Task Assignment, Reports, WO'}
                      {u.role === 'Legal Staff' && 'View & Update Tasks, Upload Docs, Work Notes'}
                      {u.role === 'Admin' && 'Client Reg, Service Requests, Administrative'}
                      {u.role === 'Finance' && 'Billing, Invoicing, Payment Tracking'}
                      {u.role === 'Client' && 'View My WO Status, View Documents'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
