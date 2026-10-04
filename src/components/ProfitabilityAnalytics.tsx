import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis,
  ReferenceLine,
} from 'recharts';
import { AppraisalDossier } from '../types';
import { formatCurrency } from '../utils/storage';
import {
  TrendingUp,
  DollarSign,
  Percent,
  Layers,
  Sparkles,
  ArrowUpRight,
  ShieldAlert,
  SlidersHorizontal,
  BarChart3,
  ScatterChart as ScatterIcon,
} from 'lucide-react';

interface ProfitabilityAnalyticsProps {
  items: AppraisalDossier[];
  onNavigateTab: (tabId: string, filterOrItemId?: string) => void;
}

type ChartViewMode = 'ranking' | 'scatter';

export const ProfitabilityAnalytics: React.FC<ProfitabilityAnalyticsProps> = ({
  items,
  onNavigateTab,
}) => {
  const [viewMode, setChartViewMode] = useState<ChartViewMode>('ranking');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Compute analytics data for active resale inventory
  const analyticsData = useMemo(() => {
    return items
      .filter((i) => i.status !== 'Scrapped' && (categoryFilter === 'ALL' || i.itemType === categoryFilter || i.category === categoryFilter))
      .map((item) => {
        const purchase = item.financials.purchasePrice || item.costBasisEstimate || 0;
        const parts = item.financials.partsCostCommitted || 0;
        const investedCost = Math.max(1, purchase + parts);
        const askingPrice = item.financials.fastCashPrice || 0;
        const isHold = !!item.safetyHold || item.status === 'On hold';
        
        // Potential gross profit
        const potentialProfit = isHold
          ? 0
          : item.financials.expectedGrossProfit ?? Math.max(0, askingPrice - investedCost);

        // Potential ROI percentage
        const roi = isHold ? 0 : Math.round((potentialProfit / investedCost) * 100);

        // Gross Margin percentage
        const margin = askingPrice > 0 ? Math.round((potentialProfit / askingPrice) * 100) : 0;

        // Abbreviated label for chart axis
        const shortName = item.assetName.length > 18
          ? `${item.assetName.slice(0, 16)}...`
          : item.assetName;

        return {
          id: item.id,
          name: item.assetName,
          shortName,
          category: item.itemType || item.category,
          status: item.status,
          investedCost,
          purchase,
          parts,
          askingPrice,
          potentialProfit,
          roi,
          margin,
          isHold,
          daysHeld: item.daysHeld || 0,
        };
      })
      .sort((a, b) => b.roi - a.roi); // Rank highest ROI first
  }, [items, categoryFilter]);

  // Aggregate stats
  const totalInvested = analyticsData.reduce((acc, d) => acc + d.investedCost, 0);
  const totalPotentialProfit = analyticsData.reduce((acc, d) => acc + d.potentialProfit, 0);
  const avgRoi = totalInvested > 0 ? Math.round((totalPotentialProfit / totalInvested) * 100) : 0;
  const topRoiAsset = analyticsData.length > 0 && analyticsData[0].roi > 0 ? analyticsData[0] : null;

  // Custom Tooltip for Bar Chart
  const CustomBarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-950/95 border border-slate-700 p-3.5 rounded-xl shadow-2xl text-xs space-y-1.5 font-sans z-50 min-w-52">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 gap-2">
            <span className="font-bold text-white truncate max-w-44">{data.name}</span>
            <span className="text-[10px] font-mono text-amber-400 font-bold">{data.id}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] pt-1 font-mono">
            <span className="text-slate-400">Invested Basis:</span>
            <span className="text-slate-200 text-right">{formatCurrency(data.investedCost)}</span>

            <span className="text-slate-400">Target Asking:</span>
            <span className="text-slate-200 text-right">{formatCurrency(data.askingPrice)}</span>

            <span className="text-emerald-400 font-semibold">Potential Profit:</span>
            <span className="text-emerald-400 font-bold text-right">{formatCurrency(data.potentialProfit)}</span>

            <span className="text-amber-300 font-semibold">Potential ROI:</span>
            <span className="text-amber-300 font-bold text-right">{data.roi}%</span>

            <span className="text-slate-400">Gross Margin:</span>
            <span className="text-slate-300 text-right">{data.margin}%</span>
          </div>

          {data.isHold ? (
            <div className="mt-1 text-[10px] text-red-400 font-bold bg-red-950/50 p-1 rounded text-center">
              ⚠️ Under Safety Hold (ROI Locked)
            </div>
          ) : (
            <div className="mt-1 text-[10px] text-slate-500 text-center italic">
              Click to view asset in ledger
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip for Scatter Chart
  const CustomScatterTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-950/95 border border-slate-700 p-3.5 rounded-xl shadow-2xl text-xs space-y-1.5 font-sans z-50 min-w-52">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 gap-2">
            <span className="font-bold text-white truncate max-w-44">{data.name}</span>
            <span className="text-[10px] font-mono text-amber-400 font-bold">{data.id}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] pt-1 font-mono">
            <span className="text-slate-400">Invested Basis:</span>
            <span className="text-slate-200 text-right">{formatCurrency(data.investedCost)}</span>

            <span className="text-emerald-400 font-semibold">Potential Profit:</span>
            <span className="text-emerald-400 font-bold text-right">{formatCurrency(data.potentialProfit)}</span>

            <span className="text-amber-300 font-semibold">Potential ROI:</span>
            <span className="text-amber-300 font-bold text-right">{data.roi}%</span>

            <span className="text-slate-400">Margin:</span>
            <span className="text-slate-300 text-right">{data.margin}%</span>
          </div>
          
          <div className="mt-1 text-[10px] text-slate-500 text-center italic">
            Click node to inspect in ledger
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
      {/* Top Header & Interactive Mode Selectors */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              Profitability Analytics: Potential ROI vs. Inventory
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">
              MARGIN RANKING
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Identify high-velocity cash cows, evaluate capital efficiency, and spot low-margin commitments.
          </p>
        </div>

        {/* View Mode Controls & Category Filters */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="py-1.5 px-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="ALL">All Asset Types</option>
            <option value="electric_scooter">E-Scooters</option>
            <option value="ebike">E-Bikes</option>
            <option value="battery_pack">Batteries</option>
            <option value="collectibles">Collectibles</option>
          </select>

          <div className="flex items-center p-0.5 bg-slate-950 rounded-lg border border-slate-800">
            <button
              onClick={() => setChartViewMode('ranking')}
              title="Bar Chart: ROI & Margin Ranking"
              className={`p-1.5 rounded-md text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                viewMode === 'ranking'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden md:inline">Ranking</span>
            </button>
            <button
              onClick={() => setChartViewMode('scatter')}
              title="Scatter Plot: Capital Efficiency vs Return"
              className={`p-1.5 rounded-md text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                viewMode === 'scatter'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ScatterIcon className="w-4 h-4" />
              <span className="hidden md:inline">Efficiency</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Insight Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 font-medium block">Average Portfolio ROI</span>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5 tabular-nums">
            {avgRoi}%
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">Across active stock</span>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 font-medium block">Top Yield Performer</span>
          <div className="text-xl font-bold font-mono text-amber-300 mt-0.5 truncate">
            {topRoiAsset ? `${topRoiAsset.roi}% ROI` : 'N/A'}
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5 truncate">
            {topRoiAsset ? topRoiAsset.name : 'No items'}
          </span>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 font-medium block">Total Capital Deployed</span>
          <div className="text-xl font-bold font-mono text-slate-200 mt-0.5 tabular-nums">
            {formatCurrency(totalInvested)}
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">Acquisition + parts</span>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-emerald-500/20 text-xs bg-emerald-950/10">
          <span className="text-[11px] text-emerald-400 font-medium block">Unrealized Gross Upside</span>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5 tabular-nums">
            {formatCurrency(totalPotentialProfit)}
          </div>
          <span className="text-[10px] text-emerald-500/70 block mt-0.5">Projected net cash</span>
        </div>
      </div>

      {/* Main Recharts Visualization Area */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider">
            {viewMode === 'ranking'
              ? 'Asset Margin Breakdown (Invested Basis vs. Potential Profit)'
              : 'Capital Efficiency Matrix (Invested Basis X vs. Potential Profit Y)'}
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            {analyticsData.length} Assets Visualized
          </span>
        </div>

        <div className="h-72 w-full pt-2">
          {analyticsData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-500 text-xs">
              No inventory assets match the current category.
            </div>
          ) : viewMode === 'ranking' ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analyticsData}
                margin={{ top: 10, right: 10, left: -10, bottom: 45 }}
                onClick={(e: any) => {
                  if (e && e.activePayload && e.activePayload[0]) {
                    onNavigateTab('inventory', e.activePayload[0].payload.id);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="shortName"
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  angle={-25}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip content={<CustomBarTooltip />} />
                <Legend
                  verticalAlign="top"
                  height={32}
                  wrapperStyle={{ color: '#94a3b8', fontSize: '11px' }}
                />
                <Bar
                  dataKey="investedCost"
                  name="Invested Basis ($)"
                  fill="#475569"
                  radius={[3, 3, 0, 0]}
                  cursor="pointer"
                />
                <Bar
                  dataKey="potentialProfit"
                  name="Potential Profit ($)"
                  fill="#10b981"
                  radius={[3, 3, 0, 0]}
                  cursor="pointer"
                >
                  {analyticsData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.isHold
                          ? '#ef4444'
                          : entry.roi >= 120
                          ? '#10b981'
                          : entry.roi >= 50
                          ? '#f59e0b'
                          : '#38bdf8'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                margin={{ top: 10, right: 20, left: -10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  type="number"
                  dataKey="investedCost"
                  name="Invested Basis"
                  unit="$"
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  tickFormatter={(val) => `$${val}`}
                />
                <YAxis
                  type="number"
                  dataKey="potentialProfit"
                  name="Potential Profit"
                  unit="$"
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  tickFormatter={(val) => `$${val}`}
                />
                <ZAxis type="number" dataKey="roi" range={[70, 350]} name="ROI" unit="%" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomScatterTooltip />} />
                <ReferenceLine
                  y={200}
                  stroke="#334155"
                  strokeDasharray="4 4"
                  label={{ value: '$200 Target Profit', fill: '#64748b', fontSize: 10 }}
                />
                <Scatter
                  name="Inventory Units"
                  data={analyticsData}
                  cursor="pointer"
                  onClick={(data: any) => onNavigateTab('inventory', data.id)}
                >
                  {analyticsData.map((entry, index) => (
                    <Cell
                      key={`scatter-cell-${index}`}
                      fill={
                        entry.isHold
                          ? '#ef4444'
                          : entry.roi >= 120
                          ? '#10b981'
                          : entry.roi >= 50
                          ? '#f59e0b'
                          : '#38bdf8'
                      }
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Highest Margin Asset Quick Rank Table */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Highest Margin Opportunities (Ranked by Potential ROI)</span>
          </span>
          <button
            onClick={() => onNavigateTab('pricing')}
            className="text-amber-400 hover:text-amber-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>Open Pricing Calculator</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {analyticsData.slice(0, 3).map((item, idx) => (
            <div
              key={item.id}
              onClick={() => onNavigateTab('inventory', item.id)}
              className="bg-slate-950 p-3 rounded-xl border border-slate-800 hover:border-amber-500/50 transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-mono text-amber-400 font-bold">
                  #{idx + 1} · {item.id}
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  {item.roi}% ROI
                </span>
              </div>
              <div className="text-xs font-semibold text-slate-100 group-hover:text-amber-300 transition-colors truncate mt-1">
                {item.name}
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-2 border-t border-slate-800/80 pt-1.5">
                <span>Basis: {formatCurrency(item.investedCost)}</span>
                <span className="text-emerald-400 font-bold">
                  +{formatCurrency(item.potentialProfit)} Gross
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
