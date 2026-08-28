'use client';

import React, { useState, useMemo } from 'react';
import { Activity } from 'lucide-react';
import { TelemetryPoint } from '@/types';

interface LiveChartProps {
  telemetryHistory: TelemetryPoint[];
}

type ChannelKey = 'all' | 'ti1' | 'ti2' | 'ti3' | 'ti4';

/**
 * Calculates a smooth Cubic Bezier path through discrete points (Catmull-Rom spline conversion)
 */
function getSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;

  let d = `M ${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
  }
  return d;
}

/**
 * Generates an area polygon path from smooth curve down to baseline Y
 */
function getAreaPath(points: { x: number; y: number }[], baselineY: number): string {
  if (points.length < 2) return '';
  const linePath = getSmoothPath(points);
  const firstX = points[0].x.toFixed(1);
  const lastX = points[points.length - 1].x.toFixed(1);
  return `${linePath} L ${lastX},${baselineY} L ${firstX},${baselineY} Z`;
}

export const LiveChart: React.FC<LiveChartProps> = ({ telemetryHistory }) => {
  const [activeChannel, setActiveChannel] = useState<ChannelKey>('all');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);

  // Generate dynamic undulating wave demo data (matching reference image)
  const [demoHistory, setDemoHistory] = useState<TelemetryPoint[]>(() => {
    const pts: TelemetryPoint[] = [];
    const baseTime = Date.now() - 20 * 2000;
    for (let i = 0; i < 20; i++) {
      const t = new Date(baseTime + i * 2000).toLocaleTimeString('id-ID');
      const angle = i * 0.65;
      const ti4 = parseFloat((48 + 14 * Math.sin(angle) + 4 * Math.cos(angle * 1.8)).toFixed(1));
      const ti1 = parseFloat((72 + 10 * Math.sin(angle + 1.2) + 3 * Math.cos(angle * 1.5)).toFixed(1));
      const ti2 = parseFloat((58 + 7 * Math.sin(angle - 0.8) + 2 * Math.cos(angle * 1.2)).toFixed(1));
      const ti3 = parseFloat((29 + 4 * Math.sin(angle * 0.8) + 1.5 * Math.cos(angle * 1.1)).toFixed(1));
      pts.push({
        timestamp: t,
        ti1,
        ti2,
        ti3,
        ti4,
        ti5: parseFloat(((ti3 + ti4) / 2).toFixed(1)),
        ti6: parseFloat(((ti1 + ti2) / 2).toFixed(1)),
        pi1: 2.1,
        pi2: 1.7,
        pi3: 1.9,
        pi4: 1.5,
        fc1: 4.5,
        fc2: 5.2,
        tc1Setpoint: 75,
        heater1Active: true,
        heater2Active: true,
        mode: 'Counter-Current'
      });
    }
    return pts;
  });

  // Continuous animation ticker for wave demo
  React.useEffect(() => {
    if (!isDemoMode) return;
    const interval = setInterval(() => {
      setDemoHistory((prev) => {
        const now = new Date();
        const t = now.toLocaleTimeString('id-ID');
        const count = prev.length;
        const angle = (Date.now() / 1000) * 0.8;

        const ti4 = parseFloat((48 + 14 * Math.sin(angle) + 4 * Math.cos(angle * 1.8)).toFixed(1));
        const ti1 = parseFloat((72 + 10 * Math.sin(angle + 1.2) + 3 * Math.cos(angle * 1.5)).toFixed(1));
        const ti2 = parseFloat((58 + 7 * Math.sin(angle - 0.8) + 2 * Math.cos(angle * 1.2)).toFixed(1));
        const ti3 = parseFloat((29 + 4 * Math.sin(angle * 0.8) + 1.5 * Math.cos(angle * 1.1)).toFixed(1));

        const nextPt: TelemetryPoint = {
          timestamp: t,
          ti1,
          ti2,
          ti3,
          ti4,
          ti5: parseFloat(((ti3 + ti4) / 2).toFixed(1)),
          ti6: parseFloat(((ti1 + ti2) / 2).toFixed(1)),
          pi1: 2.1,
          pi2: 1.7,
          pi3: 1.9,
          pi4: 1.5,
          fc1: 4.5,
          fc2: 5.2,
          tc1Setpoint: 75,
          heater1Active: true,
          heater2Active: true,
          mode: 'Counter-Current'
        };
        return [...prev.slice(1), nextPt];
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [isDemoMode]);

  const activeHistory = isDemoMode || !telemetryHistory || telemetryHistory.length < 2
    ? demoHistory
    : telemetryHistory;

  // SVG Dimension Constants
  const width = 860;
  const height = 240;
  const padLeft = 45;
  const padRight = 30;
  const padTop = 25;
  const padBottom = 45;

  const plotWidth = width - padLeft - padRight;
  const plotHeight = height - padTop - padBottom;
  const baselineY = height - padBottom;

  // Temperature Scale: Standard Full Scale 0°C to 100°C (with 20°C steps)
  const minTemp = 0;
  const maxTemp = 100;
  const tempSteps = [100, 80, 60, 40, 20, 0];

  const mapY = (val: number) => {
    const clamped = Math.max(minTemp, Math.min(maxTemp, val));
    const ratio = (clamped - minTemp) / (maxTemp - minTemp || 1);
    return baselineY - ratio * plotHeight;
  };

  const mapX = (index: number, total: number) => {
    if (total <= 1) return padLeft;
    return padLeft + (index / (total - 1)) * plotWidth;
  };

  // Precompute smooth point arrays
  const totalPoints = activeHistory.length;
  const ti1Points = useMemo(
    () => activeHistory.map((d, i) => ({ x: mapX(i, totalPoints), y: mapY(d.ti1) })),
    [activeHistory]
  );
  const ti2Points = useMemo(
    () => activeHistory.map((d, i) => ({ x: mapX(i, totalPoints), y: mapY(d.ti2) })),
    [activeHistory]
  );
  const ti3Points = useMemo(
    () => activeHistory.map((d, i) => ({ x: mapX(i, totalPoints), y: mapY(d.ti3) })),
    [activeHistory]
  );
  const ti4Points = useMemo(
    () => activeHistory.map((d, i) => ({ x: mapX(i, totalPoints), y: mapY(d.ti4) })),
    [activeHistory]
  );

  const ti1Path = useMemo(() => getSmoothPath(ti1Points), [ti1Points]);
  const ti2Path = useMemo(() => getSmoothPath(ti2Points), [ti2Points]);
  const ti3Path = useMemo(() => getSmoothPath(ti3Points), [ti3Points]);
  const ti4Path = useMemo(() => getSmoothPath(ti4Points), [ti4Points]);

  const ti1Area = useMemo(() => getAreaPath(ti1Points, baselineY), [ti1Points, baselineY]);
  const ti4Area = useMemo(() => getAreaPath(ti4Points, baselineY), [ti4Points, baselineY]);

  const latestPoint = activeHistory[activeHistory.length - 1];
  const hoveredPoint = hoverIndex !== null ? activeHistory[hoverIndex] : null;

  return (
    <div className="asklepios-card p-3.5 sm:p-6 bg-white shadow-sm border border-slate-200/80 rounded-2xl sm:rounded-3xl space-y-3 sm:space-y-4">
      {/* Header (Clean, minimal, without redundant buttons) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-sky-600 animate-pulse" />
            Grafik Gelombang Suhu Real-Time
          </h3>
          <p className="text-xs text-slate-500">
            Dinamika termal terkalibrasi per interval waktu (TI₁ - TI₄)
          </p>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="w-full overflow-x-auto relative rounded-2xl bg-gradient-to-b from-slate-50/50 to-white border border-slate-100 p-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-56 min-w-[700px] font-sans overflow-visible select-none"
          onMouseLeave={() => setHoverIndex(null)}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const mouseX = ((e.clientX - rect.left) / rect.width) * width;
            const boundedX = Math.max(padLeft, Math.min(width - padRight, mouseX));
            const ratio = (boundedX - padLeft) / plotWidth;
            const index = Math.round(ratio * (totalPoints - 1));
            if (index >= 0 && index < totalPoints) {
              setHoverIndex(index);
            }
          }}
        >
          <defs>
            {/* Soft Ambient Area Fill Gradients matching reference image */}
            <linearGradient id="grad_airy_blue_area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.22" />
              <stop offset="60%" stopColor="#60A5FA" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#93C5FD" stopOpacity="0.00" />
            </linearGradient>

            <linearGradient id="grad_airy_amber_area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.18" />
              <stop offset="60%" stopColor="#FBBF24" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#FDE68A" stopOpacity="0.00" />
            </linearGradient>

            {/* Glowing Flowing Stroke Gradients */}
            <linearGradient id="wave_grad_primary_flow" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="35%" stopColor="#3B82F6" />
              <stop offset="70%" stopColor="#0EA5E9" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>

            <linearGradient id="wave_grad_hot_flow" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#F97316" />
              <stop offset="100%" stopColor="#EF4444" />
            </linearGradient>
          </defs>

          {/* Grid Background Horizontal Lines & Labels (0°C to 100°C standard industrial scale) */}
          {tempSteps.map((tempVal) => {
            const y = mapY(tempVal);
            return (
              <g key={tempVal}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="#F1F5F9"
                  strokeWidth="1"
                  strokeDasharray={tempVal === 0 ? 'none' : '4 4'}
                />
                <text
                  x={padLeft - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  className="text-[10px] fill-slate-400 font-semibold"
                >
                  {tempVal}°C
                </text>
              </g>
            );
          })}

          {/* Ambient Wave Gradients */}
          {(activeChannel === 'all' || activeChannel === 'ti4') && (
            <path d={ti4Area} fill="url(#grad_airy_blue_area)" className="transition-all duration-500 ease-out" />
          )}
          {(activeChannel === 'ti1') && (
            <path d={ti1Area} fill="url(#grad_airy_amber_area)" className="transition-all duration-500 ease-out" />
          )}

          {/* Smooth Flowing Spline Curves */}
          {/* TI3: Cold Inlet */}
          {(activeChannel === 'all' || activeChannel === 'ti3') && (
            <path
              d={ti3Path}
              fill="none"
              stroke="#06B6D4"
              strokeWidth={activeChannel === 'ti3' ? '3.5' : '2'}
              strokeDasharray="5 3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-all duration-500 ease-out opacity-85"
            />
          )}

          {/* TI2: Hot Outlet */}
          {(activeChannel === 'all' || activeChannel === 'ti2') && (
            <path
              d={ti2Path}
              fill="none"
              stroke="#F43F5E"
              strokeWidth={activeChannel === 'ti2' ? '3.5' : '2'}
              strokeDasharray="5 3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-all duration-500 ease-out opacity-85"
            />
          )}

          {/* TI1: Hot Inlet */}
          {(activeChannel === 'all' || activeChannel === 'ti1') && (
            <path
              d={ti1Path}
              fill="none"
              stroke="url(#wave_grad_hot_flow)"
              strokeWidth={activeChannel === 'ti1' ? '4' : '3'}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-all duration-500 ease-out"
            />
          )}

          {/* TI4: Cold Outlet (Signature Cyan-Blue Wave matching reference image) */}
          {(activeChannel === 'all' || activeChannel === 'ti4') && (
            <path
              d={ti4Path}
              fill="none"
              stroke="url(#wave_grad_primary_flow)"
              strokeWidth={activeChannel === 'ti4' ? '4.5' : '3.5'}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-all duration-500 ease-out drop-shadow-sm"
            />
          )}

          {/* Latest Live Pulse Beacon at rightmost point */}
          {ti1Points.length > 0 && (activeChannel === 'all' || activeChannel === 'ti1') && (
            <g transform={`translate(${ti1Points[ti1Points.length - 1].x}, ${ti1Points[ti1Points.length - 1].y})`}>
              <circle r="7" fill="#D97706" fillOpacity="0.3" className="animate-ping" />
              <circle r="4" fill="#D97706" stroke="#FFFFFF" strokeWidth="2" />
            </g>
          )}

          {ti4Points.length > 0 && (activeChannel === 'all' || activeChannel === 'ti4') && (
            <g transform={`translate(${ti4Points[ti4Points.length - 1].x}, ${ti4Points[ti4Points.length - 1].y})`}>
              <circle r="7" fill="#0284C7" fillOpacity="0.3" className="animate-ping" />
              <circle r="4" fill="#0284C7" stroke="#FFFFFF" strokeWidth="2" />
            </g>
          )}

          {/* Hover Crosshair Vertical Line */}
          {hoverIndex !== null && (
            <g>
              <line
                x1={mapX(hoverIndex, totalPoints)}
                y1={padTop}
                x2={mapX(hoverIndex, totalPoints)}
                y2={baselineY}
                stroke="#64748B"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
              {/* Highlight Dots at Hover X */}
              {(activeChannel === 'all' || activeChannel === 'ti1') && (
                <circle cx={ti1Points[hoverIndex]?.x} cy={ti1Points[hoverIndex]?.y} r="5" fill="#D97706" stroke="#fff" strokeWidth="2" />
              )}
              {(activeChannel === 'all' || activeChannel === 'ti4') && (
                <circle cx={ti4Points[hoverIndex]?.x} cy={ti4Points[hoverIndex]?.y} r="5" fill="#0284C7" stroke="#fff" strokeWidth="2" />
              )}
            </g>
          )}

          {/* X-Axis Timestamps */}
          {activeHistory.map((d, i) => {
            const step = Math.max(1, Math.floor(totalPoints / 7));
            if (i % step === 0 || i === totalPoints - 1) {
              const x = mapX(i, totalPoints);
              return (
                <text
                  key={i}
                  x={x}
                  y={baselineY + 22}
                  textAnchor="middle"
                  className="text-[10px] fill-slate-400 font-semibold"
                >
                  {d.timestamp}
                </text>
              );
            }
            return null;
          })}
        </svg>

        {/* Hover Floating Tooltip */}
        {hoverIndex !== null && hoveredPoint && (
          <div
            className="absolute top-3 right-4 bg-slate-900/90 backdrop-blur-sm text-white px-3.5 py-2 rounded-xl text-xs shadow-xl border border-slate-700 pointer-events-none transition-all"
          >
            <div className="text-[10px] text-slate-400 font-bold mb-1 border-b border-slate-700 pb-0.5">
              Waktu: {hoveredPoint.timestamp}
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-[11px]">
              <span className="text-amber-400 font-bold">TI1 (Hot In): {hoveredPoint.ti1.toFixed(1)}°C</span>
              <span className="text-rose-400 font-bold">TI2 (Hot Out): {hoveredPoint.ti2.toFixed(1)}°C</span>
              <span className="text-cyan-400 font-bold">TI3 (Cold In): {hoveredPoint.ti3.toFixed(1)}°C</span>
              <span className="text-sky-400 font-bold">TI4 (Cold Out): {hoveredPoint.ti4.toFixed(1)}°C</span>
            </div>
          </div>
        )}
      </div>

      {/* Legend Footer */}
      <div className="flex flex-wrap justify-center items-center gap-6 pt-1 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveChannel(activeChannel === 'ti1' ? 'all' : 'ti1')}
          className={`flex items-center gap-2 cursor-pointer transition ${activeChannel === 'ti1' ? 'scale-105 font-bold' : ''
            }`}
        >
          <span className="w-3.5 h-1.5 bg-amber-600 rounded-full shadow-sm" />
          <span className="text-amber-800">TI1 (Hot Inlet)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveChannel(activeChannel === 'ti2' ? 'all' : 'ti2')}
          className={`flex items-center gap-2 cursor-pointer transition ${activeChannel === 'ti2' ? 'scale-105 font-bold' : ''
            }`}
        >
          <span className="w-3.5 h-1.5 bg-rose-600 rounded-full border-dashed" />
          <span className="text-rose-800">TI2 (Hot Outlet - Heater 2)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveChannel(activeChannel === 'ti3' ? 'all' : 'ti3')}
          className={`flex items-center gap-2 cursor-pointer transition ${activeChannel === 'ti3' ? 'scale-105 font-bold' : ''
            }`}
        >
          <span className="w-3.5 h-1.5 bg-cyan-600 rounded-full border-dashed" />
          <span className="text-cyan-800">TI3 (Cold Inlet)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveChannel(activeChannel === 'ti4' ? 'all' : 'ti4')}
          className={`flex items-center gap-2 cursor-pointer transition ${activeChannel === 'ti4' ? 'scale-105 font-bold' : ''
            }`}
        >
          <span className="w-3.5 h-1.5 bg-sky-600 rounded-full shadow-sm" />
          <span className="text-sky-800">TI4 (Cold Outlet)</span>
        </button>
      </div>
    </div>
  );
};

export default LiveChart;
