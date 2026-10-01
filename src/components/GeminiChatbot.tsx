import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Zap,
  Cpu,
  Brain,
  Trash2,
  Copy,
  CheckCircle2,
  User,
  AlertCircle,
  HelpCircle,
  Clock,
  ShieldAlert
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  modelUsed?: string;
}

interface RoleConfig {
  id: 'complex' | 'general' | 'fast';
  name: string;
  model: 'gemini-3.1-pro-preview' | 'gemini-3.5-flash' | 'gemini-3.1-flash-lite';
  badge: string;
  icon: any;
  description: string;
  systemInstruction: string;
  samplePrompts: string[];
}

const ROLES: RoleConfig[] = [
  {
    id: 'complex',
    name: 'Forensic Strategist & Engineering Lead',
    model: 'gemini-3.1-pro-preview',
    badge: 'Complex Reasoning (3.1 Pro)',
    icon: Brain,
    description: 'High-stakes electrical analysis, battery pack chemistry diagnostics, legal liability defense, and business compounding strategy.',
    systemInstruction:
      'You are the Senior Forensic Operations Architect and Electrical Lead for an independent Los Angeles light electric vehicle (LEV) repair and resale shop. You analyze battery pack voltages, BMS fault behavior, motor phase hall sensors, legal dispute mitigation, and the 50/40/10 Fortress Vault financial allocation. Provide exhaustive, mathematically sound, zero-fluff answers with clear safety warnings.',
    samplePrompts: [
      'Diagnose 52V battery measuring 43.1V: BMS cutoff vs bad cell group calculation',
      'Legal dispute strategy: Buyer claims e-bike speed was misrepresented',
      'Step-by-step roadmap to scale garage arbitrage from $1k to $10k safely',
    ],
  },
  {
    id: 'general',
    name: 'Workshop & LEV Repair Advisor',
    model: 'gemini-3.5-flash',
    badge: 'General Workshop (3.5 Flash)',
    icon: Cpu,
    description: 'Standard day-to-day repair procedures, controller pinouts, error codes, parts interchange, and marketplace listing drafts.',
    systemInstruction:
      'You are the Hands-on Repair Foreman for an LEV shop. You provide step-by-step troubleshooting for Ninebot, Super73, Rad Power, and Sur-Ron vehicles, controller wiring, hydraulic brake bleeds, and turnkey marketplace listings.',
    samplePrompts: [
      'How to clear Ninebot Max Error 14 (throttle hall sensor failure)',
      'Draft an honest Facebook Marketplace listing for a Super73 with 200 miles',
      'Compatible 48V throttle replacements with standard 3-pin waterproof Julet plug',
    ],
  },
  {
    id: 'fast',
    name: 'Rapid Cash Triage & Fast Price Calculator',
    model: 'gemini-3.1-flash-lite',
    badge: 'Ultra Fast (3.1 Flash-Lite)',
    icon: Zap,
    description: 'Instant answers under 1 second: bottom-dollar walk away price calculations, fast lowball scripts, quick profit margin triage.',
    systemInstruction:
      'You are the High-Speed Negotiation Shield and Pricing Engine. Give direct, rapid, 1-to-2 sentence calculations, price floors, and instant copy-paste negotiation scripts for fast local cash sales.',
    samplePrompts: [
      'Buyer offered $250 on a $420 Ninebot Max. Give me an instant counter-offer script',
      'Calculate net profit: Bought for $150, parts $40, sold for $380 with 0% fee',
      'Give a 1-sentence cash-in-hand test ride policy script',
    ],
  },
];

export const GeminiChatbot: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<'complex' | 'general' | 'fast'>('general');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'model',
      text: 'LEV Command Center Copilot online. I am equipped with model-tiered reasoning: Gemini 3.1 Pro for complex diagnostics, Gemini 3.5 Flash for general workshop repairs, and Gemini 3.1 Flash-Lite for ultra-fast price checks. How can I assist your operations today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'gemini-3.5-flash',
    },
  ]);
  const [inputText, setInputText] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentRole = ROLES.find((r) => r.id === selectedRole) || ROLES[1];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || inputText).trim();
    if (!messageContent || isSending) return;

    setErrorMessage(null);
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text: messageContent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    if (!textToSend) setInputText('');
    setIsSending(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({
            role: m.role,
            text: m.text,
          })),
          taskType: currentRole.id,
          model: currentRole.model,
          systemInstruction: currentRole.systemInstruction,
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate model response');
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.modelUsed,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Error communicating with Gemini model.');
    } finally {
      setIsSending(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    if (confirm('Clear entire conversation history?')) {
      setMessages([
        {
          id: `welcome-${Date.now()}`,
          role: 'model',
          text: `Conversation reset. Active persona: ${currentRole.name} (${currentRole.model}). Ready for directives.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelUsed: currentRole.model,
        },
      ]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Role Selector Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-wider mb-1">
              <Bot className="w-4 h-4" />
              <span>Multi-Turn Gemini Intelligence Engine</span>
            </div>
            <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
              <span>Operational AI Copilot</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Select task complexity to automatically route between Gemini 3.1 Pro, Gemini 3.5 Flash, and Gemini 3.1 Flash-Lite.
            </p>
          </div>

          <button
            onClick={handleClearChat}
            className="self-start md:self-auto px-3 py-1.5 rounded-lg text-xs font-mono text-slate-400 hover:text-rose-400 bg-slate-950 border border-slate-800 hover:border-rose-500/30 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Thread</span>
          </button>
        </div>

        {/* 3 Model Tier Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 mt-4">
          {ROLES.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;
            return (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500/60 shadow-md shadow-amber-950/20 text-slate-100'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-slate-500'}`} />
                    <span className="text-xs font-bold">{role.name}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-slate-800 text-amber-300 border border-slate-700">
                    {role.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                  {role.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Chat Thread Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex flex-col h-[560px] overflow-hidden">
        {/* Messages List Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[88%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold border ${
                    isUser
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-slate-800 text-slate-200 border-slate-700'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-amber-400" />}
                </div>

                {/* Bubble */}
                <div className="space-y-1">
                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                      isUser
                        ? 'bg-amber-500/20 text-amber-100 border border-amber-500/30 rounded-tr-sm'
                        : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-sm whitespace-pre-wrap'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Message Metadata & Copy Button */}
                  <div className={`flex items-center gap-2 text-[10px] font-mono text-slate-500 ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <span>{msg.timestamp}</span>
                    {msg.modelUsed && (
                      <>
                        <span>·</span>
                        <span className="text-amber-400/80">{msg.modelUsed}</span>
                      </>
                    )}
                    <button
                      onClick={() => handleCopy(msg.id, msg.text)}
                      className="hover:text-slate-300 transition-colors cursor-pointer ml-1"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Copied
                        </span>
                      ) : (
                        <Copy className="w-2.5 h-2.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {isSending && (
            <div className="flex gap-3 mr-auto max-w-[85%]">
              <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 text-amber-400 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-pulse" />
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-xs text-slate-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>Consulting {currentRole.model}...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Preset Prompt Suggestions */}
        <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[10px] font-mono text-slate-400 shrink-0">Suggestions:</span>
          {currentRole.samplePrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(prompt)}
              className="text-[11px] bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 px-2.5 py-1 rounded-full whitespace-nowrap transition-all cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="px-4 py-2 bg-rose-500/10 border-t border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{errorMessage}</span>
          </div>
        )}

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Ask ${currentRole.name} (${currentRole.model})...`}
            disabled={isSending}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isSending || !inputText.trim()}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-amber-950/40"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
