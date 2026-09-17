'use client';

import React, { useState, useEffect } from 'react';
import { Power, Zap, Sliders, Check } from 'lucide-react';
import { DualHeaterState, ControlMode } from '@/types';

interface HeaterControlProps {
  controlMode: ControlMode;
  heaterStatus?: boolean;
  heater1Status?: boolean;
  heater2Status?: boolean;
  emergencyStopped: boolean;
  dualHeaterState?: Partial<DualHeaterState>;
  targetUpper?: number;
  targetLower?: number;
  onToggleHeater?: (nextState: boolean) => void;
  onToggleHeater1?: (nextState: boolean) => void;
  onToggleHeater2?: (nextState: boolean) => void;
  onSaveThermostatLimits?: (upper: number, lower: number) => void;
}

export const HeaterControl: React.FC<HeaterControlProps> = ({
  controlMode,
  heater2Status = false,
  emergencyStopped,
  targetUpper = 60,
  targetLower = 45,
  onToggleHeater2,
  onSaveThermostatLimits,
}) => {
  const isAuto = controlMode === 'AUTO';
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
      id="tour-heater-control"
      className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 bg-slate-50 transition-all flex flex-col justify-between h-full gap-3 sm:gap-4"
    >
      {/* Top Group: Header & Button (Presisi & Sejajar Sempurna dengan Heater 1 & Pompa) */}
      <div className="space-y-2.5 sm:space-y-3">
        {/* Header: Heater 2 (Pemanas Tambahan) */}
        <div className="flex justify-between items-center text-[11px] sm:text-xs font-bold text-slate-800 gap-2 min-h-[24px]">
          <span className="flex items-center gap-1.5 truncate">
            <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-600 shrink-0" />
            <span className="truncate">Kontrol Heater 2 (Booster)</span>
            {isAuto && (
              <span className="px-1.5 py-0.2 bg-sky-100 text-sky-700 border border-sky-200 text-[8.5px] sm:text-[9px] font-extrabold rounded uppercase shrink-0">
                AUTO
              </span>
            )}
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className={`px-2 py-0.5 rounded-lg font-black text-[10px] sm:text-[11px] border transition-all ${
                isH2On
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-2xs'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              {isH2On ? 'H2: ON' : 'H2: OFF'}
            </span>
            <span
              className={`px-2 py-0.5 rounded-lg font-black text-[10px] sm:text-[11px] shadow-xs transition-all ${
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
          className={`w-full py-1.5 sm:py-2 min-h-[34px] sm:min-h-[36px] rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
            isAuto
              ? 'bg-slate-800 text-white opacity-90 cursor-not-allowed shadow-2xs'
              : isH2On
              ? 'bg-slate-900 text-white hover:bg-slate-800 active:scale-98'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 active:scale-98'
          }`}
        >
          <Power className="w-3.5 h-3.5" />
          <span>
            {isAuto
              ? 'Otomatis Dikelola Suhu'
              : isH2On
              ? 'Matikan Heater 2'
              : 'Nyalakan Heater 2'}
          </span>
        </button>
      </div>

      {/* Thermostat Limits Range (Heater 2 Histeresis) */}
      <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-amber-200/90 shadow-2xs space-y-2">
        <div className="flex justify-between items-center">
          <h5 className="font-extrabold text-[10.5px] sm:text-xs text-amber-700 flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5 text-amber-600" />
            🎯 Thermostat Limit (Heater 2)
          </h5>
          <span className="text-[9px] text-slate-400 font-bold">Histeresis</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col">
            <label className="text-[9px] text-slate-500 font-bold text-center mb-0.5">Suhu Upper (°C)</label>
            <input
              type="number"
              min="30"
              max="90"
              step="1"
              value={localUpper}
              onChange={(e) => setLocalUpper(Number(e.target.value))}
              disabled={emergencyStopped}
              className="bg-slate-50 border border-red-200 text-center font-black text-rose-600 rounded-lg py-1 text-xs focus:outline-none focus:ring-1 focus:ring-rose-400"
            />
            <span className="text-[8px] text-slate-400 text-center mt-0.5">Heater 2 OFF</span>
          </div>

          <div className="flex flex-col">
            <label className="text-[9px] text-slate-500 font-bold text-center mb-0.5">Suhu Lower (°C)</label>
            <input
              type="number"
              min="20"
              max="80"
              step="1"
              value={localLower}
              onChange={(e) => setLocalLower(Number(e.target.value))}
              disabled={emergencyStopped}
              className="bg-slate-50 border border-sky-200 text-center font-black text-sky-600 rounded-lg py-1 text-xs focus:outline-none focus:ring-1 focus:ring-sky-400"
            />
            <span className="text-[8px] text-slate-400 text-center mt-0.5">Heater 2 ON</span>
          </div>
        </div>

        {validationError && (
          <p className="text-[9px] font-bold text-rose-600 text-center">{validationError}</p>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={emergencyStopped}
          className={`w-full py-1.5 rounded-lg font-black text-[10px] tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95 ${
            saveSuccess
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs'
          }`}
        >
          {saveSuccess ? (
            <>
              <Check className="w-3 h-3 stroke-[3]" /> TERSIMPAN!
            </>
          ) : (
            'SIMPAN PENGATURAN'
          )}
        </button>
      </div>
    </div>
  );
};

export default HeaterControl;
