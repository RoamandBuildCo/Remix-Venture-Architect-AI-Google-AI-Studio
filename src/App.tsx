import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { VialeAppraiser } from './components/VialeAppraiser';
import { InventoryLedger } from './components/InventoryLedger';
import { ExecutionCockpit } from './components/ExecutionCockpit';
import { AntiScamTerminal } from './components/AntiScamTerminal';
import { FortressVaultCalc } from './components/FortressVaultCalc';
import { MasterOverseerDirectives } from './components/MasterOverseerDirectives';
import { QrScannerModal } from './components/QrScannerModal';
import { VisualPhotoGuides } from './components/VisualPhotoGuides';
import { SupplementaryPromptEngine } from './components/SupplementaryPromptEngine';
import { GoogleWorkspaceHub } from './components/GoogleWorkspaceHub';
import { GeminiChatbot } from './components/GeminiChatbot';
import { LiveVoiceRoom } from './components/LiveVoiceRoom';
import { GroundingIntelligence } from './components/GroundingIntelligence';
import { AppraisalDossier, RoadmapStep } from './types';
import {
  loadLedgerItems,
  saveLedgerItems,
  loadRoadmapSteps,
  saveRoadmapSteps,
} from './utils/storage';
import {
  initAuth,
  syncItemToCloud,
  deleteItemFromCloud,
  subscribeToCloudItems,
} from './services/firebase';
import { User } from 'firebase/auth';
import { ShieldCheck, Sparkles, AlertCircle, CheckCircle2, QrCode } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('appraiser');
  const [items, setItems] = useState<AppraisalDossier[]>([]);
  const [steps, setSteps] = useState<RoadmapStep[]>([]);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [highlightItemId, setHighlightItemId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Initialize storage & check for deep links (?asset=xxx)
  useEffect(() => {
    const loadedItems = loadLedgerItems();
    const loadedSteps = loadRoadmapSteps();
    setItems(loadedItems);
    setSteps(loadedSteps);
    setIsLoaded(true);

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const assetParam = params.get('asset') || params.get('item') || params.get('dossier');
      if (assetParam) {
        const found = loadedItems.find(
          (i) => i.id === assetParam || i.id.toLowerCase() === assetParam.toLowerCase()
        );
        if (found) {
          setActiveTab('ledger');
          setHighlightItemId(found.id);
          showToast(`QR Tag Verified: Loaded Dossier for ${found.assetName}`);
        }
      }
    }
  }, []);

  // Auth & Cloud sync listener
  useEffect(() => {
    const unsubscribeAuth = initAuth((user) => {
      setCurrentUser(user);
      if (user) {
        showToast(`Firebase Connected: Syncing cloud ledger for ${user.email}`);
        // Optionally listen to cloud updates
        const unsubItems = subscribeToCloudItems(
          user.uid,
          (cloudItems) => {
            if (cloudItems.length > 0) {
              setItems((prev) => {
                const map = new Map<string, AppraisalDossier>();
                // Cloud items take precedence
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

  // Save changes to storage & cloud
  const handleAddItem = (newItem: AppraisalDossier) => {
    setItems((prev) => {
      const updated = [newItem, ...prev];
      saveLedgerItems(updated);
      return updated;
    });
    if (currentUser) {
      syncItemToCloud(newItem, currentUser.uid).catch(() => {});
    }
    showToast(`Committed "${newItem.assetName}" to Inventory Ledger.`);
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
    if (!confirm('Are you sure you want to remove this item from the ledger?')) return;
    setItems((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      saveLedgerItems(updated);
      return updated;
    });
    if (currentUser) {
      deleteItemFromCloud(id, currentUser.uid).catch(() => {});
    }
    showToast('Asset removed from ledger.');
  };

  const handleToggleStep = (stepId: string, notes?: string) => {
    setSteps((prev) => {
      const updated = prev.map((s) => {
        if (s.id === stepId) {
          const willBeCompleted = !s.completed;
          return {
            ...s,
            completed: willBeCompleted,
            completionDate: willBeCompleted ? new Date().toISOString().split('T')[0] : undefined,
            notes: notes || s.notes,
          };
        }
        return s;
      });
      saveRoadmapSteps(updated);
      return updated;
    });
    showToast('Execution roadmap milestone updated.');
  };

  const handleScannedItem = (item: AppraisalDossier) => {
    setActiveTab('ledger');
    setHighlightItemId(item.id);
    showToast(`Scanned Tag: ${item.assetName} (Fast Cash: $${item.financials.fastCashPrice})`);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-mono text-xs">
        INITIALIZING PHOENIX VIALE FORENSIC ENGINE...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-14 right-4 z-50 bg-slate-900 border border-amber-500/40 text-slate-100 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-mono animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar & Cockpit Ticker */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        items={items}
        onOpenScanner={() => setIsScannerOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {activeTab === 'appraiser' && (
          <VialeAppraiser
            onAddToLedger={handleAddItem}
            onNavigateToLedger={() => setActiveTab('ledger')}
            onNavigateToPhotoGuides={() => setActiveTab('photoguides')}
            onNavigateToPromptEngine={() => setActiveTab('promptengine')}
          />
        )}

        {activeTab === 'chat' && <GeminiChatbot />}

        {activeTab === 'voice' && <LiveVoiceRoom />}

        {activeTab === 'grounding' && <GroundingIntelligence />}

        {activeTab === 'ledger' && (
          <InventoryLedger
            items={items}
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
            onAddNewManualItem={handleAddItem}
            onSwitchToAppraiser={() => setActiveTab('appraiser')}
            onOpenScanner={() => setIsScannerOpen(true)}
            onOpenWorkspace={() => setActiveTab('workspace')}
            highlightItemId={highlightItemId}
          />
        )}

        {activeTab === 'photoguides' && (
          <VisualPhotoGuides
            onOpenAppraiser={() => setActiveTab('appraiser')}
          />
        )}

        {activeTab === 'promptengine' && (
          <SupplementaryPromptEngine />
        )}

        {activeTab === 'workspace' && (
          <GoogleWorkspaceHub
            items={items}
            steps={steps}
            onTaskCompleted={handleToggleStep}
          />
        )}

        {activeTab === 'execution' && (
          <ExecutionCockpit steps={steps} onToggleStep={handleToggleStep} />
        )}

        {activeTab === 'antiscam' && <AntiScamTerminal />}

        {activeTab === 'vault' && <FortressVaultCalc items={items} />}

        {activeTab === 'directives' && <MasterOverseerDirectives />}
      </main>

      {/* QR Code Camera Scanner Modal */}
      {isScannerOpen && (
        <QrScannerModal
          items={items}
          onFoundItem={handleScannedItem}
          onClose={() => setIsScannerOpen(false)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/80 px-4 py-6 mt-12 text-xs text-slate-500 font-mono no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="text-slate-400">PROJECT PHOENIX // VIALE FORENSIC PROTOCOL ACTIVE</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Firebase Cloud Sync</span>
            <span>·</span>
            <span>Google Sheets & Tasks</span>
            <span>·</span>
            <span>Optimal Photo Angles</span>
            <span>·</span>
            <span>Zero Guesswork</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
