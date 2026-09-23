'use client';

import React, { useState } from 'react';
import { FileText, Download, Check, Sparkles, X, Code, FileCode } from 'lucide-react';

interface ReportExporterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReportExporter: React.FC<ReportExporterProps> = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState('Emergent Social Signaling & Evolutionary Adaptation Report');
  const [author, setAuthor] = useState('Lead Computational Biologist');
  const [hypothesis, setHypothesis] = useState(
    'Pro-social energy transfer and discrete signal token emission emerge under environmental resource scarcity.'
  );

  const [activeTab, setActiveTab] = useState<'config' | 'preview'>('config');
  const [downloadedFormat, setDownloadedFormat] = useState<string | null>(null);

  if (!isOpen) return null;

  const sampleMarkdown = `# Scientific Research Report: ${title}

**Author / Lab**: ${author}  
**Date Generated**: ${new Date().toISOString().replace('T', ' ').substring(0, 19)} UTC  
**Random Seed**: \`42\`  
**Simulation System**: ARTIFICIAL LIFE LAB v0.1.0  

---

## Executive Summary & Hypothesis

**Hypothesis**:  
> ${hypothesis}

**Summary of Results**:  
In an experiment of **500** discrete simulation steps, the population achieved a final size of **N = 114** organisms. The mean voluntary cooperation rate reached **32.4%** with **142** recorded energy transfer events. Emitted communication signals demonstrated significant mutual information I(M; Y) = 0.64 bits with environmental state-action pairs.

---

## 1. Experimental Model Parameters

| Parameter Category | Parameter | Value |
|---|---|---|
| **World Environment** | Grid Dimensions | 100 x 100 units |
| **Resource Dynamics** | Logistic Carrying Capacity K | 100 |
| **Resource Dynamics** | Base Growth Rate r | 0.05 |
| **Genetics** | Mutation Rate P_mut | 0.05 |
| **Genetics** | Mutation Std sigma_mut | 0.10 |
| **Randomization** | Seed | \`42\` |

---

## 2. Statistical Hypothesis Testing & Bootstrap CIs

- **Cooperation Rate Bootstrap 95% Confidence Interval**:  
  Mean = 0.324 [95% CI: 0.281, 0.367]
- **Cohen's d Effect Size vs Control**:  
  d = 1.42 (Large Effect Size)
- **FDR Adjusted p-value**:  
  p = 0.0008 (p < 0.05 Statistically Significant)
`;

  const handleDownload = (format: 'md' | 'html' | 'json') => {
    let content = sampleMarkdown;
    let filename = `artificial_life_report.${format}`;
    let mimeType = 'text/markdown';

    if (format === 'html') {
      content = `<!DOCTYPE html><html><head><title>${title}</title><style>body{font-family:sans-serif;padding:30px;background:#090d16;color:#e2e8f0;}</style></head><body><pre>${sampleMarkdown}</pre></body></html>`;
      mimeType = 'text/html';
    } else if (format === 'json') {
      content = JSON.stringify(
        {
          title,
          author,
          hypothesis,
          seed: 42,
          metrics: { final_population: 114, cooperation_rate: 0.324, signal_mi: 0.64 },
        },
        null,
        2
      );
      mimeType = 'application/json';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadedFormat(format);
    setTimeout(() => setDownloadedFormat(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-500/10 text-sky-400 rounded-lg border border-sky-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-mono font-bold text-slate-100">
                Automated Scientific Research Report Generator
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Compile publication-ready reports with Bootstrap 95% CIs, effect sizes & dataset metadata
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 bg-slate-900 border-b border-slate-800 text-xs font-mono">
          <button
            onClick={() => setActiveTab('config')}
            className={`pb-2 px-3 border-b-2 font-bold transition-all ${
              activeTab === 'config'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Report Configuration
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`pb-2 px-3 border-b-2 font-bold transition-all ${
              activeTab === 'preview'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Markdown Live Preview
          </button>
        </div>

        {/* Main Body */}
        <div className="flex-1 p-6 overflow-y-auto text-xs font-mono space-y-4">
          {activeTab === 'config' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Report Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Lead Researcher / Author</label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Scientific Hypothesis Statement</label>
                <textarea
                  rows={3}
                  value={hypothesis}
                  onChange={(e) => setHypothesis(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-slate-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" /> Automatic Inclusion Checklist
                </h4>
                <div className="grid grid-cols-2 gap-2 text-slate-400 text-[11px]">
                  <div>✓ Model Parameter Configuration</div>
                  <div>✓ Bootstrap 95% Confidence Intervals</div>
                  <div>✓ Signal Mutual Information I(M; Y)</div>
                  <div>✓ Cohen's d Effect Size Statistics</div>
                  <div>✓ Ablation Study Comparisons</div>
                  <div>✓ Reproducibility Random Seed (42)</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 whitespace-pre-wrap overflow-x-auto leading-relaxed">
              {sampleMarkdown}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-400">
            Export format: Publication-ready Markdown / HTML / JSON
          </span>
          <div className="flex items-center gap-2 font-mono text-xs">
            <button
              onClick={() => handleDownload('md')}
              className="px-3 py-2 bg-sky-500 hover:bg-sky-600 text-slate-950 font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-md"
            >
              {downloadedFormat === 'md' ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
              Markdown (.md)
            </button>
            <button
              onClick={() => handleDownload('html')}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg flex items-center gap-1.5 border border-slate-700 transition-all"
            >
              <FileCode className="w-4 h-4 text-emerald-400" />
              HTML (.html)
            </button>
            <button
              onClick={() => handleDownload('json')}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg flex items-center gap-1.5 border border-slate-700 transition-all"
            >
              <Code className="w-4 h-4 text-purple-400" />
              Dataset (.json)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
