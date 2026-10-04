import {
  AppraisalDossier,
  RoadmapStep,
  RepairJob,
  PartItem,
  ShopAssumptions,
  DailyTaskItem,
  ResearchRecord,
} from '../types';
import {
  INITIAL_LEDGER_ITEMS,
  ROADMAP_STEPS,
  INITIAL_REPAIR_JOBS,
  INITIAL_PARTS_INVENTORY,
  DEFAULT_SHOP_ASSUMPTIONS,
  INITIAL_DAILY_TASKS,
  INITIAL_RESEARCH_RECORDS,
} from '../data/initialData';

const LEDGER_KEY = 'shutterbuck_ledger_v2';
const REPAIRS_KEY = 'shutterbuck_repairs_v2';
const PARTS_KEY = 'shutterbuck_parts_v2';
const ASSUMPTIONS_KEY = 'shutterbuck_assumptions_v2';
const TASKS_KEY = 'shutterbuck_tasks_v2';
const RESEARCH_KEY = 'shutterbuck_research_v2';
const ROADMAP_KEY = 'shutterbuck_roadmap_v2';
const CLEARED_KEY = 'shutterbuck_cleared_state';

export function isEngineReset(): boolean {
  try {
    return localStorage.getItem(CLEARED_KEY) === 'true';
  } catch {
    return false;
  }
}

export function resetEngineLocalStorage(): void {
  try {
    localStorage.clear();
    localStorage.setItem(CLEARED_KEY, 'true');
  } catch (e) {
    console.error('Failed to clear localStorage:', e);
  }
}

