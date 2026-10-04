import React, { useState } from 'react';
import {
  DailyTaskItem,
  AppraisalDossier,
  RepairJob,
} from '../types';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Flame,
  Zap,
  ArrowRight,
  ShieldAlert,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
  Trash2,
} from 'lucide-react';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface DailyOperationsModuleProps {
  tasks: DailyTaskItem[];
  inventoryItems: AppraisalDossier[];
  repairJobs: RepairJob[];
  onSaveTasks: (tasks: DailyTaskItem[]) => void;
  onDeleteTask?: (taskId: string) => void;
  onNavigateToItem: (itemId: string) => void;
  onNavigateToRepair: (jobId: string) => void;
  onOpenWorkspace?: () => void;
}

export const DailyOperationsModule: React.FC<DailyOperationsModuleProps> = ({
  tasks,
  inventoryItems,
  repairJobs,
  onSaveTasks,
  onDeleteTask,
  onNavigateToItem,
  onNavigateToRepair,
  onOpenWorkspace,
}) => {
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<DailyTaskItem | null>(null);

  // New Task State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<DailyTaskItem['category']>('cash_generator');
  const [newPriority, setNewPriority] = useState<DailyTaskItem['priorityMatrix']>('do_first');
  const [newMinutes, setNewMinutes] = useState('30');
  const [newProfit, setNewProfit] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const handleToggleTask = (taskId: string) => {
    const updated = tasks.map((t) =>
      t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
    );
    onSaveTasks(updated);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    const newTask: DailyTaskItem = {
      id: `TASK-${Date.now().toString().slice(-4)}`,
      title: newTitle,
      category: newCategory,
      priorityMatrix: newPriority,
      estimatedMinutes: parseInt(newMinutes, 10) || 30,
      potentialProfit: newProfit ? parseFloat(newProfit) : undefined,
      isCompleted: false,
      dueDate: new Date().toISOString().split('T')[0],
      notes: newNotes,
    };
    onSaveTasks([newTask, ...tasks]);
    setIsNewTaskOpen(false);
    setNewTitle('');
    setNewProfit('');
    setNewNotes('');
  };

  // Group into the 4 Eisenhower Quadrants
  const doFirst = tasks.filter((t) => t.priorityMatrix === 'do_first' && !t.isCompleted);
  const doNext = tasks.filter((t) => t.priorityMatrix === 'do_next' && !t.isCompleted);
  const delegate = tasks.filter((t) => t.priorityMatrix === 'delegate' && !t.isCompleted);
  const defer = tasks.filter((t) => t.priorityMatrix === 'defer' && !t.isCompleted);
  const completedTasks = tasks.filter((t) => t.isCompleted);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Clock className="w-6 h-6 text-amber-400" />
            <span>Daily Workshop Operations & Priority Matrix</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Optimized workflow favoring safety-critical tasks, fast cash liquidity, and highest profit-per-hour repairs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenWorkspace && (
            <button
              onClick={onOpenWorkspace}
              className="px-3.5 py-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Google Tasks Sync</span>
            </button>
          )}

          <button
            onClick={() => setIsNewTaskOpen(true)}
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Add Operational Task</span>
          </button>
        </div>
      </div>

      {/* 4-Quadrant Priority Matrix Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Quadrant 1: DO FIRST (Safety & Immediate Cash) */}
        <div className="bg-slate-900 border-2 border-rose-500/40 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                1. Do First (Immediate / Critical)
              </h2>
            </div>
            <span className="text-xs font-mono font-bold text-rose-400 bg-rose-950/50 px-2 py-0.5 rounded border border-rose-500/30">
              {doFirst.length} Items
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Safety hazard quarantines, same-day buyer meetups, and high-profit ready listings.
          </p>

          <div className="space-y-2 pt-1">
            {doFirst.length === 0 ? (
              <div className="p-4 rounded-lg bg-slate-950/60 text-center text-xs text-slate-500">
                No urgent tasks in the immediate queue.
              </div>
            ) : (
              doFirst.map((task) => (
                <div
                  key={task.id}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3 hover:border-slate-700 transition-colors group"
                >
                  <input
                    type="checkbox"
                    checked={task.isCompleted}
                    onChange={() => handleToggleTask(task.id)}
                    className="w-4 h-4 mt-0.5 accent-rose-500 cursor-pointer shrink-0"
                  />
                  <div className="flex-1 text-xs">
                    <span className="text-slate-100 font-semibold block">
                      {task.title}
                    </span>
                    <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                      <span>{task.estimatedMinutes} min</span>
                      {task.potentialProfit && (
                        <>
                          <span>·</span>
                          <span className="text-emerald-400 font-mono font-bold">
                            +${task.potentialProfit} Profit
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setTaskToDelete(task)}
                    title="Delete Task"
                    className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quadrant 2: DO NEXT (High-Yield Bench Repairs) */}
        <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                2. Do Next (High-Margin Value Add)
              </h2>
            </div>
            <span className="text-xs font-mono font-bold text-amber-300 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-500/30">
              {doNext.length} Items
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Bench diagnostics, repairs with parts already on hand, and photo staging.
          </p>

          <div className="space-y-2 pt-1">
            {doNext.length === 0 ? (
              <div className="p-4 rounded-lg bg-slate-950/60 text-center text-xs text-slate-500">
                All scheduled repairs clear.
              </div>
            ) : (
              doNext.map((task) => (
                <div
                  key={task.id}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3 hover:border-slate-700 transition-colors group"
                >
                  <input
                    type="checkbox"
                    checked={task.isCompleted}
                    onChange={() => handleToggleTask(task.id)}
                    className="w-4 h-4 mt-0.5 accent-amber-500 cursor-pointer shrink-0"
                  />
                  <div className="flex-1 text-xs">
                    <span className="text-slate-100 font-semibold block">
                      {task.title}
                    </span>
                    <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                      <span>{task.estimatedMinutes} min</span>
                      {task.potentialProfit && (
                        <>
                          <span>·</span>
                          <span className="text-emerald-400 font-mono font-bold">
                            +${task.potentialProfit} Profit
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setTaskToDelete(task)}
                    title="Delete Task"
                    className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quadrant 3: DELEGATE / ORDER (Parts Reordering) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                3. Delegate / Order (Stock Replenish)
              </h2>
            </div>
            <span className="text-xs font-mono font-bold text-sky-300 bg-sky-950/50 px-2 py-0.5 rounded border border-sky-500/30">
              {delegate.length} Items
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Reordering depleted tires, ordering custom wiring harnesses, and scheduling parcel pickups.
          </p>

          <div className="space-y-2 pt-1">
            {delegate.length === 0 ? (
              <div className="p-4 rounded-lg bg-slate-950/60 text-center text-xs text-slate-500">
                No parts orders pending.
              </div>
            ) : (
              delegate.map((task) => (
                <div
                  key={task.id}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3 hover:border-slate-700 transition-colors group"
                >
                  <input
                    type="checkbox"
                    checked={task.isCompleted}
                    onChange={() => handleToggleTask(task.id)}
                    className="w-4 h-4 mt-0.5 accent-sky-500 cursor-pointer shrink-0"
                  />
                  <div className="flex-1 text-xs">
                    <span className="text-slate-100 font-semibold block">
                      {task.title}
                    </span>
                    <div className="text-[11px] text-slate-400 mt-1">
                      {task.estimatedMinutes} min
                    </div>
                  </div>
                  <button
                    onClick={() => setTaskToDelete(task)}
                    title="Delete Task"
                    className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quadrant 4: DEFER / LONG-TERM (Aging & Reconditioning) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                4. Defer / Routine (Shop Maintenance)
              </h2>
            </div>
            <span className="text-xs font-mono font-bold text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              {defer.length} Items
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Deep-cleaning workshop benches, battery charger calibration, and hazmat e-waste logistics.
          </p>

          <div className="space-y-2 pt-1">
            {defer.length === 0 ? (
              <div className="p-4 rounded-lg bg-slate-950/60 text-center text-xs text-slate-500">
                No deferred tasks logged.
              </div>
            ) : (
              defer.map((task) => (
                <div
                  key={task.id}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3 hover:border-slate-700 transition-colors group"
                >
                  <input
                    type="checkbox"
                    checked={task.isCompleted}
                    onChange={() => handleToggleTask(task.id)}
                    className="w-4 h-4 mt-0.5 accent-slate-500 cursor-pointer shrink-0"
                  />
                  <div className="flex-1 text-xs">
                    <span className="text-slate-100 font-semibold block">
                      {task.title}
                    </span>
                    <div className="text-[11px] text-slate-400 mt-1">
                      {task.estimatedMinutes} min
                    </div>
                  </div>
                  <button
                    onClick={() => setTaskToDelete(task)}
                    title="Delete Task"
                    className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Completed Tasks Log */}
      {completedTasks.length > 0 && (
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-semibold block text-[11px] uppercase tracking-wider">
              Completed Today ({completedTasks.length})
            </span>
            <button
              onClick={() => {
                onSaveTasks(tasks.filter((t) => !t.isCompleted));
              }}
              className="text-[11px] text-rose-400 hover:text-rose-300 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear Completed</span>
            </button>
          </div>
          <div className="space-y-1">
            {completedTasks.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between text-slate-500 py-1 hover:text-slate-400 transition-colors group"
              >
                <div className="flex items-center gap-2 line-through">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{t.title}</span>
                </div>
                <button
                  onClick={() => setTaskToDelete(t)}
                  title="Delete Completed Task"
                  className="p-1 rounded text-slate-600 hover:text-rose-400 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Task Modal */}
      {isNewTaskOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 sm:p-6 space-y-4 text-slate-100">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-400" />
              <span>Add Daily Operational Task</span>
            </h2>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Task Title / Action</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Solder replacement harness, meet buyer at police station"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Priority Quadrant</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                  >
                    <option value="do_first">1. Do First (Immediate)</option>
                    <option value="do_next">2. Do Next (High Margin)</option>
                    <option value="delegate">3. Delegate / Order</option>
                    <option value="defer">4. Defer / Routine</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                  >
                    <option value="safety">Safety Critical</option>
                    <option value="cash_generator">Cash Generator</option>
                    <option value="high_profit">High Profit Bench</option>
                    <option value="ready_to_list">Ready to List</option>
                    <option value="parts_blocked">Parts Blocked</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Est. Minutes</label>
                  <input
                    type="number"
                    value={newMinutes}
                    onChange={(e) => setNewMinutes(e.target.value)}
                    className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Potential Profit ($)</label>
                  <input
                    type="number"
                    placeholder="Optional upside"
                    value={newProfit}
                    onChange={(e) => setNewProfit(e.target.value)}
                    className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-emerald-400 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewTaskOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Task Deletion */}
      <ConfirmDeleteModal
        isOpen={!!taskToDelete}
        title="Delete Operational Task"
        itemDescription={taskToDelete ? taskToDelete.title : undefined}
        warningText="Permanently removes this task from the daily operational schedule."
        onConfirm={() => {
          if (taskToDelete) {
            if (onDeleteTask) {
              onDeleteTask(taskToDelete.id);
            } else {
              onSaveTasks(tasks.filter((t) => t.id !== taskToDelete.id));
            }
            setTaskToDelete(null);
          }
        }}
        onCancel={() => setTaskToDelete(null)}
      />
    </div>
  );
};
