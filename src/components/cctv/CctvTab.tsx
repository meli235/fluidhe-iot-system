'use client';

import React from 'react';
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
  AlertTriangle
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
  cctvPublicUrl,
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
  return (
    <div id="tour-cctv-tab" className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className={`w-2.5 h-2.5 rounded-full ${webrtcConnected || (cctvStreamSource === 'custom' && Boolean(cctvPublicUrl)) ? 'bg-sky-500 animate-pulse' : 'bg-slate-400'}`} />
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              CCTV Live Monitoring — Heat Exchanger Lab
            </h2>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
              webrtcConnected || (cctvStreamSource === 'custom' && Boolean(cctvPublicUrl))
                ? 'bg-sky-50 text-sky-700 border-sky-200'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}>
              {webrtcConnected || (cctvStreamSource === 'custom' && Boolean(cctvPublicUrl)) ? 'STREAM ONLINE' : 'STREAM OFFLINE'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            FluidHE IP Cam (1080p Full HD) • Transmisi RTSP Real-Time
          </p>
        </div>

        {/* Channel Switchers */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setSelectedCamera('cam1');
              handlePtzAction('rig');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${selectedCamera === 'cam1'
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
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${selectedCamera === 'cam2'
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
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${selectedCamera === 'cam3'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            Panel Valve
          </button>
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
                  LIVE • {selectedCamera === 'cam1' ? 'RIG SHELL & TUBE' : selectedCamera === 'cam2' ? 'STORAGE TANK' : 'VALVE MANIFOLD'}
                </span>
              </div>

              <div className="flex items-center gap-2 pointer-events-auto">
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
              {cctvStreamSource !== 'custom' ? (
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
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 space-y-3 bg-black/95 z-20 overflow-y-auto">
                      {webrtcError ? (
                        <div className="max-w-md w-full flex flex-col items-center space-y-3">
                          <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center">
                            <AlertTriangle className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white">Kamera Belum Terhubung</h4>
                            <p className="text-xs text-zinc-400 mt-1">
                              {typeof window !== 'undefined' && window.location.protocol === 'https:' && !cctvPublicUrl
                                ? 'Anda membuka aplikasi dari Vercel / HTTPS. Diperlukan URL Cloudflare Tunnel agar stream CCTV lab dapat diakses.'
                                : webrtcError}
                            </p>
                          </div>

                          {/* Cloudflare Tunnel Input Box */}
                          <div className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl p-3 text-left space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-semibold text-zinc-300">
                                URL Cloudflare Tunnel (HTTPS)
                              </label>
                              <span className="text-[10px] text-sky-400">Dari start-cctv-tunnel.bat</span>
                            </div>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={cctvPublicUrl || ''}
                                onChange={(e) => {
                                  if (setCctvPublicUrl) setCctvPublicUrl(e.target.value);
                                }}
                                placeholder="https://xxx.trycloudflare.com"
                                className="flex-1 bg-black/70 border border-zinc-700 focus:border-sky-500 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-zinc-600 outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (cctvPublicUrl && setCctvPublicUrl) {
                                    localStorage.setItem('fluidhe_cctv_public_url', cctvPublicUrl.trim().replace(/\/+$/, ''));
                                  }
                                  connectWebRTC();
                                }}
                                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg transition cursor-pointer whitespace-nowrap"
                              >
                                Sambungkan
                              </button>
                            </div>
                            <p className="text-[10px] text-zinc-500">
                              💡 Jalankan <b>start-cctv-tunnel.bat</b> di PC Lab, lalu salin URL yang berakhiran <i>.trycloudflare.com</i> ke kotak di atas.
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => connectWebRTC()}
                              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-xl transition cursor-pointer"
                            >
                              Coba Sambung Ulang
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center animate-pulse">
                            <Video className="w-6 h-6" />
                          </div>
                          <p className="text-sm font-bold text-white">Menyambungkan ke Kamera via WebRTC...</p>
                          <p className="text-xs text-zinc-500 font-mono">go2rtc &bull; port 8889</p>
                        </>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <iframe
                  src={cctvIpUrl}
                  className="w-full h-full border-0 rounded-2xl bg-black"
                  allow="autoplay; encrypted-media; picture-in-picture; camera; microphone"
                  allowFullScreen
                  title="Live CCTV Feed"
                />
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
          connected={webrtcConnected}
        />

      </div>
    </div>
  );
};

export default CctvTab;
