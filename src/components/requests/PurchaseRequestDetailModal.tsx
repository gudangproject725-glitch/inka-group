/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  FileCheck2,
  FileText,
  Lock,
  MapPin,
  Send,
  Shield,
  ShieldAlert,
  ShieldCheck,
  User,
  X,
  XCircle,
} from 'lucide-react';
import { PurchaseRequest } from '../../types/procurement';
import { formatRupiah, PRStatusBadge } from '../common/StatusBadge';
import { canUserApprove } from '../../domain/workflow';

interface PurchaseRequestDetailModalProps {
  request: PurchaseRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenConvertPoModal: (pr: PurchaseRequest) => void;
}

export const PurchaseRequestDetailModal: React.FC<PurchaseRequestDetailModalProps> = ({
  request,
  isOpen,
  onClose,
  onOpenConvertPoModal,
}) => {
  const {
    currentUser,
    departments,
    costCenters,
    decideApproval,
    submitPurchaseRequest,
    cancelPurchaseRequest,
    organization,
  } = useProcurement();

  const [decisionReason, setDecisionReason] = useState('');
  const [actionError, setActionError] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  if (!isOpen || !request) return null;

  const dept = departments.find((d) => d.id === request.departmentId);
  const costCenter = costCenters.find((c) => c.id === request.costCenterId);

  // Check if current user has permission to approve/reject right now
  const permCheck = canUserApprove(request, currentUser);
  const isRequester = currentUser.id === request.requesterId;

  const currentStep = request.approvalInstances.find(
    (s) => s.stepOrder === request.currentStepOrder
  );

  const handleApprove = () => {
    setActionError('');
    const res = decideApproval(request.id, 'approved', decisionReason);
    if (res.error) {
      setActionError(res.error);
    } else {
      setDecisionReason('');
      onClose();
    }
  };

  const handleReject = () => {
    setActionError('');
    if (!decisionReason || decisionReason.trim().length < 5) {
      setActionError('Alasan penolakan wajib diisi minimal 5 karakter untuk audit.');
      return;
    }
    const res = decideApproval(request.id, 'rejected', decisionReason);
    if (res.error) {
      setActionError(res.error);
    } else {
      setDecisionReason('');
      setShowRejectForm(false);
      onClose();
    }
  };

  const handleSubmitDraft = () => {
    const res = submitPurchaseRequest(request.id);
    if (res.error) {
      setActionError(res.error);
    } else {
      onClose();
    }
  };

  const handleCancelPr = () => {
    const res = cancelPurchaseRequest(request.id);
    if (res.error) {
      setActionError(res.error);
    } else {
      onClose();
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm font-mono shrink-0">
              PR
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900 font-mono">
                  {request.requestNumber}
                </h2>
                <PRStatusBadge status={request.status} />
              </div>
              <p className="text-xs text-slate-500 truncate max-w-md mt-0.5">{request.purpose}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Tutup modal detail PR"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {actionError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{actionError}</span>
            </div>
          )}

          {/* Conflict of Interest Warning for Requester */}
          {isRequester && request.status === 'pending_approval' && (
            <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-300 text-slate-700 flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <div>
                <strong>Kebijakan Anti-Konflik Kepentingan:</strong> Anda adalah pemohon dokumen ini. Sistem
                melarang pemohon menyetujui permintaannya sendiri guna menjaga objektivitas pengadaan.
              </div>
            </div>
          )}

          {/* Rejection Notice if rejected */}
          {request.status === 'rejected' && request.rejectionReason && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 space-y-1">
              <div className="font-bold flex items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>Dokumen Ditolak pada Tahap Persetujuan</span>
              </div>
              <p className="text-xs text-rose-700 pl-6 leading-relaxed">
                Alasan resmi: <em>&ldquo;{request.rejectionReason}&rdquo;</em>
              </p>
            </div>
          )}

          {/* Section 1: Overview Metadata */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <span className="text-[11px] text-slate-400 block mb-0.5">Pemohon (Requester)</span>
              <span className="font-bold text-slate-900">{request.requesterName}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block mb-0.5">Departemen</span>
              <span className="font-bold text-slate-900">{dept?.name || 'Umum'}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block mb-0.5">Target Kebutuhan</span>
              <span className="font-bold text-slate-900 font-mono">
                {new Date(request.neededBy).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block mb-0.5">Total Estimasi</span>
              <span className="font-extrabold text-blue-700 font-mono text-sm">
                {formatRupiah(request.grandTotal, request.currency)}
              </span>
            </div>
          </div>

          {/* Section 2: Visual Multi-Tier Approval Chain Stepper */}
          {request.approvalInstances && request.approvalInstances.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    Alur Persetujuan Berjenjang (Approval Workflow)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Setiap tahap harus selesai berurutan sebelum Purchase Order dapat diterbitkan
                  </p>
                </div>
                <div className="text-[11px] font-mono text-slate-500">
                  {request.approvalInstances.filter((s) => s.status === 'approved').length} dari{' '}
                  {request.approvalInstances.length} Tahap Selesai
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {request.approvalInstances.map((step) => {
                  const isCurrent =
                    step.stepOrder === request.currentStepOrder && request.status === 'pending_approval';
                  const isDone = step.status === 'approved';
                  const isFailed = step.status === 'rejected';

                  return (
                    <div
                      key={step.id}
                      className={`p-3.5 rounded-xl border relative transition ${
                        isDone
                          ? 'bg-emerald-50/70 border-emerald-300'
                          : isFailed
                          ? 'bg-rose-50/70 border-rose-300'
                          : isCurrent
                          ? 'bg-amber-50/80 border-amber-400 shadow-xs ring-2 ring-amber-300/40'
                          : 'bg-slate-50 border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-[10px] uppercase tracking-wider text-slate-500">
                          Tahap {step.stepOrder}
                        </span>
                        {isDone ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Disetujui
                          </span>
                        ) : isFailed ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700">
                            <XCircle className="w-3.5 h-3.5" /> Ditolak
                          </span>
                        ) : isCurrent ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 animate-pulse">
                            <Clock className="w-3.5 h-3.5" /> Menunggu Review
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">Terkunci</span>
                        )}
                      </div>

                      <div className="font-bold text-slate-900 text-xs mb-1">{step.stepName}</div>
                      <div className="text-[11px] text-slate-500">
                        Otoritas: <strong className="text-slate-700">{step.requiredRole}</strong>
                      </div>

                      {step.decisionByUserName && (
                        <div className="mt-2.5 pt-2 border-t border-slate-200/80 text-[11px] text-slate-600">
                          <div>
                            Oleh: <strong>{step.decisionByUserName}</strong>
                          </div>
                          {step.decisionAt && (
                            <div className="text-[10px] text-slate-400">
                              {new Date(step.decisionAt).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          )}
                          {step.decisionReason && (
                            <div className="italic text-[10px] text-slate-500 mt-1">
                              &ldquo;{step.decisionReason}&rdquo;
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 3: Line Items Table */}
          <div className="space-y-2 pt-2">
            <h3 className="font-extrabold text-sm text-slate-900">Item Pengadaan</h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">No</th>
                    <th className="py-2.5 px-3">Deskripsi Barang / Jasa</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-center">Satuan</th>
                    <th className="py-2.5 px-3 text-right">Harga Satuan</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {request.items.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="p-2.5 text-slate-400 text-center">{idx + 1}</td>
                      <td className="p-2.5 font-medium text-slate-800">{item.description}</td>
                      <td className="p-2.5 text-center font-mono">{item.quantity}</td>
                      <td className="p-2.5 text-center text-slate-500">{item.unit}</td>
                      <td className="p-2.5 text-right font-mono">
                        {formatRupiah(item.estimatedUnitPrice, request.currency)}
                      </td>
                      <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                        {formatRupiah(item.lineTotal, request.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50/80 border-t border-slate-200 font-medium">
                  <tr>
                    <td colSpan={5} className="py-2 px-3 text-right text-slate-600">
                      Subtotal:
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold">
                      {formatRupiah(request.estimatedTotal, request.currency)}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={5} className="py-1 px-3 text-right text-slate-600">
                      Pajak PPN (11%):
                    </td>
                    <td className="py-1 px-3 text-right font-mono">
                      {formatRupiah(request.taxTotal, request.currency)}
                    </td>
                  </tr>
                  <tr className="border-t border-slate-200 text-sm font-extrabold text-slate-900">
                    <td colSpan={5} className="py-2.5 px-3 text-right">
                      Grand Total Disetujui:
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-blue-700">
                      {formatRupiah(request.grandTotal, request.currency)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Section 4: Approver Action Box (if authorized) */}
          {permCheck.allowed && (
            <div className="bg-amber-50/70 border-2 border-amber-300 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-700" />
                <h4 className="font-extrabold text-sm text-amber-900">
                  Keputusan Persetujuan: {currentStep?.stepName}
                </h4>
              </div>

              <p className="text-xs text-amber-800">
                Sebagai <strong>{currentUser.name}</strong> ({currentUser.role}), Anda memiliki wewenang untuk
                mengambil keputusan pada tahap ini.
              </p>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Catatan / Alasan Keputusan{' '}
                  <span className="text-slate-400 font-normal">
                    (Wajib minimal 5 karakter jika menolak)
                  </span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Ketik catatan pertimbangan atau alasan penolakan..."
                  value={decisionReason}
                  onChange={(e) => setDecisionReason(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleReject}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Tolak Permintaan (Reject)</span>
                </button>

                <button
                  type="button"
                  onClick={handleApprove}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Setujui Tahap Ini (Approve)</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition"
          >
            Tutup
          </button>

          <div className="flex items-center gap-2">
            {/* If Draft: Submit or Cancel */}
            {request.status === 'draft' && isRequester && (
              <>
                <button
                  type="button"
                  onClick={handleCancelPr}
                  className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-bold text-xs transition"
                >
                  Batalkan Draft
                </button>
                <button
                  type="button"
                  onClick={handleSubmitDraft}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Ajukan ke Approval</span>
                </button>
              </>
            )}

            {/* If Approved: Convert to PO CTA */}
            {request.status === 'approved' && !request.generatedPoId && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenConvertPoModal(request);
                }}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition flex items-center gap-2"
              >
                <FileCheck2 className="w-4 h-4" />
                <span>Terbitkan Menjadi Purchase Order (PO)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {/* If Converted to PO */}
            {request.status === 'converted_to_po' && (
              <div className="flex items-center gap-2 text-blue-700 font-bold text-xs">
                <FileCheck2 className="w-4 h-4" />
                <span>PO Berhasil Diterbitkan: {request.generatedPoId?.toUpperCase()}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
