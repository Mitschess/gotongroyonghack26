'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Scale, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { User, UserRole } from '../types/legal';

interface LoginPageProps {
  users: User[];
  onLogin: (user: User) => void;
}

const ROLE_META: Record<UserRole, { label: string; color: string; dot: string }> = {
  super_admin: { label: 'Super Admin',    color: 'text-indigo-600',  dot: 'bg-indigo-500' },
  admin:       { label: 'Legal Manager',  color: 'text-blue-600',    dot: 'bg-blue-500' },
  technical:   { label: 'Legal Staff',    color: 'text-emerald-600', dot: 'bg-emerald-500' },
  finance:     { label: 'Finance',        color: 'text-cyan-600',    dot: 'bg-cyan-500' },
  notary:      { label: 'Notaris',        color: 'text-purple-600',  dot: 'bg-purple-500' },
  client:      { label: 'Klien',          color: 'text-rose-600',    dot: 'bg-rose-400' },
};

export default function LoginPage({ users, onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowRoleDropdown(false);
      }
    };
    if (showRoleDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showRoleDropdown]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      const matched = users.find(u => u.email.toLowerCase() === email.toLowerCase()) || users[0];
      setIsLoading(false);
      onLogin(matched);
    }, 600);
  };

  const handleQuickLogin = (user: User) => {
    setLoadingUserId(user.id);
    setTimeout(() => {
      setLoadingUserId(null);
      onLogin(user);
    }, 420);
  };

  return (
    <div className="min-h-screen w-full flex bg-white">
      {/* ── Left Panel (hidden on mobile) ── */}
      <div className="hidden lg:flex lg:w-[420px] xl:w-[480px] shrink-0 flex-col justify-between bg-slate-950 p-10 relative overflow-hidden">
        {/* Subtle grid texture */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        {/* Glow blobs */}
        <div className="absolute -top-32 -left-32 w-64 h-64 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full bg-violet-600/15 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          {/* Brand */}
          <div className="flex items-center gap-2.5 mb-12">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-md">
              <Scale className="h-4 w-4 text-white" />
            </div>
            <span className="text-white font-black text-base tracking-tight">Waktunya Legal</span>
            <span className="text-[9px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded bg-white/10 text-white/60 border border-white/10">
              PRO
            </span>
          </div>

          {/* Hero copy */}
          <div className="space-y-4 mb-10">
            <h2 className="text-3xl font-black text-white leading-tight tracking-tight">
              Legal Work<br />Management System
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Platform terpadu untuk manajemen work order, notaris, klien, dan keuangan legalitas perusahaan.
            </p>
          </div>

          {/* Feature points */}
          {[
            'Work Order & Task Tracking',
            'Notaris Document ZIP Exporter',
            'Multi-Role IAM Access Control',
            'Invoice & Billing Otomatis',
          ].map((f) => (
            <div key={f} className="flex items-center gap-2.5 py-2 border-b border-white/5">
              <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 shrink-0" />
              <span className="text-xs text-slate-300 font-medium">{f}</span>
            </div>
          ))}
        </div>

        <p className="relative z-10 text-[11px] text-slate-600">
          © 2026 Waktunya Legal · Legal OS v2026
        </p>
      </div>

      {/* ── Right Panel ── */}
      <div className="flex flex-1 flex-col justify-center items-center p-6 sm:p-10 bg-slate-50">
        <div className="w-full max-w-[400px] space-y-7">

          {/* Mobile brand */}
          <div className="flex lg:hidden items-center gap-2 mb-2">
            <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Scale className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-black text-sm text-slate-900">Waktunya Legal</span>
          </div>

          {/* Heading */}
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Masuk ke akun</h1>
            <p className="text-sm text-slate-500">Gunakan email atau pilih role untuk demo.</p>
          </div>

          {/* Email/Pass form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@perusahaan.com"
                  className="w-full rounded-xl py-2.5 pl-10 pr-4 text-sm bg-white border border-slate-200 text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">Password</label>
                <a href="#" className="text-[11px] font-semibold text-indigo-600 hover:underline">Lupa password?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl py-2.5 pl-10 pr-10 text-sm bg-white border border-slate-200 text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isLoading
                ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <><span>Masuk</span><ArrowRight className="h-4 w-4" /></>
              }
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-[11px] font-semibold text-slate-400">atau masuk sebagai</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Quick Role Login - Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/50 transition-all disabled:opacity-50 cursor-pointer"
              disabled={loadingUserId !== null}
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-[11px] font-black text-slate-600 shrink-0">
                  👤
                </div>
                <div className="text-left flex-1 text-slate-900 font-medium text-sm">
                  Pilih role untuk demo
                </div>
              </div>
              <ChevronDown className={`h-3.5 w-3.5 text-slate-300 transition-transform ${showRoleDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showRoleDropdown && (
              <div ref={dropdownRef} className="absolute z-10 bottom-full left-0 right-0 mb-1.5 rounded-xl border border-slate-200 bg-white shadow-xl py-1 animate-in fade-in-0 zoom-in-95 duration-150">
                {users.map((u) => {
                  const meta = ROLE_META[u.role];
                  const isThisLoading = loadingUserId === u.id;
                  return (
                    <button
                      key={u.id}
                      id={`quick-login-${u.role}`}
                      type="button"
                      onClick={() => { handleQuickLogin(u); setShowRoleDropdown(false); }}
                      disabled={loadingUserId !== null}
                      className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-left transition-all hover:bg-indigo-50/50 disabled:opacity-50 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-[11px] font-black text-slate-600 shrink-0">
                          {u.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-bold text-slate-900 leading-tight">{u.name.split(',')[0]}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`inline-block h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                            <span className={`text-[10px] font-semibold ${meta.color}`}>{meta.label}</span>
                          </div>
                        </div>
                      </div>
                      {isThisLoading
                        ? <div className="h-3.5 w-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin shrink-0" />
                        : <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />
                      }
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Fill Demo Data Button */}
          <button
            type="button"
            onClick={() => {
              setEmail('admin@legal.com');
              setPassword('demo123');
            }}
            disabled={isLoading || loadingUserId !== null}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 border border-slate-200 bg-slate-50 text-slate-600 font-medium text-sm hover:bg-slate-100 hover:border-slate-300 transition-all disabled:opacity-50 cursor-pointer"
          >
            <span className="text-[11px]">🪄</span>
            <span>Isi Otomatis (Demo Admin)</span>
          </button>

          {/* Footer note */}
          <p className="text-center text-[11px] text-slate-400">
            Protected by TLS 1.3 · Waktunya Legal Legal OS © 2026
          </p>
        </div>
      </div>
    </div>
  );
}
