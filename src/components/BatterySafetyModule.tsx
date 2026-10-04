import React, { useState } from 'react';
import {
  AppraisalDossier,
  BatterySafetyRecord,
} from '../types';
import {
  ShieldAlert,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Flame,
  Battery,
  BatteryCharging,
  Eye,
  Info,
  ExternalLink,
} from 'lucide-react';

interface BatterySafetyModuleProps {
  items: AppraisalDossier[];
  onUpdateItem: (item: AppraisalDossier) => void;
  onNavigateToItem: (itemId: string) => void;
  highlightItemId?: string | null;
}

export const BatterySafetyModule: React.FC<BatterySafetyModuleProps> = ({
  items,
  onUpdateItem,
  onNavigateToItem,
  highlightItemId,
}) => {
  // Extract all items with battery records or items classified as battery packs
  const batteryItems = items.filter(
    (i) => i.batteryRecord || i.itemType === 'battery_pack'
  );

  const [selectedItem, setSelectedItem] = useState<AppraisalDossier | null>(
    highlightItemId ? items.find((i) => i.id === highlightItemId) || null : null
  );

  const safetyHolds = batteryItems.filter(
    (i) => i.safetyHold || i.batteryRecord?.safetyHold || i.batteryRecord?.isSwollenOrPunctured
  );

  const safePacks = batteryItems.filter(
    (i) => !i.safetyHold && !i.batteryRecord?.safetyHold && !i.batteryRecord?.isSwollenOrPunctured
  );

  const handleUpdateBatteryRecord = (
    item: AppraisalDossier,
    updatedRecord: BatterySafetyRecord
  ) => {
    // If swollen or odor or severe sag, enforce safety hold
    const isUnsafe =
      updatedRecord.isSwollenOrPunctured ||
      updatedRecord.odorOrCorrosionDetected ||
      updatedRecord.chargeTestStatus === 'Hold' ||
      updatedRecord.bmsBehavior === 'Fault Code';

    const willHold = isUnsafe || updatedRecord.safetyHold;
    const holdReason = willHold
      ? updatedRecord.safetyHoldReason || 'Defective battery pack: swelling, odor, or cell sag.'
      : undefined;

    const updatedItem: AppraisalDossier = {
      ...item,
      safetyHold: willHold,
      safetyHoldReason: holdReason,
      status: willHold ? 'On hold' : item.status === 'On hold' ? 'Needs testing' : item.status,
      batteryRecord: {
        ...updatedRecord,
        safetyHold: willHold,
        safetyHoldReason: holdReason,
      },
    };

    onUpdateItem(updatedItem);
    setSelectedItem(updatedItem);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Zap className="w-6 h-6 text-amber-400" />
              <span>High-Risk Lithium Battery Safety Center</span>
            </h1>
            <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-bold font-mono">
              HAZMAT PROTOCOL
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Zero-tolerance thermal runaway defense. Every lithium pack logged, measured, and inspected for physical swelling.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-red-950/50 border border-red-500/40 text-red-300 text-xs font-mono font-bold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span>{safetyHolds.length} QUARANTINED</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{safePacks.length} VERIFIED SAFE</span>
          </div>
        </div>
      </div>

      {/* Safety Protocol Emergency SOP */}
      <div className="bg-red-950/20 border-2 border-red-500/40 rounded-xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center gap-2 text-red-300 font-bold text-sm">
          <Flame className="w-5 h-5 text-red-400 animate-pulse" />
          <span>WORKSHOP BATTERY SAFETY INVARIANTS (NON-NEGOTIABLE)</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-red-200/90">
          <div className="bg-slate-950/60 p-3 rounded-lg border border-red-500/20">
            <span className="font-bold text-red-300 block mb-1">1. Swelling = Permanent Hold</span>
            <p className="text-[11px] text-slate-400">
              Never charge, balance, or sell a pack with pouch gas expansion or bulging hardcase. Store in outdoor steel ammo can with vermiculite.
            </p>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-lg border border-red-500/20">
            <span className="font-bold text-red-300 block mb-1">2. No Bypassing BMS</span>
            <p className="text-[11px] text-slate-400">
              Never bypass protection circuitry or solder directly to live cells without certified spot welder and cell isolation barriers.
            </p>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-lg border border-red-500/20">
            <span className="font-bold text-red-300 block mb-1">3. Voltage Limits</span>
            <p className="text-[11px] text-slate-400">
              Packs sitting below 2.5V per cell (e.g. &lt;25V on a 36V 10S pack) suffer copper dendrite growth. Reject for resale.
            </p>
          </div>
        </div>
      </div>

      {/* Battery Inventory Cards Grid */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white flex items-center justify-between">
          <span>Battery Pack Records ({batteryItems.length})</span>
          <span className="text-xs font-mono text-slate-400 font-normal">
            Select pack to edit measurements
          </span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {batteryItems.map((item) => {
            const b = item.batteryRecord;
            const isHold = item.safetyHold || b?.safetyHold || b?.isSwollenOrPunctured;
            const nominalV = b?.nominalVoltage || 36;
            const measuredV = b?.measuredVoltage || 0;
            const percentage = b?.fullyChargedVoltage
              ? Math.min(100, Math.round(((measuredV - (nominalV * 0.8)) / (b.fullyChargedVoltage - (nominalV * 0.8))) * 100))
              : 85;

            return (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`p-4 rounded-xl border transition-all cursor-pointer group ${
                  isHold
                    ? 'bg-red-950/20 border-red-500/60 hover:border-red-400'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-mono font-bold text-amber-400">
                      {item.id}
                    </span>
                    <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                      {item.assetName}
                    </h3>
                  </div>

                  {isHold ? (
                    <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-bold font-mono">
                      QUARANTINE
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono">
                      TESTED PASS
                    </span>
                  )}
                </div>

                <div className="mt-3 space-y-2 text-xs">
                  {/* Voltage Status */}
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Measured / Nominal:</span>
                    <span className="font-mono font-semibold text-slate-200">
                      {measuredV ? `${measuredV}V` : 'Untested'} / {nominalV}V
                    </span>
                  </div>

                  {/* Battery Health Progress Bar */}
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full ${
                        isHold ? 'bg-red-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.max(10, Math.min(100, percentage))}%` }}
                    />
                  </div>

                  {/* Specs & Storage */}
                  <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-400 pt-1">
                    <div>
                      <span className="text-slate-500">Capacity:</span>{' '}
                      <span className="text-slate-300">{b?.capacityAh ? `${b.capacityAh}Ah` : 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Plug:</span>{' '}
                      <span className="text-slate-300">{b?.connectorType || 'DC Barrel'}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-500">Location:</span>{' '}
                      <span className="text-amber-300 font-mono">{b?.storageLocation || item.storageLocation}</span>
                    </div>
                  </div>

                  {isHold && (
                    <div className="p-2 bg-red-950/40 rounded border border-red-500/30 text-[11px] text-red-300">
                      <strong>Hold Reason:</strong> {item.safetyHoldReason || b?.safetyHoldReason || 'Pouch swelling'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Battery Detail & Diagnostic Modal */}
      {selectedItem && selectedItem.batteryRecord && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-5 sm:p-6 space-y-5 text-slate-100 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs font-mono text-amber-400">
                  {selectedItem.id} · BATTERY DIAGNOSTIC LOG
                </span>
                <h2 className="text-base font-bold text-white mt-0.5">
                  {selectedItem.assetName}
                </h2>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {selectedItem.safetyHold && (
              <div className="p-3.5 bg-red-950/40 border border-red-500/60 rounded-xl text-xs text-red-200 space-y-1">
                <span className="font-bold flex items-center gap-1.5 text-red-300">
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                  <span>SAFETY LOCK ENGAGED: SALE RESTRICTED</span>
                </span>
                <p>
                  This battery pack is blocked from being marked as 'Ready to list' or 'Sold'. Do not charge or leave unattended.
                </p>
              </div>
            )}

            {/* Diagnostic Fields */}
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Measured Voltage (V)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={selectedItem.batteryRecord.measuredVoltage}
                    onChange={(e) =>
                      handleUpdateBatteryRecord(selectedItem, {
                        ...selectedItem.batteryRecord!,
                        measuredVoltage: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-amber-300 font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Nominal Voltage (V)</label>
                  <input
                    type="number"
                    step="1"
                    value={selectedItem.batteryRecord.nominalVoltage}
                    onChange={(e) =>
                      handleUpdateBatteryRecord(selectedItem, {
                        ...selectedItem.batteryRecord!,
                        nominalVoltage: parseInt(e.target.value, 10) || 36,
                      })
                    }
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Capacity (Ah)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={selectedItem.batteryRecord.capacityAh}
                    onChange={(e) =>
                      handleUpdateBatteryRecord(selectedItem, {
                        ...selectedItem.batteryRecord!,
                        capacityAh: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Storage Location</label>
                  <input
                    type="text"
                    value={selectedItem.batteryRecord.storageLocation}
                    onChange={(e) =>
                      handleUpdateBatteryRecord(selectedItem, {
                        ...selectedItem.batteryRecord!,
                        storageLocation: e.target.value,
                      })
                    }
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono text-sm"
                  />
                </div>
              </div>

              {/* Physical Hazard Inspection Checklist */}
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2.5">
                <span className="font-semibold text-slate-300 block text-[11px] uppercase tracking-wider">
                  Physical Safety & Chemical Invariants
                </span>

                <label className="flex items-center justify-between p-2 rounded bg-slate-900/80 cursor-pointer">
                  <span className="text-slate-200">Swelling, Pouch Expansion, or Bulging</span>
                  <input
                    type="checkbox"
                    checked={selectedItem.batteryRecord.isSwollenOrPunctured}
                    onChange={(e) =>
                      handleUpdateBatteryRecord(selectedItem, {
                        ...selectedItem.batteryRecord!,
                        isSwollenOrPunctured: e.target.checked,
                      })
                    }
                    className="w-4 h-4 accent-red-500"
                  />
                </label>

                <label className="flex items-center justify-between p-2 rounded bg-slate-900/80 cursor-pointer">
                  <span className="text-slate-200">Chemical Odor, Leaking Electrolyte, or Heat</span>
                  <input
                    type="checkbox"
                    checked={selectedItem.batteryRecord.odorOrCorrosionDetected}
                    onChange={(e) =>
                      handleUpdateBatteryRecord(selectedItem, {
                        ...selectedItem.batteryRecord!,
                        odorOrCorrosionDetected: e.target.checked,
                      })
                    }
                    className="w-4 h-4 accent-red-500"
                  />
                </label>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <span className="text-slate-400 block mb-1">Charge Test</span>
                    <select
                      value={selectedItem.batteryRecord.chargeTestStatus}
                      onChange={(e) =>
                        handleUpdateBatteryRecord(selectedItem, {
                          ...selectedItem.batteryRecord!,
                          chargeTestStatus: e.target.value as any,
                        })
                      }
                      className="w-full p-2 rounded bg-slate-900 border border-slate-800 text-slate-200"
                    >
                      <option value="Passed">Passed (Charges normal)</option>
                      <option value="Failed">Failed (Will not charge)</option>
                      <option value="Untested">Untested</option>
                      <option value="Hold">Hold / Prohibited</option>
                    </select>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-1">BMS Behavior</span>
                    <select
                      value={selectedItem.batteryRecord.bmsBehavior}
                      onChange={(e) =>
                        handleUpdateBatteryRecord(selectedItem, {
                          ...selectedItem.batteryRecord!,
                          bmsBehavior: e.target.value as any,
                        })
                      }
                      className="w-full p-2 rounded bg-slate-900 border border-slate-800 text-slate-200"
                    >
                      <option value="Normal">Normal</option>
                      <option value="Tripping">Tripping Under Load</option>
                      <option value="Fault Code">Fault Code Active</option>
                      <option value="Untested">Untested</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Safety Hold Reason & Notes</label>
                <textarea
                  rows={2}
                  value={selectedItem.safetyHoldReason || ''}
                  onChange={(e) => {
                    const r = e.target.value;
                    handleUpdateBatteryRecord(selectedItem, {
                      ...selectedItem.batteryRecord!,
                      safetyHoldReason: r,
                      safetyHold: !!r,
                    });
                  }}
                  placeholder="Record swelling measurements, cell delta, or fire bunker bin number..."
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => {
                  onNavigateToItem(selectedItem.id);
                  setSelectedItem(null);
                }}
                className="text-xs text-amber-400 hover:text-amber-300 font-medium"
              >
                Open in Inventory Ledger &rarr;
              </button>

              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700"
              >
                Close Diagnostic Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
