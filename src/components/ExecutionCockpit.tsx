import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Calendar,
  Lock,
  Compass,
  CheckSquare,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Flag,
  Award
} from 'lucide-react';
import { RoadmapStep } from '../types';

interface ExecutionCockpitProps {
  steps: RoadmapStep[];
  onToggleStep: (stepId: string, notes?: string) => void;
}

export const ExecutionCockpit: React.FC<ExecutionCockpitProps> = ({ steps, onToggleStep }) => {
  const [viewMode, setViewMode] = useState<'wip1' | 'full'>('wip1');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<string>('all');
  const [completionNotes, setCompletionNotes] = useState<string>('');
  const [showNotesModalFor, setShowNotesModalFor] = useState<string | null>(null);

  // Find the current active WIP=1 step (first uncompleted step)
  const currentActiveStep = steps.find((s) => !s.completed) || steps[steps.length - 1];

  const totalSteps = steps.length;
  const completedSteps = steps.filter((s) => s.completed).length;
  const progressPercent = Math.round((completedSteps / totalSteps) * 100);

  const levels = [
    { id: 'level0', name: 'Level 0: Days 1–30', subtitle: 'Task-to-Task Cash Harvest', color: 'text-amber-400' },
    { id: 'level1', name: 'Level 1: Year 1', subtitle: '3x Arbitrage Engine ($4k–$7k/mo)', color: 'text-sky-400' },
    { id: 'level2', name: 'Level 2: Year 5', subtitle: 'Flex-Hub & $300k Net Worth', color: 'text-indigo-400' },
    { id: 'level3', name: 'Level 3: Year 10', subtitle: 'Systematized Asset Machine ($2M+)', color: 'text-purple-400' },
    { id: 'level4', name: 'Level 4: Year 15+', subtitle: 'Retirement & 4% Safe Income', color: 'text-emerald-400' },
  ];

  const filteredSteps =
    selectedLevelFilter === 'all'
      ? steps
      : steps.filter((s) => s.level === selectedLevelFilter);

  const handleCompleteCurrent = (stepId: string) => {
    onToggleStep(stepId, completionNotes);
    setShowNotesModalFor(null);
    setCompletionNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                MODULE 3: EXECUTION COCKPIT
              </span>
              <span className="text-xs text-slate-400 font-mono">
                From Broke in Apartment to $3.5M Retirement
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight mt-1">
              Step-by-Step Achievable Roadmap (WIP=1)
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl">
              Eliminates executive paralysis. In Single-Threaded Mode (WIP=1), you are only shown the ONE immediate task to execute right now. Zero overwhelm, zero guesswork.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('wip1')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'wip1'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-950/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>SINGLE TASK (WIP=1)</span>
            </button>
            <button
              onClick={() => setViewMode('full')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'full'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-950/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>15-YEAR HORIZON MAP</span>
            </button>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 space-y-2">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-400">Roadmap Progress: {completedSteps} of {totalSteps} Key Milestones Cleared</span>
            <span className="text-emerald-400 font-bold">{progressPercent}% Achieved</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2 border border-slate-800 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 via-emerald-500 to-sky-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: SINGLE-THREADED EXECUTION (WIP = 1) */}
      {viewMode === 'wip1' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-500/40 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>

            {/* Current Active Step Badge */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping"></span>
                <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                  ACTIVE CURRENT OBJECTIVE (WIP = 1)
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {currentActiveStep.timeframe} · {currentActiveStep.phase}
                </span>
              </div>

              <div className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Target Yield: {currentActiveStep.targetMetric}
              </div>
            </div>

            <div className="py-4 space-y-4">
              <div>
                <span className="text-xs font-mono text-amber-400 uppercase tracking-wider font-semibold block">
                  {currentActiveStep.levelName}
                </span>
                <h2 className="text-2xl font-black text-white tracking-tight mt-0.5">
                  {currentActiveStep.title}
                </h2>
              </div>

              {/* Instructions checklist */}
              <div className="space-y-2 bg-slate-950/70 border border-slate-800/80 rounded-xl p-4">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 block mb-2">
                  Tactical Action Checklist (Execute in Exact Order):
                </span>
                <div className="space-y-2 text-xs text-slate-200">
                  {currentActiveStep.instructions.map((inst, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-md bg-slate-800 text-amber-400 font-mono font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="leading-relaxed">{inst}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fail-Safe Risk Warning */}
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex items-start gap-3 text-rose-300 text-xs">
                <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold tracking-wide uppercase font-mono text-rose-400 block">
                    FORENSIC FAIL-SAFE WARNING:
                  </span>
                  <p className="text-rose-200/90 leading-relaxed">
                    {currentActiveStep.failSafeWarning}
                  </p>
                </div>
              </div>

              {/* Verification Gate */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between text-xs text-slate-400 font-mono">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Completion Verification Gate:</span>
                </div>
                <span className="text-slate-200 font-semibold">{currentActiveStep.verificationTrigger}</span>
              </div>
            </div>

            {/* Complete Task Trigger */}
            <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-slate-400">
                Do not progress until physical verification is complete.
              </span>

              <button
                onClick={() => setShowNotesModalFor(currentActiveStep.id)}
                className="w-full sm:w-auto py-3 px-6 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>CONFIRM TASK COMPLETE & UNLOCK NEXT</span>
              </button>
            </div>
          </div>

          {/* Quick Summary of Preceding Cleared Tasks */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Completed Milestones History
            </h3>
            <div className="space-y-2">
              {steps
                .filter((s) => s.completed)
                .map((step) => (
                  <div
                    key={step.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-emerald-500/20 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-200">{step.title}</span>
                        <span className="text-[11px] text-slate-500 block font-mono">
                          {step.levelName} · Cleared on {step.completionDate || 'Recent'}
                        </span>
                      </div>
                    </div>
                    {step.notes && (
                      <span className="text-[11px] text-slate-400 italic bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">
                        "{step.notes}"
                      </span>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: FULL 15-YEAR HORIZON MAP */}
      {viewMode === 'full' && (
        <div className="space-y-6">
          {/* Level Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedLevelFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                selectedLevelFilter === 'all'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              All Horizons
            </button>
            {levels.map((lvl) => (
              <button
                key={lvl.id}
                onClick={() => setSelectedLevelFilter(lvl.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  selectedLevelFilter === lvl.id
                    ? 'bg-slate-800 text-amber-300 border border-amber-500/40'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {lvl.name}
              </button>
            ))}
          </div>

          {/* Timeline Cards */}
          <div className="space-y-4">
            {filteredSteps.map((step, idx) => (
              <div
                key={step.id}
                className={`bg-slate-900 border rounded-2xl p-5 shadow-sm transition-all ${
                  step.completed
                    ? 'border-emerald-500/30 bg-emerald-500/[0.02]'
                    : step.id === currentActiveStep.id
                    ? 'border-amber-500/50 shadow-amber-950/20'
                    : 'border-slate-800'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => onToggleStep(step.id)}
                      className="mt-1 cursor-pointer"
                      title={step.completed ? 'Mark uncompleted' : 'Mark completed'}
                    >
                      {step.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-600 hover:text-slate-400" />
                      )}
                    </button>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                          {step.levelName}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          {step.timeframe} · {step.phase}
                        </span>
                        {step.id === currentActiveStep.id && !step.completed && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            CURRENT ACTIVE
                          </span>
                        )}
                      </div>
                      <h3 className={`text-base font-bold ${step.completed ? 'text-slate-300 line-through' : 'text-white'}`}>
                        {step.title}
                      </h3>
                      <p className="text-xs text-emerald-400 font-mono font-semibold">
                        {step.targetMetric}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <button
                      onClick={() => onToggleStep(step.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        step.completed
                          ? 'bg-slate-800 text-slate-400 hover:text-white'
                          : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold'
                      }`}
                    >
                      {step.completed ? 'Reopen Step' : 'Mark Completed'}
                    </button>
                  </div>
                </div>

                {/* Instructions Accordion / Details */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2 text-xs">
                  <div className="space-y-1.5 pl-8">
                    {step.instructions.map((inst, i) => (
                      <p key={i} className="text-slate-300 flex items-start gap-2">
                        <span className="text-slate-500 font-mono shrink-0">↳</span>
                        <span>{inst}</span>
                      </p>
                    ))}
                  </div>

                  <div className="mt-3 ml-8 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1">
                    <span className="text-[10px] font-mono font-bold uppercase text-rose-400 block">
                      Fail-Safe Blindspot Interception:
                    </span>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {step.failSafeWarning}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completion Confirmation Modal */}
      {showNotesModalFor && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white">Confirm Milestone Verification</h3>
            </div>

            <p className="text-xs text-slate-300">
              Enter any notes or verified dollar amounts achieved for this step (e.g. "Sold 2 scooters for $780 cash, bills checked"):
            </p>

            <textarea
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              placeholder="e.g. Realized $1,800 local cash, deposited $900 into Family Vault..."
              rows={3}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowNotesModalFor(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleCompleteCurrent(showNotesModalFor)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer"
              >
                Confirm & Unlock Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
