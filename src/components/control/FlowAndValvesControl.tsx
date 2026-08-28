'use client';

import React from 'react';
import { Gauge, RotateCw, Flame, Droplets, Activity } from 'lucide-react';

interface FlowAndValvesControlProps {
  controlMode: 'AUTO' | 'MANUAL';
  emergencyStopped?: boolean;
  // Servo
  servoAngle: number;
  onChangeServoAngle: (angle: number) => void;
  // FC1 (Hot Valve)
  fc1Valve: number;
  onChangeFc1Valve: (val: number) => void;
  // FC2 (Cold Valve)
  fc2Valve: number;
  onChangeFc2Valve: (val: number) => void;
  // Target Flow Rate
  targetFlow: number;
  onChangeTargetFlow: (val: number) => void;
}

export const FlowAndValvesControl: React.FC<FlowAndValvesControlProps> = ({
  controlMode,
  emergencyStopped = false,
  servoAngle,
  onChangeServoAngle,
  fc1Valve,
  onChangeFc1Valve,
  fc2Valve,
  onChangeFc2Valve,
  targetFlow,
  onChangeTargetFlow
}) => {
  const isAuto = controlMode === 'AUTO';

  return (
    <div className="p-3 sm:p-5 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-200 space-y-2.5 sm:space-y-4 col-span-1 lg:col-span-2">
      {/* Unified Card Header */}
      <div className="flex justify-between items-center border-b border-slate-200/80 pb-2">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="p-1 sm:p-1.5 rounded-lg bg-sky-100 text-sky-700 border border-sky-200">
            <Gauge className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </span>
          <h4 className="text-[11px] sm:text-xs font-extrabold text-slate-900">
            Pengaturan Katup & Laju Alir
          </h4>
        </div>

        {isAuto && (
          <span className="text-[9px] sm:text-[10px] text-sky-800 font-extrabold bg-sky-100 px-2 py-0.5 rounded-full border border-sky-200 shadow-2xs flex items-center gap-1">
            <Activity className="w-3 h-3 text-sky-600 animate-spin" />
            Mode AUTO
          </span>
        )}
      </div>

      {/* Unified 4-Column Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {/* 1. Sudut Bukaan Katup Servo */}
        <div className="p-2.5 sm:p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-1.5 sm:space-y-2.5 flex flex-col justify-between">
          <div className="flex justify-between items-center text-xs font-bold text-slate-800">
            <span className="flex items-center gap-1.5 text-slate-700">
              <RotateCw className="w-3.5 h-3.5 text-sky-600" />
              Katup Servo
            </span>
            <strong className="text-slate-900 font-mono font-extrabold text-sm">{servoAngle}°</strong>
          </div>

          <input
            type="range"
            min="0"
            max="180"
            value={servoAngle}
            onChange={(e) => onChangeServoAngle(Number(e.target.value))}
            disabled={emergencyStopped || isAuto}
            className={`w-full h-2 bg-slate-200 rounded-lg appearance-none accent-sky-600 ${
              isAuto ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
            }`}
          />

          <div className="flex justify-between text-[10px] text-slate-500 font-semibold pt-0.5">
            <span>0° (Tutup)</span>
            <span>90°</span>
            <span>180° (Buka)</span>
          </div>
        </div>

        {/* 2. Bukaan Katup FC1 (Air Panas) */}
        <div className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-xs space-y-2.5 flex flex-col justify-between">
          <div className="flex justify-between items-center text-xs font-bold text-slate-800">
            <span className="flex items-center gap-1.5 text-slate-700">
              <Flame className="w-3.5 h-3.5 text-sky-600" />
              Katup FC1 (Panas)
            </span>
            <strong className="text-slate-900 font-mono font-extrabold text-sm">{fc1Valve}%</strong>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            value={fc1Valve}
            onChange={(e) => onChangeFc1Valve(Number(e.target.value))}
            disabled={emergencyStopped || isAuto}
            className={`w-full h-2 bg-slate-200 rounded-lg appearance-none accent-sky-600 ${
              isAuto ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
            }`}
          />

          <div className="flex justify-between text-[10px] text-slate-500 font-semibold pt-0.5">
            <span>0%</span>
            <span className="text-slate-400 font-normal">Est: {((fc1Valve / 100) * 25).toFixed(1)} L/m</span>
            <span>100%</span>
          </div>
        </div>

        {/* 3. Bukaan Katup FC2 (Air Dingin) */}
        <div className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-xs space-y-2.5 flex flex-col justify-between">
          <div className="flex justify-between items-center text-xs font-bold text-slate-800">
            <span className="flex items-center gap-1.5 text-sky-800">
              <Droplets className="w-3.5 h-3.5 text-sky-600" />
              Katup FC2 (Dingin)
            </span>
            <strong className="text-sky-700 font-mono font-extrabold text-sm">{fc2Valve}%</strong>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            value={fc2Valve}
            onChange={(e) => onChangeFc2Valve(Number(e.target.value))}
            disabled={emergencyStopped || isAuto}
            className={`w-full h-2 bg-slate-200 rounded-lg appearance-none accent-sky-600 ${
              isAuto ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
            }`}
          />

          <div className="flex justify-between text-[10px] text-slate-500 font-semibold pt-0.5">
            <span>0%</span>
            <span className="text-slate-400 font-normal">Est: {((fc2Valve / 100) * 30).toFixed(1)} L/m</span>
            <span>100%</span>
          </div>
        </div>

        {/* 4. Target Flow Rate (Debit Flow) */}
        <div className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-xs space-y-2.5 flex flex-col justify-between">
          <div className="flex justify-between items-center text-xs font-bold text-slate-800">
            <span className="flex items-center gap-1.5 text-slate-700">
              <Gauge className="w-3.5 h-3.5 text-sky-600" />
              Target Flow
            </span>
            <strong className="text-slate-900 font-mono font-extrabold text-sm">
              {targetFlow.toFixed(1)} L/m
            </strong>
          </div>

          <input
            type="range"
            min="0.0"
            max="10.0"
            step="0.1"
            value={targetFlow}
            onChange={(e) => onChangeTargetFlow(Number(e.target.value))}
            disabled={emergencyStopped}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
          />

          <div className="flex justify-between text-[10px] text-slate-500 font-semibold pt-0.5">
            <span>0.0 L/m</span>
            <span>5.0</span>
            <span>10.0 L/m</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlowAndValvesControl;
