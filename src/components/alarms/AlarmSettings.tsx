'use client';

import React from 'react';
import {
  Volume2,
  VolumeX,
  Bell,
  CheckCircle2
} from 'lucide-react';
import { AlarmEvent } from '@/types';

export interface AlarmSettingsProps {
  ti1MaxThreshold: number;
  setTi1MaxThreshold: (val: number) => void;
  deltaPMaxThreshold: number;
  setDeltaPMaxThreshold: (val: number) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  alarmLogs: AlarmEvent[];
  onAcknowledgeAlarm: (id: string) => void;
}

export const AlarmSettings: React.FC<AlarmSettingsProps> = ({
  ti1MaxThreshold,
  setTi1MaxThreshold,
  deltaPMaxThreshold,
  setDeltaPMaxThreshold,
  soundEnabled,
  setSoundEnabled,
  alarmLogs,
  onAcknowledgeAlarm
}) => {
  const [tempInput, setTempInput] = React.useState<string>(
    ti1MaxThreshold ? String(ti1MaxThreshold) : ''
  );
  const [dpInput, setDpInput] = React.useState<string>(
    deltaPMaxThreshold ? String(deltaPMaxThreshold) : ''
  );

  React.useEffect(() => {
    if (ti1MaxThreshold !== undefined && ti1MaxThreshold !== null) {
      setTempInput(String(ti1MaxThreshold));
    }
  }, [ti1MaxThreshold]);

  React.useEffect(() => {
    if (deltaPMaxThreshold !== undefined && deltaPMaxThreshold !== null) {
      setDpInput(String(deltaPMaxThreshold));
    }
  }, [deltaPMaxThreshold]);

  const handleTempChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    // Hilangkan angka 0 di depan jika bukan 0 desimal (misal 075 -> 75)
    if (val.length > 1 && val.startsWith('0') && val[1] !== '.') {
      val = val.replace(/^0+/, '') || '0';
    }
    setTempInput(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setTi1MaxThreshold(num);
    }
  };

  const handleDpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    // Hilangkan angka 0 di depan jika bukan 0 desimal (misal 06 -> 6)
    if (val.length > 1 && val.startsWith('0') && val[1] !== '.') {
      val = val.replace(/^0+/, '') || '0';
    }
    setDpInput(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setDeltaPMaxThreshold(num);
    }
  };

  return (
    <div>
      <div id="tour-alarm-settings" className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Threshold Suhu Kritis (TI1 Hot Inlet)</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.5"
              value={tempInput}
              onFocus={(e) => e.target.select()}
              onChange={handleTempChange}
              onBlur={() => {
                if (!tempInput || isNaN(parseFloat(tempInput))) {
                  setTempInput(String(ti1MaxThreshold || 75));
                  setTi1MaxThreshold(ti1MaxThreshold || 75);
                }
              }}
              placeholder="75"
              className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 rounded-xl text-sm font-bold text-slate-800 outline-none transition"
            />
            <span className="text-xs text-slate-500 font-semibold">°C</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Threshold Max Pressure Drop (ΔP Hot)</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.1"
              min="0"
              max="2.0"
              value={dpInput}
              onFocus={(e) => e.target.select()}
              onChange={handleDpChange}
              onBlur={() => {
                if (!dpInput || isNaN(parseFloat(dpInput))) {
                  setDpInput(String(deltaPMaxThreshold || 1.5));
                  setDeltaPMaxThreshold(deltaPMaxThreshold || 1.5);
                }
              }}
              placeholder="1.5"
              className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 rounded-xl text-sm font-bold text-slate-800 outline-none transition"
            />
            <span className="text-xs text-slate-500 font-semibold">atm-g</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">Maksimal operasi 2,0 atm-g (ambang aman pompa: 1,5–2,0 atm-g)</p>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Status Sound Siren Audio</label>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`w-full py-2 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${soundEnabled
              ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
              : 'bg-slate-200 text-slate-600'
              }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            {soundEnabled ? 'Siren Audio Aktif' : 'Siren Audio Mute'}
          </button>
        </div>
      </div>

      <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
        <Bell className="w-4 h-4 text-sky-600" /> Riwayat Log Kejadian Alarm
      </h3>

      <div className="overflow-x-auto border border-slate-200/80 rounded-2xl shadow-xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200">
              <th className="p-3">ID Alarm</th>
              <th className="p-3">Waktu</th>
              <th className="p-3">Sensor</th>
              <th className="p-3">Metrik Deskripsi</th>
              <th className="p-3">Nilai Real-time</th>
              <th className="p-3">Batas Aman</th>
              <th className="p-3">Tingkat Bahaya</th>
              <th className="p-3">Aksi Acknowledge</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {alarmLogs.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/80 transition">
                <td className="p-3 font-mono font-bold text-slate-700">{item.id}</td>
                <td className="p-3 text-slate-600">{item.timestamp}</td>
                <td className="p-3 font-bold text-slate-900">{item.sensor}</td>
                <td className="p-3 text-slate-600">{item.metric}</td>
                <td className="p-3 font-bold font-mono text-slate-900">{item.value}</td>
                <td className="p-3 text-slate-500 font-mono">{item.threshold}</td>
                <td className="p-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      item.severity === 'Critical'
                        ? 'bg-sky-50 text-sky-800 border-sky-200'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {item.severity}
                  </span>
                </td>
                <td className="p-3">
                  {item.acknowledged ? (
                    <span className="text-sky-700 font-bold flex items-center gap-1 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" /> Dikonfirmasi
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onAcknowledgeAlarm(item.id)}
                      className="px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-[10px] font-bold shadow-xs transition cursor-pointer"
                    >
                      Konfirmasi
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default AlarmSettings;
