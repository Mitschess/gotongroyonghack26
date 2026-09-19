'use client';

import React, { useState } from 'react';
import { 
  MessageSquare, 
  Send, 
  PhoneCall, 
  ShieldCheck, 
  Bot, 
  CheckCheck, 
  Lock, 
  Smartphone,
  RefreshCw,
  Sparkles,
  User as UserIcon,
  Info
} from 'lucide-react';
import { WorkOrder, WhatsAppMessage, User as UserType, UserRole } from '../types/legal';

interface WhatsAppHubViewProps {
  workOrders: WorkOrder[];
  messages: WhatsAppMessage[];
  onSendMessage: (msg: Partial<WhatsAppMessage>) => void;
  currentUser?: UserType;
}

export default function WhatsAppHubView({
  workOrders,
  messages,
  onSendMessage,
  currentUser
}: WhatsAppHubViewProps) {
  const isClient = currentUser?.role === 'client';
  const [selectedWoId, setSelectedWoId] = useState<string>(workOrders[0]?.id || 'wo-101');
  const [senderRole, setSenderRole] = useState<'Client' | 'Notary' | 'Platform'>(isClient ? 'Client' : 'Client');
  const [inputText, setInputText] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');

  const currentWo = workOrders.find(w => w.id === selectedWoId) || workOrders[0];
  const woMessages = messages.filter(m => m.workOrderId === selectedWoId);

  const activeSenderRole = isClient ? 'Client' : senderRole;

  const handleSend = () => {
    if (!inputText.trim() || !currentWo) return;

    const newMsg: Partial<WhatsAppMessage> = {
      workOrderId: currentWo.id,
      workOrderNumber: currentWo.woNumber,
      senderRole: activeSenderRole,
      senderName: activeSenderRole === 'Client' ? (currentUser?.name || currentWo.clientName) : activeSenderRole === 'Notary' ? (currentWo.notaryName || 'Notaris Rekan') : 'LexiFlow Proxy Bot',
      maskedPhone: activeSenderRole === 'Client' ? '0812-****-5432' : activeSenderRole === 'Notary' ? '0815-****-1122' : '0811-0000-PROXY',
      recipientRole: activeSenderRole === 'Client' ? 'Admin' : 'Client',
      messageText: inputText,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      resolutionMethod: inputText.includes(currentWo.woNumber) ? 'EXPLICIT_CODE' : 'REPLY_CONTEXT',
      templateCode: selectedTemplate || undefined,
      status: 'DELIVERED'
    };

    onSendMessage(newMsg);
    setInputText('');
    setSelectedTemplate('');
  };

  const handleApplyTemplate = (code: string, text: string) => {
    setSelectedTemplate(code);
    setInputText(`[${currentWo.woNumber}] ${text}`);
  };

  return (
    <div className="space-y-4 pb-20 md:pb-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-900 via-slate-900 to-emerald-950 p-4 md:p-6 text-white shadow-lg border border-emerald-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold mb-2">
              <ShieldCheck className="h-3.5 w-3.5" /> WhatsApp Business Proxy (BR-WA-001 Compliant)
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight">WhatsApp Communication Proxy Hub</h2>
            <p className="text-xs md:text-sm text-slate-300 mt-1">
              Klien & Notaris berkomunikasi lewat 1 Nomor Resmi Platform. Nomor HP asli dirahasiakan & diproses via Proxy Engine.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-slate-800 text-emerald-400 font-mono text-xs font-bold border border-emerald-500/40 flex items-center gap-1.5">
              <PhoneCall className="h-3.5 w-3.5" /> +62 811-0000-PROXY
            </span>
          </div>
        </div>

        {/* Proxy Model Banner */}
        <div className="mt-4 rounded-xl bg-slate-950/60 p-3 border border-emerald-500/20 text-xs text-slate-300 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-2 shrink-0">
            <UserIcon className="h-4 w-4 text-emerald-400" /> KLIEN
          </div>
          <span className="text-slate-500">↔ (Relay Proxy) ↔</span>
          <div className="flex items-center gap-2 shrink-0">
            <Bot className="h-4 w-4 text-indigo-400" /> PLATFORM OS
          </div>
          <span className="text-slate-500">↔ (Relay Proxy) ↔</span>
          <div className="flex items-center gap-2 shrink-0">
            <Smartphone className="h-4 w-4 text-amber-400" /> NOTARIS
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column: Work Order Select & Template Dispatch */}
        <div className="space-y-4">
          {/* Project Selector Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Pilih Workspace Project
            </h3>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {workOrders.map((wo) => (
                <button
                  key={wo.id}
                  onClick={() => setSelectedWoId(wo.id)}
                  className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all ${
                    selectedWoId === wo.id
                      ? 'border-emerald-500 bg-emerald-500/10 text-slate-900 dark:text-slate-100 font-bold'
                      : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-indigo-600 dark:text-indigo-400">{wo.woNumber}</span>
                    <span className="text-[10px] text-slate-400">{wo.status}</span>
                  </div>
                  <p className="truncate mt-0.5">{wo.clientName}</p>
                </button>
              ))}
            </div>
          </div>

          {/* WhatsApp Template Dispatcher (BR-WA-004) */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm space-y-2">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-emerald-500" /> Official Outbound Templates
            </h3>
            <p className="text-[11px] text-slate-500">Pesan inisiatif di luar jendela layanan dikirim via Template Terdaftar:</p>
            <div className="space-y-1.5 pt-1">
              {[
                { code: 'wa_task_reminder', label: 'Reminder Task Pending', text: 'Halo, pengurusan berkas Anda memerlukan kelengkapan dokumen terbaru.' },
                { code: 'wa_document_ready', label: 'Dokumen Final Siap', text: 'Kabar baik! Dokumen legalitas Anda telah resmi terbit dan siap diunduh.' },
                { code: 'wa_payment_received', label: 'Konfirmasi Pembayaran', text: 'Pembayaran invoice Anda telah berhasil diverifikasi oleh tim keuangan.' },
              ].map((tpl) => (
                <button
                  key={tpl.code}
                  onClick={() => handleApplyTemplate(tpl.code, tpl.text)}
                  className="w-full text-left p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-emerald-500/10 border border-slate-200 dark:border-slate-700 text-xs transition-all"
                >
                  <span className="font-bold text-slate-900 dark:text-slate-100">{tpl.label}</span>
                  <p className="text-[10px] text-slate-400 font-mono truncate">{tpl.code}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Chat Proxy Simulator */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col h-[520px] shadow-sm overflow-hidden">
          {/* Chat Header */}
          <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">{currentWo?.woNumber}</span>
                <span className="px-2 py-0.5 text-[10px] font-extrabold rounded bg-emerald-500/20 text-emerald-400">PROXIED WA</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{currentWo?.clientName}</h3>
            </div>

            {/* Recipient / Sender Info */}
            {isClient ? (
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 text-xs">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Penerima Chat (Admin Legal)</span>
                <span className="font-black text-emerald-800 dark:text-emerald-300">
                  PIC: {currentWo?.picStaffName || 'Tim Legal Platform'}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                <span className="text-[10px] text-slate-400 font-bold px-1 hidden sm:inline">Simulasi Pengirim:</span>
                {(['Client', 'Notary', 'Platform'] as const).map((role) => (
                  <button
                    key={role}
                    onClick={() => setSenderRole(role)}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all text-xs cursor-pointer ${
                      senderRole === role
                        ? 'bg-emerald-600 text-white shadow'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Chat Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50 dark:bg-slate-950/40">
            {woMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 p-6">
                <MessageSquare className="h-10 w-10 text-emerald-500/40 mb-2" />
                <p className="text-xs font-bold">Belum Ada Pesan Proxy WA</p>
                <p className="text-[11px] mt-0.5">Mulai obrolan menggunakan form di bawah untuk menguji relay proxy platform.</p>
              </div>
            ) : (
              woMessages.map((msg) => {
                const isPlatform = msg.senderRole === 'Platform';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col max-w-[85%] ${
                      msg.senderRole === senderRole ? 'ml-auto items-end' : 'mr-auto items-start'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1">
                      <span className="font-bold text-slate-600 dark:text-slate-300">{msg.senderName}</span>
                      <span className="font-mono">({msg.maskedPhone})</span>
                      <span className="px-1 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-[9px]">{msg.resolutionMethod}</span>
                    </div>

                    <div
                      className={`p-3 rounded-2xl text-xs space-y-1 shadow-sm ${
                        msg.senderRole === 'Client'
                          ? 'bg-indigo-600 text-white rounded-tr-none'
                          : msg.senderRole === 'Notary'
                          ? 'bg-amber-600 text-white rounded-tl-none'
                          : 'bg-emerald-600 text-white rounded-t-none'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.messageText}</p>
                      <div className="flex items-center justify-end gap-1 text-[10px] opacity-80 pt-0.5">
                        <span>{msg.timestamp}</span>
                        <CheckCheck className="h-3 w-3" />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={`Kirim pesan relay sebagai ${senderRole}...`}
              className="flex-1 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              onClick={handleSend}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/30 shrink-0"
            >
              <Send className="h-3.5 w-3.5" /> Kirim Relay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
