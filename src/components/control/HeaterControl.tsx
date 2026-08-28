'use client';

import React from 'react';
import { Power, Flame } from 'lucide-react';
import { DualHeaterState } from '@/types';

interface HeaterControlProps {
  controlMode: 'AUTO' | 'MANUAL';
  heaterStatus: boolean;
  heater1Status?: boolean;
  heater2Status?: boolean;
  emergencyStopped: boolean;
  dualHeaterState: Partial<DualHeaterState>;
  onToggleHeater: (nextState: boolean) => void;
  onToggleHeater1?: (nextState: boolean) => void;
  onToggleHeater2?: (nextState: boolean) => void;
}

export const HeaterControl: React.FC<HeaterControlProps> = ({
  controlMode,
  heaterStatus,
  heater1Status,
  heater2Status,
  emergencyStopped,
  dualHeaterState,
  onToggleHeater,
  onToggleHeater1,
  onToggleHeater2,
}) => {
  const isAuto = controlMode === 'AUTO';

  // H1 and H2 tracked independently
  const isH1On = heater1Status ?? heaterStatus;
  const isH2On = heater2Status ?? false;

  return (
    <div
      id="tour-heater-control"
      className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 bg-slate-50 transition-all space-y-1.5 sm:space-y-3"
    >
      <div className="flex justify-between items-center gap-2">
        <div className="flex items-center gap-1.5 truncate">
          <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-600 shrink-0" />
          <label className="text-[11px] sm:text-xs font-bold text-slate-800 truncate">Kontrol Pemanas (Dual Heater)</label>
        </div>
        {isAuto ? (
          <span className="text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 border border-sky-200 shrink-0">
            AUTO
          </span>
        ) : (
          <span
            className={`text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-full border shrink-0 ${
              heaterStatus
                ? 'bg-sky-50 text-sky-700 border-sky-200 shadow-2xs'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            {heaterStatus ? 'MASTER: ON' : 'MASTER: OFF'}
          </span>
        )}
      </div>

      {/* Tombol Master Power */}
      <button
        type="button"
        onClick={() => onToggleHeater(!heaterStatus)}
        disabled={emergencyStopped || isAuto}
        className={`w-full py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
          isAuto
            ? 'bg-slate-800 text-white opacity-90 cursor-not-allowed shadow-2xs'
            : heaterStatus
              ? 'bg-sky-600 text-white shadow-2xs hover:bg-sky-700'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
        }`}
      >
        <Power className="w-3.5 h-3.5" />
        {isAuto
          ? 'Otomatis Dikelola Suhu'
          : heaterStatus
            ? 'Matikan Master Heater'
            : 'Nyalakan Master Heater'}
      </button>

      {/* Tombol Terpisah: Heater 1 (1000W) & Heater 2 (500W) */}
      {!isAuto && (
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2 pt-1 border-t border-slate-200/80">
          <div className="flex flex-col gap-0.5 sm:gap-1">
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-600 flex items-center justify-between">
              <span>H1 (1000W)</span>
              <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${isH1On ? 'bg-sky-500 animate-pulse' : 'bg-slate-300'}`} />
            </span>
            <button
              type="button"
              onClick={() => {
                const next = !isH1On;
                if (onToggleHeater1) onToggleHeater1(next);
                else onToggleHeater(next);
              }}
              disabled={emergencyStopped}
              className={`w-full py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-[11px] font-extrabold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                isH1On
                  ? 'bg-slate-900 text-white shadow-2xs hover:bg-slate-800'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Power className="w-3 h-3" />
              {isH1On ? 'H1: ON' : 'H1: OFF'}
            </button>
          </div>

          <div className="flex flex-col gap-0.5 sm:gap-1">
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-600 flex items-center justify-between">
              <span>H2 (500W)</span>
              <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${isH2On ? 'bg-sky-500 animate-pulse' : 'bg-slate-300'}`} />
            </span>
            <button
              type="button"
              onClick={() => {
                const next = !isH2On;
                if (onToggleHeater2) onToggleHeater2(next);
                else onToggleHeater(next);
              }}
              disabled={emergencyStopped}
              className={`w-full py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-[11px] font-extrabold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                isH2On
                  ? 'bg-slate-900 text-white shadow-2xs hover:bg-slate-800'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Power className="w-3 h-3" />
              {isH2On ? 'H2: ON' : 'H2: OFF'}
            </button>
          </div>
        </div>
      )}

      <span className="text-[9.5px] sm:text-[10.5px] text-slate-500 font-semibold block truncate">
        Daya: {dualHeaterState.stage === 'STAGE_1'
          ? '1000W (Full)'
          : dualHeaterState.stage === 'STAGE_2'
            ? '500W (Halus)'
            : dualHeaterState.stage === 'SETPOINT_REACHED'
              ? 'Standby (0W)'
              : 'Off (0W)'}
      </span>
    </div>
  );
};

export default HeaterControl;
