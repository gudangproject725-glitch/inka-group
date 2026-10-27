/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import {
  AlertCircle,
  Building,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  Eye,
  FileCheck,
  FileText,
  Mail,
  MapPin,
  Phone,
  Plus,
  Printer,
  Receipt,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Stamp,
  Truck,
  Upload,
  UserCheck,
  X,
} from 'lucide-react';
import { formatRupiah, POStatusBadge } from '../common/StatusBadge';
import { PurchaseOrder } from '../../types/procurement';
import { PurchaseOrderDetailModal } from '../orders/PurchaseOrderDetailModal';

export const VendorPortalView: React.FC = () => {
  const {
    suppliers,
    purchaseOrders,
    portalSupplierId,
    setPortalSupplierId,
    verifySupplierComplianceDoc,
    createGoodsReceipt,
    createVendorInvoice,
    currentUser,
  } = useProcurement();

  const [activeVendorId, setActiveVendorId] = useState<string>(
    portalSupplierId || suppliers[0]?.id || ''
  );
  const [selectedPoForDetail, setSelectedPoForDetail] = useState<PurchaseOrder | null>(null);
  const [isSubmitDeliveryModalOpen, setIsSubmitDeliveryModalOpen] = useState(false);
  const [isSubmitInvoiceModalOpen, setIsSubmitInvoiceModalOpen] = useState(false);
  const [targetPo, setTargetPo] = useState<PurchaseOrder | null>(null);

  // Delivery form
  const [deliveryNoteNumber, setDeliveryNoteNumber] = useState('');
  const [courierName, setCourierName] = useState('Kurir Internal Vendor / JNE Trucking');
  const [deliveryNotes, setDeliveryNotes] = useState('');

  // Invoice form
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [fakturPajakNumber, setFakturPajakNumber] = useState('');
  const [invoiceDueDate, setInvoiceDueDate] = useState('');

  const currentSupplier = suppliers.find((s) => s.id === activeVendorId) || suppliers[0];

  // POs issued to this vendor
  const vendorOrders = purchaseOrders.filter((po) => po.supplierId === currentSupplier?.id);

  const handleSelectVendor = (id: string) => {
    setActiveVendorId(id);
    setPortalSupplierId(id);
  };

  const handleOpenDeliveryModal = (po: PurchaseOrder) => {
    setTargetPo(po);
    setDeliveryNoteNumber(`SJ-${currentSupplier.code}-${Date.now().toString().slice(-4)}`);
    setCourierName('Armada Logistik Resmi');
    setDeliveryNotes('Barang dikirim lengkap dengan segel distributor.');
    setIsSubmitDeliveryModalOpen(true);
  };

  const handleSubmitDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPo) return;

    createGoodsReceipt({
      poId: targetPo.id,
      poNumber: targetPo.poNumber,
      supplierId: targetPo.supplierId,
      supplierName: targetPo.supplierName,
      deliveryNoteNumber,
      receivedDate: new Date().toISOString(),
      receivedBy: `${courierName} (Diterima Gudang Inka)`,
      warehouseLocation: 'Gudang Penerimaan Jakarta Pusat',
      notes: deliveryNotes,
      items: targetPo.items.map((it) => ({
        poItemId: it.id,
        description: it.description,
        orderedQty: it.quantity,
        receivedQty: it.quantity,
        rejectedQty: 0,
        condition: 'good',
      })),
    });

    setIsSubmitDeliveryModalOpen(false);
  };

  const handleOpenInvoiceModal = (po: PurchaseOrder) => {
    setTargetPo(po);
    setInvoiceNumber(`INV-${currentSupplier.code}-${Date.now().toString().slice(-4)}`);
    setFakturPajakNumber(`010.001-26.${Date.now().toString().slice(-8)}`);
    const due = new Date();
    due.setDate(due.getDate() + 30);
    setInvoiceDueDate(due.toISOString().split('T')[0]);
    setIsSubmitInvoiceModalOpen(true);
  };

  const handleSubmitInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPo) return;

    createVendorInvoice({
      poId: targetPo.id,
      poNumber: targetPo.poNumber,
      supplierId: targetPo.supplierId,
      supplierName: targetPo.supplierName,
      invoiceNumber,
      fakturPajakNumber,
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: invoiceDueDate,
      subtotal: targetPo.subtotal,
      taxAmount: targetPo.taxTotal,
      totalAmount: targetPo.grandTotal,
    });

    setIsSubmitInvoiceModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-linear-to-r from-slate-900 via-slate-800 to-blue-950 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="space-y-2 max-w-xl z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30">
            <UserCheck className="w-4 h-4 text-blue-400" />
            <span>Portal Rekanan Mandiri (Vendor Self-Service)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Selamat Datang, {currentSupplier?.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Akses resmi untuk mitra rekanan: unduh PO resmi bermeterai, kirim konfirmasi pengiriman (Surat Jalan), unggah e-Faktur Pajak, dan pantau status pencairan pembayaran secara transparan.
          </p>
        </div>

        {/* Vendor Switcher Selector (For Demo & Multi-Vendor Management) */}
        <div className="z-10 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 w-full sm:w-80 space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block">
            Beralih Profil Vendor Rekanan:
          </label>
          <select
            value={activeVendorId}
            onChange={(e) => handleSelectVendor(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-900/90 text-white border border-white/20 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-400"
          >
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>
          <span className="text-[10px] text-slate-400 block">
            ID Pajak: {currentSupplier?.taxId}
          </span>
        </div>
      </div>

      {/* Compliance & Bank Account Verification Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Verification Status */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Status Kepatuhan Rekanan
            </span>
            {currentSupplier?.verificationStatus === 'verified' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Terverifikasi Legal</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                <span>Perlu Tindakan</span>
              </span>
            )}
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Nomor Pokok Wajib Pajak:</span>
              <span className="font-mono font-bold text-slate-800">{currentSupplier?.taxId}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Termin Pembayaran:</span>
              <span className="font-semibold text-slate-800">{currentSupplier?.paymentTerms}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Email Portal:</span>
              <span className="text-blue-600 font-medium">{currentSupplier?.portalAccessEmail || currentSupplier?.email}</span>
            </div>
          </div>
        </div>

        {/* Bank Account Information */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
            Rekening Bank Pencairan Dana
          </span>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Nama Bank:</span>
              <span className="font-bold text-slate-900">{currentSupplier?.bankName || 'BCA'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Nomor Rekening:</span>
              <span className="font-mono font-black text-slate-900 text-sm">
                {currentSupplier?.bankAccountNumber || '001-234-5678'}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Atas Nama Rekening:</span>
              <span className="font-semibold text-slate-800">
                {currentSupplier?.bankAccountHolder || currentSupplier?.name}
              </span>
            </div>
          </div>
        </div>

        {/* Legal Documents Status */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
            Dokumen Legalitas Terdaftar ({currentSupplier?.legalDocs?.length || 0})
          </span>

          <div className="space-y-1.5">
            {currentSupplier?.legalDocs && currentSupplier.legalDocs.length > 0 ? (
              currentSupplier.legalDocs.map((doc, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-xs border border-slate-200/60"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span className="font-bold text-slate-800">{doc.type}</span>
                    <span className="text-slate-400 font-mono text-[11px]">{doc.docNumber}</span>
                  </div>
                  {doc.verified ? (
                    <span className="text-emerald-700 font-bold text-[10px] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Valid</span>
                    </span>
                  ) : (
                    <button
                      onClick={() =>
                        verifySupplierComplianceDoc(currentSupplier.id, doc.type, true)
                      }
                      className="text-[10px] text-blue-700 font-bold hover:underline"
                    >
                      Verifikasi
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-3 text-center">
                Belum ada dokumen legal diunggah.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Purchase Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-slate-200">
          <div>
            <h3 className="text-base font-black text-slate-900">
              Daftar Purchase Order yang Diterbitkan ({vendorOrders.length})
            </h3>
            <p className="text-xs text-slate-500">
              Pesanan resmi dari PT Inka Nusantara Teknologi kepada {currentSupplier?.name}.
            </p>
          </div>
        </div>

        {vendorOrders.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Receipt className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="font-bold text-slate-700">Belum Ada Pesanan Aktif</p>
            <p className="text-xs text-slate-400 mt-1">
              Purchase Order baru yang diterbitkan tim procurement akan langsung muncul di sini.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Nomor Dokumen PO</th>
                  <th className="py-3 px-4">Tanggal Pesanan</th>
                  <th className="py-3 px-4">Target Kirim</th>
                  <th className="py-3 px-4 text-right">Nilai Total (IDR)</th>
                  <th className="py-3 px-4 text-center">e-Meterai Sah</th>
                  <th className="py-3 px-4 text-center">Status Pesanan</th>
                  <th className="py-3 px-4 text-right">Tindakan Rekanan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vendorOrders.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-slate-900">{po.poNumber}</div>
                      <div className="text-[10px] text-slate-400">{po.items.length} item barang</div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      {new Date(po.orderDate).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {new Date(po.expectedDeliveryDate).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-black text-slate-900">
                      {formatRupiah(po.grandTotal)}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {po.meterai?.stamped ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300">
                          <Stamp className="w-3 h-3 text-amber-600" />
                          <span>{po.meterai.psreProvider}</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">-</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <POStatusBadge status={po.status} />
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedPoForDetail(po)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold text-xs flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Lihat PO</span>
                        </button>

                        <button
                          onClick={() => handleOpenDeliveryModal(po)}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center gap-1"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Kirim Surat Jalan</span>
                        </button>

                        <button
                          onClick={() => handleOpenInvoiceModal(po)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center gap-1"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>Kirim Faktur</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal View Official PO */}
      {selectedPoForDetail && (
        <PurchaseOrderDetailModal
          order={selectedPoForDetail}
          isOpen={true}
          onClose={() => setSelectedPoForDetail(null)}
        />
      )}

      {/* Modal Kirim Konfirmasi Surat Jalan (Submit GRN from vendor) */}
      {isSubmitDeliveryModalOpen && targetPo && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Kirim Konfirmasi Pengiriman</h3>
                  <p className="text-xs text-slate-500 font-mono">{targetPo.poNumber}</p>
                </div>
              </div>
              <button
                onClick={() => setIsSubmitDeliveryModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitDelivery} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nomor Surat Jalan Fisik Vendor:
                </label>
                <input
                  type="text"
                  required
                  value={deliveryNoteNumber}
                  onChange={(e) => setDeliveryNoteNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Armada Logistik / Nama Kurir Pengantar:
                </label>
                <input
                  type="text"
                  required
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Catatan Kondisi Kiriman:
                </label>
                <textarea
                  rows={2}
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSubmitDeliveryModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                >
                  Kirim ke Gudang Inka
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Kirim Faktur Pajak & Invoice (From vendor) */}
      {isSubmitInvoiceModalOpen && targetPo && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Kirim Tagihan & e-Faktur</h3>
                  <p className="text-xs text-slate-500 font-mono">{targetPo.poNumber}</p>
                </div>
              </div>
              <button
                onClick={() => setIsSubmitInvoiceModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitInvoice} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nomor Faktur / Invoice Rekanan:
                </label>
                <input
                  type="text"
                  required
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
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
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Jatuh Tempo Pembayaran:
                </label>
                <input
                  type="date"
                  required
                  value={invoiceDueDate}
                  onChange={(e) => setInvoiceDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Nilai Total Tagihan (Termasuk PPN 11%):</span>
                  <span className="font-mono font-bold text-slate-900">
                    {formatRupiah(targetPo.grandTotal)}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSubmitInvoiceModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                >
                  Kirim ke Bagian Finance Inka
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
