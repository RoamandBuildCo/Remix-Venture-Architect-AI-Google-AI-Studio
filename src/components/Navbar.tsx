import React from 'react';
import {
  Camera,
  Layers,
  CheckSquare,
  ShieldAlert,
  Vault,
  BookOpen,
  DollarSign,
  TrendingUp,
  Lock,
  Cpu,
  ScanLine,
  QrCode,
  FileSpreadsheet,
  Compass,
  FileQuestion,
  Cloud,
  Bot,
  Mic,
  Globe
} from 'lucide-react';
import { AppraisalDossier } from '../types';
import { formatCurrency } from '../utils/storage';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  items: AppraisalDossier[];
  onOpenScanner?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, items, onOpenScanner }) => {
  // Compute financial totals
  const totalRealizedCash = items
    .filter((i) => i.status === 'sold' && i.realizedSalePrice)
    .reduce((acc, curr) => acc + (curr.realizedSalePrice || 0), 0);

  const totalActiveValue = items
    .filter((i) => i.status !== 'sold' && i.status !== 'archived')
    .reduce((acc, curr) => acc + (curr.financials.fastCashPrice || 0), 0);

  const familySafetyVault = totalRealizedCash * 0.5;
  const workingArbitrage = totalRealizedCash * 0.4;

  const tabs = [
    { id: 'appraiser', label: 'VIALE Appraiser', icon: Camera, badge: 'AI Vision' },
    { id: 'chat', label: 'Gemini Chatbot', icon: Bot, badge: '3-Tier Models' },
    { id: 'voice', label: 'Voice Dispatch', icon: Mic, badge: '3.8 Live' },
    { id: 'grounding', label: 'Search & Maps', icon: Globe, badge: 'Grounded' },
    { id: 'ledger', label: 'Inventory Ledger', icon: Layers, count: items.length },
    { id: 'photoguides', label: 'Photo Guides', icon: Compass, badge: 'Angles' },
    { id: 'promptengine', label: 'Missing Prompts', icon: FileQuestion, badge: 'Template' },
    { id: 'workspace', label: 'Sheets & Tasks', icon: FileSpreadsheet, badge: 'Cloud Sync' },
    { id: 'execution', label: 'Task Execution', icon: CheckSquare, badge: 'WIP=1' },
    { id: 'antiscam', label: 'Anti-Scam & Scripts', icon: ShieldAlert },
    { id: 'vault', label: 'Fortress Vault', icon: Vault },
    { id: 'directives', label: 'Overseer SOPs', icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 text-slate-100">
      {/* Top Cockpit Ticker Bar */}
      <div className="border-b border-slate-800/80 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3 bg-slate-900/60">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono tracking-wider font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            SYSTEM ACTIVE
          </div>
          <span className="text-slate-400 font-mono hidden sm:inline">
            OVERSEER ENGINE // ZERO GUESSWORK
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5" title="Fast Cash Valuation of Unsold Inventory">
            <span className="text-slate-400">Inventory Liquidity:</span>
            <span className="text-sky-400 font-bold">{formatCurrency(totalActiveValue)}</span>
          </div>

          <div className="flex items-center gap-1.5" title="Physical Cash Harvested & Realized">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">Cash Realized:</span>
            <span className="text-emerald-400 font-bold">{formatCurrency(totalRealizedCash)}</span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300" title="50% Family Safety Vault (Untouchable Survival Cash)">
            <Lock className="w-3 h-3 text-amber-400" />
            <span>Family Vault (50%):</span>
            <span className="font-bold">{formatCurrency(familySafetyVault)}</span>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300" title="40% Active Working Capital Arbitrage">
            <TrendingUp className="w-3 h-3 text-indigo-400" />
            <span>Arbitrage Fund (40%):</span>
            <span className="font-bold">{formatCurrency(workingArbitrage)}</span>
          </div>
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-600 to-rose-600 p-0.5 shadow-lg shadow-orange-950/40">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Cpu className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">
                PHOENIX VIALE
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-slate-800 text-slate-300 border border-slate-700">
                2026 FORENSIC V3
              </span>
            </div>
            <p className="text-[11px] text-slate-400 tracking-wide">
              Visual Inventory Appraisal & Strategic Startup Execution Engine
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <nav className="flex items-center gap-1 overflow-x-auto max-w-full pb-1 md:pb-0 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/40 shadow-sm shadow-amber-950/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isActive ? 'bg-amber-400/20 text-amber-300' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {tab.count}
                  </span>
                )}
                {tab.badge && (
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}

          {onOpenScanner && (
            <button
              onClick={onOpenScanner}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all whitespace-nowrap cursor-pointer shadow-md shadow-amber-950/30 ml-1"
              title="Scan physical QR tag with device camera"
            >
              <ScanLine className="w-3.5 h-3.5" />
              <span>Scan Tag</span>
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};
