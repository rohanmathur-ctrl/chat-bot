import React, { useState, useEffect, useRef } from 'react';
import Markdown from 'react-markdown';
import { 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  Play, 
  Pause, 
  RotateCcw, 
  ThumbsUp, 
  ThumbsDown, 
  Code, 
  ExternalLink, 
  Sparkles, 
  BrainCircuit, 
  Clock, 
  CheckCircle2, 
  Volume2, 
  Image as ImageIcon,
  Loader2,
  Share2
} from 'lucide-react';
import { ChatMessage, ArchitectureNode } from '../types';
import { VisionScannerHUD } from './VisionScannerHUD';

interface ChatTimelineProps {
  messages: ChatMessage[];
  onPromptClick: (prompt: string) => void;
  selectedNodeId: string;
  onSelectNode: (node: ArchitectureNode) => void;
  onOpenRunnerWithTab: (tab: 'inspector' | 'vitest' | 'json') => void;
}

export const ChatTimeline: React.FC<ChatTimelineProps> = ({
  messages,
  onPromptClick,
  selectedNodeId,
  onSelectNode,
  onOpenRunnerWithTab
}) => {
  const [expandedThoughts, setExpandedThoughts] = useState<Record<string, boolean>>({});
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [playingVoice, setPlayingVoice] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleThoughts = (id: string) => {
    setExpandedThoughts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyCode = (id: string, code: string) => {
    setCopiedCodeId(id);
    navigator.clipboard?.writeText?.(code);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleCopyMessage = (id: string, content: string) => {
    setCopiedMsgId(id);
    navigator.clipboard?.writeText?.(content);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const handleSpeak = (id: string, text: string) => {
    if (speakingMsgId === id) {
      window.speechSynthesis?.cancel();
      setSpeakingMsgId(null);
      return;
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text.replace(/```[\s\S]*?```/g, 'Code block omitted.'));
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.onend = () => setSpeakingMsgId(null);
      utterance.onerror = () => setSpeakingMsgId(null);
      setSpeakingMsgId(id);
      window.speechSynthesis.speak(utterance);
    }
  };

  // 1. Clean Newborn Model Welcome Screen (When thread is empty)
  if (messages.length === 0) {
    return (
      <div id="chat-welcome-container" className="flex-1 overflow-y-auto px-4 py-8 flex flex-col items-center justify-center font-sans">
        <div className="max-w-2xl w-full flex flex-col items-center text-center space-y-6 animate-in fade-in duration-300">
          {/* Glowing Emblem */}
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#5d3bf6] via-[#7c5cfc] to-[#38bdf8] flex items-center justify-center p-3 shadow-2xl shadow-[#7c5cfc]/30">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-[#090b10]" />
            </span>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Where would you like to start?
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
              Powered by Nexus-1, an autonomous newborn AI foundation model trained across science, coding, world clocks, and mathematics.
            </p>
          </div>

          {/* 4 Prompt Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full pt-2">
            <button
              id="prompt-python-btn"
              onClick={() => onPromptClick('What is Python, what makes it popular, and what are its key use cases?')}
              className="text-left p-4 rounded-2xl bg-[#131622]/90 hover:bg-[#1b2032] border border-[#23293e] hover:border-[#7c5cfc]/60 transition-all group shadow-lg shadow-black/40"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-white group-hover:text-[#a58bff] transition-colors">What is Python?</span>
                <Sparkles className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#7c5cfc]" />
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">Comprehensive overview, readable syntax, and use cases</p>
            </button>

            <button
              id="prompt-florida-time-btn"
              onClick={() => onPromptClick('What time is it in Florida right now?')}
              className="text-left p-4 rounded-2xl bg-[#131622]/90 hover:bg-[#1b2032] border border-[#23293e] hover:border-[#7c5cfc]/60 transition-all group shadow-lg shadow-black/40"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-white group-hover:text-[#a58bff] transition-colors">What time is it in Florida?</span>
                <Clock className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400" />
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">Live atomic physical clock with exact Eastern Time and date</p>
            </button>

            <button
              id="prompt-quantum-btn"
              onClick={() => onPromptClick('Explain quantum entanglement simply and its modern technological applications.')}
              className="text-left p-4 rounded-2xl bg-[#131622]/90 hover:bg-[#1b2032] border border-[#23293e] hover:border-[#7c5cfc]/60 transition-all group shadow-lg shadow-black/40"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-white group-hover:text-[#a58bff] transition-colors">Quantum Entanglement</span>
                <BrainCircuit className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#38bdf8]" />
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">How correlated quantum states work and quantum computing uses</p>
            </button>

            <button
              id="prompt-lru-btn"
              onClick={() => onPromptClick('Write an O(1) LRU Cache implementation in TypeScript with tests.')}
              className="text-left p-4 rounded-2xl bg-[#131622]/90 hover:bg-[#1b2032] border border-[#23293e] hover:border-[#7c5cfc]/60 transition-all group shadow-lg shadow-black/40"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-white group-hover:text-[#a58bff] transition-colors">LRU Cache in TypeScript</span>
                <Code className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#a855f7]" />
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">Doubly linked list with Map index and unit tests</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Active Chat Stream View (Centered, expansive, no clutter)
  return (
    <div id="chat-timeline-scroll-container" className="flex-1 overflow-y-auto px-4 py-6 max-w-3xl lg:max-w-4xl mx-auto w-full space-y-6 font-sans">
      {messages.map((msg) => {
        const isUser = msg.role === 'user';

        // User Message
        if (isUser) {
          return (
            <div key={msg.id} id={msg.id} className="flex items-start gap-3 justify-end group">
              <div className="max-w-xl space-y-2 text-right">
                {msg.visionIngest && (
                  <div className="flex flex-col items-end gap-1.5">
                    {msg.visionIngest.imageUrl && (
                      <img 
                        src={msg.visionIngest.imageUrl} 
                        alt="Attachment" 
                        className="max-h-48 rounded-xl border border-[#2c344e] object-contain bg-black/40"
                      />
                    )}
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#191d2c] border border-[#2c344e] text-xs text-slate-200">
                      <ImageIcon className="w-3.5 h-3.5 text-[#7c5cfc]" />
                      <span className="font-mono text-[11px]">{msg.visionIngest.filename}</span>
                      <span className="text-[10px] text-slate-400">({msg.visionIngest.size})</span>
                    </div>
                  </div>
                )}

                <div className="p-3.5 px-4.5 rounded-3xl rounded-tr-md bg-[#1f2438] border border-[#2d3552] text-slate-100 text-xs sm:text-sm leading-relaxed text-left shadow-md">
                  {msg.content}
                </div>

                <div className="text-[10px] font-mono text-slate-500 pr-1">
                  {msg.timestamp}
                </div>
              </div>

              {/* User Avatar Circle */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#3b82f6] to-[#8b5cf6] flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5 shadow-md">
                U
              </div>
            </div>
          );
        }

        // Assistant Message
        return (
          <div key={msg.id} id={msg.id} className="flex items-start gap-3.5 justify-start">
            {/* Nexus-1 Neural Emblem */}
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#5d3bf6] to-[#9d7cfd] flex items-center justify-center p-1.5 shadow-md shadow-[#7c5cfc]/20 shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4 text-white" />
            </div>

            <div className="max-w-2xl lg:max-w-3xl flex-1 space-y-3 min-w-0">
              {/* Top metadata */}
              <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                <span className="font-semibold text-slate-200">Nexus-1 Neural Core</span>
                <span>•</span>
                <span>{msg.timestamp}</span>
              </div>

              {/* Chain of Thought Reasoning Collapse */}
              {msg.thoughtTime && (
                <div className="rounded-xl border border-[#21273c] bg-[#0e111a] overflow-hidden text-xs">
                  <button
                    id={`thought-toggle-${msg.id}`}
                    onClick={() => toggleThoughts(msg.id)}
                    className="w-full px-3 py-1.5 flex items-center justify-between text-slate-400 hover:text-slate-200 hover:bg-[#141826] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <BrainCircuit className="w-3.5 h-3.5 text-[#a58bff]" />
                      <span className="font-mono text-[11px] font-medium text-slate-300">
                        Neural Reasoning ({msg.thoughtTime})
                      </span>
                    </div>
                    {expandedThoughts[msg.id] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {expandedThoughts[msg.id] && msg.thoughts && (
                    <div className="px-3.5 py-2 bg-[#090b12] border-t border-[#1a1f30] font-mono text-[11px] space-y-1 text-slate-400">
                      {msg.thoughts.map((th, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="text-[#7c5cfc] mt-0.5">•</span>
                          <span>{th}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Streaming loading indicator */}
              {msg.isStreaming && !msg.content ? (
                <div className="flex items-center gap-2.5 py-2 text-xs text-purple-300">
                  <Loader2 className="w-4 h-4 animate-spin text-[#7c5cfc]" />
                  <span className="font-mono text-[11px]">Synthesizing stream...</span>
                </div>
              ) : (
                <div className="text-xs sm:text-sm text-slate-100 leading-relaxed font-sans">
                  <div className="markdown-body prose prose-invert max-w-none">
                    <Markdown>{msg.content}</Markdown>
                  </div>
                  {msg.isStreaming && (
                    <span className="inline-block w-2 h-4 ml-1 bg-[#7c5cfc] animate-pulse align-middle" />
                  )}
                </div>
              )}

              {/* Code Artifact Snippet */}
              {msg.codeArtifact && (
                <div className="rounded-2xl border border-[#23283c] bg-[#0c0e16] overflow-hidden shadow-xl my-2">
                  <div className="px-4 py-2 bg-[#121522] border-b border-[#212638] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Code className="w-3.5 h-3.5 text-[#a58bff]" />
                      <span className="text-xs font-mono font-semibold text-white">{msg.codeArtifact.filename}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#202538] text-slate-400">
                        {msg.codeArtifact.language}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        id={`copy-code-${msg.id}`}
                        onClick={() => handleCopyCode(msg.id, msg.codeArtifact!.code)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#181c2c] hover:bg-[#23293e] text-slate-300 text-xs transition-colors border border-[#262c40]"
                      >
                        {copiedCodeId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span className="text-[11px]">{copiedCodeId === msg.id ? 'Copied' : 'Copy'}</span>
                      </button>

                      <button
                        id="open-runner-from-code-btn"
                        onClick={() => onOpenRunnerWithTab('vitest')}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#7c5cfc]/20 hover:bg-[#7c5cfc]/30 text-[#c8b6ff] text-xs transition-colors border border-[#7c5cfc]/30"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span className="text-[11px]">Open Runner</span>
                      </button>
                    </div>
                  </div>

                  <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto max-h-80 leading-relaxed bg-[#0b0d14]">
                    <code>{msg.codeArtifact.code}</code>
                  </pre>
                </div>
              )}

              {/* Multimodal Vision OCR Ingest HUD */}
              {msg.visionIngest?.detectedNodes && (
                <VisionScannerHUD
                  nodes={msg.visionIngest.detectedNodes}
                  openApiSpec={msg.visionIngest.openApiSpec}
                  selectedNodeId={selectedNodeId}
                  onSelectNode={onSelectNode}
                  onOpenRunner={() => onOpenRunnerWithTab('inspector')}
                />
              )}

              {/* Message Action Bar (Copy, Speak, Feedback) */}
              <div className="flex items-center gap-2 pt-1 text-slate-400">
                <button 
                  title="Copy Response"
                  onClick={() => handleCopyMessage(msg.id, msg.content)}
                  className="p-1.5 rounded-lg hover:text-white hover:bg-[#161a28] transition-colors"
                >
                  {copiedMsgId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button 
                  title={speakingMsgId === msg.id ? "Stop Reading" : "Read Aloud"}
                  onClick={() => handleSpeak(msg.id, msg.content)}
                  className={`p-1.5 rounded-lg transition-colors ${speakingMsgId === msg.id ? 'text-[#a58bff] bg-[#7c5cfc]/20' : 'hover:text-white hover:bg-[#161a28]'}`}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
                <button 
                  title="Good Response"
                  className="p-1.5 rounded-lg hover:text-white hover:bg-[#161a28] transition-colors"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                </button>
                <button 
                  title="Bad Response"
                  className="p-1.5 rounded-lg hover:text-white hover:bg-[#161a28] transition-colors"
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};
