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
  onCardClick
}) => {
  // Sinkronisasi dinamis inlet/outlet sesuai mode arah aliran aktif (Counter vs Co-Current)
  const isT1In = tempLabels.t1.toLowerCase().includes('in');
  const isT2In = tempLabels.t2.toLowerCase().includes('in');
  const isT3In = tempLabels.t3.toLowerCase().includes('in');
  const isT4In = tempLabels.t4.toLowerCase().includes('in');

  return (
    <div id="tour-temp-cards" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* Card 1: T1 */}
      <div
        onClick={onCardClick}
        className="asklepios-card p-3.5 sm:p-4 relative overflow-hidden cursor-pointer hover:border-orange-300 hover:shadow-md transition active:scale-[0.98] select-none"
        title="Klik untuk membuka Kontrol Pemanas & Suhu"
      >
        <div className="flex justify-between items-start gap-1">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-slate-800">{tempLabels.t1}</span>
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-orange-100 text-orange-700">T1</span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
              T1 = Sensor Suhu ({isT1In ? 'Inlet Panas' : 'Outlet Panas'})
            </span>
          </div>
          <span className="p-1.5 bg-orange-50 text-orange-600 rounded-xl shrink-0">
            <Thermometer className="w-4 h-4" />
          </span>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-extrabold text-slate-900">{latestData.ti1}</span>
          <span className="text-xs font-semibold text-slate-500">°C</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-500 flex justify-between">
          <span>Target: {tc1Setpoint}°C</span>
          <span className={latestData.ti1 > ti1MaxThreshold ? 'text-red-600 font-bold' : 'text-emerald-600 font-semibold'}>
            {latestData.ti1 > ti1MaxThreshold ? 'Warning' : 'Optimal'}
          </span>
        </div>
      </div>

      {/* Card 2: T2 (Air Dingin: Selalu Cold Outlet) */}
      <div
        onClick={onCardClick}
        className="asklepios-card p-3.5 sm:p-4 relative overflow-hidden cursor-pointer hover:border-cyan-300 hover:shadow-md transition active:scale-[0.98] select-none"
        title="Klik untuk membuka Kontrol Pemanas & Suhu"
      >
        <div className="flex justify-between items-start gap-1">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-slate-800">{tempLabels.t2}</span>
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-700">T2</span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
              T2 = Sensor Suhu (Outlet Dingin)
            </span>
          </div>
          <span className="p-1.5 bg-cyan-50 text-cyan-600 rounded-xl shrink-0">
            <Thermometer className="w-4 h-4" />
          </span>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-extrabold text-slate-900">{latestData.ti2}</span>
          <span className="text-xs font-semibold text-slate-500">°C</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-500 flex justify-between">
          <span>Kenaikan Suhu:</span>
          <span className="font-semibold text-slate-700">+{Math.max(0, latestData.ti2 - latestData.ti3).toFixed(1)}°C</span>
        </div>
      </div>

      {/* Card 3: T3 (Air Dingin: Selalu Cold Inlet) */}
      <div
        onClick={onCardClick}
        className="asklepios-card p-3.5 sm:p-4 relative overflow-hidden cursor-pointer hover:border-cyan-300 hover:shadow-md transition active:scale-[0.98] select-none"
        title="Klik untuk membuka Kontrol Pemanas & Suhu"
      >
        <div className="flex justify-between items-start gap-1">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-slate-800">{tempLabels.t3}</span>
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-teal-100 text-teal-700">T3</span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
              T3 = Sensor Suhu (Inlet Dingin)
            </span>
          </div>
          <span className="p-1.5 bg-cyan-50 text-cyan-600 rounded-xl shrink-0">
            <Thermometer className="w-4 h-4" />
          </span>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-extrabold text-slate-900">{latestData.ti3}</span>
          <span className="text-xs font-semibold text-slate-500">°C</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-500 flex justify-between">
          <span>Air Dingin Lab</span>
          <span className="font-semibold text-slate-700">Suplai Normal</span>
        </div>
      </div>

      {/* Card 4: T4 (Air Panas: Counter = Hot Out, Co-Current = Hot In) */}
      <div
        onClick={onCardClick}
        className="asklepios-card p-3.5 sm:p-4 relative overflow-hidden cursor-pointer hover:border-rose-300 hover:shadow-md transition active:scale-[0.98] select-none"
        title="Klik untuk membuka Kontrol Pemanas & Suhu"
      >
        <div className="flex justify-between items-start gap-1">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-slate-800">{tempLabels.t4}</span>
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-rose-100 text-rose-700">T4</span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
              T4 = Sensor Suhu ({isT4In ? 'Inlet Panas' : 'Outlet Panas'})
            </span>
          </div>
          <span className="p-1.5 bg-orange-50 text-orange-600 rounded-xl shrink-0">
            <Thermometer className="w-4 h-4" />
          </span>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-extrabold text-slate-900">{latestData.ti4}</span>
          <span className="text-xs font-semibold text-slate-500">°C</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-500 flex justify-between">
          <span>Penurunan Suhu:</span>
          <span className="font-semibold text-slate-700">{Math.abs(latestData.ti1 - latestData.ti4).toFixed(1)}°C</span>
        </div>
      </div>

      {/* Card 5: P1 / P2 */}
      <div
        onClick={onCardClick}
        className="asklepios-card p-3.5 sm:p-4 relative overflow-hidden cursor-pointer hover:border-sky-300 hover:shadow-md transition active:scale-[0.98] select-none"
      >
        <div className="flex justify-between items-start gap-1">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-slate-800">Tekanan Panas (P1 / P2)</span>
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">P1 &amp; P2</span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
              P = Sensor Tekanan Jalur Panas (P1 &amp; P2)
            </span>
          </div>
          <span className="p-1.5 bg-sky-50 text-sky-600 rounded-xl shrink-0">
            <Gauge className="w-4 h-4" />
          </span>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-xl font-extrabold text-slate-900">{latestData.pi1} / {latestData.pi2}</span>
          <span className="text-xs font-semibold text-slate-500">atm-g</span>
        </div>
        <div className="mt-2 text-[11px] flex justify-between items-center p-1 bg-slate-50 rounded-lg">
          <span className="text-slate-500">ΔP Hot:</span>
          <strong className="text-sky-700">{deltaPHot} atm-g</strong>
        </div>
      </div>

      {/* Card 6: P3 / P4 */}
      <div
        onClick={onCardClick}
        className="asklepios-card p-3.5 sm:p-4 relative overflow-hidden cursor-pointer hover:border-cyan-300 hover:shadow-md transition active:scale-[0.98] select-none"
      >
        <div className="flex justify-between items-start gap-1">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-slate-800">Tekanan Dingin (P3 / P4)</span>
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-teal-100 text-teal-700">P3 &amp; P4</span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
              P = Sensor Tekanan Jalur Dingin (P3 &amp; P4)
            </span>
          </div>
          <span className="p-1.5 bg-cyan-50 text-cyan-600 rounded-xl shrink-0">
            <Gauge className="w-4 h-4" />
          </span>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-xl font-extrabold text-slate-900">{latestData.pi3} / {latestData.pi4}</span>
          <span className="text-xs font-semibold text-slate-500">atm-g</span>
        </div>
        <div className="mt-2 text-[11px] flex justify-between items-center p-1 bg-slate-50 rounded-lg">
          <span className="text-slate-500">ΔP Cold:</span>
          <strong className="text-cyan-700">{deltaPCold} atm-g</strong>
        </div>
      </div>

      {/* Card 7: FC1 */}
      <div
        onClick={onCardClick}
        className="asklepios-card p-3.5 sm:p-4 relative overflow-hidden cursor-pointer hover:border-orange-300 hover:shadow-md transition active:scale-[0.98] select-none"
      >
        <div className="flex justify-between items-start gap-1">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-slate-800">Laju Alir Panas (FC1)</span>
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-orange-100 text-orange-700">FC1</span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
              FC1 = Sensor Debit Aliran Panas
            </span>
          </div>
          <span className="p-1.5 bg-orange-50 text-orange-600 rounded-xl shrink-0">
            <Activity className="w-4 h-4" />
          </span>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-extrabold text-slate-900">{latestData.fc1}</span>
          <span className="text-xs font-semibold text-slate-500">L/min</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-500 flex justify-between">
          <span>Katup FC1:</span>
          <span className="font-bold text-slate-700">{fc1Valve}%</span>
        </div>
      </div>

      {/* Card 8: FC2 */}
      <div
        onClick={onCardClick}
        className="asklepios-card p-3.5 sm:p-4 relative overflow-hidden cursor-pointer hover:border-cyan-300 hover:shadow-md transition active:scale-[0.98] select-none"
      >
        <div className="flex justify-between items-start gap-1">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-slate-800">Laju Alir Dingin (FC2)</span>
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-700">FC2</span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
              FC2 = Sensor Debit Aliran Dingin
            </span>
          </div>
          <span className="p-1.5 bg-cyan-50 text-cyan-600 rounded-xl shrink-0">
            <Activity className="w-4 h-4" />
          </span>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-extrabold text-slate-900">{latestData.fc2}</span>
          <span className="text-xs font-semibold text-slate-500">L/min</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-500 flex justify-between">
          <span>Katup FC2:</span>
          <span className="font-bold text-slate-700">{fc2Valve}%</span>
        </div>
      </div>
    </div>
  );
};

export default TelemetryCards;
