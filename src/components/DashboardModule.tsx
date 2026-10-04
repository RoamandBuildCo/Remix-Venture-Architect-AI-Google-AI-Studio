import React from 'react';
import {
  AppraisalDossier,
  RepairJob,
  PartItem,
  DailyTaskItem,
} from '../types';
import { formatCurrency } from '../utils/storage';
import { ProfitabilityAnalytics } from './ProfitabilityAnalytics';
import {
  ShieldAlert,
  Wrench,
  Package,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Clock,
  DollarSign,
  Plus,
  QrCode,
  Tag,
  CheckCircle2,
  Sparkles,
  Zap,
} from 'lucide-react';

interface DashboardModuleProps {
  items: AppraisalDossier[];
  repairJobs: RepairJob[];
  parts: PartItem[];
  dailyTasks: DailyTaskItem[];
  onNavigateTab: (tabId: string, filterOrItemId?: string) => void;
  onOpenIntake: () => void;
  onOpenScanner: () => void;
}

export const DashboardModule: React.FC<DashboardModuleProps> = ({
  items,
  repairJobs,
  parts,
  dailyTasks,
  onNavigateTab,
  onOpenIntake,
  onOpenScanner,
}) => {
  // Aggregate Metrics
  const totalCount = items.length;
  const activeResaleItems = items.filter((i) => i.status !== 'Sold' && i.status !== 'Scrapped');
  
  const acquisitionCost = activeResaleItems.reduce(
    (sum, i) => sum + (i.financials.purchasePrice || i.costBasisEstimate || 0),
    0
  );
  
  const partsCommitted = activeResaleItems.reduce(
    (sum, i) => sum + (i.financials.partsCostCommitted || 0),
    0
  );

  const expectedResaleValue = activeResaleItems.reduce(
    (sum, i) => sum + (i.financials.fastCashPrice || 0),
    0
  );

  const potentialGrossProfit = activeResaleItems.reduce((sum, i) => {
    const purchase = i.financials.purchasePrice || i.costBasisEstimate || 0;
    const partsVal = i.financials.partsCostCommitted || 0;
    const asking = i.financials.fastCashPrice || 0;
    const profit = i.financials.expectedGrossProfit ?? Math.max(0, asking - purchase - partsVal);
    return sum + (i.safetyHold ? 0 : profit);
  }, 0);

  const realizedProfit = items
    .filter((i) => i.status === 'Sold' && i.realizedSalePrice)
    .reduce((sum, i) => {
      const sold = i.realizedSalePrice || 0;
      const cost = (i.financials.purchasePrice || i.costBasisEstimate || 0) + (i.financials.partsCostCommitted || 0);
      return sum + (sold - cost);
    }, 0);

  // Operational Bottlenecks
  const itemsNeedingDiagnosis = items.filter(
    (i) => i.status === 'Needs diagnosis' || i.status === 'Awaiting intake'
  );

  const jobsWaitingOnParts = repairJobs.filter(
    (j) => j.status === 'Awaiting parts'
  );

  const vehiclesReadyToList = items.filter(
    (i) => i.status === 'Ready to list' || i.status === 'Ready to photograph'
  );

  const listingsSittingTooLong = items.filter(
    (i) => i.status === 'Listed' && (i.daysHeld || 0) >= 5
  );

  const lowStockParts = parts.filter(
    (p) => p.quantityOnHand <= p.reorderPoint
  );

  const safetyHolds = items.filter(
    (i) => i.safetyHold || i.batteryRecord?.safetyHold || i.status === 'On hold'
  );

  // Next Best Actions prioritization algorithm
  // Score formula: Safety (1000) > Fast Listing/Cash (500) > Blocked Unlock (300) > Days in Inv (>5 days = +100)
  interface PrioritizedAction {
    id: string;
    title: string;
    subtitle: string;
    urgency: 'CRITICAL_SAFETY' | 'FAST_CASH' | 'BENCH_UNBLOCK' | 'AGING_ALERT';
    urgencyLabel: string;
    actionLabel: string;
    onClick: () => void;
    metricTag?: string;
  }

  const generatedActions: PrioritizedAction[] = [];

  // 1. Safety holds take top priority
  safetyHolds.forEach((holdItem) => {
    generatedActions.push({
      id: `act-safety-${holdItem.id}`,
      title: `Safety Quarantine: ${holdItem.assetName}`,
      subtitle: holdItem.safetyHoldReason || 'High-risk lithium battery or frame failure detected. Locked from resale.',
      urgency: 'CRITICAL_SAFETY',
      urgencyLabel: 'SAFETY HOLD',
      actionLabel: 'Inspect Battery Bunker',
      onClick: () => onNavigateTab('battery', holdItem.id),
      metricTag: 'Zero-Tolerance Safety Protocol',
    });
  });

  // 2. Vehicles ready to list (fast immediate cash generation)
  vehiclesReadyToList.forEach((readyItem) => {
    const profit = (readyItem.financials.fastCashPrice || 0) -
      (readyItem.financials.purchasePrice || readyItem.costBasisEstimate || 0) -
      (readyItem.financials.partsCostCommitted || 0);

    generatedActions.push({
      id: `act-ready-${readyItem.id}`,
      title: `Publish Marketplace Listing: ${readyItem.assetName}`,
      subtitle: `Tested & verified. Staged at ${readyItem.storageLocation || 'Shop'}.`,
      urgency: 'FAST_CASH',
      urgencyLabel: 'READY TO CASH OUT',
      actionLabel: 'Generate Listing Draft',
      onClick: () => onNavigateTab('listings', readyItem.id),
      metricTag: `+$${profit} gross profit waiting`,
    });
  });

  // 3. Stalled repairs waiting on parts
  jobsWaitingOnParts.forEach((job) => {
    generatedActions.push({
      id: `act-job-${job.id}`,
      title: `Parts Bottleneck: ${job.vehicleTitle}`,
      subtitle: `Waiting on: ${job.partsRequired.join(', ') || 'parts delivery'}`,
      urgency: 'BENCH_UNBLOCK',
      urgencyLabel: 'BLOCKED WORK',
      actionLabel: 'Check Bin Inventory',
      onClick: () => onNavigateTab('repairs', job.id),
      metricTag: `${job.laborEstimateHours}h bench time`,
    });
  });

  // 4. Aging inventory listings
  listingsSittingTooLong.forEach((agedItem) => {
    generatedActions.push({
      id: `act-aged-${agedItem.id}`,
      title: `Price Drop Review: ${agedItem.assetName}`,
      subtitle: `Listed for ${agedItem.daysHeld} days at $${agedItem.financials.fastCashPrice}. Review inquiries or adjust price.`,
      urgency: 'AGING_ALERT',
      urgencyLabel: 'AGING INVENTORY',
      actionLabel: 'Review Pricing & Comps',
      onClick: () => onNavigateTab('pricing', agedItem.id),
      metricTag: `${agedItem.daysHeld} days in stock`,
    });
  });

  return (
    <div className="space-y-6">
      {/* Top Banner: Quick Intake & Action Dock */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              ShutterBuck
            </h1>
            <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-medium">
              LOS ANGELES
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Forensic repair, battery safety quarantine, parts stock, and profit engine.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={onOpenIntake}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Vehicle Intake</span>
          </button>
          
          <button
            onClick={onOpenScanner}
            className="px-3.5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Scan QR Tag</span>
          </button>
        </div>
      </div>

      {/* Safety Alert Banner (Only if safety holds active) */}
      {safetyHolds.length > 0 && (
        <div className="bg-red-950/40 border-2 border-red-500/60 rounded-xl p-4 text-red-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-red-500/20 text-red-400 shrink-0 mt-0.5 sm:mt-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-red-300 flex items-center gap-2">
                <span>CRITICAL SAFETY HOLD ACTIVE ({safetyHolds.length} ITEM{safetyHolds.length > 1 ? 'S' : ''})</span>
              </div>
              <p className="text-xs text-red-300/80 mt-0.5">
                Swollen pouch cells or severe physical/wiring damage identified. Sale locked and quarantine enforced.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('battery')}
            className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <span>View Battery Safety Bunker</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Financial Health & Capital Status Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <span className="text-xs text-slate-400 font-medium">Total Inventory</span>
          <div className="mt-1 text-2xl font-bold font-mono text-white tabular-nums">
            {totalCount}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            {activeResaleItems.length} active units in shop
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <span className="text-xs text-slate-400 font-medium">Acquisition Cost</span>
          <div className="mt-1 text-2xl font-bold font-mono text-slate-200 tabular-nums">
            {formatCurrency(acquisitionCost)}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            Cash tied in frames
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <span className="text-xs text-slate-400 font-medium">Parts Committed</span>
          <div className="mt-1 text-2xl font-bold font-mono text-amber-300 tabular-nums">
            {formatCurrency(partsCommitted)}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            Installed & reserved
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <span className="text-xs text-slate-400 font-medium">Resale Value</span>
          <div className="mt-1 text-2xl font-bold font-mono text-slate-100 tabular-nums">
            {formatCurrency(expectedResaleValue)}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            Local cash target
          </span>
        </div>

        <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-3.5 bg-emerald-950/10">
          <span className="text-xs text-emerald-400 font-medium">Potential Gross Profit</span>
          <div className="mt-1 text-2xl font-bold font-mono text-emerald-400 tabular-nums">
            {formatCurrency(potentialGrossProfit)}
          </div>
          <span className="text-[11px] text-emerald-500/80 mt-0.5 block">
            Unrealized upside
          </span>
        </div>

        <div className="bg-slate-900 border border-emerald-500/20 rounded-xl p-3.5">
          <span className="text-xs text-slate-400 font-medium">Realized Profit</span>
          <div className="mt-1 text-2xl font-bold font-mono text-emerald-300 tabular-nums">
            {formatCurrency(realizedProfit)}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            Closed sales
          </span>
        </div>
      </div>

      {/* Operational Bottlenecks Ticker Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => onNavigateTab('inventory', 'Needs diagnosis')}
          className="text-left bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 p-3.5 rounded-xl transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Needs Diagnosis</span>
            <span className={`font-mono text-sm font-bold px-2 py-0.5 rounded ${
              itemsNeedingDiagnosis.length > 0 ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'
            }`}>
              {itemsNeedingDiagnosis.length}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 flex items-center justify-between">
            <span>Awaiting bench testing</span>
            <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-amber-400 transition-colors" />
          </p>
        </button>

        <button
          onClick={() => onNavigateTab('repairs', 'Awaiting parts')}
          className="text-left bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 p-3.5 rounded-xl transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Waiting on Parts</span>
            <span className={`font-mono text-sm font-bold px-2 py-0.5 rounded ${
              jobsWaitingOnParts.length > 0 ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-400'
            }`}>
              {jobsWaitingOnParts.length}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 flex items-center justify-between">
            <span>Blocked repair work</span>
            <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-amber-400 transition-colors" />
          </p>
        </button>

        <button
          onClick={() => onNavigateTab('inventory', 'Ready to list')}
          className="text-left bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 p-3.5 rounded-xl transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Ready to List</span>
            <span className={`font-mono text-sm font-bold px-2 py-0.5 rounded ${
              vehiclesReadyToList.length > 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
            }`}>
              {vehiclesReadyToList.length}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 flex items-center justify-between">
            <span>Ready for photos & ads</span>
            <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-emerald-400 transition-colors" />
          </p>
        </button>

        <button
          onClick={() => onNavigateTab('parts')}
          className="text-left bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 p-3.5 rounded-xl transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Low Stock Parts</span>
            <span className={`font-mono text-sm font-bold px-2 py-0.5 rounded ${
              lowStockParts.length > 0 ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'
            }`}>
              {lowStockParts.length}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 flex items-center justify-between">
            <span>At or below reorder</span>
            <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-amber-400 transition-colors" />
          </p>
        </button>
      </div>

      {/* Profitability Analytics Visualization */}
      <ProfitabilityAnalytics
        items={items}
        onNavigateTab={onNavigateTab}
      />

      {/* Main Two-Column Operations Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Next Best Actions Engine */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Next Best Actions (Priority Order)</span>
              </h2>
              <p className="text-xs text-slate-400">
                Ranked by safety urgency, capital velocity, and profit per hour.
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {generatedActions.length} Actions Queued
            </span>
          </div>

          <div className="space-y-2.5">
            {generatedActions.length === 0 ? (
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm font-medium">All shop priority bottlenecks are clear!</p>
                <p className="text-xs text-slate-500 mt-1">
                  Intake new donor vehicles or execute proactive parts sourcing.
                </p>
              </div>
            ) : (
              generatedActions.slice(0, 5).map((act) => (
                <div
                  key={act.id}
                  className={`border rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors ${
                    act.urgency === 'CRITICAL_SAFETY'
                      ? 'bg-red-950/30 border-red-500/40 hover:border-red-500'
                      : act.urgency === 'FAST_CASH'
                      ? 'bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-500/50'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          act.urgency === 'CRITICAL_SAFETY'
                            ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                            : act.urgency === 'FAST_CASH'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {act.urgencyLabel}
                      </span>
                      {act.metricTag && (
                        <span className="text-[11px] text-slate-400 font-mono">
                          {act.metricTag}
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-semibold text-slate-200">
                      {act.title}
                    </div>
                    <p className="text-xs text-slate-400">
                      {act.subtitle}
                    </p>
                  </div>

                  <button
                    onClick={act.onClick}
                    className="w-full sm:w-auto px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs flex items-center justify-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                  >
                    <span>{act.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Today's Priorities & Quick Workshop Status */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Today's Daily Plan</span>
            </h2>
            <button
              onClick={() => onNavigateTab('daily')}
              className="text-xs text-amber-400 hover:text-amber-300 font-medium"
            >
              Open Operations Matrix &rarr;
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            {dailyTasks.slice(0, 4).map((task) => (
              <div
                key={task.id}
                className="flex items-start gap-2.5 pb-2.5 border-b border-slate-800/80 last:border-none last:pb-0"
              >
                <div
                  className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                    task.priorityMatrix === 'do_first'
                      ? 'bg-rose-500'
                      : task.priorityMatrix === 'do_next'
                      ? 'bg-amber-400'
                      : 'bg-slate-500'
                  }`}
                />
                <div className="flex-1">
                  <div className="text-xs font-medium text-slate-200">
                    {task.title}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                    <span>{task.estimatedMinutes} min</span>
                    {task.potentialProfit && (
                      <>
                        <span>·</span>
                        <span className="text-emerald-400 font-mono">
                          +${task.potentialProfit} Profit
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Module Shortcuts */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2">
            <span className="text-xs font-medium text-slate-400 block mb-2">
              Workshop Fast Tracks
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => onNavigateTab('battery')}
                className="p-2.5 rounded-lg bg-slate-800/70 hover:bg-slate-800 text-slate-300 flex items-center gap-2 transition-colors cursor-pointer text-left"
              >
                <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Battery Safety Center</span>
              </button>
              <button
                onClick={() => onNavigateTab('repairs')}
                className="p-2.5 rounded-lg bg-slate-800/70 hover:bg-slate-800 text-slate-300 flex items-center gap-2 transition-colors cursor-pointer text-left"
              >
                <Wrench className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Work Orders & QC</span>
              </button>
              <button
                onClick={() => onNavigateTab('pricing')}
                className="p-2.5 rounded-lg bg-slate-800/70 hover:bg-slate-800 text-slate-300 flex items-center gap-2 transition-colors cursor-pointer text-left"
              >
                <DollarSign className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Profit Calculator</span>
              </button>
              <button
                onClick={() => onNavigateTab('research')}
                className="p-2.5 rounded-lg bg-slate-800/70 hover:bg-slate-800 text-slate-300 flex items-center gap-2 transition-colors cursor-pointer text-left"
              >
                <Tag className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Comps & Sourcing</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
