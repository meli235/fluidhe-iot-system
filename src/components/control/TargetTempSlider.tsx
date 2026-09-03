'use client';

import React from 'react';
import { ChevronUp, ChevronDown, Flame } from 'lucide-react';

interface TargetTempSliderProps {
  targetTemp: number;
  controlMode: 'AUTO' | 'MANUAL';
  emergencyStopped?: boolean;
  isBtnUpActive?: boolean;
  isBtnDownActive?: boolean;
  onChangeTargetTemp?: (val: number) => void;
  onStepUp: () => void;
  onStepDown: () => void;
}

export const TargetTempSlider: React.FC<TargetTempSliderProps> = ({
  targetTemp,
  controlMode,
  emergencyStopped = false,
  isBtnUpActive = false,
  isBtnDownActive = false,
  onChangeTargetTemp,
  onStepUp,
  onStepDown,
}) => {
  const isAuto = controlMode === 'AUTO';

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
    { step: 'P1', value: 30 },
    { step: 'P2', value: 40 },
    { step: 'P3', value: 50 },
    { step: 'P4', value: 60 },
    { step: 'P5', value: 70 },
    { step: 'P6', value: 80 },
    { step: 'P7', value: 90 },
  ];

  return (
    <div className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 bg-slate-50 transition-all space-y-2 sm:space-y-3">
      <div className="flex justify-between items-center text-[11px] sm:text-xs font-bold text-slate-800 gap-2">
        <span className="flex items-center gap-1.5 truncate">
          <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 shrink-0" />
          <span className="truncate">Pengaturan Level Pemanas (P1 – P7)</span>
          {isAuto && (
            <span className="px-1.5 py-0.2 bg-sky-100 text-sky-700 border border-sky-200 text-[8.5px] sm:text-[9px] font-extrabold rounded uppercase shrink-0">
              AUTO
            </span>
          )}
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="px-2 py-0.5 rounded-lg bg-sky-600 text-white font-black text-[11px] sm:text-xs shadow-xs">
            Level {activeLevel}
          </span>
        </div>
      </div>

      {/* Visual Step Level Indicator P1 - P7 (Interactive Clickable Buttons) */}
      <div className="grid grid-cols-7 gap-1 bg-slate-200/80 p-1 sm:p-1.5 rounded-lg sm:rounded-xl">
        {steps.map((item) => {
          const isActive = activeLevel === item.step;
          return (
            <button
              key={item.step}
              type="button"
              disabled={emergencyStopped}
              onClick={() => {
                if (onChangeTargetTemp) {
                  onChangeTargetTemp(item.value);
                }
              }}
              title={`Pilih ${item.step}`}
              className={`py-1.5 sm:py-2 text-center text-[10px] sm:text-xs font-extrabold rounded transition-all cursor-pointer ${
                isActive
                  ? 'bg-sky-600 text-white shadow-md scale-105 ring-1 ring-sky-400'
                  : 'bg-white/80 text-slate-700 hover:bg-white hover:text-sky-700 active:scale-95 shadow-2xs'
              }`}
            >
              {item.step}
            </button>
          );
        })}
      </div>

      {/* Tombol Interaktif Naik Level dan Turun Level */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-0.5 sm:pt-1">
        <button
          type="button"
          onClick={onStepUp}
          disabled={emergencyStopped}
          className={`py-2 sm:py-2.5 px-3 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 sm:gap-2 shadow-sm cursor-pointer ${
            isBtnUpActive
              ? 'bg-sky-700 text-white scale-95 ring-2 ring-sky-300'
              : 'bg-sky-600 text-white hover:bg-sky-700 active:scale-95'
          }`}
        >
          <ChevronUp className="w-4 h-4 stroke-[3]" />
          <span>Naik Level (P+)</span>
        </button>

        <button
          type="button"
          onClick={onStepDown}
          disabled={emergencyStopped}
          className={`py-2 sm:py-2.5 px-3 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 sm:gap-2 shadow-sm cursor-pointer ${
            isBtnDownActive
              ? 'bg-slate-900 text-white scale-95 ring-2 ring-slate-400'
              : 'bg-slate-800 text-white hover:bg-slate-900 active:scale-95'
          }`}
        >
          <ChevronDown className="w-4 h-4 stroke-[3]" />
          <span>Turun Level (P-)</span>
        </button>
      </div>
    </div>
  );
};

export default TargetTempSlider;
