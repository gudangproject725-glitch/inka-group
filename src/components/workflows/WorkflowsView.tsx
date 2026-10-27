/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import {
  ArrowDown,
  CheckCircle2,
  GitFork,
  Lock,
  Plus,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { formatRupiah } from '../common/StatusBadge';
import { ApprovalStepRule } from '../../types/procurement';

export const WorkflowsView: React.FC = () => {
  const { workflows, updateWorkflow } = useProcurement();

  const activeWorkflow = workflows.find((w) => w.status === 'active') || workflows[0];
  const [successToast, setSuccessToast] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">
            Konfigurasi Alur Persetujuan (Approval Workflows)
          </h1>
          <p className="text-xs text-slate-500">
            Atur hierarki bertingkat, batas nominal (threshold), dan penugasan peran pemutus transaksi
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold bg-blue-50 text-blue-700 px-3 py-1.5 rounded-xl border border-blue-200">
            Versi Aktif: v{activeWorkflow.version}.0
          </span>
        </div>
      </div>

      {/* Security Principles Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-md">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-white">
              Prinsip Keamanan Workflow Standar Inka Company
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Anti-Self Approval:</strong> Pemohon dilarang menyetujui dokumen miliknya sendiri.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Sekuensial Ketat:</strong> Langkah N+1 terkunci sampai Langkah N berstatus Disetujui.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Kewajiban Alasan:</strong> Setiap penolakan wajib mencantumkan alasan tertulis di audit trail.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Workflow Visual Hierarchy Stepper Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-6">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="font-extrabold text-base text-slate-900">{activeWorkflow.name}</h2>
              <p className="text-xs text-slate-500">
                Alur ini dievaluasi secara otomatis setiap kali Purchase Request baru diajukan
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Status: Aktif Menyeluruh
            </span>
          </div>
        </div>

        {/* Steps Visual Chain */}
        <div className="space-y-4 max-w-2xl mx-auto">
          {activeWorkflow.steps.map((step, idx) => (
            <React.Fragment key={step.id}>
              <div className="p-5 rounded-2xl border-2 border-slate-200 hover:border-blue-300 transition bg-slate-50/60 relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                      {step.stepOrder}
                    </span>
                    <span className="font-extrabold text-sm text-slate-900">{step.stepName}</span>
                  </div>

                  <span className="text-[11px] font-bold text-blue-700 bg-blue-100/70 px-2.5 py-0.5 rounded-full uppercase">
                    Peran: {step.approverRole}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 mt-3 pt-3 border-t border-slate-200/70">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Ambang Batas Nilai:</span>
                    <strong className="text-slate-900 font-mono">
                      {step.minimumAmount === 0 ? 'Semua Nominal' : `≥ ${formatRupiah(step.minimumAmount)}`}
                    </strong>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Sifat Tahapan:</span>
                    <span className="font-semibold text-emerald-700">Wajib (Mandatory Step)</span>
                  </div>
                </div>
              </div>

              {idx < activeWorkflow.steps.length - 1 && (
                <div className="flex justify-center text-slate-400">
                  <ArrowDown className="w-5 h-5 animate-bounce" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
