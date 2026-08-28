'use client';

import React from 'react';
import { Activity } from 'lucide-react';
import { TelemetryPoint, TelemetryRow, TempLabels, DualHeaterState } from '@/types';

interface StatCardsProps {
  tempLabels: TempLabels;
  supabaseTelemetry: TelemetryRow | null;
  latestData: TelemetryPoint;
  dualHeaterState: Partial<DualHeaterState>;
}

export const StatCards: React.FC<StatCardsProps> = ({
  tempLabels,
  supabaseTelemetry,
  latestData,
  dualHeaterState
}) => {
  const heaterWatt = dualHeaterState.powerWatt ?? 0;

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
        <Activity className="w-4 h-4 text-sky-600" /> Pembacaan Sensor Real-Time
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-2.5 text-xs">
        {/* T1 */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
          <span className="text-[10px] text-slate-500 font-semibold block">{tempLabels.t1}</span>
          <strong className="text-slate-900 font-extrabold text-sm sm:text-base">
            {supabaseTelemetry ? supabaseTelemetry.temp_1.toFixed(1) : latestData.ti1.toFixed(1)} °C
          </strong>
        </div>

        {/* T2 */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
          <span className="text-[10px] text-slate-500 font-semibold block">{tempLabels.t2}</span>
          <strong className="text-slate-900 font-extrabold text-sm sm:text-base">
            {supabaseTelemetry ? supabaseTelemetry.temp_2.toFixed(1) : latestData.ti2.toFixed(1)} °C
          </strong>
        </div>

        {/* T3 */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
          <span className="text-[10px] text-slate-500 font-semibold block">{tempLabels.t3}</span>
          <strong className="text-sky-700 font-extrabold text-sm sm:text-base">
            {supabaseTelemetry ? supabaseTelemetry.temp_3.toFixed(1) : latestData.ti3.toFixed(1)} °C
          </strong>
        </div>

        {/* T4 */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
          <span className="text-[10px] text-slate-500 font-semibold block">{tempLabels.t4}</span>
          <strong className="text-sky-700 font-extrabold text-sm sm:text-base">
            {supabaseTelemetry ? supabaseTelemetry.temp_4.toFixed(1) : latestData.ti4.toFixed(1)} °C
          </strong>
        </div>

        {/* PI1 */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
          <span className="text-[10px] text-slate-500 font-semibold block">Tekanan (PI1)</span>
          <strong className="text-slate-800 font-extrabold text-sm sm:text-base">
            {latestData.pi1.toFixed(2)} atm-g
          </strong>
        </div>

        {/* FC1 */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
          <span className="text-[10px] text-slate-500 font-semibold block">Debit Alir (FC1)</span>
          <strong className="text-slate-800 font-extrabold text-sm sm:text-base">
            {supabaseTelemetry ? supabaseTelemetry.flow_rate.toFixed(1) : latestData.fc1.toFixed(1)} L/m
          </strong>
        </div>

        {/* Status Heater */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
          <span className="text-[10px] text-slate-500 font-semibold block">Status Heater</span>
          <span
            className={`inline-block px-2 py-0.5 mt-0.5 rounded text-[10px] font-extrabold border ${
              supabaseTelemetry?.heater_status === 'ON' || heaterWatt > 0
                ? 'bg-sky-50 text-sky-700 border-sky-200'
                : 'bg-slate-200 text-slate-700 border-slate-300'
            }`}
          >
            {heaterWatt > 0 ? `${heaterWatt}W` : 'OFF'}
          </span>
        </div>

        {/* Status Alarm */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
          <span className="text-[10px] text-slate-500 font-semibold block">Status Alarm</span>
          <span
            className={`inline-block px-2 py-0.5 mt-0.5 rounded text-[10px] font-extrabold border ${
              supabaseTelemetry?.warning_status === 'NORMAL' || !supabaseTelemetry
                ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                : 'bg-rose-100 text-rose-800 border-rose-200'
            }`}
          >
            {supabaseTelemetry ? supabaseTelemetry.warning_status : 'NORMAL'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StatCards;
