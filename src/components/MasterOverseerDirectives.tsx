import React, { useState } from 'react';
import {
  BookOpen,
  Copy,
  Check,
  ShieldCheck,
  Scale,
  DollarSign,
  AlertTriangle,
  FileText,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

export const MasterOverseerDirectives: React.FC = () => {
  const [copied, setCopied] = useState<boolean>(false);

  const MASTER_PROMPT_TEXT = `# SYSTEM ARCHITECTURE: THE TURNKEY EXECUTION ENGINE (V3.0)
Role: Master Chief Operating Officer, Forensic Risk Analyst, and Execution Engine.
Mission: Lead an absolute beginner with zero business background from broke in an apartment to generating rapid cash and building a repeatable, profitable flipping business with zero unhedged downside.
Operating Principle: "Zero Guesswork." The AI does 100% of the market research, price calculations, listing copy, and buyer-communication scripts.

---

### I. THE 5 HUMAN-PROOF LAWS

1. NO BUSINESS JARGON EVER: Speak in direct, plain-language physical instructions.
2. AI DOES THE HEAVY LIFTING: Generate exact titles, descriptions, bottom-dollar walk-away prices, and copy-paste scripts.
3. SINGLE-THREADED EXECUTION (WIP = 1): Exactly ONE discrete physical task at a time. Do not overwhelm.
4. FOOLPROOF ANTI-SCAM SHIELD: Local cash only for high-ticket items, meet in bank lobby or police station, full cash in hand before test rides.
5. CAPITAL FORTRESS (50/40/10): 50% Family Safety Vault (untouchable), 40% Active Arbitrage Fund, 10% Supplies and Taxes.

---

### II. THE 3-STAGE PIPELINE

STAGE 1: THE APARTMENT CASH HARVEST (DAYS 1–30)
- E-bikes and electric scooters liquidated peer-to-peer for cash.
- Collectibles & TCG liquidated raw to Local Card Shop buy-lists for instant cash.
- Branded apparel bundled into single-size lots.

STAGE 2: THE RULE OF 3X SOURCING (MONTHS 2–12)
- Purchase underpriced inventory at 33% or less of true market clearing value.
- Focus: Underpriced scooters needing minor repairs, estate cleanouts, tools.

STAGE 3: COMMERCIAL FLEX-HUB & 4% RETIREMENT (YEARS 2–15+)
- Flex-space lease, part-time staff, Solo 401(k) + index fund compounding.
- Trinity study 4% rule: $3.5M invested yields $140,000/yr perpetual inflation-adjusted passive income.
`;

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(MASTER_PROMPT_TEXT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                MODULE 6: OVERSEER DIRECTIVES
              </span>
              <span className="text-xs text-slate-400 font-mono">
                System Standard Operating Procedures (SOPs)
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight mt-1">
              Master System Architecture & Forensic Directives
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl">
              The operational constitution governing every appraisal, negotiation, and capital allocation decision. Built to ensure statistical survival and eliminate emotional error.
            </p>
          </div>

          <button
            onClick={handleCopyPrompt}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-950/30 shrink-0"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'COPIED TO CLIPBOARD' : 'COPY MASTER PROMPT (V3.0)'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Core Law 1: 98%+ Threshold & STR */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold uppercase">
            <Scale className="w-4 h-4 text-amber-400" />
            Directive 1: The 98%+ Quantitative Threshold
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Reject any idea or inventory purchase whose success depends on speculation, viral trends, or market appreciation. Every asset must meet:
          </p>
          <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside bg-slate-950 p-3 rounded-xl border border-slate-800">
            <li><strong className="text-slate-200">Sell-Through Rate (STR) $\ge$ 70%:</strong> [90-Day Sold Listings / Total Active Listings] must exceed 70%.</li>
            <li><strong className="text-slate-200">Median Days to Sell (DTS) $\le$ 7 days:</strong> At fast-cash pricing, capital must clear in under a week.</li>
            <li><strong className="text-slate-200">Zero Unhedged Downside:</strong> No speculative holds or loans.</li>
          </ul>
        </div>

        {/* Core Law 2: Platform Freeze & Escrow Defense */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-rose-400 font-mono text-xs font-bold uppercase">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            Directive 2: Platform Freeze & Escrow Prevention
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            The biggest fatal bottleneck for broke operators: listing a $1,500 e-bike on a brand new eBay or Mercari account. Anti-fraud algorithms will lock funds for 21 to 30 days!
          </p>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
            <span className="font-bold text-rose-400 uppercase font-mono block">The Local Cash Quarantine:</span>
            <p className="text-[11px] leading-relaxed">
              All items valued over $100 must be liquidated peer-to-peer for physical cash until your $2,500 emergency family fortress is established and online accounts are aged with low-ticket sales.
            </p>
          </div>
        </div>

        {/* Core Law 3: IRS 1099-K Defense */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-sky-400 font-mono text-xs font-bold uppercase">
            <FileText className="w-4 h-4 text-sky-400" />
            Directive 3: IRS 1099-K Personal Loss Defense
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Marketplace platforms report gross sales above IRS thresholds. However, selling used personal belongings at a loss is <strong>NON-TAXABLE</strong>.
          </p>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
            <span className="font-bold text-sky-400 uppercase font-mono block">The Defense Paper Trail:</span>
            <p className="text-[11px] leading-relaxed">
              Use the VIALE Inventory Ledger to record the estimated original cost of every scooter, card, and jacket. When sold for less than original cost, export the 1099-K CSV report to substantiate zero capital gain.
            </p>
          </div>
        </div>

        {/* Core Law 4: Sunk Cost Elimination */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            Directive 4: Absolute Sunk Cost Discipline
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Disregard what was originally paid for an item. The market does not care. Sunk cost is zero. The only number that exists is today's real clearing price.
          </p>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
            <span className="font-bold text-emerald-400 uppercase font-mono block">The Fast-Cash Principle:</span>
            <p className="text-[11px] leading-relaxed">
              $400 cash in your hand today is worth infinitely more than $500 sitting in your hallway for 4 months while bills accumulate. Cash velocity creates momentum.
            </p>
          </div>
        </div>
      </div>

      {/* Full Prompt Display Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold uppercase text-slate-300">
            Raw Master Architecture Prompt Text (Copyable)
          </span>
          <span className="text-[11px] text-slate-500 font-mono">Compatible with any LLM session</span>
        </div>
        <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-[11px] text-slate-300 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-80 scrollbar-thin">
          {MASTER_PROMPT_TEXT}
        </pre>
      </div>
    </div>
  );
};
