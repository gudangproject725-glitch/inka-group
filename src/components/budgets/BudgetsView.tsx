/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import {
  AlertTriangle,
  CheckCircle2,
  PieChart,
  PiggyBank,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { formatRupiah } from '../common/StatusBadge';

export const BudgetsView: React.FC = () => {
  const { budgets, departments, organization } = useProcurement();

  const totalAllocated = budgets.reduce((sum, b) => sum + b.allocatedAmount, 0);
  const totalCommitted = budgets.reduce((sum, b) => sum + b.committedAmount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spentAmount, 0);
  const totalAvailable = Math.max(0, totalAllocated - (totalCommitted + totalSpent));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">
            Monitoring & Kontrol Pagu Anggaran FY2026
          </h1>
          <p className="text-xs text-slate-500">
            Pantau ketersediaan dana belanja departemen sebelum persetujuan dan penerbitan PO dilakukan
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold">
          Tahun Fiskal: 2026 (Aktif)
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs text-slate-400 block mb-1">Total Pagu Dialokasikan</span>
          <div className="text-xl font-black text-slate-900 font-mono">
            {formatRupiah(totalAllocated, organization.currency)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Seluruh departemen organisasi</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs text-amber-600 font-bold block mb-1">Komitmen Belanja (In-Flight)</span>
          <div className="text-xl font-black text-amber-700 font-mono">
            {formatRupiah(totalCommitted, organization.currency)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Dalam PR diajukan & PO berjalan</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs text-blue-600 font-bold block mb-1">Realisasi Selesai (Spent)</span>
          <div className="text-xl font-black text-blue-700 font-mono">
            {formatRupiah(totalSpent, organization.currency)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Telah dibayar & diterima</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs text-emerald-600 font-bold block mb-1">Sisa Anggaran Bebas</span>
          <div className="text-xl font-black text-emerald-700 font-mono">
            {formatRupiah(totalAvailable, organization.currency)}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">Siap untuk alokasi baru</div>
        </div>
      </div>

      {/* Detailed Budget Cards per Department */}
      <div className="space-y-4">
        <h2 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
          Alokasi & Utilisasi Per Departemen
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((b) => {
            const dept = departments.find((d) => d.id === b.departmentId);
            const totalUsed = b.committedAmount + b.spentAmount;
            const pct = b.allocatedAmount > 0 ? Math.round((totalUsed / b.allocatedAmount) * 100) : 0;
            const available = Math.max(0, b.allocatedAmount - totalUsed);
            const isDanger = pct > 90;
            const isWarning = pct > 75 && pct <= 90;

            return (
              <div
                key={b.id}
                className={`bg-white rounded-2xl p-6 border transition flex flex-col justify-between ${
                  isDanger
                    ? 'border-rose-300 shadow-sm'
                    : isWarning
                    ? 'border-amber-300 shadow-sm'
                    : 'border-slate-200 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
                      {dept?.code || 'DEPT'}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isDanger
                          ? 'bg-rose-100 text-rose-800'
                          : isWarning
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {pct}% Terpakai
                    </span>
                  </div>

                  <h3 className="font-extrabold text-sm text-slate-900 leading-snug mb-1">{b.name}</h3>
                  <div className="text-xs text-slate-500 mb-4">{dept?.name}</div>

                  {/* Progress Meter */}
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden mb-4">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isDanger ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>

                  {/* Financial Breakdown */}
                  <div className="space-y-2 text-xs py-3 border-y border-slate-100">
                    <div className="flex justify-between text-slate-600">
                      <span>Total Pagu:</span>
                      <span className="font-mono font-bold text-slate-900">{formatRupiah(b.allocatedAmount)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Komitmen Aktif:</span>
                      <span className="font-mono text-amber-700">{formatRupiah(b.committedAmount)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Realisasi Selesai:</span>
                      <span className="font-mono text-blue-700">{formatRupiah(b.spentAmount)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-100">
                      <span>Sisa Tersedia:</span>
                      <span
                        className={`font-mono text-sm ${
                          isDanger ? 'text-rose-700' : isWarning ? 'text-amber-700' : 'text-emerald-700'
                        }`}
                      >
                        {formatRupiah(available)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 text-[11px] flex items-center gap-1.5 text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>Periode: 01 Jan 2026 – 31 Des 2026</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
