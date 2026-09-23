'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useSimulationStore, OrganismData } from '@/store/simulationStore';

export const WorldCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { latestFrame, selectedOrganismId, setSelectedOrganismId } = useSimulationStore();

  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(2.5);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const worldWidth = 200;
  const worldHeight = 200;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width;
    canvas.height = height;

    // Clear background (Dark Scientific Grid Slate)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Render 2D World Boundary Wall
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, worldWidth, worldHeight);

    // Draw grid lines
    ctx.strokeStyle = '#1e293b';
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

    // Render Organisms
    if (latestFrame && latestFrame.organisms) {
      latestFrame.organisms.forEach((org: OrganismData) => {
        const isSelected = org.id === selectedOrganismId;

        // Render Vision Radius if selected
        if (isSelected && org.genome?.vision_range) {
          ctx.beginPath();
          ctx.arc(org.x, org.y, org.genome.vision_range, 0, 2 * Math.PI);
          ctx.fillStyle = 'rgba(59, 130, 246, 0.08)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
          ctx.setLineDash([2, 2]);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Velocity vector arrow
        if (org.vx !== 0 || org.vy !== 0) {
          ctx.beginPath();
          ctx.moveTo(org.x, org.y);
          ctx.lineTo(org.x + org.vx * 3, org.y + org.vy * 3);
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.5)';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }

        // Organism Body Circle
        ctx.beginPath();
        const radius = Math.max(1.5, Math.min(4.0, (org.energy / 50.0) * 2.5));
        ctx.arc(org.x, org.y, radius, 0, 2 * Math.PI);

        // Color based on energy / selection
        if (isSelected) {
          ctx.fillStyle = '#38bdf8';
          ctx.shadowColor = '#0284c7';
          ctx.shadowBlur = 10;
        } else {
          // Gradient from orange (low energy) to emerald (high energy)
          const energyRatio = Math.min(1.0, Math.max(0.0, org.energy / 100.0));
          const rColor = Math.round(239 * (1 - energyRatio) + 16 * energyRatio);
          const gColor = Math.round(68 * (1 - energyRatio) + 185 * energyRatio);
          const bColor = Math.round(68 * (1 - energyRatio) + 129 * energyRatio);
          ctx.fillStyle = `rgb(${rColor}, ${gColor}, ${bColor})`;

          // Subtle energy glow for high-energy organisms
          if (org.energy > 80) {
            ctx.shadowColor = 'rgba(16, 185, 129, 0.5)';
            ctx.shadowBlur = 4;
          } else {
            ctx.shadowBlur = 0;
          }
        }
        ctx.fill();

        // Signal emission ring indicator
        if (org.current_action && org.current_action.startsWith('SIGNAL_')) {
          ctx.beginPath();
          ctx.arc(org.x, org.y, 6.5, 0, 2 * Math.PI);
          ctx.strokeStyle = 'rgba(168, 85, 247, 0.7)';
          ctx.lineWidth = 0.7;
          ctx.setLineDash([1, 1]);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        ctx.strokeStyle = isSelected ? '#ffffff' : '#0f172a';
        ctx.lineWidth = isSelected ? 1.0 : 0.4;
        ctx.stroke();
      });
    }

    ctx.restore();
  }, [latestFrame, selectedOrganismId, pan, zoom]);

  // Handle Canvas Click to Select Organism
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !latestFrame) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left - pan.x) / zoom;
    const clickY = (e.clientY - rect.top - pan.y) / zoom;

    // Find nearest organism within selection distance
    let closestOrg: OrganismData | null = null;
    let minDistance = 10.0;

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
    setZoom((prev) => Math.max(0.5, Math.min(10.0, prev * zoomFactor)));
  };

  return (
    <div className="relative w-full h-full bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
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
      {/* Zoom / View Overlay Badge */}
      <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono text-slate-300 flex items-center gap-3">
        <span>Zoom: {zoom.toFixed(2)}x</span>
        <span>Organisms: {latestFrame?.organisms?.length || 0}</span>
        <span>World: 200x200</span>
      </div>
    </div>
  );
};
