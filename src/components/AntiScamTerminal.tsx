import React, { useState } from 'react';
import {
  ShieldAlert,
  Copy,
  Check,
  Send,
  Sparkles,
  MapPin,
  Banknote,
  Bike,
  AlertTriangle,
  Lock,
  ExternalLink,
  Info
} from 'lucide-react';

export const AntiScamTerminal: React.FC = () => {
  const [buyerMessage, setBuyerMessage] = useState<string>('');
  const [itemContext, setItemContext] = useState<string>('Electric Scooter');
  const [askingPrice, setAskingPrice] = useState<number>(420);
  const [bottomPrice, setBottomPrice] = useState<number>(380);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Common quick-test scam messages
  const QUICK_SCAM_SAMPLES = [
    {
      label: 'Fake Zelle Business Upgrade',
      msg: 'I will buy it today for full price. I can only pay via Zelle. Can I have your email so I can send the payment from my Zelle business account?',
    },
    {
      label: 'Courier / Mover Pickup Scam',
      msg: 'I am currently out of town on business, but I will send a courier agent to pick it up once I wire you a cashier check plus $100 for your trouble.',
    },
    {
      label: 'Extreme Lowball',
      msg: 'Bro will you take $120 cash right now I can pick up in 10 minutes that is the most anyone will pay.',
    },
    {
      label: 'Test Ride Request',
      msg: 'Hey can I take it for a 10 minute spin around the block first to make sure the battery accelerates fine before I decide?',
    },
  ];

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleAnalyzeMessage = async () => {
    if (!buyerMessage.trim()) return;

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const response = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerMessage,
          itemTitle: itemContext,
          askingPrice,
          bottomPrice,
        }),
      });

      const data = await response.json();
      if (data.analysis) {
        setAnalysisResult(data.analysis);
      }
    } catch (e: any) {
      console.error(e);
      alert('Error analyzing script: ' + e.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                MODULE 4: ANTI-SCAM TERMINAL
              </span>
              <span className="text-xs text-slate-400 font-mono">
                The Foolproof Shield & Script Vault
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight mt-1">
              Zero-Loss Buyer Negotiation & Fraud Defense
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl">
              Never guess what to say. Paste any strange buyer message below to evaluate scam probability
              and get an instant copy-paste script that protects your cash, safety, and price floor.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Message Interceptor */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                Live Buyer Message Forensic Scanner
              </h2>
            </div>

            {/* Quick Test Scam Prompts */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono text-slate-400">Quick Test Common Scenarios:</span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_SCAM_SAMPLES.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setBuyerMessage(s.msg);
                      setAnalysisResult(null);
                    }}
                    className="px-2.5 py-1 rounded-lg text-xs bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-amber-500/30 transition-all cursor-pointer"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Context Inputs */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <label className="text-slate-400 font-mono block mb-1">Item Title</label>
                <input
                  type="text"
                  value={itemContext}
                  onChange={(e) => setItemContext(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-slate-400 font-mono block mb-1">Asking ($)</label>
                <input
                  type="number"
                  value={askingPrice}
                  onChange={(e) => setAskingPrice(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-emerald-400 font-bold focus:outline-none"
                />
              </div>
              <div>
                <label className="text-slate-400 font-mono block mb-1">Bottom ($)</label>
                <input
                  type="number"
                  value={bottomPrice}
                  onChange={(e) => setBottomPrice(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-rose-400 font-bold focus:outline-none"
                />
              </div>
            </div>

            {/* Buyer Message Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 font-mono">
                Paste The Exact Message From Buyer:
              </label>
              <textarea
                value={buyerMessage}
                onChange={(e) => setBuyerMessage(e.target.value)}
                placeholder='e.g. "Can I pay with Zelle? My brother will pick it up tomorrow..."'
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/50 resize-none font-sans"
              />
            </div>

            <button
              onClick={handleAnalyzeMessage}
              disabled={isAnalyzing || !buyerMessage.trim()}
              className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 hover:opacity-90 text-slate-950 shadow-lg shadow-rose-950/30 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              {isAnalyzing ? (
                <span>ANALYZING THREAT LEVEL...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>INTERCEPT & GENERATE COPY-PASTE SCRIPT</span>
                </>
              )}
            </button>

            {/* Analysis Result Output */}
            {analysisResult && (
              <div className="bg-slate-950 border border-amber-500/40 rounded-xl p-4 space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase text-amber-400 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    Forensic Threat Assessment & Script
                  </span>
                  <button
                    onClick={() => handleCopy(analysisResult, 'analysis-copy')}
                    className="text-xs text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer font-mono"
                  >
                    <Copy className="w-3.5 h-3.5 text-amber-400" />
                    <span>{copiedKey === 'analysis-copy' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="text-xs text-slate-200 whitespace-pre-wrap font-sans leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                  {analysisResult}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: The 4 Non-Negotiable Safe Exchange Protocols */}
        <div className="lg:col-span-6 space-y-4">
          {/* Protocol 1: Police Station Safe Zone */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-sky-400 font-mono text-xs font-bold uppercase">
              <MapPin className="w-4 h-4 text-sky-400" />
              Protocol #1: Police Safe Exchange Zones
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Every city has a designated 24/7 video-monitored "Safe Exchange Zone" outside the municipal police department or inside the main precinct lobby.
            </p>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1">
              <div className="flex justify-between items-center text-slate-300 font-semibold">
                <span>Copy-Paste Meetup Directive:</span>
                <button
                  onClick={() =>
                    handleCopy(
                      "For both of our safety, I conduct all marketplace exchanges in daylight inside the local Police Department lobby. Let me know what time works best for you.",
                      'police-script'
                    )
                  }
                  className="text-sky-400 hover:text-sky-300 text-[11px] font-mono cursor-pointer"
                >
                  {copiedKey === 'police-script' ? 'Copied' : 'Copy Script'}
                </button>
              </div>
              <p className="italic text-[11px]">
                "For both of our safety, I conduct all marketplace exchanges in daylight inside the local Police Department lobby. Let me know what time works best for you."
              </p>
            </div>
          </div>

          {/* Protocol 2: Bank Lobby Deposit Rule */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase">
              <Banknote className="w-4 h-4 text-emerald-400" />
              Protocol #2: Counterfeit Bills & Bank Deposit
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              For transactions over $500 (e-bikes, scooters), meet inside a major bank branch (Chase, Wells Fargo, BofA). Have the buyer hand you the bills at the teller counter or ATM, deposit immediately, and then hand over the keys.
            </p>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Counterfeit verification pen: $5 on Amazon (turns amber on real bills, black on fakes)</span>
              <span className="text-emerald-400 font-mono font-bold">ZERO FAKE CASH RISK</span>
            </div>
          </div>

          {/* Protocol 3: The Test-Ride Collateral Contract */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold uppercase">
              <Bike className="w-4 h-4 text-amber-400" />
              Protocol #3: Test Ride Cash-In-Hand Rule
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Scammers frequently test-ride e-bikes and ride away into traffic. Never hold a backpack, car keys, or driver's license as collateral.
            </p>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-300 space-y-1">
              <div className="flex justify-between items-center font-bold font-mono">
                <span>NON-NEGOTIABLE SCRIPT:</span>
                <button
                  onClick={() =>
                    handleCopy(
                      "You are welcome to test ride it! Standard policy: full cash asking price goes physically into my hands before your feet touch the pedals. If you don't like it, I hand your cash right back on the spot.",
                      'ride-script'
                    )
                  }
                  className="text-amber-400 hover:text-amber-300 text-[11px] cursor-pointer"
                >
                  {copiedKey === 'ride-script' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <p className="italic text-[11px] text-amber-200">
                "You are welcome to test ride it! Standard policy: full cash asking price goes physically into my hands before your feet touch the pedals. If you don't like it, I hand your cash right back on the spot."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
