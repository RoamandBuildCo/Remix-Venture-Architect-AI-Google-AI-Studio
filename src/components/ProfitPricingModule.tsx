import React, { useState } from 'react';
import {
  AppraisalDossier,
  ShopAssumptions,
  BusinessDecisionLabel,
} from '../types';
import { formatCurrency } from '../utils/storage';
import {
  DollarSign,
  TrendingUp,
  Percent,
  Clock,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface ProfitPricingModuleProps {
  items: AppraisalDossier[];
  shopAssumptions: ShopAssumptions;
  onSaveShopAssumptions: (assumptions: ShopAssumptions) => void;
  onNavigateToItem: (itemId: string) => void;
}

export const ProfitPricingModule: React.FC<ProfitPricingModuleProps> = ({
  items,
  shopAssumptions,
  onSaveShopAssumptions,
  onNavigateToItem,
}) => {
  const [assumptions, setAssumptions] = useState<ShopAssumptions>(shopAssumptions);
  const [showConfig, setShowConfig] = useState(false);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  // Live Deal Simulator State
  const [simPurchase, setSimPurchase] = useState('150');
  const [simPickup, setSimPickup] = useState('15');
  const [simParts, setSimParts] = useState('35');
  const [simLaborHours, setSimLaborHours] = useState('1.0');
  const [simListingPrice, setSimListingPrice] = useState('420');

  // Compute Simulator Numbers
  const simP = parseFloat(simPurchase) || 0;
  const simPick = parseFloat(simPickup) || 0;
  const simPart = parseFloat(simParts) || 0;
  const simHrs = parseFloat(simLaborHours) || 0;
  const simList = parseFloat(simListingPrice) || 0;

  const simLaborCost = simHrs * assumptions.shopLaborRatePerHour;
  const simMktFee = (simList * assumptions.marketplaceFeePercent) / 100;
  const simPayFee = (simList * assumptions.paymentProcessingPercent) / 100;
  const simReserve = (simList * assumptions.returnReservePercent) / 100;
  const simShippingMat = assumptions.shippingMaterialsEstimate;

  const simTotalInvested = simP + simPick + simPart + simShippingMat;
  const simTotalDeductions = simMktFee + simPayFee + simReserve;
  const simNetProceeds = simList - simTotalDeductions;
  const simGrossProfit = simNetProceeds - simTotalInvested;
  const simNetProfitAfterLabor = simGrossProfit - simLaborCost;
  const simMarginPercent = simList > 0 ? (simGrossProfit / simList) * 100 : 0;
  const simRoic = simTotalInvested > 0 ? (simGrossProfit / simTotalInvested) * 100 : 0;
  const simProfitPerHour = simHrs > 0 ? simGrossProfit / simHrs : simGrossProfit;

  // Decision logic for simulator
  let simDecision: BusinessDecisionLabel = 'BUY / PROCEED';
  if (simGrossProfit <= 0) {
    simDecision = 'AVOID / LIKELY UNPROFITABLE';
  } else if (simPart > simP * 1.5) {
    simDecision = 'PART OUT';
  } else if (simMarginPercent < assumptions.targetProfitMarginPercent || simProfitPerHour < assumptions.minAcceptableProfitPerLaborHour) {
    simDecision = 'BUY ONLY IF PRICE DROPS';
  } else if (simHrs === 0) {
    simDecision = 'LIST AS-IS';
  }

  const handleUpdateAssumptions = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveShopAssumptions(assumptions);
    setShowConfig(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-emerald-400" />
            <span>True Profitability & Pricing Architecture</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Accounting for shop labor, platform take-rates, return reserves, and capital velocity.
          </p>
        </div>

        <button
          onClick={() => setShowConfig(!showConfig)}
          className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Sliders className="w-3.5 h-3.5 text-amber-400" />
          <span>{showConfig ? 'Hide Shop Assumptions' : 'Edit Shop Assumptions'}</span>
        </button>
      </div>

      {/* Editable Shop Assumptions Panel */}
      {showConfig && (
        <form
          onSubmit={handleUpdateAssumptions}
          className="bg-slate-900 border border-amber-500/40 rounded-xl p-5 space-y-4 text-xs"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>Workshop Financial Assumptions & Overhead Rates</span>
            </h2>
            <span className="text-[11px] text-slate-400">
              Applied automatically across all deal valuations
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-slate-400 block mb-1">Shop Labor Rate ($/hr)</label>
              <input
                type="number"
                value={assumptions.shopLaborRatePerHour}
                onChange={(e) =>
                  setAssumptions({ ...assumptions, shopLaborRatePerHour: parseFloat(e.target.value) || 0 })
                }
                className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Marketplace Fee (%)</label>
              <input
                type="number"
                step="0.5"
                value={assumptions.marketplaceFeePercent}
                onChange={(e) =>
                  setAssumptions({ ...assumptions, marketplaceFeePercent: parseFloat(e.target.value) || 0 })
                }
                className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Payment Processing (%)</label>
              <input
                type="number"
                step="0.5"
                value={assumptions.paymentProcessingPercent}
                onChange={(e) =>
                  setAssumptions({ ...assumptions, paymentProcessingPercent: parseFloat(e.target.value) || 0 })
                }
                className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Return Reserve (%)</label>
              <input
                type="number"
                step="0.5"
                value={assumptions.returnReservePercent}
                onChange={(e) =>
                  setAssumptions({ ...assumptions, returnReservePercent: parseFloat(e.target.value) || 0 })
                }
                className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Shipping Materials ($)</label>
              <input
                type="number"
                value={assumptions.shippingMaterialsEstimate}
                onChange={(e) =>
                  setAssumptions({ ...assumptions, shippingMaterialsEstimate: parseFloat(e.target.value) || 0 })
                }
                className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Target Margin (%)</label>
              <input
                type="number"
                value={assumptions.targetProfitMarginPercent}
                onChange={(e) =>
                  setAssumptions({ ...assumptions, targetProfitMarginPercent: parseFloat(e.target.value) || 0 })
                }
                className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-emerald-400 font-mono"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Min Profit/Hour ($/hr)</label>
              <input
                type="number"
                value={assumptions.minAcceptableProfitPerLaborHour}
                onChange={(e) =>
                  setAssumptions({ ...assumptions, minAcceptableProfitPerLaborHour: parseFloat(e.target.value) || 0 })
                }
                className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-amber-300 font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowConfig(false)}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
            >
              Save Shop Defaults
            </button>
          </div>
        </form>
      )}

      {/* Live Deal Sourcing Simulator Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <span>Live Sourcing & Repair Profitability Simulator</span>
            </h2>
            <p className="text-xs text-slate-400">
              Test potential purchase lots before driving or handing over cash.
            </p>
          </div>

          <div
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border ${
              simDecision === 'BUY / PROCEED'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : simDecision === 'AVOID / LIKELY UNPROFITABLE'
                ? 'bg-red-500/20 text-red-300 border-red-500/40'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
            }`}
          >
            DECISION: {simDecision}
          </div>
        </div>

        {/* Simulator Inputs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          <div>
            <label className="text-slate-400 block mb-1">Purchase Price ($)</label>
            <input
              type="number"
              value={simPurchase}
              onChange={(e) => setSimPurchase(e.target.value)}
              className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Pickup / Delivery ($)</label>
            <input
              type="number"
              value={simPickup}
              onChange={(e) => setSimPickup(e.target.value)}
              className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Parts Needed ($)</label>
            <input
              type="number"
              value={simParts}
              onChange={(e) => setSimParts(e.target.value)}
              className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Bench Hours (hrs)</label>
            <input
              type="number"
              step="0.5"
              value={simLaborHours}
              onChange={(e) => setSimLaborHours(e.target.value)}
              className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Target Asking ($)</label>
            <input
              type="number"
              value={simListingPrice}
              onChange={(e) => setSimListingPrice(e.target.value)}
              className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-emerald-400 font-bold font-mono"
            />
          </div>
        </div>

        {/* Simulator Results Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 block text-[11px]">Expected Gross Profit</span>
            <span className={`text-xl font-bold font-mono ${simGrossProfit > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatCurrency(simGrossProfit)}
            </span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 block text-[11px]">Profit Margin</span>
            <span className="text-xl font-bold font-mono text-slate-100">
              {simMarginPercent.toFixed(1)}%
            </span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 block text-[11px]">Profit Per Labor Hour</span>
            <span className="text-xl font-bold font-mono text-amber-300">
              {formatCurrency(simProfitPerHour)}/hr
            </span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 block text-[11px]">Return on Capital (ROIC)</span>
            <span className="text-xl font-bold font-mono text-emerald-300">
              {simRoic.toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Detailed Expandable Formula Breakdown */}
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs space-y-1.5 font-mono text-slate-400">
          <div className="text-slate-300 font-bold mb-1">Transparent Cost Breakdown Formula:</div>
          <div className="flex justify-between">
            <span>Listing Sale Target:</span>
            <span className="text-slate-200">{formatCurrency(simList)}</span>
          </div>
          <div className="flex justify-between text-red-400/90">
            <span>- Total Cash Invested (Purchase ${simP} + Pickup ${simPick} + Parts ${simPart}):</span>
            <span>-{formatCurrency(simTotalInvested)}</span>
          </div>
          <div className="flex justify-between text-red-400/90">
            <span>- Estimated Fees & Reserve ({assumptions.marketplaceFeePercent}% mkt + {assumptions.paymentProcessingPercent}% proc + {assumptions.returnReservePercent}% rsv):</span>
            <span>-{formatCurrency(simTotalDeductions)}</span>
          </div>
          <div className="flex justify-between border-t border-slate-800 pt-1 text-emerald-400 font-bold">
            <span>= Net Realized Yield:</span>
            <span>{formatCurrency(simGrossProfit)}</span>
          </div>
        </div>
      </div>

      {/* Active Inventory Financial Matrix */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white flex items-center justify-between">
          <span>Active Inventory Yields & Margins ({items.length})</span>
          <span className="text-xs text-slate-400 font-normal">
            Click row to view expanded cost formula
          </span>
        </h2>

        <div className="space-y-3">
          {items.map((item) => {
            const purchase = item.financials.purchasePrice || item.costBasisEstimate || 0;
            const parts = item.financials.partsCostCommitted || 0;
            const asking = item.financials.fastCashPrice || 0;
            const gross = item.financials.expectedGrossProfit ?? (asking - purchase - parts);
            const margin = asking > 0 ? (gross / asking) * 100 : 0;
            const decision = item.financials.decisionLabel || (item.safetyHold ? 'AVOID / LIKELY UNPROFITABLE' : gross > 100 ? 'BUY / PROCEED' : 'LIST AS-IS');
            const isExpanded = expandedItemId === item.id;

            return (
              <div
                key={item.id}
                className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden"
              >
                <div
                  onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                  className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-800/40 transition-colors cursor-pointer"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-amber-400">
                        {item.id}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          decision === 'BUY / PROCEED'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : decision === 'AVOID / LIKELY UNPROFITABLE'
                            ? 'bg-red-500/20 text-red-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {decision}
                      </span>
                      {item.safetyHold && (
                        <span className="text-[10px] bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded font-bold">
                          HOLD
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-white mt-0.5">
                      {item.assetName}
                    </h3>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Basis</span>
                      <span className="text-slate-300">{formatCurrency(purchase + parts)}</span>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[10px]">Asking</span>
                      <span className="text-white font-semibold">{formatCurrency(asking)}</span>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[10px]">Gross Profit</span>
                      <span className={`font-bold ${gross > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                        {formatCurrency(gross)}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[10px]">Margin</span>
                      <span className="text-amber-300">{margin.toFixed(0)}%</span>
                    </div>

                    <div className="text-slate-500">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-4 bg-slate-950 border-t border-slate-800 text-xs space-y-2">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
                      <div className="p-2 bg-slate-900 rounded">
                        <span className="text-slate-500 block">Purchase:</span>
                        <span>{formatCurrency(purchase)}</span>
                      </div>
                      <div className="p-2 bg-slate-900 rounded">
                        <span className="text-slate-500 block">Parts:</span>
                        <span>{formatCurrency(parts)}</span>
                      </div>
                      <div className="p-2 bg-slate-900 rounded">
                        <span className="text-slate-500 block">Days in Stock:</span>
                        <span>{item.daysHeld || 0} days</span>
                      </div>
                      <div className="p-2 bg-slate-900 rounded">
                        <span className="text-slate-500 block">Route:</span>
                        <span>{item.financials.recommendedRoute || 'LOCAL_CASH_ONLY'}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <p className="text-[11px] text-slate-400">
                        {item.financials.routeJustification}
                      </p>
                      <button
                        onClick={() => onNavigateToItem(item.id)}
                        className="text-amber-400 hover:text-amber-300 text-xs font-semibold cursor-pointer"
                      >
                        Inspect Dossier &rarr;
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
