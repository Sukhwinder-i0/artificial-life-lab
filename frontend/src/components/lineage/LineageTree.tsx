'use client';

import React, { useEffect, useState } from 'react';
import { GitCommit, GitBranch, Dna, Clock, Shield } from 'lucide-react';

interface LineageNodeData {
  id: string;
  parent_id?: string;
  generation: number;
  birth_time: number;
  death_time?: number;
  cause_of_death?: string;
  offspring_ids: string[];
  traits: Record<string, number>;
}

export const LineageTree: React.FC = () => {
  const [nodes, setNodes] = useState<LineageNodeData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchLineage = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/simulation/lineage?max_nodes=50');
        const data = await res.json();
        setNodes(data);
      } catch (e) {
        console.error('Failed fetching lineage tree nodes', e);
      } finally {
        setLoading(false);
      }
    };

    fetchLineage();
    const interval = setInterval(fetchLineage, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-1 bg-slate-950 p-6 overflow-y-auto font-sans text-slate-100 flex flex-col gap-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
            <GitBranch className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-mono font-bold text-slate-100">
              Evolutionary Lineage Tree Graph
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Parent-offspring descent tree, generational depth & mortality causes
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1.5 rounded-full border border-slate-800">
          <Clock className="w-3.5 h-3.5 text-sky-400" />
          <span>Nodes Logged: {nodes.length}</span>
        </div>
      </div>

      {/* Lineage Tree Grid */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl flex-1 overflow-y-auto">
        {loading && nodes.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-slate-500 text-xs font-mono">
            Loading evolutionary lineage data...
          </div>
        ) : nodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-500 text-xs font-mono">
            <Dna className="w-10 h-10 text-slate-700 mb-2" />
            <span>No lineage events recorded yet. Start simulation to observe offspring evolution.</span>
          </div>
        ) : (
          <div className="space-y-3 font-mono text-xs">
            {nodes.map((node) => (
              <div
                key={node.id}
                className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-slate-900 rounded text-amber-400">
                    <GitCommit className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200">{node.id}</span>
                      <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded text-sky-400 border border-slate-800">
                        Gen {node.generation}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500">
                      Parent: {node.parent_id || 'Root Ancestor'} • Offspring: {node.offspring_ids?.length || 0}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-[11px]">
                  <span className="text-slate-400">Birth Step: {node.birth_time}</span>
                  {node.death_time ? (
                    <span className="text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                      Died step {node.death_time} ({node.cause_of_death})
                    </span>
                  ) : (
                    <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Surviving
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
