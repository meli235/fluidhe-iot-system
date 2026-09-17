'use client';

import React, { useMemo } from 'react';
import {
  FileText,
  Search,
  Play,
  Layers,
  CheckCircle2,
  Database,
  ShieldCheck,
  Users,
  GraduationCap,
  Filter
} from 'lucide-react';
import { SystemOperationalStatus, SystemSession, TelemetryPoint } from '@/types';
import { ExportButtons } from './ExportButtons';
import { DataTable } from './DataTable';

export interface ClassSummaryItem {
  operatorEmail: string;
  operatorName: string;
  classGroup?: string;
  count: number;
}

export interface LogsTabProps {
  filteredLogsData: TelemetryPoint[];
  logInterval: '1s' | '2s' | '5s' | '30s' | '1m';
  setLogInterval: (interval: '1s' | '2s' | '5s' | '30s' | '1m') => void;
  dateFilter: string;
  setDateFilter: (filter: string) => void;
  logSearchQuery: string;
  setLogSearchQuery: (query: string) => void;
  isUploading: boolean;
  handleExportAndUpload: () => void;
  handleExportCurrentSessionExcel?: () => void;
  handleExportAllClassesExcel?: () => void;
  handleCloudDriveAccess: () => void;
  exportPDFReport: () => void;
  // Session Isolation Props
  systemStatus?: SystemOperationalStatus;
  currentSession?: SystemSession | null;
  archivedSessions?: SystemSession[];
  selectedSessionId?: string;
  setSelectedSessionId?: (id: string) => void;
  onOpenStartup?: () => void;
  // Role-Based User Access Props
  currentUser?: { name: string; email: string; role: string };
  classFilter?: string;
  setClassFilter?: (filter: string) => void;
  classesList?: ClassSummaryItem[];
}

