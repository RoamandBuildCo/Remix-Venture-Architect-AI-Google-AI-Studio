import React, { useState } from 'react';
import {
  AppraisalDossier,
  LevItemType,
  LevOwnershipStatus,
  ItemStatus,
  DiagnosticLogEntry,
  BatterySafetyRecord,
} from '../types';
import { generateNextLevId } from '../utils/storage';
import {
  Camera,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Zap,
  Wrench,
  DollarSign,
  Plus,
  ArrowRight,
  Info,
  Sliders,
  BatteryCharging,
} from 'lucide-react';

interface IntakeDiagnosisModuleProps {
  existingItems: AppraisalDossier[];
  onSaveNewItem: (item: AppraisalDossier) => void;
  onNavigateToLedger: () => void;
  onNavigateToGuides?: () => void;
}

export const IntakeDiagnosisModule: React.FC<IntakeDiagnosisModuleProps> = ({
  existingItems,
  onSaveNewItem,
  onNavigateToLedger,
  onNavigateToGuides,
}) => {
  // Step in wizard
  const [step, setStep] = useState<'basic' | 'checklist' | 'diagnostic'>('basic');

  // Basic Info Form State
  const [itemType, setItemType] = useState<LevItemType>('electric_scooter');
  const [manufacturer, setManufacturer] = useState('');
  const [modelLine, setModelLine] = useState('');
  const [exactVariant, setExactVariant] = useState('');
  const [serialVin, setSerialVin] = useState('');
  const [color, setColor] = useState('');
  const [year, setYear] = useState<string>('2023');
  const [ownershipStatus, setOwnershipStatus] = useState<LevOwnershipStatus>('owned');
  const [acquisitionSource, setAcquisitionSource] = useState('OfferUp Local');
  const [storageLocation, setStorageLocation] = useState('Intake Bay 1');
  const [purchasePrice, setPurchasePrice] = useState('150');
  const [pickupCost, setPickupCost] = useState('15');
  const [expectedResalePrice, setExpectedResalePrice] = useState('420');

  // Intake Checklist State
  const [chargerIncluded, setChargerIncluded] = useState(true);
  const [keyIncluded, setKeyIncluded] = useState(true);
  const [batteryIncluded, setBatteryIncluded] = useState(true);
  const [powerOnTest, setPowerOnTest] = useState<'Passed' | 'Failed' | 'Intermittent' | 'Untested'>('Passed');
  const [chargerVoltageReading, setChargerVoltageReading] = useState('42.0V');
  const [batteryVoltageReading, setBatteryVoltageReading] = useState('39.5V');
  const [tireCondition, setTireCondition] = useState('Good tread, holding air');
  const [brakeCondition, setBrakeCondition] = useState('Brakes stop firmly');
  const [wheelBearingCondition, setWheelBearingCondition] = useState('Spins freely, no play');
  const [suspensionCondition, setSuspensionCondition] = useState('Solid, no oil leak');
  const [displayThrottleCondition, setDisplayThrottleCondition] = useState('Digits clear, throttle smooth');
  const [motorCableCondition, setMotorCableCondition] = useState('Silent motor, cable intact');
  const [controllerWiringCondition, setControllerWiringCondition] = useState('Clean wiring, no burn marks');
  const [errorCodes, setErrorCodes] = useState('None');
  const [waterDamageCorrosion, setWaterDamageCorrosion] = useState(false);
  const [missingParts, setMissingParts] = useState('');
  const [testRideStatus, setTestRideStatus] = useState<'Passed' | 'Needs adjustment' | 'Untested'>('Untested');
  const [technicianNotes, setTechnicianNotes] = useState('Intake completed on stand.');

  // Safety Hold Checkbox & Reason
  const [safetyHold, setSafetyHold] = useState(false);
  const [safetyHoldReason, setSafetyHoldReason] = useState('');

  // Structured Diagnostic Log Entry
  const [addDiagLog, setAddDiagLog] = useState(false);
  const [diagSymptom, setDiagSymptom] = useState('');
  const [diagTest, setDiagTest] = useState('');
  const [diagMeasurement, setDiagMeasurement] = useState('');
  const [diagResult, setDiagResult] = useState('');
  const [diagProbableCause, setDiagProbableCause] = useState('');
  const [diagConfidence, setDiagConfidence] = useState<'High' | 'Medium' | 'Low'>('High');
  const [diagNextAction, setDiagNextAction] = useState('');
  const [diagPartsReq, setDiagPartsReq] = useState('');
  const [diagLaborHours, setDiagLaborHours] = useState('0.5');

  // Auto Safety Hold Logic: if water damage or severe voltage sag
  const handleToggleWaterDamage = (val: boolean) => {
    setWaterDamageCorrosion(val);
    if (val && !safetyHold) {
      setSafetyHold(true);
      setSafetyHoldReason('Moisture intrusion / corrosion detected on intake.');
    }
  };

  const handleFinishIntake = (e: React.FormEvent) => {
    e.preventDefault();

    const autoId = generateNextLevId(existingItems);
    const purchaseNum = parseFloat(purchasePrice) || 0;
    const pickupNum = parseFloat(pickupCost) || 0;
    const resaleNum = parseFloat(expectedResalePrice) || 0;
    const assetTitle = `${manufacturer || 'LEV'} ${modelLine || exactVariant || itemType}`.trim();

    // Determine initial status
    let initialStatus: ItemStatus = 'Needs diagnosis';
    if (safetyHold) {
      initialStatus = 'On hold';
    } else if (testRideStatus === 'Passed') {
      initialStatus = 'Ready to photograph';
    } else if (powerOnTest === 'Passed' && brakeCondition.includes('firmly')) {
      initialStatus = 'Ready to list';
    }

    // Build diagnostic entries
    const diagnostics: DiagnosticLogEntry[] = [];
    if (addDiagLog && diagSymptom) {
      diagnostics.push({
        id: `diag-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
        technician: 'Lead Mechanic',
        symptom: diagSymptom,
        testPerformed: diagTest || 'Bench electrical check',
        measurementAndUnits: diagMeasurement || batteryVoltageReading,
        result: diagResult || 'Operational',
        probableCause: diagProbableCause || 'Normal wear',
        confidenceLevel: diagConfidence,
        recommendedNextAction: diagNextAction || 'Proceed to test ride',
        partsRequired: diagPartsReq ? diagPartsReq.split(',').map((p) => p.trim()) : [],
        estimatedLaborHours: parseFloat(diagLaborHours) || 0.5,
      });
    }

    // Battery record if applicable
    const batteryRecord: BatterySafetyRecord = {
      chemistry: 'Lithium-ion',
      nominalVoltage: 36,
      fullyChargedVoltage: 42,
      capacityAh: 10,
      capacityWh: 360,
      connectorType: 'Standard DC / XT60',
      chargerOutputVoltage: chargerVoltageReading,
      physicalConditionNotes: `Intake reading: ${batteryVoltageReading}. Battery included: ${batteryIncluded ? 'Yes' : 'No'}.`,
      isSwollenOrPunctured: false,
      odorOrCorrosionDetected: waterDamageCorrosion,
      measuredVoltage: parseFloat(batteryVoltageReading) || 36,
      chargeTestStatus: chargerIncluded ? 'Passed' : 'Untested',
      loadTestStatus: testRideStatus === 'Passed' ? 'Passed' : 'Untested',
      bmsBehavior: 'Normal',
      storageLocation: storageLocation,
      safetyHold: safetyHold,
      safetyHoldReason: safetyHoldReason,
    };

    const newDossier: AppraisalDossier = {
      id: autoId,
      assetName: assetTitle,
      category: 'mobility',
      itemType: itemType,
      confidenceRating: 'HIGH (99%+)',
      confidenceExplanation: `Direct intake inspection logged with serial ${serialVin || 'N/A'}.`,
      missingDataAlert: missingParts ? `Missing from intake: ${missingParts}` : null,
      identification: {
        manufacturer: manufacturer || 'Unknown',
        modelLine: modelLine || 'Standard',
        exactSkuOrVariant: exactVariant || '',
        specsOrDimensions: `${year || ''} ${color || ''} ${itemType}`,
        detectedSerialOrTags: serialVin || 'UNRECORDED',
        year: year ? parseInt(year, 10) : undefined,
        color: color,
      },
      conditionReport: {
        conditionTier: safetyHold ? 'Quarantined / Defective' : 'Good Used',
        visibleDefects: missingParts ? [`Missing: ${missingParts}`] : ['Standard road scuffs'],
        authenticityRisk: 'Low',
        mechanicalOrWearStatus: `Brakes: ${brakeCondition}. Tires: ${tireCondition}. Test ride: ${testRideStatus}.`,
        tireTreadStatus: tireCondition,
        brakeCondition: brakeCondition,
        frameAndForkStatus: suspensionCondition,
        electronicsAndWiring: controllerWiringCondition,
      },
      financials: {
        purchasePrice: purchaseNum,
        pickupCost: pickupNum,
        partsCostCommitted: 0,
        laborHoursEstimated: diagnostics.reduce((acc, d) => acc + d.estimatedLaborHours, 0.5),
        fastCashPrice: resaleNum,
        maxYieldPrice: Math.round(resaleNum * 1.2),
        estimatedFeesAndShipping: Math.round(resaleNum * 0.15),
        netInPocketYield: resaleNum,
        bottomDollarWalkAwayPrice: Math.round(resaleNum * 0.85),
        sellThroughRatePercent: 90,
        medianDaysToSell: 3,
        recommendedRoute: 'LOCAL_CASH_ONLY',
        routeJustification: 'Local pickup in Los Angeles minimizes shipping hazard and platform fees.',
        expectedGrossProfit: resaleNum - purchaseNum - pickupNum,
        decisionLabel: 'BUY / PROCEED',
      },
      turnkeyListing: {
        title: `${assetTitle} - Honest Working Shape - Charger Included`,
        disputeProofDescription: `Selling authentic ${assetTitle}. Tested by workshop. Charger included. Battery holds charge. Cash only at local safe exchange zone.`,
        suggestedPlatformTags: [manufacturer, modelLine, 'Electric Scooter', 'Ebike'].filter(Boolean),
        honestDefectsDisclosure: [missingParts, errorCodes !== 'None' ? `Error code: ${errorCodes}` : ''].filter(Boolean),
        includedItems: [chargerIncluded && 'Original Charger', keyIncluded && 'Keys'].filter(Boolean) as string[],
        missingItems: missingParts ? [missingParts] : [],
        suggestedPriceRange: `$${Math.round(resaleNum * 0.9)} - $${resaleNum}`,
        lowestAcceptablePrice: Math.round(resaleNum * 0.85),
        pickupSafetyRecommendation: 'Police station safe trade zone or daylight bank lobby.',
      },
      negotiationScripts: {
        onInitialInquiry: `Yes, ${assetTitle} is available. I can meet today with cash in hand.`,
        onLowballOffer: `Thanks for the offer, but lowest cash price is $${Math.round(resaleNum * 0.85)}.`,
        onElectronicPaymentScam: 'Strict policy: cash in hand only inside safe exchange zone.',
        onTestRideOrInspection: 'Full asking price cash deposited in hand before feet touch the deck/pedals.',
      },
      safetyAndScamWarning: safetyHold
        ? 'SAFETY HOLD ACTIVE: Do not test ride or sell until quarantine is resolved.'
        : 'TEST RIDE DEFENSE: Require full cash asking price held before allowing test rides.',
      singleImmediateAction: safetyHold
        ? 'Quarantine in steel bunker.'
        : 'Take 4-angle photo set and publish listing draft.',
      images: ['https://images.unsplash.com/photo-1598970434795-0c54fe7c0648?auto=format&fit=crop&w=800&q=80'],
      status: initialStatus,
      dateLogged: new Date().toISOString().split('T')[0],
      storageLocation: storageLocation,
      ownershipStatus: ownershipStatus,
      acquisitionSource: acquisitionSource,
      safetyHold: safetyHold,
      safetyHoldReason: safetyHold ? safetyHoldReason : undefined,
      batteryRecord: batteryIncluded ? batteryRecord : undefined,
      diagnosticsLog: diagnostics,
      daysHeld: 0,
    };

    onSaveNewItem(newDossier);
    onNavigateToLedger();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Wrench className="w-6 h-6 text-amber-400" />
            <span>Guided Vehicle Intake & Diagnostics</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Fast 2-minute check-in with safety quarantine and diagnostic logging.
          </p>
        </div>

        {onNavigateToGuides && (
          <button
            onClick={onNavigateToGuides}
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5 text-amber-400" />
            <span>Optimal Photo Angles</span>
          </button>
        )}
      </div>

      {/* Progress Tabs */}
      <div className="grid grid-cols-3 gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs">
        <button
          onClick={() => setStep('basic')}
          className={`py-2 px-3 rounded-lg font-semibold transition-colors cursor-pointer ${
            step === 'basic' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          1. Vehicle & Financials
        </button>
        <button
          onClick={() => setStep('checklist')}
          className={`py-2 px-3 rounded-lg font-semibold transition-colors cursor-pointer ${
            step === 'checklist' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          2. Mechanical & Voltage Check
        </button>
        <button
          onClick={() => setStep('diagnostic')}
          className={`py-2 px-3 rounded-lg font-semibold transition-colors cursor-pointer ${
            step === 'diagnostic' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          3. Diagnostic Log & Sign-Off
        </button>
      </div>

      <form onSubmit={handleFinishIntake} className="space-y-6">
        {/* Step 1: Basic Info & Financials */}
        {step === 'basic' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>Step 1: Vehicle Identification & Sourcing Basis</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Item Category / Type</label>
                <select
                  value={itemType}
                  onChange={(e) => setItemType(e.target.value as LevItemType)}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="electric_scooter">Electric Scooter</option>
                  <option value="ebike">Electric Bike / Moped</option>
                  <option value="battery_pack">Standalone Battery Pack</option>
                  <option value="donor_vehicle">Donor Frame / Parts Lot</option>
                  <option value="charger">Charger / Accessory</option>
                  <option value="collectibles">Collectibles / Cards</option>
                  <option value="other">Other Resale Item</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Make / Manufacturer</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Segway, Super73, Xiaomi, Rad Power"
                  value={manufacturer}
                  onChange={(e) => setManufacturer(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Model Line</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MAX G30P, RX Obsidian, RadRunner"
                  value={modelLine}
                  onChange={(e) => setModelLine(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Frame VIN / Serial Number</label>
                <input
                  type="text"
                  placeholder="Look under deck or steering neck"
                  value={serialVin}
                  onChange={(e) => setSerialVin(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-amber-300 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Storage Location in Shop</label>
                <input
                  type="text"
                  placeholder="e.g. Bay 1, Rack 3, Bench 2"
                  value={storageLocation}
                  onChange={(e) => setStorageLocation(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Sourcing Channel</label>
                <input
                  type="text"
                  placeholder="OfferUp, FB Marketplace, Garage Sale, Estate"
                  value={acquisitionSource}
                  onChange={(e) => setAcquisitionSource(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Financials Strip */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-300 block uppercase tracking-wider">
                Financial Baseline & Target Margins
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Purchase Price ($)</label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Pickup / Gas ($)</label>
                  <input
                    type="number"
                    step="1"
                    value={pickupCost}
                    onChange={(e) => setPickupCost(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Target Resale Price ($)</label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={expectedResalePrice}
                    onChange={(e) => setExpectedResalePrice(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-emerald-400 font-bold font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setStep('checklist')}
                className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer"
              >
                <span>Continue to Checklist</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Mechanical & Electrical Checklist */}
        {step === 'checklist' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <BatteryCharging className="w-4 h-4 text-amber-400" />
              <span>Step 2: 12-Point Mechanical & Voltage Inspection</span>
            </h2>

            {/* Quick Accessory Toggles */}
            <div className="grid grid-cols-3 gap-3 text-xs">
              <label className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={chargerIncluded}
                  onChange={(e) => setChargerIncluded(e.target.checked)}
                  className="w-4 h-4 accent-amber-500"
                />
                <span className="font-medium text-slate-200">Charger Included</span>
              </label>

              <label className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={keyIncluded}
                  onChange={(e) => setKeyIncluded(e.target.checked)}
                  className="w-4 h-4 accent-amber-500"
                />
                <span className="font-medium text-slate-200">Keys Included</span>
              </label>

              <label className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={batteryIncluded}
                  onChange={(e) => setBatteryIncluded(e.target.checked)}
                  className="w-4 h-4 accent-amber-500"
                />
                <span className="font-medium text-slate-200">Battery Present</span>
              </label>
            </div>

            {/* Voltage & Power Checks */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Power-On Bench Test</label>
                <select
                  value={powerOnTest}
                  onChange={(e) => setPowerOnTest(e.target.value as any)}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                >
                  <option value="Passed">Passed (Powers on immediately)</option>
                  <option value="Failed">Failed (No display / Dead)</option>
                  <option value="Intermittent">Intermittent / Flickers</option>
                  <option value="Untested">Untested</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Multimeter Battery V Reading</label>
                <input
                  type="text"
                  placeholder="e.g. 41.5V (36V nominal)"
                  value={batteryVoltageReading}
                  onChange={(e) => setBatteryVoltageReading(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-amber-300 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Multimeter Charger V Output</label>
                <input
                  type="text"
                  placeholder="e.g. 42.0V or 54.6V"
                  value={chargerVoltageReading}
                  onChange={(e) => setChargerVoltageReading(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-amber-300 font-mono"
                />
              </div>
            </div>

            {/* Condition Check Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-3 border-t border-slate-800">
              <div>
                <label className="text-slate-400 block mb-1">Brakes & Cables</label>
                <input
                  type="text"
                  value={brakeCondition}
                  onChange={(e) => setBrakeCondition(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Tires & Pressure</label>
                <input
                  type="text"
                  value={tireCondition}
                  onChange={(e) => setTireCondition(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Motor & Phase Cables</label>
                <input
                  type="text"
                  value={motorCableCondition}
                  onChange={(e) => setMotorCableCondition(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Error Codes Displayed</label>
                <input
                  type="text"
                  placeholder="e.g. E10, Error 21, None"
                  value={errorCodes}
                  onChange={(e) => setErrorCodes(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-mono"
                />
              </div>
            </div>

            {/* Critical Safety Hold Trigger */}
            <div className="p-4 rounded-xl border border-red-500/40 bg-red-950/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-red-400" />
                  <span className="font-bold text-sm text-red-200">Safety Hold Toggle</span>
                </div>
                <input
                  type="checkbox"
                  checked={safetyHold}
                  onChange={(e) => setSafetyHold(e.target.checked)}
                  className="w-5 h-5 accent-red-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-4 text-xs text-red-300">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={waterDamageCorrosion}
                    onChange={(e) => handleToggleWaterDamage(e.target.checked)}
                    className="accent-red-500"
                  />
                  <span>Water Damage / Corrosion Detected</span>
                </label>
              </div>

              {safetyHold && (
                <div>
                  <label className="text-red-300 text-xs block mb-1 font-medium">
                    Mandatory Safety Hold Reason:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Battery swelling, cracked fork, cut phase wire"
                    value={safetyHoldReason}
                    onChange={(e) => setSafetyHoldReason(e.target.value)}
                    className="w-full p-2 rounded-lg bg-slate-950 border border-red-500/50 text-white text-xs focus:outline-none"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep('basic')}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700 cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep('diagnostic')}
                className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer"
              >
                <span>Continue to Diagnostic Log</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Diagnostic Log Entry & Commit */}
        {step === 'diagnostic' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Wrench className="w-4 h-4 text-amber-400" />
              <span>Step 3: Structured Diagnostic Log Entry (Optional)</span>
            </h2>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="addDiag"
                checked={addDiagLog}
                onChange={(e) => setAddDiagLog(e.target.checked)}
                className="w-4 h-4 accent-amber-500 cursor-pointer"
              />
              <label htmlFor="addDiag" className="text-xs text-slate-200 font-semibold cursor-pointer">
                Attach Initial Diagnostic Finding & Parts Estimate
              </label>
            </div>

            {addDiagLog && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">Observed Symptom</label>
                    <input
                      type="text"
                      placeholder="e.g. Throttle deadband, tire slow leak, brake drag"
                      value={diagSymptom}
                      onChange={(e) => setDiagSymptom(e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Test Performed</label>
                    <input
                      type="text"
                      placeholder="e.g. Hall sensor multimeter test, 24hr pressure check"
                      value={diagTest}
                      onChange={(e) => setDiagTest(e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Probable Cause</label>
                    <input
                      type="text"
                      placeholder="e.g. Frayed throttle extension wire inside stem"
                      value={diagProbableCause}
                      onChange={(e) => setDiagProbableCause(e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Parts Required (comma-separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. Julet 3-pin cable, 10x2.5 tire"
                      value={diagPartsReq}
                      onChange={(e) => setDiagPartsReq(e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-amber-300 font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Final Intake Summary Banner */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Calculated Projected Profit:</span>
                <span className="text-xl font-bold font-mono text-emerald-400">
                  ${(parseFloat(expectedResalePrice) || 0) - (parseFloat(purchasePrice) || 0) - (parseFloat(pickupCost) || 0)}
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Based on ${purchasePrice} purchase + ${pickupCost} pickup
                </span>
              </div>

              {safetyHold ? (
                <div className="text-red-400 font-bold text-xs bg-red-950/40 p-2 rounded border border-red-500/30">
                  Item will be committed under SAFETY HOLD
                </div>
              ) : (
                <div className="text-emerald-400 text-xs bg-emerald-950/30 p-2 rounded border border-emerald-500/30">
                  Ready for auto-generated LEV ID
                </div>
              )}
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep('checklist')}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700 cursor-pointer"
              >
                Back
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md"
              >
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                <span>Commit to Inventory Ledger</span>
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
