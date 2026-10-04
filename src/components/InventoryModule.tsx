import React, { useState, useMemo } from 'react';
import {
  AppraisalDossier,
  ItemStatus,
  LevItemType,
  LevOwnershipStatus,
} from '../types';
import { formatCurrency, exportLedgerToCsv } from '../utils/storage';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import {
  Search,
  Filter,
  Download,
  Plus,
  QrCode,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  Tag,
  DollarSign,
  AlertTriangle,
  Clock,
  MapPin,
  ChevronDown,
} from 'lucide-react';

interface InventoryModuleProps {
  items: AppraisalDossier[];
  onUpdateItem: (item: AppraisalDossier) => void;
  onDeleteItem: (id: string) => void;
  onOpenIntake: () => void;
  onOpenScanner: () => void;
  onPrintQrTag: (item: AppraisalDossier) => void;
  onNavigateToListing: (itemId: string) => void;
  onNavigateToRepair: (itemId: string) => void;
  onNavigateToBattery: (itemId: string) => void;
  initialFilterStatus?: string;
  highlightItemId?: string | null;
}

const ALL_STATUSES: ItemStatus[] = [
  'Sourced',
  'Purchased',
  'Awaiting intake',
  'Needs diagnosis',
  'Awaiting approval',
  'Awaiting parts',
  'In repair',
  'Needs testing',
  'Ready to photograph',
  'Ready to list',
  'Listed',
  'Sold',
  'Parted out',
  'Scrapped',
  'On hold',
];

const ITEM_TYPES: { id: LevItemType; label: string }[] = [
  { id: 'electric_scooter', label: 'E-Scooter' },
  { id: 'ebike', label: 'E-Bike' },
  { id: 'battery_pack', label: 'Battery Pack' },
  { id: 'charger', label: 'Charger' },
  { id: 'controller', label: 'Controller' },
  { id: 'motor', label: 'Motor' },
  { id: 'display_throttle', label: 'Display/Throttle' },
  { id: 'tires_brakes', label: 'Tires/Brakes' },
  { id: 'donor_vehicle', label: 'Donor Vehicle' },
  { id: 'collectibles', label: 'Collectibles / Cards' },
  { id: 'apparel', label: 'Apparel' },
  { id: 'other', label: 'Other Resale' },
];

