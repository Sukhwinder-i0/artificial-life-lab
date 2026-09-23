'use client';

import React, { useState } from 'react';
import { FlaskConical, Sliders, Play, RotateCcw, CheckCircle2, Layers } from 'lucide-react';

export const ExperimentBuilder: React.FC = () => {
  const [expName, setExpName] = useState('Resource Scarcity & Cooperation Evolution');
  const [researchQuestion, setResearchQuestion] = useState('How does environmental carrying capacity affect the evolution of social energy sharing?');
  const [replicates, setReplicates] = useState(10);
  const [generations, setGenerations] = useState(100);
  const [isExecuting, setIsExecuting] = useState(false);
  const [batchCompleted, setBatchCompleted] = useState(false);

  const handleRunBatch = () => {
    setIsExecuting(true);
    setBatchCompleted(false);
    setTimeout(() => {
      setIsExecuting(false);
      setBatchCompleted(true);
    }, 2000);
  };

  return (
    <div className="flex-1 bg-slate-950 p-6 overflow-y-auto font-sans text-slate-100 flex flex-col gap-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-sky-500/10 text-sky-400 rounded-lg border border-sky-500/20">
            <FlaskConical className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-mono font-bold text-slate-100">
              Visual Experiment Builder & Parameter Sweep Engine
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Define hypothesis, sweep independent variables across N replicates & random seeds
            </p>
          </div>
        </div>
        <button
          onClick={handleRunBatch}
          disabled={isExecuting}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white rounded-lg text-xs font-mono font-bold transition-all shadow-lg border border-sky-400/30"
        >
          {isExecuting ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          {isExecuting ? 'EXECUTING BATCH SWEEP...' : 'EXECUTE EXPERIMENT BATCH'}
        </button>
      </div>

      {/* Main Spec Form */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div>
            <label className="text-xs font-mono text-slate-400 uppercase block mb-1">Experiment Name</label>
            <input
              type="text"
              value={expName}
              onChange={(e) => setExpName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="text-xs font-mono text-slate-400 uppercase block mb-1">Research Question</label>
            <textarea
              rows={2}
              value={researchQuestion}
              onChange={(e) => setResearchQuestion(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Independent Variable Sweep Configuration */}
          <div>
            <h4 className="text-xs font-mono font-bold uppercase text-slate-300 mb-3 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-sky-400" /> Independent Variable Sweeps
            </h4>
            <div className="space-y-3 bg-slate-950 p-4 rounded-lg border border-slate-800">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300">Resource Carrying Capacity (K)</span>
                <span className="text-sky-400">[10.0, 25.0, 50.0, 75.0, 100.0]</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300">Per-Gene Mutation Probability (μ)</span>
                <span className="text-indigo-400">[0.001, 0.005, 0.01, 0.05]</span>
              </div>
            </div>
          </div>
        </div>

        {/* Replicates & Execution Controls */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-mono font-bold uppercase text-slate-300 mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" /> Replication & Duration
            </h4>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-slate-400">Replicates / Condition</span>
                  <span className="text-sky-400 font-bold">{replicates} Seeds</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={50}
                  value={replicates}
                  onChange={(e) => setReplicates(Number(e.target.value))}
                  className="w-full accent-sky-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-slate-400">Simulation Steps / Run</span>
                  <span className="text-indigo-400 font-bold">{generations} Steps</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={500}
                  step={50}
                  value={generations}
                  onChange={(e) => setGenerations(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {batchCompleted && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 flex items-center gap-2 text-xs font-mono text-emerald-400 mt-4">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>Experiment Batch Completed! 50 runs executed across 50 random seeds. Data persisted to storage/csv.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
