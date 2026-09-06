'use client';

import React from 'react';
import { Power, Zap } from 'lucide-react';
import { DualHeaterState } from '@/types';

interface HeaterControlProps {
  controlMode: 'AUTO' | 'MANUAL';
  heaterStatus?: boolean;
  heater1Status?: boolean;
  heater2Status?: boolean;
  emergencyStopped: boolean;
  dualHeaterState?: Partial<DualHeaterState>;
  onToggleHeater?: (nextState: boolean) => void;
  onToggleHeater1?: (nextState: boolean) => void;
  onToggleHeater2?: (nextState: boolean) => void;
}

export const HeaterControl: React.FC<HeaterControlProps> = ({
  controlMode,
  heater2Status = false,
  emergencyStopped,
  dualHeaterState = {},
  onToggleHeater2,
}) => {
  const isAuto = controlMode === 'AUTO';
  const isH2On = heater2Status;

  return (
    <div
      id="tour-heater-control"
      className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 bg-slate-50 transition-all flex flex-col justify-between space-y-2 sm:space-y-3"
    >
      {/* Header: Heater 2 (Pemanas Tambahan) */}
      <div className="flex justify-between items-center gap-2">
        <div className="flex items-center gap-1.5 truncate">
          <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-600 shrink-0" />
          <label className="text-[11px] sm:text-xs font-bold text-slate-800 truncate">Kontrol Heater 2</label>
        </div>
        {isAuto ? (
          <span className="text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 border border-sky-200 shrink-0">
            AUTO
          </span>
        ) : (
          <span
            className={`px-2 py-0.5 rounded-lg font-black text-[10px] sm:text-[11px] border shrink-0 transition-all ${isH2On
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-2xs'
              : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
          >
            {isH2On ? 'H2: ON' : 'H2: OFF'}
          </span>
        )}
      </div>

      {/* Tombol ON / OFF Heater 2 */}
      <button
        type="button"
        onClick={() => {
          if (onToggleHeater2) onToggleHeater2(!isH2On);
        }}
        disabled={emergencyStopped || isAuto}
        className={`w-full py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${isAuto
          ? 'bg-slate-800 text-white opacity-90 cursor-not-allowed shadow-2xs'
          : isH2On
            ? 'bg-slate-900 text-white hover:bg-slate-800 active:scale-98'
            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 active:scale-98'
          }`}
      >
        <Power className="w-3.5 h-3.5" />
        {isAuto
          ? 'Otomatis Dikelola Suhu'
          : isH2On
            ? 'Matikan Heater 2 (500W)'
            : 'Nyalakan Heater 2 (500W)'}
      </button>

      {/* Detail Spesifikasi Heater 2 */}
      <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-white border border-slate-200/80 text-[10px] sm:text-[11px]">
        <div className="flex justify-between items-center text-slate-600 font-semibold">
          <span>Kapasitas Daya</span>
          <span className="font-extrabold text-sky-700">500 Watt Fixed</span>
        </div>
      </div>
    </div>
  );
};

export default HeaterControl;
