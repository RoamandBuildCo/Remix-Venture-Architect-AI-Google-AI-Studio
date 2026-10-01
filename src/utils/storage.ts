import { AppraisalDossier, RoadmapStep } from '../types';
import { INITIAL_LEDGER_ITEMS, INITIAL_ROADMAP_STEPS } from '../data/initialData';

const LEDGER_KEY = 'phoenix_viale_ledger_v1';
const ROADMAP_KEY = 'phoenix_viale_roadmap_v1';
const VAULT_KEY = 'phoenix_viale_vault_override_v1';

export function loadLedgerItems(): AppraisalDossier[] {
  try {
    const raw = localStorage.getItem(LEDGER_KEY);
    if (!raw) {
      saveLedgerItems(INITIAL_LEDGER_ITEMS);
      return INITIAL_LEDGER_ITEMS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load ledger from localStorage:', e);
    return INITIAL_LEDGER_ITEMS;
  }
}

export function saveLedgerItems(items: AppraisalDossier[]): void {
  try {
    localStorage.setItem(LEDGER_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save ledger to localStorage:', e);
  }
}

export function loadRoadmapSteps(): RoadmapStep[] {
  try {
    const raw = localStorage.getItem(ROADMAP_KEY);
    if (!raw) {
      saveRoadmapSteps(INITIAL_ROADMAP_STEPS);
      return INITIAL_ROADMAP_STEPS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load roadmap from localStorage:', e);
    return INITIAL_ROADMAP_STEPS;
  }
}

export function saveRoadmapSteps(steps: RoadmapStep[]): void {
  try {
    localStorage.setItem(ROADMAP_KEY, JSON.stringify(steps));
  } catch (e) {
    console.error('Failed to save roadmap to localStorage:', e);
  }
}

export function exportLedgerToCsv(items: AppraisalDossier[]): void {
  const headers = [
    'Item ID',
    'Asset Name',
    'Category',
    'Status',
    'Estimated Cost Basis',
    'Fast Cash Price',
    'Max Yield Online Price',
    'Realized Sale Price',
    'Net In-Pocket Yield',
    'Profit / Loss',
    'Sale Platform',
    'Date Logged',
    'Confidence Rating',
    'IRS 1099-K Loss Status',
  ];

  const rows = items.map((item) => {
    const cost = item.costBasisEstimate || 0;
    const realized = item.realizedSalePrice || 0;
    const pnl = realized ? realized - cost : 0;
    const taxStatus = realized ? (pnl <= 0 ? 'Non-Taxable Personal Loss' : 'Capital Gain') : 'Unrealized';

    return [
      `"${item.id}"`,
      `"${item.assetName.replace(/"/g, '""')}"`,
      `"${item.category}"`,
      `"${item.status}"`,
      cost,
      item.financials.fastCashPrice,
      item.financials.maxYieldPrice,
      realized,
      item.financials.netInPocketYield,
      pnl,
      `"${item.salePlatform || item.financials.recommendedRoute}"`,
      `"${item.dateLogged}"`,
      `"${item.confidenceRating}"`,
      `"${taxStatus}"`,
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Phoenix_VIALE_Inventory_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}