export function loadLedgerItems(): AppraisalDossier[] {
  try {
    const raw = localStorage.getItem(LEDGER_KEY);
    if (!raw) {
      if (isEngineReset()) return [];
      saveLedgerItems(INITIAL_LEDGER_ITEMS);
      return INITIAL_LEDGER_ITEMS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load ledger from localStorage:', e);
    return [];
  }
}

export function saveLedgerItems(items: AppraisalDossier[]): void {
  try {
    localStorage.setItem(LEDGER_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save ledger to localStorage:', e);
  }
}

export function generateNextLevId(existingItems: AppraisalDossier[]): string {
  const currentYear = new Date().getFullYear();
  const prefix = `LEV-${currentYear}-`;
  let maxSeq = 0;
  existingItems.forEach((item) => {
    if (item.id && item.id.startsWith(prefix)) {
      const seqStr = item.id.replace(prefix, '');
      const num = parseInt(seqStr, 10);
      if (!isNaN(num) && num > maxSeq) {
        maxSeq = num;
      }
    }
  });
  const nextNum = (maxSeq + 1).toString().padStart(4, '0');
  return `${prefix}${nextNum}`;
}

export function loadRepairJobs(): RepairJob[] {
  try {
    const raw = localStorage.getItem(REPAIRS_KEY);
    if (!raw) {
      if (isEngineReset()) return [];
      saveRepairJobs(INITIAL_REPAIR_JOBS);
      return INITIAL_REPAIR_JOBS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load repair jobs from localStorage:', e);
    return [];
  }
}

export function saveRepairJobs(jobs: RepairJob[]): void {
  try {
    localStorage.setItem(REPAIRS_KEY, JSON.stringify(jobs));
  } catch (e) {
    console.error('Failed to save repair jobs to localStorage:', e);
  }
}

export function loadPartsInventory(): PartItem[] {
  try {
    const raw = localStorage.getItem(PARTS_KEY);
    if (!raw) {
      if (isEngineReset()) return [];
      savePartsInventory(INITIAL_PARTS_INVENTORY);
      return INITIAL_PARTS_INVENTORY;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load parts from localStorage:', e);
    return [];
  }
}

export function savePartsInventory(parts: PartItem[]): void {
  try {
    localStorage.setItem(PARTS_KEY, JSON.stringify(parts));
  } catch (e) {
    console.error('Failed to save parts to localStorage:', e);
  }
}

export function loadShopAssumptions(): ShopAssumptions {
  try {
    const raw = localStorage.getItem(ASSUMPTIONS_KEY);
    if (!raw) {
      saveShopAssumptions(DEFAULT_SHOP_ASSUMPTIONS);
      return DEFAULT_SHOP_ASSUMPTIONS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_SHOP_ASSUMPTIONS;
  }
}

export function saveShopAssumptions(assumptions: ShopAssumptions): void {
  try {
    localStorage.setItem(ASSUMPTIONS_KEY, JSON.stringify(assumptions));
  } catch (e) {
    console.error('Failed to save assumptions:', e);
  }
}

export function loadDailyTasks(): DailyTaskItem[] {
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    if (!raw) {
      if (isEngineReset()) return [];
      saveDailyTasks(INITIAL_DAILY_TASKS);
      return INITIAL_DAILY_TASKS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function saveDailyTasks(tasks: DailyTaskItem[]): void {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save tasks:', e);
  }
}

export function loadResearchRecords(): ResearchRecord[] {
  try {
    const raw = localStorage.getItem(RESEARCH_KEY);
    if (!raw) {
      if (isEngineReset()) return [];
      saveResearchRecords(INITIAL_RESEARCH_RECORDS);
      return INITIAL_RESEARCH_RECORDS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function saveResearchRecords(records: ResearchRecord[]): void {
  try {
    localStorage.setItem(RESEARCH_KEY, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save research records:', e);
  }
}

export function loadRoadmapSteps(): RoadmapStep[] {
  try {
    const raw = localStorage.getItem(ROADMAP_KEY);
    if (!raw) {
      saveRoadmapSteps(ROADMAP_STEPS);
      return ROADMAP_STEPS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return ROADMAP_STEPS;
  }
}

export function saveRoadmapSteps(steps: RoadmapStep[]): void {
  try {
    localStorage.setItem(ROADMAP_KEY, JSON.stringify(steps));
  } catch (e) {
    console.error('Failed to save roadmap:', e);
  }
}

export function exportLedgerToCsv(items: AppraisalDossier[]): void {
  const headers = [
    'Inventory ID',
    'Item Name',
    'Item Type',
    'Status',
    'Storage Location',
    'Purchase Cost ($)',
    'Parts Cost ($)',
    'Listing Price ($)',
    'Expected Gross Profit ($)',
    'Realized Sale Price ($)',
    'Safety Hold',
    'Date Logged',
    'VIN / Serial',
  ];

  const rows = items.map((item) => {
    const purchase = item.financials.purchasePrice || item.costBasisEstimate || 0;
    const parts = item.financials.partsCostCommitted || 0;
    const listing = item.financials.fastCashPrice || 0;
    const profit = item.financials.expectedGrossProfit || (listing - purchase - parts);
    const realized = item.realizedSalePrice || 0;

    return [
      `"${item.id}"`,
      `"${(item.assetName || '').replace(/"/g, '""')}"`,
      `"${item.itemType || item.category || ''}"`,
      `"${item.status || ''}"`,
      `"${item.storageLocation || ''}"`,
      purchase,
      parts,
      listing,
      profit,
      realized,
      item.safetyHold ? 'YES' : 'NO',
      `"${item.dateLogged || ''}"`,
      `"${item.identification?.detectedSerialOrTags || ''}"`,
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `LEV_Shop_Inventory_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportRepairsToCsv(jobs: RepairJob[]): void {
  const headers = [
    'Job ID',
    'Vehicle / Item',
    'Status',
    'Safety Status',
    'Complaint',
    'Labor Hours',
    'Parts Cost ($)',
    'Shop Supplies ($)',
    'QC Passed',
    'Created Date',
  ];

  const rows = jobs.map((job) => [
    `"${job.id}"`,
    `"${(job.vehicleTitle || '').replace(/"/g, '""')}"`,
    `"${job.status}"`,
    `"${job.safetyStatus}"`,
    `"${(job.complaint || '').replace(/"/g, '""')}"`,
    job.actualLaborHours || job.laborEstimateHours || 0,
    job.partsCost || 0,
    job.shopSuppliesCost || 0,
    job.qcChecklistPassed ? 'YES' : 'NO',
    `"${job.createdAt}"`,
  ].join(','));

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `LEV_Shop_Repair_Jobs_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportPartsToCsv(parts: PartItem[]): void {
  const headers = [
    'Part ID',
    'Name',
    'Category',
    'Brand',
    'Bin Location',
    'Qty On Hand',
    'Reorder Point',
    'Unit Cost ($)',
    'Resale Value ($)',
    'Compatibility Tier',
  ];

  const rows = parts.map((part) => [
    `"${part.id}"`,
    `"${(part.name || '').replace(/"/g, '""')}"`,
    `"${part.category}"`,
    `"${part.brand}"`,
    `"${part.binLocation}"`,
    part.quantityOnHand,
    part.reorderPoint,
    part.purchaseCost,
    part.typicalResaleValue,
    `"${part.compatibilityTier}"`,
  ].join(','));

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `LEV_Shop_Parts_Inventory_${new Date().toISOString().split('T')[0]}.csv`);
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
