'use client';

import React from 'react';
import { Flame, Droplets, Activity, Gauge } from 'lucide-react';
import { ControlMode } from '@/types';

interface FlowAndValvesControlProps {
  controlMode: ControlMode;
  emergencyStopped?: boolean;
  // FC1 (Hot Valve)
  fc1Valve: number;
  onChangeFc1Valve: (val: number) => void;
  // FC2 (Cold Valve)
  fc2Valve: number;
  onChangeFc2Valve: (val: number) => void;
  // Optional backward-compatibility props
  servoAngle?: number;
  onChangeServoAngle?: (angle: number) => void;
  targetFlow?: number;
  onChangeTargetFlow?: (val: number) => void;
}

const VALVE_TICKS = [10, 20, 40, 60, 80, 100];

// Cari tick terdekat saat slider digeser
const snapToNearestTick = (val: number): number => {
  return VALVE_TICKS.reduce((prev, curr) =>
    Math.abs(curr - val) < Math.abs(prev - val) ? curr : prev
  );
};

export const FlowAndValvesControl: React.FC<FlowAndValvesControlProps> = ({
  controlMode,
  emergencyStopped = false,
  fc1Valve,
  onChangeFc1Valve,
  fc2Valve,
  onChangeFc2Valve,
}) => {
  const isAuto = controlMode === 'AUTO';

  return (
    <div className="p-3 sm:p-5 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-200 space-y-2.5 sm:space-y-4 col-span-1 lg:col-span-2">
      {/* Card Header */}
      <div className="flex justify-between items-center border-b border-slate-200/80 pb-2">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="p-1 sm:p-1.5 rounded-lg bg-sky-100 text-sky-700 border border-sky-200">
            <Gauge className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </span>
          <h4 className="text-[11px] sm:text-xs font-extrabold text-slate-900">
            Pengaturan Katup Aliran (Panas & Dingin)
          </h4>
        </div>

        {isAuto && (
          <span className="text-[9px] sm:text-[10px] text-sky-800 font-extrabold bg-sky-100 px-2 py-0.5 rounded-full border border-sky-200 shadow-2xs flex items-center gap-1">
            <Activity className="w-3 h-3 text-sky-600" />
            Mode AUTO
          </span>
        )}
      </div>

      {/* 2-Column Responsive Grid: Katup Panas & Katup Dingin */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {/* 1. Bukaan Katup FC1 (Air Panas) */}
        <div className="p-3.5 sm:p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-3 flex flex-col justify-between">
          <div className="flex justify-between items-center text-xs font-bold text-slate-800">
            <span className="flex items-center gap-1.5 text-slate-700">
              <Flame className="w-4 h-4 text-rose-500 shrink-0" />
              Katup FC1 (Panas)
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 font-mono font-black text-xs sm:text-sm shadow-2xs">
              {fc1Valve}%
            </span>
          </div>

          {/* Slider Control (Rentang: 10, 20, 40, 60, 80, 100) */}
          <div className="space-y-2 pt-1">
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={Math.max(10, fc1Valve)}
              onChange={(e) => onChangeFc1Valve(snapToNearestTick(Number(e.target.value)))}
              disabled={emergencyStopped || isAuto}
              className={`w-full h-2.5 bg-slate-200 rounded-lg appearance-none accent-rose-500 transition-all ${
                isAuto ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
              }`}
            />
            {/* Scale Ticks: 10%, 20%, 40%, 60%, 80%, 100% */}
            <div className="flex justify-between text-[10px] font-bold text-slate-500 px-0.5">
              {VALVE_TICKS.map((tick) => (
                <button
                  key={tick}
                  type="button"
                  disabled={emergencyStopped || isAuto}
                  onClick={() => onChangeFc1Valve(tick)}
                  className={`transition-all hover:text-rose-600 cursor-pointer ${fc1Valve === tick ? 'text-rose-600 font-black scale-110' : 'text-slate-400'}`}
                >
                  {tick}%
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 2. Bukaan Katup FC2 (Air Dingin) */}
        <div className="p-3.5 sm:p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-3 flex flex-col justify-between">
          <div className="flex justify-between items-center text-xs font-bold text-slate-800">
            <span className="flex items-center gap-1.5 text-sky-800">
              <Droplets className="w-4 h-4 text-sky-600 shrink-0" />
              Katup FC2 (Dingin)
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 border border-sky-200 font-mono font-black text-xs sm:text-sm shadow-2xs">
              {fc2Valve}%
            </span>
          </div>

          {/* Slider Control (Rentang: 10, 20, 40, 60, 80, 100) */}
          <div className="space-y-2 pt-1">
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={Math.max(10, fc2Valve)}
              onChange={(e) => onChangeFc2Valve(snapToNearestTick(Number(e.target.value)))}
              disabled={emergencyStopped || isAuto}
              className={`w-full h-2.5 bg-slate-200 rounded-lg appearance-none accent-sky-600 transition-all ${
                isAuto ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
              }`}
            />
            {/* Scale Ticks: 10%, 20%, 40%, 60%, 80%, 100% */}
            <div className="flex justify-between text-[10px] font-bold text-slate-500 px-0.5">
              {VALVE_TICKS.map((tick) => (
                <button
                  key={tick}
                  type="button"
                  disabled={emergencyStopped || isAuto}
                  onClick={() => onChangeFc2Valve(tick)}
                  className={`transition-all hover:text-sky-600 cursor-pointer ${fc2Valve === tick ? 'text-sky-600 font-black scale-110' : 'text-slate-400'}`}
                >
                  {tick}%
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlowAndValvesControl;
