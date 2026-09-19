'use client';

import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  AlertTriangle, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  X,
  FileCheck,
  CheckCircle2
} from 'lucide-react';
import { CalendarEvent, Priority } from '../types/legal';

interface CalendarViewProps {
  events: CalendarEvent[];
  onAddEvent: (newEvent: Partial<CalendarEvent>) => void;
}

export default function CalendarView({
  events,
  onAddEvent
}: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState('September 2026');
  const [showAddModal, setShowAddModal] = useState(false);

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('2026-09-25');
  const [type, setType] = useState<CalendarEvent['type']>('Deadline');
  const [priority, setPriority] = useState<Priority>('High');

  // Days in September 2026 (Starts on Tuesday, Sept 1)
  const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    onAddEvent({
      title,
      date,
      type,
      priority
    });

    setShowAddModal(false);
    setTitle('');
  };

  const getEventsForDay = (dayNum: number) => {
    const formattedDay = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
    const dateStr = `2026-09-${formattedDay}`;
    return events.filter(e => e.date === dateStr);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-indigo-500" /> Kalender Agenda & Deadline Management
          </h2>
          <p className="text-xs text-slate-500">Penjadwalan rapat notaris, deadline Kemenkumham, & pengajuan perizinan (FR-25 s.d. FR-27)</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" /> Tambah Jadwal / Event
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Monthly Grid (2 Cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          {/* Calendar Header Month Control */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">{currentMonth}</h3>
            <div className="flex items-center gap-1">
              <button className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Days of Week */}
          <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs font-bold uppercase text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>Minggu</div>
            <div>Senin</div>
            <div>Selasa</div>
            <div>Rabu</div>
            <div>Kamis</div>
            <div>Jumat</div>
            <div>Sabtu</div>
          </div>

          {/* Grid Cells */}
          <div className="mt-2 grid grid-cols-7 gap-1 min-h-[420px]">
            {/* Blank offset for September 2026 starting on Tuesday */}
            <div className="p-2 border border-transparent" />
            <div className="p-2 border border-transparent" />

            {daysInMonth.map((d) => {
              const dayEvents = getEventsForDay(d);
              const isToday = d === 19;

              return (
                <div
                  key={d}
                  className={`p-1.5 rounded-xl border transition-all min-h-[70px] flex flex-col justify-between ${
                    isToday
                      ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30'
                      : 'border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-950/40'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className={`font-bold ${isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>
                      {d}
                    </span>
                    {isToday && (
                      <span className="text-[9px] font-extrabold uppercase px-1 rounded bg-indigo-600 text-white">Hari ini</span>
                    )}
                  </div>

                  <div className="mt-1 space-y-1 overflow-hidden">
                    {dayEvents.map((ev) => (
                      <div
                        key={ev.id}
                        className={`truncate rounded px-1.5 py-0.5 text-[9px] font-bold ${
                          ev.type === 'Deadline' ? 'bg-rose-500 text-white' :
                          ev.type === 'Meeting' ? 'bg-indigo-600 text-white' :
                          'bg-amber-500 text-slate-950'
                        }`}
                        title={ev.title}
                      >
                        {ev.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Sidebar: Upcoming Deadlines & Event List */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Clock className="h-4 w-4 text-indigo-500" /> Event & Deadline Mendatang
            </h3>

            <div className="mt-4 space-y-3">
              {events.map((ev) => (
                <div key={ev.id} className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 bg-slate-50 dark:bg-slate-950">
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-500">{ev.type}</span>
                    <span className="font-mono text-slate-400">{ev.date}</span>
                  </div>
                  <h4 className="mt-2 text-xs font-bold text-slate-900 dark:text-slate-100">{ev.title}</h4>
                  {ev.relatedWoNumber && (
                    <p className="mt-1 text-[11px] font-mono text-indigo-500">{ev.relatedWoNumber}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Add Event (FR-27) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Tambah Event / Deadline</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Judul Agenda / Task:</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Penandatanganan Notaris PT Nusantara"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tanggal Event:</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Kategori:</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 focus:outline-none"
                  >
                    <option value="Deadline">Deadline</option>
                    <option value="Meeting">Meeting / Rapat</option>
                    <option value="Government Submission">Government Submission</option>
                    <option value="Task">Task</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border px-4 py-2 font-semibold hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 text-white px-5 py-2 font-bold shadow-md"
                >
                  Simpan Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
