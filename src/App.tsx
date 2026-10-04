import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardModule } from './components/DashboardModule';
import { InventoryModule } from './components/InventoryModule';
import { IntakeDiagnosisModule } from './components/IntakeDiagnosisModule';
import { BatterySafetyModule } from './components/BatterySafetyModule';
import { RepairJobsModule } from './components/RepairJobsModule';
import { PartsInventoryModule } from './components/PartsInventoryModule';
import { ProfitPricingModule } from './components/ProfitPricingModule';
import { ListingDraftsModule } from './components/ListingDraftsModule';
import { ResearchAssistantModule } from './components/ResearchAssistantModule';
import { DailyOperationsModule } from './components/DailyOperationsModule';
import { VisualPhotoGuides } from './components/VisualPhotoGuides';
import { SupplementaryPromptEngine } from './components/SupplementaryPromptEngine';
import { GoogleWorkspaceHub } from './components/GoogleWorkspaceHub';
import { QrScannerModal } from './components/QrScannerModal';
import { QrTagModal } from './components/QrTagModal';
import {
  AppraisalDossier,
  RepairJob,
  PartItem,
  ShopAssumptions,
  DailyTaskItem,
  ResearchRecord,
  RoadmapStep,
} from './types';
import {
  loadLedgerItems,
  saveLedgerItems,
  loadRepairJobs,
  saveRepairJobs,
  loadPartsInventory,
  savePartsInventory,
  loadShopAssumptions,
  saveShopAssumptions,
  loadDailyTasks,
  saveDailyTasks,
  loadResearchRecords,
  saveResearchRecords,
  loadRoadmapSteps,
  saveRoadmapSteps,
  resetEngineLocalStorage,
} from './utils/storage';
import {
  initAuth,
  syncItemToCloud,
  deleteItemFromCloud,
  subscribeToCloudItems,
} from './services/firebase';
import { User } from 'firebase/auth';
import { CheckCircle2, ShieldAlert } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [items, setItems] = useState<AppraisalDossier[]>([]);
  const [repairJobs, setRepairJobs] = useState<RepairJob[]>([]);
  const [parts, setParts] = useState<PartItem[]>([]);
  const [shopAssumptions, setShopAssumptions] = useState<ShopAssumptions>({
    shopLaborRatePerHour: 75,
    marketplaceFeePercent: 13,
    paymentProcessingPercent: 3,
    shippingMaterialsEstimate: 18,
    returnReservePercent: 5,
    targetProfitMarginPercent: 35,
    minAcceptableProfitPerLaborHour: 50,
  });
  const [dailyTasks, setDailyTasks] = useState<DailyTaskItem[]>([]);
  const [researchRecords, setResearchRecords] = useState<ResearchRecord[]>([]);
  const [steps, setSteps] = useState<RoadmapStep[]>([]);

  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isLightMode, setIsLightMode] = useState<boolean>(false);
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [qrTagItem, setQrTagItem] = useState<AppraisalDossier | null>(null);
  const [highlightItemId, setHighlightItemId] = useState<string | null>(null);
  const [initialFilterStatus, setInitialFilterStatus] = useState<string>('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Initialize storage & check for deep links (?tab=xxx or ?item=xxx)
  useEffect(() => {
    const loadedItems = loadLedgerItems();
    const loadedRepairs = loadRepairJobs();
    const loadedParts = loadPartsInventory();
    const loadedAssumptions = loadShopAssumptions();
    const loadedTasks = loadDailyTasks();
    const loadedResearch = loadResearchRecords();
    const loadedSteps = loadRoadmapSteps();

    setItems(loadedItems);
    setRepairJobs(loadedRepairs);
    setParts(loadedParts);
    setShopAssumptions(loadedAssumptions);
    setDailyTasks(loadedTasks);
    setResearchRecords(loadedResearch);
    setSteps(loadedSteps);
    setIsLoaded(true);

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      const itemParam = params.get('item') || params.get('asset') || params.get('id');

      if (tabParam) {
        setActiveTab(tabParam);
      }
      if (itemParam) {
        const found = loadedItems.find(
          (i) => i.id.toLowerCase() === itemParam.toLowerCase()
        );
        if (found) {
          setHighlightItemId(found.id);
          setActiveTab('inventory');
          showToast(`Loaded ${found.assetName} (${found.id})`);
        }
      }
    }
  }, []);

  // Firebase Auth & Cloud Sync listener
  useEffect(() => {
    const unsubscribeAuth = initAuth((user) => {
      setCurrentUser(user);
      if (user) {
        showToast(`Cloud Sync Active: Connected as ${user.email}`);
        const unsubItems = subscribeToCloudItems(
          user.uid,
          (cloudItems) => {
            if (cloudItems.length > 0) {
              setItems((prev) => {
                const map = new Map<string, AppraisalDossier>();
                prev.forEach((item) => map.set(item.id, item));
                cloudItems.forEach((item) => map.set(item.id, item));
                const merged = Array.from(map.values());
                saveLedgerItems(merged);
                return merged;
              });
            }
          },
          (err) => console.warn('Firestore sync note:', err)
        );
        return () => unsubItems();
      }
    });
    return () => unsubscribeAuth();
  }, []);

  // Handlers for Items
  const handleAddItem = (newItem: AppraisalDossier) => {
    setItems((prev) => {
      const updated = [newItem, ...prev];
      saveLedgerItems(updated);
      return updated;
    });
    if (currentUser) {
      syncItemToCloud(newItem, currentUser.uid).catch(() => {});
    }
    showToast(`Committed "${newItem.assetName}" (${newItem.id}) to Ledger.`);
  };

  const handleUpdateItem = (updatedItem: AppraisalDossier) => {
    setItems((prev) => {
      const updated = prev.map((item) => (item.id === updatedItem.id ? updatedItem : item));
      saveLedgerItems(updated);
      return updated;
    });
    if (currentUser) {
      syncItemToCloud(updatedItem, currentUser.uid).catch(() => {});
    }
    showToast(`Updated "${updatedItem.assetName}".`);
  };

  const handleDeleteItem = (id: string) => {
    setItems((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      saveLedgerItems(updated);
      return updated;
    });
    if (currentUser) {
      deleteItemFromCloud(id, currentUser.uid).catch(() => {});
    }
    showToast('Record deleted from ledger.');
  };

  // Handlers for Repairs
  const handleSaveJob = (job: RepairJob) => {
    setRepairJobs((prev) => {
      const exists = prev.some((j) => j.id === job.id);
      const updated = exists ? prev.map((j) => (j.id === job.id ? job : j)) : [job, ...prev];
      saveRepairJobs(updated);
      return updated;
    });
    showToast(`Work Order ${job.id} saved.`);
  };

  const handleDeleteJob = (jobId: string) => {
    setRepairJobs((prev) => {
      const updated = prev.filter((j) => j.id !== jobId);
      saveRepairJobs(updated);
      return updated;
    });
    showToast(`Work Order ${jobId} deleted.`);
  };

  // Handlers for Parts
  const handleSavePart = (part: PartItem) => {
    setParts((prev) => {
      const exists = prev.some((p) => p.id === part.id);
      const updated = exists ? prev.map((p) => (p.id === part.id ? part : p)) : [part, ...prev];
      savePartsInventory(updated);
      return updated;
    });
    showToast(`Part ${part.name} saved.`);
  };

  const handleDeletePart = (partId: string) => {
    setParts((prev) => {
      const updated = prev.filter((p) => p.id !== partId);
      savePartsInventory(updated);
      return updated;
    });
    showToast(`Part ${partId} deleted from inventory.`);
  };

  // Handlers for Assumptions
  const handleSaveAssumptions = (newAssumptions: ShopAssumptions) => {
    setShopAssumptions(newAssumptions);
    saveShopAssumptions(newAssumptions);
    showToast('Shop labor rate & fee assumptions saved.');
  };

  // Handlers for Daily Tasks
  const handleSaveTasks = (newTasks: DailyTaskItem[]) => {
    setDailyTasks(newTasks);
    saveDailyTasks(newTasks);
  };

  const handleDeleteTask = (taskId: string) => {
    setDailyTasks((prev) => {
      const updated = prev.filter((t) => t.id !== taskId);
      saveDailyTasks(updated);
      return updated;
    });
    showToast('Daily task removed.');
  };

  // Handlers for Research
  const handleSaveResearch = (record: ResearchRecord) => {
    setResearchRecords((prev) => {
      const updated = [record, ...prev];
      saveResearchRecords(updated);
      return updated;
    });
    showToast(`Valuation comp saved for ${record.modelQuery}.`);
  };

  const handleDeleteResearch = (recordId: string) => {
    setResearchRecords((prev) => {
      const updated = prev.filter((r) => r.id !== recordId);
      saveResearchRecords(updated);
      return updated;
    });
    showToast('Research valuation record removed.');
  };

  // Handler for QR Scanned item
  const handleScannedItem = (item: AppraisalDossier) => {
    setIsScannerOpen(false);
    setHighlightItemId(item.id);
    setActiveTab('inventory');
    showToast(`QR Verified: ${item.assetName} (${item.id})`);
  };

  // Tab Navigation with Deep Filtering
  const handleNavigateTab = (tabId: string, filterOrItemId?: string) => {
    if (filterOrItemId) {
      setHighlightItemId(filterOrItemId);
      setInitialFilterStatus(filterOrItemId);
    }
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handler for Reset Engine
  const handleResetEngine = () => {
    resetEngineLocalStorage();
    setItems([]);
    setRepairJobs([]);
    setParts([]);
    setDailyTasks([]);
    setResearchRecords([]);
    setSteps([]);
    setHighlightItemId(null);
    setQrTagItem(null);
    setActiveTab('dashboard');
    showToast('Engine Reset: All past appraisals and state cleared.');
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-mono text-xs">
        INITIALIZING SHUTTERBUCK...
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-150 ${
        isLightMode
          ? 'bg-slate-100 text-slate-900 selection:bg-amber-400/40 selection:text-slate-900'
          : 'bg-[#0f1115] text-slate-100 selection:bg-amber-500/30 selection:text-amber-200'
      }`}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-14 right-4 z-50 bg-slate-900 border border-amber-500/50 text-slate-100 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-mono">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar & Mobile Bottom Dock */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        items={items}
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenIntake={() => setActiveTab('intake')}
        isLightMode={isLightMode}
        onToggleTheme={() => setIsLightMode(!isLightMode)}
        onResetEngine={handleResetEngine}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-5 pb-24 md:pb-12">
        {/* Module 1: Dashboard */}
        {activeTab === 'dashboard' && (
          <DashboardModule
            items={items}
            repairJobs={repairJobs}
            parts={parts}
            dailyTasks={dailyTasks}
            onNavigateTab={handleNavigateTab}
            onOpenIntake={() => setActiveTab('intake')}
            onOpenScanner={() => setIsScannerOpen(true)}
          />
        )}

        {/* Module 2: Inventory Ledger */}
        {activeTab === 'inventory' && (
          <InventoryModule
            items={items}
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
            onOpenIntake={() => setActiveTab('intake')}
            onOpenScanner={() => setIsScannerOpen(true)}
            onPrintQrTag={(item) => setQrTagItem(item)}
            onNavigateToListing={(itemId) => {
              setHighlightItemId(itemId);
              setActiveTab('listings');
            }}
            onNavigateToRepair={(itemId) => {
              setHighlightItemId(itemId);
              setActiveTab('repairs');
            }}
            onNavigateToBattery={(itemId) => {
              setHighlightItemId(itemId);
              setActiveTab('battery');
            }}
            initialFilterStatus={initialFilterStatus}
            highlightItemId={highlightItemId}
          />
        )}

        {/* Module 3: Intake & Guided Diagnosis */}
        {activeTab === 'intake' && (
          <IntakeDiagnosisModule
            existingItems={items}
            onSaveNewItem={handleAddItem}
            onNavigateToLedger={() => setActiveTab('inventory')}
            onNavigateToGuides={() => setActiveTab('photoguides')}
          />
        )}

        {/* Module 4: Battery Safety Center */}
        {activeTab === 'battery' && (
          <BatterySafetyModule
            items={items}
            onUpdateItem={handleUpdateItem}
            onNavigateToItem={(id) => {
              setHighlightItemId(id);
              setActiveTab('inventory');
            }}
            highlightItemId={highlightItemId}
          />
        )}

        {/* Module 5: Repair Jobs & Work Orders */}
        {activeTab === 'repairs' && (
          <RepairJobsModule
            jobs={repairJobs}
            inventoryItems={items}
            partsInventory={parts}
            onSaveJob={handleSaveJob}
            onDeleteJob={handleDeleteJob}
            onNavigateToItem={(id) => {
              setHighlightItemId(id);
              setActiveTab('inventory');
            }}
            highlightJobId={highlightItemId}
          />
        )}

        {/* Module 6: Parts Inventory & Bin Control */}
        {activeTab === 'parts' && (
          <PartsInventoryModule
            parts={parts}
            onSavePart={handleSavePart}
            onDeletePart={handleDeletePart}
          />
        )}

        {/* Module 7: Profitability, Costs & Pricing */}
        {activeTab === 'pricing' && (
          <ProfitPricingModule
            items={items}
            shopAssumptions={shopAssumptions}
            onSaveShopAssumptions={handleSaveAssumptions}
            onNavigateToItem={(id) => {
              setHighlightItemId(id);
              setActiveTab('inventory');
            }}
          />
        )}

        {/* Module 8: Marketplace Listing Drafts */}
        {activeTab === 'listings' && (
          <ListingDraftsModule
            items={items}
            selectedItemId={highlightItemId}
            onNavigateToItem={(id) => {
              setHighlightItemId(id);
              setActiveTab('inventory');
            }}
          />
        )}

        {/* Module 9: Valuation & Sourcing Research */}
        {activeTab === 'research' && (
          <ResearchAssistantModule
            records={researchRecords}
            partsInventory={parts}
            onSaveRecord={handleSaveResearch}
            onDeleteRecord={handleDeleteResearch}
            onNavigateToIntake={() => setActiveTab('intake')}
          />
        )}

        {/* Module 10: Daily Operations Planner */}
        {activeTab === 'daily' && (
          <DailyOperationsModule
            tasks={dailyTasks}
            inventoryItems={items}
            repairJobs={repairJobs}
            onSaveTasks={handleSaveTasks}
            onDeleteTask={handleDeleteTask}
            onNavigateToItem={(id) => {
              setHighlightItemId(id);
              setActiveTab('inventory');
            }}
            onNavigateToRepair={(jobId) => {
              setHighlightItemId(jobId);
              setActiveTab('repairs');
            }}
            onOpenWorkspace={() => setActiveTab('workspace')}
          />
        )}

        {/* Secondary: Google Workspace Hub (Sheets & Tasks) */}
        {activeTab === 'workspace' && (
          <GoogleWorkspaceHub
            items={items}
            steps={steps}
            onTaskCompleted={(stepId: string) => {
              setSteps((prev) => {
                const updated = prev.map((s) =>
                  s.id === stepId ? { ...s, completed: !s.completed } : s
                );
                saveRoadmapSteps(updated);
                return updated;
              });
            }}
          />
        )}

        {/* Secondary: Visual Photo Guides */}
        {activeTab === 'photoguides' && (
          <VisualPhotoGuides
            onOpenAppraiser={() => setActiveTab('intake')}
          />
        )}

        {/* Secondary: AI Prompt Generator for Missing Photos */}
        {activeTab === 'promptengine' && (
          <SupplementaryPromptEngine />
        )}
      </main>

      {/* QR Scanner Camera Modal */}
      {isScannerOpen && (
        <QrScannerModal
          items={items}
          onFoundItem={handleScannedItem}
          onClose={() => setIsScannerOpen(false)}
        />
      )}

      {/* QR Tag Printable Modal */}
      {qrTagItem && (
        <QrTagModal
          item={qrTagItem}
          allItems={items}
          onClose={() => setQrTagItem(null)}
        />
      )}

      {/* Workshop Footer */}
      <footer className="border-t border-slate-800 bg-[#0c0e12] px-4 py-5 text-xs text-slate-500 font-mono no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-slate-400 font-medium">SHUTTERBUCK</span>
            <span>·</span>
            <span>LOS ANGELES, CA</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[11px]">
            <span>Cloud & Local Sync</span>
            <span>·</span>
            <span>Battery Safety Defense</span>
            <span>·</span>
            <span>Parts Bin Control</span>
            <span>·</span>
            <span>Zero Unverified Claims</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
