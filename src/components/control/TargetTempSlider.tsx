'use client';

import React from 'react';
import { ChevronUp, ChevronDown, Flame, Power } from 'lucide-react';
import { ControlMode } from '@/types';

interface TargetTempSliderProps {
  targetTemp: number;
  controlMode: ControlMode;
  heater1Status?: boolean;
  emergencyStopped?: boolean;
  isBtnUpActive?: boolean;
  isBtnDownActive?: boolean;
  onToggleHeater1?: (nextState: boolean) => void;
  onStepUp: () => void;
  onStepDown: () => void;
}

export const TargetTempSlider: React.FC<TargetTempSliderProps> = ({
  controlMode,
  heater1Status = false,
  emergencyStopped = false,
  isBtnUpActive = false,
  isBtnDownActive = false,
  onToggleHeater1,
  onStepUp,
  onStepDown,
}) => {
  const isAuto = controlMode === 'AUTO';
  const isH1On = heater1Status;

  return (
    <div
      id="tour-target-temp"
      className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 bg-slate-50 transition-all flex flex-col justify-between h-full gap-3 sm:gap-4"
    >
      {/* Top Group: Header & Tombol ON/OFF (Presisi Sejajar dengan Heater 2 & Pompa) */}
      <div className="space-y-2.5 sm:space-y-3">
        {/* Header: Heater 1 (Pemanas Utama) */}
        <div className="flex justify-between items-center text-[11px] sm:text-xs font-bold text-slate-800 gap-2 min-h-[24px]">
          <span className="flex items-center gap-1.5 truncate">
            <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 shrink-0" />
            <span className="truncate">Kontrol Heater 1</span>
            {isAuto && (
              <span className="px-1.5 py-0.2 bg-sky-100 text-sky-700 border border-sky-200 text-[8.5px] sm:text-[9px] font-extrabold rounded uppercase shrink-0">
                AUTO
              </span>
            )}
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className={`px-2 py-0.5 rounded-lg font-black text-[10px] sm:text-[11px] border transition-all ${
                isH1On
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              {isH1On ? 'H1: ON' : 'H1: OFF'}
            </span>
          </div>
        </div>

        {/* Tombol ON / OFF Heater 1 (Presisi Sejajar Sempurna) */}
        <button
          type="button"
          onClick={() => {
            if (onToggleHeater1 && !isAuto) onToggleHeater1(!isH1On);
          }}
          disabled={emergencyStopped || isAuto}
          className={`w-full py-1.5 sm:py-2 min-h-[34px] sm:min-h-[36px] rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 shadow-xs ${
            isAuto
              ? 'bg-slate-800 text-white opacity-90 cursor-not-allowed shadow-2xs'
              : isH1On
              ? 'bg-slate-900 text-white hover:bg-slate-800 active:scale-98 cursor-pointer'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 active:scale-98 cursor-pointer'
          }`}
        >
          <Power className="w-3.5 h-3.5" />
          <span>
            {isAuto
              ? 'Otomatis Dikelola Suhu'
              : isH1On
              ? 'Matikan Heater 1'
              : 'Nyalakan Heater 1'}
          </span>
        </button>
      </div>

      {/* Tombol Interaktif Naik Level dan Turun Level (Tanpa teks Level P) */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onStepDown}
          disabled={emergencyStopped || isAuto}
          className={`py-2 sm:py-2.5 px-3 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 sm:gap-2 shadow-sm cursor-pointer ${
            isBtnDownActive
              ? 'bg-slate-900 text-white scale-95 ring-2 ring-slate-400'
              : 'bg-slate-800 text-white hover:bg-slate-900 active:scale-95'
          }`}
        >
          <ChevronDown className="w-4 h-4 stroke-[3]" />
          <span>Turun Level</span>
        </button>

        <button
          type="button"
          onClick={onStepUp}
          disabled={emergencyStopped || isAuto}
          className={`py-2 sm:py-2.5 px-3 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 sm:gap-2 shadow-sm cursor-pointer ${
            isBtnUpActive
              ? 'bg-sky-700 text-white scale-95 ring-2 ring-sky-300'
              : 'bg-sky-600 text-white hover:bg-sky-700 active:scale-95'
          }`}
        >
          <ChevronUp className="w-4 h-4 stroke-[3]" />
          <span>Naik Level</span>
        </button>
      </div>
    </div>
  );
};

export default TargetTempSlider;
