'use client';

import React from 'react';
import {
  Square,
  X,
  FileSpreadsheet,
  Clock,
  Database,
  Thermometer,
  Wind,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { SystemSession } from '@/types';

export interface SessionSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmEndSession: () => void;
  onExportExcel: () => void;
  currentSession: SystemSession | null;
  sessionDuration: number;
}

const formatDurationLong = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) {
    return `${hrs} Jam ${mins} Menit ${secs} Detik`;
  }
  return `${mins} Menit ${secs} Detik`;
};

export const SessionSummaryModal: React.FC<SessionSummaryModalProps> = ({
  isOpen,
  onClose,
  onConfirmEndSession,
  onExportExcel,
  currentSession,
  sessionDuration
}) => {
  if (!isOpen) return null;

  // Calculate session metrics
  const data = currentSession?.data || [];
  const pointsCount = data.length;

  let maxT1 = 0;
  let maxT2 = 0;
  let totalFlow1 = 0;
  let flowCount = 0;

  data.forEach((p) => {
    if (p.ti1 > maxT1) maxT1 = p.ti1;
    if (p.ti2 > maxT2) maxT2 = p.ti2;
    if (p.fc1 > 0) {
      totalFlow1 += p.fc1;
      flowCount++;
    }
  });

  const highestTemp = Math.max(maxT1, maxT2);
  const avgFlow = flowCount > 0 ? (totalFlow1 / flowCount).toFixed(2) : '0.00';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header Ribbon (Soft Theme: Slate & Sky) */}
        <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white p-5 sm:p-6 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-sky-500/10 rounded-full blur-2xl" />
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-sky-500/20 rounded-2xl border border-sky-400/30 text-sky-400">
                <Square className="w-5 h-5 fill-sky-400/80 text-sky-400" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-extrabold tracking-tight">
                  Akhiri Sesi Praktikum & Matikan Sistem
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  ID Sesi: <span className="font-mono text-white">{currentSession?.id || 'SESI AKTIF'}</span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Safety Notice (Soft Slate & Sky) */}
          <div className="p-3.5 bg-slate-50/90 rounded-2xl border border-slate-200/90 text-xs text-slate-700 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-extrabold text-slate-900 block">Protokol Keselamatan Laboratorium:</strong>
              <p className="text-[11.5px] text-slate-600 leading-relaxed mt-0.5">
                Mengakhiri sesi akan <strong>otomatis mematikan Dual Heater & menutup katup</strong> secara bertahap. Data sesi ini akan diarsipkan secara aman dan tidak akan tertimpa.
              </p>
            </div>
          </div>

          {/* Session Metrics Grid */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
              Ringkasan Data Sesi Praktikum
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Clock className="w-3 h-3 text-sky-600" /> Durasi
                </span>
                <p className="text-xs sm:text-sm font-extrabold text-slate-900 mt-1 font-mono">
                  {formatDurationLong(sessionDuration)}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Database className="w-3 h-3 text-emerald-600" /> Baris Data
                </span>
                <p className="text-xs sm:text-sm font-extrabold text-slate-900 mt-1 font-mono">
                  {pointsCount} <span className="text-xs font-normal text-slate-500">titik</span>
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Thermometer className="w-3 h-3 text-amber-500" /> Suhu Tertinggi
                </span>
                <p className="text-xs sm:text-sm font-extrabold text-slate-900 mt-1 font-mono">
                  {highestTemp > 0 ? `${highestTemp.toFixed(1)} °C` : '-'}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Wind className="w-3 h-3 text-cyan-600" /> Rerata Debit (FC1)
                </span>
                <p className="text-xs sm:text-sm font-extrabold text-slate-900 mt-1 font-mono">
                  {avgFlow} <span className="text-xs font-normal text-slate-500">L/min</span>
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 col-span-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Operator & Judul Sesi
                </span>
                <p className="text-xs font-extrabold text-slate-900 mt-1 truncate">
                  {currentSession?.operatorName || 'Operator'} &mdash; {currentSession?.title || 'Sesi Praktikum'}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Export Excel Option */}
          <div className="p-3.5 bg-slate-100/70 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs font-extrabold text-slate-800">Unduh Data Log Sesi Ini (.xlsx)</p>
                <p className="text-[11px] text-slate-500">Ekspor {pointsCount} baris data telemetri bersih</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onExportExcel}
              disabled={pointsCount === 0}
              className="px-3.5 py-2 rounded-xl text-xs font-extrabold bg-white hover:bg-emerald-50 text-emerald-700 border border-slate-300 hover:border-emerald-300 shadow-xs transition active:scale-95 disabled:opacity-50 cursor-pointer shrink-0"
            >
              Unduh Excel
            </button>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
            <button
              type="button"
              onClick={onConfirmEndSession}
              className="w-full py-3 px-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-extrabold text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 border border-slate-800 shadow-md shadow-slate-900/15 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <Square className="w-3.5 h-3.5 fill-slate-300 text-slate-300" />
              <span>Konfirmasi Matikan Sistem</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto py-3 px-4 rounded-xl sm:rounded-2xl text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition active:scale-95 cursor-pointer"
            >
              Lanjutkan Praktikum
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
