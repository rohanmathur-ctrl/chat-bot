import React, { useState } from 'react';
import { 
  ChevronDown, 
  Menu, 
  Share2, 
  Mic, 
  PanelRight, 
  Check, 
  Sparkles,
  Download,
  Trash2,
  Rocket,
  X,
  Copy,
  ExternalLink,
  Plus,
  LogIn,
  LogOut,
  ShieldCheck,
  User
} from 'lucide-react';
import { ModelType, AuthUser } from '../types';

interface HeaderProps {
  selectedModel: ModelType;
  onSelectModel: (model: ModelType) => void;
  rightPanelOpen: boolean;
  onToggleRightPanel: () => void;
  activeView: 'chat' | 'artifacts' | 'topology';
  onChangeView: (view: 'chat' | 'artifacts' | 'topology') => void;
  onOpenVoice: () => void;
  onNewChat?: () => void;
  onClearChat: () => void;
  onExport: () => void;
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
  currentUser: AuthUser | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedModel,
  onSelectModel,
  rightPanelOpen,
  onToggleRightPanel,
  activeView,
  onChangeView,
  onOpenVoice,
  onNewChat,
  onClearChat,
  onExport,
  onToggleSidebar,
  sidebarCollapsed,
  currentUser,
  onOpenAuth,
  onLogout
}) => {
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [vercelModalOpen, setVercelModalOpen] = useState(false);
  const [copiedCli, setCopiedCli] = useState(false);

  const models: { name: ModelType; desc: string; badge: string }[] = [
    { name: 'Nexus-1 Neural Core', desc: 'Newborn foundation model with native multi-domain machine learning reasoning', badge: 'Active' },
    { name: 'Nexus DeepMind (Reasoning)', desc: 'High-parameter chain-of-thought engine for complex logic, math & science', badge: 'Available' },
    { name: 'Nexus Code (Polyglot)', desc: 'Specialized in software engineering, distributed systems & algorithms', badge: 'Available' }
  ];

  const handleShare = () => {
    setCopiedShare(true);
    navigator.clipboard?.writeText?.(window.location.href);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const handleCopyCli = () => {
    setCopiedCli(true);
    navigator.clipboard?.writeText?.('npm i -g vercel && vercel');
    setTimeout(() => setCopiedCli(false), 2000);
  };

  return (
    <header 
      id="app-header"
      className="h-14 border-b border-[#1f2330] bg-[#090b10]/95 backdrop-blur-md px-3 sm:px-4 flex items-center justify-between z-20 select-none shrink-0"
    >
      {/* Left Section: Sidebar toggle & Model Selector */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          id="header-sidebar-toggle-btn"
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#161a28] transition-colors"
          title={sidebarCollapsed ? "Expand Sidebar (⌘B)" : "Collapse Sidebar (⌘B)"}
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Model Selector Dropdown */}
        <div className="relative">
          <button
            id="model-selector-dropdown-btn"
            onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#131622] border border-[#23283a] hover:border-[#7c5cfc]/50 text-slate-200 text-xs font-medium transition-all group"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
            <span className="font-semibold text-white tracking-wide truncate max-w-[150px] sm:max-w-none">{selectedModel}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${modelDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {modelDropdownOpen && (
            <div 
              id="model-dropdown-menu"
              className="absolute left-0 mt-2 w-72 bg-[#121520] border border-[#252a3d] rounded-2xl p-1.5 shadow-2xl shadow-black/80 z-50 animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="text-[10px] font-mono uppercase text-slate-400 px-3 py-1.5 font-semibold tracking-wider">Select Engine Architecture</div>
              <div className="space-y-1">
                {models.map(m => (
                  <button
                    key={m.name}
                    onClick={() => {
                      onSelectModel(m.name);
                      setModelDropdownOpen(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl flex items-start justify-between transition-colors ${
                      selectedModel === m.name ? 'bg-[#1e2336] text-white border border-[#343b56]' : 'text-slate-300 hover:bg-[#181c2b]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white">{m.name}</span>
                        {selectedModel === m.name && <Check className="w-3.5 h-3.5 text-[#7c5cfc]" />}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">{m.desc}</p>
                    </div>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      selectedModel === m.name ? 'bg-[#7c5cfc]/20 text-[#a58bff]' : 'bg-[#1c2030] text-slate-500'
                    }`}>
                      {m.badge}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Section: New Chat, Runner Toggle, Voice, Deploy */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* New Chat Button */}
        {onNewChat && (
          <button
            id="header-new-chat-btn"
            onClick={onNewChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1a1f30] hover:bg-[#242b42] text-slate-200 hover:text-white text-xs font-medium border border-[#2b334e] transition-colors shadow-sm"
            title="Start New Chat (⌘K)"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Chat</span>
          </button>
        )}

        {/* Voice Engine Launch */}
        <button
          id="header-voice-engine-btn"
          onClick={onOpenVoice}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#131622] hover:bg-[#1d2234] border border-[#23283a] text-purple-300 text-xs font-medium transition-colors"
          title="Voice Conversation"
        >
          <Mic className="w-3.5 h-3.5 text-purple-400" />
          <span className="hidden md:inline">Voice</span>
        </button>

        {/* Runner / Code Panel Toggle */}
        <button
          id="header-toggle-canvas-btn"
          onClick={onToggleRightPanel}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
            rightPanelOpen 
              ? 'bg-[#7c5cfc]/20 text-[#c8b6ff] border-[#7c5cfc]/50 shadow-sm' 
              : 'bg-[#131622] text-slate-400 border-[#23283a] hover:text-white'
          }`}
          title="Toggle Code & Artifacts Runner (⌘J)"
        >
          <PanelRight className="w-3.5 h-3.5" />
          <span className="hidden md:inline">{rightPanelOpen ? 'Close Runner' : 'Runner'}</span>
        </button>

        {/* Deploy to Vercel Action */}
        <button
          id="header-deploy-vercel-btn"
          onClick={() => setVercelModalOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-black hover:bg-slate-900 border border-white/20 text-white text-xs font-medium shadow-sm transition-all"
          title="Deploy to Vercel"
        >
          <svg className="w-3 h-3 fill-white" viewBox="0 0 76 65" height="1em" width="1em">
            <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
          </svg>
          <span className="hidden lg:inline">Deploy</span>
        </button>

        {/* Share Button */}
        <button
          id="header-share-btn"
          onClick={handleShare}
          className="p-2 rounded-xl bg-[#131622] hover:bg-[#1d2234] border border-[#23283a] text-slate-400 hover:text-white transition-colors"
          title="Share Chatbot Link"
        >
          {copiedShare ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
        </button>

        {/* Clear Thread History */}
        <button
          id="header-clear-chat-btn"
          onClick={onClearChat}
          className="p-2 rounded-xl bg-[#131622] hover:bg-[#1d2234] border border-[#23283a] text-slate-500 hover:text-rose-400 transition-colors"
          title="Clear Conversation History"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>

        {/* User Account / Email Login Pill */}
        {currentUser ? (
          <div className="relative">
            <button
              id="header-user-profile-btn"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-xl bg-[#151928] hover:bg-[#1c2236] border border-[#283048] text-xs transition-all"
            >
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#7c5cfc] to-emerald-400 flex items-center justify-center text-white font-bold text-[11px] shadow-sm">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <span className="font-medium text-slate-200 hidden sm:inline max-w-[100px] truncate">
                {currentUser.name}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </button>

            {userDropdownOpen && (
              <div 
                id="header-user-dropdown-menu"
                className="absolute right-0 mt-2 w-64 bg-[#121522] border border-[#262c42] rounded-2xl p-2 shadow-2xl shadow-black z-50 animate-in fade-in zoom-in-95"
              >
                <div className="p-2.5 border-b border-[#1e2436] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{currentUser.name}</span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      <ShieldCheck className="w-3 h-3" />
                      Verified
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono truncate">{currentUser.email}</p>
                </div>

                <div className="pt-1.5">
                  <button
                    id="header-user-logout-btn"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-300 hover:text-rose-200 hover:bg-rose-500/10 text-xs transition-colors text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            id="header-login-btn"
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#7c5cfc] to-[#6340f5] hover:from-[#6b47fa] hover:to-[#5533ec] text-white text-xs font-semibold shadow-md shadow-[#7c5cfc]/20 transition-all active:scale-95"
            title="Sign in with Email & OTP"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>

      {/* Vercel Deployment Modal */}
      {vercelModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#10131e] border border-[#262c42] rounded-3xl p-6 max-w-lg w-full shadow-2xl shadow-black space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-black border border-white/20 flex items-center justify-center">
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 76 65">
                    <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Deploy Chatbot to Vercel</h3>
                  <p className="text-[11px] text-slate-400">100% Pre-configured & ready for production</p>
                </div>
              </div>
              <button 
                onClick={() => setVercelModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#1a1e2c]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3.5 rounded-2xl bg-[#0b0d14] border border-[#1d2232] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-purple-300 font-semibold">Option 1: Deploy with Vercel CLI (Instant)</span>
                  <button
                    onClick={handleCopyCli}
                    className="flex items-center gap-1 text-[10px] font-mono text-slate-400 hover:text-white px-2 py-0.5 rounded bg-[#181c2b]"
                  >
                    {copiedCli ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCli ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="font-mono text-[11px] bg-black/60 p-2.5 rounded-xl border border-white/5 text-emerald-400">
                  npm i -g vercel && vercel
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#0b0d14] border border-[#1d2232] space-y-2">
                <span className="font-mono text-[11px] text-purple-300 font-semibold">Option 2: Git Repository Import</span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Push this repository to GitHub or GitLab, then import into Vercel. Framework preset is automatically detected as Vite.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={onExport}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#171a26] text-slate-300 hover:text-white text-xs border border-[#23283a]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Chat JSON</span>
              </button>

              <button
                onClick={() => setVercelModalOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-[#7c5cfc] hover:bg-[#6844f7] text-white text-xs font-semibold shadow-md shadow-[#7c5cfc]/30"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
