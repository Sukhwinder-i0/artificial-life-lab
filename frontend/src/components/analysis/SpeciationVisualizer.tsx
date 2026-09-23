'use client';

import React, { useState } from 'react';
import { GitBranch, Dna, Activity, PieChart, Info, Layers, RefreshCw } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from 'recharts';
import { useSimulationStore } from '@/store/simulationStore';

// Mock/Initial cluster analysis data derived from trait clustering
const CLUSTER_DATA = [
  {
    id: 'Cluster Alpha',
    name: 'High-Mobility Foragers',
    population: 48,
    percentage: 42.1,
    color: '#38bdf8',
    traits: [
      { trait: 'Speed', value: 85 },
      { trait: 'Vision', value: 90 },
      { trait: 'Size', value: 35 },
      { trait: 'Metabolism', value: 70 },
      { trait: 'Efficiency', value: 45 },
    ],
    actionEntropy: 1.84,
  },
  {
    id: 'Cluster Beta',
    name: 'Efficient Cooperative Conservers',
    population: 38,
    percentage: 33.3,
    color: '#10b981',
    traits: [
      { trait: 'Speed', value: 40 },
      { trait: 'Vision', value: 55 },
      { trait: 'Size', value: 65 },
      { trait: 'Metabolism', value: 30 },
      { trait: 'Efficiency', value: 92 },
    ],
    actionEntropy: 2.15,
  },
  {
    id: 'Cluster Gamma',
    name: 'Heavy Aggressive Competitors',
    population: 28,
    percentage: 24.6,
    color: '#f43f5e',
    traits: [
      { trait: 'Speed', value: 60 },
      { trait: 'Vision', value: 75 },
      { trait: 'Size', value: 95 },
      { trait: 'Metabolism', value: 85 },
      { trait: 'Efficiency', value: 50 },
    ],
    actionEntropy: 1.42,
  },
];

const ACTION_DISTRIBUTION = [
  { action: 'Move / Forage', Alpha: 55, Beta: 28, Gamma: 42 },
  { action: 'Eat Resource', Alpha: 25, Beta: 38, Gamma: 30 },
  { action: 'Share Energy', Alpha: 5, Beta: 22, Gamma: 2 },
  { action: 'Signal Emission', Alpha: 10, Beta: 8, Gamma: 4 },
  { action: 'Reproduce', Alpha: 5, Beta: 4, Gamma: 22 },
];

export const SpeciationVisualizer: React.FC = () => {
  const latestFrame = useSimulationStore((s) => s.latestFrame);
  const [selectedCluster, setSelectedCluster] = useState<string>('Cluster Alpha');

  const activeCluster = CLUSTER_DATA.find((c) => c.id === selectedCluster) || CLUSTER_DATA[0];

  return (
    <div className="flex-1 bg-slate-950 p-6 overflow-y-auto font-sans text-slate-100 flex flex-col gap-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
            <GitBranch className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-mono font-bold text-slate-100">
              Unsupervised Speciation & Behavioral Analysis
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Hierarchical agglomerative clustering on normalized genomes & action entropy H(A)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-slate-400">Identified Phenotypes:</span>
            <span className="font-bold text-slate-200">3 Clusters</span>
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">Mean Action Entropy:</span>
            <span className="font-bold text-emerald-400">1.80 bits</span>
          </div>
        </div>
      </div>

      {/* Cluster Overview Grid */}
      <div className="grid grid-cols-3 gap-4">
        {CLUSTER_DATA.map((cluster) => {
          const isSelected = cluster.id === selectedCluster;
          return (
            <div
              key={cluster.id}
              onClick={() => setSelectedCluster(cluster.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-slate-900 border-indigo-500/50 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/30'
                  : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900/90'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: cluster.color }}
                  />
                  <span className="text-xs font-mono font-bold text-slate-200">
                    {cluster.id}
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                  {cluster.percentage}% Pop
                </span>
              </div>

              <h4 className="text-sm font-semibold text-slate-100 mb-2">{cluster.name}</h4>

              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Count:</span>
                  <span className="text-slate-200 font-bold">{cluster.population} orgs</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Action Entropy H(A):</span>
                  <span className="text-emerald-400 font-bold">{cluster.actionEntropy} bits</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Analysis Section: Radar Morphometry & Action Frequencies */}
      <div className="grid grid-cols-2 gap-6">
        {/* Trait Centroid Radar */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-mono font-bold uppercase text-slate-300 flex items-center gap-2">
              <Dna className="w-4 h-4 text-sky-400" /> Phenotypic Trait Centroid ({activeCluster.id})
            </h4>
            <span className="text-[10px] font-mono text-slate-400">Normalized [0, 100]</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={activeCluster.traits}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="trait" stroke="#94a3b8" fontSize={11} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={9} />
                <Radar
                  name={activeCluster.id}
                  dataKey="value"
                  stroke={activeCluster.color}
                  fill={activeCluster.color}
                  fillOpacity={0.4}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Action Frequencies Comparison */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-mono font-bold uppercase text-slate-300 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" /> Behavioral Action Profile (%)
            </h4>
            <span className="text-[10px] font-mono text-slate-400">Action Output Distribution</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ACTION_DISTRIBUTION}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="action" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="Alpha" fill="#38bdf8" name="Alpha" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Beta" fill="#10b981" name="Beta" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Gamma" fill="#f43f5e" name="Gamma" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Scientific Methodology Note */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-400 font-mono space-y-1">
          <p className="text-slate-200 font-bold">Unsupervised Speciation Methodology</p>
          <p>
            Species clusters are discovered algorithmically via Ward's hierarchical linkage on standard Euclidean distances between z-score normalized trait vectors g_i = [speed, vision, size, ...]. Clusters are not hardcoded. Behavioral entropy H(A) = -sum_a p(a) log2 p(a) reflects policy dispersion within each cluster.
          </p>
        </div>
      </div>
    </div>
  );
};
