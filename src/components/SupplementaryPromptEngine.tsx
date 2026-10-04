import React, { useState } from 'react';
import {
  AlertCircle,
  Camera,
  Copy,
  CheckCircle2,
  Send,
  Sparkles,
  Info,
  ShieldAlert,
  ArrowRight,
  Maximize2,
  FileQuestion,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { ItemCategory } from '../types';

export interface SupplementaryPromptTemplate {
  id: string;
  category: ItemCategory;
  missingDatapoint: string;
  criticalityReason: string;
  exactShotDirective: string;
  aiStudioPromptTemplate: string;
  fieldTechnicianScript: string;
}

const PRESET_TEMPLATES: SupplementaryPromptTemplate[] = [
  {
    id: 'scooter-serial',
    category: 'mobility',
    missingDatapoint: 'Frame Serial Number Tag / Bottom Bracket VIN Stamping',
    criticalityReason:
      'Crucial for verifying authentic factory batch against local LEV theft databases, validating warranty status, and preventing dispute chargebacks from buyers claiming wrong model year.',
    exactShotDirective:
      'A well-lit macro photo of the stamped aluminum serial or QR sticker located on the underside of the scooter deck or bottom bracket shell. Must be taken 4–6 inches away with direct 5000K flashlight illumination and zero motion blur.',
    aiStudioPromptTemplate: `[SHUTTERBUCK FORENSIC AUDIT: SUPPLEMENTARY EVIDENCE REQUIRED]
STATUS: INSUFFICIENT CONFIDENCE (<80%)
ASSET CATEGORY: Light Electric Vehicle (LEV)
MISSING DATAPOINT: Frame Serial Number Tag / Bottom Bracket VIN Stamping
APPRAISAL IMPACT: Without verifiable optical confirmation of the 12+ digit stamped serial number, the system cannot cross-reference manufacturer revisions or verify clear title. Fast-cash valuation is capped at salvage floor until evidence is submitted.
REQUIRED SHOT DIRECTIVE: Provide a high-resolution, unblurred macro photograph (minimum 1080p) taken 4–6 inches away directly perpendicular to the underside bottom bracket or deck frame stamping. Ensure all alphanumeric characters are legible under direct, non-glare illumination.`,
    fieldTechnicianScript:
      'Hey! ShutterBuck confidence is currently restricted because the frame serial number / VIN is missing. Please snap a clear close-up photo of the metal stamped numbers on the underside of the frame/deck so we can unlock top-dollar pricing. Thanks!',
  },
  {
    id: 'scooter-battery',
    category: 'mobility',
    missingDatapoint: 'Battery Spec Rating Label (Nominal Voltage, Ah, Wh, UL Mark)',
    criticalityReason:
      'Crucial for distinguishing genuine OEM Panasonic/Samsung/LG cell packs from dangerous, fire-hazardous unbranded aftermarket packs. A counterfeit battery cuts resale value by $300-$500 and creates severe liability.',
    exactShotDirective:
      'A crisp close-up photo of the printed technical label on the lithium-ion battery pack casing, showing Nominal Voltage (e.g. 48V or 52V), Capacity (Ah / Wh), and manufacturer certification marks.',
    aiStudioPromptTemplate: `[SHUTTERBUCK FORENSIC AUDIT: SUPPLEMENTARY EVIDENCE REQUIRED]
STATUS: INSUFFICIENT CONFIDENCE (<80%)
ASSET CATEGORY: Light Electric Vehicle (LEV)
MISSING DATAPOINT: Battery Pack Specification Label (Nominal Voltage, Ah, Wh, UL 2849 / CE Marks)
APPRAISAL IMPACT: Inability to confirm OEM cell chemistry and capacity introduces catastrophic battery defect/fire risk. Appraisal models are blocked from certifying "Turnkey Ready" until voltage specifications and brand labels are optically verified.
REQUIRED SHOT DIRECTIVE: Shoot a close-up macro photo with direct diffused light perpendicular to the battery pack rating plate. The voltage (V), capacity (Ah/Wh), and model number must be crisp and in sharp focus.`,
    fieldTechnicianScript:
      'Quick action needed: We need a clear shot of the battery label sticker (showing the 48V/52V and Ah rating) before we can list this. Please grab a close-up with good lighting so we can price it safely.',
  },
  {
    id: 'card-centering',
    category: 'collectibles',
    missingDatapoint: 'Card Centering Details & Border Proportions (90° Flat View)',
    criticalityReason:
      'Crucial for determining raw grading potential. A shift from 50/50 centering to 70/30 drops a collectible card from a PSA 10 contender ($1,000+) down to raw binder filler ($80).',
    exactShotDirective:
      'A direct 90-degree overhead bird’s-eye photo of the card face laid flat on a matte dark background, with the camera parallel to the card so border widths on top, bottom, left, and right can be measured optically without perspective distortion.',
    aiStudioPromptTemplate: `[SHUTTERBUCK FORENSIC AUDIT: SUPPLEMENTARY EVIDENCE REQUIRED]
STATUS: INSUFFICIENT CONFIDENCE (<80%)
ASSET CATEGORY: Trading Cards & Collectibles
MISSING DATAPOINT: Precision Card Centering & Border Ratios
APPRAISAL IMPACT: Perspective tilt prevents mathematical measurement of left/right and top/bottom border geometry. Centering variance directly impacts whether to route to bulk fast-cash buylist vs PSA/CGC grading submission.
REQUIRED SHOT DIRECTIVE: Place card on a flat black microfiber surface. Position camera at exactly 90 degrees overhead (parallel to card surface). Capture all 4 yellow/silver borders in even, glare-free ambient light.`,
    fieldTechnicianScript:
      'Before we submit or price this card: Need a straight-down, 90-degree overhead photo on a black background so we can check centering borders. Make sure there is no reflection on the card face!',
  },
  {
    id: 'card-reverse-corners',
    category: 'collectibles',
    missingDatapoint: 'Card Back Corners & Edge Whitening Close-Up',
    criticalityReason:
      'Crucial because 90% of raw card deductions come from edge chipping and corner whitening on the dark reverse border.',
    exactShotDirective:
      'A macro shot of the bottom-left and top-right corners of the card back against a dark contrasting background, showing white core paper exposure or chipping under clean diffuse light.',
    aiStudioPromptTemplate: `[SHUTTERBUCK FORENSIC AUDIT: SUPPLEMENTARY EVIDENCE REQUIRED]
STATUS: INSUFFICIENT CONFIDENCE (<80%)
ASSET CATEGORY: Trading Cards & Collectibles
MISSING DATAPOINT: Reverse Perimeter Edge & Four-Corner Micro-Wear
APPRAISAL IMPACT: Condition tier cannot be conservatively established without optical evidence of white paper fiber fraying on the dark reverse border. Prevents "Item Not As Described" return disputes.
REQUIRED SHOT DIRECTIVE: Flip card over on a black mat. Take 2x optical zoom macro photos focused directly on the reverse corners. Avoid flash reflection in the card center.`,
    fieldTechnicianScript:
      'Need one more photo: Flip the card over on a dark surface and take a close-up of the corners on the back so we can verify if there is any white edge wear.',
  },
  {
    id: 'apparel-care-tag',
    category: 'apparel',
    missingDatapoint: 'Interior Hip Care Tag Bundle (RN# & Style Code)',
    criticalityReason:
      'Crucial for defeating counterfeit replicas and verifying exact garment release season, fabric composition (e.g. 3L Gore-Tex vs Paclite), and authentic OEM serial font.',
    exactShotDirective:
      'A well-lit macro photo of the white fabric wash tag bundle on the inside lower left hip, showing the RN number, CA number, and model style code in sharp focus.',
    aiStudioPromptTemplate: `[SHUTTERBUCK FORENSIC AUDIT: SUPPLEMENTARY EVIDENCE REQUIRED]
STATUS: INSUFFICIENT CONFIDENCE (<80%)
ASSET CATEGORY: Technical Outerwear / Apparel
MISSING DATAPOINT: Interior Hip Care Tag Bundle & Style Number
APPRAISAL IMPACT: Without optical confirmation of the RN/CA registry numbers and style code, authenticity risk remains elevated (HIGH), forcing a 35% safety discount against market value.
REQUIRED SHOT DIRECTIVE: Unfold the white tag bundle on the inside hip. Photograph with bright daylight so the printed text, production season code, and stitching rows are crisp and legible.`,
    fieldTechnicianScript:
      'Please send a close-up photo of the white tag inside the jacket hip (where the washing instructions and style number are). Need to confirm the style code to lock in the listing price!',
  },
];

interface SupplementaryPromptEngineProps {
  currentCategory?: ItemCategory;
  onUploadSupplementaryPhoto?: (file: File) => void;
}

export const SupplementaryPromptEngine: React.FC<SupplementaryPromptEngineProps> = ({
  currentCategory,
  onUploadSupplementaryPhoto,
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    PRESET_TEMPLATES[0].id
  );
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // Custom builder state
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [customMissingDatapoint, setCustomMissingDatapoint] = useState<string>('');
  const [customCriticality, setCustomCriticality] = useState<string>('');
  const [customExactShot, setCustomExactShot] = useState<string>('');

  const currentTemplate =
    PRESET_TEMPLATES.find((t) => t.id === selectedTemplateId) || PRESET_TEMPLATES[0];

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const activePromptText = isCustomMode
    ? `[SHUTTERBUCK FORENSIC AUDIT: SUPPLEMENTARY EVIDENCE REQUIRED]
STATUS: INSUFFICIENT CONFIDENCE (<80%)
MISSING DATAPOINT: ${customMissingDatapoint || 'Specific Hardware / Label Verification'}
APPRAISAL IMPACT: ${customCriticality || 'Mandatory forensic proof to clear valuation confidence threshold.'}
REQUIRED SHOT DIRECTIVE: ${customExactShot || 'Macro close-up under direct 5000K daylight with zero glare.'}`
    : currentTemplate.aiStudioPromptTemplate;

  const activeScriptText = isCustomMode
    ? `Hey! We need one more specific photo to complete the appraisal: ${customMissingDatapoint || 'Close-up shot'}. Directive: ${customExactShot || 'Take a clear close-up with good lighting'}. Thanks!`
    : currentTemplate.fieldTechnicianScript;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-amber-500/40 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-wider mb-1">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Supplementary Forensic Evidence Dispatcher</span>
            </div>
            <h1 className="text-2xl font-black text-slate-100 flex items-center gap-2">
              <span>AI Prompt Template for Missing Photos</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              When ShutterBuck's confidence rating is insufficient (&lt;80%), use this standardized template generator to articulate exactly which forensic element is missing, why it protects gross margins, and the exact physical shot required.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsCustomMode(!isCustomMode)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer bg-slate-800 text-slate-200 border-slate-700 hover:border-amber-500/50"
            >
              {isCustomMode ? 'Use Built-In Presets' : 'Build Custom Prompt'}
            </button>
          </div>
        </div>

        {/* Preset Selectors */}
        {!isCustomMode && (
          <div className="flex flex-wrap gap-2 mt-5">
            {PRESET_TEMPLATES.map((tmpl) => {
              const isSelected = selectedTemplateId === tmpl.id;
              return (
                <button
                  key={tmpl.id}
                  onClick={() => setSelectedTemplateId(tmpl.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-sm'
                      : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {tmpl.missingDatapoint}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Template Breakdown */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <FileQuestion className="w-4 h-4" />
              <span>Diagnostic Template Blueprint (The 3 Mandates)</span>
            </div>

            {isCustomMode ? (
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">
                    1. Missing Piece of Information (e.g. Serial tag, Card centering, Care label)
                  </label>
                  <input
                    type="text"
                    value={customMissingDatapoint}
                    onChange={(e) => setCustomMissingDatapoint(e.target.value)}
                    placeholder="e.g. Scooter Motor Hub Wattage Laser Engraving"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">
                    2. Why It's Crucial for Accurate Appraisal & Profit Protection
                  </label>
                  <textarea
                    rows={2}
                    value={customCriticality}
                    onChange={(e) => setCustomCriticality(e.target.value)}
                    placeholder="e.g. Distinguishes 350W commuter motor from 750W high-torque motor ($180 price difference)."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">
                    3. Exact Shot Needed (Angle, distance, lighting, specific area)
                  </label>
                  <textarea
                    rows={2}
                    value={customExactShot}
                    onChange={(e) => setCustomExactShot(e.target.value)}
                    placeholder="e.g. Close-up photo of the rear wheel hub motor lip, shot 5 inches away with daylight illumination."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3.5">
                {/* Mandate 1 */}
                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-[10px] font-mono text-amber-400 uppercase font-bold flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-[10px]">1</span>
                    <span>Identified Missing Evidence:</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-100">
                    {currentTemplate.missingDatapoint}
                  </p>
                </div>

                {/* Mandate 2 */}
                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-[10px] font-mono text-rose-400 uppercase font-bold flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-rose-500/20 text-rose-300 flex items-center justify-center text-[10px]">2</span>
                    <span>Appraisal Criticality & Profit Protection:</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {currentTemplate.criticalityReason}
                  </p>
                </div>

                {/* Mandate 3 */}
                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-[10px] font-mono text-emerald-400 uppercase font-bold flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-[10px]">3</span>
                    <span>Exact Optical Shot Directive:</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-mono">
                    {currentTemplate.exactShotDirective}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Copy-Paste Outputs & Technician Dispatch */}
        <div className="space-y-4">
          {/* AI Prompt Output Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Structured AI Studio Prompt Template</span>
              </span>
              <button
                onClick={() => handleCopy(activePromptText, 'ai')}
                className="px-2.5 py-1 rounded text-xs font-mono text-amber-400 hover:text-amber-300 bg-amber-500/10 border border-amber-500/30 flex items-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                <span>{copiedType === 'ai' ? 'Copied Prompt!' : 'Copy AI Prompt'}</span>
              </button>
            </div>

            <pre className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-[11px] font-mono text-amber-200/90 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
              {activePromptText}
            </pre>
          </div>

          {/* Field Technician SMS / WhatsApp Dispatch Script */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Send className="w-4 h-4 text-emerald-400" />
                <span>Field Scout / Technician SMS Script</span>
              </span>
              <button
                onClick={() => handleCopy(activeScriptText, 'sms')}
                className="px-2.5 py-1 rounded text-xs font-mono text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                <span>{copiedType === 'sms' ? 'Copied Script!' : 'Copy SMS Script'}</span>
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-300 italic">
              "{activeScriptText}"
            </div>

            {/* Direct Camera / File Upload for Supplementary Evidence */}
            <div className="pt-2 border-t border-slate-800">
              <label className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-950/30 cursor-pointer transition-all">
                <Camera className="w-4 h-4" />
                <span>Attach Supplementary Photo Now</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && onUploadSupplementaryPhoto) {
                      onUploadSupplementaryPhoto(file);
                    }
                  }}
                />
              </label>
              <p className="text-[10px] text-center text-slate-500 mt-1.5">
                Takes new macro photo with device camera to re-run appraisal and clear confidence gate
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
