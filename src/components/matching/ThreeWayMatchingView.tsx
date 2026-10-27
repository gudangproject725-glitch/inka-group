/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  DollarSign,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Filter,
  Plus,
  Receipt,
  Search,
  ShieldAlert,
  ShieldCheck,
  Truck,
  X,
} from 'lucide-react';
import { formatRupiah } from '../common/StatusBadge';
import { PurchaseOrder } from '../../types/procurement';

export const ThreeWayMatchingView: React.FC = () => {
  const {
    purchaseOrders,
    goodsReceiptNotes,
    vendorInvoices,
    getThreeWayMatchForPo,
    createGoodsReceipt,
    createVendorInvoice,
    approveInvoiceForPayment,
    currentUser,
  } = useProcurement();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPoForGrn, setSelectedPoForGrn] = useState<PurchaseOrder | null>(null);
  const [selectedPoForInvoice, setSelectedPoForInvoice] = useState<PurchaseOrder | null>(null);
  const [activeDiscrepancyPo, setActiveDiscrepancyPo] = useState<PurchaseOrder | null>(null);

  // Form states for creating GRN
  const [deliveryNoteNumber, setDeliveryNoteNumber] = useState('');
  const [receivedBy, setReceivedBy] = useState(currentUser.name);
  const [warehouseLocation, setWarehouseLocation] = useState('Gudang Pusat Jakarta');
  const [grnNotes, setGrnNotes] = useState('');

  // Form states for creating Invoice
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [fakturPajakNumber, setFakturPajakNumber] = useState('');
  const [invoiceDueDate, setInvoiceDueDate] = useState('');
  const [invoiceAmount, setInvoiceAmount] = useState<number>(0);

  // Compute 3-way match for each PO
  const reconciledOrders = purchaseOrders.map((po) => {
    const matchResult = getThreeWayMatchForPo(po.id);
    const grn = goodsReceiptNotes.find((g) => g.poId === po.id);
    const invoice = vendorInvoices.find((i) => i.poId === po.id);
    return {
      po,
      grn,
      invoice,
      matchResult,
    };
  });

  // Filtered List
  const filtered = reconciledOrders.filter(({ po, matchResult }) => {
    const matchesSearch =
      po.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.supplierName.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === 'all') return true;
    if (statusFilter === 'matched') return matchResult.matchStatus === 'fully_matched';
    if (statusFilter === 'discrepancy')
      return (
        matchResult.matchStatus === 'quantity_mismatch' ||
        matchResult.matchStatus === 'price_variance'
      );
    if (statusFilter === 'pending')
      return (
        matchResult.matchStatus === 'grn_missing' || matchResult.matchStatus === 'invoice_missing'
      );
    return true;
  });

  // Summary counts
  const totalPos = purchaseOrders.length;
  const fullyMatchedCount = reconciledOrders.filter(
    (r) => r.matchResult.matchStatus === 'fully_matched'
  ).length;
  const discrepancyCount = reconciledOrders.filter(
    (r) =>
      r.matchResult.matchStatus === 'quantity_mismatch' ||
      r.matchResult.matchStatus === 'price_variance'
  ).length;
  const pendingCount = totalPos - fullyMatchedCount - discrepancyCount;

  const handleOpenGrnModal = (po: PurchaseOrder) => {
    setSelectedPoForGrn(po);
    setDeliveryNoteNumber(`SJ-${po.poNumber.replace('PO-', '')}-${Date.now().toString().slice(-4)}`);
    setReceivedBy(currentUser.name);
    setWarehouseLocation('Gudang Utama Jakarta Barat');
    setGrnNotes('Kondisi kemasan utuh, segel distributor baik.');
  };

  const handleSaveGrn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPoForGrn) return;

    createGoodsReceipt({
      poId: selectedPoForGrn.id,
      poNumber: selectedPoForGrn.poNumber,
      supplierId: selectedPoForGrn.supplierId,
      supplierName: selectedPoForGrn.supplierName,
      deliveryNoteNumber,
      receivedDate: new Date().toISOString(),
      receivedBy,
      warehouseLocation,
      notes: grnNotes,
      items: selectedPoForGrn.items.map((item) => ({
        poItemId: item.id,
        description: item.description,
        orderedQty: item.quantity,
        receivedQty: item.quantity,
        rejectedQty: 0,
        condition: 'good',
      })),
    });

    setSelectedPoForGrn(null);
  };

  const handleOpenInvoiceModal = (po: PurchaseOrder) => {
    setSelectedPoForInvoice(po);
    setInvoiceNumber(`INV-${po.supplierName.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`);
    setFakturPajakNumber(`010.001-26.${Date.now().toString().slice(-8)}`);
    const due = new Date();
    due.setDate(due.getDate() + 30);
    setInvoiceDueDate(due.toISOString().split('T')[0]);
    setInvoiceAmount(po.grandTotal);
  };

  const handleSaveInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPoForInvoice) return;

    createVendorInvoice({
      poId: selectedPoForInvoice.id,
      poNumber: selectedPoForInvoice.poNumber,
      supplierId: selectedPoForInvoice.supplierId,
      supplierName: selectedPoForInvoice.supplierName,
      invoiceNumber,
      fakturPajakNumber,
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: invoiceDueDate,
      subtotal: Math.round(invoiceAmount / 1.11),
      taxAmount: Math.round(invoiceAmount - invoiceAmount / 1.11),
      totalAmount: invoiceAmount,
    });

    setSelectedPoForInvoice(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-lg bg-emerald-100 text-emerald-800">
              <FileCheck className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              3-Way Matching Otomatis
            </h1>
          </div>
          <p className="text-sm text-slate-600">
            Rekonsiliasi otomatis 3 dokumen: <strong>Purchase Order (PO)</strong> ↔ <strong>Surat Jalan / GRN Fisik</strong> ↔ <strong>Invoice & e-Faktur Vendor</strong> sebelum pencairan dana.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Toleransi Selisih Harga: 0%</span>
          </span>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Total PO Terbit
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">{totalPos}</div>
            <span className="text-[11px] text-slate-500">Memerlukan rekonsiliasi</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Receipt className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-xs flex items-center justify-between bg-linear-to-br from-white to-emerald-50/40">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">
              Matched (Siap Bayar)
            </span>
            <div className="text-2xl font-black text-emerald-900 mt-1">{fullyMatchedCount}</div>
            <span className="text-[11px] text-emerald-600 font-medium">100% Klop kuantitas & harga</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-xs flex items-center justify-between bg-linear-to-br from-white to-rose-50/40">
          <div>
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider block">
              Discrepancy (Selisih)
            </span>
            <div className="text-2xl font-black text-rose-900 mt-1">{discrepancyCount}</div>
            <span className="text-[11px] text-rose-600 font-medium">Blokir pembayaran otomatis</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Menunggu GRN / Faktur
            </span>
            <div className="text-2xl font-black text-slate-700 mt-1">{pendingCount}</div>
            <span className="text-[11px] text-slate-500">Belum lengkap 3 berkas</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari No. PO atau Rekanan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'Semua Status' },
            { id: 'matched', label: 'Fully Matched' },
            { id: 'discrepancy', label: 'Ada Selisih' },
            { id: 'pending', label: 'Belum Lengkap' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                statusFilter === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reconciled Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">1. Purchase Order (PO)</th>
                <th className="py-3 px-4">Vendor / Rekanan</th>
                <th className="py-3 px-4">2. Surat Jalan (GRN Fisik)</th>
                <th className="py-3 px-4">3. Invoice & e-Faktur</th>
                <th className="py-3 px-4 text-center">Status Rekonsiliasi</th>
                <th className="py-3 px-4 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Tidak ada transaksi pencocokan yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filtered.map(({ po, grn, invoice, matchResult }) => (
                  <tr key={po.id} className="hover:bg-slate-50/60 transition">
                    {/* 1. PO Info */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-slate-900">{po.poNumber}</div>
                      <div className="text-slate-500 font-mono text-[11px] mt-0.5">
                        {formatRupiah(po.grandTotal)}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(po.orderDate).toLocaleDateString('id-ID')}
                      </div>
                    </td>

                    {/* Vendor */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{po.supplierName}</div>
                      <div className="text-[11px] text-slate-400">{po.paymentTerms}</div>
                    </td>

                    {/* 2. GRN Info */}
                    <td className="py-3.5 px-4">
                      {grn ? (
                        <div>
                          <div className="flex items-center gap-1 font-mono font-semibold text-slate-800">
                            <Truck className="w-3.5 h-3.5 text-blue-600" />
                            <span>{grn.grnNumber}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            SJ: <strong className="text-slate-700">{grn.deliveryNoteNumber}</strong>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Diterima: {new Date(grn.receivedDate).toLocaleDateString('id-ID')}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-medium border border-amber-200">
                            <Clock className="w-3 h-3" />
                            <span>Belum Diterima</span>
                          </span>
                          <button
                            onClick={() => handleOpenGrnModal(po)}
                            className="block mt-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            + Catat Surat Jalan
                          </button>
                        </div>
                      )}
                    </td>

                    {/* 3. Invoice Info */}
                    <td className="py-3.5 px-4">
                      {invoice ? (
                        <div>
                          <div className="flex items-center gap-1 font-mono font-semibold text-slate-800">
                            <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{invoice.invoiceNumber}</span>
                          </div>
                          <div className="text-[11px] font-mono text-slate-600 mt-0.5">
                            {formatRupiah(invoice.totalAmount)}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[130px]" title={invoice.fakturPajakNumber}>
                            FP: {invoice.fakturPajakNumber}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                            <Clock className="w-3 h-3" />
                            <span>Belum Ada Tagihan</span>
                          </span>
                          <button
                            onClick={() => handleOpenInvoiceModal(po)}
                            className="block mt-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            + Catat Faktur Pajak
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Reconciliation Match Status */}
                    <td className="py-3.5 px-4 text-center">
                      {matchResult.matchStatus === 'fully_matched' ? (
                        <div className="inline-flex flex-col items-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Fully Matched</span>
                          </span>
                          <span className="text-[10px] text-emerald-700 font-bold mt-1">
                            Siap Dibayar
                          </span>
                        </div>
                      ) : matchResult.matchStatus === 'quantity_mismatch' ||
                        matchResult.matchStatus === 'price_variance' ? (
                        <div className="inline-flex flex-col items-center">
                          <button
                            onClick={() => setActiveDiscrepancyPo(po)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-100 text-rose-800 border border-rose-300 hover:bg-rose-200 transition"
                          >
                            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                            <span>Ada Selisih!</span>
                          </button>
                          <span className="text-[10px] text-rose-600 font-semibold mt-1">
                            Pembayaran Ditahan
                          </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Menunggu Dokumen</span>
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      {matchResult.readyForPayment && invoice && invoice.status !== 'approved_for_payment' ? (
                        <button
                          onClick={() => approveInvoiceForPayment(invoice.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition inline-flex items-center gap-1"
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                          <span>Rilis Pembayaran</span>
                        </button>
                      ) : invoice?.status === 'approved_for_payment' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Dana Dirilis</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => setActiveDiscrepancyPo(po)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold text-[11px]"
                        >
                          Detail Audit
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Discrepancy Detail Drawer / Modal */}
      {activeDiscrepancyPo && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Hasil Audit 3-Way Matching</h3>
                  <p className="text-xs text-slate-500 font-mono">{activeDiscrepancyPo.poNumber}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveDiscrepancyPo(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Reconciliation Details */}
            {(() => {
              const match = getThreeWayMatchForPo(activeDiscrepancyPo.id);
              return (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Nilai Purchase Order (PO):</span>
                      <span className="font-mono font-bold text-slate-900">
                        {formatRupiah(activeDiscrepancyPo.grandTotal)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Status Kuantitas Fisik:</span>
                      <span
                        className={`font-bold ${
                          match.quantityMatch ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {match.quantityMatch ? 'Sesuai (100%)' : 'Tidak Sesuai / Parsial'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Status Nilai Tagihan Vendor:</span>
                      <span
                        className={`font-bold ${
                          match.priceMatch ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {match.priceMatch ? 'Sesuai (0% Selisih)' : 'Ada Selisih Tagihan'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                      Catatan Temuan Rekonsiliasi:
                    </h4>
                    {match.discrepancies.length === 0 ? (
                      <p className="text-xs text-emerald-700 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                        Tidak ditemukan selisih. Seluruh item fisik dan nominal invoice telah cocok sempurna.
                      </p>
                    ) : (
                      <ul className="space-y-2">
                        {match.discrepancies.map((disc, idx) => (
                          <li
                            key={idx}
                            className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 leading-relaxed flex items-start gap-2"
                          >
                            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                            <span>{disc}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex justify-end">
                    <button
                      onClick={() => setActiveDiscrepancyPo(null)}
                      className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Modal Catat Surat Jalan (GRN) */}
      {selectedPoForGrn && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Catat Penerimaan Barang (GRN)</h3>
                  <p className="text-xs text-slate-500 font-mono">{selectedPoForGrn.poNumber}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPoForGrn(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGrn} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nomor Surat Jalan Fisik Vendor:
                </label>
                <input
                  type="text"
                  required
                  value={deliveryNoteNumber}
                  onChange={(e) => setDeliveryNoteNumber(e.target.value)}
                  placeholder="Misal: SJ-2026/X/9981"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Petugas Penerima Gudang:
                </label>
                <input
                  type="text"
                  required
                  value={receivedBy}
                  onChange={(e) => setReceivedBy(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Lokasi Gudang / Kantor Penerima:
                </label>
                <input
                  type="text"
                  required
                  value={warehouseLocation}
                  onChange={(e) => setWarehouseLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Catatan Kondisi Fisik Barang:
                </label>
                <textarea
                  rows={2}
                  value={grnNotes}
                  onChange={(e) => setGrnNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedPoForGrn(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                >
                  Simpan Bukti Terima
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Catat Faktur Pajak & Invoice */}
      {selectedPoForInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Catat Faktur Pajak & Tagihan</h3>
                  <p className="text-xs text-slate-500 font-mono">{selectedPoForInvoice.poNumber}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPoForInvoice(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveInvoice} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nomor Invoice / Tagihan Vendor:
                </label>
                <input
                  type="text"
                  required
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder="Misal: INV-2026-0044"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nomor e-Faktur Pajak (DJP):
                </label>
                <input
                  type="text"
                  required
                  value={fakturPajakNumber}
                  onChange={(e) => setFakturPajakNumber(e.target.value)}
                  placeholder="010.001-26.XXXXXXXX"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tanggal Jatuh Tempo Pembayaran:
                </label>
                <input
                  type="date"
                  required
                  value={invoiceDueDate}
                  onChange={(e) => setInvoiceDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Total Nilai Tagihan (Termasuk PPN 11%):
                </label>
                <input
                  type="number"
                  required
                  value={invoiceAmount}
                  onChange={(e) => setInvoiceAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Nilai PO referensi: {formatRupiah(selectedPoForInvoice.grandTotal)}
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedPoForInvoice(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                >
                  Simpan Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
