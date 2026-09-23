'use client';

import React from 'react';
import { useSimulationStore } from '@/store/simulationStore';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Users, Activity, Dna, Compass, Info, FileText } from 'lucide-react';

export const OverviewDashboard: React.FC = () => {
  const { latestFrame, metricHistory } = useSimulationStore();

  const metrics = latestFrame?.metrics || {};

  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-950 font-sans text-slate-100">
      {/* Top Header Metrics Bar */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3 shadow-lg">
          <div className="p-3 bg-sky-500/10 text-sky-400 rounded-lg">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-slate-400 uppercase">Population N(t)</span>
            <div className="text-xl font-mono font-bold text-slate-100">
              {latestFrame?.population_count || 0}
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3 shadow-lg">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-slate-400 uppercase">Avg Energy E(t)</span>
            <div className="text-xl font-mono font-bold text-emerald-400">
              {(metrics.avg_energy || 0).toFixed(1)}
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3 shadow-lg">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-lg">
            <Dna className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-slate-400 uppercase">Avg Speed Trait</span>
            <div className="text-xl font-mono font-bold text-indigo-400">
              {(metrics.gene_speed_mean || 1.0).toFixed(2)}
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3 shadow-lg">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-lg">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-slate-400 uppercase">Avg Generation</span>
            <div className="text-xl font-mono font-bold text-amber-400">
              {(metrics.avg_generation || 0).toFixed(1)}
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3 shadow-lg">
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-lg">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-slate-400 uppercase">Sim Step</span>
            <div className="text-xl font-mono font-bold text-purple-400">
              {latestFrame?.step || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Scientific Research Context Panel */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-4 h-4 text-sky-400" />
          <h3 className="text-sm font-mono font-bold uppercase text-slate-200">Active Research Specification</h3>
        </div>
        <div className="grid grid-cols-3 gap-6 text-xs font-mono">
          <div className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800">
            <span className="text-slate-500 uppercase block mb-1">Research Question</span>
            <p className="text-slate-300">How do energetic constraints and spatial resource distributions shape natural selection of organism motility traits?</p>
          </div>
          <div className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800">
            <span className="text-slate-500 uppercase block mb-1">Current Hypothesis</span>
            <p className="text-slate-300">Higher movement speed evolves under patchy resource distributions despite kinetic energy costs.</p>
          </div>
          <div className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800">
            <span className="text-slate-500 uppercase block mb-1">Model Rules & Bounds</span>
            <p className="text-slate-300">No hardcoded outcomes. Energy E_cost = m_basal + α·d. Gaussian gene mutations. Seed reproducible.</p>
          </div>
        </div>
      </div>

      {/* Real-time Scientific Telemetry Charts */}
      <div className="grid grid-cols-2 gap-6">
        {/* Population Curve Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
          <h4 className="text-xs font-mono font-semibold uppercase text-slate-300 mb-4 flex items-center justify-between">
            <span>Population Dynamics N(t)</span>
            <span className="text-[10px] text-sky-400 font-normal">Live Telemetry</span>
          </h4>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metricHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="step" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#94a3b8', fontSize: '11px' }}
                />
                <Line type="monotone" dataKey="population_count" stroke="#38bdf8" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trait Evolution Trajectory Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
          <h4 className="text-xs font-mono font-semibold uppercase text-slate-300 mb-4 flex items-center justify-between">
            <span>Mean Trait Evolution Trajectories</span>
            <span className="text-[10px] text-indigo-400 font-normal">Speed & Vision</span>
          </h4>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metricHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="step" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#94a3b8', fontSize: '11px' }}
                />
                <Line type="monotone" dataKey="avg_speed" name="Mean Speed" stroke="#818cf8" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="avg_vision" name="Mean Vision Radius" stroke="#34d399" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
