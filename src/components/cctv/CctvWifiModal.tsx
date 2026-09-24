'use client';

import React, { useState, useEffect } from 'react';
import { Wifi, RefreshCw, CheckCircle2, AlertCircle, X, ShieldCheck, Eye, EyeOff, Radio } from 'lucide-react';

interface CctvWifiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnected?: () => void;
  triggerToast?: (msg: string, type: 'success' | 'info' | 'warning' | 'error') => void;
}

export const CctvWifiModal: React.FC<CctvWifiModalProps> = ({
  isOpen,
  onClose,
  onConnected,
  triggerToast
}) => {
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [laptopWifi, setLaptopWifi] = useState('');
  const [availableNetworks, setAvailableNetworks] = useState<string[]>([]);
  const [selectedSsid, setSelectedSsid] = useState('');
  const [customSsid, setCustomSsid] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [cameraStatus, setCameraStatus] = useState<{
    online: boolean;
    status_text: string;
    last_ssid: string;
  }>({
    online: false,
    status_text: 'Memeriksa status...',
    last_ssid: ''
  });
  const [resultMessage, setResultMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  const fetchWifiStatus = async () => {
    setLoading(true);
    setResultMessage(null);
    try {
      const res = await fetch('/api/cctv/wifi');
      const data = await res.json();
      if (data.success) {
        setLaptopWifi(data.laptop_wifi || '');
        setAvailableNetworks(data.available_networks || []);
        if (data.laptop_wifi) {
          setSelectedSsid(data.laptop_wifi);
        } else if (data.available_networks && data.available_networks.length > 0) {
          setSelectedSsid(data.available_networks[0]);
        }
        if (data.camera) {
          setCameraStatus(data.camera);
        }
      }
    } catch (e: any) {
      console.error('Error fetching wifi status:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchWifiStatus();
    }
  }, [isOpen]);

  const handleSyncConnection = async () => {
    setSyncing(true);
    setResultMessage(null);
    try {
      const res = await fetch('/api/cctv/wifi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync' })
      });
      const data = await res.json();
      if (data.success) {
        setResultMessage({ type: 'success', text: data.message });
        setCameraStatus(prev => ({ ...prev, online: true, status_text: 'Online' }));
        if (triggerToast) triggerToast(data.message, 'success');
        if (onConnected) onConnected();
      } else {
        setResultMessage({ type: 'error', text: data.message || 'Kamera belum tersambung ke jaringan baru.' });
        if (triggerToast) triggerToast('Kamera belum tersambung ke router baru', 'warning');
      }
    } catch (err: any) {
      setResultMessage({ type: 'error', text: err.message || 'Gagal memeriksa koneksi' });
    } finally {
      setSyncing(false);
    }
  };

  const handleApplyWifi = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalSsid = selectedSsid === '__custom__' ? customSsid.trim() : selectedSsid.trim();

    if (!finalSsid) {
      setResultMessage({ type: 'error', text: 'Pilih atau masukkan nama Wi-Fi terlebih dahulu.' });
      return;
    }

    setSyncing(true);
    setResultMessage({
      type: 'info',
      text: `Mempersiapkan penyambungan kamera ke jaringan "${finalSsid}"... Sedang memeriksa transmisi router...`
    });

    try {
      // Panggil sinkronisasi ke kamera
      const res = await fetch('/api/cctv/wifi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sync',
          target_ssid: finalSsid,
          password: wifiPassword
        })
      });
      const data = await res.json();
      if (data.success) {
        setResultMessage({
          type: 'success',
          text: `Berhasil! Kamera telah terhubung ke jaringan "${finalSsid}" dan video telah aktif.`
        });
        setCameraStatus(prev => ({ ...prev, online: true, status_text: 'Online', last_ssid: finalSsid }));
        if (triggerToast) triggerToast('Kamera berhasil terhubung ke jaringan baru!', 'success');
        if (onConnected) onConnected();
      } else {
        setResultMessage({
          type: 'info',
          text: `Permintaan ganti Wi-Fi ke "${finalSsid}" telah didaftarkan. Jika kamera belum otomatis terhubung, Anda cukup memastikan kamera berada di jangkauan Wi-Fi "${finalSsid}" atau gunakan tips cepat di bawah.`
        });
      }
    } catch (err: any) {
      setResultMessage({ type: 'error', text: err.message || 'Gagal mengubah pengaturan Wi-Fi' });
    } finally {
      setSyncing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 shadow-xs">
              <Wifi className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Pengaturan Jaringan Wi-Fi CCTV
              </h3>
              <p className="text-xs text-slate-500">
                Pindahkan koneksi kamera lab ke router Wi-Fi baru dengan mudah
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Status Kamera Saat Ini */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/80 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-600">Status Kamera Lab:</span>
              <div className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${cameraStatus.online ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <span className={`font-bold ${cameraStatus.online ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {cameraStatus.online ? 'Terhubung (Online)' : 'Terputus dari Jaringan'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-200/60">
              <div className="p-2.5 bg-white rounded-xl border border-slate-200/80">
                <span className="text-[11px] text-slate-400 block font-medium">Wi-Fi Terakhir:</span>
                <span className="font-bold text-slate-800 truncate block mt-0.5">
                  {cameraStatus.last_ssid || '—'}
                </span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-slate-200/80">
                <span className="text-[11px] text-slate-400 block font-medium">Wi-Fi Laptop Saat Ini:</span>
                <span className="font-bold text-sky-700 truncate block mt-0.5">
                  {laptopWifi || '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Feedback Message */}
          {resultMessage && (
            <div className={`p-4 rounded-2xl text-xs flex items-start gap-2.5 border ${
              resultMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : resultMessage.type === 'error'
                ? 'bg-red-50 text-red-900 border-red-200'
                : 'bg-sky-50 text-sky-900 border-sky-200'
            }`}>
              {resultMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : resultMessage.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              ) : (
                <Radio className="w-4 h-4 text-sky-600 shrink-0 mt-0.5 animate-pulse" />
              )}
              <span className="leading-relaxed font-medium">{resultMessage.text}</span>
            </div>
          )}

          {/* Form Pemilihan Wi-Fi */}
          <form onSubmit={handleApplyWifi} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>Pilih Jaringan Wi-Fi Baru</span>
                <button
                  type="button"
                  onClick={fetchWifiStatus}
                  disabled={loading}
                  className="text-[11px] font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                  Pindai Ulang
                </button>
              </label>

              <select
                value={selectedSsid}
                onChange={(e) => setSelectedSsid(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 focus:border-sky-500 rounded-xl text-xs font-semibold text-slate-800 outline-none transition shadow-xs"
              >
                {availableNetworks.map((net) => (
                  <option key={net} value={net}>
                    {net}
                  </option>
                ))}
                <option value="__custom__">+ Masukkan Nama Wi-Fi Lainnya...</option>
              </select>
            </div>

            {selectedSsid === '__custom__' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">
                  Nama Wi-Fi (SSID)
                </label>
                <input
                  type="text"
                  value={customSsid}
                  onChange={(e) => setCustomSsid(e.target.value)}
                  placeholder="Contoh: Lab Kimia UAD"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 focus:border-sky-500 rounded-xl text-xs text-slate-800 outline-none transition shadow-xs"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800">
                Password Wi-Fi
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={wifiPassword}
                  onChange={(e) => setWifiPassword(e.target.value)}
                  placeholder="Masukkan password Wi-Fi..."
                  className="w-full px-3.5 py-2.5 pr-10 bg-white border border-slate-200 focus:border-sky-500 rounded-xl text-xs text-slate-800 outline-none transition shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={syncing}
                className="flex-1 py-2.5 px-4 bg-sky-600 hover:bg-sky-500 disabled:opacity-60 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-sky-600/20"
              >
                {syncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Wifi className="w-4 h-4" />}
                Hubungkan Kamera ke Wi-Fi Ini
              </button>

              <button
                type="button"
                onClick={handleSyncConnection}
                disabled={syncing}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                title="Cek apakah kamera sudah online dan sinkronkan video"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                Cek Koneksi
              </button>
            </div>
          </form>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Sistem Monitoring CCTV FluidHE Lab</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold transition cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
