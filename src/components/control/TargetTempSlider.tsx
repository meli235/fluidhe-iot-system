'use client';

import React from 'react';
import { ChevronUp, ChevronDown, Flame, Power } from 'lucide-react';

interface TargetTempSliderProps {
  targetTemp: number;
  controlMode: 'AUTO' | 'MANUAL';
  heater1Status?: boolean;
  emergencyStopped?: boolean;
  isBtnUpActive?: boolean;
  isBtnDownActive?: boolean;
  onToggleHeater1?: (nextState: boolean) => void;
  onStepUp: () => void;
  onStepDown: () => void;
}

export const TargetTempSlider: React.FC<TargetTempSliderProps> = ({
  targetTemp,
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

  // Hitung Level P1-P7 berdasarkan target/step
  const getStepLevel = (temp: number) => {
    if (temp <= 35) return 'P1';
    if (temp <= 45) return 'P2';
    if (temp <= 55) return 'P3';
    if (temp <= 65) return 'P4';
    if (temp <= 75) return 'P5';
    if (temp <= 85) return 'P6';
    return 'P7';
  };

  const activeLevel = getStepLevel(targetTemp);
  const steps = [
    { step: 'P1', value: 30, desc: '30°C' },
    { step: 'P2', value: 40, desc: '40°C' },
    { step: 'P3', value: 50, desc: '50°C' },
    { step: 'P4', value: 60, desc: '60°C' },
    { step: 'P5', value: 70, desc: '70°C' },
    { step: 'P6', value: 80, desc: '80°C' },
    { step: 'P7', value: 90, desc: '90°C' },
  ];

  return (
    <div
      id="tour-target-temp"
      className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 bg-slate-50 transition-all space-y-2 sm:space-y-3"
    >
      {/* Header: Heater 1 (Pemanas Utama) */}
      <div className="flex justify-between items-center text-[11px] sm:text-xs font-bold text-slate-800 gap-2">
        <span className="flex items-center gap-1.5 truncate">
          <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 shrink-0" />
          <span className="truncate">Kontrol Heater 1 (P1 – P7)</span>
          {isAuto && (
            <span className="px-1.5 py-0.2 bg-sky-100 text-sky-700 border border-sky-200 text-[8.5px] sm:text-[9px] font-extrabold rounded uppercase shrink-0">
              AUTO
            </span>
          )}
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className={`px-2 py-0.5 rounded-lg font-black text-[10px] sm:text-[11px] border transition-all ${isH1On
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
          >
            {isH1On ? 'H1: ON' : 'H1: OFF'}
          </span>
          <span className="px-2 py-0.5 rounded-lg bg-sky-600 text-white font-black text-[10px] sm:text-[11px] shadow-xs">
            Level {activeLevel}
          </span>
        </div>
      </div>

      {/* Tombol ON / OFF Heater 1 */}
      {!isAuto && (
        <button
          type="button"
          onClick={() => {
            if (onToggleHeater1) onToggleHeater1(!isH1On);
          }}
          disabled={emergencyStopped}
          className={`w-full py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${isH1On
              ? 'bg-slate-900 text-white hover:bg-slate-800 active:scale-98'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 active:scale-98'
            }`}
        >
          <Power className="w-3.5 h-3.5" />
          <span>{isH1On ? 'Matikan Heater 1' : 'Nyalakan Heater 1'}</span>
        </button>
      )}

      {/* Visual Step Level Indicator P1 - P7 (HANYA BISA DILIHAT / NON-CLICKABLE) */}
      <div className="space-y-1">
        <div className="grid grid-cols-7 gap-1 bg-slate-200/80 p-1 sm:p-1.5 rounded-lg sm:rounded-xl select-none">
          {steps.map((item) => {
            const isActive = activeLevel === item.step;
            return (
              <div
                key={item.step}
                title={`Level ${item.step} (${item.desc})`}
                className={`py-1.5 sm:py-2 text-center text-[10px] sm:text-xs font-extrabold rounded transition-all cursor-default select-none ${isActive
                    ? 'bg-sky-600 text-white shadow-md scale-105 ring-1 ring-sky-400'
                    : 'bg-white/80 text-slate-600 shadow-2xs opacity-80'
                  }`}
              >
                {item.step}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tombol Interaktif Naik Level dan Turun Level */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-0.5">
        <button
          type="button"
          onClick={onStepDown}
          disabled={emergencyStopped || isAuto}
          className={`py-2 sm:py-2.5 px-3 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 sm:gap-2 shadow-sm cursor-pointer ${isBtnDownActive
              ? 'bg-slate-900 text-white scale-95 ring-2 ring-slate-400'
              : 'bg-slate-800 text-white hover:bg-slate-900 active:scale-95'
            }`}
        >
          <ChevronDown className="w-4 h-4 stroke-[3]" />
          <span>Turun Level (P-)</span>
        </button>

        <button
          type="button"
          onClick={onStepUp}
          disabled={emergencyStopped || isAuto}
          className={`py-2 sm:py-2.5 px-3 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 sm:gap-2 shadow-sm cursor-pointer ${isBtnUpActive
              ? 'bg-sky-700 text-white scale-95 ring-2 ring-sky-300'
              : 'bg-sky-600 text-white hover:bg-sky-700 active:scale-95'
            }`}
        >
          <ChevronUp className="w-4 h-4 stroke-[3]" />
          <span>Naik Level (P+)</span>
        </button>
      </div>
    </div>
  );
};

export default TargetTempSlider;
