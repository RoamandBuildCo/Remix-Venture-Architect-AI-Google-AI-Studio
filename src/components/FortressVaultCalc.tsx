import React, { useState } from 'react';
import {
  Vault,
  Lock,
  TrendingUp,
  DollarSign,
  Package,
  Calendar,
  Sparkles,
  PieChart,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { AppraisalDossier } from '../types';
import { formatCurrency } from '../utils/storage';

interface FortressVaultCalcProps {
  items: AppraisalDossier[];
}

export const FortressVaultCalc: React.FC<FortressVaultCalcProps> = ({ items }) => {
  const totalRealizedCash = items
    .filter((i) => i.status === 'sold' && i.realizedSalePrice)
    .reduce((acc, curr) => acc + (curr.realizedSalePrice || 0), 0);

  // If user has zero realized sales yet, allow a baseline projection input
  const [customBankroll, setCustomBankroll] = useState<number>(totalRealizedCash || 2500);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(1500);
  const [expectedReturnPercent, setExpectedReturnPercent] = useState<number>(8); // 8% avg S&P index return

  // 50/40/10 Allocation
  const familyVault = customBankroll * 0.5;
  const workingCapital = customBankroll * 0.4;
  const suppliesReserve = customBankroll * 0.1;

  // Compounding trajectory function
  const calculateCompound = (years: number, starting: number, monthly: number, annualRate: number) => {
    const monthlyRate = annualRate / 100 / 12;
    const months = years * 12;
    let balance = starting;
    for (let m = 0; m < months; m++) {
      balance = balance * (1 + monthlyRate) + monthly;
    }
    return Math.round(balance);
  };

  const netWorthYear1 = calculateCompound(1, workingCapital, monthlyContribution, expectedReturnPercent);
  const netWorthYear5 = calculateCompound(5, workingCapital, monthlyContribution * 1.8, expectedReturnPercent);
  const netWorthYear10 = calculateCompound(10, workingCapital, monthlyContribution * 3.5, expectedReturnPercent);
  const netWorthYear15 = calculateCompound(15, workingCapital, monthlyContribution * 5, expectedReturnPercent);

  // 4% Safe Withdrawal Rule at Year 15
  const annualPassiveIncome = Math.round(netWorthYear15 * 0.04);
  const monthlyPassiveIncome = Math.round(annualPassiveIncome / 12);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                MODULE 5: CAPITAL FORTRESS
              </span>
              <span className="text-xs text-slate-400 font-mono">
                The 50/40/10 Split & 15-Year Compounding Engine
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight mt-1">
              Family Security Vault & Retirement Simulator
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl">
              Prevents the fatal cycle of going broke again. Enforces the strict mathematical separation
              between untouchable family survival cash and active inventory working capital.
            </p>
          </div>
        </div>
      </div>

      {/* The 50/40/10 Envelope Allocation Engine */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 block">
              The Fortress Money Allocation Model
            </span>
            <h2 className="text-lg font-black text-white mt-0.5">
              Three Non-Negotiable Physical Envelopes
            </h2>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="text-xs font-mono text-slate-400">Total Harvested Cash:</span>
            <input
              type="number"
              value={customBankroll}
              onChange={(e) => setCustomBankroll(Math.max(0, Number(e.target.value)))}
              className="w-28 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-emerald-400 font-mono font-bold text-sm focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Envelope A: Family Vault */}
          <div className="bg-gradient-to-b from-amber-500/10 to-slate-950 border border-amber-500/30 rounded-2xl p-5 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                ENVELOPE A (50%)
              </span>
              <Lock className="w-4 h-4 text-amber-400" />
            </div>

            <div>
              <span className="text-xs text-slate-400 font-mono">Family Safety Vault (Untouchable)</span>
              <div className="text-3xl font-black text-amber-300 mt-1">
                {formatCurrency(familyVault)}
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed border-t border-amber-500/20 pt-3">
              Direct deposit into checking account. Strictly reserved for family rent, groceries, medical, and emergency buffer.
              <strong> 100% UNTOUCHABLE</strong> for business speculation.
            </p>
          </div>

          {/* Envelope B: Working Capital */}
          <div className="bg-gradient-to-b from-indigo-500/10 to-slate-950 border border-indigo-500/30 rounded-2xl p-5 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                ENVELOPE B (40%)
              </span>
              <TrendingUp className="w-4 h-4 text-indigo-400" />
            </div>

            <div>
              <span className="text-xs text-slate-400 font-mono">Active Arbitrage Working Capital</span>
              <div className="text-3xl font-black text-indigo-300 mt-1">
                {formatCurrency(workingCapital)}
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed border-t border-indigo-500/20 pt-3">
              Dedicated seed cash to execute "The Rule of 3x". Used exclusively to purchase underpriced micro-mobility, collectibles, and cleanouts to flip for 200%+ profit.
            </p>
          </div>

          {/* Envelope C: Logistics & Taxes */}
          <div className="bg-gradient-to-b from-slate-800/40 to-slate-950 border border-slate-700 rounded-2xl p-5 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                ENVELOPE C (10%)
              </span>
              <Package className="w-4 h-4 text-slate-400" />
            </div>

            <div>
              <span className="text-xs text-slate-400 font-mono">Logistics, Supplies & Tax Reserve</span>
              <div className="text-3xl font-black text-slate-200 mt-1">
                {formatCurrency(suppliesReserve)}
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed border-t border-slate-800 pt-3">
              Funds physical tools: $18 digital shipping scale, counterfeit detection marker ($5), shipping tape, bubble mailers, and state LLC annual reports.
            </p>
          </div>
        </div>
      </div>

      {/* 15-Year Horizon & 4% Retirement Calculator */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 uppercase">
                THE TRINITY STUDY 4% RULE
              </span>
              <span className="text-xs text-slate-400 font-mono">Generational Wealth Model</span>
            </div>
            <h2 className="text-xl font-black text-white mt-1">
              15-Year Wealth Compounding & Retirement Projections
            </h2>
          </div>

          {/* Interactive Parameters */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 font-mono">Monthly Investment:</span>
              <input
                type="number"
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                className="w-20 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-emerald-400 font-bold font-mono focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 font-mono">Index Return (%):</span>
              <input
                type="number"
                value={expectedReturnPercent}
                onChange={(e) => setExpectedReturnPercent(Number(e.target.value))}
                className="w-14 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-sky-400 font-bold font-mono focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Four Major Milestone Projection Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Year 1 */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
            <span className="text-[10px] font-mono uppercase text-sky-400 block font-semibold">
              YEAR 1: ARBITRAGE RUN-RATE
            </span>
            <div className="text-2xl font-black text-white">
              {formatCurrency(netWorthYear1)}
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              $4,000–$7,000/mo net profit from 30–50 monthly flips. Single-member LLC operational.
            </p>
          </div>

          {/* Year 5 */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
            <span className="text-[10px] font-mono uppercase text-indigo-400 block font-semibold">
              YEAR 5: COMMERCIAL FLEX-HUB
            </span>
            <div className="text-2xl font-black text-white">
              {formatCurrency(netWorthYear5)}
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              1,200 sq ft warehouse, 1 part-time hire, first $100k+ in Solo 401(k) / Roth IRA index funds.
            </p>
          </div>

          {/* Year 10 */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
            <span className="text-[10px] font-mono uppercase text-purple-400 block font-semibold">
              YEAR 10: ASSET MACHINE
            </span>
            <div className="text-2xl font-black text-white">
              {formatCurrency(netWorthYear10)}
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Manager runs daily operations. $250k–$350k owner distributions, multi-unit real estate.
            </p>
          </div>

          {/* Year 15 Retirement */}
          <div className="bg-emerald-500/10 border border-emerald-500/40 rounded-xl p-4 space-y-2 relative overflow-hidden">
            <span className="text-[10px] font-mono uppercase text-emerald-400 block font-bold">
              YEAR 15+: PERMANENT RETIREMENT
            </span>
            <div className="text-2xl font-black text-emerald-300">
              {formatCurrency(netWorthYear15)}
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              100% debt-free family home. Work is optional. Family Living Trust established.
            </p>
          </div>
        </div>

        {/* 4% Rule Callout Box */}
        <div className="bg-slate-950 border border-emerald-500/30 rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono font-bold text-white uppercase">
                Perpetual Passive Cash Flow (The 4% Safe Withdrawal Rate)
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-xl">
              At a {formatCurrency(netWorthYear15)} diversified index portfolio, you safely withdraw 4% annually without touching principal, adjusted for inflation for life.
            </p>
          </div>

          <div className="text-right shrink-0">
            <span className="text-3xl font-black text-emerald-400 block">
              {formatCurrency(monthlyPassiveIncome)} <span className="text-sm font-normal text-slate-400">/ mo</span>
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              ({formatCurrency(annualPassiveIncome)} / year passive cashflow)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
