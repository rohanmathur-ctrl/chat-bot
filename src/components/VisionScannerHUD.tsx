import React, { useState } from 'react';
import { 
  Scan, 
  Layers, 
  Code, 
  Copy, 
  Check, 
  ExternalLink, 
  Cpu, 
  ShieldAlert, 
  Activity, 
  Server, 
  Database, 
  Zap, 
  ArrowRight,
  Maximize2
} from 'lucide-react';
import { ArchitectureNode } from '../types';

interface VisionScannerHUDProps {
  nodes: ArchitectureNode[];
  openApiSpec: string;
  selectedNodeId: string;
  onSelectNode: (node: ArchitectureNode) => void;
  onOpenRunner: () => void;
}

export const VisionScannerHUD: React.FC<VisionScannerHUDProps> = ({
  nodes,
  openApiSpec,
  selectedNodeId,
  onSelectNode,
  onOpenRunner
}) => {
  const [activeTab, setActiveTab] = useState<'blueprint' | 'openapi' | 'diagnostics'>('blueprint');
  const [copiedSpec, setCopiedSpec] = useState(false);
  const [scannerPaused, setScannerPaused] = useState(false);

  const handleCopySpec = () => {
    setCopiedSpec(true);
    navigator.clipboard?.writeText?.(openApiSpec);
    setTimeout(() => setCopiedSpec(false), 2000);
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'gateway': return ShieldAlert;
      case 'broker': return Zap;
      case 'workers': return Cpu;
      case 'db': return Database;
      case 'cache': return Server;
      default: return Activity;
    }
  };

  return (
    <div 
      id="vision-scanner-hud-container"
      className="mt-3 rounded-2xl border border-[#272d42] bg-[#0e111a] overflow-hidden shadow-2xl shadow-black/60 font-sans"
    >
      {/* Scanner HUD Header */}
      <div className="px-4 py-3 bg-[#131622] border-b border-[#22273a] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-[#7c5cfc]/20 border border-[#7c5cfc]/30 text-[#a58bff] flex items-center justify-center">
            <Scan className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold tracking-wider text-white uppercase">Live Vision Vector HUD</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-semibold">
                99.4% Optical Conf
              </span>
            </div>
            <p className="text-[11px] text-slate-400">spatial boundary extraction • telemetry ingest edge</p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 bg-[#0b0c12] p-1 rounded-xl border border-[#1e2334] text-xs">
          <button
            id="hud-tab-blueprint"
            onClick={() => setActiveTab('blueprint')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              activeTab === 'blueprint' ? 'bg-[#7c5cfc] text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>Blueprint Map</span>
            </span>
          </button>

          <button
            id="hud-tab-openapi"
            onClick={() => setActiveTab('openapi')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              activeTab === 'openapi' ? 'bg-[#7c5cfc] text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5" />
              <span>OpenAPI Spec</span>
            </span>
          </button>

          <button
            id="hud-tab-diagnostics"
            onClick={() => setActiveTab('diagnostics')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              activeTab === 'diagnostics' ? 'bg-[#7c5cfc] text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              <span>Diagnostics</span>
            </span>
          </button>
        </div>
      </div>

      {/* Main HUD Body */}
      {activeTab === 'blueprint' && (
        <div className="relative p-6 bg-[#0a0c13] bg-blueprint-grid min-h-[360px] overflow-hidden select-none">
          {/* Laser Scanner Sweep Line */}
          {!scannerPaused && (
            <div 
              className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#7c5cfc] to-transparent shadow-[0_0_15px_#7c5cfc] pointer-events-none animate-scan-sweep z-10" 
            />
          )}

          {/* Scanner Controls Floating HUD */}
          <div className="absolute top-3 right-3 flex items-center gap-2 z-20">
            <button
              id="hud-pause-sweep-btn"
              onClick={() => setScannerPaused(!scannerPaused)}
              className="px-2.5 py-1 rounded-lg bg-[#141724]/90 border border-[#272d42] text-[10px] font-mono text-slate-300 hover:text-white backdrop-blur-md transition-colors"
            >
              Sweep: {scannerPaused ? 'Paused' : 'Active'}
            </button>
            <button
              id="hud-open-runner-btn"
              onClick={onOpenRunner}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#7c5cfc]/20 hover:bg-[#7c5cfc]/30 border border-[#7c5cfc]/40 text-[10px] font-mono text-[#c8b6ff] backdrop-blur-md transition-colors"
            >
              <span>Inspect in Runner</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          {/* Interactive Topology Diagram Canvas */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center justify-center my-4 relative z-10">
            {nodes.map((node, index) => {
              const Icon = getNodeIcon(node.type);
              const isSelected = node.id === selectedNodeId;

              return (
                <div key={node.id} className="flex flex-col items-center relative group">
                  {/* Connector arrow on desktop */}
                  {index < nodes.length - 1 && (
                    <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-0 text-slate-600 group-hover:text-[#7c5cfc] transition-colors">
                      <ArrowRight className="w-4 h-4 animate-pulse" />
                    </div>
                  )}

                  {/* Node Card */}
                  <div
                    id={`hud-node-${node.id}`}
                    onClick={() => {
                      onSelectNode(node);
                      onOpenRunner();
                    }}
                    className={`w-full cursor-pointer p-3.5 rounded-xl border transition-all duration-200 transform hover:-translate-y-1 ${
                      isSelected
                        ? 'bg-[#1a1f30] border-[#7c5cfc] shadow-lg shadow-[#7c5cfc]/25 ring-1 ring-[#7c5cfc]'
                        : 'bg-[#121522]/90 border-[#23283c] hover:border-[#384160] hover:bg-[#161a29]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-[#7c5cfc] text-white' : 'bg-[#1b2030] text-slate-300 group-hover:text-[#a58bff]'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#10b981]/15 text-emerald-400 font-semibold border border-[#10b981]/25">
                        {node.confidence}%
                      </span>
                    </div>

                    <h4 className="text-xs font-semibold text-white tracking-wide truncate mb-1">
                      {node.name}
                    </h4>

                    <p className="text-[10px] font-mono text-slate-400 truncate mb-2">
                      {node.subnet}
                    </p>

                    <div className="pt-2 border-t border-[#1e2336] flex items-center justify-between text-[10px] font-mono">
                      <span className="text-slate-400">P99:</span>
                      <span className="text-purple-300 font-bold">{node.p99Latency}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Subnet Legend Footer */}
          <div className="mt-4 pt-3 border-t border-[#1b2032] flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-slate-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                <span>Zero Deadlock Vectors</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#7c5cfc]" />
                <span>mTLS Ingress Boundary</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#22d3ee]" />
                <span>Auto-Replication 3x</span>
              </span>
            </div>
            <span className="text-slate-500">Click any component to inspect telemetry</span>
          </div>
        </div>
      )}

      {/* OpenAPI Spec View */}
      {activeTab === 'openapi' && (
        <div className="p-4 bg-[#0a0c13] relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400">openapi-3.1-telemetry-spec.json</span>
            <button
              id="hud-copy-spec-btn"
              onClick={handleCopySpec}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#1a1e2c] hover:bg-[#252b3e] text-slate-300 hover:text-white text-xs transition-colors border border-[#2a3045]"
            >
              {copiedSpec ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSpec ? 'Copied' : 'Copy JSON'}</span>
            </button>
          </div>
          <pre className="p-4 rounded-xl bg-[#0e111a] border border-[#1e2334] text-xs font-mono text-slate-300 overflow-x-auto max-h-72 leading-relaxed">
            <code>{openApiSpec}</code>
          </pre>
        </div>
      )}

      {/* Diagnostics View */}
      {activeTab === 'diagnostics' && (
        <div className="p-4 bg-[#0a0c13] space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {nodes.map(node => (
              <div key={node.id} className="p-3 rounded-xl bg-[#121522] border border-[#21273c]">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-white">{node.name}</span>
                  <span className="text-[10px] font-mono text-emerald-400">{node.throughput}</span>
                </div>
                <ul className="space-y-1">
                  {node.diagnostics.map((diag, i) => (
                    <li key={i} className="text-[11px] font-mono text-slate-400 flex items-start gap-1.5">
                      <span className="text-[#7c5cfc] mt-0.5">•</span>
                      <span>{diag}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
