import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  CheckSquare,
  ExternalLink,
  RefreshCw,
  Plus,
  CheckCircle2,
  AlertCircle,
  LogOut,
  User as UserIcon,
  Sparkles,
  Lock,
  TrendingUp,
  Download,
  Share2,
  Calendar,
  Layers
} from 'lucide-react';
import { AppraisalDossier, RoadmapStep } from '../types';
import {
  exportInventoryToGoogleSheet,
  exportVaultToGoogleSheet,
  fetchGoogleTasks,
  createGoogleTask,
  completeGoogleTask,
  syncRoadmapStepsToGoogleTasks,
  SpreadsheetExportResult,
  GoogleTaskItem
} from '../services/workspace';
import {
  googleSignIn,
  logoutUser,
  initAuth,
  getAccessToken
} from '../services/firebase';
import { User } from 'firebase/auth';

interface GoogleWorkspaceHubProps {
  items: AppraisalDossier[];
  steps: RoadmapStep[];
  onTaskCompleted?: (stepId: string) => void;
}

export const GoogleWorkspaceHub: React.FC<GoogleWorkspaceHubProps> = ({
  items,
  steps,
  onTaskCompleted,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [hasToken, setHasToken] = useState<boolean>(false);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sheets state
  const [lastSheetExport, setLastSheetExport] = useState<SpreadsheetExportResult | null>(null);
  const [isExportingSheet, setIsExportingSheet] = useState<boolean>(false);

  // Tasks state
  const [tasks, setTasks] = useState<GoogleTaskItem[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState<boolean>(false);
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [isCreatingTask, setIsCreatingTask] = useState<boolean>(false);

  // Initialize auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setHasToken(!!token);
        if (token) {
          loadTasks();
        }
      },
      () => {
        setCurrentUser(null);
        setHasToken(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setErrorMessage(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setCurrentUser(result.user);
        setHasToken(true);
        setStatusMessage(`Connected Google Workspace as ${result.user.email}`);
        await loadTasks();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Google Sign-in failed. Please try again.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await logoutUser();
    setCurrentUser(null);
    setHasToken(false);
    setTasks([]);
    setStatusMessage('Signed out of Google Workspace.');
  };

  const loadTasks = async () => {
    setIsLoadingTasks(true);
    try {
      const taskList = await fetchGoogleTasks();
      setTasks(taskList);
    } catch (err: any) {
      console.warn('Could not load Google Tasks:', err);
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const handleExportInventory = async () => {
    setIsExportingSheet(true);
    setErrorMessage(null);
    try {
      const result = await exportInventoryToGoogleSheet(items);
      setLastSheetExport(result);
      setStatusMessage(`Created Google Sheet with ${result.rowCount} items.`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to export inventory to Google Sheets.');
    } finally {
      setIsExportingSheet(false);
    }
  };

  const handleExportVault = async () => {
    setIsExportingSheet(true);
    setErrorMessage(null);
    try {
      const result = await exportVaultToGoogleSheet(items);
      setLastSheetExport(result);
      setStatusMessage(`Created Fortress Vault Google Sheet.`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to export Fortress Vault to Google Sheets.');
    } finally {
      setIsExportingSheet(false);
    }
  };

  const handleSyncRoadmapToTasks = async () => {
    setIsLoadingTasks(true);
    setErrorMessage(null);
    try {
      const pendingSteps = steps.filter((s) => !s.completed);
      const res = await syncRoadmapStepsToGoogleTasks(pendingSteps);
      setStatusMessage(`Synced ${res.added} priority operations to Google Tasks.`);
      await loadTasks();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to sync roadmap to Google Tasks.');
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    setIsCreatingTask(true);
    try {
      await createGoogleTask(newTaskTitle.trim());
      setNewTaskTitle('');
      setStatusMessage('Task added to Google Tasks.');
      await loadTasks();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create Google Task.');
    } finally {
      setIsCreatingTask(false);
    }
  };

  const handleToggleTask = async (taskId: string) => {
    try {
      await completeGoogleTask(taskId);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: 'completed' } : t))
      );
      setStatusMessage('Google Task marked complete.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to complete task.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950/40 border border-sky-500/40 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-sky-400 uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
              <span>1P Google Workspace Integration</span>
            </div>
            <h1 className="text-2xl font-black text-slate-100 flex items-center gap-2">
              <span>Google Sheets & Tasks Command Center</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Direct cloud sync with your Google account. Push your inventory ledger and Fortress capital allocations to Google Sheets with 1 click, and sync daily workshop actions directly into Google Tasks.
            </p>
          </div>

          {/* Google Auth Status / Button */}
          <div className="shrink-0 flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800 rounded-xl p-2 px-3">
                <div className="w-8 h-8 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt="User"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-4 h-4" />
                  )}
                </div>
                <div className="text-left text-xs">
                  <div className="font-bold text-slate-200 truncate max-w-[140px]">
                    {currentUser.displayName || 'Authorized User'}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono truncate max-w-[140px]">
                    {currentUser.email}
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  title="Sign out"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer ml-1"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* Official Google Sign-In Button */
              <button
                onClick={handleSignIn}
                disabled={isSigningIn}
                className="gsi-material-button flex items-center gap-3 bg-white text-slate-900 font-semibold px-4 py-2.5 rounded-xl hover:bg-slate-100 transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                <div className="w-4 h-4 shrink-0">
                  <svg viewBox="0 0 48 48" className="w-full h-full">
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                  </svg>
                </div>
                <span className="text-xs font-medium">
                  {isSigningIn ? 'Connecting...' : 'Sign in with Google'}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Status / Error Toast */}
        {statusMessage && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Main Two-Column Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ========================================================= */}
        {/* GOOGLE SHEETS MODULE */}
        {/* ========================================================= */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-100">Google Sheets Exporter</h2>
                <p className="text-[11px] text-slate-400">
                  Export formatted spreadsheets with live formulas & auto-styling
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              API ACTIVE
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Export Inventory Button */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>Inventory & Valuation Sheet</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Exports all {items.length} items with fast cash prices, max yield, fee deductions, and net yield.
                </p>
              </div>
              <button
                onClick={handleExportInventory}
                disabled={isExportingSheet || !currentUser}
                className="w-full py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-emerald-950/30"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isExportingSheet ? 'Generating Sheet...' : 'Export Inventory Ledger'}</span>
              </button>
            </div>

            {/* Export Fortress Vault Button */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>Fortress 50/40/10 Split Sheet</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Exports the Family Safety Vault (50%), Working Arbitrage (40%), and Survival Fund (10%).
                </p>
              </div>
              <button
                onClick={handleExportVault}
                disabled={isExportingSheet || !currentUser}
                className="w-full py-2.5 px-3 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-amber-950/30"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isExportingSheet ? 'Generating...' : 'Export Fortress Split'}</span>
              </button>
            </div>
          </div>

          {/* Last Created Sheet Notification & Direct Link */}
          {lastSheetExport && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/40 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Spreadsheet Successfully Created</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {lastSheetExport.rowCount} rows written
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono truncate">
                {lastSheetExport.title}
              </p>
              <div className="pt-1">
                <a
                  href={lastSheetExport.spreadsheetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow cursor-pointer"
                >
                  <span>Open in Google Sheets</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* GOOGLE TASKS MODULE */}
        {/* ========================================================= */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
                <CheckSquare className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-100">Google Tasks Engine</h2>
                <p className="text-[11px] text-slate-400">
                  Synced with "⚡ ShutterBuck Operations" task list
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={loadTasks}
                disabled={isLoadingTasks || !currentUser}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-40"
                title="Refresh Google Tasks"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingTasks ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={handleSyncRoadmapToTasks}
                disabled={isLoadingTasks || !currentUser}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30 hover:bg-sky-500/30 transition-all cursor-pointer disabled:opacity-50"
              >
                Sync Roadmap
              </button>
            </div>
          </div>

          {/* Quick Add Custom Task Form */}
          <form onSubmit={handleCreateTask} className="flex gap-2">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="e.g. Inspect Super73 battery voltage with multimeter..."
              disabled={!currentUser || isCreatingTask}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-400 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!currentUser || isCreatingTask || !newTaskTitle.trim()}
              className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              Add Task
            </button>
          </form>

          {/* Task List Render */}
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {!currentUser ? (
              <div className="p-6 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                Please sign in with Google above to view and synchronize your Google Tasks.
              </div>
            ) : tasks.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                No active tasks found in "⚡ ShutterBuck Operations". Click "Sync Roadmap" to push your execution milestones!
              </div>
            ) : (
              tasks.map((task) => {
                const isCompleted = task.status === 'completed';
                return (
                  <div
                    key={task.id}
                    className={`flex items-start justify-between gap-3 p-3 rounded-xl border transition-all ${
                      isCompleted
                        ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 overflow-hidden">
                      <button
                        onClick={() => handleToggleTask(task.id)}
                        disabled={isCompleted}
                        className="mt-0.5 cursor-pointer text-slate-400 hover:text-emerald-400 transition-colors"
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <div className="w-4 h-4 rounded border border-slate-600 hover:border-sky-400" />
                        )}
                      </button>
                      <div className="overflow-hidden">
                        <div
                          className={`text-xs font-medium truncate ${
                            isCompleted ? 'line-through text-slate-500' : 'text-slate-200'
                          }`}
                        >
                          {task.title}
                        </div>
                        {task.notes && (
                          <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5 font-mono">
                            {task.notes}
                          </div>
                        )}
                      </div>
                    </div>

                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-mono shrink-0 ${
                        isCompleted
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                      }`}
                    >
                      {isCompleted ? 'DONE' : 'PENDING'}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
