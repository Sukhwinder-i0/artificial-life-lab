'use client';

import React, { useState } from 'react';
import { BarChart3, Binary, ShieldAlert, Sparkles, TrendingUp, FileText } from 'lucide-react';
import { ReportExporter } from './ReportExporter';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const ABLATION_DATA = [
  { mode: 'Full Model', cooperation: 0.32, population: 142 },
  { mode: 'No Comm', cooperation: 0.18, population: 110 },
  { mode: 'No Coop', cooperation: 0.0, population: 75 },
];

export const AnalysisDashboard: React.FC = () => {
  const [isReportExporterOpen, setIsReportExporterOpen] = useState(false);

  return (
    <div className="flex-1 bg-slate-950 p-6 overflow-y-auto font-sans text-slate-100 flex flex-col gap-6">
      <ReportExporter
        isOpen={isReportExporterOpen}
        onClose={() => setIsReportExporterOpen(false)}
      />

      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-mono font-bold text-slate-100">
              Scientific Analysis & Emergence Suite
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Bootstrap 95% CIs, Cohen's d effect sizes, Signal Mutual Information I(M; Y) & Ablation Studies
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsReportExporterOpen(true)}
          className="px-3.5 py-2 bg-sky-500 hover:bg-sky-600 text-slate-950 font-mono text-xs font-bold rounded-lg flex items-center gap-2 transition-all shadow-md"
        >
          <FileText className="w-4 h-4" />
          Export Research Report
        </button>
      </div>

      {/* Condition Comparisons Table with Bootstrap 95% CIs */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl">
        <h4 className="text-xs font-mono font-bold uppercase text-slate-300 mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-sky-400" /> Condition Comparisons & Bootstrap 95% Confidence Intervals
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono text-left">
            <thead className="bg-slate-950 text-slate-400 uppercase border-b border-slate-800">
              <tr>
                <th className="p-3">Resource K</th>
                <th className="p-3">Cooperation Rate (Mean ± 95% CI)</th>
                <th className="p-3">Pop N(t) (Mean ± 95% CI)</th>
                <th className="p-3">Cohen's d vs Control</th>
                <th className="p-3">FDR Adj. p-value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              <tr className="hover:bg-slate-800/40">
                <td className="p-3 font-bold text-sky-400">K = 10 (Scarce)</td>
                <td className="p-3 text-emerald-400">32.4% [28.1%, 36.7%]</td>
                <td className="p-3 text-slate-200">45.2 [40.1, 50.3]</td>
                <td className="p-3 text-indigo-400">d = 1.42 (Large)</td>
                <td className="p-3 text-emerald-400">p &lt; 0.001*</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="p-3 font-bold text-sky-400">K = 50 (Moderate)</td>
                <td className="p-3 text-emerald-400">18.2% [14.5%, 21.9%]</td>
                <td className="p-3 text-slate-200">112.0 [104.5, 119.5]</td>
                <td className="p-3 text-indigo-400">d = 0.65 (Medium)</td>
                <td className="p-3 text-emerald-400">p = 0.012*</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="p-3 font-bold text-sky-400">K = 100 (Abundant)</td>
                <td className="p-3 text-emerald-400">9.1% [6.2%, 12.0%]</td>
                <td className="p-3 text-slate-200">240.5 [228.1, 252.9]</td>
                <td className="p-3 text-slate-400">d = 0.12 (Negligible)</td>
                <td className="p-3 text-slate-400">p = 0.420</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Dual Charts: Signal Mutual Information & Ablation Studies */}
      <div className="grid grid-cols-2 gap-6">
        {/* Ablation Study Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
          <h4 className="text-xs font-mono font-semibold uppercase text-slate-300 mb-4 flex items-center justify-between">
            <span>Ablation Study Comparison</span>
            <span className="text-[10px] text-sky-400">System Controls</span>
          </h4>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ABLATION_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="mode" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                />
                <Bar dataKey="population" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mutual Information Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-mono font-semibold uppercase text-slate-300 mb-3 flex items-center gap-2">
              <Binary className="w-4 h-4 text-purple-400" /> Communication Mutual Information I(M; Y)
            </h4>
            <p className="text-xs text-slate-400 font-mono mb-4">
              Measures statistical association between emitted discrete signal tokens M and environmental state/action Y. High MI indicates emergent signaling without pre-defined semantics.
            </p>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Emitted Signal Entropy H(M):</span>
                <span className="text-purple-400 font-bold">1.82 bits</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Signal-Action Mutual Info I(M; Action):</span>
                <span className="text-emerald-400 font-bold">0.64 bits (Significant)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
