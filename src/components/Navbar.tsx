import React, { useState } from 'react';
import {
  LayoutDashboard,
  Layers,
  Wrench,
  Zap,
  Package,
  DollarSign,
  Tag,
  Search,
  Clock,
  QrCode,
  Plus,
  Compass,
  FileSpreadsheet,
  Moon,
  Sun,
  ShieldAlert,
  ChevronDown,
  Menu,
  X,
  FileQuestion,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';
import { AppraisalDossier } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  items: AppraisalDossier[];
  onOpenScanner?: () => void;
  onOpenIntake?: () => void;
  isLightMode?: boolean;
  onToggleTheme?: () => void;
  onResetEngine?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  items,
  onOpenScanner,
  onOpenIntake,
  isLightMode,
  onToggleTheme,
  onResetEngine,
}) => {
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const safetyHoldsCount = items.filter(
    (i) => i.safetyHold || i.batteryRecord?.safetyHold || i.status === 'On hold'
  ).length;

  const primaryTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory', icon: Layers, badgeCount: items.length },
    { id: 'intake', label: 'Intake & Diag', icon: Plus },
    {
      id: 'battery',
      label: 'Battery Safety',
      icon: Zap,
      hasSafetyAlert: safetyHoldsCount > 0,
    },
    { id: 'repairs', label: 'Repair Jobs', icon: Wrench },
    { id: 'parts', label: 'Parts Stock', icon: Package },
    { id: 'pricing', label: 'Profit & Pricing', icon: DollarSign },
    { id: 'listings', label: 'Listing Drafts', icon: Tag },
    { id: 'research', label: 'Research', icon: Search },
    { id: 'daily', label: 'Daily Ops', icon: Clock },
  ];

  const secondaryTabs = [
    { id: 'workspace', label: 'Google Sheets & Tasks', icon: FileSpreadsheet },
    { id: 'photoguides', label: 'Visual Photo Guides', icon: Compass },
    { id: 'promptengine', label: 'AI Missing Photo Prompts', icon: FileQuestion },
  ];

  return (
    <>
      {/* Desktop & Tablet Top Navigation */}
      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 text-slate-100">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Zone 1: Single element brand mark */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="text-left cursor-pointer group"
            >
              <div className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
                <span className="group-hover:text-amber-400 transition-colors">
                  ShutterBuck
                </span>
              </div>
            </button>

            {safetyHoldsCount > 0 && (
              <button
                onClick={() => setActiveTab('battery')}
                className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40 text-[11px] font-mono font-bold cursor-pointer animate-pulse"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>{safetyHoldsCount} SAFETY HOLD</span>
              </button>
            )}
          </div>

          {/* Zone 2: Navigation Links (Desktop) */}
          <nav className="hidden xl:flex items-center gap-1">
            {primaryTabs.slice(0, 7).map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/40'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.hasSafetyAlert && (
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                  )}
                </button>
              );
            })}

            {/* More Dropdown for additional modules */}
            <div className="relative">
              <button
                onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                  isMoreMenuOpen ||
                  ['listings', 'research', 'daily', 'workspace', 'photoguides', 'promptengine'].includes(activeTab)
                    ? 'text-amber-400 bg-slate-900'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>More</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {isMoreMenuOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1.5 z-50 text-xs"
                  onClick={() => setIsMoreMenuOpen(false)}
                >
                  {primaryTabs.slice(7).map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-2 px-3.5 py-2 text-left hover:bg-slate-800 cursor-pointer ${
                          activeTab === tab.id ? 'text-amber-400 font-bold' : 'text-slate-300'
                        }`}
                      >
                        <Icon className="w-4 h-4 text-slate-400" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                  <div className="border-t border-slate-800 my-1" />
                  {secondaryTabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-2 px-3.5 py-2 text-left hover:bg-slate-800 cursor-pointer ${
                          activeTab === tab.id ? 'text-amber-400 font-bold' : 'text-slate-300'
                        }`}
                      >
                        <Icon className="w-4 h-4 text-slate-400" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-2">
            {onResetEngine && (
              <button
                onClick={() => setShowResetConfirm(true)}
                title="Reset Engine: Wipe all past appraisals, clear localStorage, and return to blank state"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 hover:border-rose-700 text-xs font-semibold cursor-pointer transition-all shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5 stroke-[2.2]" />
                <span className="hidden sm:inline">Reset Engine</span>
              </button>
            )}

            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                title="Toggle Light / Dark Workshop Mode"
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 cursor-pointer"
              >
                {isLightMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>
            )}

            {onOpenScanner && (
              <button
                onClick={onOpenScanner}
                title="Scan QR Asset Tag"
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 cursor-pointer"
              >
                <QrCode className="w-4 h-4 text-amber-400" />
              </button>
            )}

            {onOpenIntake && (
              <button
                onClick={onOpenIntake}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow-sm"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>+ Intake</span>
              </button>
            )}
          </div>
        </div>

        {/* Secondary Tablet Scroll Row (md to xl) */}
        <div className="hidden md:flex xl:hidden overflow-x-auto px-4 py-2 border-t border-slate-800/80 gap-1 scrollbar-none">
          {primaryTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
          {secondaryTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Mobile Bottom Navigation Dock (Variation 5 Ergonomics - 1-hand thumb reach) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 text-slate-300 px-2 py-2 flex items-center justify-around shadow-2xl safe-area-pb">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
            activeTab === 'dashboard' ? 'text-amber-400 font-bold' : 'text-slate-400'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Home</span>
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors cursor-pointer relative ${
            activeTab === 'inventory' ? 'text-amber-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Layers className="w-5 h-5" />
          <span>Inventory</span>
        </button>

        <button
          onClick={() => {
            if (onOpenIntake) onOpenIntake();
            else setActiveTab('intake');
          }}
          className="flex flex-col items-center justify-center w-12 h-12 -mt-5 rounded-full bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 font-bold cursor-pointer active:scale-95 transition-transform"
        >
          <Plus className="w-6 h-6 stroke-[3]" />
        </button>

        <button
          onClick={() => setActiveTab('battery')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors cursor-pointer relative ${
            activeTab === 'battery' ? 'text-amber-400 font-bold' : 'text-slate-400'
          }`}
        >
          <div className="relative">
            <Zap className="w-5 h-5" />
            {safetyHoldsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            )}
          </div>
          <span>Battery</span>
        </button>

        <button
          onClick={() => setIsMoreMenuOpen(true)}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
            ['repairs', 'parts', 'pricing', 'listings', 'research', 'daily', 'workspace'].includes(activeTab)
              ? 'text-amber-400 font-bold'
              : 'text-slate-400'
          }`}
        >
          <Menu className="w-5 h-5" />
          <span>Modules</span>
        </button>
      </nav>

      {/* Mobile More Modules Sheet / Drawer */}
      {isMoreMenuOpen && (
        <div className="md:hidden fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex flex-col justify-end">
          <div className="bg-slate-900 border-t border-slate-800 rounded-t-2xl p-5 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                All Command Modules
              </span>
              <button
                onClick={() => setIsMoreMenuOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {primaryTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsMoreMenuOpen(false);
                    }}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 ${
                      isActive
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-slate-950 text-slate-200 border-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="truncate">{tab.label}</span>
                  </button>
                );
              })}
              {secondaryTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsMoreMenuOpen(false);
                    }}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 ${
                      isActive
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-slate-950 text-slate-200 border-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-sky-400 shrink-0" />
                    <span className="truncate">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {onResetEngine && (
              <div className="pt-2 border-t border-slate-800">
                <button
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    setShowResetConfirm(true);
                  }}
                  className="w-full p-3 rounded-xl border border-rose-800/60 bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 flex items-center justify-center gap-2 text-xs font-bold transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset Engine (Wipe All Appraisals)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reset Engine Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/30">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Reset ShutterBuck Engine?</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  This will execute <code className="text-rose-300 font-mono">localStorage.clear()</code>, wipe all past appraisals, repair records, parts, and return the application to an absolute blank state.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowResetConfirm(false);
                  if (onResetEngine) onResetEngine();
                }}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-lg shadow-rose-900/40"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Confirm Reset Engine</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
