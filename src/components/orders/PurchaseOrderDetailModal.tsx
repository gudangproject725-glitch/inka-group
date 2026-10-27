/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import {
  Building2,
  CheckCircle2,
  Copy,
  Download,
  FileCheck2,
  Mail,
  MapPin,
  Phone,
  Printer,
  QrCode,
  Shield,
  ShieldCheck,
  Sparkles,
  Stamp,
  Truck,
  X,
} from 'lucide-react';
import { PurchaseOrder } from '../../types/procurement';
import { formatRupiah, POStatusBadge } from '../common/StatusBadge';
import { isEligibleForEMeterai } from '../../domain/workflow';

interface PurchaseOrderDetailModalProps {
  order: PurchaseOrder | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PurchaseOrderDetailModal: React.FC<PurchaseOrderDetailModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  const { organization, updatePoStatus, stampPoWithMeterai, currentUser } = useProcurement();
  const [isStampingModalOpen, setIsStampingModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<'Peruri' | 'PrivyID' | 'VIDA'>('Peruri');
  const [copiedHash, setCopiedHash] = useState(false);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleConfirmStamp = () => {
    stampPoWithMeterai(order.id, currentUser.name, currentUser.jobTitle, selectedProvider);
    setIsStampingModalOpen(false);
  };

  const isEligible = isEligibleForEMeterai(order.grandTotal);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[94vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="px-6 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50 no-print flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="font-mono font-extrabold text-slate-900 text-sm">{order.poNumber}</span>
            <POStatusBadge status={order.status} />
            {order.meterai?.stamped ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300">
                <Stamp className="w-3.5 h-3.5 text-amber-600" />
                <span>e-Meterai {order.meterai.psreProvider} Aktif</span>
              </span>
            ) : isEligible ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                Wajib e-Meterai (≥ Rp 5 Jt)
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            {/* Status cycle actions */}
            {order.status === 'issued' && (
              <button
                onClick={() => updatePoStatus(order.id, 'sent_to_supplier')}
                className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs transition"
              >
                Tandai Terkirim ke Pemasok
              </button>
            )}

            {order.status === 'sent_to_supplier' && (
              <button
                onClick={() => updatePoStatus(order.id, 'completed')}
                className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-xs transition"
              >
                Tandai Selesai
              </button>
            )}

            {/* Stamping Action */}
            {!order.meterai?.stamped && isEligible && (
              <button
                onClick={() => setIsStampingModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
              >
                <Stamp className="w-4 h-4" />
                <span>Bubuhkan e-Meterai</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Official Printable Purchase Order Document Content */}
        <div className="p-8 overflow-y-auto flex-1 bg-white text-slate-900 font-sans print:p-0 print:m-0 text-xs">
          {/* Document Header */}
          <div className="flex flex-col sm:flex-row items-start justify-between gap-6 pb-6 border-b-2 border-slate-900">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-sm">
                  IK
                </div>
                <h1 className="text-xl font-extrabold text-slate-900 uppercase tracking-tight">
                  {organization.name}
                </h1>
              </div>
              <p className="text-slate-600 text-xs max-w-sm leading-relaxed">{organization.address}</p>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-slate-500 text-xs">
                <span>NPWP: <strong className="text-slate-700">{organization.taxNumber}</strong></span>
                <span>Telp: {organization.phone}</span>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <div className="inline-block px-3 py-1 rounded-md bg-slate-100 text-slate-800 font-black text-sm tracking-widest uppercase mb-2 border border-slate-300">
                PURCHASE ORDER
              </div>
              <div className="font-mono text-base font-extrabold text-slate-900 mb-1">
                {order.poNumber}
              </div>
              <p className="text-slate-600">
                Tanggal PO: <strong>{new Date(order.orderDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
              </p>
              {order.purchaseRequestNumber && (
                <p className="text-slate-500 mt-1">
                  Ref. PR: <span className="font-mono font-medium text-slate-700">{order.purchaseRequestNumber}</span>
                </p>
              )}
            </div>
          </div>

          {/* Supplier & Delivery Info Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Kepada Vendor / Rekanan (Supplier):
              </span>
              <h3 className="text-sm font-bold text-slate-900">{order.supplierName}</h3>
              <p className="text-slate-600 mt-0.5 leading-relaxed">{order.supplierAddress}</p>
              <p className="text-slate-600 mt-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{order.supplierEmail}</span>
              </p>
            </div>

            <div className="space-y-1.5 sm:border-l sm:border-slate-200 sm:pl-6">
              <div className="flex justify-between py-0.5 border-b border-slate-200/60">
                <span className="text-slate-500">Termin Pembayaran:</span>
                <span className="font-semibold text-slate-800">{order.paymentTerms}</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-slate-200/60">
                <span className="text-slate-500">Target Pengiriman:</span>
                <span className="font-semibold text-slate-800">
                  {new Date(order.expectedDeliveryDate).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-slate-200/60">
                <span className="text-slate-500">Mata Uang:</span>
                <span className="font-mono font-semibold text-slate-800">{order.currency}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-500">Diterbitkan Oleh:</span>
                <span className="font-semibold text-slate-800">{order.createdByName}</span>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="rounded-xl border border-slate-200 overflow-hidden mb-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold text-[11px] uppercase tracking-wider border-b border-slate-200">
                  <th className="py-2.5 px-4 w-12 text-center">No</th>
                  <th className="py-2.5 px-4">Deskripsi Item / Spesifikasi</th>
                  <th className="py-2.5 px-4 w-24 text-right">Kuantitas</th>
                  <th className="py-2.5 px-4 w-20 text-center">Satuan</th>
                  <th className="py-2.5 px-4 w-36 text-right">Harga Satuan</th>
                  <th className="py-2.5 px-4 w-40 text-right">Total (IDR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.items.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-4 text-center text-slate-400 font-mono">{index + 1}</td>
                    <td className="py-2.5 px-4 font-medium text-slate-900">{item.description}</td>
                    <td className="py-2.5 px-4 text-right font-mono font-semibold text-slate-800">
                      {item.quantity}
                    </td>
                    <td className="py-2.5 px-4 text-center text-slate-600">{item.unit}</td>
                    <td className="py-2.5 px-4 text-right font-mono text-slate-700">
                      {formatRupiah(item.unitPrice)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                      {formatRupiah(item.lineTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Calculation Summary */}
          <div className="flex flex-col sm:flex-row items-start justify-between gap-6 pb-6">
            <div className="max-w-md w-full">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Catatan & Syarat Khusus:
              </span>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-xs leading-relaxed">
                {order.notes ||
                  '1. Barang harus dikirimkan sesuai spesifikasi teknis dan tanggal yang tertera.\n2. Wajib melampirkan Surat Jalan fisik dan Faktur Pajak e-Faktur resmi saat penyerahan barang.\n3. Pembayaran diproses setelah verifikasi 3-Way Matching (PO, GRN, & Invoice) disetujui.'}
              </div>
            </div>

            <div className="w-full sm:w-72 space-y-2 text-xs">
              <div className="flex justify-between py-1 text-slate-600">
                <span>Subtotal Barang:</span>
                <span className="font-mono font-semibold">{formatRupiah(order.subtotal)}</span>
              </div>
              <div className="flex justify-between py-1 text-slate-600">
                <span>PPN 11% (e-Faktur):</span>
                <span className="font-mono font-semibold">{formatRupiah(order.taxTotal)}</span>
              </div>
              <div className="flex justify-between py-2 border-t-2 border-slate-900 font-bold text-slate-900 text-sm">
                <span>Total PO:</span>
                <span className="font-mono text-base text-blue-700">{formatRupiah(order.grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Signatures & Official e-Meterai PSrE Seal Section */}
          <div className="pt-6 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
            {/* Vendor Acknowledgment */}
            <div className="text-center">
              <p className="text-slate-500 mb-14">Diterima & Disetujui Rekanan,</p>
              <div className="border-t border-slate-300 pt-1.5 w-48 mx-auto">
                <p className="font-bold text-slate-900">{order.supplierName}</p>
                <p className="text-[11px] text-slate-500">Tanda Tangan & Cap Perusahaan</p>
              </div>
            </div>

            {/* Official e-Meterai & Signer Box */}
            <div className="flex flex-col items-center sm:items-end">
              <p className="text-slate-500 mb-2 text-center sm:text-right">
                Jakarta, {new Date(order.orderDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                <br />
                <strong>PT Inka Nusantara Teknologi</strong>
              </p>

              {/* Render e-Meterai Seal */}
              {order.meterai?.stamped ? (
                <div className="my-2 p-3 rounded-xl border-2 border-amber-500/80 bg-linear-to-br from-amber-50/90 via-white to-amber-100/50 shadow-md max-w-xs text-left relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-amber-500 text-white font-mono text-[9px] font-black px-2 py-0.5 rounded-bl-lg uppercase tracking-wider">
                    {order.meterai.psreProvider} RESMI
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Visual Stamp Emblem */}
                    <div className="w-14 h-14 rounded-lg bg-linear-to-br from-red-600 to-red-800 text-white flex flex-col items-center justify-center p-1 border-2 border-amber-300 shadow-sm shrink-0">
                      <span className="text-[7px] font-extrabold uppercase tracking-tighter leading-none">PAJAK</span>
                      <span className="text-[11px] font-black tracking-tight leading-tight">10000</span>
                      <span className="text-[6px] font-medium leading-none mt-0.5">METERAI TERA</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-mono font-black text-amber-950 text-xs tracking-tight">
                        {order.meterai.serialNumber}
                      </div>
                      <div className="text-[10px] text-slate-600 font-medium">
                        Penandatangan: <strong className="text-slate-900">{order.meterai.signerName}</strong>
                      </div>
                      <div className="text-[9px] text-slate-500">
                        {new Date(order.meterai.stampedAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })} WIB
                      </div>
                    </div>
                  </div>

                  {/* Hash and Verification Link */}
                  <div className="mt-2 pt-2 border-t border-amber-200/80 flex items-center justify-between text-[9px] text-slate-500">
                    <span className="font-mono truncate max-w-[170px]" title={order.meterai.documentHash}>
                      SHA: {order.meterai.documentHash.substring(0, 14)}...
                    </span>
                    <button
                      onClick={() => handleCopyHash(order.meterai?.documentHash || '')}
                      className="text-amber-700 hover:text-amber-900 flex items-center gap-1 font-semibold"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedHash ? 'Disalin!' : 'Salin'}</span>
                    </button>
                  </div>
                  <p className="mt-1 text-[8px] text-amber-800/80 leading-tight">
                    Keabsahan diakui UU No. 10/2020 & UU ITE No. 1/2024
                  </p>
                </div>
              ) : isEligible ? (
                <div className="my-2 p-3 rounded-xl border border-dashed border-amber-300 bg-amber-50/50 text-center max-w-xs">
                  <Stamp className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                  <p className="text-[11px] font-bold text-amber-900">Belum Dibubuhi e-Meterai</p>
                  <p className="text-[10px] text-amber-700 mb-2">
                    Dokumen ≥ Rp 5.000.000 wajib bea meterai Rp 10.000
                  </p>
                  <button
                    onClick={() => setIsStampingModalOpen(true)}
                    className="no-print px-2.5 py-1 rounded-md bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] transition"
                  >
                    Bubuhkan Sekarang
                  </button>
                </div>
              ) : null}

              <div className="border-t border-slate-300 pt-1.5 w-48 text-center mt-3">
                <p className="font-bold text-slate-900">{order.createdByName}</p>
                <p className="text-[11px] text-slate-500">Authorized Procurement Officer</p>
              </div>
            </div>
          </div>

          {/* Footer Security Watermark */}
          <div className="mt-8 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Diterbitkan resmi melalui Inka Company SaaS Procurement System (Jakarta Tier-IV DC).</span>
            </div>
            <div className="font-mono">
              Dokumen Sah Digital • Verifikasi: {order.poNumber}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Bubuhkan e-Meterai */}
      {isStampingModalOpen && (
        <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Stamp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Pembubuhan e-Meterai Resmi</h3>
                  <p className="text-xs text-slate-500">Penyelenggara Sertifikasi Elektronik (PSrE)</p>
                </div>
              </div>
              <button
                onClick={() => setIsStampingModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 mb-4 text-xs text-amber-900 leading-relaxed">
              Sesuai <strong>UU Bea Meterai No. 10 Tahun 2020</strong>, Purchase Order senilai{' '}
              <strong>{formatRupiah(order.grandTotal)}</strong> wajib dikenakan bea meterai elektronik Rp 10.000 untuk kekuatan hukum penuh.
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Pilih Provider PSrE Resmi:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Peruri', 'PrivyID', 'VIDA'] as const).map((prov) => (
                  <button
                    key={prov}
                    type="button"
                    onClick={() => setSelectedProvider(prov)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold text-center transition ${
                      selectedProvider === prov
                        ? 'border-amber-500 bg-amber-50 text-amber-900 ring-2 ring-amber-500/20'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {prov}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 mb-6 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex justify-between">
                <span>Dokumen PO:</span>
                <span className="font-mono font-bold text-slate-900">{order.poNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Penandatangan:</span>
                <span className="font-bold text-slate-900">{currentUser.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Nilai Bea:</span>
                <span className="font-bold text-emerald-700">Rp 10.000 (Ditanggung Perusahaan)</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsStampingModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmStamp}
                className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-600/20 transition"
              >
                <Stamp className="w-4 h-4" />
                <span>Bubuhkan Meterai</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