export const LogsTab: React.FC<LogsTabProps> = ({
  filteredLogsData,
  logInterval,
  setLogInterval,
  dateFilter,
  setDateFilter,
  logSearchQuery,
  setLogSearchQuery,
  isUploading,
  handleExportAndUpload,
  handleExportCurrentSessionExcel,
  handleExportAllClassesExcel,
  handleCloudDriveAccess,
  exportPDFReport,
  systemStatus = 'ACTIVE',
  currentSession,
  archivedSessions = [],
  selectedSessionId = 'CURRENT',
  setSelectedSessionId,
  onOpenStartup,
  currentUser,
  classFilter = 'ALL',
  setClassFilter,
  classesList = []
}) => {
  const isAdmin = currentUser?.role === 'admin';

  // Filter archived sessions based on classFilter for Admin
  const visibleArchivedSessions = useMemo(() => {
    if (!isAdmin || classFilter === 'ALL') {
      return archivedSessions;
    }
    return archivedSessions.filter(
      (s) =>
        (s.operatorEmail && s.operatorEmail.toLowerCase() === classFilter.toLowerCase()) ||
        (s.classGroup && s.classGroup.toLowerCase() === classFilter.toLowerCase()) ||
        (s.operatorName && s.operatorName.toLowerCase() === classFilter.toLowerCase())
    );
  }, [isAdmin, classFilter, archivedSessions]);

  // Total telemetry points calculation for Admin Master Badge
  const totalTelemetryCount = useMemo(() => {
    const fromArchives = archivedSessions.reduce(
      (acc, s) => acc + (s.pointsCount || (s.data ? s.data.length : 0)),
      0
    );
    const fromCurrent = currentSession?.data ? currentSession.data.length : 0;
    return fromArchives + fromCurrent;
  }, [archivedSessions, currentSession]);

  // Selected session object for banner detail
  const activeSessionObj = useMemo(() => {
    if (selectedSessionId === 'CURRENT') return currentSession;
    return archivedSessions.find((s) => s.id === selectedSessionId) || null;
  }, [selectedSessionId, currentSession, archivedSessions]);

  return (
    <div className="space-y-6">
      <div id="tour-logs-tab" className="asklepios-card p-6 bg-white shadow-xl rounded-3xl border border-slate-200">
        {/* Top Header: Title & Export Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <FileText className="w-6 h-6 text-sky-600" /> Laporan Monitoring Heat Exchanger
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isAdmin
                ? 'Penyimpanan data terpusat master laboratorium — Akses longitudinal semua kelas praktikum'
                : 'Laporan & rekaman data telemetri Heat Exchanger'}
            </p>
          </div>

          <ExportButtons
            isUploading={isUploading}
            onExportExcel={handleExportCurrentSessionExcel || handleExportAndUpload}
            onExportMasterExcel={handleExportAllClassesExcel}
            onCloudDriveAccess={handleCloudDriveAccess}
            onExportPDFReport={exportPDFReport}
            isAdmin={isAdmin}
          />
        </div>

        {/* ROLE-BASED ACCESS BANNER */}
        {isAdmin ? (
          /* ADMIN MASTER DATA BANNER */
          <div className="no-print print:hidden mb-6 p-4 rounded-2xl bg-gradient-to-r from-sky-50 via-blue-50/70 to-indigo-50/50 border border-sky-200/80 text-sky-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 bg-sky-600 text-white rounded-2xl shadow-xs shrink-0">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <strong className="text-xs font-black text-sky-950 tracking-wide uppercase">
                    Data Berkepanjangan Laboratorium (Master Admin)
                  </strong>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-200/80 text-sky-900 border border-sky-300">
                    Akses Seluruh Kelas
                  </span>
                </div>
                <p className="text-[11.5px] text-sky-800 mt-0.5">
                  Seluruh rekaman telemetri dari semua kelas dan kelompok tersimpan permanen di server untuk kebutuhan arsip kurikulum dan riset jangka panjang.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <div className="px-3 py-1.5 bg-white/90 rounded-xl border border-sky-200 text-center shadow-xs">
                <span className="text-[10px] font-bold text-slate-500 block">Total Sesi Kelas</span>
                <span className="text-xs font-black text-sky-900">
                  {archivedSessions.length + (currentSession ? 1 : 0)} Sesi
                </span>
              </div>
              <div className="px-3 py-1.5 bg-white/90 rounded-xl border border-sky-200 text-center shadow-xs">
                <span className="text-[10px] font-bold text-slate-500 block">Akumulasi Data</span>
                <span className="text-xs font-black text-sky-900">{totalTelemetryCount} Baris</span>
              </div>
              <div className="px-3 py-1.5 bg-white/90 rounded-xl border border-sky-200 text-center shadow-xs">
                <span className="text-[10px] font-bold text-slate-500 block">Kelas Terdata</span>
                <span className="text-xs font-black text-sky-900">
                  {classesList.length > 0 ? classesList.length : 1} Kelas
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* OPERATOR BANNER */
          <div className="no-print print:hidden mb-6 p-4 rounded-2xl bg-gradient-to-r from-slate-50 via-sky-50/40 to-slate-50 border border-slate-200 text-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-sky-600 text-white rounded-2xl shadow-xs shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <strong className="text-xs font-black text-slate-900 tracking-wide block">
                  Data Praktikum: {currentUser?.name || 'Operator'}
                </strong>
                <p className="text-[11.5px] text-slate-500 mt-0.5">
                  Rekaman data telemetri modul penukar panas Heat Exchanger
                </p>
              </div>
            </div>

            <div className="px-3 py-1.5 bg-white rounded-xl border border-slate-200 text-center shadow-xs shrink-0">
              <span className="text-[10px] font-bold text-slate-500 block">Total Sesi</span>
              <span className="text-xs font-black text-slate-900">
                {archivedSessions.length + (currentSession ? 1 : 0)} Sesi
              </span>
            </div>
          </div>
        )}

        {/* System Inactive Notice if System is OFF and no active session */}
        {systemStatus === 'OFF' && (
          <div className="no-print print:hidden mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500 text-white rounded-xl shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <strong className="text-xs font-black text-amber-900 block">Sistem Belum Dimulai (Standby)</strong>
                <p className="text-[11.5px] text-amber-800 mt-0.5">
                  Pencatatan data praktikum saat ini dibekukan agar tidak bercampur. Klik <strong>Mulai Sesi Baru</strong> untuk memulai sesi praktikum bersih hari ini.
                </p>
              </div>
            </div>
            {onOpenStartup && (
              <button
                type="button"
                onClick={onOpenStartup}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs font-extrabold rounded-xl shadow-xs transition active:scale-95 flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Mulai Sesi Baru</span>
              </button>
            )}
          </div>
        )}

        {/* Report Overview Meta Box */}
        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/90 mb-6 space-y-1.5 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/70 pb-2 mb-2">
            <div>
              <h1 className="text-base font-extrabold text-slate-900 tracking-wide">
                LAPORAN MONITORING HEAT EXCHANGER UAD
              </h1>
              {activeSessionObj && (
                <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                  {activeSessionObj.title || 'Praktikum Heat Exchanger'} &bull; Operator:{' '}
                  <strong className="text-slate-800">{activeSessionObj.operatorName}</strong>
                  {activeSessionObj.classGroup && activeSessionObj.classGroup.trim().toLowerCase() !== (activeSessionObj.operatorName || '').trim().toLowerCase()
                    ? ` (${activeSessionObj.classGroup})`
                    : ''}
                </p>
              )}
            </div>

            <div>
              {selectedSessionId === 'CURRENT' && currentSession ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  Sesi Aktif: {currentSession.id}
                </span>
              ) : selectedSessionId !== 'CURRENT' ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-extrabold bg-sky-100 text-sky-800 border border-sky-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                  Arsip Sesi: {selectedSessionId}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-extrabold bg-slate-200 text-slate-700">
                  Belum Ada Sesi Aktif
                </span>
              )}
            </div>
          </div>

          <p className="text-slate-600 font-medium">
            Sistem: <strong className="text-slate-800">Heat Exchanger Thermal Analytics (Interval Sampling: {logInterval})</strong>
          </p>
          <p className="text-slate-600 font-medium">
            Rentang Data:{' '}
            <strong className="text-slate-800">
              {filteredLogsData.length > 0
                ? `${activeSessionObj?.date || new Date().toLocaleDateString('id-ID')}, ${filteredLogsData[0]?.timestamp} WIB s.d. ${filteredLogsData[filteredLogsData.length - 1]?.timestamp} WIB`
                : `Tidak ada data log (${dateFilter === 'Yesterday' ? 'Kemarin' : dateFilter === '7Days' ? '7 Hari Terakhir' : 'Kriteria Pencarian'})`}
            </strong>
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div
          className={`p-4 bg-white rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 ${
            isAdmin ? 'lg:grid-cols-5' : 'lg:grid-cols-4'
          } gap-4 mb-6 no-print shadow-sm`}
        >
          {/* Admin Class / Operator Filter (Khusus Admin) */}
          {isAdmin && setClassFilter && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-sky-600" /> Filter Kelas / Operator
              </label>
              <select
                value={classFilter}
                onChange={(e) => {
                  const newFilter = e.target.value;
                  setClassFilter(newFilter);
                  // Otomatis pilih sesi pertama dari kelas yang difilter agar data langsung tampil
                  if (newFilter !== 'ALL') {
                    const matches = archivedSessions.filter(
                      (s) =>
                        (s.operatorEmail && s.operatorEmail.toLowerCase() === newFilter.toLowerCase()) ||
                        (s.classGroup && s.classGroup.toLowerCase() === newFilter.toLowerCase()) ||
                        (s.operatorName && s.operatorName.toLowerCase() === newFilter.toLowerCase())
                    );
                    if (matches.length > 0) {
                      setSelectedSessionId?.(matches[0].id);
                    }
                  } else {
                    setSelectedSessionId?.('CURRENT');
                  }
                }}
                className="w-full px-3 py-1.5 bg-sky-50/50 border border-sky-200 rounded-xl text-xs text-sky-950 font-bold focus:outline-none focus:ring-2 focus:ring-sky-500/20 cursor-pointer"
              >
                <option value="ALL">Semua Kelas & Operator ({archivedSessions.length} sesi)</option>
                {classesList.map((c) => (
                  <option key={c.operatorEmail || c.operatorName} value={c.operatorEmail || c.operatorName}>
                    {c.operatorName}{c.classGroup && c.classGroup !== c.operatorName ? ` (${c.classGroup})` : ''} - {c.count} sesi
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Session Selector (Anti Data Tercampur) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-sky-600" />
              Pilih Sesi Praktikum
            </label>
            <select
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId?.(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-sky-500/20 cursor-pointer"
            >
              {currentSession && (classFilter === 'ALL' || (currentSession.operatorEmail && currentSession.operatorEmail.toLowerCase() === classFilter.toLowerCase()) || (currentSession.operatorName && currentSession.operatorName.toLowerCase() === classFilter.toLowerCase())) && (
                <option value="CURRENT">
                  🟢 Sesi Aktif ({currentSession.date}) {isAdmin ? `[${currentSession.operatorName}]` : ''}
                </option>
              )}
              {visibleArchivedSessions.map((s, idx) => (
                <option key={s.id} value={s.id}>
                  📁 {isAdmin ? `[${s.operatorName}] ` : ''}Sesi #{visibleArchivedSessions.length - idx}: {s.date}
                </option>
              ))}
              {!currentSession && visibleArchivedSessions.length === 0 && (
                <option value="CURRENT">Belum Ada Sesi Praktikum</option>
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Cari Waktu / Sensor</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={logSearchQuery}
                onChange={(e) => setLogSearchQuery(e.target.value)}
                placeholder="Contoh: 12.31, 25.00, ON, Counter..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Interval Sampling</label>
            <select
              value={logInterval}
              onChange={(e) => setLogInterval(e.target.value as '1s' | '2s' | '5s' | '30s' | '1m')}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-bold focus:outline-none cursor-pointer"
            >
              <option value="1s">1 Detik (High Frequency)</option>
              <option value="2s">2 Detik (Rekomendasi Praktikum)</option>
              <option value="5s">5 Detik (Default Realtime)</option>
              <option value="30s">30 Detik (Interval Sedang)</option>
              <option value="1m">1 Menit (Ringkasan Lab)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Rentang Tanggal</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="All">Semua Tanggal Arsip</option>
              <option value="Today">Hari Ini ({new Date().toLocaleDateString('id-ID')})</option>
              <option value="Yesterday">Kemarin</option>
              <option value="7Days">7 Hari Terakhir</option>
            </select>
          </div>
        </div>

        <DataTable filteredLogsData={filteredLogsData} dateFilter={dateFilter} />

        <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-slate-500 no-print border-t border-slate-100 pt-3">
          <span>Menampilkan {filteredLogsData.length} baris data telemetri (Sampling: {logInterval})</span>
          <span className="font-semibold text-slate-700">
            Sesi Terpilih:{' '}
            {selectedSessionId === 'CURRENT' ? (currentSession?.id || 'Aktif') : selectedSessionId}
            {activeSessionObj?.operatorName ? ` (${activeSessionObj.operatorName})` : ''}
          </span>
        </div>
      </div>
    </div>
  );
};
export default LogsTab;
