'use client';

import React from 'react';
import { Wind, Clock, Power } from 'lucide-react';

interface SteamValveControlProps {
  uapStatus: boolean;
  uapAutoStatus?: boolean;
  uapIntervalMin?: number;
  emergencyStopped?: boolean;
  onToggleUapManual: (nextState: boolean) => void;
  onToggleUapAuto: (nextState: boolean) => void;
  onChangeUapInterval: (min: number) => void;
}

export const SteamValveControl: React.FC<SteamValveControlProps> = ({
  uapStatus,
  uapAutoStatus = false,
  uapIntervalMin = 10,
  emergencyStopped = false,
  onToggleUapManual,
  onToggleUapAuto,
  onChangeUapInterval,
}) => {
  return (
    <div className="p-2.5 sm:p-4 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-200 space-y-2 sm:space-y-3 flex flex-col justify-between h-full">
      <div className="flex justify-between items-center gap-2">
        <span className="text-[11px] sm:text-xs font-bold text-slate-800 flex items-center gap-1.5 truncate">
          <Wind className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-600 shrink-0" />
          <span className="truncate">Katup Solenoid Uap (Dual Mode)</span>
        </span>
        <span
          className={`text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-full border shrink-0 ${
            uapStatus ? 'bg-sky-50 text-sky-700 border-sky-200' : 'bg-slate-100 text-slate-600 border-slate-200'
          }`}
        >
          {uapStatus ? 'BUKA' : 'TUTUP'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
        {/* Mode Manual On-Demand */}
        <div className="p-2.5 sm:p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-1.5 sm:space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10.5px] sm:text-[11px] font-bold text-slate-700">1. Manual On-Demand</span>
            <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${uapStatus ? 'bg-sky-500 animate-pulse' : 'bg-slate-300'}`} />
          </div>
          <button
            type="button"
            onClick={() => onToggleUapManual(!uapStatus)}
            disabled={emergencyStopped}
            className={`w-full py-1.5 sm:py-2 rounded-lg text-[11px] sm:text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              uapStatus
                ? 'bg-sky-600 text-white shadow-2xs hover:bg-sky-700'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            {uapStatus ? 'Tutup Katup Uap' : 'Buka Katup Uap'}
          </button>
        </div>

        {/* Mode Otomatis Berjadwal */}
        <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
          <label className="flex justify-between items-center cursor-pointer select-none">
            <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-sky-600" /> 2. Auto Berjadwal
            </span>
            <input
              type="checkbox"
              checked={uapAutoStatus}
              onChange={(e) => onToggleUapAuto(e.target.checked)}
              disabled={emergencyStopped}
              className="w-4 h-4 text-sky-600 rounded cursor-pointer accent-sky-600"
            />
          </label>
          <div className="flex items-center justify-between text-[11px] gap-2 pt-0.5">
            <span className="text-slate-500 font-medium whitespace-nowrap">Interval Tiap:</span>
            <select
              value={uapIntervalMin}
              onChange={(e) => {
                const val = Number(e.target.value);
                onChangeUapInterval(val);
              }}
              disabled={emergencyStopped}
              className="w-full max-w-[110px] px-2.5 py-1 bg-white border border-slate-300 hover:border-slate-400 rounded-lg font-bold text-slate-800 text-[11px] cursor-pointer shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors"
            >
              <option value={5}>5 Menit</option>
              <option value={10}>10 Menit</option>
              <option value={15}>15 Menit</option>
              <option value={30}>30 Menit</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SteamValveControl;
