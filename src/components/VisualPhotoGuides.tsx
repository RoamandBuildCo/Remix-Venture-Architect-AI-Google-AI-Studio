import React, { useState } from 'react';
import {
  Camera,
  Sun,
  Maximize2,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Info,
  ChevronRight,
  CheckSquare,
  Square,
  Copy,
  Printer
} from 'lucide-react';

interface VisualPhotoGuidesProps {
  onSelectCategoryForIntake?: (category: 'mobility' | 'collectibles' | 'apparel') => void;
  onOpenAppraiser?: () => void;
}

export const VisualPhotoGuides: React.FC<VisualPhotoGuidesProps> = ({
  onSelectCategoryForIntake,
  onOpenAppraiser,
}) => {
  const [activeCategory, setActiveCategory] = useState<'mobility' | 'collectibles' | 'apparel'>('mobility');
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [copiedAngle, setCopiedAngle] = useState<string | null>(null);

  const toggleCheck = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyGuideSummary = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAngle(id);
    setTimeout(() => setCopiedAngle(null), 2500);
  };

  const guides = {
    mobility: {
      title: 'E-Bikes & Electric Scooters',
      tagline: 'Light Electric Vehicle (LEV) Forensic Photography Protocol',
      icon: '🛴',
      overview:
        'To establish verified 99%+ appraisal confidence on e-bikes and scooters, the optical engine must independently extract the frame serial, battery pack nominal specs, motor wattage, and controller integrity. Never shoot in low garage shadows.',
      lighting: {
        headline: '5000K Neutral Daylight / Dual-Worklight Garage Setup',
        specs: [
          'Indirect, high-CRI (>90) lighting: Place two 5000K LED worklights at 45° to eliminate hard shadows.',
          'Anti-Glare HUD Polarizer: Tilt phone 10-15° off-perpendicular when shooting LCD displays to avoid reflection blindness.',
          'Zero Backlight: Never shoot an e-bike in front of an open sunny garage door where backlight silhouetted details get crushed to black.',
          'Battery Label Illumination: Use a focused flashlight directly illuminating stamped foil labels on the battery casing.',
        ],
      },
      angles: [
        {
          id: 'mob-1',
          code: 'ANG-01',
          name: 'Drive-Side Full Profile',
          shotType: 'Wide 4:3 (Eye-Level)',
          description: 'Full profile from 8-10 feet away showing chain/belt drive, derailleur, rear motor hub, and kickstand.',
          whyCrucial: 'Proves true frame geometry, detects bent front forks, and reveals aftermarket motor hub conversions.',
          targetZones: ['Rear hub motor casing', 'Chain tension & derailleur hanger', 'Seat post clamp & rear rack'],
        },
        {
          id: 'mob-2',
          code: 'ANG-02',
          name: 'Cockpit & LCD Dashboard Active',
          shotType: 'Medium 1:1 (45° Angle)',
          description: 'Turn vehicle power ON. Frame entire handlebar, brake levers, throttle, and illuminated speedometer.',
          whyCrucial: 'Documents odometer mileage, battery voltage readout, and confirms absence of error codes (e.g., Error 07/09).',
          targetZones: ['Lit LCD dashboard with zero glare', 'Brake lever hydraulic reservoir', 'Throttle trigger & grip wear'],
        },
        {
          id: 'mob-3',
          code: 'ANG-03',
          name: 'Frame Serial Number / VIN Stamp',
          shotType: 'Macro Close-Up (4-6 Inches)',
          description: 'Perpendicular close-up of engraved serial on bottom bracket shell, head tube, or underside frame.',
          whyCrucial: 'Mandatory for LEV stolen property databases, OEM year verification, and dispute-proof buyer escrow.',
          targetZones: ['All stamped alphanumeric characters', 'Bottom bracket weld integrity', 'Paint adhesion around stamp'],
        },
        {
          id: 'mob-4',
          code: 'ANG-04',
          name: 'Battery Pack Rating Label & Keyway',
          shotType: 'Macro Close-Up (Direct Flash/Torch)',
          description: 'Clean macro shot of the OEM manufacturer label detailing nominal Voltage (36V/48V/52V), Ah, Wh, and UL 2849 / CE cert.',
          whyCrucial: 'Distinguishes genuine Panasonic/Samsung/LG cell packs from hazardous fire-hazard unbranded knockoffs.',
          targetZones: ['Volts (V), Amp-Hours (Ah), Watt-Hours (Wh)', 'Key lock cylinder & charge port condition', 'Zero bulging or puncture marks'],
        },
        {
          id: 'mob-5',
          code: 'ANG-05',
          name: 'Brake Calipers & Disc Rotor Wear',
          shotType: 'Close-Up (Edge-On)',
          description: 'Wheel hub close-up showing disc brake rotor thickness, pad wear groove, and caliper mounting bolts.',
          whyCrucial: 'Validates safety roadworthiness and calculates immediate maintenance deductions before quoting walk-away price.',
          targetZones: ['Rotor disc surface scoring', 'Brake pad thickness (>1.5mm)', 'Hydraulic caliper hose crimp'],
        },
        {
          id: 'mob-6',
          code: 'ANG-06',
          name: 'Tire Tread & Sidewall PSI Rating',
          shotType: 'Macro Surface',
          description: 'Close-up of front and rear tire contact patch and sidewall showing brand (e.g. CST, Kenda) and max PSI.',
          whyCrucial: 'Estimates remaining tire lifespan (80% vs 20%) to prevent post-sale buyer return claims.',
          targetZones: ['Center tire bead wear', 'Sidewall dry-rot or cracking', 'Valve stem alignment'],
        },
      ],
      schematicDiagram: (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300">
          <div className="text-amber-400 font-bold mb-2 flex items-center gap-2">
            <span>[SCHEMATIC: 6-POINT LEV OPTICAL VECTOR MAP]</span>
          </div>
          <div className="relative border border-dashed border-slate-700 rounded-lg p-6 bg-slate-950/70 text-center">
            <div className="inline-block relative py-4 px-8 border border-amber-500/30 rounded-lg bg-slate-900/90 text-amber-200">
              <span className="text-xl">🚲 [LEV FRAME CHASSIS]</span>
              {/* Hotspot Badges */}
              <div className="absolute -top-3 left-4 px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-bold text-[10px]">
                ANG-02: Cockpit HUD
              </div>
              <div className="absolute -bottom-3 left-8 px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-bold text-[10px]">
                ANG-03: VIN / Bottom Bracket
              </div>
              <div className="absolute top-1/2 -left-6 -translate-y-1/2 px-2 py-0.5 rounded bg-sky-500 text-slate-950 font-bold text-[10px]">
                ANG-05: Front Brake
              </div>
              <div className="absolute top-1/2 -right-6 -translate-y-1/2 px-2 py-0.5 rounded bg-indigo-500 text-slate-950 font-bold text-[10px]">
                ANG-01: Rear Hub Motor
              </div>
              <div className="absolute -top-3 right-8 px-2 py-0.5 rounded bg-rose-500 text-slate-950 font-bold text-[10px]">
                ANG-04: Battery Specs
              </div>
            </div>
            <p className="mt-4 text-[11px] text-slate-400">
              6 required photo vectors needed to clear the 98%+ Viability Threshold
            </p>
          </div>
        </div>
      ),
    },
    collectibles: {
      title: 'Trading Cards & Rare Collectibles',
      tagline: 'High-Resolution Sub-Surface Grading & Centering Protocol',
      icon: '🃏',
      overview:
        'Raw card appraisal requires micro-flaw detection (edge silvering, surface indentations, foil scratching) to differentiate a $60 raw card from a $600 Grade 9 contender.',
      lighting: {
        headline: 'Matte Overhead Diffuse Light with 20° Raking Light Inspection',
        specs: [
          'Black Matte Background: Place card on a pure black microfiber cloth or grading pad so white corner chipping pops clearly.',
          'Zero Direct Camera Flash: Never use phone flash directly perpendicular to the card (causes white-out blinding the art box).',
          '20° Raking Light Sweep: Hold a secondary flashlight at a shallow 15°–20° angle across the foil surface to illuminate hairline scratches and micro-creases.',
          'Even Centering Grid: Align phone perfectly flat (90° bird’s-eye view) using the camera grid lines.',
        ],
      },
      angles: [
        {
          id: 'card-1',
          code: 'ANG-01',
          name: 'Direct 90° Bird’s-Eye Front View',
          shotType: 'Perpendicular Overhead (1:1 Square)',
          description: 'Camera parallel to card surface. Perfectly centered with full border visible against dark background.',
          whyCrucial: 'Enables mathematical border measurement (50/50 vs 60/40 centering) and text sharpness audit.',
          targetZones: ['Top, bottom, left, right border widths', 'Art box registration & holo foil pattern', 'Copyright and set stamp'],
        },
        {
          id: 'card-2',
          code: 'ANG-02',
          name: 'Direct 90° Bird’s-Eye Reverse (Card Back)',
          shotType: 'Perpendicular Overhead',
          description: 'Card back centered on black background with corners fully lit without shadow spill.',
          whyCrucial: '90% of card condition grades are lost on reverse corner whitening and edge chipping.',
          targetZones: ['All 4 reverse corners', 'Blue/purple perimeter border chipping', 'Center surface scuffs'],
        },
        {
          id: 'card-3',
          code: 'ANG-03',
          name: '15° Low-Angle Raking Light Surface Shot',
          shotType: 'Angled Macro',
          description: 'Tilt card or light source at 15-20° so light rakes across the glossy finish.',
          whyCrucial: 'Exposes micro-creases, print lines, roller marks, and fingernail indentations invisible in flat lighting.',
          targetZones: ['Holo foil window reflection', 'Gloss uniformity across card stock', 'Absence of binder ring dents'],
        },
        {
          id: 'card-4',
          code: 'ANG-04',
          name: 'Four-Corner Macro Quad Shot',
          shotType: 'Extreme Macro (2x Optical Zoom)',
          description: 'Four sharp close-up shots of top-left, top-right, bottom-left, and bottom-right corners.',
          whyCrucial: 'Detects corner blunting, surface layer separation, and fake counterfeit card layered edges.',
          targetZones: ['Sharpness of corner radius', 'White paper stock core integrity', 'Foil overlay alignment'],
        },
      ],
      schematicDiagram: (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300">
          <div className="text-amber-400 font-bold mb-2 flex items-center gap-2">
            <span>[SCHEMATIC: TCG CENTERING & SURFACE AUDIT]</span>
          </div>
          <div className="border border-dashed border-slate-700 rounded-lg p-6 bg-slate-950/70 text-center flex flex-col items-center">
            <div className="w-40 h-56 border-4 border-amber-500/50 rounded-lg bg-slate-900 p-2 relative flex flex-col justify-between">
              <div className="border border-slate-700 h-28 rounded bg-slate-800/80 flex items-center justify-center text-[10px] text-amber-300">
                ✨ HOLO FOIL WINDOW
              </div>
              <div className="text-[9px] text-slate-400 border-t border-slate-700 pt-1">
                L: 50% | R: 50% Border Centering
              </div>

              {/* Corner callout badges */}
              <span className="absolute -top-2 -left-2 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 font-bold text-[9px] flex items-center justify-center">1</span>
              <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 font-bold text-[9px] flex items-center justify-center">2</span>
              <span className="absolute -bottom-2 -left-2 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 font-bold text-[9px] flex items-center justify-center">3</span>
              <span className="absolute -bottom-2 -right-2 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 font-bold text-[9px] flex items-center justify-center">4</span>
            </div>
            <p className="mt-3 text-[11px] text-slate-400">
              Inspect all 4 corner points on high-contrast black backdrop
            </p>
          </div>
        </div>
      ),
    },
    apparel: {
      title: 'Apparel & Technical Outerwear',
      tagline: 'Fabric Authenticity, RN Wash Tags & Hardware Verification',
      icon: '🧥',
      overview:
        'High-value outerwear (Arc’teryx, Patagonia, The North Face, Stone Island) requires proving waterproof seam tape integrity, authentic zipper branding, and factory RN style tags.',
      lighting: {
        headline: 'Color-Accurate CRI>90 Daylight White (No Yellow Tungsten)',
        specs: [
          'Natural Overcast Daylight or 5500K Studio Bulb: Prevents color distortion (e.g. navy looking black or faded olive looking gray).',
          'Flat Lay on Clean Neutral Surface or Wooden Hanger: Hang jacket fully zipped with arms spread slightly.',
          'Interior Illumination: Fold garment open to photograph internal neck and hip seam taping without fabric shadows.',
          'Hardware Macro Focus: Tap screen directly on zipper sliders to lock focus on metal engraving.',
        ],
      },
      angles: [
        {
          id: 'app-1',
          code: 'ANG-01',
          name: 'Full Front Flat Lay / Wide Hanger View',
          shotType: 'Full Body Vertical (3:4 Ratio)',
          description: 'Garment fully zipped, laid flat or hung evenly on a plain wall or door. Entire silhouette visible.',
          whyCrucial: 'Displays true garment proportions, pocket layout, front logo embroidery placement, and drape.',
          targetZones: ['Chest embroidery / screen print', 'Main zipper alignment', 'Hem drawcord symmetry'],
        },
        {
          id: 'app-2',
          code: 'ANG-02',
          name: 'Full Rear View & Hem Silhouette',
          shotType: 'Full Body Vertical',
          description: 'Back of garment showing hood profile, rear ventilation yokes, drop hem, and back panel seams.',
          whyCrucial: 'Exposes back stains, backpack abrasion wear, and authentic brand back-neck logos.',
          targetZones: ['Shoulder panel wear', 'Lower lumbar / pack rubbing zone', 'Hood brim shape'],
        },
        {
          id: 'app-3',
          code: 'ANG-03',
          name: 'Interior Hip Care & RN Style Tag',
          shotType: 'Extreme Macro',
          description: 'Unfold the white fabric tag bundle located inside the lower hip. Shoot style code, RN#, and CA#.',
          whyCrucial: 'The ultimate counter to fake counterfeit apparel. Style codes match exact release season and model line.',
          targetZones: ['RN & CA registered numbers', 'Model style code (e.g. 26844-XXXX)', 'Fabric composition percentages'],
        },
        {
          id: 'app-4',
          code: 'ANG-04',
          name: 'Seam Tape & GORE-TEX Lamination',
          shotType: 'Macro Close-Up (Inside Neck/Hood)',
          description: 'Turn jacket partially inside out. Photograph interior neck seam tape where sweat causes delamination.',
          whyCrucial: 'Bubbled or peeling seam tape renders waterproof jackets defective and drops resale value by 70%.',
          targetZones: ['Zero tape bubbling or peeling', 'Heat-press size label crispness', 'Hanger loop stitching'],
        },
        {
          id: 'app-5',
          code: 'ANG-05',
          name: 'Hardware & Zipper Brand Stamp',
          shotType: 'Macro Close-Up',
          description: 'Close-up of main zipper slider back and pull tab showing OEM stamping (YKK, RiRi, Talon, Lampo).',
          whyCrucial: 'Counterfeit jackets frequently use generic zipper molds that fail within weeks. Authenticates OEM hardware.',
          targetZones: ['Zipper teeth alignment', 'Slider brand stamp', 'Rubber zipper garage / weather seals'],
        },
      ],
      schematicDiagram: (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300">
          <div className="text-amber-400 font-bold mb-2 flex items-center gap-2">
            <span>[SCHEMATIC: TECHNICAL GARMENT INSPECTION ZONES]</span>
          </div>
          <div className="border border-dashed border-slate-700 rounded-lg p-6 bg-slate-950/70 text-center flex flex-col items-center">
            <div className="w-44 h-48 border-2 border-indigo-500/40 rounded-t-3xl rounded-b-lg bg-slate-900/90 relative p-3 flex flex-col justify-between">
              <div className="flex justify-between items-center text-[10px] text-indigo-300 font-bold">
                <span>[HOOD & COLLAR]</span>
                <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-[9px]">SEAMS</span>
              </div>
              <div className="text-center my-auto text-[10px] text-slate-400 border border-slate-800 py-2 rounded">
                CHEST LOGO EMBROIDERY
              </div>
              <div className="flex justify-between text-[9px] text-amber-300 font-bold border-t border-slate-800 pt-1">
                <span>HIP CARE TAG (RN#)</span>
                <span>YKK HARDWARE</span>
              </div>
            </div>
            <p className="mt-3 text-[11px] text-slate-400">
              Verify interior seam taping and wash tag style number to prevent return disputes
            </p>
          </div>
        </div>
      ),
    },
  };

  const currentGuide = guides[activeCategory];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30 border border-amber-500/30 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-wider mb-1">
              <Camera className="w-4 h-4" />
              <span>VIALE Forensic Field Photography Manual</span>
            </div>
            <h1 className="text-2xl font-black text-slate-100 flex items-center gap-2">
              <span>Optimal Photo Angle & Lighting Guides</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Zero Guesswork standard: High-precision camera positions, lighting physics, and macro inspection vectors to guarantee 99%+ algorithmic appraisal confidence and eliminate buyer dispute scams.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onOpenAppraiser && (
              <button
                onClick={onOpenAppraiser}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-950/40 transition-all cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>Launch VIALE Camera</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Selector Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
          {(['mobility', 'collectibles', 'apparel'] as const).map((catKey) => {
            const guide = guides[catKey];
            const isSelected = activeCategory === catKey;
            return (
              <button
                key={catKey}
                onClick={() => {
                  setActiveCategory(catKey);
                  if (onSelectCategoryForIntake) onSelectCategoryForIntake(catKey);
                }}
                className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500/50 shadow-md shadow-amber-950/20 text-slate-100'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="text-2xl">{guide.icon}</span>
                <div className="overflow-hidden">
                  <div className="text-xs font-bold truncate">{guide.title}</div>
                  <div className="text-[10px] text-slate-400 font-mono truncate">{guide.angles.length} Forensic Vectors</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Guide Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Lighting & Schematic */}
        <div className="space-y-6 lg:col-span-1">
          {/* Lighting Protocol Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">
              <Sun className="w-4 h-4 text-amber-400" />
              <span>Optimal Lighting Physics</span>
            </div>
            <h3 className="text-sm font-bold text-slate-200 mb-2">
              {currentGuide.lighting.headline}
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-300">
              {currentGuide.lighting.specs.map((spec, i) => (
                <li key={i} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  <span>{spec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Visual Schematic Diagram */}
          {currentGuide.schematicDiagram}

          {/* Inspection Check Progress */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-emerald-400" />
                <span>Field Checklist Status</span>
              </span>
              <span className="text-[11px] font-mono text-emerald-400 font-bold">
                {Object.values(checkedItems).filter(Boolean).length} / {currentGuide.angles.length} Complete
              </span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full transition-all duration-300"
                style={{
                  width: `${(Object.values(checkedItems).filter(Boolean).length / currentGuide.angles.length) * 100}%`,
                }}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Check off each shot on your device as you photograph the item in the field or garage.
            </p>
          </div>
        </div>

        {/* Right Column: Required Angles Cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Required Optical Inspection Angles ({currentGuide.angles.length})</span>
            </h2>
            <button
              onClick={() => {
                const summary = currentGuide.angles
                  .map((a) => `[${a.code}] ${a.name} (${a.shotType})\nDirective: ${a.description}\nCrucial For: ${a.whyCrucial}`)
                  .join('\n\n');
                copyGuideSummary(summary, 'all');
              }}
              className="text-[11px] font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/20 cursor-pointer"
            >
              <Copy className="w-3 h-3" />
              <span>{copiedAngle === 'all' ? 'Copied Full Guide!' : 'Copy Checklist'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentGuide.angles.map((angle) => {
              const isDone = !!checkedItems[angle.id];
              return (
                <div
                  key={angle.id}
                  className={`border rounded-xl p-4 transition-all ${
                    isDone
                      ? 'bg-slate-900/40 border-emerald-500/40'
                      : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleCheck(angle.id)}
                        className="cursor-pointer text-slate-400 hover:text-emerald-400 transition-colors"
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-500" />
                        )}
                      </button>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {angle.code}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {angle.shotType}
                    </span>
                  </div>

                  <h3 className={`text-sm font-bold ${isDone ? 'text-slate-400 line-through' : 'text-slate-100'}`}>
                    {angle.name}
                  </h3>

                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                    {angle.description}
                  </p>

                  {/* Why Crucial */}
                  <div className="mt-3 p-2.5 rounded bg-slate-950/80 border border-slate-800/80 text-[11px] space-y-1">
                    <div className="text-amber-400 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Why This Angle is Mandatory:</span>
                    </div>
                    <p className="text-slate-400">{angle.whyCrucial}</p>
                  </div>

                  {/* Target inspection zones */}
                  <div className="mt-2.5">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                      Target Evidence Zones:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {angle.targetZones.map((zone, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700/60"
                        >
                          {zone}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
