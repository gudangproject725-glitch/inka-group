/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import {
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Clock,
  CreditCard,
  FileCheck2,
  FilePlus,
  FileText,
  History,
  Layers,
  PiggyBank,
  Plus,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  UserCheck,
} from 'lucide-react';
import { formatRupiah, PRStatusBadge } from '../common/StatusBadge';
import { PurchaseRequest } from '../../types/procurement';

interface DashboardViewProps {
  onOpenCreatePr: () => void;
  onSelectPr: (pr: PurchaseRequest) => void;
  setCurrentTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenCreatePr,
  onSelectPr,
  setCurrentTab,
}) => {
  const {
    organization,
    currentUser,
    purchaseRequests,
    purchaseOrders,
    budgets,
    auditLogs,
  } = useProcurement();

  // Metrics
  const pendingPRs = purchaseRequests.filter((p) => p.status === 'pending_approval');
  const approvedPRs = purchaseRequests.filter((p) => p.status === 'approved');
  const activePOs = purchaseOrders.filter((p) => p.status === 'issued' || p.status === 'sent_to_supplier');

  const totalSpendIssued = purchaseOrders.reduce((sum, po) => sum + po.grandTotal, 0);

  // Current user's pending approval duties
  const myPendingApprovals = purchaseRequests.filter((pr) => {
    if (pr.status !== 'pending_approval') return false;
    if (pr.requesterId === currentUser.id) return false; // Anti-Self Approval
    const currentStep = pr.approvalInstances.find((s) => s.stepOrder === pr.currentStepOrder);
    if (!currentStep || currentStep.status !== 'pending') return false;
    return (
      currentStep.requiredRole === currentUser.role ||
      currentStep.assignedUserId === currentUser.id ||
      currentUser.role === 'organization_admin'
    );
  });

  // Overall budget utilization
  const totalAllocated = budgets.reduce((sum, b) => sum + b.allocatedAmount, 0);
  const totalCommitted = budgets.reduce((sum, b) => sum + b.committedAmount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spentAmount, 0);
  const overallUsed = totalCommitted + totalSpent;
  const overallPercent = totalAllocated > 0 ? Math.min(100, Math.round((overallUsed / totalAllocated) * 100)) : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner: Active User Context & Quick Action Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Procurement Command Center
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500 font-medium">{organization.name}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            Selamat Datang, {currentUser.name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Peran Anda: <strong className="text-slate-800 capitalize">{currentUser.role.replace('_', ' ')}</strong> ({currentUser.jobTitle})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onOpenCreatePr}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Purchase Request</span>
          </button>

          {myPendingApprovals.length > 0 && (
            <button
              onClick={() => setCurrentTab('approvals')}
              className="px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold text-xs flex items-center gap-2 transition"
            >
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Review {myPendingApprovals.length} Approval</span>
            </button>
          )}
        </div>
      </div>

      {/* Urgent Approval Banner if any */}
      {myPendingApprovals.length > 0 && (
        <div className="rounded-2xl bg-amber-50 border border-amber-200/90 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-amber-900">
                Ada {myPendingApprovals.length} Dokumen Menanti Tindakan Persetujuan Anda
              </div>
              <p className="text-xs text-amber-700 mt-0.5">
                Alur Purchase Request memerlukan otorisasi peran {currentUser.role} sebelum dapat berlanjut ke tahap berikutnya.
              </p>
            </div>
          </div>

          <button
            onClick={() => setCurrentTab('approvals')}
            className="shrink-0 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5"
          >
            <span>Buka Antrean Approval</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Primary KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Total Nilai PO Diterbitkan</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-slate-900">
            {formatRupiah(totalSpendIssued, organization.currency)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>{purchaseOrders.length} dokumen Purchase Order resmi</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">PR Menunggu Persetujuan</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-slate-900">{pendingPRs.length} PR Aktif</div>
          <div className="text-[11px] text-amber-600 mt-1 flex items-center gap-1 font-medium">
            <span>Menunggu kelengkapan tahapan</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">PR Disetujui (Siap Jadi PO)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-slate-900">{approvedPRs.length} Dokumen</div>
          <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-medium">
            <span>Siap dikonversi oleh Procurement</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Utilisasi Anggaran Organisasi</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-slate-900">{overallPercent}% Terpakai</div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                overallPercent > 85 ? 'bg-rose-500' : overallPercent > 70 ? 'bg-amber-500' : 'bg-blue-600'
              }`}
              style={{ width: `${overallPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Purchase Requests & Budget Gauges */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Purchase Requests (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Purchase Request Terbaru</h3>
                <p className="text-xs text-slate-400">Pengajuan barang & jasa dari seluruh departemen</p>
              </div>

              <button
                onClick={() => setCurrentTab('purchase-requests')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>Lihat Semua PR</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">No. PR & Keperluan</th>
                    <th className="py-3 px-4">Pemohon</th>
                    <th className="py-3 px-4">Total</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {purchaseRequests.slice(0, 5).map((pr) => (
                    <tr
                      key={pr.id}
                      className="hover:bg-slate-50/70 transition cursor-pointer"
                      onClick={() => onSelectPr(pr)}
                    >
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 font-mono text-xs">{pr.requestNumber}</div>
                        <div className="text-slate-500 text-[11px] truncate max-w-xs">{pr.purpose}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {pr.requesterName}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {formatRupiah(pr.grandTotal, pr.currency)}
                      </td>
                      <td className="py-3 px-4">
                        <PRStatusBadge status={pr.status} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectPr(pr);
                          }}
                          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 font-medium text-[11px] transition"
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
            <button
              onClick={() => setCurrentTab('purchase-requests')}
              className="text-xs font-semibold text-slate-600 hover:text-blue-600"
            >
              Menampilkan {Math.min(5, purchaseRequests.length)} dari {purchaseRequests.length} total Purchase Request
            </button>
          </div>
        </div>

        {/* Budget Meters (1 Col) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Status Pagu Anggaran FY2026</h3>
                <p className="text-xs text-slate-400">Monitoring real-time per departemen</p>
              </div>
              <button
                onClick={() => setCurrentTab('budgets')}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                Kelola
              </button>
            </div>

            <div className="space-y-5">
              {budgets.map((b) => {
                const totalUsed = b.committedAmount + b.spentAmount;
                const pct = b.allocatedAmount > 0 ? Math.round((totalUsed / b.allocatedAmount) * 100) : 0;
                const remaining = Math.max(0, b.allocatedAmount - totalUsed);

                return (
                  <div key={b.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 truncate max-w-[160px]">{b.name}</span>
                      <span className="font-mono font-bold text-slate-700">{pct}%</span>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          pct > 90 ? 'bg-rose-500' : pct > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Sisa: {formatRupiah(remaining, b.currency)}</span>
                      <span>Total: {formatRupiah(b.allocatedAmount, b.currency)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <strong>Proteksi Pengeluaran:</strong> Pengajuan Purchase Request yang melampaui sisa pagu anggaran
              akan memicu notifikasi peringatan merah bagi approver.
            </div>
          </div>
        </div>
      </div>

      {/* Security Audit Activity Feed */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-blue-600" />
            <h3 className="font-extrabold text-sm text-slate-900">Aktivitas Audit Terbaru (Keamanan & Kepatuhan)</h3>
          </div>
          <button
            onClick={() => setCurrentTab('audit-logs')}
            className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
          >
            <span>Seluruh Audit Log</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {auditLogs.slice(0, 4).map((log) => (
            <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-start gap-2.5">
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase shrink-0 mt-0.5">
                  {log.action}
                </span>
                <div>
                  <span className="font-bold text-slate-900">{log.actorName}</span>
                  <span className="text-slate-400 text-[11px]"> ({log.actorRole}) — </span>
                  <span className="text-slate-700">{log.details}</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 shrink-0 pl-7 sm:pl-0">
                {new Date(log.createdAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
