'use client';

import React, { useState } from 'react';
import { 
  Scale, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles,
  UserCheck,
  ShieldCheck,
  KeyRound,
  Building2,
  CheckCircle2,
  Fingerprint,
  Globe,
  Layers,
  ShieldAlert
} from 'lucide-react';
import { User, UserRole } from '../types/legal';

interface LoginPageProps {
  users: User[];
  onLogin: (user: User) => void;
}

export default function LoginPage({ users, onLogin }: LoginPageProps) {
  const [authMethod, setAuthMethod] = useState<'IAM_SSO' | 'EMAIL_PASS'>('IAM_SSO');
  const [email, setEmail] = useState('maya.putri@lexiflow.co.id');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [showMfa, setShowMfa] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [ssoProvider, setSsoProvider] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      const matchedUser = users.find(u => u.email.toLowerCase() === email.toLowerCase()) || 
                          users.find(u => u.role === selectedRole) || 
                          users[0];
      setIsLoading(false);
      onLogin(matchedUser);
    }, 600);
  };

  const handleSsoLogin = (provider: string, targetRole: UserRole) => {
    setSsoProvider(provider);
    setIsLoading(true);
    setTimeout(() => {
      const targetUser = users.find(u => u.role === targetRole) || users[0];
      setIsLoading(false);
      onLogin(targetUser);
    }, 800);
  };

  const handleQuickRoleSelect = (user: User) => {
    setEmail(user.email);
    setSelectedRole(user.role);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin(user);
    }, 400);
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-slate-50 relative overflow-hidden select-none p-4">
      {/* Background Micro Accents */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-indigo-100/50 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-purple-100/50 blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg relative z-10 space-y-5">
        {/* IAM Trust Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" /> Enterprise IAM Identity Engine v4.2
          </div>
          <div className="flex items-center justify-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Scale className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              LexiFlow <span className="text-xs font-black uppercase tracking-widest px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">IAM Portal</span>
            </h1>
          </div>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Sistem Autentikasi Terpusat Identity & Access Management (IAM) dengan Zero-Trust Security & Multi-Tenant Role Policies
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xl space-y-6">
          {/* IAM Authentication Method Switcher */}
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200">
            <button
              type="button"
              onClick={() => setAuthMethod('IAM_SSO')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                authMethod === 'IAM_SSO' 
                  ? 'bg-white text-indigo-600 shadow-xs' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <KeyRound className="h-3.5 w-3.5" /> Identity Provider (SSO)
            </button>
            <button
              type="button"
              onClick={() => setAuthMethod('EMAIL_PASS')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                authMethod === 'EMAIL_PASS' 
                  ? 'bg-white text-indigo-600 shadow-xs' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Mail className="h-3.5 w-3.5" /> Kredensial Direct
            </button>
          </div>

          {authMethod === 'IAM_SSO' ? (
            /* IAM Enterprise SSO Options */
            <div className="space-y-3">
              <div className="text-center">
                <h3 className="text-sm font-extrabold text-slate-900">Single Sign-On (IAM SSO)</h3>
                <p className="text-xs text-slate-500 mt-0.5">Masuk menggunakan protokol OIDC / SAML 2.0 Identity Provider perusahaan Anda</p>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleSsoLogin('Google Workspace IAM', 'admin')}
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-between transition-all group shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center text-xs font-black">
                      G
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-slate-900">Google Workspace IAM</p>
                      <p className="text-[10px] text-slate-400">OAuth 2.0 / SAML Single Sign-On</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                </button>

                <button
                  type="button"
                  onClick={() => handleSsoLogin('Microsoft Entra ID', 'super_admin')}
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-between transition-all group shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-black">
                      MS
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-slate-900">Microsoft Entra ID (Azure AD)</p>
                      <p className="text-[10px] text-slate-400">Enterprise Tenant Directory Sync</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                </button>

                <button
                  type="button"
                  onClick={() => handleSsoLogin('Okta IAM Provider', 'technical')}
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-between transition-all group shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center text-xs font-black">
                      OK
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-slate-900">Okta Identity Cloud</p>
                      <p className="text-[10px] text-slate-400">IAM Policy & Zero-Trust MFA</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                </button>
              </div>

              {ssoProvider && isLoading && (
                <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-center space-y-1.5 animate-in fade-in">
                  <div className="inline-block h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-bold text-indigo-900">Memverifikasi Token IAM via {ssoProvider}...</p>
                </div>
              )}
            </div>
          ) : (
            /* Email & Password IAM Credential Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                  Identity Identifier (Email / IAM User ID)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@perusahaan.com"
                    className="w-full rounded-xl py-2.5 pl-10 pr-4 text-xs bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-extrabold text-slate-700">
                    Kata Sandi IAM
                  </label>
                  <a href="#" className="text-[11px] font-bold text-indigo-600 hover:underline">
                    Reset kredensial IAM?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-xl py-2.5 pl-10 pr-10 text-xs bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    defaultChecked 
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" 
                  />
                  <span className="text-xs font-semibold text-slate-600">Simpan Sesi IAM (30 Hari)</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-extrabold text-xs shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isLoading ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Autentikasi Identity & Masuk</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* IAM Role-Based Access Control (RBAC) Selector Demo */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-indigo-600" /> Simulasi Role IAM (RBAC Demo)
              </span>
              <span className="text-[10px] font-bold text-slate-400">5 Scope Role</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {users.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleQuickRoleSelect(u)}
                  className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 text-left transition-all group"
                >
                  <div className="h-7 w-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-black group-hover:bg-indigo-600 group-hover:text-white transition-colors shrink-0">
                    {u.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="truncate min-w-0">
                    <p className="text-[11px] font-bold text-slate-900 truncate">{u.name.split(' ')[0]}</p>
                    <p className="text-[9px] font-bold text-slate-500 truncate">{u.role}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Security & IAM Metadata Footer */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 px-2">
          <span className="flex items-center gap-1">
            <Fingerprint className="h-3.5 w-3.5 text-emerald-600" /> TLS 1.3 Encryption
          </span>
          <span>LexiFlow IAM Server v2026</span>
          <span className="flex items-center gap-1">
            <Globe className="h-3.5 w-3.5 text-indigo-500" /> Multi-Tenant
          </span>
        </div>
      </div>
    </div>
  );
}
