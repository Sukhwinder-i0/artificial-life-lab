'use client';

import React from 'react';
import { useSimulationStore, OrganismData } from '@/store/simulationStore';
import { Brain, Cpu, Zap, Activity, Shield, ArrowRight } from 'lucide-react';

const SENSOR_LABELS = [
  'Food Dist', 'Food Dir X', 'Food Dir Y',
  'Water Dist', 'Water Dir X', 'Water Dir Y',
  'Social Dist', 'Social Dir X', 'Social Dir Y',
  'Threat Dist', 'Threat Dir X', 'Threat Dir Y',
  'Energy %', 'Health %', 'Age %', 'Density',
];

const ACTION_LABELS = [
  'Move X', 'Move Y', 'Eat %', 'Attack %', 'Share %', 'Reproduce %', 'Signal %'
];

export const BrainInspector: React.FC = () => {
  const { latestFrame, selectedOrganismId } = useSimulationStore();

  const selectedOrganism: OrganismData | undefined = latestFrame?.organisms?.find(
    (o) => o.id === selectedOrganismId
  );

  if (!selectedOrganism) {
    return (
      <div className="flex-1 bg-slate-950 p-8 flex flex-col items-center justify-center text-center text-slate-500 font-sans">
        <Brain className="w-16 h-16 text-slate-800 animate-pulse mb-3" />
        <h3 className="text-sm font-mono font-bold text-slate-400">MLP Neural Policy Inspector</h3>
        <p className="text-xs text-slate-600 mt-1 max-w-sm">Select an organism on the 2D Canvas to inspect its 16-dim sensory inputs and 7-dim action policy activations.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-950 p-6 overflow-y-auto font-sans text-slate-100 flex flex-col gap-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-mono font-bold text-slate-100">
              Neural Policy Architecture ({selectedOrganism.id})
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              16 Input Sensors → 16 Hidden Nodes (Tanh) → 7 Action Output Channels
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="px-3 py-1 bg-slate-800 rounded-full border border-slate-700 text-slate-300">
            Parameters: 384 Weights & Biases
          </span>
          <span className="px-3 py-1 bg-sky-500/10 text-sky-400 rounded-full border border-sky-500/20">
            Heritable Mutation
          </span>
        </div>
      </div>

      {/* Network Diagram View */}
      <div className="grid grid-cols-3 gap-6 flex-1">
        {/* Input Layer */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col">
          <h4 className="text-xs font-mono font-bold uppercase text-slate-400 mb-3 flex items-center justify-between border-b border-slate-800 pb-2">
            <span>Sensory Inputs (16)</span>
            <span className="text-[10px] text-sky-400">Environment</span>
          </h4>
          <div className="space-y-1.5 flex-1 overflow-y-auto pr-1">
            {SENSOR_LABELS.map((label, idx) => (
              <div key={label} className="flex items-center justify-between text-[11px] font-mono p-1.5 bg-slate-950/70 rounded border border-slate-800/80">
                <span className="text-slate-400 truncate max-w-[120px]">{label}</span>
                <span className="text-sky-400 font-semibold">0.50</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hidden Layer */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col">
          <h4 className="text-xs font-mono font-bold uppercase text-slate-400 mb-3 flex items-center justify-between border-b border-slate-800 pb-2">
            <span>Hidden Layer (16)</span>
            <span className="text-[10px] text-indigo-400">Tanh Activation</span>
          </h4>
          <div className="grid grid-cols-2 gap-1.5 flex-1 overflow-y-auto pr-1">
            {Array.from({ length: 16 }).map((_, idx) => (
              <div key={idx} className="flex items-center justify-between text-[11px] font-mono p-2 bg-slate-950/70 rounded border border-slate-800/80">
                <span className="text-slate-500">H_{idx}</span>
                <span className="text-indigo-400 font-semibold">0.12</span>
              </div>
            ))}
          </div>
        </div>

        {/* Output Layer */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col">
          <h4 className="text-xs font-mono font-bold uppercase text-slate-400 mb-3 flex items-center justify-between border-b border-slate-800 pb-2">
            <span>Action Outputs (7)</span>
            <span className="text-[10px] text-emerald-400">Policy Act</span>
          </h4>
          <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
            {ACTION_LABELS.map((action, idx) => (
              <div key={action} className="p-2 bg-slate-950/70 rounded-lg border border-slate-800/80">
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-slate-300 font-semibold">{action}</span>
                  <span className="text-emerald-400 font-bold">
                    {idx < 2 ? '0.24' : '65%'}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 transition-all"
                    style={{ width: idx < 2 ? '50%' : '65%' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
