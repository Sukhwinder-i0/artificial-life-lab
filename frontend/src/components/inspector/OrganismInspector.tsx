'use client';

import React from 'react';
import { useSimulationStore, OrganismData } from '@/store/simulationStore';
import { Dna, Activity, Zap, Shield, Eye, Gauge, Compass } from 'lucide-react';

export const OrganismInspector: React.FC = () => {
  const { latestFrame, selectedOrganismId, setSelectedOrganismId } = useSimulationStore();

  const selectedOrganism: OrganismData | undefined = latestFrame?.organisms?.find(
    (o) => o.id === selectedOrganismId
  );

  if (!selectedOrganism) {
    return (
      <div className="w-80 bg-slate-900 border-l border-slate-800 p-6 flex flex-col items-center justify-center text-center text-slate-500">
        <Dna className="w-12 h-12 mb-3 text-slate-700 animate-pulse" />
        <h4 className="text-sm font-semibold text-slate-400">Organism Inspector</h4>
        <p className="text-xs mt-1 text-slate-600">Click any organism on the 2D Canvas to inspect continuous state & genome parameters.</p>
      </div>
    );
  }

  const genome = selectedOrganism.genome || {};

  return (
    <div className="w-80 bg-slate-900 border-l border-slate-800 p-5 flex flex-col justify-between overflow-y-auto font-sans">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-ping" />
              <h3 className="text-sm font-mono font-bold text-slate-100">{selectedOrganism.id}</h3>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Gen {selectedOrganism.generation} • Parent: {selectedOrganism.parent_id || 'Root Ancestor'}
            </p>
          </div>
          <button
            onClick={() => setSelectedOrganismId(null)}
            className="text-slate-500 hover:text-slate-300 text-xs px-2 py-1 bg-slate-800 rounded"
          >
            Close
          </button>
        </div>

        {/* Vital State Bars */}
        <div className="my-5 space-y-4">
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-slate-400 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Energy
              </span>
              <span className="text-amber-400 font-bold">{selectedOrganism.energy.toFixed(1)}</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all"
                style={{ width: `${Math.min(100, (selectedOrganism.energy / 150) * 100)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-slate-400 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-emerald-400" /> Health
              </span>
              <span className="text-emerald-400 font-bold">{selectedOrganism.health.toFixed(0)}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all"
                style={{ width: `${selectedOrganism.health}%` }}
              />
            </div>
          </div>
        </div>

        {/* Status Badges */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase font-mono block">Action State</span>
            <span className="text-xs font-mono font-semibold text-sky-400">{selectedOrganism.current_action}</span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase font-mono block">Age (Steps)</span>
            <span className="text-xs font-mono font-semibold text-slate-200">{selectedOrganism.age}</span>
          </div>
        </div>

        {/* Genome Traits Table */}
        <div>
          <h4 className="text-xs font-semibold uppercase font-mono text-slate-400 mb-3 flex items-center gap-1.5">
            <Dna className="w-4 h-4 text-sky-400" /> Quantitative Genome
          </h4>
          <div className="space-y-2.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400 flex items-center gap-1">
                <Gauge className="w-3 h-3 text-slate-500" /> Movement Speed
              </span>
              <span className="text-slate-200">{genome.speed?.toFixed(2) || '1.00'}</span>
            </div>
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400 flex items-center gap-1">
                <Eye className="w-3 h-3 text-slate-500" /> Vision Radius
              </span>
              <span className="text-slate-200">{genome.vision_range?.toFixed(1) || '15.0'}</span>
            </div>
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400 flex items-center gap-1">
                <Zap className="w-3 h-3 text-slate-500" /> Basal Metabolism
              </span>
              <span className="text-slate-200">{genome.metabolic_rate?.toFixed(3) || '0.100'}</span>
            </div>
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400 flex items-center gap-1">
                <Compass className="w-3 h-3 text-slate-500" /> Social Tendency
              </span>
              <span className="text-slate-200">{genome.social_tendency?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400 flex items-center gap-1">
                <Shield className="w-3 h-3 text-slate-500" /> Defense Power
              </span>
              <span className="text-slate-200">{genome.defense_strength?.toFixed(1) || '2.0'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-800 text-[10px] text-slate-600 font-mono text-center">
        Empirical Organism Telemetry • Seed Reproducible
      </div>
    </div>
  );
};
