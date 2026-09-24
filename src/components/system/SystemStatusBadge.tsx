'use client';

import React from 'react';
import { Square, Loader2, Clock, Power } from 'lucide-react';
import { SystemOperationalStatus } from '@/types';

export interface SystemStatusBadgeProps {
  status: SystemOperationalStatus;
  sessionDuration: number;
  sessionId: string | null;
  onOpenStartup: () => void;
  onOpenEndSession: () => void;
}

const formatDuration = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) {
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const SystemStatusBadge: React.FC<SystemStatusBadgeProps> = ({
  status,
  sessionDuration,
  sessionId,
  onOpenStartup,
  onOpenEndSession
}) => {
  if (status === 'OFF') {
    return (
      <div
        id="tour-system-status"
        title="Sistem Heat Exchanger dalam kondisi belum dimulai"
        className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200"
      >
        <span className="w-2 h-2 rounded-full bg-slate-400" />
        <span>SISTEM OFF</span>
      </div>
    );
  }

  if (status === 'STANDBY') {
    return (
      <div
        title="Sistem sedang standby & proses inisialisasi hardware..."
        className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-black tracking-wide bg-amber-50 text-amber-800 border border-amber-300 shadow-xs"
      >
        <Loader2 className="w-3.5 h-3.5 text-amber-600 animate-spin" />
        <span className="font-extrabold uppercase">INISIALISASI...</span>
      </div>
    );
  }

  if (status === 'STOPPING') {
    return (
      <div
        title="Sedang mengakhiri sesi praktikum dan mematikan sistem secara aman..."
        className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-black tracking-wide bg-slate-100 text-slate-700 border border-slate-300 shadow-xs"
      >
        <Loader2 className="w-3.5 h-3.5 text-slate-600 animate-spin" />
        <span className="font-extrabold uppercase">MEMATIKAN...</span>
      </div>
    );
  }

  // ACTIVE STATUS: Show Live Duration & Prominent Button to Kill / Turn Off Machine
  return (
    <div id="tour-system-status" className="flex items-center gap-1 sm:gap-2 shrink-0">
      <div
        title={`Sistem Aktif - Sesi ID: ${sessionId || 'Active'}`}
        className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-black tracking-wide bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-xs"
      >
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
        </span>
        <span className="font-extrabold uppercase hidden md:inline">SISTEM AKTIF</span>
        <div className="flex items-center gap-1 md:pl-1 md:border-l border-emerald-200 text-[10px] sm:text-xs font-mono font-bold text-emerald-700">
          <Clock className="w-3 h-3 text-emerald-600 shrink-0" />
          <span>{formatDuration(sessionDuration)}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={onOpenEndSession}
        title="Klik untuk mematikan mesin Heat Exchanger dan mengakhiri sesi praktikum"
        className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-extrabold bg-slate-900 hover:bg-slate-800 text-white shadow-xs border border-slate-700/60 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
      >
        <Square className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-rose-400 text-rose-400 shrink-0" />
        <span className="hidden sm:inline">Matikan Mesin</span>
        <span className="sm:hidden">Matikan</span>
      </button>
    </div>
  );
};
