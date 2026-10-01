import React, { useState } from 'react';
import {
  Layers,
  Filter,
  Download,
  Plus,
  CheckCircle,
  Eye,
  Trash2,
  DollarSign,
  TrendingUp,
  FileSpreadsheet,
  Copy,
  Check,
  AlertCircle,
  X,
  ExternalLink,
  ShieldCheck,
  QrCode,
  ScanLine,
  ArrowUpDown,
  Tag
} from 'lucide-react';
import { AppraisalDossier, ItemCategory, ItemStatus } from '../types';
import { formatCurrency, exportLedgerToCsv } from '../utils/storage';
import { QrTagModal } from './QrTagModal';

interface InventoryLedgerProps {
  items: AppraisalDossier[];
  onUpdateItem: (item: AppraisalDossier) => void;
  onDeleteItem: (id: string) => void;
  onAddNewManualItem: (item: AppraisalDossier) => void;
  onSwitchToAppraiser: () => void;
  onOpenScanner?: () => void;
  onOpenWorkspace?: () => void;
  highlightItemId?: string | null;
}

export const InventoryLedger: React.FC<InventoryLedgerProps> = ({
  items,
  onUpdateItem,
  onDeleteItem,
  onAddNewManualItem,
  onSwitchToAppraiser,
  onOpenScanner,
  onOpenWorkspace,
  highlightItemId,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date' | 'price-desc' | 'price-asc' | 'str'>('date');
  const [inspectItem, setInspectItem] = useState<AppraisalDossier | null>(null);

  // QR Modal State
  const [qrModalItem, setQrModalItem] = useState<AppraisalDossier | null>(null);

  // Sold modal state
  const [soldModalItem, setSoldModalItem] = useState<AppraisalDossier | null>(null);
  const [soldPriceInput, setSoldPriceInput] = useState<string>('');
  const [soldPlatformInput, setSoldPlatformInput] = useState<string>('Local Cash (Safe Zone)');

  // Manual Add Modal
  const [showManualAdd, setShowManualAdd] = useState<boolean>(false);
  const [manualName, setManualName] = useState<string>('');
  const [manualCategory, setManualCategory] = useState<ItemCategory>('mobility');
  const [manualFastCash, setManualFastCash] = useState<string>('');
  const [manualCostBasis, setManualCostBasis] = useState<string>('');
  const [manualNotes, setManualNotes] = useState<string>('');

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Filter and sort items
  const filteredItems = items
    .filter((item) => {
      const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
      const matchesSearch =
        searchQuery === '' ||
        item.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.identification.manufacturer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'price-desc') {
        return b.financials.fastCashPrice - a.financials.fastCashPrice;
      }
      if (sortBy === 'price-asc') {
        return a.financials.fastCashPrice - b.financials.fastCashPrice;
      }
      if (sortBy === 'str') {
        return b.financials.sellThroughRatePercent - a.financials.sellThroughRatePercent;
      }
      // date desc
      return new Date(b.dateLogged).getTime() - new Date(a.dateLogged).getTime();
    });

  // Calculate totals
  const totalItems = items.length;
  const soldItems = items.filter((i) => i.status === 'sold');
  const totalRealizedCash = soldItems.reduce((acc, curr) => acc + (curr.realizedSalePrice || 0), 0);
  const unsoldItems = items.filter((i) => i.status !== 'sold' && i.status !== 'archived');
  const totalUnsoldLiquidity = unsoldItems.reduce((acc, curr) => acc + curr.financials.fastCashPrice, 0);

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleOpenSoldModal = (item: AppraisalDossier) => {
    setSoldModalItem(item);
    setSoldPriceInput(item.financials.fastCashPrice.toString());
    setSoldPlatformInput(item.financials.recommendedRoute === 'LOCAL_CASH_ONLY' ? 'Local Cash Meetup' : 'Marketplace');
  };

  const handleConfirmSold = () => {
    if (!soldModalItem) return;
    const price = parseFloat(soldPriceInput) || soldModalItem.financials.fastCashPrice;
    const updated: AppraisalDossier = {
      ...soldModalItem,
      status: 'sold',
      realizedSalePrice: price,
      salePlatform: soldPlatformInput,
    };
    onUpdateItem(updated);
    setSoldModalItem(null);
  };

  const handleSaveManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim()) return;

    const fastCash = parseFloat(manualFastCash) || 100;
    const costBasis = parseFloat(manualCostBasis) || fastCash * 1.5;

    const newItem: AppraisalDossier = {
      id: `manual-${Date.now()}`,
      assetName: manualName,
      category: manualCategory,
      confidenceRating: 'HIGH (99%+)',
      confidenceExplanation: 'Operator manual entry with confirmed physical inspection.',
      missingDataAlert: null,
      identification: {
        manufacturer: manualName.split(' ')[0] || 'Unknown',
        modelLine: manualName,
        exactSkuOrVariant: 'Custom Entry',
        specsOrDimensions: 'Inspected by operator',
      },
      conditionReport: {
        conditionTier: 'Used Good',
        visibleDefects: [manualNotes || 'Minor cosmetic signs of handling'],
        authenticityRisk: 'Low',
        mechanicalOrWearStatus: 'Inspected and confirmed functional',
      },
      financials: {
        fastCashPrice: fastCash,
        maxYieldPrice: Math.round(fastCash * 1.25),
        estimatedFeesAndShipping: Math.round(fastCash * 0.15),
        netInPocketYield: fastCash,
        bottomDollarWalkAwayPrice: Math.round(fastCash * 0.85),
        sellThroughRatePercent: 85,
        medianDaysToSell: 3,
        recommendedRoute: 'LOCAL_CASH_ONLY',
        routeJustification: 'Quick cash velocity without platform holds.',
      },
      turnkeyListing: {
        title: `${manualName} - Great Working Condition - Cash Only`,
        disputeProofDescription: `Selling ${manualName} in solid functional shape. Inspected and working properly. ${manualNotes ? `Notes: ${manualNotes}. ` : ''}Cash in person only at safe public meetup zone.`,
        suggestedPlatformTags: ['Resale', 'Local', 'CashOnly'],
      },
      negotiationScripts: {
        onInitialInquiry: 'Yes, it is available. I can meet today at the bank lobby or police station. Are you paying cash?',
        onLowballOffer: `The lowest cash price I can accept today is $${Math.round(fastCash * 0.85)}.`,
        onElectronicPaymentScam: 'Cash in hand only at the safe meetup point. No electronic apps or checks.',
        onTestRideOrInspection: 'Full cash in hand required before physical inspection.',
      },
      safetyAndScamWarning: 'Always verify cash bills with a counterfeit marker and meet in daylight.',
      singleImmediateAction: 'Stage item, take photos, and publish listing.',
      images: [],
      status: 'staged',
      dateLogged: new Date().toISOString().split('T')[0],
      costBasisEstimate: costBasis,
    };

    onAddNewManualItem(newItem);
    setShowManualAdd(false);
    setManualName('');
    setManualFastCash('');
    setManualCostBasis('');
    setManualNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-500/30">
                MODULE 2: INVENTORY LEDGER
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Real-Time Asset Valuation & IRS 1099-K Defense
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight mt-1">
              Active Inventory & Liquidation Pipeline
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl">
              Track every physical apartment asset from appraisal to listed, under offer, and cash-in-hand.
              Automatic loss-basis documentation defends against 1099-K tax flags.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onOpenScanner && (
              <button
                onClick={onOpenScanner}
                className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-950/30"
                title="Scan physical asset tag with camera"
              >
                <ScanLine className="w-4 h-4" />
                <span>SCAN ASSET TAG</span>
              </button>
            )}

            {items.length > 0 && (
              <button
                onClick={() => setQrModalItem(items[0])}
                className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 flex items-center gap-2 transition-all cursor-pointer"
                title="Generate and print physical QR tags for items"
              >
                <QrCode className="w-4 h-4 text-amber-400" />
                <span>PRINT QR TAGS</span>
              </button>
            )}

            {onOpenWorkspace && (
              <button
                onClick={onOpenWorkspace}
                className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 flex items-center gap-2 transition-all cursor-pointer shadow-sm"
                title="Direct live export to Google Sheets via Google Workspace API"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>GOOGLE SHEETS SYNC</span>
              </button>
            )}

            <button
              onClick={() => exportLedgerToCsv(items)}
              className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 transition-all cursor-pointer"
              title="Download CSV for IRS personal loss audit trail"
            >
              <Download className="w-4 h-4 text-slate-400" />
              <span>EXPORT CSV</span>
            </button>

            <button
              onClick={() => setShowManualAdd(true)}
              className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>MANUAL ENTRY</span>
            </button>
          </div>
        </div>

        {/* Ticker Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3.5">
            <span className="text-[11px] font-mono text-slate-400 block uppercase">Total Assessed Assets</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-black text-white">{totalItems}</span>
              <span className="text-xs text-slate-400">items</span>
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3.5">
            <span className="text-[11px] font-mono text-slate-400 block uppercase">Unsold Liquidity (Fast Cash)</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-black text-sky-400">{formatCurrency(totalUnsoldLiquidity)}</span>
            </div>
          </div>

          <div className="bg-slate-950/80 border border-emerald-500/20 rounded-xl p-3.5 bg-emerald-500/5">
            <span className="text-[11px] font-mono text-emerald-400 block uppercase font-semibold">Realized Cash in Hand</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-black text-emerald-300">{formatCurrency(totalRealizedCash)}</span>
              <span className="text-xs text-slate-400">({soldItems.length} sold)</span>
            </div>
          </div>

          <div className="bg-slate-950/80 border border-amber-500/20 rounded-xl p-3.5 bg-amber-500/5">
            <span className="text-[11px] font-mono text-amber-400 block uppercase font-semibold">Allocated to Family Vault</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-black text-amber-300">{formatCurrency(totalRealizedCash * 0.5)}</span>
              <span className="text-xs text-slate-400">(50% locked)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="mobility">E-Bikes & Scooters</option>
              <option value="collectibles">Cards & Collectibles</option>
              <option value="apparel">Apparel</option>
              <option value="electronics">Electronics</option>
              <option value="tools">Tools</option>
            </select>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800 text-xs">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="staged">Staged</option>
              <option value="listed">Active Listed</option>
              <option value="sold">Sold (Cash in Hand)</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="date">Sort: Newest Logged</option>
              <option value="price-desc">Sort: Highest Fast Cash</option>
              <option value="price-asc">Sort: Lowest Fast Cash</option>
              <option value="str">Sort: Highest Sell-Through %</option>
            </select>
          </div>
        </div>

        <div className="w-full md:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search brand, model, SKU..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Asset Details</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Condition</th>
                <th className="py-3 px-3">Fast Cash Target</th>
                <th className="py-3 px-3">Walk-Away Floor</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No items match the selected filter. Click "VIALE Appraiser" to photograph and add new assets.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className={`transition-colors ${
                      highlightItemId === item.id
                        ? 'bg-amber-500/15 border-2 border-amber-500 animate-pulse'
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    {/* Asset Details */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {item.images && item.images.length > 0 ? (
                          <img
                            src={item.images[0]}
                            alt={item.assetName}
                            className="w-11 h-11 rounded-lg object-cover border border-slate-800 shrink-0"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 shrink-0">
                            <Layers className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <span className="font-bold text-slate-200 block">{item.assetName}</span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {item.identification.manufacturer} · {item.identification.exactSkuOrVariant}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-800 text-slate-300 border border-slate-700">
                        {item.category}
                      </span>
                    </td>

                    {/* Condition */}
                    <td className="py-3 px-3">
                      <span className="text-slate-300 font-medium">
                        {item.conditionReport.conditionTier}
                      </span>
                    </td>

                    {/* Fast Cash Target */}
                    <td className="py-3 px-3">
                      <span className="font-bold text-emerald-400 font-mono text-sm">
                        {formatCurrency(item.financials.fastCashPrice)}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        90d STR: {item.financials.sellThroughRatePercent}%
                      </span>
                    </td>

                    {/* Walk Away Floor */}
                    <td className="py-3 px-3">
                      <span className="font-mono text-rose-400 font-semibold">
                        {formatCurrency(item.financials.bottomDollarWalkAwayPrice)}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        Reject lower
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase ${
                          item.status === 'sold'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : item.status === 'listed'
                            ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                            : item.status === 'staged'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {item.status === 'sold' && <CheckCircle className="w-3 h-3 text-emerald-400" />}
                        <span>{item.status === 'sold' ? `SOLD ($${item.realizedSalePrice})` : item.status}</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setQrModalItem(item)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-500/20 text-slate-300 hover:text-amber-400 transition-colors cursor-pointer"
                          title="Generate & Print Physical QR Tag"
                        >
                          <QrCode className="w-4 h-4 text-amber-400" />
                        </button>

                        <button
                          onClick={() => setInspectItem(item)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                          title="Inspect Dossier & Scripts"
                        >
                          <Eye className="w-4 h-4 text-sky-400" />
                        </button>

                        {item.status !== 'sold' && (
                          <button
                            onClick={() => handleOpenSoldModal(item)}
                            className="px-2 py-1 rounded-lg text-xs font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 transition-colors cursor-pointer flex items-center gap-1"
                            title="Mark as Sold & Allocate Cash"
                          >
                            <DollarSign className="w-3 h-3" />
                            <span>Mark Sold</span>
                          </button>
                        )}

                        <button
                          onClick={() => onDeleteItem(item.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Delete Item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mark Sold Modal */}
      {soldModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Record Cash Realized</h3>
              </div>
              <button
                onClick={() => setSoldModalItem(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-300">
                You are marking <strong className="text-white">{soldModalItem.assetName}</strong> as SOLD.
              </p>

              <div>
                <label className="text-slate-400 font-mono block mb-1">
                  Actual Cash In Hand Received ($)
                </label>
                <input
                  type="number"
                  value={soldPriceInput}
                  onChange={(e) => setSoldPriceInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-base font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-400 font-mono block mb-1">Sale Route / Platform</label>
                <select
                  value={soldPlatformInput}
                  onChange={(e) => setSoldPlatformInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="Local Cash (Police Safe Zone)">Local Cash (Police Safe Zone)</option>
                  <option value="Local Cash (Bank Lobby)">Local Cash (Bank Lobby)</option>
                  <option value="Local Hobby Shop Direct Buy-List">Local Hobby Shop Direct Buy-List</option>
                  <option value="Facebook Marketplace Local">Facebook Marketplace Local</option>
                  <option value="OfferUp In-Person">OfferUp In-Person</option>
                  <option value="Mercari Online">Mercari Online</option>
                  <option value="eBay Tracked">eBay Tracked</option>
                </select>
              </div>

              {/* Automatic Fortress Split Preview */}
              <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 space-y-1.5">
                <span className="text-[10px] font-mono text-slate-500 uppercase block font-semibold">
                  Automatic Fortress Capital Allocation:
                </span>
                <div className="flex justify-between text-slate-300">
                  <span>50% Family Safety Vault (Rent/Food):</span>
                  <span className="text-amber-400 font-mono font-bold">
                    {formatCurrency((parseFloat(soldPriceInput) || 0) * 0.5)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>40% Working Capital Arbitrage Fund:</span>
                  <span className="text-indigo-400 font-mono font-bold">
                    {formatCurrency((parseFloat(soldPriceInput) || 0) * 0.4)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>10% Shipping & Tax Reserve:</span>
                  <span className="text-slate-400 font-mono">
                    {formatCurrency((parseFloat(soldPriceInput) || 0) * 0.1)}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setSoldModalItem(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSold}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer"
              >
                Confirm Cash in Hand
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inspect Item Dossier Drawer */}
      {inspectItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block">
                  Asset Forensic Dossier
                </span>
                <h3 className="text-lg font-black text-white">{inspectItem.assetName}</h3>
              </div>
              <button
                onClick={() => setInspectItem(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Copyable listing elements */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-slate-400 text-[10px] uppercase">Marketplace Listing Title</span>
                  <button
                    onClick={() => copyText(inspectItem.turnkeyListing.title, 'insp-title')}
                    className="text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer font-mono text-[11px]"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedKey === 'insp-title' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-slate-200 font-semibold">{inspectItem.turnkeyListing.title}</p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-slate-400 text-[10px] uppercase">Dispute-Proof Description</span>
                  <button
                    onClick={() => copyText(inspectItem.turnkeyListing.disputeProofDescription, 'insp-desc')}
                    className="text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer font-mono text-[11px]"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedKey === 'insp-desc' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {inspectItem.turnkeyListing.disputeProofDescription}
                </p>
              </div>

              {/* Pre-scripted Buyer Responses */}
              <div className="space-y-2">
                <span className="font-mono text-slate-400 text-[10px] uppercase block font-semibold">
                  Pre-Scripted Negotiation Responses:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <div className="flex justify-between items-center text-slate-400 text-[10px] mb-1 font-mono">
                      <span>Lowball Rejection</span>
                      <button
                        onClick={() => copyText(inspectItem.negotiationScripts.onLowballOffer, 'insp-low')}
                        className="text-amber-400 cursor-pointer"
                      >
                        {copiedKey === 'insp-low' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <p className="text-slate-300 text-[11px]">{inspectItem.negotiationScripts.onLowballOffer}</p>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <div className="flex justify-between items-center text-slate-400 text-[10px] mb-1 font-mono">
                      <span>Scam / Zelle Shutdown</span>
                      <button
                        onClick={() => copyText(inspectItem.negotiationScripts.onElectronicPaymentScam, 'insp-scam')}
                        className="text-amber-400 cursor-pointer"
                      >
                        {copiedKey === 'insp-scam' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <p className="text-slate-300 text-[11px]">{inspectItem.negotiationScripts.onElectronicPaymentScam}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setInspectItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Add Item Modal */}
      {showManualAdd && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveManual} className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Manual Asset Log</h3>
              <button
                type="button"
                onClick={() => setShowManualAdd(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-mono block mb-1">Asset Name & Model</label>
                <input
                  type="text"
                  required
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  placeholder="e.g. RadCity 4 Step-Thru Electric Bike"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 font-mono block mb-1">Category</label>
                  <select
                    value={manualCategory}
                    onChange={(e) => setManualCategory(e.target.value as ItemCategory)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
                  >
                    <option value="mobility">E-Bikes & Scooters</option>
                    <option value="collectibles">Collectibles / TCG</option>
                    <option value="apparel">Apparel</option>
                    <option value="electronics">Electronics</option>
                    <option value="tools">Tools</option>
                    <option value="other">Other Clutter</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 font-mono block mb-1">Fast Cash Target ($)</label>
                  <input
                    type="number"
                    required
                    value={manualFastCash}
                    onChange={(e) => setManualFastCash(e.target.value)}
                    placeholder="350"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-mono block mb-1">Estimated Original Purchase Cost ($)</label>
                <input
                  type="number"
                  value={manualCostBasis}
                  onChange={(e) => setManualCostBasis(e.target.value)}
                  placeholder="e.g. 700 (Used to prove non-taxable personal loss)"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-400 font-mono block mb-1">Condition Notes</label>
                <textarea
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  rows={2}
                  placeholder="Battery functional, minor scratches, charger included..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setShowManualAdd(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer"
              >
                Save to Ledger
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Printable QR Tag Modal */}
      {qrModalItem && (
        <QrTagModal
          item={qrModalItem}
          allItems={items}
          onClose={() => setQrModalItem(null)}
        />
      )}
    </div>
  );
};
