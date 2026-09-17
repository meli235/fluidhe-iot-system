'use client';

import React, { useState, useEffect } from 'react';
import {
  Video,
  Disc,
  Pause,
  Play,
  Maximize2,
  Camera,
  Folder,
  Volume2,
  VolumeX,
  Volume1,
  AlertTriangle,
  Globe,
  Link2,
  Copy,
  Check,
  RefreshCw,
  Smartphone,
  ExternalLink,
  Radio,
  X
} from 'lucide-react';
import { TelemetryPoint } from '@/types';
import { PtzController } from './PtzController';

export interface CctvTabProps {
  selectedCamera: 'cam1' | 'cam2' | 'cam3';
  setSelectedCamera: (cam: 'cam1' | 'cam2' | 'cam3') => void;
  cctvStreamSource: 'local' | 'demo' | 'custom' | string;
  setCctvStreamSource: (source: any) => void;
  cctvIpUrl: string;
  setCctvIpUrl?: (url: string) => void;
  cctvPublicUrl?: string;
  setCctvPublicUrl?: (url: string) => void;
  cctvAudioMuted: boolean;
  setCctvAudioMuted: (muted: boolean) => void;
  audioUserActivated: boolean;
  setAudioUserActivated: (active: boolean) => void;
  cctvVolume: number;
  setCctvVolume: (volume: number) => void;
  cctvRecording: boolean;
  setCctvRecording: (rec: boolean) => void;
  isManualRecording: boolean;
  recordingSeconds: number;
  cctvToast: { message: string; type: 'success' | 'info' | 'warning' | 'error' | string } | null;
  webrtcConnected: boolean;
  webrtcError: string | null;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  connectWebRTC: () => void;
  handleTakeSnapshot: () => void;
  handleToggleManualRecord: () => void;
  triggerCctvToast: (message: string, type?: any) => void;
  handlePtzAction: (direction: 'up' | 'down' | 'left' | 'right' | 'center' | 'rig' | 'tank' | 'valve') => void;
  handlePtzPreset: (label: string, presetKey: string) => void;
  ptzMoving: string | null;
  latestData: TelemetryPoint;
}

