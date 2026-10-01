export type ItemCategory = 'mobility' | 'collectibles' | 'apparel' | 'electronics' | 'tools' | 'other';

export type ConfidenceRating = 'HIGH (99%+)' | 'MEDIUM (80-98%)' | 'INSUFFICIENT (<80%)';

export type ItemStatus = 'draft' | 'staged' | 'listed' | 'sold' | 'archived';

export interface IdentificationSpecs {
  manufacturer: string;
  modelLine: string;
  exactSkuOrVariant: string;
  specsOrDimensions: string;
  detectedSerialOrTags?: string;
}

export interface ConditionReport {
  conditionTier: string;
  visibleDefects: string[];
  authenticityRisk: string;
  mechanicalOrWearStatus: string;
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
}

export interface TurnkeyListing {
  title: string;
  disputeProofDescription: string;
  suggestedPlatformTags: string[];
}

export interface NegotiationScripts {
  onInitialInquiry: string;
  onLowballOffer: string;
  onElectronicPaymentScam: string;
  onTestRideOrInspection: string;
}

export interface AppraisalDossier {
  id: string;
  assetName: string;
  category: ItemCategory;
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
}
