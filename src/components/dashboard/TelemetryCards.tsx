'use client';

import React from 'react';
import { Thermometer, Gauge, Activity } from 'lucide-react';
import { TelemetryPoint, TempLabels } from '@/types';

interface TelemetryCardsProps {
  latestData: TelemetryPoint;
  tempLabels: TempLabels;
  tc1Setpoint: number;
  ti1MaxThreshold: number;
  deltaPHot: number;
  deltaPCold: number;
  fc1Valve: number;
  fc2Valve: number;
  onCardClick?: () => void;
  isHardwareOnline?: boolean;
}

export const TelemetryCards: React.FC<TelemetryCardsProps> = ({
  latestData,
  tempLabels,
  tc1Setpoint,
  ti1MaxThreshold,
  deltaPHot,
  deltaPCold,
  fc1Valve,
  fc2Valve,
  onCardClick,
  isHardwareOnline = false
}) => {
  // Sinkronisasi dinamis inlet/outlet sesuai mode arah aliran aktif (Counter vs Co-Current)
  const isT1In = tempLabels.t1.toLowerCase().includes('in');
  const isT4In = tempLabels.t4.toLowerCase().includes('in');

  return (
    <div id="tour-temp-cards" className="space-y-3 sm:space-y-4">
      {/* Banner Peringatan Siaga jika ESP32 Belum Terhubung */}
      {!isHardwareOnline && (
        <div className="p-3 sm:p-3.5 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50/60 border border-amber-200/90 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs text-amber-950 shadow-2xs animate-fade-in">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
            <span>
              <strong className="font-extrabold text-amber-900">Alat Belum Terhubung (Offline):</strong> Menunggu telemetri real-time dari alat laboratorium. Sensor dalam status siaga.
            </span>
          </div>
          <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-lg bg-amber-100/90 text-amber-800 border border-amber-300/70 shrink-0">
            🟡 Menunggu Alat
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Card 1: T1 */}
        <div
          onClick={onCardClick}
          className="asklepios-card p-3 sm:p-4 relative overflow-hidden cursor-pointer hover:border-orange-300 hover:shadow-md transition active:scale-[0.98] select-none flex flex-col justify-between h-full min-h-[148px]"
          title="Klik untuk membuka Kontrol Pemanas & Suhu"
        >
          <div className="flex justify-between items-start gap-1">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-slate-800 truncate">{tempLabels.t1}</span>
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 shrink-0">T1</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium block mt-0.5 truncate">
                T1 = Sensor Suhu ({isT1In ? 'Inlet Panas' : 'Outlet Panas'})
              </span>
            </div>
            <span className="p-1.5 bg-orange-50 text-orange-600 rounded-xl shrink-0">
              <Thermometer className="w-4 h-4" />
            </span>
          </div>

          <div className="my-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {isHardwareOnline ? latestData.ti1 : '--'}
            </span>
            <span className="text-xs font-semibold text-slate-500">°C</span>
          </div>

          <div className="pt-2 border-t border-slate-100/90 text-[10.5px] sm:text-[11px] text-slate-500 flex justify-between items-center gap-1">
            <span className="truncate">Target: {tc1Setpoint}°C</span>
            <span className={`font-bold shrink-0 ${!isHardwareOnline ? 'text-amber-600' : latestData.ti1 > ti1MaxThreshold ? 'text-red-600' : 'text-emerald-600'}`}>
              {!isHardwareOnline ? 'Siaga' : latestData.ti1 > ti1MaxThreshold ? 'Warning' : 'Optimal'}
            </span>
          </div>
        </div>

        {/* Card 2: T2 (Air Dingin: Selalu Cold Outlet) */}
        <div
          onClick={onCardClick}
          className="asklepios-card p-3 sm:p-4 relative overflow-hidden cursor-pointer hover:border-cyan-300 hover:shadow-md transition active:scale-[0.98] select-none flex flex-col justify-between h-full min-h-[148px]"
          title="Klik untuk membuka Kontrol Pemanas & Suhu"
        >
          <div className="flex justify-between items-start gap-1">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-slate-800 truncate">{tempLabels.t2}</span>
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-700 shrink-0">T2</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium block mt-0.5 truncate">
                T2 = Sensor Suhu (Outlet Dingin)
              </span>
            </div>
            <span className="p-1.5 bg-cyan-50 text-cyan-600 rounded-xl shrink-0">
              <Thermometer className="w-4 h-4" />
            </span>
          </div>

          <div className="my-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {isHardwareOnline ? latestData.ti2 : '--'}
            </span>
            <span className="text-xs font-semibold text-slate-500">°C</span>
          </div>

          <div className="pt-2 border-t border-slate-100/90 text-[10.5px] sm:text-[11px] text-slate-500 flex justify-between items-center gap-1">
            <span className="truncate">Kenaikan Suhu:</span>
            <span className={`font-bold shrink-0 ${isHardwareOnline ? 'text-slate-700' : 'text-amber-600'}`}>
              {isHardwareOnline ? `+${Math.max(0, latestData.ti2 - latestData.ti3).toFixed(1)}°C` : 'Siaga'}
            </span>
          </div>
        </div>

        {/* Card 3: T3 (Air Dingin: Selalu Cold Inlet) */}
        <div
          onClick={onCardClick}
          className="asklepios-card p-3 sm:p-4 relative overflow-hidden cursor-pointer hover:border-cyan-300 hover:shadow-md transition active:scale-[0.98] select-none flex flex-col justify-between h-full min-h-[148px]"
          title="Klik untuk membuka Kontrol Pemanas & Suhu"
        >
          <div className="flex justify-between items-start gap-1">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-slate-800 truncate">{tempLabels.t3}</span>
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-teal-100 text-teal-700 shrink-0">T3</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium block mt-0.5 truncate">
                T3 = Sensor Suhu (Inlet Dingin)
              </span>
            </div>
            <span className="p-1.5 bg-cyan-50 text-cyan-600 rounded-xl shrink-0">
              <Thermometer className="w-4 h-4" />
            </span>
          </div>

          <div className="my-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {isHardwareOnline ? latestData.ti3 : '--'}
            </span>
            <span className="text-xs font-semibold text-slate-500">°C</span>
          </div>

          <div className="pt-2 border-t border-slate-100/90 text-[10.5px] sm:text-[11px] text-slate-500 flex justify-between items-center gap-1">
            <span className="truncate">Air Dingin Lab:</span>
            <span className={`font-bold shrink-0 ${isHardwareOnline ? 'text-slate-700' : 'text-amber-600'}`}>
              {isHardwareOnline ? 'Normal' : 'Siaga'}
            </span>
          </div>
        </div>

        {/* Card 4: T4 (Air Panas: Counter = Hot Out, Co-Current = Hot In) */}
        <div
          onClick={onCardClick}
          className="asklepios-card p-3 sm:p-4 relative overflow-hidden cursor-pointer hover:border-rose-300 hover:shadow-md transition active:scale-[0.98] select-none flex flex-col justify-between h-full min-h-[148px]"
          title="Klik untuk membuka Kontrol Pemanas & Suhu"
        >
          <div className="flex justify-between items-start gap-1">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-slate-800 truncate">{tempLabels.t4}</span>
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 shrink-0">T4</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium block mt-0.5 truncate">
                T4 = Sensor Suhu ({isT4In ? 'Inlet Panas' : 'Outlet Panas'})
              </span>
            </div>
            <span className="p-1.5 bg-orange-50 text-orange-600 rounded-xl shrink-0">
              <Thermometer className="w-4 h-4" />
            </span>
          </div>

          <div className="my-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {isHardwareOnline ? latestData.ti4 : '--'}
            </span>
            <span className="text-xs font-semibold text-slate-500">°C</span>
          </div>

          <div className="pt-2 border-t border-slate-100/90 text-[10.5px] sm:text-[11px] text-slate-500 flex justify-between items-center gap-1">
            <span className="truncate">Penurunan Suhu:</span>
            <span className={`font-bold shrink-0 ${isHardwareOnline ? 'text-slate-700' : 'text-amber-600'}`}>
              {isHardwareOnline ? `${Math.abs(latestData.ti1 - latestData.ti4).toFixed(1)}°C` : 'Siaga'}
            </span>
          </div>
        </div>

        {/* Card 5: P1 / P2 */}
        <div
          onClick={onCardClick}
          className="asklepios-card p-3 sm:p-4 relative overflow-hidden cursor-pointer hover:border-sky-300 hover:shadow-md transition active:scale-[0.98] select-none flex flex-col justify-between h-full min-h-[148px]"
          title="Klik untuk membuka Kontrol Tekanan"
        >
          <div className="flex justify-between items-start gap-1">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-slate-800 truncate">Tekanan Panas</span>
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 shrink-0">P1 &amp; P2</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium block mt-0.5 truncate">
                P = Jalur Panas (P1 &amp; P2)
              </span>
            </div>
            <span className="p-1.5 bg-sky-50 text-sky-600 rounded-xl shrink-0">
              <Gauge className="w-4 h-4" />
            </span>
          </div>

          <div className="my-2 flex items-baseline gap-1.5">
            <span className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight whitespace-nowrap">
              {isHardwareOnline ? `${latestData.pi1} / ${latestData.pi2}` : '-- / --'}
            </span>
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">atm-g</span>
          </div>

          <div className="pt-2 border-t border-slate-100/90 text-[10.5px] sm:text-[11px] text-slate-500 flex justify-between items-center gap-1">
            <span className="truncate">ΔP Hot:</span>
            <span className={`font-bold shrink-0 ${isHardwareOnline ? 'text-sky-700' : 'text-amber-600'}`}>
              {isHardwareOnline ? `${deltaPHot} atm-g` : 'Siaga'}
            </span>
          </div>
        </div>

        {/* Card 6: P3 / P4 */}
        <div
          onClick={onCardClick}
          className="asklepios-card p-3 sm:p-4 relative overflow-hidden cursor-pointer hover:border-cyan-300 hover:shadow-md transition active:scale-[0.98] select-none flex flex-col justify-between h-full min-h-[148px]"
          title="Klik untuk membuka Kontrol Tekanan"
        >
          <div className="flex justify-between items-start gap-1">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-slate-800 truncate">Tekanan Dingin</span>
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-teal-100 text-teal-700 shrink-0">P3 &amp; P4</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium block mt-0.5 truncate">
                P = Jalur Dingin (P3 &amp; P4)
              </span>
            </div>
            <span className="p-1.5 bg-cyan-50 text-cyan-600 rounded-xl shrink-0">
              <Gauge className="w-4 h-4" />
            </span>
          </div>

          <div className="my-2 flex items-baseline gap-1.5">
            <span className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight whitespace-nowrap">
              {isHardwareOnline ? `${latestData.pi3} / ${latestData.pi4}` : '-- / --'}
            </span>
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">atm-g</span>
          </div>

          <div className="pt-2 border-t border-slate-100/90 text-[10.5px] sm:text-[11px] text-slate-500 flex justify-between items-center gap-1">
            <span className="truncate">ΔP Cold:</span>
            <span className={`font-bold shrink-0 ${isHardwareOnline ? 'text-cyan-700' : 'text-amber-600'}`}>
              {isHardwareOnline ? `${deltaPCold} atm-g` : 'Siaga'}
            </span>
          </div>
        </div>

        {/* Card 7: FC1 */}
        <div
          onClick={onCardClick}
          className="asklepios-card p-3 sm:p-4 relative overflow-hidden cursor-pointer hover:border-orange-300 hover:shadow-md transition active:scale-[0.98] select-none flex flex-col justify-between h-full min-h-[148px]"
          title="Klik untuk membuka Kontrol Aliran"
        >
          <div className="flex justify-between items-start gap-1">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-slate-800 truncate">Laju Alir Panas</span>
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 shrink-0">FC1</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium block mt-0.5 truncate">
                FC1 = Debit Aliran Panas
              </span>
            </div>
            <span className="p-1.5 bg-orange-50 text-orange-600 rounded-xl shrink-0">
              <Activity className="w-4 h-4" />
            </span>
          </div>

          <div className="my-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {isHardwareOnline ? latestData.fc1 : '--'}
            </span>
            <span className="text-xs font-semibold text-slate-500">L/min</span>
          </div>

          <div className="pt-2 border-t border-slate-100/90 text-[10.5px] sm:text-[11px] text-slate-500 flex justify-between items-center gap-1">
            <span className="truncate">Katup FC1:</span>
            <span className={`font-bold shrink-0 ${isHardwareOnline ? 'text-slate-700' : 'text-amber-600'}`}>
              {isHardwareOnline ? `${fc1Valve}%` : 'Siaga'}
            </span>
          </div>
        </div>

        {/* Card 8: FC2 */}
        <div
          onClick={onCardClick}
          className="asklepios-card p-3 sm:p-4 relative overflow-hidden cursor-pointer hover:border-cyan-300 hover:shadow-md transition active:scale-[0.98] select-none flex flex-col justify-between h-full min-h-[148px]"
          title="Klik untuk membuka Kontrol Aliran"
        >
          <div className="flex justify-between items-start gap-1">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-slate-800 truncate">Laju Alir Dingin</span>
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-700 shrink-0">FC2</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium block mt-0.5 truncate">
                FC2 = Debit Aliran Dingin
              </span>
            </div>
            <span className="p-1.5 bg-cyan-50 text-cyan-600 rounded-xl shrink-0">
              <Activity className="w-4 h-4" />
            </span>
          </div>

          <div className="my-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {isHardwareOnline ? latestData.fc2 : '--'}
            </span>
            <span className="text-xs font-semibold text-slate-500">L/min</span>
          </div>

          <div className="pt-2 border-t border-slate-100/90 text-[10.5px] sm:text-[11px] text-slate-500 flex justify-between items-center gap-1">
            <span className="truncate">Katup FC2:</span>
            <span className={`font-bold shrink-0 ${isHardwareOnline ? 'text-slate-700' : 'text-amber-600'}`}>
              {isHardwareOnline ? `${fc2Valve}%` : 'Siaga'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TelemetryCards;
