import React, { useState } from 'react';
import { 
  X, 
  Activity, 
  CheckCircle2, 
  Play, 
  Code2, 
  Copy, 
  Check, 
  Radio, 
  Cpu, 
  Database, 
  RefreshCw,
  Send,
  Zap,
  Terminal,
  Clock
} from 'lucide-react';
import { ArchitectureNode, RightPanelTab } from '../types';

interface ArtifactsRunnerPanelProps {
  open: boolean;
  onClose: () => void;
  selectedNode: ArchitectureNode;
  nodes: ArchitectureNode[];
  onSelectNode: (node: ArchitectureNode) => void;
  openApiSpec: string;
}

export const ArtifactsRunnerPanel: React.FC<ArtifactsRunnerPanelProps> = ({
  open,
  onClose,
  selectedNode,
  nodes,
  onSelectNode,
  openApiSpec
}) => {
  const [activeTab, setActiveTab] = useState<RightPanelTab>('inspector');
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testRunCount, setTestRunCount] = useState(1);
  const [isPinging, setIsPinging] = useState(false);
  const [pingSuccess, setPingSuccess] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  if (!open) return null;

  const handleRunTests = () => {
    setIsRunningTests(true);
    setTimeout(() => {
      setIsRunningTests(false);
      setTestRunCount(prev => prev + 1);
    }, 800);
  };

  const handlePingNode = () => {
    setIsPinging(true);
    setPingSuccess(false);
    setTimeout(() => {
      setIsPinging(false);
      setPingSuccess(true);
      setTimeout(() => setPingSuccess(false), 3000);
    }, 600);
  };

  const handleCopyJson = () => {
    setCopiedJson(true);
    navigator.clipboard?.writeText?.(openApiSpec);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <aside 
      id="artifacts-runner-panel"
      className="w-full md:w-96 lg:w-[420px] bg-[#0f111a] border-l border-[#1f2436] flex flex-col h-full shrink-0 z-30 select-none shadow-2xl transition-all duration-300"
    >
      {/* Header */}
      <div className="p-4 border-b border-[#1f2436] bg-[#121522] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-[#7c5cfc]/20 text-[#a58bff]">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-white tracking-wide">Live Artifacts & Runner</h3>
            <p className="text-[10px] font-mono text-slate-400">interactive sandbox telemetry</p>
          </div>
        </div>

        <button
          id="runner-panel-close-btn"
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1a1f30] transition-colors"
          title="Close Runner (⌘J)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs Switcher */}
      <div className="px-3 pt-2.5 bg-[#0d0f17] border-b border-[#1f2436] flex gap-2 text-xs">
        <button
          id="runner-tab-inspector"
          onClick={() => setActiveTab('inspector')}
          className={`pb-2 px-2.5 font-medium border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'inspector' 
              ? 'border-[#7c5cfc] text-[#a58bff]' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Inspector</span>
        </button>

        <button
          id="runner-tab-vitest"
          onClick={() => setActiveTab('vitest')}
          className={`pb-2 px-2.5 font-medium border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'vitest' 
              ? 'border-[#7c5cfc] text-[#a58bff]' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Vitest Suite</span>
          <span className="text-[9px] font-mono bg-emerald-500/20 text-emerald-400 px-1 rounded">4/4</span>
        </button>

        <button
          id="runner-tab-json"
          onClick={() => setActiveTab('json')}
          className={`pb-2 px-2.5 font-medium border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'json' 
              ? 'border-[#7c5cfc] text-[#a58bff]' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>JSON Schema</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-sans">
        {/* Tab 1: Inspector */}
        {activeTab === 'inspector' && (
          <div className="space-y-4">
            {/* Quick Node Switcher Pill */}
            <div>
              <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1.5 font-semibold">Active Subsystem Target</label>
              <select
                id="runner-node-select"
                value={selectedNode.id}
                onChange={(e) => {
                  const found = nodes.find(n => n.id === e.target.value);
                  if (found) onSelectNode(found);
                }}
                className="w-full bg-[#151928] border border-[#252b42] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7c5cfc]"
              >
                {nodes.map(n => (
                  <option key={n.id} value={n.id}>
                    {n.name} ({n.confidence}% conf)
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Node Details Card */}
            <div className="p-4 rounded-2xl bg-[#131624] border border-[#23283e] space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-white">{selectedNode.name}</h4>
                  <p className="text-[11px] font-mono text-[#a58bff]">{selectedNode.subnet}</p>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold">
                  {selectedNode.status.toUpperCase()}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedNode.description}
              </p>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="p-2.5 rounded-xl bg-[#0e111a] border border-[#1e2336]">
                  <span className="text-[10px] font-mono text-slate-400 block">Throughput</span>
                  <span className="text-xs font-mono font-bold text-white mt-0.5 block">{selectedNode.throughput}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#0e111a] border border-[#1e2336]">
                  <span className="text-[10px] font-mono text-slate-400 block">P99 Latency</span>
                  <span className="text-xs font-mono font-bold text-[#a58bff] mt-0.5 block">{selectedNode.p99Latency}</span>
                </div>
              </div>
            </div>

            {/* Real-time Diagnostics Log */}
            <div className="p-3.5 rounded-2xl bg-[#131624] border border-[#23283e] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-semibold text-slate-200">Subsystem Diagnostics</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>

              <div className="space-y-1.5 font-mono text-[11px]">
                {selectedNode.diagnostics.map((diag, index) => (
                  <div key={index} className="flex items-start gap-2 text-slate-400">
                    <span className="text-emerald-400 shrink-0">✓</span>
                    <span className="leading-tight">{diag}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Probe Action Button */}
            <div className="space-y-2">
              <button
                id="runner-probe-node-btn"
                onClick={handlePingNode}
                disabled={isPinging}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#7c5cfc] hover:bg-[#6a46fc] text-white font-medium text-xs shadow-md shadow-[#7c5cfc]/20 transition-all disabled:opacity-50"
              >
                {isPinging ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Transmitting mTLS Diagnostic Probe...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5" />
                    <span>Send Simulated Heartbeat Probe</span>
                  </>
                )}
              </button>

              {pingSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 font-mono text-[11px] flex items-center gap-2 animate-in fade-in">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Probe acknowledged: 200 OK (Round-trip 1.2ms)</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Vitest Suite */}
        {activeTab === 'vitest' && (
          <div className="space-y-4">
            <div className="p-3 rounded-2xl bg-[#131624] border border-[#23283e] flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-white">Vitest Runner v1.4.0</span>
                <p className="text-[10px] font-mono text-slate-400">src/__tests__/lru-cache.spec.ts</p>
              </div>
              <button
                id="runner-rerun-tests-btn"
                onClick={handleRunTests}
                disabled={isRunningTests}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#7c5cfc]/20 hover:bg-[#7c5cfc]/30 border border-[#7c5cfc]/40 text-[#c8b6ff] text-xs font-mono font-semibold transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isRunningTests ? 'animate-spin' : ''}`} />
                <span>{isRunningTests ? 'Executing...' : 'Re-run Tests'}</span>
              </button>
            </div>

            {/* Tests List */}
            <div className="p-3.5 rounded-2xl bg-[#0e111a] border border-[#1e2336] space-y-2.5 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#1b2030] text-[11px] text-slate-400">
                <span>PASS ✓ LRUCache Test Suite (Run #{testRunCount})</span>
                <span className="text-emerald-400 font-bold">12ms</span>
              </div>

              <div className="space-y-2 text-[11px]">
                <div className="flex items-center justify-between text-slate-200">
                  <span className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span className="text-slate-200">returns undefined on missing key</span>
                  </span>
                  <span className="text-slate-500">0.24ms</span>
                </div>

                <div className="flex items-center justify-between text-slate-200">
                  <span className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span className="text-slate-200">updates access order on get/put</span>
                  </span>
                  <span className="text-slate-500">0.42ms</span>
                </div>

                <div className="flex items-center justify-between text-slate-200">
                  <span className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span className="text-slate-200">evicts oldest entry upon capacity limit</span>
                  </span>
                  <span className="text-slate-500">0.31ms</span>
                </div>

                <div className="flex items-center justify-between text-slate-200">
                  <span className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span className="text-slate-200">handles 10,000 rapid concurrent ops</span>
                  </span>
                  <span className="text-slate-500">1.82ms</span>
                </div>
              </div>
            </div>

            {/* Test Summary Box */}
            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 font-mono text-[11px] flex items-center justify-between">
              <span>Test Files: 1 passed (1)</span>
              <span>Tests: 4 passed (4)</span>
            </div>
          </div>
        )}

        {/* Tab 3: JSON Tree */}
        {activeTab === 'json' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">openapi-spec.json</span>
              <button
                id="runner-copy-json-btn"
                onClick={handleCopyJson}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#181c2c] hover:bg-[#22273e] text-slate-300 text-xs border border-[#272d42] transition-colors"
              >
                {copiedJson ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedJson ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <pre className="p-3 rounded-xl bg-[#0e111a] border border-[#1e2336] text-[11px] font-mono text-slate-300 max-h-96 overflow-auto leading-relaxed">
              <code>{openApiSpec}</code>
            </pre>
          </div>
        )}
      </div>
    </aside>
  );
};
