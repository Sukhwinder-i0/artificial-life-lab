'use client';

import React, { useEffect } from 'react';
import { useSimulationStore } from '@/store/simulationStore';
import { WorldCanvas } from '@/components/canvas/WorldCanvas';
import { OrganismInspector } from '@/components/inspector/OrganismInspector';
import { OverviewDashboard } from '@/components/dashboard/OverviewDashboard';
import { BrainInspector } from '@/components/brain/BrainInspector';
import { LineageTree } from '@/components/lineage/LineageTree';
import { ExperimentBuilder } from '@/components/experiments/ExperimentBuilder';
import { AnalysisDashboard } from '@/components/analysis/AnalysisDashboard';
import { SpeciationVisualizer } from '@/components/analysis/SpeciationVisualizer';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  FlaskConical,
} from 'lucide-react';

export default function ArtificialLifeLabApp() {
  const {
    activeTab,
    setActiveTab,
    isConnected,
    isRunning,
    speed,
    setSpeed,
    togglePlayback,
    stepSimulation,
    resetSimulation,
    processFrame,
  } = useSimulationStore();

  // Connect WebSocket to Python Simulation Server
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      ws = new WebSocket('ws://localhost:8000/ws/simulation');

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          processFrame(data);
        } catch (e) {
          console.error('Failed parsing WebSocket JSON frame', e);
        }
      };

      ws.onerror = () => {
        reconnectTimeout = setTimeout(connect, 3000);
      };

      ws.onclose = () => {
        reconnectTimeout = setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      if (ws) ws.close();
      clearTimeout(reconnectTimeout);
    };
  }, [processFrame]);

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 font-sans select-none overflow-hidden">
      {/* Top Header & Navigation Bar */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-sky-500 to-indigo-600 rounded-lg text-white shadow-lg">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-mono font-bold tracking-wider text-slate-100 uppercase">
              ARTIFICIAL LIFE LAB
            </h1>
            <p className="text-[10px] text-slate-500 font-mono">Computational Ecosystem Platform</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          {(['Simulation', 'Overview', 'Evolution', 'Speciation', 'Organisms', 'Experiments', 'Analysis', 'Settings'] as const).map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-3.5 py-1.5 rounded-md text-xs font-mono transition-all ${
                  activeTab === tab
                    ? 'bg-slate-800 text-sky-400 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            )
          )}
        </nav>

        {/* Status Indicator & Connection */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-mono bg-slate-950 px-3 py-1.5 rounded-full border border-slate-800">
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span className="text-slate-400">{isConnected ? 'Server Live' : 'Connecting Engine...'}</span>
          </div>
        </div>
      </header>

      {/* Main Workspace View */}
      <div className="flex-1 flex overflow-hidden">
        {activeTab === 'Overview' && <OverviewDashboard />}
        {activeTab === 'Evolution' && <BrainInspector />}
        {activeTab === 'Speciation' && <SpeciationVisualizer />}
        {activeTab === 'Organisms' && <LineageTree />}
        {activeTab === 'Experiments' && <ExperimentBuilder />}
        {activeTab === 'Analysis' && <AnalysisDashboard />}

        {activeTab === 'Simulation' && (
          <div className="flex-1 flex overflow-hidden relative">
            <div className="flex-1 p-4 flex flex-col gap-4">
              {/* Simulation Canvas Viewport */}
              <div className="flex-1 relative">
                <WorldCanvas />
              </div>

              {/* Bottom Playback Control Bar */}
              <div className="h-14 bg-slate-900 border border-slate-800 rounded-xl px-6 flex items-center justify-between shadow-xl">
                <div className="flex items-center gap-3">
                  <button
                    onClick={togglePlayback}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all shadow-md ${
                      isRunning
                        ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                        : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950'
                    }`}
                  >
                    {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {isRunning ? 'PAUSE' : 'RUN'}
                  </button>

                  <button
                    onClick={stepSimulation}
                    disabled={isRunning}
                    className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded-lg text-xs font-mono flex items-center gap-1 border border-slate-700"
                  >
                    <SkipForward className="w-4 h-4" /> STEP +1
                  </button>

                  <button
                    onClick={() => resetSimulation(42)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono flex items-center gap-1 border border-slate-700"
                  >
                    <RotateCcw className="w-4 h-4" /> RESET SEED
                  </button>
                </div>

                {/* Speed Scalar Selector */}
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                  <span>Simulation Speed:</span>
                  {[0.5, 1.0, 2.0, 5.0].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSpeed(s)}
                      className={`px-2 py-1 rounded border ${
                        speed === s
                          ? 'bg-sky-500/20 text-sky-400 border-sky-500/50 font-bold'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Organism Inspector */}
            <OrganismInspector />
          </div>
        )}

        {activeTab === 'Settings' && (
          <div className="flex-1 p-8 bg-slate-950 flex flex-col items-center justify-center text-center">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl max-w-md">
              <FlaskConical className="w-10 h-10 text-sky-400 mx-auto mb-3 text-center inline-block" />
              <h3 className="text-base font-mono font-bold text-slate-200 uppercase">Settings Module</h3>
              <p className="text-xs text-slate-400 mt-2 font-mono">
                Simulation engine & API server configuration active on ws://localhost:8000.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
