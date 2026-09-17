'use client';

import React, { useState, useEffect } from 'react';
import { Power, Zap, Sliders, Check, ChevronUp, ChevronDown, Flame } from 'lucide-react';
import { ControlMode } from '@/types';

export interface DualHeatersControlProps {
  controlMode: ControlMode;
  targetTemp: number;
  heater1Status?: boolean;
  heater2Status?: boolean;
  emergencyStopped: boolean;
  isBtnUpActive?: boolean;
  isBtnDownActive?: boolean;
  targetUpper?: number;
  targetLower?: number;
  onToggleHeater1?: (nextState: boolean) => void;
  onToggleHeater2?: (nextState: boolean) => void;
  onStepUp?: () => void;
  onStepDown?: () => void;
  onSaveThermostatLimits?: (upper: number, lower: number) => void;
}

export const DualHeatersControl: React.FC<DualHeatersControlProps> = ({
  controlMode,
  targetTemp,
  heater1Status = false,
  heater2Status = false,
  emergencyStopped,
  isBtnUpActive = false,
  isBtnDownActive = false,
  targetUpper = 60,
  targetLower = 45,
  onToggleHeater1,
  onToggleHeater2,
  onStepUp,
  onStepDown,
  onSaveThermostatLimits,
}) => {
  const isAuto = controlMode === 'AUTO';
  const isH1On = heater1Status;
  const isH2On = heater2Status;

  const [localUpper, setLocalUpper] = useState<number>(targetUpper);
  const [localLower, setLocalLower] = useState<number>(targetLower);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (targetUpper !== undefined) setLocalUpper(targetUpper);
  }, [targetUpper]);

  useEffect(() => {
    if (targetLower !== undefined) setLocalLower(targetLower);
  }, [targetLower]);

  const handleSave = () => {
    if (isNaN(localUpper) || isNaN(localLower)) {
      setValidationError('Nilai suhu tidak valid!');
      return;
    }
    if (localLower >= localUpper) {
      setValidationError('Suhu Lower harus lebih kecil dari Upper!');
      return;
    }
    setValidationError(null);
    if (onSaveThermostatLimits) {
      onSaveThermostatLimits(localUpper, localLower);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    }
  };

  return (
    <div
      id="tour-dual-heaters"
      className="p-3.5 sm:p-5 bg-slate-50 rounded-2xl border border-slate-200 shadow-2xs space-y-4 col-span-1 lg:col-span-2"
    >
      {/* Header Utama Section Heater */}
      <div className="flex justify-between items-center border-b border-slate-200/80 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-sky-100 text-sky-700 border border-sky-200">
            <Zap className="w-4 h-4" />
          </span>
          <div>
            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">
              Sistem Kontrol Dual Heater (Pemanas Utama & Booster)
            </h4>
            <p className="text-[10px] text-slate-500 font-medium">
              Manajemen pemanas bertingkat dengan regulasi suhu histeresis
            </p>
          </div>
        </div>

        {isAuto && (
          <span className="text-[9px] sm:text-[10px] text-sky-800 font-extrabold bg-sky-100 px-2.5 py-0.5 rounded-full border border-sky-200 shadow-2xs">
            Mode AUTO Aktif
          </span>
        )}
      </div>

      {/* Grid 2 Kolom Sejajar: Heater 1 di Kiri, Heater 2 di Kanan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
        {/* KOLOM 1: HEATER 1 (UTAMA - 1000W) */}
        <div className="p-3.5 sm:p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3.5 flex flex-col justify-between">
          {/* Header Heater 1 */}
          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-xs font-bold text-slate-800 gap-2 min-h-[26px]">
              <span className="flex items-center gap-1.5 truncate">
                <Flame className="w-4 h-4 text-sky-600 shrink-0" />
                <span className="font-extrabold text-slate-800">Heater 1 (Pemanas Utama)</span>
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                <span
                  className={`px-2 py-0.5 rounded-md font-black text-[10.5px] border ${
                    isH1On
                      ? 'bg-sky-50 text-sky-700 border-sky-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {isH1On ? 'H1: ON' : 'H1: OFF'}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md font-black text-[10.5px] ${
                    isH1On ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {isH1On ? '1000 Watt' : '0 Watt'}
                </span>
              </div>
            </div>

            {/* Tombol ON / OFF Heater 1 */}
            <button
              type="button"
              onClick={() => {
                if (onToggleHeater1 && !isAuto) onToggleHeater1(!isH1On);
              }}
              disabled={emergencyStopped || isAuto}
              className={`w-full py-2 min-h-[38px] rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                isAuto
                  ? 'bg-slate-800 text-white opacity-90 cursor-not-allowed'
                  : isH1On
                  ? 'bg-slate-900 text-white hover:bg-slate-800 active:scale-98'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 active:scale-98'
              }`}
            >
              <Power className="w-4 h-4" />
              <span>
                {isAuto ? 'Dikelola Otomatis' : isH1On ? 'Matikan Heater 1' : 'Nyalakan Heater 1'}
              </span>
            </button>
          </div>

          {/* Sub-Card Pengaturan Step Level Target Suhu */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold text-slate-700">Target Level Suhu</span>
              <span className="text-xs font-black text-sky-700 bg-sky-100/80 px-2 py-0.5 rounded border border-sky-200 font-mono">
                {targetTemp}°C
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={onStepDown}
                disabled={emergencyStopped || isAuto}
                className={`py-2 px-3 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer ${
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
                className={`py-2 px-3 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer ${
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
        </div>

        {/* KOLOM 2: HEATER 2 (BOOSTER - 500W & THERMOSTAT LIMIT) */}
        <div className="p-3.5 sm:p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3.5 flex flex-col justify-between">
          {/* Header Heater 2 */}
          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-xs font-bold text-slate-800 gap-2 min-h-[26px]">
              <span className="flex items-center gap-1.5 truncate">
                <Zap className="w-4 h-4 text-sky-600 shrink-0" />
                <span className="font-extrabold text-slate-800">Heater 2 (Pemanas Booster)</span>
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                <span
                  className={`px-2 py-0.5 rounded-md font-black text-[10.5px] border ${
                    isH2On
                      ? 'bg-sky-50 text-sky-700 border-sky-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {isH2On ? 'H2: ON' : 'H2: OFF'}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md font-black text-[10.5px] ${
                    isH2On ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {isH2On ? '500 Watt' : '0 Watt'}
                </span>
              </div>
            </div>

            {/* Tombol ON / OFF Heater 2 */}
            <button
              type="button"
              onClick={() => {
                if (onToggleHeater2) onToggleHeater2(!isH2On);
              }}
              disabled={emergencyStopped || isAuto}
              className={`w-full py-2 min-h-[38px] rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                isAuto
                  ? 'bg-slate-800 text-white opacity-90 cursor-not-allowed'
                  : isH2On
                  ? 'bg-slate-900 text-white hover:bg-slate-800 active:scale-98'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 active:scale-98'
              }`}
            >
              <Power className="w-4 h-4" />
              <span>
                {isAuto ? 'Dikelola Suhu' : isH2On ? 'Matikan Heater 2' : 'Nyalakan Heater 2'}
              </span>
            </button>
          </div>

          {/* Sub-Card Batas Termostat Histeresis Heater 2 */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-sky-600" />
                Batas Termostat Heater 2
              </span>
              <span className="text-[9.5px] text-slate-500 font-bold">Histeresis</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col">
                <label className="text-[9.5px] text-slate-600 font-bold text-center mb-0.5">
                  Suhu Upper (°C)
                </label>
                <input
                  type="number"
                  min="30"
                  max="90"
                  step="1"
                  value={localUpper}
                  onChange={(e) => setLocalUpper(Number(e.target.value))}
                  disabled={emergencyStopped}
                  className="bg-white border border-slate-300 text-center font-black text-rose-600 rounded-lg py-1 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <span className="text-[8.5px] text-slate-400 text-center mt-0.5">Heater 2 OFF</span>
              </div>

              <div className="flex flex-col">
                <label className="text-[9.5px] text-slate-600 font-bold text-center mb-0.5">
                  Suhu Lower (°C)
                </label>
                <input
                  type="number"
                  min="20"
                  max="80"
                  step="1"
                  value={localLower}
                  onChange={(e) => setLocalLower(Number(e.target.value))}
                  disabled={emergencyStopped}
                  className="bg-white border border-slate-300 text-center font-black text-sky-600 rounded-lg py-1 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <span className="text-[8.5px] text-slate-400 text-center mt-0.5">Heater 2 ON</span>
              </div>
            </div>

            {validationError && (
              <p className="text-[9px] font-bold text-rose-600 text-center">{validationError}</p>
            )}

            <button
              type="button"
              onClick={handleSave}
              disabled={emergencyStopped}
              className={`w-full py-1.5 rounded-lg font-black text-[11px] tracking-wide transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
                saveSuccess
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-sky-600 hover:bg-sky-700 text-white shadow-xs'
              }`}
            >
              {saveSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3]" /> Tersimpan!
                </>
              ) : (
                'Simpan Pengaturan'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DualHeatersControl;
