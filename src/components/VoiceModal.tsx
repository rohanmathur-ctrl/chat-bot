import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Radio, 
  Sparkles, 
  Square, 
  Headphones, 
  Sliders, 
  RefreshCw,
  Send
} from 'lucide-react';

interface VoiceModalProps {
  open: boolean;
  onClose: () => void;
  onSendVoiceMessage?: (text: string) => void;
}

export const VoiceModal: React.FC<VoiceModalProps> = ({ open, onClose, onSendVoiceMessage }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('Apex-Pro (Neural Deep)');
  const [activeSpeaker, setActiveSpeaker] = useState<'Nexus' | 'User'>('User');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState(
    'Listening... Speak now or type a query for real-time voice synthesis.'
  );
  const [manualInput, setManualInput] = useState('');
  const recognitionRef = useRef<any>(null);

  // Generate 24 dynamic spectrogram bars
  const [bars, setBars] = useState<number[]>([
    20, 45, 60, 80, 55, 70, 90, 40, 65, 85, 95, 75,
    60, 85, 70, 50, 65, 80, 45, 30, 60, 75, 50, 25
  ]);

  // Audio spectrum animation
  useEffect(() => {
    if (!open) return;
    const interval = setInterval(() => {
      setBars(prev => prev.map(() => Math.floor(Math.random() * (isListening ? 75 : 40)) + 15));
    }, 120);
    return () => clearInterval(interval);
  }, [open, isListening]);

  // Real-time Web Speech Recognition
  useEffect(() => {
    if (!open) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition && !isMuted) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
          setActiveSpeaker('User');
        };

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          if (currentTranscript.trim()) {
            setTranscript(currentTranscript);
            setManualInput(currentTranscript);
          }
        };

        recognition.onerror = (e: any) => {
          console.warn('Speech recognition warning:', e.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.start();
        recognitionRef.current = recognition;
      } catch (err) {
        console.warn('Could not start speech recognition:', err);
      }
    }

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
    };
  }, [open, isMuted]);

  const handleSendSpokenQuery = (textToSend?: string) => {
    const query = textToSend || manualInput || transcript;
    if (!query || query.startsWith('Listening...')) return;

    if (onSendVoiceMessage) {
      onSendVoiceMessage(query);
    }
  };

  if (!open) return null;

  return (
    <div 
      id="voice-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200"
    >
      <div 
        id="voice-modal-container"
        className="w-full max-w-xl bg-[#0e111a] border border-[#272d42] rounded-3xl overflow-hidden shadow-2xl shadow-[#7c5cfc]/20 relative flex flex-col items-center select-none"
      >
        {/* Subtle background ambient radial gradients */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-[#7c5cfc]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-[#22d3ee]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="w-full px-6 py-4 border-b border-[#1f2436] flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-mono font-bold tracking-wider text-white uppercase">Nexus Voice Engine v2.1</span>
            <span className="px-2 py-0.5 rounded-md bg-[#7c5cfc]/20 text-[#c8b6ff] text-[10px] font-mono border border-[#7c5cfc]/30">
              18ms RTT
            </span>
          </div>

          <button
            id="voice-modal-close-btn"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#1a1f30] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Central Visualizer Section */}
        <div className="w-full py-10 px-6 flex flex-col items-center justify-center relative z-10 space-y-8">
          {/* Animated Central Orb */}
          <div className="relative flex items-center justify-center">
            {/* Outer pulsating rings */}
            <div className="w-36 h-36 rounded-full bg-gradient-to-tr from-[#7c5cfc]/30 via-[#a855f7]/20 to-[#22d3ee]/30 animate-pulse blur-md absolute" />
            <div className="w-28 h-28 rounded-full border border-[#7c5cfc]/40 animate-spin" style={{ animationDuration: '8s' }} />

            {/* Core Neural Sphere */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#6842f4] via-[#845bf8] to-[#06b6d4] flex items-center justify-center shadow-xl shadow-[#7c5cfc]/40 relative overflow-hidden">
              <Sparkles className="w-8 h-8 text-white animate-bounce" style={{ animationDuration: '2s' }} />
              <div className="absolute inset-0 bg-white/10 opacity-40 mix-blend-overlay" />
            </div>
          </div>

          {/* Dynamic Audio Spectrogram Bars */}
          <div className="flex items-center gap-1.5 h-16 justify-center w-full max-w-sm">
            {bars.map((height, i) => (
              <div
                key={i}
                className="w-1.5 rounded-full bg-gradient-to-t from-[#7c5cfc] via-[#a855f7] to-[#22d3ee] transition-all duration-100"
                style={{ height: `${height}%`, opacity: isMuted ? 0.3 : 0.9 }}
              />
            ))}
          </div>

          {/* Live Transcription Box */}
          <div className="w-full p-4 rounded-2xl bg-[#131726]/90 border border-[#232a40] backdrop-blur-md space-y-2">
            <div className="flex items-center justify-between mb-1.5 text-[10px] font-mono text-slate-400">
              <span className="flex items-center gap-1.5 text-[#a58bff]">
                <Radio className={`w-3 h-3 ${isListening ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
                <span>{isListening ? 'RECORDING MICROPHONE' : 'SPEECH BUFFER'} • {activeSpeaker.toUpperCase()}</span>
              </span>
              <span>LIVE SPEECH-TO-TEXT</span>
            </div>

            <textarea
              id="voice-modal-transcript-input"
              value={manualInput || transcript}
              onChange={(e) => {
                setManualInput(e.target.value);
                setTranscript(e.target.value);
              }}
              rows={3}
              placeholder="Speak into microphone or type question here..."
              className="w-full bg-[#0a0c14]/70 rounded-xl p-2.5 text-xs text-slate-200 leading-relaxed font-sans border border-[#1e2436] focus:outline-none focus:border-[#7c5cfc] resize-none"
            />

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-slate-400 font-mono">
                {isListening ? '🎙️ Listening to live audio...' : '💡 Click mic below or type to query'}
              </span>
              <button
                id="voice-send-to-thread-btn"
                onClick={() => handleSendSpokenQuery()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#7c5cfc] hover:bg-[#6a46fc] text-white text-xs font-semibold shadow-md shadow-[#7c5cfc]/20 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send to Nexus Thread</span>
              </button>
            </div>
          </div>
        </div>

        {/* Voice Controls & Settings Toolbar */}
        <div className="w-full px-6 py-4 bg-[#0a0c13] border-t border-[#1f2436] flex flex-wrap items-center justify-between gap-3 z-10">
          {/* Voice Selector */}
          <div className="flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            <select
              id="voice-persona-select"
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="bg-[#141826] border border-[#23293e] rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-[#7c5cfc]"
            >
              <option value="Apex-Pro (Neural Deep)">Apex-Pro • Deep British</option>
              <option value="Serena (Neural Calm)">Serena • Neural Calm</option>
              <option value="Echo (Direct Engineer)">Echo • Direct Engineer</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              id="voice-mute-mic-btn"
              onClick={() => setIsMuted(!isMuted)}
              className={`p-2.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                isMuted 
                  ? 'bg-rose-950/40 border-rose-500/50 text-rose-300' 
                  : 'bg-[#151928] border-[#252b42] text-slate-300 hover:text-white'
              }`}
              title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
            >
              {isMuted ? <MicOff className="w-4 h-4 text-rose-400" /> : <Mic className="w-4 h-4 text-slate-300" />}
              <span className="hidden sm:inline">{isMuted ? 'Muted' : 'Mute Mic'}</span>
            </button>

            <button
              id="voice-interrupt-btn"
              onClick={() => {
                setActiveSpeaker('User');
                setTranscript('Listening to user voice input...');
              }}
              className="px-3 py-2 rounded-xl bg-[#151928] hover:bg-[#1d2238] border border-[#252b42] text-slate-300 hover:text-white text-xs font-medium transition-colors"
            >
              Interrupt
            </button>

            <button
              id="voice-end-session-btn"
              onClick={onClose}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-600/20 transition-all"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>End Session</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
