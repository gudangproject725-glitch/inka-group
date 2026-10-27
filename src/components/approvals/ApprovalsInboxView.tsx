/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Lock,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { PurchaseRequest } from '../../types/procurement';
import { formatRupiah, PRStatusBadge } from '../common/StatusBadge';
import { canUserApprove } from '../../domain/workflow';

interface ApprovalsInboxViewProps {
  onSelectPr: (pr: PurchaseRequest) => void;
}

export const ApprovalsInboxView: React.FC<ApprovalsInboxViewProps> = ({ onSelectPr }) => {
  const { purchaseRequests, currentUser, organization, departments } = useProcurement();

  // All pending requests in organization
  const allPending = purchaseRequests.filter((p) => p.status === 'pending_approval');

  // Segregate into:
  // 1. My Action Required (I am authorized to approve at this step and not the requester)
  // 2. Waiting on Others (waiting on different step or different role)
  // 3. My Submissions (I am the requester - self-approval blocked)

  const myActionRequired: PurchaseRequest[] = [];
  const mySelfRequests: PurchaseRequest[] = [];
  const waitingOnOthers: PurchaseRequest[] = [];

  allPending.forEach((pr) => {
    if (pr.requesterId === currentUser.id) {
      mySelfRequests.push(pr);
      return;
    }

    const check = canUserApprove(pr, currentUser);
    if (check.allowed) {
      myActionRequired.push(pr);
    } else {
      waitingOnOthers.push(pr);
    }
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                Approval Inbox & Workflow Control
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500 font-medium">{organization.name}</span>
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 mt-1">
              Antrean Persetujuan (Approval Center)
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Tinjau dan putuskan permintaan pengadaan sesuai wewenang peran{' '}
              <strong className="text-slate-800 capitalize">{currentUser.role.replace('_', ' ')}</strong> Anda.
            </p>
          </div>

          <div className="px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              {myActionRequired.length} Dokumen Memerlukan Tindakan Anda
            </span>
          </div>
        </div>
      </div>

      {/* Section 1: Requires My Action */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-600" />
          <h2 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
            Menunggu Tindakan Anda Sekarang ({myActionRequired.length})
          </h2>
        </div>

        {myActionRequired.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white border border-slate-200/80 text-center text-slate-400 text-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
            <div className="font-bold text-slate-700 text-sm">Semua Tugas Approval Anda Telah Selesai!</div>
            <p className="mt-1">
              Tidak ada Purchase Request yang sedang menunggu otorisasi dari peran {currentUser.role}.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myActionRequired.map((pr) => {
              const dept = departments.find((d) => d.id === pr.departmentId);
              const currentStep = pr.approvalInstances.find(
                (s) => s.stepOrder === pr.currentStepOrder
              );

              return (
                <div
                  key={pr.id}
                  className="bg-white rounded-2xl p-5 border-2 border-amber-300 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono font-black text-sm text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">
                        {pr.requestNumber}
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                        <Clock className="w-3 h-3" />
                        {currentStep?.stepName || `Tahap ${pr.currentStepOrder}`}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 leading-snug mb-1">
                      {pr.purpose}
                    </h3>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 my-4 py-3 border-y border-slate-100">
                      <div>
                        <span className="block text-[10px] text-slate-400">Pemohon</span>
                        <strong className="text-slate-800">{pr.requesterName}</strong>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-400">Departemen</span>
                        <strong className="text-slate-800">{dept?.name || 'Umum'}</strong>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-400">Jumlah Item</span>
                        <strong className="text-slate-800">{pr.items.length} Macam Barang</strong>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-400">Total Pengadaan</span>
                        <strong className="text-blue-700 font-mono text-sm">
                          {formatRupiah(pr.grandTotal, pr.currency)}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-2">
                    <span className="text-[11px] text-slate-400">
                      Target:{' '}
                      {new Date(pr.neededBy).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>

                    <button
                      onClick={() => onSelectPr(pr)}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition flex items-center gap-1.5"
                    >
                      <span>Tinjau & Putuskan</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 2: Self Requests (Blocked Anti-Conflict) */}
      {mySelfRequests.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-slate-200">
          <div className="flex items-center gap-2 text-slate-700">
            <Lock className="w-4 h-4 text-slate-500" />
            <h2 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">
              Permintaan Milik Anda Sendiri ({mySelfRequests.length})
            </h2>
            <span className="text-xs text-slate-400">— Self-approval diblokir oleh sistem</span>
          </div>

          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-3">
            {mySelfRequests.map((pr) => (
              <div
                key={pr.id}
                onClick={() => onSelectPr(pr)}
                className="bg-white p-3.5 rounded-xl border border-slate-200/80 flex items-center justify-between gap-4 cursor-pointer hover:border-slate-300 transition"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-slate-900">{pr.requestNumber}</span>
                    <PRStatusBadge status={pr.status} />
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5 truncate max-w-md">{pr.purpose}</div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <div className="font-bold text-xs text-slate-900 font-mono">
                      {formatRupiah(pr.grandTotal, pr.currency)}
                    </div>
                    <div className="text-[10px] text-slate-400">Sedang di-review Approver lain</div>
                  </div>
                  <button className="px-3 py-1 rounded bg-slate-100 text-slate-600 text-xs font-semibold hover:bg-slate-200">
                    Lihat Progres
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 3: Waiting on Other Approvers */}
      {waitingOnOthers.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-slate-200">
          <div className="flex items-center gap-2 text-slate-700">
            <Clock className="w-4 h-4 text-slate-400" />
            <h2 className="font-extrabold text-sm text-slate-700 uppercase tracking-wider">
              Dokumen Lain yang Sedang Berjalan di Tahap Lain ({waitingOnOthers.length})
            </h2>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs divide-y divide-slate-100 overflow-hidden">
            {waitingOnOthers.map((pr) => {
              const currentStep = pr.approvalInstances.find(
                (s) => s.stepOrder === pr.currentStepOrder
              );
              return (
                <div
                  key={pr.id}
                  onClick={() => onSelectPr(pr)}
                  className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition cursor-pointer text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{pr.requestNumber}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {currentStep?.stepName || `Step ${pr.currentStepOrder}`} (Menunggu{' '}
                        {currentStep?.requiredRole})
                      </span>
                    </div>
                    <div className="text-slate-500 mt-0.5">{pr.purpose}</div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <div className="font-mono font-bold text-slate-900">
                        {formatRupiah(pr.grandTotal, pr.currency)}
                      </div>
                      <div className="text-[10px] text-slate-400">Pemohon: {pr.requesterName}</div>
                    </div>
                    <button className="px-2.5 py-1 rounded bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 font-medium text-[11px] transition">
                      Detail
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
