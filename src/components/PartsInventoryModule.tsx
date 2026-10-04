import React, { useState } from 'react';
import {
  PartItem,
  CompatibilityRating,
} from '../types';
import { formatCurrency, exportPartsToCsv } from '../utils/storage';
import {
  Package,
  AlertTriangle,
  Plus,
  Download,
  Search,
  CheckCircle2,
  HelpCircle,
  XCircle,
  Tag,
  MapPin,
  X,
  Trash2,
} from 'lucide-react';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface PartsInventoryModuleProps {
  parts: PartItem[];
  onSavePart: (part: PartItem) => void;
  onDeletePart?: (partId: string) => void;
}

const CATEGORIES: { id: PartItem['category']; label: string }[] = [
  { id: 'controller', label: 'Controllers' },
  { id: 'motor', label: 'Motors & Hubs' },
  { id: 'battery', label: 'Battery Cells & Packs' },
  { id: 'throttle', label: 'Throttles & Keys' },
  { id: 'display', label: 'Displays & Dashboards' },
  { id: 'tire_tube', label: 'Tires & Tubes' },
  { id: 'brakes', label: 'Brakes & Calipers' },
  { id: 'charger', label: 'Chargers & Plugs' },
  { id: 'hardware', label: 'Bolts & Hardware' },
];

