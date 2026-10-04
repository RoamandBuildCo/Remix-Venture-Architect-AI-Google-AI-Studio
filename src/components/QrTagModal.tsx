import React, { useEffect, useState } from 'react';
import {
  X,
  Printer,
  Download,
  Copy,
  Check,
  QrCode,
  Tag,
  DollarSign,
  ShieldAlert,
  ExternalLink,
  Layers
} from 'lucide-react';
import { AppraisalDossier } from '../types';
import { generateAssetQrDataUrl, getAssetDeepLink } from '../utils/qr';
import { formatCurrency } from '../utils/storage';

interface QrTagModalProps {
  item: AppraisalDossier;
  allItems?: AppraisalDossier[];
  onClose: () => void;
}

export const QrTagModal: React.FC<QrTagModalProps> = ({ item, allItems = [], onClose }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [batchMode, setBatchMode] = useState<boolean>(false);
  const [batchQrCodes, setBatchQrCodes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(true);

  const deepLink = getAssetDeepLink(item.id);

  // Generate QR for active item
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    generateAssetQrDataUrl(item.id)
      .then((url) => {
        if (isMounted) {
          setQrDataUrl(url);
          setLoading(false);
        }
      })
      .catch((e) => {
        console.error(e);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [item.id]);

  // Generate QR for all items if batch mode selected
  useEffect(() => {
    if (!batchMode) return;
    let isMounted = true;

    async function loadBatch() {
      const results: Record<string, string> = {};
      for (const itm of allItems) {
        try {
          results[itm.id] = await generateAssetQrDataUrl(itm.id);
        } catch (e) {
          console.error(e);
        }
      }
      if (isMounted) {
        setBatchQrCodes(results);
      }
    }

    loadBatch();

    return () => {
      isMounted = false;
    };
  }, [batchMode, allItems]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(deepLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `QR_Tag_${item.id}_${item.assetName.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 no-print">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block font-bold">
                PHYSICAL INVENTORY TAG ENGINE
              </span>
              <h3 className="text-base font-black text-white">
                {batchMode ? 'Batch Printable Asset Labels Sheet' : `Physical Asset Tag: ${item.assetName}`}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {allItems.length > 1 && (
              <button
                onClick={() => setBatchMode(!batchMode)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  batchMode
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{batchMode ? 'Single Tag View' : `Batch Sheet (${allItems.length})`}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        {batchMode ? (
          /* BATCH PRINT SHEET VIEW */
          <div className="space-y-4">
            <div className="no-print bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
              <span>Ready to print <strong>{allItems.length} asset labels</strong>. Sized for standard sticker sheets or card stock.</span>
              <button
                onClick={handlePrint}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-950/30"
              >
                <Printer className="w-4 h-4" />
                <span>PRINT ALL TAGS NOW</span>
              </button>
            </div>

            {/* Print Container Grid */}
            <div className="print-area grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto p-2 scrollbar-thin">
              {allItems.map((itm) => (
                <div
                  key={itm.id}
                  className="bg-white text-slate-900 border-2 border-dashed border-slate-400 rounded-xl p-4 flex gap-3 shadow-md print:shadow-none print:border-black print:m-1"
                >
                  <div className="shrink-0 w-24 h-24 bg-white p-1 border border-slate-300 rounded-lg flex items-center justify-center">
                    {batchQrCodes[itm.id] ? (
                      <img src={batchQrCodes[itm.id]} alt="QR" className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-[10px] text-slate-400 font-mono">Generating...</span>
                    )}
                  </div>

                  <div className="flex-1 text-xs space-y-1 overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-300">
                        {itm.category}
                      </span>
                      <span className="text-[9px] font-mono text-slate-500">ID: {itm.id.slice(-6)}</span>
                    </div>

                    <h4 className="font-black text-slate-900 leading-tight text-xs truncate">
                      {itm.assetName}
                    </h4>

                    <div className="flex items-baseline gap-2 pt-0.5">
                      <span className="text-[10px] font-mono text-slate-600">ASK:</span>
                      <span className="font-black text-sm text-emerald-700 font-mono">
                        {formatCurrency(itm.financials.fastCashPrice)}
                      </span>
                      <span className="text-[9px] font-mono text-slate-500">
                        (Floor: ${itm.financials.bottomDollarWalkAwayPrice})
                      </span>
                    </div>

                    <div className="text-[9px] text-slate-600 line-clamp-1">
                      {itm.conditionReport.conditionTier}
                    </div>

                    <div className="text-[8px] font-mono text-slate-500 uppercase tracking-tight pt-1 border-t border-slate-200">
                      Scan QR for Forensic Dossier & Scripts
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* SINGLE TAG PREVIEW */
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
              {/* Physical Printable Tag Preview Card */}
              <div
                id="printable-single-tag"
                className="print-area w-72 bg-white text-slate-950 rounded-2xl p-5 border-2 border-slate-900 shadow-xl print:shadow-none space-y-3 shrink-0"
              >
                {/* Header of physical tag */}
                <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-black tracking-widest text-slate-900 uppercase font-mono block">
                      SHUTTERBUCK // ASSET CONTROL
                    </span>
                    <span className="text-[10px] font-bold text-slate-700 font-mono block">
                      ASSET #{item.id.slice(-6).toUpperCase()}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 text-[9px] font-black uppercase font-mono rounded bg-slate-900 text-white">
                    {item.category}
                  </span>
                </div>

                {/* QR Code and Pricing Center */}
                <div className="flex flex-col items-center justify-center p-2 bg-slate-50 rounded-xl border border-slate-300">
                  {loading ? (
                    <div className="w-36 h-36 flex items-center justify-center text-xs font-mono text-slate-500">
                      Generating QR...
                    </div>
                  ) : (
                    <img
                      src={qrDataUrl}
                      alt={`QR Code for ${item.assetName}`}
                      className="w-36 h-36 object-contain"
                    />
                  )}
                  <span className="text-[9px] font-mono font-bold text-slate-600 mt-1 uppercase tracking-wider">
                    SCAN TO PULL DOSSIER
                  </span>
                </div>

                {/* Asset Name & Specs */}
                <div>
                  <h4 className="font-black text-sm text-slate-950 leading-snug line-clamp-2">
                    {item.assetName}
                  </h4>
                  <p className="text-[10px] text-slate-600 font-mono mt-0.5">
                    {item.identification.manufacturer} · {item.conditionReport.conditionTier}
                  </p>
                </div>

                {/* Pricing Box */}
                <div className="bg-slate-900 text-white rounded-xl p-2.5 flex items-center justify-between font-mono">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase block font-semibold">Fast Cash Target</span>
                    <span className="text-lg font-black text-emerald-400">
                      {formatCurrency(item.financials.fastCashPrice)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-slate-400 uppercase block font-semibold">Walk-Away Floor</span>
                    <span className="text-sm font-bold text-rose-300">
                      {formatCurrency(item.financials.bottomDollarWalkAwayPrice)}
                    </span>
                  </div>
                </div>

                {/* Safety Clause on physical tag */}
                <div className="text-[8px] font-mono font-bold text-slate-700 bg-amber-100 border border-amber-300 rounded p-1.5 text-center leading-tight">
                  POLICE SAFE ZONE EXCHANGE · CASH IN HAND BEFORE TEST RIDE
                </div>
              </div>

              {/* Instructions & Quick Actions */}
              <div className="space-y-4 text-xs text-slate-300 max-w-xs no-print">
                <div className="space-y-1.5">
                  <h4 className="font-bold text-white font-mono flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-amber-400" />
                    Physical Asset Tag Protocol:
                  </h4>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    Print this tag on standard card stock or label adhesive. Tape or zip-tie it to:
                  </p>
                  <ul className="list-disc list-inside text-slate-400 space-y-1 text-[11px] pl-1">
                    <li>E-bike handlebars or scooter stem</li>
                    <li>TCG card magnetic top-loader sleeve</li>
                    <li>Clothing garment hanger or poly-bag</li>
                  </ul>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block font-semibold">
                    Instant Scanner Deep Link:
                  </span>
                  <p className="text-[10px] font-mono text-slate-300 break-all bg-slate-900 p-2 rounded border border-slate-800">
                    {deepLink}
                  </p>
                  <button
                    onClick={handleCopyLink}
                    className="w-full py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
                    <span>{copiedLink ? 'COPIED TO CLIPBOARD' : 'COPY DIRECT URL'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer Controls */}
        <div className="border-t border-slate-800 pt-3 flex flex-wrap items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadQr}
              disabled={loading || !qrDataUrl}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-sky-400" />
              <span>Download QR PNG</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-950/30"
            >
              <Printer className="w-4 h-4" />
              <span>{batchMode ? 'PRINT BATCH SHEET' : 'PRINT THIS TAG'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
