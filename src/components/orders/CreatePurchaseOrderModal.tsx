/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import {
  AlertTriangle,
  Building2,
  Calendar,
  CheckCircle2,
  FileCheck2,
  Plus,
  Truck,
  X,
} from 'lucide-react';
import { PurchaseRequest } from '../../types/procurement';
import { formatRupiah } from '../common/StatusBadge';
import { calculateOrderTotals } from '../../domain/workflow';

interface CreatePurchaseOrderModalProps {
  sourcePr: PurchaseRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreatePurchaseOrderModal: React.FC<CreatePurchaseOrderModalProps> = ({
  sourcePr,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { suppliers, convertPrToPurchaseOrder, organization } = useProcurement();

  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState(
    new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0]
  );
  const [paymentTerms, setPaymentTerms] = useState(suppliers[0]?.paymentTerms || 'Net 30 Days');
  const [notes, setNotes] = useState(
    'Kirimkan barang sesuai spesifikasi dokumen ini. Faktur pajak & surat jalan wajib disertakan saat pengiriman.'
  );
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  // Use items from source PR if available, else fallback
  const items = sourcePr
    ? sourcePr.items.map((i) => ({
        catalogItemId: i.catalogItemId,
        description: i.description,
        quantity: i.quantity,
        unit: i.unit,
        unitPrice: i.estimatedUnitPrice,
      }))
    : [];

  const { subtotal, taxTotal, grandTotal } = calculateOrderTotals(items);

  const selectedSupplier = suppliers.find((s) => s.id === supplierId);

  const handleSupplierChange = (id: string) => {
    setSupplierId(id);
    const sup = suppliers.find((s) => s.id === id);
    if (sup) {
      setPaymentTerms(sup.paymentTerms);
    }
  };

  const handleIssuePo = () => {
    setErrorMessage('');
    if (!supplierId) {
      setErrorMessage('Pemasok (Supplier) wajib dipilih.');
      return;
    }

    const res = convertPrToPurchaseOrder({
      purchaseRequestId: sourcePr?.id,
      supplierId,
      paymentTerms,
      expectedDeliveryDate,
      notes,
      items,
    });

    if (res.error) {
      setErrorMessage(res.error);
    } else {
      onSuccess();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-xs">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Penerbitan Purchase Order Resmi (PO)
              </h2>
              <p className="text-slate-500 text-xs">
                Sumber: <strong className="font-mono text-blue-700">{sourcePr?.requestNumber}</strong> (Telah Disetujui Penuh)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700">
              {errorMessage}
            </div>
          )}

          {/* Supplier Picker */}
          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Pilih Mitra Pemasok (Vendor) <span className="text-rose-500">*</span>
            </label>
            <select
              value={supplierId}
              onChange={(e) => handleSupplierChange(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs bg-white font-medium"
            >
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} — {s.name} ({s.category})
                </option>
              ))}
            </select>
          </div>

          {selectedSupplier && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 space-y-1">
              <div>
                Alamat: <strong>{selectedSupplier.address}</strong>
              </div>
              <div className="flex items-center gap-4 text-[11px] text-slate-500">
                <span>Email: {selectedSupplier.email}</span>
                <span>NPWP: {selectedSupplier.taxId}</span>
              </div>
            </div>
          )}

          {/* PO Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Syarat Pembayaran</label>
              <input
                type="text"
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                placeholder="Contoh: Net 30 Days"
                className="w-full p-2 rounded-lg border border-slate-300 text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Target Tanggal Pengiriman</label>
              <input
                type="date"
                value={expectedDeliveryDate}
                onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-300 text-xs font-mono"
              />
            </div>
          </div>

          {/* Items Summary Table */}
          <div className="space-y-2 pt-2">
            <span className="font-bold text-slate-800 block">Item yang Akan Dipesan</span>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Item</th>
                    <th className="py-2 px-3 text-center">Qty</th>
                    <th className="py-2 px-3 text-right">Harga Satuan</th>
                    <th className="py-2 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="p-2.5 font-medium text-slate-900">{it.description}</td>
                      <td className="p-2.5 text-center font-mono">{it.quantity} {it.unit}</td>
                      <td className="p-2.5 text-right font-mono">{formatRupiah(it.unitPrice)}</td>
                      <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                        {formatRupiah(it.quantity * it.unitPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 border-t border-slate-200">
                  <tr>
                    <td colSpan={3} className="py-2 px-3 text-right text-slate-600 font-medium">
                      Subtotal:
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold">
                      {formatRupiah(subtotal)}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="py-1 px-3 text-right text-slate-600">
                      Pajak PPN (11%):
                    </td>
                    <td className="py-1 px-3 text-right font-mono">
                      {formatRupiah(taxTotal)}
                    </td>
                  </tr>
                  <tr className="border-t border-slate-200 font-black text-slate-900 text-sm">
                    <td colSpan={3} className="py-2 px-3 text-right">
                      Total PO:
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-blue-700">
                      {formatRupiah(grandTotal)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">Catatan Pengiriman untuk Vendor</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 font-semibold transition hover:bg-slate-100"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleIssuePo}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md shadow-blue-500/20 transition flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Terbitkan Purchase Order Resmi</span>
          </button>
        </div>
      </div>
    </div>
  );
};
