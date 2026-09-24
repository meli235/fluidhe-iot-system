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
  AlertTriangle,
  Wifi,
  RotateCw
} from 'lucide-react';
import { TelemetryPoint, TempLabels } from '@/types';
import { PtzController } from './PtzController';
import { CctvWifiModal } from './CctvWifiModal';

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
  isHardwareOnline?: boolean;
  tempLabels?: TempLabels;
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
  latestData,
  isHardwareOnline = false,
  tempLabels
}) => {
  const [isWifiModalOpen, setIsWifiModalOpen] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  React.useEffect(() => {
    if (!webrtcConnected) {
      connectWebRTC();
    }
  }, []);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const scriptId = 'fluidhe-video-stream-script';
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.type = 'module';
        script.src = '/video-stream.js';
        document.head.appendChild(script);
      }
    }
  }, []);

  const wsRemoteUrl = React.useMemo(() => {
    if (!cctvIpUrl) return '';
    let url = cctvIpUrl.trim();
    if (url.startsWith('https://')) {
      url = url.replace(/^https:\/\//i, 'wss://');
    } else if (url.startsWith('http://')) {
      url = url.replace(/^http:\/\//i, 'ws://');
    }
    if (url.includes('/stream.html')) {
      url = url.replace(/\/stream\.html.*/i, '/api/ws?src=he_cctv');
    } else if (!url.includes('/api/ws')) {
      url = url.replace(/\/+$/, '') + '/api/ws?src=he_cctv';
    }
    return url;
  }, [cctvIpUrl]);

  const isYouTube = React.useMemo(() => {
    const raw = (cctvIpUrl || cctvPublicUrl || '').toLowerCase();
    return raw.includes('youtube.com') || raw.includes('youtu.be');
  }, [cctvIpUrl, cctvPublicUrl]);

  const youtubeEmbedUrl = React.useMemo(() => {
    if (!isYouTube) return '';
    const raw = (cctvIpUrl || cctvPublicUrl || '').trim();
    if (raw.includes('/embed/')) {
      const base = raw.split('?')[0];
      return `${base}?autoplay=1&mute=1&playsinline=1&controls=1&modestbranding=1&rel=0`;
    }
    let videoId = 'YdcPP8Mby6k';
    const match = raw.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|video\/))([\w-]{11})/);
    if (match && match[1]) {
      videoId = match[1];
    }
    return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&playsinline=1&controls=1&modestbranding=1&rel=0`;
  }, [isYouTube, cctvIpUrl, cctvPublicUrl]);

  const videoStreamRef = React.useRef<any>(null);

  React.useEffect(() => {
    if (videoStreamRef.current && wsRemoteUrl && !isYouTube) {
      try {
        videoStreamRef.current.mode = 'mse';
        videoStreamRef.current.src = wsRemoteUrl;
      } catch (_) {}
    }
  }, [wsRemoteUrl, isYouTube]);

  return (
    <div id="tour-cctv-tab" className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className={`w-2.5 h-2.5 rounded-full ${webrtcConnected || isYouTube || (cctvStreamSource === 'custom' && Boolean(cctvPublicUrl)) ? 'bg-sky-500 animate-pulse' : 'bg-slate-400'}`} />
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              CCTV Live Monitoring — Heat Exchanger Lab
            </h2>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${webrtcConnected || isYouTube || (cctvStreamSource === 'custom' && Boolean(cctvPublicUrl))
                ? 'bg-sky-50 text-sky-700 border-sky-200'
                : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}>
              {webrtcConnected || isYouTube || (cctvStreamSource === 'custom' && Boolean(cctvPublicUrl)) ? 'STREAM ONLINE' : 'STREAM OFFLINE'}
            </span>
            <button
              type="button"
              onClick={() => {
                setIsRefreshing(true);
                connectWebRTC();
                setTimeout(() => setIsRefreshing(false), 1200);
              }}
              className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              title="Segarkan Kamera"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-sky-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Ganti Jaringan Wi-Fi (Menggantikan Channel Switchers) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsWifiModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-700 border border-slate-200 hover:border-sky-200 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
          >
            <Wifi className="w-4 h-4 text-sky-600" />
            <span>Ganti Jaringan Wi-Fi</span>
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
                  LIVE • RIG HEAT EXCHANGER LAB
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
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted={cctvAudioMuted}
                    className="w-full h-full object-contain rounded-2xl"
                    onLoadedMetadata={() => {
                      if (videoRef.current) {
                        videoRef.current.play().catch(() => {});
                      }
                    }}
                  />

                  {/* Corner Unmute Badge */}
                  {webrtcConnected && cctvAudioMuted && (
                    <button
                      type="button"
                      onClick={() => {
                        setCctvAudioMuted(false);
                        setAudioUserActivated(true);
                        if (videoRef.current) {
                          videoRef.current.muted = false;
                          videoRef.current.volume = (cctvVolume || 100) / 100;
                          videoRef.current.play().catch(() => {});
                        }
                        triggerCctvToast('Audio CCTV aktif', 'info');
                      }}
                      className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 bg-black/70 hover:bg-black/90 backdrop-blur-md border border-white/15 rounded-full text-white text-xs font-semibold shadow-lg transition cursor-pointer"
                    >
                      <VolumeX className="w-3.5 h-3.5 text-amber-400" />
                      <span>Audio Dibisukan &bull; Klik untuk Suara</span>
                    </button>
                  )}

                  {/* Friendly Standby / Connecting State */}
                  {!webrtcConnected && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 space-y-4 bg-zinc-950/90 backdrop-blur-sm z-20">
                      <div className="relative flex items-center justify-center">
                        <div className="w-16 h-16 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20 shadow-lg">
                          <Video className="w-8 h-8" />
                        </div>
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
                        </span>
                      </div>
                      
                      <div className="space-y-1.5 max-w-sm">
                        <h4 className="text-sm font-bold text-white tracking-wide">
                          Menghubungkan Kamera Laboratorium
                        </h4>
                        <p className="text-xs text-zinc-400 leading-relaxed">
                          Memuat transmisi siaran langsung CCTV secara otomatis...
                        </p>
                      </div>

                      <div className="flex items-center gap-2.5 pt-1">
                        <button
                          type="button"
                          onClick={() => connectWebRTC()}
                          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-xl transition cursor-pointer flex items-center gap-1.5 border border-zinc-700 shadow-sm"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                          <span>Muat Ulang Kamera</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsWifiModalOpen(true)}
                          className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-sky-600/20"
                        >
                          <Wifi className="w-3.5 h-3.5" />
                          <span>Pengaturan Wi-Fi</span>
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : isYouTube ? (
                <div className="w-full h-full border-0 rounded-2xl bg-black flex items-center justify-center overflow-hidden">
                  <iframe
                    src={youtubeEmbedUrl}
                    className="w-full h-full border-0 rounded-2xl bg-black"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    title="Live CCTV Feed - Rig Heat Exchanger"
                  />
                </div>
              ) : (
                <div className="w-full h-full border-0 rounded-2xl bg-black flex items-center justify-center overflow-hidden">
                  {React.createElement('video-stream', {
                    ref: videoStreamRef,
                    mode: 'mse',
                    src: wsRemoteUrl,
                    style: { width: '100%', height: '100%', display: 'block' }
                  })}
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
                className={`flex flex-col items-center justify-center p-3 rounded-xl transition text-xs font-bold gap-1.5 border shadow-xs cursor-pointer ${isManualRecording
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
                className={`flex flex-col items-center justify-center p-3 rounded-xl transition text-xs font-bold gap-1.5 border shadow-xs cursor-pointer ${!cctvAudioMuted
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
          isHardwareOnline={isHardwareOnline}
          tempLabels={tempLabels}
        />

      </div>

      {/* Modal Pengaturan Wi-Fi CCTV */}
      <CctvWifiModal
        isOpen={isWifiModalOpen}
        onClose={() => setIsWifiModalOpen(false)}
        onConnected={() => connectWebRTC()}
        triggerToast={triggerCctvToast}
      />
    </div>
  );
};

export default CctvTab;
