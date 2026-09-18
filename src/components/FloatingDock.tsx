import React, { useState, useRef, useEffect } from 'react';
import { 
  Paperclip, 
  Globe, 
  BrainCircuit, 
  Mic, 
  ArrowUp,
  Square,
  X, 
  Image as ImageIcon,
  Sparkles,
  Loader2
} from 'lucide-react';

export interface FileAttachment {
  name: string;
  dataUrl: string;
  mimeType: string;
  size: string;
}

interface FloatingDockProps {
  onSendMessage: (text: string, attachedFile?: FileAttachment) => void;
  onOpenVoice: () => void;
  isStreaming?: boolean;
}

export const FloatingDock: React.FC<FloatingDockProps> = ({
  onSendMessage,
  onOpenVoice,
  isStreaming = false
}) => {
  const [inputText, setInputText] = useState('');
  const [stagedAttachment, setStagedAttachment] = useState<FileAttachment | null>(null);
  const [webSearchActive, setWebSearchActive] = useState(true);
  const [deepReasonActive, setDeepReasonActive] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [inputText]);

  const handleSend = () => {
    if ((!inputText.trim() && !stagedAttachment) || isStreaming) return;
    onSendMessage(
      inputText.trim() || (stagedAttachment ? `Analyze this attached file: ${stagedAttachment.name}` : ''),
      stagedAttachment || undefined
    );
    setInputText('');
    setStagedAttachment(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const sizeFormatted = file.size > 1024 * 1024 
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
          : `${Math.round(file.size / 1024)} KB`;

        setStagedAttachment({
          name: file.name,
          dataUrl: reader.result as string,
          mimeType: file.type || 'image/png',
          size: sizeFormatted
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const canSend = (inputText.trim().length > 0 || stagedAttachment !== null) && !isStreaming;

  return (
    <div 
      id="floating-dock-container"
      className="px-4 pb-4 pt-1 bg-gradient-to-t from-[#090b10] via-[#090b10]/95 to-transparent z-20 shrink-0 select-none max-w-3xl lg:max-w-4xl mx-auto w-full"
    >
      <div className="bg-[#131622]/95 border border-[#23283c] focus-within:border-[#7c5cfc]/60 rounded-3xl p-2.5 px-3.5 shadow-2xl shadow-black/80 backdrop-blur-xl transition-all duration-200 space-y-2">
        {/* Staged Media Chip */}
        {stagedAttachment && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1b2032] border border-[#2c344e] text-xs text-slate-200 w-fit animate-in fade-in">
            {stagedAttachment.mimeType.startsWith('image/') ? (
              <img 
                src={stagedAttachment.dataUrl} 
                alt="Preview" 
                className="w-5 h-5 rounded object-cover border border-[#7c5cfc]/50" 
              />
            ) : (
              <ImageIcon className="w-3.5 h-3.5 text-[#7c5cfc]" />
            )}
            <span className="font-mono text-[11px] truncate max-w-xs">{stagedAttachment.name}</span>
            <span className="text-[10px] text-slate-400">({stagedAttachment.size})</span>
            <button
              id="floating-dock-remove-attachment"
              onClick={() => setStagedAttachment(null)}
              className="p-0.5 rounded text-slate-400 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Multiline Input Textarea */}
        <textarea
          ref={textareaRef}
          id="dock-chat-input"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything (science, code, live world time, math)..."
          rows={1}
          className="w-full bg-transparent px-1.5 py-1 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none leading-relaxed max-h-44 overflow-y-auto"
        />

        {/* Action Controls Toolbar */}
        <div className="flex items-center justify-between pt-1">
          {/* Left tools: Attachment, Web Search, DeepReason */}
          <div className="flex items-center gap-1.5">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*,.json,.ts,.py,.yaml,.csv,.txt"
              onChange={handleFileUpload}
            />

            <button
              id="dock-attach-media-btn"
              onClick={() => fileInputRef.current?.click()}
              title="Attach File or Image"
              className="p-2 rounded-full hover:bg-[#1b2032] text-slate-400 hover:text-white transition-colors"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <button
              id="dock-toggle-web-search"
              onClick={() => setWebSearchActive(!webSearchActive)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] transition-colors ${
                webSearchActive
                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                  : 'bg-[#181c2b] border border-[#23293e] text-slate-400'
              }`}
            >
              <Globe className="w-3 h-3" />
              <span>Search</span>
            </button>

            <button
              id="dock-toggle-deep-reason"
              onClick={() => setDeepReasonActive(!deepReasonActive)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] transition-colors ${
                deepReasonActive
                  ? 'bg-[#7c5cfc]/20 border border-[#7c5cfc]/40 text-[#c8b6ff]'
                  : 'bg-[#181c2b] border border-[#23293e] text-slate-400'
              }`}
            >
              <BrainCircuit className="w-3 h-3" />
              <span>Reason</span>
            </button>
          </div>

          {/* Right tools: Voice Dictation & Circular Send Button */}
          <div className="flex items-center gap-2">
            <button
              id="dock-voice-dictation-btn"
              onClick={onOpenVoice}
              title="Speak with Voice Engine"
              className="p-2 rounded-full hover:bg-[#1b2032] text-purple-400 hover:text-purple-300 transition-colors"
            >
              <Mic className="w-4 h-4" />
            </button>

            <button
              id="dock-send-btn"
              onClick={handleSend}
              disabled={!canSend && !isStreaming}
              title={isStreaming ? "Generating response..." : "Send Message"}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                isStreaming
                  ? 'bg-[#252b40] text-slate-300 animate-pulse cursor-not-allowed'
                  : canSend
                  ? 'bg-white text-black hover:bg-slate-200 active:scale-95 shadow-md shadow-white/10'
                  : 'bg-[#202538] text-slate-500 cursor-not-allowed'
              }`}
            >
              {isStreaming ? (
                <Square className="w-3 h-3 fill-slate-300" />
              ) : (
                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="text-center mt-2 text-[10px] text-slate-500 font-sans">
        Nexus-1 can make mistakes. Verify critical facts.
      </div>
    </div>
  );
};
