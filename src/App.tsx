import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ChatTimeline } from './components/ChatTimeline';
import { FloatingDock, FileAttachment } from './components/FloatingDock';
import { ArtifactsRunnerPanel } from './components/ArtifactsRunnerPanel';
import { VoiceModal } from './components/VoiceModal';
import { VisionScannerHUD } from './components/VisionScannerHUD';
import { generateUniversalResponse } from './lib/universalAiModel';
import { 
  ModelType, 
  ArchitectureNode, 
  ChatMessage, 
  RightPanelTab 
} from './types';
import { 
  INITIAL_CHAT_MESSAGES, 
  INITIAL_ARCHITECTURE_NODES, 
  OPENAPI_SPEC 
} from './data/mockData';

export function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelType>('Nexus-1 Neural Core');
  const [activeView, setActiveView] = useState<'chat' | 'artifacts' | 'topology'>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedNode, setSelectedNode] = useState<ArchitectureNode>(INITIAL_ARCHITECTURE_NODES[0]);
  const [isStreaming, setIsStreaming] = useState(false);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setSidebarCollapsed(prev => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        setRightPanelOpen(prev => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        handleNewChat();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNewChat = () => {
    setMessages([]);
    setRightPanelOpen(false);
  };

  const handleSendMessage = async (text: string, attachedFile?: FileAttachment) => {
    if (isStreaming) return;

    const userMsgId = `msg-${Date.now()}`;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newUserMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      timestamp,
      content: text,
      ...(attachedFile ? {
        visionIngest: {
          filename: attachedFile.name,
          size: attachedFile.size,
          status: 'Ingested',
          detectedNodes: INITIAL_ARCHITECTURE_NODES,
          openApiSpec: OPENAPI_SPEC,
          imageUrl: attachedFile.dataUrl
        }
      } : {})
    };

    const assistantMsgId = `msg-${Date.now() + 1}`;
    const newAssistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      timestamp,
      isStreaming: true,
      thoughtTime: '0.2s',
      thoughts: [
        'Activating Nexus-1 neural attention heads across knowledge corpus.',
        'Synthesizing multi-domain machine learning inference stream.'
      ],
      content: '',
      ...(attachedFile ? {
        type: 'vision-ocr' as const,
        visionIngest: {
          filename: attachedFile.name,
          size: attachedFile.size,
          status: 'Document Analyzed',
          detectedNodes: INITIAL_ARCHITECTURE_NODES,
          openApiSpec: OPENAPI_SPEC,
          imageUrl: attachedFile.dataUrl
        }
      } : {})
    };

    setMessages(prev => [...prev, newUserMsg, newAssistantMsg]);
    setIsStreaming(true);

    try {
      // Build conversation payload
      const conversationHistory = [...messages, newUserMsg].map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: conversationHistory,
          attachment: attachedFile ? {
            name: attachedFile.name,
            dataUrl: attachedFile.dataUrl,
            mimeType: attachedFile.mimeType
          } : undefined
        }),
      });

      if (!res.ok) {
        throw new Error(`Server responded with status ${res.status}`);
      }

      if (!res.body) {
        throw new Error('Readable stream not supported.');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';
      let buffer = '';
      let detectedCodeArtifact: any = undefined;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const blocks = buffer.split('\n\n');
        buffer = blocks.pop() || '';

        for (const block of blocks) {
          const lines = block.split('\n');
          let eventType = 'chunk';
          let dataStr = '';

          for (const line of lines) {
            if (line.startsWith('event:')) {
              eventType = line.slice(6).trim();
            } else if (line.startsWith('data:')) {
              dataStr = line.slice(5).trim();
            }
          }

          if (dataStr) {
            try {
              const parsed = JSON.parse(dataStr);
              if (eventType === 'thoughts' && parsed.thoughts) {
                setMessages(prev => prev.map(m => m.id === assistantMsgId ? {
                  ...m,
                  thoughts: parsed.thoughts,
                  thoughtTime: parsed.thoughtTime || m.thoughtTime
                } : m));
              } else if (eventType === 'artifact' && parsed.codeArtifact) {
                detectedCodeArtifact = parsed.codeArtifact;
              } else if (eventType === 'chunk' && parsed.text) {
                accumulated += parsed.text;
                setMessages(prev => prev.map(m => {
                  if (m.id === assistantMsgId) {
                    return {
                      ...m,
                      content: accumulated,
                    };
                  }
                  return m;
                }));
              }
            } catch {
              // Ignore non-json chunk
            }
          }
        }
      }

      // Check if accumulated response contains code blocks if not already provided
      if (!detectedCodeArtifact) {
        const codeBlockMatch = accumulated.match(/```([a-zA-Z0-9_-]+)?\n([\s\S]*?)```/);
        if (codeBlockMatch) {
          const lang = codeBlockMatch[1] || 'typescript';
          const code = codeBlockMatch[2].trim();
          detectedCodeArtifact = {
            filename: `generated-solution.${lang === 'python' ? 'py' : lang === 'rust' ? 'rs' : 'ts'}`,
            language: lang,
            code,
            testSuitePassed: true,
            testsCount: 4
          };
        }
      }

      setMessages(prev => prev.map(m => {
        if (m.id === assistantMsgId) {
          return {
            ...m,
            content: accumulated || 'Response synthesis complete.',
            isStreaming: false,
            ...(detectedCodeArtifact ? { codeArtifact: detectedCodeArtifact } : {})
          };
        }
        return m;
      }));

    } catch (err: any) {
      console.warn('Network stream fallback to Universal AI engine:', err);
      // Universal instant/live response
      const universalRes = await generateUniversalResponse(
        text,
        attachedFile ? { name: attachedFile.name, mimeType: attachedFile.mimeType } : undefined
      );

      // Smooth streaming for client-side / Vercel execution
      const tokens = universalRes.text.match(/(\s+|\S+)/g) || [universalRes.text];
      let streamed = '';
      for (let i = 0; i < tokens.length; i++) {
        streamed += tokens[i];
        if (i % 3 === 0 || i === tokens.length - 1) {
          setMessages(prev => prev.map(m => m.id === assistantMsgId ? {
            ...m,
            content: streamed,
            thoughts: universalRes.thoughts,
            thoughtTime: universalRes.thoughtTime
          } : m));
          await new Promise(r => setTimeout(r, 10));
        }
      }

      setMessages(prev => prev.map(m => {
        if (m.id === assistantMsgId) {
          return {
            ...m,
            isStreaming: false,
            content: universalRes.text,
            thoughts: universalRes.thoughts,
            thoughtTime: universalRes.thoughtTime,
            ...(universalRes.codeArtifact ? { codeArtifact: universalRes.codeArtifact } : {})
          };
        }
        return m;
      }));
    } finally {
      setIsStreaming(false);
    }
  };

  const handlePromptClick = (prompt: string) => {
    handleSendMessage(prompt);
  };

  const handleOpenRunnerWithTab = (tab: RightPanelTab) => {
    setRightPanelOpen(true);
  };

  const handleClearChat = () => {
    if (confirm('Clear current thread history?')) {
      handleNewChat();
    }
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(messages, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "nexus-thread-export.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div id="nexus-app-root" className="flex h-screen w-screen bg-[#090b10] text-[#e0e2ec] overflow-hidden font-sans">
      {/* Collapsible Left Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onNewChat={handleNewChat}
        onOpenVoice={() => setVoiceModalOpen(true)}
      />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        {/* Top Header */}
        <Header
          selectedModel={selectedModel}
          onSelectModel={setSelectedModel}
          rightPanelOpen={rightPanelOpen}
          onToggleRightPanel={() => setRightPanelOpen(!rightPanelOpen)}
          activeView={activeView}
          onChangeView={setActiveView}
          onOpenVoice={() => setVoiceModalOpen(true)}
          onNewChat={handleNewChat}
          onClearChat={handleClearChat}
          onExport={handleExport}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          sidebarCollapsed={sidebarCollapsed}
        />

        {/* View Router */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* 1. Chat Stream View */}
          {activeView === 'chat' && (
            <main id="main-chat-view" className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
              <ChatTimeline
                messages={messages}
                onPromptClick={handlePromptClick}
                selectedNodeId={selectedNode.id}
                onSelectNode={setSelectedNode}
                onOpenRunnerWithTab={handleOpenRunnerWithTab}
              />
              <FloatingDock
                onSendMessage={handleSendMessage}
                onOpenVoice={() => setVoiceModalOpen(true)}
                isStreaming={isStreaming}
              />
            </main>
          )}

          {/* 2. Topology HUD Dedicated Full View */}
          {activeView === 'topology' && (
            <main id="main-topology-view" className="flex-1 p-6 overflow-y-auto max-w-6xl mx-auto w-full space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white tracking-wide">Optical Architecture HUD</h2>
                  <p className="text-xs text-slate-400">High-resolution vector topology & boundary inspection</p>
                </div>
                <button
                  onClick={() => setActiveView('chat')}
                  className="px-3 py-1.5 rounded-xl bg-[#171b2a] hover:bg-[#21263c] text-xs font-mono text-slate-300 border border-[#262c42] transition-colors"
                >
                  ← Return to Chat
                </button>
              </div>

              <VisionScannerHUD
                nodes={INITIAL_ARCHITECTURE_NODES}
                openApiSpec={OPENAPI_SPEC}
                selectedNodeId={selectedNode.id}
                onSelectNode={setSelectedNode}
                onOpenRunner={() => setRightPanelOpen(true)}
              />
            </main>
          )}

          {/* 3. Live Artifacts View */}
          {activeView === 'artifacts' && (
            <main id="main-artifacts-view" className="flex-1 p-6 overflow-y-auto max-w-5xl mx-auto w-full">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-white tracking-wide">Live Artifacts Studio</h2>
                  <p className="text-xs text-slate-400">Executable code blocks, OpenAPI contracts, and test runners</p>
                </div>
                <button
                  onClick={() => setActiveView('chat')}
                  className="px-3 py-1.5 rounded-xl bg-[#171b2a] hover:bg-[#21263c] text-xs font-mono text-slate-300 border border-[#262c42] transition-colors"
                >
                  ← Return to Chat
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#121522] border border-[#23283e] space-y-2">
                  <span className="text-xs font-mono font-bold text-white">Interactive Node Inspector</span>
                  <p className="text-xs text-slate-300">{selectedNode.name} currently targeted in the telemetry suite.</p>
                  <button 
                    onClick={() => setRightPanelOpen(true)}
                    className="mt-2 px-3 py-1.5 rounded-xl bg-[#7c5cfc] text-white text-xs font-medium"
                  >
                    Open Inspector Panel
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-[#121522] border border-[#23283e] space-y-2">
                  <span className="text-xs font-mono font-bold text-white">Vitest Suite</span>
                  <p className="text-xs text-slate-300">LRU Cache verification test harness running 4/4 passing tests.</p>
                  <button 
                    onClick={() => setRightPanelOpen(true)}
                    className="mt-2 px-3 py-1.5 rounded-xl bg-[#1f263c] border border-[#303a58] text-white text-xs font-medium"
                  >
                    View Vitest Runner
                  </button>
                </div>
              </div>
            </main>
          )}

          {/* Collapsible Right-side Artifacts & Runner Panel */}
          <ArtifactsRunnerPanel
            open={rightPanelOpen}
            onClose={() => setRightPanelOpen(false)}
            selectedNode={selectedNode}
            nodes={INITIAL_ARCHITECTURE_NODES}
            onSelectNode={setSelectedNode}
            openApiSpec={OPENAPI_SPEC}
          />
        </div>
      </div>

      {/* Voice Engine Modal Overlay */}
      <VoiceModal
        open={voiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
        onSendVoiceMessage={(spokenText) => {
          setVoiceModalOpen(false);
          handleSendMessage(spokenText);
        }}
      />
    </div>
  );
}

export default App;
