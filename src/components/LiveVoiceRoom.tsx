import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Radio,
  Volume2,
  VolumeX,
  Play,
  Square,
  Sparkles,
  AlertCircle,
  Activity,
  ShieldCheck,
  CheckCircle2,
  Wifi,
  WifiOff
} from 'lucide-react';

export const LiveVoiceRoom: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [transcripts, setTranscripts] = useState<Array<{ sender: 'user' | 'gemini'; text: string; time: string }>>([]);
  const [statusText, setStatusText] = useState<string>('Disconnected. Press "Connect Live Voice" to begin.');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Audio Context refs
  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const isMutedRef = useRef<boolean>(false);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      disconnectSession();
    };
  }, []);

  const pcm16ToBase64 = (float32Array: Float32Array): string => {
    const pcm16 = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    const uint8 = new Uint8Array(pcm16.buffer);
    let binary = '';
    for (let i = 0; i < uint8.byteLength; i++) {
      binary += String.fromCharCode(uint8[i]);
    }
    return btoa(binary);
  };

  const playRawPcm24k = (base64Data: string) => {
    try {
      if (!outputAudioCtxRef.current) {
        outputAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 24000,
        });
      }
      const ctx = outputAudioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const binary = atob(base64Data);
      const len = binary.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      const int16Array = new Int16Array(bytes.buffer);
      const float32Array = new Float32Array(int16Array.length);
      for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768.0;
      }

      const audioBuffer = ctx.createBuffer(1, float32Array.length, 24000);
      audioBuffer.getChannelData(0).set(float32Array);

      const sourceNode = ctx.createBufferSource();
      sourceNode.buffer = audioBuffer;
      sourceNode.connect(ctx.destination);

      const currentTime = ctx.currentTime;
      if (nextStartTimeRef.current < currentTime) {
        nextStartTimeRef.current = currentTime;
      }
      sourceNode.start(nextStartTimeRef.current);
      nextStartTimeRef.current += audioBuffer.duration;
    } catch (e) {
      console.error('Audio playback error:', e);
    }
  };

  const connectSession = async () => {
    setErrorMsg(null);
    setIsConnecting(true);
    setStatusText('Requesting microphone access and initiating Live API connection...');

    try {
      // 1. Microphone access at 16kHz
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      mediaStreamRef.current = stream;

      // 2. Audio contexts
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000,
      });
      inputAudioCtxRef.current = inputCtx;

      outputAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000,
      });

      // 3. Connect WebSocket to /api/live
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/live`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setIsConnecting(false);
        setStatusText('Live Audio Active (gemini-3.8-live). Speak into your microphone.');

        // 4. Setup mic audio processor node
        const source = inputCtx.createMediaStreamSource(stream);
        const processor = inputCtx.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;

        processor.onaudioprocess = (e) => {
          if (isMutedRef.current) return;
          if (ws.readyState === WebSocket.OPEN) {
            const inputChannelData = e.inputBuffer.getChannelData(0);
            const base64Pcm = pcm16ToBase64(inputChannelData);
            ws.send(JSON.stringify({ audio: base64Pcm }));
          }
        };

        source.connect(processor);
        processor.connect(inputCtx.destination);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'audio' && msg.audio) {
            playRawPcm24k(msg.audio);
          } else if (msg.type === 'interrupted') {
            if (outputAudioCtxRef.current) {
              nextStartTimeRef.current = outputAudioCtxRef.current.currentTime;
            }
          } else if (msg.type === 'text' && msg.text) {
            setTranscripts((prev) => [
              ...prev,
              {
                sender: 'gemini',
                text: msg.text,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              },
            ]);
          } else if (msg.type === 'error') {
            setErrorMsg(msg.message || 'Live session error');
          }
        } catch (e) {
          console.error('Error parsing live WS message:', e);
        }
      };

      ws.onerror = (err) => {
        console.error('WebSocket error:', err);
        setErrorMsg('WebSocket connection failed. Ensure server is running.');
        disconnectSession();
      };

      ws.onclose = () => {
        setIsConnected(false);
        setIsConnecting(false);
        setStatusText('Live session disconnected.');
      };
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to initialize microphone or WebSocket.');
      disconnectSession();
    }
  };

  const disconnectSession = () => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (inputAudioCtxRef.current) {
      inputAudioCtxRef.current.close().catch(() => {});
      inputAudioCtxRef.current = null;
    }
    if (outputAudioCtxRef.current) {
      outputAudioCtxRef.current.close().catch(() => {});
      outputAudioCtxRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
    setIsConnecting(false);
    setStatusText('Session disconnected.');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-indigo-500/40 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 uppercase tracking-wider mb-1">
              <Radio className="w-4 h-4 animate-pulse" />
              <span>Real-Time Voice API (gemini-3.8-live)</span>
            </div>
            <h1 className="text-2xl font-black text-slate-100 flex items-center gap-2">
              <span>Hands-Free Garage Voice Dispatcher</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Talk directly with Gemini 3.8 Live while your hands are covered in grease or working with tools. Low-latency bidirectional PCM audio streaming for instant repair troubleshooting.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!isConnected ? (
              <button
                onClick={connectSession}
                disabled={isConnecting}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-amber-500 hover:from-indigo-400 hover:to-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-950/40 transition-all cursor-pointer disabled:opacity-50"
              >
                <Mic className="w-4 h-4" />
                <span>{isConnecting ? 'Connecting...' : 'Connect Live Voice'}</span>
              </button>
            ) : (
              <button
                onClick={disconnectSession}
                className="px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-950/40 transition-all cursor-pointer"
              >
                <Square className="w-4 h-4" />
                <span>Disconnect Voice</span>
              </button>
            )}
          </div>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Main Voice Visualizer Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl flex flex-col items-center justify-center text-center space-y-6 min-h-[380px] relative overflow-hidden">
        {/* Oscilloscope Background Waves */}
        <div className="absolute inset-0 opacity-10 flex items-center justify-center pointer-events-none">
          <div className={`w-96 h-96 rounded-full border-4 border-indigo-400 ${isConnected ? 'animate-ping' : ''}`} />
          <div className={`w-72 h-72 rounded-full border-2 border-amber-400 ${isConnected ? 'animate-pulse' : ''}`} />
        </div>

        {/* Central Audio Orb */}
        <div className="relative">
          <div
            className={`w-28 h-28 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl ${
              isConnected
                ? isMuted
                  ? 'bg-amber-500/20 text-amber-400 border-2 border-amber-500/50 shadow-amber-950/50'
                  : 'bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500/60 shadow-emerald-950/60 scale-105'
                : 'bg-slate-950 text-slate-500 border border-slate-800'
            }`}
          >
            {isConnected ? (
              isMuted ? (
                <MicOff className="w-10 h-10 animate-pulse" />
              ) : (
                <Activity className="w-12 h-12 animate-pulse text-emerald-400" />
              )
            ) : (
              <Mic className="w-10 h-10" />
            )}
          </div>

          {isConnected && (
            <span className="absolute -top-1 -right-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500 text-slate-950">
              LIVE
            </span>
          )}
        </div>

        {/* Audio Wave Bars Simulation */}
        {isConnected && !isMuted && (
          <div className="flex items-center gap-1.5 h-8">
            {[40, 75, 90, 50, 80, 100, 65, 85, 45, 95, 60, 80, 50].map((h, i) => (
              <div
                key={i}
                className="w-1 rounded-full bg-gradient-to-t from-emerald-500 to-amber-400 animate-pulse"
                style={{
                  height: `${h}%`,
                  animationDuration: `${0.4 + (i % 5) * 0.15}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Status Text */}
        <div className="space-y-1">
          <div className="text-sm font-bold text-slate-200">{statusText}</div>
          <p className="text-xs text-slate-400 font-mono">
            Model: gemini-3.8-live · 16kHz PCM Input · 24kHz Audio Output
          </p>
        </div>

        {/* Controls Bar */}
        {isConnected && (
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-2 ${
                isMuted
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
              }`}
            >
              {isMuted ? <MicOff className="w-4 h-4 text-amber-400" /> : <Mic className="w-4 h-4" />}
              <span>{isMuted ? 'Unmute Mic' : 'Mute Mic'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Spoken Directives & Guidance Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="font-bold text-amber-400 font-mono uppercase text-[11px]">
            ⚡ Real-Time Multimeter Check
          </div>
          <p className="text-slate-300 leading-relaxed">
            "Ask: 'I measured 38.2V on a 36V Segway pack after charging for 4 hours. Is the charger failing or is the BMS cutting off?'"
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="font-bold text-sky-400 font-mono uppercase text-[11px]">
            🚲 Rapid Controller Pinout
          </div>
          <p className="text-slate-300 leading-relaxed">
            "Ask: 'What are the 3 phase wire color combinations when installing a generic brushless controller on a Ninebot motor?'"
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="font-bold text-emerald-400 font-mono uppercase text-[11px]">
            🛡️ Live Scam Shield
          </div>
          <p className="text-slate-300 leading-relaxed">
            "Say: 'A buyer at my driveway is asking if they can take the bike for a quick spin down the street without leaving cash. What should I say?'"
          </p>
        </div>
      </div>
    </div>
  );
};
