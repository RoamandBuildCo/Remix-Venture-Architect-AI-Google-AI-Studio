export type ItemCategory = 'mobility' | 'collectibles' | 'apparel' | 'electronics' | 'tools' | 'other';

export type ConfidenceRating = 'HIGH (99%+)' | 'MEDIUM (80-98%)' | 'INSUFFICIENT (<80%)';

export type ItemStatus =
  | 'draft'
  | 'staged'
  | 'listed'
  | 'sold'
  | 'archived'
  | 'Sourced'
  | 'Purchased'
  | 'Awaiting intake'
  | 'Needs diagnosis'
  | 'Awaiting approval'
  | 'Awaiting parts'
  | 'In repair'
  | 'Needs testing'
  | 'Ready to photograph'
  | 'Ready to list'
  | 'Listed'
  | 'Sold'
  | 'Parted out'
  | 'Scrapped'
  | 'On hold';

export type LevOwnershipStatus = 'owned' | 'consignment' | 'customer property' | 'donor' | 'sold' | 'scrapped';

export type LevItemType =
  | 'electric_scooter'
  | 'ebike'
  | 'battery_pack'
  | 'charger'
  | 'controller'
  | 'motor'
  | 'display_throttle'
  | 'tires_brakes'
  | 'donor_vehicle'
  | 'collectibles'
  | 'apparel'
  | 'other';

export type BusinessDecisionLabel =
  | 'BUY / PROCEED'
  | 'BUY ONLY IF PRICE DROPS'
  | 'PART OUT'
  | 'REPAIR ONLY FOR CUSTOMER'
  | 'LIST AS-IS'
  | 'HOLD FOR INFORMATION'
  | 'AVOID / LIKELY UNPROFITABLE';

export type CompatibilityRating =
  | 'Confirmed compatible'
  | 'Likely compatible—verify'
  | 'Unknown compatibility'
  | 'Not compatible';

export interface IdentificationSpecs {
  manufacturer: string;
  modelLine: string;
  exactSkuOrVariant: string;
  specsOrDimensions: string;
  detectedSerialOrTags?: string;
  year?: number;
  color?: string;
  vinOrFrameStamp?: string;
}

export interface ConditionReport {
  conditionTier: string;
  visibleDefects: string[];
  authenticityRisk: string;
  mechanicalOrWearStatus: string;
  tireTreadStatus?: string;
  brakeCondition?: string;
  frameAndForkStatus?: string;
  electronicsAndWiring?: string;
}

export interface FinancialMetrics {
  fastCashPrice: number;
  maxYieldPrice: number;
  estimatedFeesAndShipping: number;
  netInPocketYield: number;
  bottomDollarWalkAwayPrice: number;
  sellThroughRatePercent: number;
  medianDaysToSell: number;
  recommendedRoute: 'LOCAL_CASH_ONLY' | 'SPECIALIZED_BUYLIST' | 'ONLINE_MARKETPLACE' | string;
  routeJustification: string;
  purchasePrice?: number;
  pickupCost?: number;
  partsCostCommitted?: number;
  laborHoursEstimated?: number;
  expectedGrossProfit?: number;
  decisionLabel?: BusinessDecisionLabel;
}

export interface TurnkeyListing {
  title: string;
  disputeProofDescription: string;
  suggestedPlatformTags: string[];
  honestDefectsDisclosure?: string[];
  includedItems?: string[];
  missingItems?: string[];
  suggestedPriceRange?: string;
  lowestAcceptablePrice?: number;
  pickupSafetyRecommendation?: string;
}

export interface NegotiationScripts {
  onInitialInquiry: string;
  onLowballOffer: string;
  onElectronicPaymentScam: string;
  onTestRideOrInspection: string;
}

export interface BatterySafetyRecord {
  chemistry: string;
  nominalVoltage: number;
  fullyChargedVoltage: number;
  capacityAh: number;
  capacityWh: number;
  connectorType: string;
  chargerOutputVoltage: string;
  physicalConditionNotes: string;
  isSwollenOrPunctured: boolean;
  odorOrCorrosionDetected: boolean;
  measuredVoltage: number;
  chargeTestStatus: 'Passed' | 'Failed' | 'Untested' | 'Hold';
  loadTestStatus: 'Passed' | 'Failed' | 'Untested';
  bmsBehavior: 'Normal' | 'Tripping' | 'Bypassed' | 'Fault Code' | 'Untested';
  storageLocation: string;
  safetyHold: boolean;
  safetyHoldReason?: string;
}

export interface DiagnosticLogEntry {
  id: string;
  timestamp: string;
  technician: string;
  symptom: string;
  testPerformed: string;
  measurementAndUnits: string;
  result: string;
  probableCause: string;
  confidenceLevel: 'High' | 'Medium' | 'Low';
  recommendedNextAction: string;
  partsRequired: string[];
  estimatedLaborHours: number;
}

