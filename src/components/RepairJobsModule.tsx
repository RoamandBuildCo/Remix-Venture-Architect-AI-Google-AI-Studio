import React, { useState } from 'react';
import {
  RepairJob,
  AppraisalDossier,
  PartItem,
} from '../types';
import { formatCurrency, exportRepairsToCsv } from '../utils/storage';
import {
  Wrench,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Download,
  Search,
  CheckSquare,
  Square,
  ShieldCheck,
  ArrowRight,
  X,
  FileText,
  Trash2,
} from 'lucide-react';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface RepairJobsModuleProps {
  jobs: RepairJob[];
  inventoryItems: AppraisalDossier[];
  partsInventory: PartItem[];
  onSaveJob: (job: RepairJob) => void;
  onDeleteJob?: (jobId: string) => void;
  onNavigateToItem: (itemId: string) => void;
  highlightJobId?: string | null;
}

const JOB_STATUSES: RepairJob['status'][] = [
  'Intake',
  'Diagnosing',
  'Quote needed',
  'Awaiting customer approval',
  'Awaiting parts',
  'Repair in progress',
  'Testing',
  'Complete',
  'Picked up',
  'Cancelled',
  'Unsafe / hold',
];

export const RepairJobsModule: React.FC<RepairJobsModuleProps> = ({
  jobs,
  inventoryItems,
  partsInventory,
  onSaveJob,
  onDeleteJob,
  onNavigateToItem,
  highlightJobId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedJob, setSelectedJob] = useState<RepairJob | null>(
    highlightJobId ? jobs.find((j) => j.id === highlightJobId) || null : null
  );
  const [isNewJobModalOpen, setIsNewJobModalOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<RepairJob | null>(null);

  // New Job Form State
  const [newLinkedItemId, setNewLinkedItemId] = useState(inventoryItems[0]?.id || '');
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newComplaint, setNewComplaint] = useState('');
  const [newDiagnosis, setNewDiagnosis] = useState('');
  const [newRepairPlan, setNewRepairPlan] = useState('');
  const [newLaborHours, setNewLaborHours] = useState('1.0');

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      searchQuery === '' ||
      job.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.vehicleTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.complaint.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeJobsCount = jobs.filter((j) => j.status !== 'Complete' && j.status !== 'Cancelled').length;
  const waitingPartsCount = jobs.filter((j) => j.status === 'Awaiting parts').length;
  const qcPassedCount = jobs.filter((j) => j.qcChecklistPassed).length;

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    const linkedItem = inventoryItems.find((i) => i.id === newLinkedItemId);
    const title = linkedItem ? linkedItem.assetName : 'Custom Shop Item';
    const nextSeq = jobs.length + 1;
    const newId = `JOB-2026-${nextSeq.toString().padStart(2, '0')}`;

    const newJob: RepairJob = {
      id: newId,
      inventoryItemId: newLinkedItemId,
      vehicleTitle: title,
      customerName: newCustomerName || undefined,
      complaint: newComplaint,
      diagnosis: newDiagnosis || 'Intake bench inspection',
      repairPlan: newRepairPlan || 'Standard troubleshooting',
      status: 'Diagnosing',
      safetyStatus: 'Testing Required',
      laborEstimateHours: parseFloat(newLaborHours) || 1.0,
      actualLaborHours: 0,
      partsCost: 0,
      shopSuppliesCost: 5,
      outsideServiceCost: 0,
      partsRequired: [],
      partsInstalled: [],
      beforePhotos: [],
      afterPhotos: [],
      qcChecklistPassed: false,
      technicianNotes: 'Job ticket created.',
      createdAt: new Date().toISOString().split('T')[0],
    };

    onSaveJob(newJob);
    setSelectedJob(newJob);
    setIsNewJobModalOpen(false);
    setNewComplaint('');
    setNewDiagnosis('');
    setNewRepairPlan('');
  };

  const handleUpdateJobField = (field: keyof RepairJob, value: any) => {
    if (!selectedJob) return;
    const updated: RepairJob = {
      ...selectedJob,
      [field]: value,
    };
    onSaveJob(updated);
    setSelectedJob(updated);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Wrench className="w-6 h-6 text-amber-400" />
            <span>Repair Jobs & Bench Work Orders</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Tracking diagnosis, labor hours, parts committed, and final quality control sign-off.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportRepairsToCsv(jobs)}
            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsNewJobModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Create Work Order</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <span className="text-xs text-slate-400">Active Work Orders</span>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {activeJobsCount}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">In shop rotation</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <span className="text-xs text-slate-400">Waiting on Parts</span>
          <div className="text-2xl font-bold font-mono text-rose-400 mt-1">
            {waitingPartsCount}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Blocked benches</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <span className="text-xs text-slate-400">QC Passed</span>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {qcPassedCount}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Signed off safe</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <span className="text-xs text-slate-400">Labor Tracked</span>
          <div className="text-2xl font-bold font-mono text-amber-300 mt-1">
            {jobs.reduce((acc, j) => acc + (j.actualLaborHours || j.laborEstimateHours || 0), 0).toFixed(1)}h
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Total shop hours</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Job ID, vehicle, or complaint..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 shrink-0">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            {JOB_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Job Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredJobs.map((job) => {
          const isComplete = job.status === 'Complete';
          const isWaitingParts = job.status === 'Awaiting parts';
          const isHold = job.safetyStatus === 'Safety Hold' || job.status === 'Unsafe / hold';

          return (
            <div
              key={job.id}
              onClick={() => setSelectedJob(job)}
              className={`p-4 rounded-xl border transition-all cursor-pointer group ${
                selectedJob?.id === job.id
                  ? 'border-amber-500 bg-slate-800/60'
                  : isHold
                  ? 'bg-red-950/20 border-red-500/50'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[11px] font-mono font-bold text-amber-400">
                    {job.id}
                  </span>
                  <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                    {job.vehicleTitle}
                  </h3>
                </div>

                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    isComplete
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : isWaitingParts
                      ? 'bg-rose-500/20 text-rose-300'
                      : isHold
                      ? 'bg-red-500/20 text-red-300'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  {job.status}
                </span>
              </div>

              <div className="mt-3 space-y-2 text-xs">
                <div className="text-slate-300 line-clamp-2">
                  <span className="text-slate-500">Complaint:</span> {job.complaint}
                </div>

                <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                  <div>
                    <span className="text-slate-500">Labor:</span>{' '}
                    <span className="font-mono text-slate-200">
                      {job.actualLaborHours || job.laborEstimateHours} hrs
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Parts Cost:</span>{' '}
                    <span className="font-mono text-amber-300">
                      {formatCurrency(job.partsCost)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <span className="text-slate-500 font-mono">{job.createdAt}</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-medium flex items-center gap-1 ${
                        job.qcChecklistPassed ? 'text-emerald-400' : 'text-slate-500'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{job.qcChecklistPassed ? 'QC Passed' : 'QC Pending'}</span>
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setJobToDelete(job);
                      }}
                      title="Delete Work Order"
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-semibold">Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Job Work Order Detail Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-5 sm:p-6 space-y-5 text-slate-100 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800 gap-3">
              <div>
                <span className="text-xs font-mono font-bold text-amber-400">
                  {selectedJob.id} · WORK ORDER
                </span>
                <h2 className="text-lg font-bold text-white mt-0.5">
                  {selectedJob.vehicleTitle}
                </h2>
                {selectedJob.customerName && (
                  <span className="text-xs text-slate-400">
                    Customer: {selectedJob.customerName}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setJobToDelete(selectedJob)}
                  className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Delete Work Order"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Status and Safety Selectors */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <div>
                <label className="text-slate-400 block mb-1">Repair Stage:</label>
                <select
                  value={selectedJob.status}
                  onChange={(e) => handleUpdateJobField('status', e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 font-semibold"
                >
                  {JOB_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Safety Status:</label>
                <select
                  value={selectedJob.safetyStatus}
                  onChange={(e) => handleUpdateJobField('safetyStatus', e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 font-semibold"
                >
                  <option value="Safe">Safe</option>
                  <option value="Safety Hold">Safety Hold</option>
                  <option value="Testing Required">Testing Required</option>
                </select>
              </div>
            </div>

            {/* Complaint, Diagnosis & Repair Plan */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-medium">Customer / Intake Complaint</label>
                <textarea
                  rows={2}
                  value={selectedJob.complaint}
                  onChange={(e) => handleUpdateJobField('complaint', e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-medium">Forensic Bench Diagnosis</label>
                <textarea
                  rows={2}
                  value={selectedJob.diagnosis}
                  onChange={(e) => handleUpdateJobField('diagnosis', e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-medium">Actionable Repair Plan</label>
                <textarea
                  rows={2}
                  value={selectedJob.repairPlan}
                  onChange={(e) => handleUpdateJobField('repairPlan', e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                />
              </div>
            </div>

            {/* Hours and Financials */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <div>
                <label className="text-slate-400 block mb-1">Est. Hours</label>
                <input
                  type="number"
                  step="0.1"
                  value={selectedJob.laborEstimateHours}
                  onChange={(e) => handleUpdateJobField('laborEstimateHours', parseFloat(e.target.value) || 0)}
                  className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Actual Hours</label>
                <input
                  type="number"
                  step="0.1"
                  value={selectedJob.actualLaborHours}
                  onChange={(e) => handleUpdateJobField('actualLaborHours', parseFloat(e.target.value) || 0)}
                  className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-amber-300 font-bold font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Parts Cost ($)</label>
                <input
                  type="number"
                  step="1"
                  value={selectedJob.partsCost}
                  onChange={(e) => handleUpdateJobField('partsCost', parseFloat(e.target.value) || 0)}
                  className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Shop Supplies ($)</label>
                <input
                  type="number"
                  step="1"
                  value={selectedJob.shopSuppliesCost}
                  onChange={(e) => handleUpdateJobField('shopSuppliesCost', parseFloat(e.target.value) || 0)}
                  className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-slate-200 font-mono"
                />
              </div>
            </div>

            {/* Quality Control Checklist */}
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider">
                  Quality Control (QC) Sign-Off Checklist
                </span>
                <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-emerald-400">
                  <input
                    type="checkbox"
                    checked={selectedJob.qcChecklistPassed}
                    onChange={(e) => handleUpdateJobField('qcChecklistPassed', e.target.checked)}
                    className="w-4 h-4 accent-emerald-500"
                  />
                  <span>Sign-Off: All QC Tests Passed</span>
                </label>
              </div>
              <p className="text-[11px] text-slate-500">
                Mandatory checks: Brakes stop within spec, folding latch locked tight, tire pressure verified, motor cables clear of tire rub.
              </p>
            </div>

            <div className="flex justify-between items-center pt-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onNavigateToItem(selectedJob.inventoryItemId);
                    setSelectedJob(null);
                  }}
                  className="text-xs text-amber-400 hover:text-amber-300 font-medium"
                >
                  View Vehicle Dossier in Ledger &rarr;
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setJobToDelete(selectedJob)}
                  className="px-3 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Work Order</span>
                </button>

                <button
                  onClick={() => setSelectedJob(null)}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer"
                >
                  Save & Close Ticket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Job Modal */}
      {isNewJobModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-5 sm:p-6 space-y-4 text-slate-100">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-400" />
              <span>Create New Work Order</span>
            </h2>

            <form onSubmit={handleCreateJob} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Select Linked Vehicle / Item</label>
                <select
                  value={newLinkedItemId}
                  onChange={(e) => setNewLinkedItemId(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                >
                  {inventoryItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.id} - {item.assetName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Customer Name (Leave blank if shop inventory)</label>
                <input
                  type="text"
                  placeholder="Optional customer name"
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Complaint / Requested Repair</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flat rear tire, brake binding, throttle cut out"
                  value={newComplaint}
                  onChange={(e) => setNewComplaint(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Initial Diagnosis</label>
                <textarea
                  rows={2}
                  placeholder="Multimeter test, visual inspection results"
                  value={newDiagnosis}
                  onChange={(e) => setNewDiagnosis(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Est. Labor Hours</label>
                <input
                  type="number"
                  step="0.5"
                  value={newLaborHours}
                  onChange={(e) => setNewLaborHours(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewJobModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Create Job Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Work Order Deletion */}
      <ConfirmDeleteModal
        isOpen={!!jobToDelete}
        title="Delete Repair Work Order"
        itemDescription={jobToDelete ? `${jobToDelete.id} — ${jobToDelete.vehicleTitle}` : undefined}
        warningText="Permanently removes this repair job ticket, logged diagnostic findings, labor hours, and parts commitment."
        onConfirm={() => {
          if (jobToDelete && onDeleteJob) {
            onDeleteJob(jobToDelete.id);
            if (selectedJob?.id === jobToDelete.id) {
              setSelectedJob(null);
            }
            setJobToDelete(null);
          }
        }}
        onCancel={() => setJobToDelete(null)}
      />
    </div>
  );
};
