'use client';

import React from 'react';
import { Power, RotateCw, Activity } from 'lucide-react';
import { ControlMode } from '@/types';

interface PumpControlProps {
  controlMode: ControlMode;
  pompaStatus?: boolean;
  emergencyStopped: boolean;
  onTogglePompa?: (nextState: boolean) => void;
}

export const PumpControl: React.FC<PumpControlProps> = ({
  controlMode,
  pompaStatus = false,
  emergencyStopped,
  onTogglePompa,
}) => {
  const isAuto = controlMode === 'AUTO';
  const isPumpOn = pompaStatus;

  return (
    <div
      id="tour-pump-control"
      className="p-3.5 sm:p-4 rounded-2xl border border-slate-200 bg-slate-50 transition-all flex flex-col justify-between h-full gap-3 shadow-2xs"
    >
      {/* Header */}
      <div className="flex justify-between items-center gap-2">
        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 truncate">
          <RotateCw className="w-4 h-4 text-sky-600 shrink-0" />
          <span className="truncate font-extrabold">Pompa Sirkulasi</span>
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className={`px-2.5 py-0.5 rounded-md font-black text-[10px] border ${
              isPumpOn
                ? 'bg-sky-50 text-sky-700 border-sky-200 shadow-2xs'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            {isPumpOn ? 'PUMP: ON' : 'PUMP: OFF'}
          </span>
          <span
            className={`px-2 py-0.5 rounded-md font-black text-[10px] ${
              isPumpOn ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}
          >
            {isPumpOn ? 'Sirkulasi' : 'Standby'}
          </span>
        </div>
      </div>

      <div className="space-y-3 flex-1 flex flex-col justify-between">
        {/* Tombol ON / OFF Pompa */}
        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold text-slate-700">Status Daya Pompa</span>
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isPumpOn ? 'bg-sky-500 animate-pulse ring-2 ring-sky-200' : 'bg-slate-300'
              }`}
            />
          </div>
          <button
            type="button"
            onClick={() => {
              if (onTogglePompa) onTogglePompa(!isPumpOn);
            }}
            disabled={emergencyStopped}
            className={`w-full py-2 min-h-[38px] rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
              isPumpOn
                ? 'bg-slate-900 text-white hover:bg-slate-800 active:scale-98'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 active:scale-98'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{isPumpOn ? 'Matikan Pompa' : 'Nyalakan Pompa'}</span>
          </button>
        </div>

        {/* Info Operasional Pompa */}
        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex justify-between items-center text-[11px]">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-sky-600" /> Aliran Fluida Panas
            </span>
            <span className={`font-black text-[10.5px] ${isPumpOn ? 'text-sky-700' : 'text-slate-500'}`}>
              {isPumpOn ? 'MENGALIR' : 'DIHENTIKAN'}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 font-medium pt-1">
            Pompa mendistribusikan air panas dari tangki pemanas ke modul HE.
          </p>
        </div>
      </div>

      <p className="text-[10px] text-slate-500 font-medium px-0.5">
        *Pastikan pompa menyala saat pemanasan agar suhu fluida merata.
      </p>
    </div>
  );
};

export default PumpControl;