export interface RepairJob {
  id: string;
  inventoryItemId: string;
  vehicleTitle: string;
  customerName?: string;
  complaint: string;
  diagnosis: string;
  repairPlan: string;
  status:
    | 'Intake'
    | 'Diagnosing'
    | 'Quote needed'
    | 'Awaiting customer approval'
    | 'Awaiting parts'
    | 'Repair in progress'
    | 'Testing'
    | 'Complete'
    | 'Picked up'
    | 'Cancelled'
    | 'Unsafe / hold';
  safetyStatus: 'Safe' | 'Safety Hold' | 'Testing Required';
  laborEstimateHours: number;
  actualLaborHours: number;
  partsCost: number;
  shopSuppliesCost: number;
  outsideServiceCost: number;
  partsRequired: string[];
  partsInstalled: string[];
  beforePhotos: string[];
  afterPhotos: string[];
  qcChecklistPassed: boolean;
  technicianNotes: string;
  createdAt: string;
  completedAt?: string;
}

export interface PartItem {
  id: string;
  category: 'controller' | 'motor' | 'battery' | 'throttle' | 'display' | 'tire_tube' | 'brakes' | 'charger' | 'hardware';
  brand: string;
  name: string;
  compatibleModels: string[];
  specifications: string;
  condition: 'New' | 'Used' | 'Refurbished';
  quantityOnHand: number;
  reorderPoint: number;
  purchaseCost: number;
  typicalResaleValue: number;
  binLocation: string;
  supplier: string;
  compatibilityTier: CompatibilityRating;
  photo?: string;
  notes?: string;
}

export interface AppraisalDossier {
  id: string;
  assetName: string;
  category: ItemCategory;
  itemType?: LevItemType;
  confidenceRating: ConfidenceRating;
  confidenceExplanation: string;
  missingDataAlert: string | null;
  identification: IdentificationSpecs;
  conditionReport: ConditionReport;
  financials: FinancialMetrics;
  turnkeyListing: TurnkeyListing;
  negotiationScripts: NegotiationScripts;
  safetyAndScamWarning: string;
  singleImmediateAction: string;
  images: string[];
  status: ItemStatus;
  dateLogged: string;
  realizedSalePrice?: number;
  salePlatform?: string;
  costBasisEstimate?: number;
  storageLocation?: string;
  ownershipStatus?: LevOwnershipStatus;
  acquisitionSource?: string;
  safetyHold?: boolean;
  safetyHoldReason?: string;
  batteryRecord?: BatterySafetyRecord;
  diagnosticsLog?: DiagnosticLogEntry[];
  daysHeld?: number;
  linkedRepairIds?: string[];
}

export interface ShopAssumptions {
  shopLaborRatePerHour: number;
  marketplaceFeePercent: number;
  paymentProcessingPercent: number;
  shippingMaterialsEstimate: number;
  returnReservePercent: number;
  targetProfitMarginPercent: number;
  minAcceptableProfitPerLaborHour: number;
}

export interface ResearchRecord {
  id: string;
  modelQuery: string;
  category: LevItemType;
  activeAvgPrice: number;
  soldAvgPrice: number;
  localPickupAvgPrice: number;
  shippedOnlineAvgPrice: number;
  confidenceLevel: 'High' | 'Medium' | 'Low' | 'Conflicting';
  modelIdentifiedConfirmed: boolean;
  sourcesChecked: string[];
  dateChecked: string;
  recommendedAction: BusinessDecisionLabel;
  recommendationReasoning: string;
  compatiblePartsFound: string[];
}

export interface DailyTaskItem {
  id: string;
  title: string;
  category: 'safety' | 'cash_generator' | 'high_profit' | 'parts_blocked' | 'ready_to_list' | 'overdue';
  priorityMatrix: 'do_first' | 'do_next' | 'delegate' | 'defer';
  linkedItemId?: string;
  linkedJobId?: string;
  estimatedMinutes: number;
  potentialProfit?: number;
  isCompleted: boolean;
  dueDate?: string;
  notes?: string;
}

export interface RoadmapStep {
  id: string;
  level: 'level0' | 'level1' | 'level2' | 'level3' | 'level4';
  levelName: string;
  timeframe: string;
  phase: string;
  title: string;
  targetMetric: string;
  instructions: string[];
  failSafeWarning: string;
  verificationTrigger: string;
  completed: boolean;
  completionDate?: string;
  notes?: string;
  priorityCategory?: 'safety' | 'cash_speed' | 'high_margin' | 'parts_ready';
}
