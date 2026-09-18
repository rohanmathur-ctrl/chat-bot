import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  MessageSquare, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Cpu, 
  Settings, 
  ShieldCheck, 
  Layers, 
  Clock, 
  Terminal,
  LogIn,
  LogOut
} from 'lucide-react';
import { AuthUser } from '../types';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onNewChat: () => void;
  onOpenVoice: () => void;
  currentUser: AuthUser | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  onNewChat,
  onOpenVoice,
  currentUser,
  onOpenAuth,
  onLogout
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChatId, setActiveChatId] = useState('chat-1');

  const historyToday = [
    { id: 'chat-1', title: 'Multimodal Telemetry & LRU Cache', icon: Sparkles, active: true },
    { id: 'chat-2', title: 'Autonomous agents latency profiling', icon: Terminal, active: false },
    { id: 'chat-3', title: 'Python AST parser script', icon: MessageSquare, active: false }
  ];

  const historyPrevious7 = [
    { id: 'chat-4', title: 'Chain-of-thought distillation', icon: MessageSquare, active: false },
    { id: 'chat-5', title: 'KV-cache benchmark matrix', icon: Layers, active: false },
    { id: 'chat-6', title: 'Raft consensus leader lease', icon: Cpu, active: false }
  ];

  const historyPrevious30 = [
    { id: 'chat-7', title: 'RAG vector index topology', icon: MessageSquare, active: false },
    { id: 'chat-8', title: 'Distributed rate limiter on Redis', icon: Clock, active: false }
  ];

  if (collapsed) {
    return (
      <aside 
        id="sidebar-collapsed"
        className="w-16 bg-[#0e1017] border-r border-[#1f2330] flex flex-col items-center py-4 justify-between z-30 select-none transition-all duration-300"
      >
        <div className="flex flex-col items-center gap-4">
          <button 
            id="sidebar-expand-btn"
            onClick={onToggleCollapse} 
            title="Expand Sidebar (⌘B)"
            className="w-10 h-10 rounded-xl bg-[#171a24] hover:bg-[#202433] border border-[#252a3a] flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <button 
            id="sidebar-quick-new-chat"
            onClick={onNewChat}
            title="New Chat (⌘K)"
            className="w-10 h-10 rounded-xl bg-[#7c5cfc] hover:bg-[#6844f7] text-white flex items-center justify-center shadow-lg shadow-[#7c5cfc]/20 transition-all hover:scale-105"
          >
            <Plus className="w-5 h-5" />
          </button>

          <button
            id="sidebar-quick-voice"
            onClick={onOpenVoice}
            title="Nexus Voice Engine"
            className="w-10 h-10 rounded-xl bg-[#171a24] hover:bg-[#202433] border border-[#252a3a] flex items-center justify-center text-purple-400 hover:text-purple-300 transition-colors"
          >
            <Sparkles className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full ring-2 ring-[#7c5cfc]/40 overflow-hidden">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDi_CedpmnBPBqwFGZvhz0NeJ5ZNLUiu2T0cyi1iwsMfmf3hFDPxyHBh7vcSCbxMxa8MVdLbmfAmnHCMkVfuRYRNdqfcOBkDqN3yTDfv5krpW2bNFtah3Sv8osgu27eTrdtgcAmX9ZjVkcYEUMVMvdFBp_3tf9Y6ys3xoYgL3nhe8De6t00gGHW7zAShvS65mA8Z-Fi2-81OiKyHHB4tadmeQMQsZ6FnTiHx6ZGRFLN6tdgAVFldoB2" 
              alt="Dr. Evelyn Vance"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside 
      id="sidebar-expanded"
      className="w-72 bg-[#0e1017] border-r border-[#1f2330] flex flex-col h-full z-30 select-none transition-all duration-300"
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-[#1f2330] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#5d3bf6] to-[#9d7cfd] flex items-center justify-center p-1.5 shadow-md shadow-[#7c5cfc]/25">
            <img 
              src="https://lh3.googleusercontent.com/aida/AEtjO1XrkgTXZqsyF_wN-uEDOJzRUx7EnM3kw-GKojqbyKc0kCci8a9ruJckQbs2_DWriSXeP0urt8Bm-DBRItbif_j1JnUw3Le8mIeAVvCMR33Jw_yMV6VklOAVEqcJlOhAK0gv6BGNEseQ0eKDc9EAu6yU6JlgQ6CVkqF3CtltiCGPNH1RR4bourlowx-KzLrpEEjlPskwmiKUbTBUYCmcWuTDv3CTQA6T7Qy6cQMMqovr9A5i9hCcXtHAUdo"
              alt="Nexus AI Spark Logo" 
              className="w-full h-full object-contain filter drop-shadow"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-white tracking-wide text-sm">Nexus AI</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#7c5cfc]/20 text-[#a58bff] font-semibold border border-[#7c5cfc]/30">v3.5</span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">Cognitive Workspace</p>
          </div>
        </div>

        <button 
          id="sidebar-collapse-btn"
          onClick={onToggleCollapse}
          title="Collapse Sidebar (⌘B)"
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#191d29] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Action Bar */}
      <div className="p-3 space-y-2">
        <button 
          id="sidebar-new-chat-btn"
          onClick={onNewChat}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#7c5cfc] hover:bg-[#6a46fc] text-white font-medium text-xs transition-all shadow-md shadow-[#7c5cfc]/20 group"
        >
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90 duration-200" />
            <span>New Thread</span>
          </div>
          <span className="text-[10px] font-mono bg-white/20 px-1.5 py-0.5 rounded text-white/90">⌘K</span>
        </button>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            id="sidebar-search-input"
            type="text"
            placeholder="Search threads, code & models..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-[#141722] border border-[#212638] rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#7c5cfc]/60 transition-colors"
          />
        </div>
      </div>

      {/* Thread History Lists */}
      <div className="flex-1 overflow-y-auto px-3 py-1 space-y-4 text-xs">
        {/* Today */}
        <div>
          <h4 className="text-[11px] font-mono uppercase tracking-wider text-slate-400 px-2 mb-1.5 font-medium">Today</h4>
          <div className="space-y-1">
            {historyToday
              .filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()))
              .map(item => {
                const Icon = item.icon;
                const isSelected = item.id === activeChatId;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveChatId(item.id)}
                    className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center gap-2.5 transition-colors group ${
                      isSelected 
                        ? 'bg-[#1e2232] text-white border border-[#2e354d]' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#151824]'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#a58bff]' : 'text-slate-400 group-hover:text-slate-300'}`} />
                    <span className="truncate text-xs">{item.title}</span>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Previous 7 Days */}
        <div>
          <h4 className="text-[11px] font-mono uppercase tracking-wider text-slate-400 px-2 mb-1.5 font-medium">Previous 7 Days</h4>
          <div className="space-y-1">
            {historyPrevious7
              .filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()))
              .map(item => {
                const Icon = item.icon;
                const isSelected = item.id === activeChatId;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveChatId(item.id)}
                    className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center gap-2.5 transition-colors group ${
                      isSelected 
                        ? 'bg-[#1e2232] text-white border border-[#2e354d]' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#151824]'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#a58bff]' : 'text-slate-400 group-hover:text-slate-300'}`} />
                    <span className="truncate text-xs">{item.title}</span>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Previous 30 Days */}
        <div>
          <h4 className="text-[11px] font-mono uppercase tracking-wider text-slate-400 px-2 mb-1.5 font-medium">Previous 30 Days</h4>
          <div className="space-y-1">
            {historyPrevious30
              .filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()))
              .map(item => {
                const Icon = item.icon;
                const isSelected = item.id === activeChatId;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveChatId(item.id)}
                    className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center gap-2.5 transition-colors group ${
                      isSelected 
                        ? 'bg-[#1e2232] text-white border border-[#2e354d]' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#151824]'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#a58bff]' : 'text-slate-400 group-hover:text-slate-300'}`} />
                    <span className="truncate text-xs">{item.title}</span>
                  </button>
                );
              })}
          </div>
        </div>
      </div>

      {/* Bottom Token Meter & User Profile */}
      <div className="p-3 border-t border-[#1f2330] space-y-3 bg-[#0a0c12]">
        {/* Token Allocation Gauge */}
        <div className="p-2.5 rounded-xl bg-[#141722] border border-[#222738] space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-medium">Token Allocation</span>
            <span className="font-mono text-purple-300 font-semibold">784k / 1M (78%)</span>
          </div>
          <div className="w-full bg-[#202538] h-1.5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#7c5cfc] via-[#a855f7] to-[#ec4899] rounded-full" 
              style={{ width: '78%' }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono pt-0.5">
            <span>Resets in 14d</span>
            <button 
              id="sidebar-upgrade-tier-btn"
              className="text-[#a58bff] hover:underline"
            >
              Scale Limit
            </button>
          </div>
        </div>

        {/* User Card */}
        <div className="flex items-center justify-between px-2 py-1.5 rounded-xl hover:bg-[#141722] transition-colors">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDi_CedpmnBPBqwFGZvhz0NeJ5ZNLUiu2T0cyi1iwsMfmf3hFDPxyHBh7vcSCbxMxa8MVdLbmfAmnHCMkVfuRYRNdqfcOBkDqN3yTDfv5krpW2bNFtah3Sv8osgu27eTrdtgcAmX9ZjVkcYEUMVMvdFBp_3tf9Y6ys3xoYgL3nhe8De6t00gGHW7zAShvS65mA8Z-Fi2-81OiKyHHB4tadmeQMQsZ6FnTiHx6ZGRFLN6tdgAVFldoB2" 
                alt="Dr. Evelyn Vance"
                className="w-8 h-8 rounded-full object-cover ring-2 ring-[#7c5cfc]/50"
                referrerPolicy="no-referrer"
              />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#0e1017] absolute -bottom-0.5 -right-0.5" />
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold text-slate-200">Dr. Evelyn Vance</p>
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#7c5cfc]" />
                <p className="text-[10px] font-mono text-slate-400">Enterprise Tier</p>
              </div>
            </div>
          </div>

          <button 
            id="sidebar-settings-btn"
            title="User Settings"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1d2230] transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
