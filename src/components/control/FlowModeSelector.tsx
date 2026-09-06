'use client';

import React from 'react';
import { Sliders, ArrowRight, ArrowRightLeft } from 'lucide-react';
import { FlowMode } from '@/types';

interface FlowModeSelectorProps {
  variant?: 'control' | 'dashboard';
  currentFlowMode: 'COUNTER' | 'CO-CURRENT' | FlowMode;
  disabled?: boolean;
  onSelectMode: (mode: 'COUNTER' | 'CO-CURRENT', friendlyMode: FlowMode) => void;
}

export const FlowModeSelector: React.FC<FlowModeSelectorProps> = ({
  variant = 'control',
  currentFlowMode,
  disabled = false,
  onSelectMode,
}) => {
  const isCounter =
    currentFlowMode === 'COUNTER' || currentFlowMode === 'Counter-Current';

  if (variant === 'dashboard') {
    return (
      <div className="p-3 sm:p-5 bg-slate-50/80 rounded-2xl sm:rounded-3xl border border-slate-200/80 space-y-2.5 sm:space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-xs sm:text-sm font-extrabold text-slate-800 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-sky-600 shrink-0" /> Pola Aliran Fluida (Flow Mode)
          </label>
          <span className="text-[10px] font-extrabold bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full border border-sky-200">
            Aktif: {isCounter ? 'Counter-Current' : 'Co-Current'}
          </span>
        </div>

        {/* Large Prominent Soft Gradient Segmented Cards */}
        <div id="tour-flow-mode" className={`p-1.5 sm:p-2 bg-gradient-to-r from-slate-200/80 via-slate-100 to-slate-200/80 rounded-2xl sm:rounded-3xl border border-slate-300/70 shadow-inner grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 ${disabled ? 'pointer-events-none select-none opacity-50' : ''}`}>
          {/* Co-Current */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              if (disabled) return;
              onSelectMode('CO-CURRENT', 'Co-Current');
            }}
            className={`py-3 px-3.5 sm:py-4 sm:px-5 rounded-xl sm:rounded-2xl text-left transition-all duration-200 flex items-center justify-between gap-2 sm:gap-3 select-none ${
              disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            } ${
              !isCounter
                ? 'bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 text-white shadow-lg shadow-sky-500/25 border border-sky-400/40 scale-[1.01]'
                : 'bg-white/70 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200/70 shadow-xs hover:shadow-sm'
            }`}
          >
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
              <span
                className={`p-2 sm:p-2.5 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                  !isCounter
                    ? 'bg-white/20 text-white backdrop-blur-md shadow-xs border border-white/30'
                    : 'bg-slate-200/80 text-slate-500'
                }`}
              >
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </span>
              <div className="min-w-0 flex-1">
                <span className={`text-xs sm:text-base font-black block tracking-wide truncate ${!isCounter ? 'text-white' : 'text-slate-800'}`}>
                  Co-Current
                </span>
                <span className={`text-[10px] font-medium block mt-0.5 truncate ${!isCounter ? 'text-sky-100' : 'text-slate-400'}`}>
                  Aliran Searah
                </span>
              </div>
            </div>
            <span
              className={`text-[9px] sm:text-[11px] px-2 sm:px-3 py-0.5 sm:py-1 rounded-full font-black uppercase tracking-wider shrink-0 ${
                !isCounter
                  ? 'bg-white/25 text-white border border-white/30 backdrop-blur-sm'
                  : 'bg-slate-200/80 text-slate-600'
              }`}
            >
              Searah
            </span>
          </button>

          {/* Counter-Current */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              if (disabled) return;
              onSelectMode('COUNTER', 'Counter-Current');
            }}
            className={`py-3 px-3.5 sm:py-4 sm:px-5 rounded-xl sm:rounded-2xl text-left transition-all duration-200 flex items-center justify-between gap-2 sm:gap-3 select-none ${
              disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            } ${
              isCounter
                ? 'bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 text-white shadow-lg shadow-sky-500/25 border border-sky-400/40 scale-[1.01]'
                : 'bg-white/70 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200/70 shadow-xs hover:shadow-sm'
            }`}
          >
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
              <span
                className={`p-2 sm:p-2.5 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                  isCounter
                    ? 'bg-white/20 text-white backdrop-blur-md shadow-xs border border-white/30'
                    : 'bg-slate-200/80 text-slate-500'
                }`}
              >
                <ArrowRightLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </span>
              <div className="min-w-0 flex-1">
                <span className={`text-xs sm:text-base font-black block tracking-wide truncate ${isCounter ? 'text-white' : 'text-slate-800'}`}>
                  Counter-Current
                </span>
                <span className={`text-[10px] font-medium block mt-0.5 truncate ${isCounter ? 'text-sky-100' : 'text-slate-400'}`}>
                  Aliran Berlawanan
                </span>
              </div>
            </div>
            <span
              className={`text-[9px] sm:text-[11px] px-2 sm:px-3 py-0.5 sm:py-1 rounded-full font-black uppercase tracking-wider shrink-0 ${
                isCounter
                  ? 'bg-white/25 text-white border border-white/30 backdrop-blur-sm'
                  : 'bg-slate-200/80 text-slate-600'
              }`}
            >
              Berlawanan
            </span>
          </button>
        </div>
      </div>
    );
  }

  // Control tab variant
  return (
    <div id="tour-flow-mode-control" className="p-2.5 sm:p-4 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-200 space-y-1.5 sm:space-y-2.5">
      <div className="flex justify-between items-center gap-2">
        <label className="text-[11px] sm:text-xs font-bold text-slate-800 flex items-center gap-1.5 truncate">
          <Sliders className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-600 shrink-0" />
          <span className="truncate">Arah Aliran Fluida (Flow Mode)</span>
        </label>
        {disabled ? (
          <span className="text-[9px] sm:text-[10px] font-extrabold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full border border-rose-200 shrink-0">
            Terkunci: Emergency Stop
          </span>
        ) : (
          <span className="text-[9.5px] sm:text-[10px] text-slate-500 font-semibold shrink-0 whitespace-nowrap">
            Status: <strong className="text-sky-700">{isCounter ? 'COUNTER' : 'CO-CURRENT'}</strong>
          </span>
        )}
      </div>

      <div className={`grid grid-cols-2 p-1 sm:p-1.5 bg-gradient-to-r from-slate-200/80 via-slate-100 to-slate-200/80 rounded-xl sm:rounded-2xl border border-slate-300/60 shadow-inner gap-1 sm:gap-1.5 ${disabled ? 'pointer-events-none select-none opacity-50' : ''}`}>
        {/* Co-Current */}
        <button
          type="button"
          onClick={() => {
            if (disabled) return;
            onSelectMode('CO-CURRENT', 'Co-Current');
          }}
          disabled={disabled}
          className={`py-2 sm:py-3 px-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-black transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 select-none cursor-pointer ${
            !isCounter
              ? 'bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 text-white shadow-md shadow-sky-500/20 border border-sky-400/40 scale-[1.01]'
              : 'bg-white/70 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200/60'
          }`}
        >
          <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span>Co-Current</span>
        </button>

        {/* Counter-Current */}
        <button
          type="button"
          onClick={() => {
            if (disabled) return;
            onSelectMode('COUNTER', 'Counter-Current');
          }}
          disabled={disabled}
          className={`py-2 sm:py-3 px-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-black transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 select-none cursor-pointer ${
            isCounter
              ? 'bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 text-white shadow-md shadow-sky-500/20 border border-sky-400/40 scale-[1.01]'
              : 'bg-white/70 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200/60'
          }`}
        >
          <ArrowRightLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span>Counter</span>
        </button>
      </div>
    </div>
  );
};

export default FlowModeSelector;
