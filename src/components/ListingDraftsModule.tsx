import React, { useState } from 'react';
import {
  AppraisalDossier,
} from '../types';
import { formatCurrency } from '../utils/storage';
import {
  Tag,
  Copy,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Camera,
  MessageSquare,
  DollarSign,
  Share2,
} from 'lucide-react';

interface ListingDraftsModuleProps {
  items: AppraisalDossier[];
  selectedItemId?: string | null;
  onNavigateToItem: (itemId: string) => void;
}

type PlatformType = 'offerup' | 'facebook' | 'craigslist' | 'ebay';

export const ListingDraftsModule: React.FC<ListingDraftsModuleProps> = ({
  items,
  selectedItemId,
  onNavigateToItem,
}) => {
  const eligibleItems = items.filter((i) => !i.safetyHold);
  const [activeItemId, setActiveItemId] = useState<string>(
    selectedItemId || eligibleItems[0]?.id || items[0]?.id || ''
  );
  const [platform, setPlatform] = useState<PlatformType>('offerup');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const currentItem = items.find((i) => i.id === activeItemId) || items[0];

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(label);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  if (!currentItem) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
        No inventory items available to generate listing drafts.
      </div>
    );
  }

  const isHold = currentItem.safetyHold;
  const askingPrice = currentItem.financials.fastCashPrice || 0;
  const lowestPrice = currentItem.turnkeyListing.lowestAcceptablePrice || currentItem.financials.bottomDollarWalkAwayPrice || Math.round(askingPrice * 0.85);
  const title = currentItem.turnkeyListing.title || `${currentItem.assetName} - Tested Working`;
  const defects = currentItem.turnkeyListing.honestDefectsDisclosure || currentItem.conditionReport.visibleDefects || [];
  const included = currentItem.turnkeyListing.includedItems || ['Vehicle', 'Charger'];
  const missing = currentItem.turnkeyListing.missingItems || ['Original packaging'];

  // Formatted platform description
  const fullListingText = `
${title}

PRICE: $${askingPrice} CASH ONLY (Firm rock-bottom is $${lowestPrice})
PICKUP LOCATION: Daylight exchange at local Police Station Safe Exchange Zone or Bank Lobby in Los Angeles.

--- SPECIFICATIONS & DOCUMENTED EVIDENCE ---
• Make / Model: ${currentItem.identification.manufacturer} ${currentItem.identification.modelLine}
• Serial / Frame ID: ${currentItem.identification.detectedSerialOrTags || 'Recorded on intake'}
• Mechanical Condition: ${currentItem.conditionReport.mechanicalOrWearStatus || 'Tested functional on stand'}
• Battery Health: ${currentItem.batteryRecord ? `${currentItem.batteryRecord.measuredVoltage}V measured (Nominal: ${currentItem.batteryRecord.nominalVoltage}V). Passed charge bench test.` : 'Holds charge, charger included.'}

--- HONEST DEFECT DISCLOSURE ---
${defects.length > 0 ? defects.map((d) => `• ${d}`).join('\n') : '• Normal minor cosmetic road scuffs from previous use; no structural cracks or bent forks.'}

--- INCLUDED IN SALE ---
${included.map((item) => `✓ ${item}`).join('\n')}

--- NOT INCLUDED / MISSING ---
${missing.length > 0 ? missing.map((item) => `✗ ${item}`).join('\n') : '✗ None'}

--- TEST RIDE POLICY ---
Full asking price cash deposited in seller's hand before feet touch the deck/pedals. Immediate refund if you decide not to buy. No Zelle, checks, or remote wire transfers.

DISCLAIMER: Sold strictly as-is, in documented working condition. Buyer assumes full responsibility for protective gear, helmet use, and local laws.
`.trim();

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Tag className="w-6 h-6 text-amber-400" />
            <span>Honest Marketplace Listing Drafts</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Compliant, dispute-proof marketplace copy. No unsupported claims or hidden defects.
          </p>
        </div>

        {/* Item Selector */}
        <div className="w-full sm:w-72">
          <select
            value={activeItemId}
            onChange={(e) => setActiveItemId(e.target.value)}
            className="w-full py-2 px-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs font-semibold focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            {items.map((i) => (
              <option key={i.id} value={i.id}>
                {i.safetyHold ? '⚠️ [HOLD] ' : ''}
                {i.id} - {i.assetName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Safety Hold Warning Banner if active */}
      {isHold && (
        <div className="p-4 bg-red-950/40 border-2 border-red-500/60 rounded-xl text-red-200 text-xs space-y-1">
          <div className="font-bold flex items-center gap-2 text-red-300">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span>LISTING PROHIBITED: ITEM IS UNDER SAFETY HOLD</span>
          </div>
          <p>
            Do not list this vehicle on any marketplace until all mechanical or battery swelling defects are resolved and verified by quality control.
          </p>
        </div>
      )}

      {/* Platform Switcher */}
      <div className="flex items-center gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs overflow-x-auto">
        {(
          [
            { id: 'offerup', label: 'OfferUp' },
            { id: 'facebook', label: 'Facebook Marketplace' },
            { id: 'craigslist', label: 'Craigslist Los Angeles' },
            { id: 'ebay', label: 'eBay (Local Pickup)' },
          ] as { id: PlatformType; label: string }[]
        ).map((p) => (
          <button
            key={p.id}
            onClick={() => setPlatform(p.id)}
            className={`py-2 px-4 rounded-lg font-semibold transition-colors whitespace-nowrap cursor-pointer ${
              platform === p.id
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Main Draft Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Formatted Draft Output */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Optimized Listing Title
              </span>
              <button
                onClick={() => handleCopy(title, 'title')}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedSection === 'title' ? 'Copied!' : 'Copy Title'}</span>
              </button>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-100 font-mono text-sm font-semibold">
              {title}
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Full Description & Honest Disclosures
              </span>
              <button
                onClick={() => handleCopy(fullListingText, 'full')}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedSection === 'full' ? 'Copied Entire Draft!' : 'Copy Entire Text'}</span>
              </button>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-slate-300 font-mono text-xs whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
              {fullListingText}
            </div>
          </div>
        </div>

        {/* Right Column: Pricing Strategy & Pre-Emptive Scripts */}
        <div className="lg:col-span-4 space-y-4">
          {/* Pricing Guardrails */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 text-xs">
            <span className="font-bold text-slate-200 block text-xs uppercase tracking-wider">
              Pricing Guardrails
            </span>
            <div className="grid grid-cols-2 gap-2 font-mono">
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Suggested Asking</span>
                <span className="text-base font-bold text-emerald-400">{formatCurrency(askingPrice)}</span>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Walk-Away Lowest</span>
                <span className="text-base font-bold text-slate-200">{formatCurrency(lowestPrice)}</span>
              </div>
            </div>
          </div>

          {/* Photo Checklist */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2 text-xs">
            <span className="font-bold text-slate-200 block text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-amber-400" />
              <span>Mandatory Photo Checklist</span>
            </span>
            <ul className="space-y-1.5 text-slate-300 text-[11px]">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Right-side complete profile in daylight</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Odometer / Display lit with zero error codes</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Tire tread depth & brake pad thickness</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Charger plugged in showing solid green/red light</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Close-up of serial number plate on frame</span>
              </li>
            </ul>
          </div>

          {/* Expected Buyer Questions & Anti-Lowball Defense */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 text-xs">
            <span className="font-bold text-slate-200 block text-xs uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-amber-400" />
              <span>Instant Buyer Response Scripts</span>
            </span>

            <div className="space-y-2 text-[11px]">
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-amber-400 font-semibold block mb-0.5">On "What's your lowest cash price?"</span>
                <p className="text-slate-300">
                  {currentItem.negotiationScripts.onLowballOffer}
                </p>
              </div>

              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-amber-400 font-semibold block mb-0.5">On "Can I test ride it?"</span>
                <p className="text-slate-300">
                  {currentItem.negotiationScripts.onTestRideOrInspection}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
