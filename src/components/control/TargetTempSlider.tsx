'use client';

import React from 'react';
import { ChevronUp, ChevronDown, Thermometer } from 'lucide-react';

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

  // Hitung perkiraan Step Level P1-P7 berdasarkan targetTemp (30°C ~ P1, 40°C ~ P2, ..., 90°C ~ P7)
  const getStepInfo = (temp: number) => {
    if (temp <= 35) return { step: 'P1', label: '30°C (Min)' };
    if (temp <= 45) return { step: 'P2', label: '40°C' };
    if (temp <= 55) return { step: 'P3', label: '50°C' };
    if (temp <= 65) return { step: 'P4', label: '60°C' };
    if (temp <= 75) return { step: 'P5', label: '70°C' };
    if (temp <= 85) return { step: 'P6', label: '80°C' };
    return { step: 'P7', label: '90°C (Max)' };
  };

  const currentStep = getStepInfo(targetTemp);
  const steps = [
    { step: 'P1', temp: 30, label: '30°C' },
    { step: 'P2', temp: 40, label: '40°C' },
    { step: 'P3', temp: 50, label: '50°C' },
    { step: 'P4', temp: 60, label: '60°C' },
    { step: 'P5', temp: 70, label: '70°C' },
    { step: 'P6', temp: 80, label: '80°C' },
    { step: 'P7', temp: 90, label: '90°C' },
  ];

  return (
    <div className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 bg-slate-50 transition-all space-y-1.5 sm:space-y-3">
      <div className="flex justify-between items-center text-[11px] sm:text-xs font-bold text-slate-800 gap-2">
        <span className="flex items-center gap-1.5 truncate">
          <Thermometer className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-600 shrink-0" />
          <span className="truncate">Pengaturan Suhu (Step P1 – P7)</span>
          {isAuto && (
            <span className="px-1.5 py-0.2 bg-sky-100 text-sky-700 border border-sky-200 text-[8.5px] sm:text-[9px] font-extrabold rounded uppercase shrink-0">
              AUTO
            </span>
          )}
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 border border-sky-200 font-extrabold text-[10px] sm:text-xs">
            {currentStep.step}
          </span>
          <strong className="text-slate-900 font-extrabold text-xs sm:text-base whitespace-nowrap">
            {targetTemp.toFixed(1)} °C
          </strong>
        </div>
      </div>

      {/* Visual Step Level Indicator P1 - P7 (Interactive Clickable Buttons) */}
      <div className="grid grid-cols-7 gap-1 bg-slate-200/80 p-1 sm:p-1.5 rounded-lg sm:rounded-xl">
        {steps.map((item) => {
          const isActive = currentStep.step === item.step;
          return (
            <button
              key={item.step}
              type="button"
              disabled={emergencyStopped}
              onClick={() => {
                if (onChangeTargetTemp) {
                  onChangeTargetTemp(item.temp);
                }
              }}
              title={`Atur Suhu ke ${item.step} (${item.label})`}
              className={`py-1 sm:py-1.5 text-center text-[9px] sm:text-[10px] font-extrabold rounded transition-all cursor-pointer ${
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

      {/* Tombol Interaktif "+10°C" dan "-10°C" */}
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
          <ChevronUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
          <span>+10°C</span>
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
          <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
          <span>-10°C</span>
        </button>
      </div>
    </div>
  );
};

export default TargetTempSlider;