export const CctvTab: React.FC<CctvTabProps> = ({
  selectedCamera,
  setSelectedCamera,
  cctvStreamSource,
  setCctvStreamSource,
  cctvIpUrl,
  setCctvIpUrl,
  cctvPublicUrl = '',
  setCctvPublicUrl,
  cctvAudioMuted,
  setCctvAudioMuted,
  audioUserActivated,
  setAudioUserActivated,
  cctvVolume,
  setCctvVolume,
  cctvRecording,
  setCctvRecording,
  isManualRecording,
  recordingSeconds,
  cctvToast,
  webrtcConnected,
  webrtcError,
  videoRef,
  connectWebRTC,
  handleTakeSnapshot,
  handleToggleManualRecord,
  triggerCctvToast,
  handlePtzAction,
  handlePtzPreset,
  ptzMoving,
  latestData
}) => {
  const [isCloudModalOpen, setIsCloudModalOpen] = useState<boolean>(false);
  const [tempPublicUrl, setTempPublicUrl] = useState<string>(cctvPublicUrl || '');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  useEffect(() => {
    if (cctvPublicUrl) {
      setTempPublicUrl(cctvPublicUrl);
    }
  }, [cctvPublicUrl]);

  const handleSavePublicUrl = (urlToSave: string) => {
    const clean = urlToSave.trim().replace(/\/+$/, '');
    if (setCctvPublicUrl) setCctvPublicUrl(clean);
    try {
      if (clean) {
        localStorage.setItem('cctv_public_url', clean);
      } else {
        localStorage.removeItem('cctv_public_url');
      }
    } catch (e) { }

    if (setCctvIpUrl) {
      if (clean) {
        setCctvIpUrl(`${clean}/stream.html?src=he_cctv&ngrok-skip-browser-warning=true`);
      } else {
        setCctvIpUrl('http://localhost:8889/stream.html?src=he_cctv');
      }
    }

    if (clean) {
      setCctvStreamSource('custom');
      triggerCctvToast('URL Cloud CCTV berhasil disimpan & diaktifkan!', 'success');
    } else {
      setCctvStreamSource('local');
      triggerCctvToast('Kembali ke mode lokal (Port 8889)', 'info');
    }
  };

  const handleCopyClientLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://heat-exchanger-taupe.vercel.app';
    const activeUrl = tempPublicUrl.trim() || cctvPublicUrl || '';
    const shareUrl = activeUrl
      ? `${origin}/?tab=cctv&cctv=${encodeURIComponent(activeUrl)}`
      : `${origin}/?tab=cctv`;

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      triggerCctvToast('Link siaran CCTV untuk Klien HP berhasil disalin!', 'success');
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const isCloudActive = Boolean(cctvPublicUrl && cctvPublicUrl.startsWith('http'));
  const isStreamLive = cctvStreamSource === 'custom' || webrtcConnected;

  return (
    <div id="tour-cctv-tab" className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className={`w-2.5 h-2.5 rounded-full ${isStreamLive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              CCTV Live Monitoring — Heat Exchanger Lab
            </h2>
            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
              isStreamLive
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}>
              {cctvStreamSource === 'custom'
                ? 'CLOUD STREAM LIVE'
                : webrtcConnected
                  ? 'LOCAL WEBRTC LIVE'
                  : 'OFFLINE'}
            </span>

            {isCloudActive && (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-sky-50 text-sky-700 border border-sky-200 flex items-center gap-1">
                <Globe className="w-2.5 h-2.5" /> Akses HP &amp; Jarak Jauh Aktif
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            FluidHE IP Cam (1080p Full HD) • Real-Time Stream (Laptop, Tablet &amp; Smartphone Klien)
          </p>
        </div>

        {/* Action Controls & Channel Switchers */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Tombol Pengaturan Akses Jarak Jauh (Cloud Tunnel / HP) */}
          <button
            type="button"
            onClick={() => {
              setTempPublicUrl(cctvPublicUrl || '');
              setIsCloudModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition active:scale-95 cursor-pointer"
          >
            <Globe className="w-4 h-4" />
            <span>Akses Klien / HP</span>
            {isCloudActive ? (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-amber-300" />
            )}
          </button>

          {/* Channel Switchers */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setSelectedCamera('cam1');
                handlePtzAction('rig');
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${selectedCamera === 'cam1'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              Rig Shell &amp; Tube
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedCamera('cam2');
                handlePtzAction('tank');
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${selectedCamera === 'cam2'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              Tangki Fluida
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedCamera('cam3');
                handlePtzAction('valve');
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${selectedCamera === 'cam3'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              Panel Valve
            </button>
          </div>
        </div>
      </div>

      {/* Main Monitoring Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left (2 Cols): Live Video Canvas & Floating Quick Actions */}
        <div className="lg:col-span-2 space-y-4">

          {/* Video Player Container */}
          <div
            id="cctv-player-container"
            className="relative bg-zinc-950 rounded-2xl overflow-hidden shadow-xl aspect-video flex flex-col justify-between p-4 border border-zinc-800 group"
          >

            {/* Top Floating Badges */}
            <div className="relative z-20 flex justify-between items-center text-xs text-white/90 font-mono pointer-events-none">
              <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[11px] font-semibold tracking-wider">
                  LIVE • {cctvStreamSource === 'custom' ? 'CLOUD (HP / 4G)' : selectedCamera === 'cam1' ? 'RIG SHELL & TUBE' : selectedCamera === 'cam2' ? 'STORAGE TANK' : 'VALVE MANIFOLD'}
                </span>
              </div>

              <div className="flex items-center gap-2 pointer-events-auto">
                {cctvStreamSource === 'demo' && (
                  <div className="bg-sky-600/90 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide">
                    SIMULATED FEED
                  </div>
                )}
                {cctvStreamSource === 'custom' && (
                  <div className="bg-emerald-600/90 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide flex items-center gap-1">
                    <Globe className="w-3 h-3" /> CLOUD FEED
                  </div>
                )}
                {isManualRecording && (
                  <div className="flex items-center gap-1.5 bg-red-600/90 text-white px-2.5 py-0.5 rounded-full text-[11px] font-bold animate-pulse">
                    <Disc className="w-3 h-3 animate-spin" />
                    <span>REC {String(Math.floor(recordingSeconds / 60)).padStart(2, '0')}:{String(recordingSeconds % 60).padStart(2, '0')}</span>
                  </div>
                )}

                <div className="bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/10 text-[10px] font-semibold text-zinc-300">
                  1080P
                </div>
              </div>
            </div>

            {/* Toast Notification Pill */}
            {cctvToast && (
              <div className="absolute top-12 left-1/2 -translate-x-1/2 z-30 px-3.5 py-1.5 bg-zinc-900/95 border border-zinc-700 backdrop-blur-md text-white text-xs font-medium rounded-xl shadow-lg animate-fade-in flex items-center gap-2">
                <span>{cctvToast.message}</span>
              </div>
            )}

            {/* Video Stream Element */}
            <div className="absolute inset-0 z-10 w-full h-full flex items-center justify-center bg-black overflow-hidden rounded-2xl">
              {cctvStreamSource === 'demo' ? (
                <div className="flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center animate-pulse">
                    <Video className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Mode Simulasi Video CCTV Aktif</h4>
                    <p className="text-xs text-zinc-400 max-w-sm mt-1">
                      Mode simulasi aktif untuk pengujian tampilan lab tanpa kamera fisik.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setCctvStreamSource('local');
                        triggerCctvToast('Mencoba menyambung WebRTC...', 'info');
                      }}
                      className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-xl border border-zinc-700 transition cursor-pointer"
                    >
                      Sambung ke WebRTC
                    </button>
                    {cctvPublicUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setCctvStreamSource('custom');
                          triggerCctvToast('Beralih ke Siaran Cloud...', 'info');
                        }}
                        className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
                      >
                        Beralih ke Cloud Stream
                      </button>
                    )}
                  </div>
                </div>
              ) : cctvStreamSource === 'local' ? (
                <>
                  {!cctvAudioMuted && !audioUserActivated && (
                    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 rounded-2xl">
                      <button
                        type="button"
                        onClick={() => {
                          setAudioUserActivated(true);
                          if (videoRef.current) {
                            videoRef.current.muted = false;
                            videoRef.current.play().catch(() => { });
                          }
                        }}
                        className="px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold text-sm flex items-center gap-2 transition cursor-pointer shadow-lg shadow-sky-600/30"
                      >
                        <Volume2 className="w-5 h-5" /> Klik untuk Nyalakan Audio Lab
                      </button>
                    </div>
                  )}
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted={!audioUserActivated || cctvAudioMuted}
                    className="w-full h-full object-contain rounded-2xl"
                  />
                  {!webrtcConnected && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 space-y-3 bg-black/90 z-20">
                      {webrtcError ? (
                        <>
                          <div className="w-14 h-14 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center">
                            <AlertTriangle className="w-7 h-7" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white">Gagal Terhubung via WebRTC</h4>
                            <p className="text-xs text-zinc-400 max-w-sm mt-1">{webrtcError}</p>
                          </div>
                          <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => connectWebRTC()}
                              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition cursor-pointer border border-slate-700"
                            >
                              Coba Sambung Ulang
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (cctvPublicUrl) {
                                  setCctvStreamSource('custom');
                                  triggerCctvToast('Beralih ke Mode Cloud Web Player (HP / 4G)', 'info');
                                } else {
                                  setIsCloudModalOpen(true);
                                }
                              }}
                              className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-xl transition cursor-pointer shadow-md shadow-sky-600/30"
                            >
                              Gunakan Cloud Web Player (Stabil di HP/4G)
                            </button>
                            <button
                              type="button"
                              onClick={() => { setCctvStreamSource('demo'); triggerCctvToast('Beralih ke Mode Simulasi', 'info'); }}
                              className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-xs rounded-lg border border-zinc-800 transition cursor-pointer"
                            >
                              Mode Simulasi
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-14 h-14 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center animate-pulse">
                            <Video className="w-7 h-7" />
                          </div>
                          <p className="text-sm font-bold text-white">Menyambungkan ke Kamera via WebRTC...</p>
                          <p className="text-xs text-zinc-500 font-mono">go2rtc &bull; {cctvPublicUrl ? 'Cloud Tunnel' : 'localhost:8889'}</p>
                        </>
                      )}
                    </div>
                  )}
                </>
              ) : (
                /* Mode Custom / Cloud Web Player (Iframe MSE WebSocket over HTTPS) */
                <div className="relative w-full h-full bg-black rounded-2xl overflow-hidden flex items-center justify-center">
                  <iframe
                    src={cctvIpUrl}
                    className="w-full h-full border-0 rounded-2xl bg-black"
                    allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                    allowFullScreen
                    title="Live CCTV Feed Cloud Player"
                  />
                  {/* Floating Overlay Controls on Cloud Player */}
                  <div className="absolute bottom-3 right-3 z-30 flex items-center gap-1.5 pointer-events-auto">
                    <button
                      type="button"
                      onClick={() => {
                        const cur = cctvIpUrl;
                        if (setCctvIpUrl) {
                          setCctvIpUrl('');
                          setTimeout(() => setCctvIpUrl(cur), 150);
                          triggerCctvToast('Memuat ulang siaran...', 'info');
                        }
                      }}
                      className="px-2.5 py-1 bg-black/80 hover:bg-black text-white text-[11px] font-bold rounded-lg border border-white/20 backdrop-blur-md transition flex items-center gap-1 cursor-pointer"
                      title="Segarkan Siaran"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Segarkan</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCctvStreamSource('local');
                        triggerCctvToast('Beralih ke WebRTC...', 'info');
                      }}
                      className="px-2.5 py-1 bg-sky-600/90 hover:bg-sky-600 text-white text-[11px] font-bold rounded-lg border border-sky-400/30 backdrop-blur-md transition cursor-pointer"
                    >
                      Mode WebRTC
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Status & Snapshot Bar */}
            <div className="relative z-20 flex justify-between items-center bg-black/60 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 mt-auto">
              <div className="flex items-center gap-2 text-white text-xs">
                <button
                  type="button"
                  onClick={() => setCctvRecording(!cctvRecording)}
                  className="p-1 hover:bg-white/10 rounded-md transition text-zinc-300 hover:text-white cursor-pointer"
                  title={cctvRecording ? 'Jeda Perekaman NVR' : 'Mulai Merekam NVR'}
                >
                  {cctvRecording ? <Pause className="w-3.5 h-3.5 text-emerald-400" /> : <Play className="w-3.5 h-3.5" />}
                </button>
                <span className="text-[11px] text-zinc-300 font-medium">
                  NVR: <strong className="text-emerald-400">{cctvRecording ? '24/7 Aktif' : 'Jeda'}</strong>
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('cctv-player-container');
                    if (el && !document.fullscreenElement) {
                      el.requestFullscreen?.();
                    } else if (document.exitFullscreen) {
                      document.exitFullscreen();
                    }
                  }}
                  className="p-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs transition cursor-pointer"
                  title="Layar Penuh"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-zinc-300" />
                </button>
              </div>
            </div>

          </div>

          {/* Quick Action Bar */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 shadow-xs">
            <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-200/80">
              <span className="font-bold text-slate-800">Kontrol Cepat Kamera</span>
              <span className="text-[11px] text-slate-500 font-medium">IP Camera 360 Series</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={handleTakeSnapshot}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-800 transition text-xs font-bold gap-1.5 border border-slate-200 shadow-xs cursor-pointer"
              >
                <Camera className="w-4 h-4 text-sky-600" />
                <span className="text-[11px]">Snapshot</span>
              </button>

              <button
                type="button"
                onClick={handleToggleManualRecord}
                className={`flex flex-col items-center justify-center p-3 rounded-xl transition text-xs font-bold gap-1.5 border shadow-xs cursor-pointer ${
                  isManualRecording
                    ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-500/20'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <Disc className={`w-4 h-4 ${isManualRecording ? 'animate-spin' : 'text-sky-600'}`} />
                <span className="text-[11px]">{isManualRecording ? 'Stop Rekam' : 'Rekam Video'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const nextMuted = !cctvAudioMuted;
                  setCctvAudioMuted(nextMuted);
                  setAudioUserActivated(!nextMuted);
                  if (videoRef.current) {
                    videoRef.current.muted = nextMuted;
                    if (!nextMuted) {
                      videoRef.current.volume = (cctvVolume || 100) / 100;
                      videoRef.current.play().catch((err) => console.log('Audio play error:', err));
                    }
                  }
                  triggerCctvToast(!nextMuted ? 'Audio CCTV aktif' : 'Audio CCTV dinonaktifkan', 'info');
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-xl transition text-xs font-bold gap-1.5 border shadow-xs cursor-pointer ${
                  !cctvAudioMuted
                    ? 'bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 text-white border-sky-400/40 shadow-sm'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {!cctvAudioMuted ? <Volume2 className="w-4 h-4 text-white" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
                <span className="text-[11px]">{!cctvAudioMuted ? 'Suara ON' : 'Suara OFF'}</span>
              </button>

              <a
                href="https://drive.google.com/drive/folders/1f9bPwAzlAIIZa1EHQqm588U-bsiWh5hv?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-800 transition text-xs font-bold gap-1.5 border border-slate-200 shadow-xs cursor-pointer"
                title="Buka Rekaman CCTV di Google Drive"
              >
                <Folder className="w-4 h-4 text-sky-600" />
                <span className="text-[11px]">History</span>
              </a>
            </div>

            {!cctvAudioMuted && (
              <div className="pt-2 flex items-center gap-3 px-3.5 py-2 bg-white rounded-xl border border-slate-200 shadow-xs text-xs">
                <Volume1 className="w-4 h-4 text-sky-600 shrink-0" />
                <span className="text-[11px] text-slate-600 font-semibold shrink-0">Volume Suara Lab:</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={cctvVolume}
                  onChange={(e) => setCctvVolume(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
                />
                <span className="font-mono text-slate-800 font-bold w-8 text-right text-[11px]">{cctvVolume}%</span>
              </div>
            )}
          </div>

        </div>

        {/* Right (1 Col): PTZ D-Pad Controller & Real-Time Telemetry */}
        <PtzController
          ptzMoving={ptzMoving}
          onPtzAction={handlePtzAction}
          onPtzPreset={handlePtzPreset}
          latestData={latestData}
          connected={isStreamLive}
        />

      </div>

      {/* ─── MODAL: PENGATURAN AKSES JARAK JAUH & LINK KLIEN (HP / CLOUD) ─── */}
      {isCloudModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95">
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Akses CCTV Jarak Jauh (Klien &amp; HP)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Konfigurasi Cloud Tunnel HTTPS untuk streaming live ke luar lab
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCloudModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Status Aktif Box */}
            <div className={`p-3.5 rounded-2xl border text-xs flex items-start gap-3 ${
              isCloudActive
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                : 'bg-amber-50/80 border-amber-200 text-amber-900'
            }`}>
              <div className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${isCloudActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <div className="space-y-1">
                <p className="font-bold text-xs">
                  {isCloudActive
                    ? 'Cloud Tunnel Sedang Aktif!'
                    : 'Masih Menggunakan Mode Jaringan Lokal'}
                </p>
                <p className="text-[11px] opacity-90 leading-relaxed">
                  {isCloudActive
                    ? `Kamera saat ini dapat ditonton dari luar lab melalui endpoint: ${cctvPublicUrl}`
                    : 'Agar klien di HP atau di luar jaringan lab dapat melihat kamera, masukkan URL HTTPS dari Ngrok atau Cloudflare Tunnel.'}
                </p>
              </div>
            </div>

            {/* Form Input URL Cloud */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>URL Cloud Tunnel (HTTPS):</span>
                <span className="text-[10px] text-slate-400 font-normal">Contoh: https://xxxx.ngrok-free.app</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://xxxx-xx-xx.ngrok-free.app"
                  value={tempPublicUrl}
                  onChange={(e) => setTempPublicUrl(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
                />
                <button
                  type="button"
                  onClick={() => handleSavePublicUrl(tempPublicUrl)}
                  className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  Simpan
                </button>
              </div>
            </div>

            {/* Salin Tautan untuk Klien */}
            <div className="p-4 bg-sky-50/60 rounded-2xl border border-sky-100 space-y-2.5">
              <div className="flex items-center gap-1.5 text-sky-800 font-bold text-xs">
                <Smartphone className="w-4 h-4 text-sky-600" />
                <span>Bagikan Link Siaran ke Klien Hari Ini:</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Klien di HP dapat langsung membuka link berikut di browser (Chrome/Safari) dan siaran CCTV lab akan otomatis berputar:
              </p>
              <button
                type="button"
                onClick={handleCopyClientLink}
                className="w-full py-2.5 px-3 bg-white hover:bg-sky-50 border border-sky-200 rounded-xl flex items-center justify-center gap-2 text-sky-700 font-bold text-xs shadow-xs transition active:scale-98 cursor-pointer"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-sky-600" />}
                <span>{copiedLink ? 'Link Berhasil Disalin!' : 'Salin Link Siaran untuk WhatsApp Klien'}</span>
              </button>
            </div>

            {/* Pilihan Mode Streaming */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Pilihan Mode Streaming Aktif:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCctvStreamSource('custom');
                    triggerCctvToast('Mode Cloud Web Player aktif', 'success');
                  }}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                    cctvStreamSource === 'custom'
                      ? 'bg-sky-50 border-sky-300 ring-2 ring-sky-500/20'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <p className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-sky-600" /> Cloud Player (MSE)
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Sangat stabil di HP Android/iPhone &amp; sinyal 4G/5G.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCctvStreamSource('local');
                    connectWebRTC();
                    triggerCctvToast('Mode WebRTC aktif', 'info');
                  }}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                    cctvStreamSource === 'local'
                      ? 'bg-sky-50 border-sky-300 ring-2 ring-sky-500/20'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <p className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-sky-600" /> WebRTC Native
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Ultra-low latency &lt;0.5 detik untuk laptop di lab.
                  </p>
                </button>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsCloudModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CctvTab;