export const PartsInventoryModule: React.FC<PartsInventoryModuleProps> = ({
  parts,
  onSavePart,
  onDeletePart,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [selectedPart, setSelectedPart] = useState<PartItem | null>(null);
  const [isNewPartModalOpen, setIsNewPartModalOpen] = useState(false);
  const [partToDelete, setPartToDelete] = useState<PartItem | null>(null);

  // New Part Form State
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<PartItem['category']>('controller');
  const [newBrand, setNewBrand] = useState('');
  const [newSpecs, setNewSpecs] = useState('');
  const [newQty, setNewQty] = useState('2');
  const [newReorder, setNewReorder] = useState('2');
  const [newCost, setNewCost] = useState('20');
  const [newResale, setNewResale] = useState('50');
  const [newBin, setNewBin] = useState('Shelf 1, Bin A-01');
  const [newSupplier, setNewSupplier] = useState('');
  const [newCompatTier, setNewCompatTier] = useState<CompatibilityRating>('Likely compatible—verify');
  const [newCompatModels, setNewCompatModels] = useState('');

  const filteredParts = parts.filter((part) => {
    const matchesSearch =
      searchQuery === '' ||
      part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      part.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      part.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      part.binLocation.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === 'ALL' || part.category === categoryFilter;
    const matchesLowStock = !lowStockOnly || part.quantityOnHand <= part.reorderPoint;

    return matchesSearch && matchesCategory && matchesLowStock;
  });

  const totalValue = parts.reduce((sum, p) => sum + p.purchaseCost * p.quantityOnHand, 0);
  const lowStockCount = parts.filter((p) => p.quantityOnHand <= p.reorderPoint).length;

  const handleAdjustQuantity = (part: PartItem, delta: number) => {
    const newQty = Math.max(0, part.quantityOnHand + delta);
    const updated: PartItem = { ...part, quantityOnHand: newQty };
    onSavePart(updated);
    if (selectedPart?.id === part.id) {
      setSelectedPart(updated);
    }
  };

  const handleCreatePart = (e: React.FormEvent) => {
    e.preventDefault();
    const nextSeq = parts.length + 1;
    const newId = `PART-${nextSeq.toString().padStart(3, '0')}`;

    const newPart: PartItem = {
      id: newId,
      name: newName,
      category: newCategory,
      brand: newBrand || 'Generic OEM',
      specifications: newSpecs,
      condition: 'New',
      quantityOnHand: parseInt(newQty, 10) || 1,
      reorderPoint: parseInt(newReorder, 10) || 2,
      purchaseCost: parseFloat(newCost) || 0,
      typicalResaleValue: parseFloat(newResale) || 0,
      binLocation: newBin || 'Unassigned',
      supplier: newSupplier || 'Local / Online Supply',
      compatibilityTier: newCompatTier,
      compatibleModels: newCompatModels ? newCompatModels.split(',').map((m) => m.trim()) : [],
    };

    onSavePart(newPart);
    setSelectedPart(newPart);
    setIsNewPartModalOpen(false);
    setNewName('');
    setNewSpecs('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-amber-400" />
            <span>Spare Parts Inventory & Bin Control</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Component tracking, bin storage addresses, confirmed compatibility, and reorder alerts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportPartsToCsv(parts)}
            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsNewPartModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Add New Part</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <span className="text-xs text-slate-400">Total SKUs</span>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {parts.length}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Cataloged components</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <span className="text-xs text-slate-400">Inventory Cost Value</span>
          <div className="text-2xl font-bold font-mono text-slate-200 mt-1">
            {formatCurrency(totalValue)}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Total purchase basis</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <span className="text-xs text-slate-400">Low Stock Reorders</span>
          <div className="text-2xl font-bold font-mono text-rose-400 mt-1">
            {lowStockCount}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Below reorder trigger</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <span className="text-xs text-slate-400">Total Units in Stock</span>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {parts.reduce((sum, p) => sum + p.quantityOnHand, 0)}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Bin items on hand</span>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by part name, ID, brand, or bin..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="py-2 px-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>

          <button
            onClick={() => setLowStockOnly(!lowStockOnly)}
            className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
              lowStockOnly
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            Low Stock Only
          </button>
        </div>
      </div>

      {/* Parts Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Part ID & Name</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Bin Location</th>
                <th className="py-3 px-3 text-center">Stock / Reorder</th>
                <th className="py-3 px-3 text-right">Cost / Resale</th>
                <th className="py-3 px-3">Compatibility</th>
                <th className="py-3 px-4 text-center">Qty Quick Adjust</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredParts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No parts match current criteria.
                  </td>
                </tr>
              ) : (
                filteredParts.map((part) => {
                  const isLow = part.quantityOnHand <= part.reorderPoint;

                  return (
                    <tr
                      key={part.id}
                      onClick={() => setSelectedPart(part)}
                      className={`hover:bg-slate-800/40 transition-colors cursor-pointer ${
                        selectedPart?.id === part.id ? 'bg-slate-800/60' : ''
                      } ${isLow ? 'bg-rose-950/10' : ''}`}
                    >
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-amber-400 text-xs">
                          {part.id}
                        </span>
                        <div className="text-white font-medium text-xs mt-0.5">
                          {part.name}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {part.brand} · {part.specifications}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-slate-300 capitalize">
                        {part.category.replace('_', ' ')}
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-mono text-amber-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          {part.binLocation}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center font-mono">
                        <span
                          className={`font-bold px-2 py-0.5 rounded ${
                            isLow
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : 'text-slate-200'
                          }`}
                        >
                          {part.quantityOnHand} on hand
                        </span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          Reorder at {part.reorderPoint}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right font-mono">
                        <div className="text-slate-300">
                          Cost: {formatCurrency(part.purchaseCost)}
                        </div>
                        <div className="text-emerald-400 text-[11px]">
                          Resale: {formatCurrency(part.typicalResaleValue)}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                            part.compatibilityTier === 'Confirmed compatible'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : part.compatibilityTier === 'Likely compatible—verify'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {part.compatibilityTier}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div
                          className="flex items-center justify-center gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => handleAdjustQuantity(part, -1)}
                            className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center text-sm cursor-pointer"
                          >
                            -
                          </button>
                          <span className="w-6 text-center font-mono font-bold text-white">
                            {part.quantityOnHand}
                          </span>
                          <button
                            onClick={() => handleAdjustQuantity(part, 1)}
                            className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center text-sm cursor-pointer"
                          >
                            +
                          </button>
                          <button
                            onClick={() => setPartToDelete(part)}
                            title="Delete Part from Inventory"
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors cursor-pointer ml-1 flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-semibold hidden sm:inline">Delete</span>
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

      {/* Part Detail Drawer / Modal */}
      {selectedPart && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-5 sm:p-6 space-y-4 text-slate-100 shadow-2xl">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800 gap-3">
              <div>
                <span className="text-xs font-mono text-amber-400">
                  {selectedPart.id} · BIN CONTROL
                </span>
                <h2 className="text-base font-bold text-white mt-0.5">
                  {selectedPart.name}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPartToDelete(selectedPart)}
                  className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Delete Part"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
                <button
                  onClick={() => setSelectedPart(null)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-500 block">Bin / Shelf Address:</span>
                  <span className="text-amber-300 font-mono font-bold text-sm">
                    {selectedPart.binLocation}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Supplier:</span>
                  <span className="text-slate-200 font-medium">
                    {selectedPart.supplier}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block mb-1 font-semibold">
                  Compatibility Rating
                </span>
                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-amber-300 font-medium">
                  {selectedPart.compatibilityTier}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Rule: Do not claim compatibility based only on a similar plug or voltage.
                </p>
              </div>

              <div>
                <span className="text-slate-400 block mb-1 font-semibold">
                  Confirmed Compatible Models
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedPart.compatibleModels.map((m, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 font-mono text-[11px]"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              {selectedPart.notes && (
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-slate-300">
                  <span className="text-slate-500 block text-[10px] uppercase">Tech Notes:</span>
                  {selectedPart.notes}
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => setPartToDelete(selectedPart)}
                className="px-3 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Part</span>
              </button>

              <button
                onClick={() => setSelectedPart(null)}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Part Modal */}
      {isNewPartModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-5 sm:p-6 space-y-4 text-slate-100">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-400" />
              <span>Add New Spare Part to Inventory</span>
            </h2>

            <form onSubmit={handleCreatePart} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Part Name & Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 10x2.5 Solid Tire, Zoom HB-100 Caliper"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Brand / Maker</label>
                  <input
                    type="text"
                    placeholder="e.g. Zoom, Nedong, KT, Wuxing"
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Initial Qty</label>
                  <input
                    type="number"
                    value={newQty}
                    onChange={(e) => setNewQty(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Reorder Level</label>
                  <input
                    type="number"
                    value={newReorder}
                    onChange={(e) => setNewReorder(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Unit Cost ($)</label>
                  <input
                    type="number"
                    value={newCost}
                    onChange={(e) => setNewCost(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Bin Location</label>
                  <input
                    type="text"
                    placeholder="Shelf 1, Bin B-03"
                    value={newBin}
                    onChange={(e) => setNewBin(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-amber-300 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Resale Value ($)</label>
                  <input
                    type="number"
                    value={newResale}
                    onChange={(e) => setNewResale(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-emerald-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Compatibility Tier</label>
                <select
                  value={newCompatTier}
                  onChange={(e) => setNewCompatTier(e.target.value as CompatibilityRating)}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                >
                  <option value="Confirmed compatible">Confirmed compatible</option>
                  <option value="Likely compatible—verify">Likely compatible—verify</option>
                  <option value="Unknown compatibility">Unknown compatibility</option>
                  <option value="Not compatible">Not compatible</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Compatible Models (comma-separated)</label>
                <input
                  type="text"
                  placeholder="Ninebot G30P, Xiaomi Pro 2, Zero 10X"
                  value={newCompatModels}
                  onChange={(e) => setNewCompatModels(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewPartModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Commit Part
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Part Deletion */}
      <ConfirmDeleteModal
        isOpen={!!partToDelete}
        title="Delete Inventory Part"
        itemDescription={partToDelete ? `${partToDelete.id} — ${partToDelete.name} (${partToDelete.brand})` : undefined}
        warningText="Permanently removes this part from bin tracking and spare inventory. Stock count will be cleared."
        onConfirm={() => {
          if (partToDelete && onDeletePart) {
            onDeletePart(partToDelete.id);
            if (selectedPart?.id === partToDelete.id) {
              setSelectedPart(null);
            }
            setPartToDelete(null);
          }
        }}
        onCancel={() => setPartToDelete(null)}
      />
    </div>
  );
};