export const InventoryModule: React.FC<InventoryModuleProps> = ({
  items,
  onUpdateItem,
  onDeleteItem,
  onOpenIntake,
  onOpenScanner,
  onPrintQrTag,
  onNavigateToListing,
  onNavigateToRepair,
  onNavigateToBattery,
  initialFilterStatus,
  highlightItemId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(initialFilterStatus || 'ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [selectedItem, setSelectedItem] = useState<AppraisalDossier | null>(
    highlightItemId ? items.find((i) => i.id === highlightItemId) || null : null
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [salePriceInput, setSalePriceInput] = useState('');
  const [salePlatformInput, setSalePlatformInput] = useState('Local Cash (OfferUp/FB)');
  const [itemToDelete, setItemToDelete] = useState<AppraisalDossier | null>(null);

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        searchQuery === '' ||
        item.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.identification.manufacturer &&
          item.identification.manufacturer.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.identification.detectedSerialOrTags &&
          item.identification.detectedSerialOrTags.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.storageLocation &&
          item.storageLocation.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'SAFETY_HOLD' ? item.safetyHold : item.status === statusFilter);

      const matchesType =
        typeFilter === 'ALL' ||
        item.itemType === typeFilter ||
        item.category === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [items, searchQuery, statusFilter, typeFilter]);

  const handleQuickStatusChange = (item: AppraisalDossier, newStatus: ItemStatus) => {
    const updated: AppraisalDossier = {
      ...item,
      status: newStatus,
    };
    onUpdateItem(updated);
    if (selectedItem?.id === item.id) {
      setSelectedItem(updated);
    }
  };

  const handleRecordSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    const soldAmt = parseFloat(salePriceInput);
    if (isNaN(soldAmt) || soldAmt <= 0) return;

    const updated: AppraisalDossier = {
      ...selectedItem,
      status: 'Sold',
      realizedSalePrice: soldAmt,
      salePlatform: salePlatformInput,
    };
    onUpdateItem(updated);
    setSelectedItem(updated);
    setIsSaleModalOpen(false);
    setSalePriceInput('');
  };

  const handleToggleSafetyHold = (item: AppraisalDossier) => {
    const current = !!item.safetyHold;
    const newHold = !current;
    let reason = item.safetyHoldReason;
    if (newHold && !reason) {
      reason = prompt('Enter mandatory Safety Hold reason (e.g. Swollen battery, broken steer tube):') || 'Manual Safety Quarantine';
    }
    const updated: AppraisalDossier = {
      ...item,
      safetyHold: newHold,
      safetyHoldReason: newHold ? reason : undefined,
      status: newHold ? 'On hold' : (item.status === 'On hold' ? 'Needs diagnosis' : item.status),
    };
    onUpdateItem(updated);
    if (selectedItem?.id === item.id) {
      setSelectedItem(updated);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Main Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Inventory Ledger</span>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
              {items.length} units
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Tracking LEV serials, acquisition costs, storage bays, and true margins.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => exportLedgerToCsv(items)}
            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onOpenScanner}
            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <QrCode className="w-3.5 h-3.5 text-amber-400" />
            <span>Scan Tag</span>
          </button>

          <button
            onClick={onOpenIntake}
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ New Intake</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, VIN, Make, Model, Bay..."
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-4 flex items-center gap-2">
            <span className="text-xs text-slate-400 shrink-0">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-2 px-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="ALL">All Statuses ({items.length})</option>
              <option value="SAFETY_HOLD">⚠️ Safety Holds ({items.filter((i) => i.safetyHold).length})</option>
              {ALL_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st} ({items.filter((i) => i.status === st).length})
                </option>
              ))}
            </select>
          </div>

          {/* Item Type Filter */}
          <div className="sm:col-span-3 flex items-center gap-2">
            <span className="text-xs text-slate-400 shrink-0">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full py-2 px-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              {ITEM_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Mobile Card List View (Visible on small screens) */}
      <div className="block md:hidden space-y-3">
        {filteredItems.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-500 text-xs">
            No inventory records match the current filters.
          </div>
        ) : (
          filteredItems.map((item) => {
            const purchase = item.financials.purchasePrice || item.costBasisEstimate || 0;
            const parts = item.financials.partsCostCommitted || 0;
            const totalCost = purchase + parts;
            const asking = item.financials.fastCashPrice || 0;
            const profit = item.financials.expectedGrossProfit ?? (asking - totalCost);
            const isHold = item.safetyHold || item.status === 'On hold';

            return (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`bg-slate-900 border rounded-xl p-4 space-y-3 transition-colors cursor-pointer ${
                  selectedItem?.id === item.id
                    ? 'border-amber-500 bg-slate-800/60'
                    : isHold
                    ? 'border-red-500/40 bg-red-950/10'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-amber-400 text-xs">
                        {item.id}
                      </span>
                      {isHold && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 font-bold border border-red-500/30">
                          HOLD
                        </span>
                      )}
                      <span className="text-[10px] text-slate-500 font-mono">
                        {item.storageLocation || 'Unassigned'}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white mt-1">
                      {item.assetName}
                    </h3>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {item.identification.manufacturer || 'Unbranded'} · {item.itemType}
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold shrink-0 ${
                      isHold
                        ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                        : item.status === 'Sold'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : item.status === 'Listed' || item.status === 'Ready to list'
                        ? 'bg-sky-500/20 text-sky-300'
                        : item.status === 'In repair' || item.status === 'Awaiting parts'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px] font-mono">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Cost Basis</span>
                    <span className="text-slate-300">{formatCurrency(totalCost)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Asking</span>
                    <span className="text-white font-semibold">{formatCurrency(asking)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Exp. Profit</span>
                    <span className={profit > 0 ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                      {formatCurrency(profit)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onPrintQrTag(item)}
                      title="QR Tag"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs flex items-center gap-1"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span className="text-[11px]">QR</span>
                    </button>
                    <button
                      onClick={() => onNavigateToListing(item.id)}
                      title="Listing Draft"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs flex items-center gap-1"
                    >
                      <Tag className="w-3.5 h-3.5" />
                      <span className="text-[11px]">Listing</span>
                    </button>
                  </div>

                  <button
                    onClick={() => setItemToDelete(item)}
                    title="Delete Asset from Ledger"
                    className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Record</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Inventory Table List (Desktop & Tablet) */}
      <div className="hidden md:block bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Item & ID</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Location</th>
                <th className="py-3 px-3 text-right">Cost Basis</th>
                <th className="py-3 px-3 text-right">Asking / Resale</th>
                <th className="py-3 px-3 text-right">Exp. Gross</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No inventory records match the current filters.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const purchase = item.financials.purchasePrice || item.costBasisEstimate || 0;
                  const parts = item.financials.partsCostCommitted || 0;
                  const totalCost = purchase + parts;
                  const asking = item.financials.fastCashPrice || 0;
                  const profit = item.financials.expectedGrossProfit ?? (asking - totalCost);
                  const isHold = item.safetyHold || item.status === 'On hold';

                  return (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className={`hover:bg-slate-800/40 transition-colors cursor-pointer ${
                        selectedItem?.id === item.id ? 'bg-slate-800/60' : ''
                      } ${isHold ? 'bg-red-950/10' : ''}`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-amber-400 text-xs">
                            {item.id}
                          </span>
                          {isHold && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 font-bold border border-red-500/30">
                              HOLD
                            </span>
                          )}
                        </div>
                        <div className="text-slate-100 font-medium text-xs mt-0.5 max-w-xs truncate">
                          {item.assetName}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {item.identification.manufacturer || 'Unbranded'} · {item.identification.exactSkuOrVariant || item.itemType}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`inline-block text-[11px] font-mono px-2 py-0.5 rounded ${
                            isHold
                              ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                              : item.status === 'Sold'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : item.status === 'Listed' || item.status === 'Ready to list'
                              ? 'bg-sky-500/20 text-sky-300'
                              : item.status === 'In repair' || item.status === 'Awaiting parts'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                        {item.storageLocation || 'Unassigned'}
                      </td>

                      <td className="py-3 px-3 text-right font-mono text-slate-300">
                        {formatCurrency(totalCost)}
                        {parts > 0 && (
                          <span className="block text-[10px] text-amber-400">
                            (incl. ${parts} parts)
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-semibold text-white">
                        {item.status === 'Sold' && item.realizedSalePrice ? (
                          <span className="text-emerald-400">
                            Sold: {formatCurrency(item.realizedSalePrice)}
                          </span>
                        ) : (
                          formatCurrency(asking)
                        )}
                      </td>

                      <td className="py-3 px-3 text-right font-mono">
                        <span
                          className={`font-semibold ${
                            profit > 0 ? 'text-emerald-400' : 'text-slate-400'
                          }`}
                        >
                          {formatCurrency(profit)}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div
                          className="flex items-center justify-center gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => onPrintQrTag(item)}
                            title="Generate QR Identification Tag"
                            className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-amber-400 cursor-pointer"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onNavigateToListing(item.id)}
                            title="Open Listing Draft Generator"
                            className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-sky-400 cursor-pointer"
                          >
                            <Tag className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setItemToDelete(item)}
                            title="Delete Asset from Ledger"
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 cursor-pointer transition-colors flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-semibold hidden lg:inline">Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Item Detail Drawer / Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-5 sm:p-6 space-y-5 text-slate-100 max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Drawer Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-800 gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">
                    {selectedItem.id}
                  </span>
                  <span className="text-xs text-slate-400 uppercase font-mono">
                    {selectedItem.ownershipStatus || 'Owned'} · {selectedItem.itemType || selectedItem.category}
                  </span>
                  {selectedItem.safetyHold && (
                    <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-bold border border-red-500/30">
                      SAFETY HOLD
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-bold text-white mt-1">
                  {selectedItem.assetName}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setItemToDelete(selectedItem)}
                  className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Permanently Delete Asset"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Asset</span>
                </button>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Safety Hold Notice if active */}
            {selectedItem.safetyHold && (
              <div className="bg-red-950/40 border border-red-500/60 rounded-xl p-3.5 text-xs text-red-200 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-red-300">
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                  <span>SAFETY HOLD ACTIVATED: LOCKED FROM RESALE</span>
                </div>
                <p>{selectedItem.safetyHoldReason || 'Quarantined for battery damage, voltage sag, or frame defect.'}</p>
              </div>
            )}

            {/* Quick Actions Strip */}
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                onClick={() => handleToggleSafetyHold(selectedItem)}
                className={`px-3 py-1.5 rounded-lg border font-medium cursor-pointer transition-colors ${
                  selectedItem.safetyHold
                    ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    : 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20'
                }`}
              >
                {selectedItem.safetyHold ? 'Release Safety Hold' : 'Trigger Safety Hold'}
              </button>

              <button
                onClick={() => onPrintQrTag(selectedItem)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5 text-amber-400" />
                <span>Print QR Label</span>
              </button>

              <button
                onClick={() => {
                  onNavigateToListing(selectedItem.id);
                  setSelectedItem(null);
                }}
                className="px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 flex items-center gap-1.5 cursor-pointer"
              >
                <Tag className="w-3.5 h-3.5" />
                <span>Marketplace Draft</span>
              </button>

              {selectedItem.status !== 'Sold' && (
                <button
                  onClick={() => setIsSaleModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Mark as Sold</span>
                </button>
              )}

              <button
                onClick={() => setItemToDelete(selectedItem)}
                className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 flex items-center gap-1.5 cursor-pointer ml-auto"
                title="Delete Asset from Ledger"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>

            {/* Status Selector */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between gap-4">
              <span className="text-xs text-slate-400 font-medium">Lifecycle Status:</span>
              <select
                value={selectedItem.status}
                onChange={(e) => handleQuickStatusChange(selectedItem, e.target.value as ItemStatus)}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                {ALL_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Financial & Location Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Purchase Price</span>
                <span className="text-base font-bold font-mono text-slate-200">
                  {formatCurrency(selectedItem.financials.purchasePrice || selectedItem.costBasisEstimate || 0)}
                </span>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Parts Committed</span>
                <span className="text-base font-bold font-mono text-amber-300">
                  {formatCurrency(selectedItem.financials.partsCostCommitted || 0)}
                </span>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Target Asking Price</span>
                <span className="text-base font-bold font-mono text-white">
                  {formatCurrency(selectedItem.financials.fastCashPrice || 0)}
                </span>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Expected Profit</span>
                <span className="text-base font-bold font-mono text-emerald-400">
                  {formatCurrency(selectedItem.financials.expectedGrossProfit || 0)}
                </span>
              </div>
            </div>

            {/* Technical Identification Specs */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
              <span className="text-slate-400 font-semibold block text-[11px] uppercase tracking-wider">
                Vehicle Specifications & Identifiers
              </span>
              <div className="grid grid-cols-2 gap-y-1.5 text-slate-300">
                <div>
                  <span className="text-slate-500">Make / Brand:</span>{' '}
                  <span className="font-medium text-white">{selectedItem.identification.manufacturer || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500">Model Line:</span>{' '}
                  <span className="font-medium text-white">{selectedItem.identification.modelLine || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500">Serial / VIN:</span>{' '}
                  <span className="font-mono text-amber-300">{selectedItem.identification.detectedSerialOrTags || 'None recorded'}</span>
                </div>
                <div>
                  <span className="text-slate-500">Storage Location:</span>{' '}
                  <span className="font-medium text-slate-200">{selectedItem.storageLocation || 'Unassigned'}</span>
                </div>
                <div>
                  <span className="text-slate-500">Acquisition Date:</span>{' '}
                  <span className="font-mono">{selectedItem.dateLogged}</span>
                </div>
                <div>
                  <span className="text-slate-500">Sourcing Source:</span>{' '}
                  <span>{selectedItem.acquisitionSource || 'Local'}</span>
                </div>
              </div>
            </div>

            {/* Battery Spec Block (If battery or vehicle has battery) */}
            {selectedItem.batteryRecord && (
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                    Battery Safety & Health Record
                  </span>
                  <button
                    onClick={() => {
                      onNavigateToBattery(selectedItem.id);
                      setSelectedItem(null);
                    }}
                    className="text-amber-400 hover:text-amber-300 text-[11px] font-medium"
                  >
                    Open Diagnostic Profile &rarr;
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
                  <div className="bg-slate-900 p-2 rounded">
                    <span className="text-slate-500 block">Nominal V</span>
                    <span>{selectedItem.batteryRecord.nominalVoltage}V</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded">
                    <span className="text-slate-500 block">Measured V</span>
                    <span className="text-emerald-400">{selectedItem.batteryRecord.measuredVoltage}V</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded">
                    <span className="text-slate-500 block">Capacity</span>
                    <span>{selectedItem.batteryRecord.capacityAh}Ah ({selectedItem.batteryRecord.capacityWh}Wh)</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded">
                    <span className="text-slate-500 block">Swelling Check</span>
                    <span className={selectedItem.batteryRecord.isSwollenOrPunctured ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                      {selectedItem.batteryRecord.isSwollenOrPunctured ? 'FAILED / SWELLING' : 'Passed'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Linked Repairs / Work Orders */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  onNavigateToRepair(selectedItem.id);
                  setSelectedItem(null);
                }}
                className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
              >
                <span>View Linked Repair Work Orders</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setItemToDelete(selectedItem)}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1.5 cursor-pointer py-1.5 px-2.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Record</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record Sale Modal */}
      {isSaleModalOpen && selectedItem && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-xl p-5 max-w-md w-full space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <span>Record Sale: {selectedItem.assetName}</span>
            </h3>

            <form onSubmit={handleRecordSale} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Final Agreed Cash Amount ($)</label>
                <input
                  type="number"
                  step="1"
                  required
                  placeholder={selectedItem.financials.fastCashPrice.toString()}
                  value={salePriceInput}
                  onChange={(e) => setSalePriceInput(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Sale Platform / Method</label>
                <select
                  value={salePlatformInput}
                  onChange={(e) => setSalePlatformInput(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="Local Cash (OfferUp/FB)">Local Cash in Hand (OfferUp / FB Marketplace)</option>
                  <option value="Local Cash (Craigslist)">Local Cash in Hand (Craigslist)</option>
                  <option value="In-Shop Customer Sale">In-Shop Walk-In Customer</option>
                  <option value="eBay Local Pickup">eBay Local Pickup with QR Scan Confirmation</option>
                  <option value="eBay Shipped">eBay Shipped (Online with Tracking)</option>
                </select>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1 text-[11px] font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Invested Cost Basis:</span>
                  <span>{formatCurrency((selectedItem.financials.purchasePrice || selectedItem.costBasisEstimate || 0) + (selectedItem.financials.partsCostCommitted || 0))}</span>
                </div>
                {salePriceInput && (
                  <div className="flex justify-between text-emerald-400 font-bold border-t border-slate-800 pt-1">
                    <span>Estimated Net Profit:</span>
                    <span>
                      {formatCurrency(
                        parseFloat(salePriceInput) -
                          ((selectedItem.financials.purchasePrice || selectedItem.costBasisEstimate || 0) +
                            (selectedItem.financials.partsCostCommitted || 0))
                      )}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSaleModalOpen(false)}
                  className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
                >
                  Confirm Realized Sale
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* In-App Confirmation Modal for Asset Deletion */}
      <ConfirmDeleteModal
        isOpen={!!itemToDelete}
        title="Delete Inventory Asset"
        itemDescription={itemToDelete ? `${itemToDelete.id} — ${itemToDelete.assetName} (${itemToDelete.identification.manufacturer || 'LEV'})` : undefined}
        warningText="Permanently removes this vehicle from ledger, including all serial tracking, acquisition cost, and diagnostics logs."
        onConfirm={() => {
          if (itemToDelete) {
            onDeleteItem(itemToDelete.id);
            if (selectedItem?.id === itemToDelete.id) {
              setSelectedItem(null);
            }
            setItemToDelete(null);
          }
        }}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
};
