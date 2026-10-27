/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import {
  AlertTriangle,
  CheckCircle2,
  FilePlus,
  HelpCircle,
  Plus,
  ShieldAlert,
  Trash2,
  X,
} from 'lucide-react';
import { formatRupiah } from '../common/StatusBadge';
import { calculateOrderTotals, validateBudgetAvailability } from '../../domain/workflow';

interface CreatePurchaseRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ItemDraft {
  catalogItemId?: string;
  description: string;
  quantity: number;
  unit: string;
  estimatedUnitPrice: number;
}

export const CreatePurchaseRequestModal: React.FC<CreatePurchaseRequestModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const {
    departments,
    costCenters,
    catalogItems,
    budgets,
    createPurchaseRequest,
    organization,
  } = useProcurement();

  const [purpose, setPurpose] = useState('');
  const [departmentId, setDepartmentId] = useState(departments[0]?.id || '');
  const [costCenterId, setCostCenterId] = useState(costCenters[0]?.id || '');
  const [neededBy, setNeededBy] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  );
  const [deliveryLocation, setDeliveryLocation] = useState(
    'Kantor Pusat - Menara Inka Lt. 12 (Ruang IT)'
  );

  const [items, setItems] = useState<ItemDraft[]>([
    {
      catalogItemId: catalogItems[0]?.id,
      description: catalogItems[0]?.name || 'ThinkPad L14 Gen 4 Intel Core i7',
      quantity: 1,
      unit: catalogItems[0]?.unit || 'Unit',
      estimatedUnitPrice: catalogItems[0]?.defaultPrice || 18500000,
    },
  ]);

  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  // Filter cost centers for selected department
  const availableCostCenters = costCenters.filter((c) => c.departmentId === departmentId);

  // Totals
  const { subtotal, taxTotal, grandTotal } = calculateOrderTotals(items);

  // Real-time budget validation check
  const deptBudget = budgets.find((b) => b.departmentId === departmentId);
  const budgetCheck = deptBudget ? validateBudgetAvailability(deptBudget, grandTotal) : null;

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        description: '',
        quantity: 1,
        unit: 'Unit',
        estimatedUnitPrice: 0,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCatalogSelect = (index: number, catId: string) => {
    if (!catId) return;
    const cat = catalogItems.find((c) => c.id === catId);
    if (!cat) return;

    setItems((prev) =>
      prev.map((it, idx) =>
        idx === index
          ? {
              ...it,
              catalogItemId: cat.id,
              description: cat.name,
              unit: cat.unit,
              estimatedUnitPrice: cat.defaultPrice,
            }
          : it
      )
    );
  };

  const handleItemChange = (index: number, field: keyof ItemDraft, val: any) => {
    setItems((prev) =>
      prev.map((it, idx) => (idx === index ? { ...it, [field]: val } : it))
    );
  };

  const handleSubmitForm = (submitImmediately: boolean) => {
    setErrorMessage('');

    if (!purpose.trim()) {
      setErrorMessage('Keperluan atau tujuan pengadaan wajib diisi.');
      return;
    }

    const invalidItem = items.find((i) => !i.description.trim() || i.quantity <= 0 || i.estimatedUnitPrice < 0);
    if (invalidItem) {
      setErrorMessage('Semua item harus memiliki deskripsi dan kuantitas valid lebih dari 0.');
      return;
    }

    const result = createPurchaseRequest({
      purpose,
      departmentId,
      costCenterId,
      neededBy,
      deliveryLocation,
      items,
      submitImmediately,
    });

    if (result.error) {
      setErrorMessage(result.error);
      return;
    }

    onSuccess();
    onClose();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              Buat Purchase Request (PR) Baru
            </h2>
            <p className="text-xs text-slate-500">
              Formulir terstandarisasi untuk pengajuan barang atau jasa ke alur persetujuan
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup modal buat PR"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section 1: General Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block font-bold text-slate-800 mb-1">
                Tujuan / Alasan Pengadaan <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: Pengadaan 5 Unit Laptop untuk Headcount Engineer Baru Q4"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Departemen Pemohon</label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Pusat Biaya (Cost Center)</label>
              <select
                value={costCenterId}
                onChange={(e) => setCostCenterId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
              >
                {availableCostCenters.length > 0 ? (
                  availableCostCenters.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))
                ) : (
                  <option value="">Cost Center Default Organisasi</option>
                )}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Tanggal Target Dibutuhkan</label>
              <input
                type="date"
                value={neededBy}
                onChange={(e) => setNeededBy(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Lokasi Pengiriman / Penerimaan</label>
              <input
                type="text"
                value={deliveryLocation}
                onChange={(e) => setDeliveryLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
              />
            </div>
          </div>

          {/* Section 2: Items Table */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Rincian Barang / Jasa</h3>
                <p className="text-[11px] text-slate-400">Pilih dari katalog master atau ketik item custom</p>
              </div>

              <button
                type="button"
                onClick={handleAddItem}
                className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Baris Item</span>
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Katalog Cepat (Opsional)</th>
                    <th className="py-2.5 px-3 min-w-[200px]">Deskripsi Item</th>
                    <th className="py-2.5 px-3 w-20">Qty</th>
                    <th className="py-2.5 px-3 w-24">Satuan</th>
                    <th className="py-2.5 px-3 w-32">Harga Satuan (Rp)</th>
                    <th className="py-2.5 px-3 w-32">Total (Rp)</th>
                    <th className="py-2.5 px-2 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, idx) => {
                    const lineTotal = (Number(item.quantity) || 0) * (Number(item.estimatedUnitPrice) || 0);
                    return (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-2">
                          <select
                            value={item.catalogItemId || ''}
                            onChange={(e) => handleCatalogSelect(idx, e.target.value)}
                            className="w-full p-1.5 border border-slate-200 rounded text-xs"
                          >
                            <option value="">-- Item Custom --</option>
                            {catalogItems.map((cat) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.name} ({formatRupiah(cat.defaultPrice)})
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="p-2">
                          <input
                            type="text"
                            placeholder="Deskripsi barang / spesifikasi"
                            value={item.description}
                            onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                            className="w-full p-1.5 border border-slate-200 rounded text-xs"
                          />
                        </td>

                        <td className="p-2">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              handleItemChange(idx, 'quantity', Math.max(1, parseInt(e.target.value) || 1))
                            }
                            className="w-full p-1.5 border border-slate-200 rounded text-xs font-mono text-center"
                          />
                        </td>

                        <td className="p-2">
                          <input
                            type="text"
                            placeholder="Unit/Pcs"
                            value={item.unit}
                            onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                            className="w-full p-1.5 border border-slate-200 rounded text-xs text-center"
                          />
                        </td>

                        <td className="p-2">
                          <input
                            type="number"
                            min="0"
                            step="1000"
                            value={item.estimatedUnitPrice}
                            onChange={(e) =>
                              handleItemChange(idx, 'estimatedUnitPrice', Math.max(0, parseFloat(e.target.value) || 0))
                            }
                            className="w-full p-1.5 border border-slate-200 rounded text-xs font-mono text-right"
                          />
                        </td>

                        <td className="p-2 font-mono font-bold text-slate-800 text-right pr-3">
                          {formatRupiah(lineTotal, organization.currency)}
                        </td>

                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            disabled={items.length <= 1}
                            className="text-slate-400 hover:text-rose-600 disabled:opacity-30 transition p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Totals & Real-time Budget Verification Check */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200 items-start">
            {/* Budget Insight Banner */}
            {budgetCheck && (
              <div
                className={`p-4 rounded-xl border flex flex-col justify-between ${
                  !budgetCheck.isSufficient
                    ? 'bg-rose-50 border-rose-300 text-rose-900'
                    : budgetCheck.remainingAfterRequest < budgetCheck.allocated * 0.15
                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                    : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {!budgetCheck.isSufficient ? (
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-bold text-xs">
                      {!budgetCheck.isSufficient
                        ? 'Peringatan: Melebihi Batas Anggaran Tersedia!'
                        : 'Verifikasi Anggaran: Dana Mencukupi'}
                    </div>
                    <div className="text-[11px] mt-1 space-y-0.5">
                      <div>
                        Pagu Dialokasikan: <strong>{formatRupiah(budgetCheck.allocated)}</strong>
                      </div>
                      <div>
                        Sisa Saat Ini: <strong>{formatRupiah(budgetCheck.available)}</strong>
                      </div>
                      <div>
                        Estimasi Sisa Setelah PR Ini:{' '}
                        <strong
                          className={
                            budgetCheck.remainingAfterRequest < 0 ? 'text-rose-700 font-black' : ''
                          }
                        >
                          {formatRupiah(budgetCheck.remainingAfterRequest)}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>

                {!budgetCheck.isSufficient && (
                  <div className="mt-3 text-[11px] text-rose-700 font-semibold bg-white/70 p-2 rounded border border-rose-200">
                    Catatan: Dokumen tetap dapat disimpan sebagai draft, tetapi akan memerlukan persetujuan khusus
                    dari Controller Keuangan saat diajukan.
                  </div>
                )}
              </div>
            )}

            {/* Calculations Box */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Subtotal ({items.length} Item):</span>
                <span className="font-mono font-medium">{formatRupiah(subtotal, organization.currency)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Pajak PPN (11%):</span>
                <span className="font-mono font-medium">{formatRupiah(taxTotal, organization.currency)}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-sm font-extrabold text-slate-900">
                <span>Total Estimasi Pengadaan:</span>
                <span className="font-mono text-base text-blue-700">
                  {formatRupiah(grandTotal, organization.currency)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition"
          >
            Batal
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleSubmitForm(false)}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition"
            >
              Simpan Draft Saja
            </button>

            <button
              type="button"
              onClick={() => handleSubmitForm(true)}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Kirim untuk Approval (Submit)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
