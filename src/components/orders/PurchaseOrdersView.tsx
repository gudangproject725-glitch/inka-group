/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import {
  CheckCircle2,
  FileCheck2,
  Filter,
  Printer,
  Search,
  Truck,
} from 'lucide-react';
import { PurchaseOrder } from '../../types/procurement';
import { formatRupiah, POStatusBadge } from '../common/StatusBadge';

interface PurchaseOrdersViewProps {
  onSelectPo: (po: PurchaseOrder) => void;
}

export const PurchaseOrdersView: React.FC<PurchaseOrdersViewProps> = ({ onSelectPo }) => {
  const { purchaseOrders, suppliers } = useProcurement();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('all');

  const filteredPos = purchaseOrders.filter((po) => {
    if (selectedStatus !== 'all' && po.status !== selectedStatus) return false;
    if (selectedSupplier !== 'all' && po.supplierId !== selectedSupplier) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchPoNumber = po.poNumber.toLowerCase().includes(q);
      const matchSupplier = po.supplierName.toLowerCase().includes(q);
      const matchPrNumber = po.purchaseRequestNumber?.toLowerCase().includes(q);
      if (!matchPoNumber && !matchSupplier && !matchPrNumber) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">
            Daftar Purchase Order (PO) Resmi
          </h1>
          <p className="text-xs text-slate-500">
            Surat pesanan resmi yang diterbitkan untuk vendor dan pemasok terverifikasi
          </p>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Total PO Aktif: <strong>{purchaseOrders.length} Dokumen</strong>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nomor PO (PO-2026-...), nama vendor, atau no. PR sumber..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full sm:w-40 px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Semua Status PO</option>
            <option value="issued">Diterbitkan (Issued)</option>
            <option value="sent_to_supplier">Terkirim ke Vendor</option>
            <option value="completed">Selesai (Completed)</option>
          </select>

          <select
            value={selectedSupplier}
            onChange={(e) => setSelectedSupplier(e.target.value)}
            className="w-full sm:w-48 px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Semua Pemasok</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* PO Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">No. PO & Tanggal</th>
                <th className="py-3 px-4">Pemasok / Vendor</th>
                <th className="py-3 px-4">Ref. PR Sumber</th>
                <th className="py-3 px-4">Total Pesanan</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Tidak ada Purchase Order yang sesuai dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredPos.map((po) => (
                  <tr
                    key={po.id}
                    onClick={() => onSelectPo(po)}
                    className="hover:bg-slate-50/70 transition cursor-pointer"
                  >
                    <td className="py-3 px-4">
                      <div className="font-extrabold text-blue-700 font-mono text-xs">
                        {po.poNumber}
                      </div>
                      <div className="text-slate-400 text-[11px] mt-0.5">
                        {new Date(po.orderDate).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{po.supplierName}</div>
                      <div className="text-slate-400 text-[10px] truncate max-w-xs">{po.paymentTerms}</div>
                    </td>

                    <td className="py-3 px-4">
                      {po.purchaseRequestNumber ? (
                        <span className="font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          {po.purchaseRequestNumber}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-bold text-slate-900 font-mono">
                      {formatRupiah(po.grandTotal, po.currency)}
                    </td>

                    <td className="py-3 px-4">
                      <POStatusBadge status={po.status} />
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectPo(po);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[11px] transition inline-flex items-center gap-1.5 shadow-xs"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Buka & Cetak</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
