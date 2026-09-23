'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useSimulationStore, OrganismData, ResourcePatchData } from '@/store/simulationStore';
import { Eye, Layers, Compass, RotateCcw, Activity, Shield, Sparkles } from 'lucide-react';

export const WorldCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { latestFrame, selectedOrganismId, setSelectedOrganismId } = useSimulationStore();

  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 20, y: 20 });
  const [zoom, setZoom] = useState<number>(3.2);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Viewport toggle modes
  const [showTrails, setShowTrails] = useState<boolean>(true);
  const [showResources, setShowResources] = useState<boolean>(true);
  const [showVision, setShowVision] = useState<boolean>(true);
  const [showLegend, setShowLegend] = useState<boolean>(true);

  // Historical motion trails map
  const trailHistoryRef = useRef<Map<string, { x: number; y: number }[]>>(new Map());

  const worldWidth = 200;
  const worldHeight = 200;

  // Auto-center canvas on mount or window resize
  const centerCamera = () => {
    const container = containerRef.current;
    if (!container) return;
    const cw = container.clientWidth;
    const ch = container.clientHeight;
    const initialZoom = Math.min(cw / (worldWidth * 1.15), ch / (worldHeight * 1.15));
    const initialPanX = (cw - worldWidth * initialZoom) / 2;
    const initialPanY = (ch - worldHeight * initialZoom) / 2;
    setZoom(initialZoom);
    setPan({ x: initialPanX, y: initialPanY });
  };

  useEffect(() => {
    centerCamera();
  }, []);

  // Update motion trail history buffer
  useEffect(() => {
    if (!latestFrame || !latestFrame.organisms) return;
    const currentMap = trailHistoryRef.current;
    const activeIds = new Set<string>();

    latestFrame.organisms.forEach((org: OrganismData) => {
      activeIds.add(org.id);
      const history = currentMap.get(org.id) || [];
      const updatedHistory = [...history, { x: org.x, y: org.y }].slice(-8);
      currentMap.set(org.id, updatedHistory);
    });

    // Cleanup dead organisms from history buffer
    currentMap.forEach((_, id) => {
      if (!activeIds.has(id)) {
        currentMap.delete(id);
      }
    });
  }, [latestFrame]);

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width;
    canvas.height = height;

    // Reset shadow blur context state
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';

    // Clear background (Deep Space Slate Grid)
    ctx.fillStyle = '#060b13';
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Render World Boundary Box
    ctx.fillStyle = '#090f1d';
    ctx.fillRect(0, 0, worldWidth, worldHeight);

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, worldWidth, worldHeight);

    // Draw grid lines
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= worldWidth; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, worldHeight);
      ctx.stroke();
    }
    for (let y = 0; y <= worldHeight; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(worldWidth, y);
      ctx.stroke();
    }

    // 1. Render Resource Density Patches
    if (showResources && latestFrame && latestFrame.resources) {
      latestFrame.resources.forEach((res: ResourcePatchData) => {
        ctx.beginPath();
        const resRadius = Math.max(1.0, Math.min(3.5, res.amount / 25.0));
        ctx.arc(res.x, res.y, resRadius, 0, 2 * Math.PI);
        ctx.fillStyle = `rgba(16, 185, 129, ${Math.min(0.45, res.amount / 80.0)})`;
        ctx.fill();
      });
    }

    // 2. Render Motion Trails (Fading Motion Paths)
    if (showTrails) {
      trailHistoryRef.current.forEach((history) => {
        if (history.length < 2) return;
        ctx.beginPath();
        ctx.moveTo(history[0].x, history[0].y);
        for (let i = 1; i < history.length; i++) {
          ctx.lineTo(history[i].x, history[i].y);
        }
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      });
    }

    // 3. Render Organisms
    if (latestFrame && latestFrame.organisms) {
      latestFrame.organisms.forEach((org: OrganismData) => {
        const isSelected = org.id === selectedOrganismId;

        // Vision Radius Ring
        if ((isSelected || showVision) && org.genome?.vision_range) {
          ctx.beginPath();
          ctx.arc(org.x, org.y, org.genome.vision_range, 0, 2 * Math.PI);
          ctx.fillStyle = isSelected ? 'rgba(56, 189, 248, 0.06)' : 'rgba(51, 65, 85, 0.03)';
          ctx.fill();
          ctx.strokeStyle = isSelected ? 'rgba(56, 189, 248, 0.5)' : 'rgba(51, 65, 85, 0.2)';
          ctx.lineWidth = isSelected ? 0.8 : 0.4;
          if (!isSelected) ctx.setLineDash([2, 2]);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Signal Emission Pulsing Ring
        if (org.current_action && org.current_action.startsWith('SIGNAL_')) {
          ctx.beginPath();
          ctx.arc(org.x, org.y, 7.0, 0, 2 * Math.PI);
          ctx.strokeStyle = 'rgba(168, 85, 247, 0.7)';
          ctx.lineWidth = 0.8;
          ctx.setLineDash([1, 1]);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Heading Direction Vector & Arrowhead
        const angle = Math.atan2(org.vy, org.vx);
        const radius = Math.max(1.8, Math.min(4.5, (org.energy / 50.0) * 2.2));

        ctx.save();
        ctx.translate(org.x, org.y);
        ctx.rotate(angle);

        // Body Shape (Directional Arrow/Triangle)
        ctx.beginPath();
        ctx.moveTo(radius * 1.4, 0);
        ctx.lineTo(-radius, -radius * 0.8);
        ctx.lineTo(-radius * 0.5, 0);
        ctx.lineTo(-radius, radius * 0.8);
        ctx.closePath();

        // Color mapping by Energy
        if (isSelected) {
          ctx.fillStyle = '#38bdf8';
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.2;
        } else {
          const energyRatio = Math.min(1.0, Math.max(0.0, org.energy / 100.0));
          if (energyRatio > 0.6) {
            ctx.fillStyle = '#10b981'; // Emerald (Well fed)
          } else if (energyRatio > 0.25) {
            ctx.fillStyle = '#38bdf8'; // Cyan (Moderate)
          } else {
            ctx.fillStyle = '#f43f5e'; // Crimson (Low energy / Starving)
          }
          ctx.strokeStyle = '#060b13';
          ctx.lineWidth = 0.5;
        }

        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Selected Target Reticle Spotlight
        if (isSelected) {
          ctx.beginPath();
          ctx.arc(org.x, org.y, radius + 4.0, 0, 2 * Math.PI);
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 0.8;
          ctx.setLineDash([2, 2]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      });
    }

    ctx.restore();
  }, [latestFrame, selectedOrganismId, pan, zoom, showTrails, showResources, showVision]);

  // Handle Canvas Mouse Interactions
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !latestFrame) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left - pan.x) / zoom;
    const clickY = (e.clientY - rect.top - pan.y) / zoom;

    let closestOrg: OrganismData | null = null;
    let minDistance = 12.0;

    latestFrame.organisms.forEach((org: OrganismData) => {
      const dist = Math.hypot(org.x - clickX, org.y - clickY);
      if (dist < minDistance) {
        minDistance = dist;
        closestOrg = org;
      }
    });

    if (closestOrg) {
      setSelectedOrganismId((closestOrg as OrganismData).id);
    } else {
      setSelectedOrganismId(null);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
    setZoom((prev) => Math.max(0.5, Math.min(12.0, prev * zoomFactor)));
  };

  return (
    <div ref={containerRef} className="relative w-full h-full bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col">
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Top-Left Viewport HUD */}
      <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 flex items-center gap-4 shadow-xl">
        <div className="flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-sky-400" />
          <span>Zoom: <strong className="text-slate-100">{zoom.toFixed(2)}x</strong></span>
        </div>
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span>Organisms: <strong className="text-emerald-400">{latestFrame?.organisms?.length || 0}</strong></span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400">
          <span>Step: <strong className="text-slate-200">{latestFrame?.step || 0}</strong></span>
        </div>
        <button
          onClick={centerCamera}
          className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-sky-400 transition-all border border-slate-700/50"
          title="Reset Camera View"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Top-Right Toggle Toolbar & Legend */}
      <div className="absolute top-4 right-4 flex flex-col items-end gap-2 z-10">
        <div className="bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 flex items-center gap-1 shadow-xl text-xs font-mono">
          <button
            onClick={() => setShowTrails((v) => !v)}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              showTrails
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Trails
          </button>
          <button
            onClick={() => setShowResources((v) => !v)}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              showResources
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Resources
          </button>
          <button
            onClick={() => setShowVision((v) => !v)}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              showVision
                ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Vision
          </button>
          <button
            onClick={() => setShowLegend((v) => !v)}
            className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800"
            title="Toggle Legend"
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>

        {/* Collapsible Scientific Legend */}
        {showLegend && (
          <div className="bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-800 shadow-2xl text-[11px] font-mono space-y-1.5 w-52 text-slate-300">
            <div className="font-bold text-slate-200 border-b border-slate-800 pb-1 mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" /> Scientific Legend
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Well-Fed Organism (&gt;60% E)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
              <span>Moderate Organism (25-60% E)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Starving Organism (&lt;25% E)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/40 border border-emerald-500/60" />
              <span>Nutrient Resource Patch</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full border border-purple-400 border-dashed" />
              <span>Signal Token Emission</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-0.5 bg-sky-400/40" />
              <span>Motion Trail Ghost</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
