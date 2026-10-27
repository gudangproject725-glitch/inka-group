/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import {
  Award,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  DollarSign,
  FileSpreadsheet,
  FileText,
  Filter,
  Layers,
  Medal,
  Plus,
  Scale,
  Search,
  Sparkles,
  Star,
  Tag,
  TrendingDown,
  Trophy,
  Users,
  X,
} from 'lucide-react';
import { formatRupiah } from '../common/StatusBadge';
import { RFQ, RFQSupplierBid } from '../../types/procurement';

export const RfqView: React.FC = () => {
  const { rfqs, createRfq, submitRfqBid, awardRfq, suppliers, departments, currentUser } =
    useProcurement();

  const [selectedRfqId, setSelectedRfqId] = useState<string>(rfqs[0]?.id || '');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitBidModalOpen, setIsSubmitBidModalOpen] = useState(false);
  const [isAwardModalOpen, setIsAwardModalOpen] = useState(false);
  const [selectedBidToAward, setSelectedBidToAward] = useState<RFQSupplierBid | null>(null);
  const [awardReason, setAwardReason] = useState('');

  // Form states for creating RFQ
  const [title, setTitle] = useState('');
  const [departmentId, setDepartmentId] = useState(departments[0]?.id || 'dept-it');
  const [targetBudget, setTargetBudget] = useState<number>(100000000);
  const [dueDate, setDueDate] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemQuantity, setItemQuantity] = useState<number>(5);
  const [itemUnit, setItemUnit] = useState('Unit');
  const [itemTargetPrice, setItemTargetPrice] = useState<number>(20000000);

  // Form states for submitting bid
  const [bidSupplierId, setBidSupplierId] = useState(suppliers[0]?.id || '');
  const [bidUnitPrice, setBidUnitPrice] = useState<number>(19000000);
  const [bidDeliveryDays, setBidDeliveryDays] = useState<number>(7);
  const [bidPaymentTerms, setBidPaymentTerms] = useState('Net 30 Days');
  const [bidWarrantyMonths, setBidWarrantyMonths] = useState<number>(24);
  const [bidNotes, setBidNotes] = useState('');

  const activeRfq = rfqs.find((r) => r.id === selectedRfqId) || rfqs[0];

  const handleOpenCreateModal = () => {
    setTitle('Pengadaan Server Backup & UPS 10kVA');
    setDepartmentId(departments[0]?.id || 'dept-it');
    setTargetBudget(120000000);
    const d = new Date();
    d.setDate(d.getDate() + 10);
    setDueDate(d.toISOString().split('T')[0]);
    setItemDescription('UPS Online Double-Conversion 10kVA 3-Phase + Extended Battery Pack');
    setItemQuantity(2);
    setItemUnit('Unit');
    setItemTargetPrice(60000000);
    setIsCreateModalOpen(true);
  };

  const handleSaveRfq = (e: React.FormEvent) => {
    e.preventDefault();
    const newRfq = createRfq({
      title,
      departmentId,
      targetBudget,
      dueDate,
      items: [
        {
          description: itemDescription,
          quantity: itemQuantity,
          unit: itemUnit,
          targetPrice: itemTargetPrice,
        },
      ],
    });
    setSelectedRfqId(newRfq.id);
    setIsCreateModalOpen(false);
  };

  const handleOpenBidModal = () => {
    if (!activeRfq) return;
    const availableSup = suppliers.find((s) => !activeRfq.bids.some((b) => b.supplierId === s.id));
    setBidSupplierId(availableSup ? availableSup.id : suppliers[0]?.id || '');
    setBidUnitPrice(activeRfq.items[0]?.targetPrice || 15000000);
    setBidDeliveryDays(7);
    setBidPaymentTerms('Net 30 Days');
    setBidWarrantyMonths(24);
    setBidNotes('Garansi resmi distributor, siap kirim langsung.');
    setIsSubmitBidModalOpen(true);
  };

  const handleSaveBid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRfq) return;
    const sup = suppliers.find((s) => s.id === bidSupplierId);
    if (!sup) return;

    const totalQty = activeRfq.items.reduce((sum, it) => sum + it.quantity, 1);
    const totalPrice = bidUnitPrice * totalQty;

    submitRfqBid(activeRfq.id, {
      supplierId: sup.id,
      supplierName: sup.name,
      unitPrice: bidUnitPrice,
      totalPrice,
      deliveryDays: bidDeliveryDays,
      paymentTerms: bidPaymentTerms,
      warrantyMonths: bidWarrantyMonths,
      complianceScore: sup.verificationStatus === 'verified' ? 95 : 80,
      quotationDocRef: `PENAWARAN-${sup.code}-${Date.now().toString().slice(-4)}.pdf`,
      notes: bidNotes,
    });

    setIsSubmitBidModalOpen(false);
  };

  const handleOpenAwardModal = (bid: RFQSupplierBid) => {
    setSelectedBidToAward(bid);
    setAwardReason(`Harga paling kompetitif dengan skor evaluasi menyeluruh tertinggi (${bid.overallScore}/100) dan garansi ${bid.warrantyMonths} bulan.`);
    setIsAwardModalOpen(true);
  };

  const handleConfirmAward = () => {
    if (!activeRfq || !selectedBidToAward) return;
    awardRfq(activeRfq.id, selectedBidToAward.supplierId, awardReason);
    setIsAwardModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-lg bg-indigo-100 text-indigo-800">
              <Scale className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              3-Way RFQ & Perbandingan Penawaran Vendor
            </h1>
          </div>
          <p className="text-sm text-slate-600">
            Bandingkan minimal 3 penawaran harga rekanan secara berdampingan (harga, waktu kirim, termin bayar, & garansi) sebelum penerbitan PO.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Buka Tender RFQ Baru</span>
        </button>
      </div>

      {/* Main Layout: Left Side List, Right Side Comparison Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* RFQ Sidebar Selector (4 Cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Daftar Paket Tender Aktif ({rfqs.length})
          </div>

          <div className="space-y-2">
            {rfqs.map((rfq) => {
              const isSelected = rfq.id === activeRfq?.id;
              const hasRecommended = rfq.bids.some((b) => b.status === 'recommended');

              return (
                <div
                  key={rfq.id}
                  onClick={() => setSelectedRfqId(rfq.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition relative overflow-hidden ${
                    isSelected
                      ? 'bg-white border-blue-600 shadow-md ring-2 ring-blue-500/10'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-blue-600" />
                  )}

                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-slate-800">
                      {rfq.rfqNumber}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        rfq.status === 'awarded'
                          ? 'bg-emerald-100 text-emerald-800'
                          : rfq.status === 'evaluation'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {rfq.status === 'awarded'
                        ? 'Pemenang Ditetapkan'
                        : rfq.status === 'evaluation'
                        ? 'Tahap Evaluasi'
                        : 'Buka Penawaran'}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                    {rfq.title}
                  </h3>

                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>
                      Target: <strong className="text-slate-800">{formatRupiah(rfq.targetBudget)}</strong>
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-indigo-700">
                      <Users className="w-3.5 h-3.5" />
                      <span>{rfq.bids.length} Rekanan</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Comparison Matrix (8 Cols) */}
        {activeRfq && (
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
            {/* Header info of selected RFQ */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-slate-200 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                    {activeRfq.rfqNumber}
                  </span>
                  <span className="text-xs text-slate-500">
                    Departemen: <strong>{activeRfq.departmentName}</strong>
                  </span>
                </div>
                <h2 className="text-lg font-black text-slate-900">{activeRfq.title}</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Batas Akhir Penawaran:{' '}
                  <strong>
                    {new Date(activeRfq.dueDate).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </strong>
                </p>
              </div>

              {activeRfq.status !== 'awarded' && (
                <button
                  onClick={handleOpenBidModal}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Input Penawaran Vendor</span>
                </button>
              )}
            </div>

            {/* Awarded Banner if applicable */}
            {activeRfq.status === 'awarded' && (
              <div className="p-4 rounded-xl bg-linear-to-r from-emerald-500 to-emerald-600 text-white flex items-center justify-between shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
                    <Trophy className="w-6 h-6 text-amber-200" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-100">
                      Tender Selesai Diputuskan
                    </span>
                    <h4 className="text-sm font-black text-white">
                      Pemenang:{' '}
                      {activeRfq.bids.find((b) => b.supplierId === activeRfq.awardedSupplierId)
                        ?.supplierName || activeRfq.awardedSupplierId}
                    </h4>
                    <p className="text-xs text-emerald-100 mt-0.5">{activeRfq.awardedReason}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Side-by-Side Comparison Matrix Table */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-indigo-600" />
                  <span>Matriks Perbandingan Penawaran ({activeRfq.bids.length} Vendor)</span>
                </h3>

                <span className="text-[11px] text-slate-500">
                  Algoritma: Harga (50%) + Kecepatan (20%) + Kepatuhan (20%) + Garansi (10%)
                </span>
              </div>

              {activeRfq.bids.length === 0 ? (
                <div className="p-10 rounded-2xl border-2 border-dashed border-slate-200 text-center">
                  <FileSpreadsheet className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">Belum Ada Penawaran Rekanan</p>
                  <p className="text-[11px] text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                    Masukkan penawaran harga dari vendor rekanan untuk mengaktifkan kalkulasi matriks perbandingan otomatis.
                  </p>
                  <button
                    onClick={handleOpenBidModal}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
                  >
                    + Input Penawaran Pertama
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr>
                        <th className="p-3 bg-slate-50 border border-slate-200 text-left font-bold text-slate-600 w-36">
                          Parameter Seleksi
                        </th>
                        {activeRfq.bids.map((bid, idx) => {
                          const isWinner = activeRfq.awardedSupplierId === bid.supplierId;
                          const isRecommended = bid.status === 'recommended';

                          return (
                            <th
                              key={bid.supplierId}
                              className={`p-3 border text-center font-bold ${
                                isWinner
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950 ring-2 ring-emerald-500/20'
                                  : isRecommended
                                  ? 'bg-amber-50/80 border-amber-300 text-amber-950'
                                  : 'bg-white border-slate-200 text-slate-800'
                              }`}
                            >
                              <div className="flex flex-col items-center gap-1">
                                {isWinner ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-600 text-white">
                                    <Trophy className="w-3 h-3 text-amber-300" />
                                    <span>PEMENANG RESMI</span>
                                  </span>
                                ) : isRecommended ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-500 text-white">
                                    <Medal className="w-3 h-3" />
                                    <span>REKOMENDASI AI</span>
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    Opsi #{idx + 1}
                                  </span>
                                )}
                                <span className="text-xs font-bold mt-0.5">{bid.supplierName}</span>
                              </div>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {/* Total Nilai Penawaran */}
                      <tr>
                        <td className="p-3 bg-slate-50 border border-slate-200 font-bold text-slate-700">
                          Total Nilai Penawaran
                        </td>
                        {activeRfq.bids.map((bid) => (
                          <td
                            key={bid.supplierId}
                            className="p-3 border border-slate-200 text-center font-mono font-black text-slate-900 text-sm"
                          >
                            {formatRupiah(bid.totalPrice)}
                          </td>
                        ))}
                      </tr>

                      {/* Harga Satuan Item */}
                      <tr>
                        <td className="p-3 bg-slate-50 border border-slate-200 font-medium text-slate-600">
                          Harga Satuan (Est. Qty:{' '}
                          {activeRfq.items.reduce((s, it) => s + it.quantity, 0)})
                        </td>
                        {activeRfq.bids.map((bid) => (
                          <td
                            key={bid.supplierId}
                            className="p-3 border border-slate-200 text-center font-mono text-slate-700"
                          >
                            {formatRupiah(bid.unitPrice)}
                          </td>
                        ))}
                      </tr>

                      {/* Waktu Kirim (Lead Time) */}
                      <tr>
                        <td className="p-3 bg-slate-50 border border-slate-200 font-medium text-slate-600">
                          Kecepatan Pengiriman
                        </td>
                        {activeRfq.bids.map((bid) => (
                          <td
                            key={bid.supplierId}
                            className="p-3 border border-slate-200 text-center font-semibold text-slate-800"
                          >
                            {bid.deliveryDays} Hari Kerja
                          </td>
                        ))}
                      </tr>

                      {/* Termin Pembayaran */}
                      <tr>
                        <td className="p-3 bg-slate-50 border border-slate-200 font-medium text-slate-600">
                          Termin Pembayaran (TOP)
                        </td>
                        {activeRfq.bids.map((bid) => (
                          <td
                            key={bid.supplierId}
                            className="p-3 border border-slate-200 text-center font-medium text-slate-700"
                          >
                            {bid.paymentTerms}
                          </td>
                        ))}
                      </tr>

                      {/* Garansi Resmi */}
                      <tr>
                        <td className="p-3 bg-slate-50 border border-slate-200 font-medium text-slate-600">
                          Masa Garansi
                        </td>
                        {activeRfq.bids.map((bid) => (
                          <td
                            key={bid.supplierId}
                            className="p-3 border border-slate-200 text-center font-semibold text-slate-800"
                          >
                            {bid.warrantyMonths} Bulan On-Site
                          </td>
                        ))}
                      </tr>

                      {/* Skor Kepatuhan Rekanan */}
                      <tr>
                        <td className="p-3 bg-slate-50 border border-slate-200 font-medium text-slate-600">
                          Kepatuhan Pajak & Dokumen
                        </td>
                        {activeRfq.bids.map((bid) => (
                          <td
                            key={bid.supplierId}
                            className="p-3 border border-slate-200 text-center font-mono font-bold text-emerald-700"
                          >
                            {bid.complianceScore}/100
                          </td>
                        ))}
                      </tr>

                      {/* Skor Komposit Keseluruhan */}
                      <tr className="bg-slate-100/60 font-bold">
                        <td className="p-3 bg-slate-100 border border-slate-200 font-extrabold text-slate-900">
                          Skor Evaluasi Menyeluruh
                        </td>
                        {activeRfq.bids.map((bid) => (
                          <td
                            key={bid.supplierId}
                            className="p-3 border border-slate-200 text-center font-mono font-black text-base text-indigo-700"
                          >
                            {bid.overallScore} / 100
                          </td>
                        ))}
                      </tr>

                      {/* Catatan Teknis */}
                      <tr>
                        <td className="p-3 bg-slate-50 border border-slate-200 font-medium text-slate-600">
                          Catatan & Spesifikasi
                        </td>
                        {activeRfq.bids.map((bid) => (
                          <td
                            key={bid.supplierId}
                            className="p-3 border border-slate-200 text-left text-[11px] text-slate-600 leading-relaxed"
                          >
                            {bid.notes || 'Sesuai spek dasar.'}
                          </td>
                        ))}
                      </tr>

                      {/* Aksi Penetapan Pemenang */}
                      <tr>
                        <td className="p-3 bg-slate-50 border border-slate-200 font-bold text-slate-700">
                          Aksi Procurement
                        </td>
                        {activeRfq.bids.map((bid) => {
                          const isWinner = activeRfq.awardedSupplierId === bid.supplierId;

                          return (
                            <td
                              key={bid.supplierId}
                              className="p-3 border border-slate-200 text-center"
                            >
                              {activeRfq.status === 'awarded' ? (
                                isWinner ? (
                                  <span className="font-bold text-emerald-700 flex items-center justify-center gap-1">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    <span>Pemenang Sah</span>
                                  </span>
                                ) : (
                                  <span className="text-slate-400 text-xs">Gugur</span>
                                )
                              ) : (
                                <button
                                  onClick={() => handleOpenAwardModal(bid)}
                                  className={`w-full py-1.5 px-3 rounded-lg font-bold text-xs transition flex items-center justify-center gap-1 shadow-xs ${
                                    bid.status === 'recommended'
                                      ? 'bg-amber-600 hover:bg-amber-700 text-white'
                                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                                  }`}
                                >
                                  <Award className="w-3.5 h-3.5" />
                                  <span>Pilih Pemenang</span>
                                </button>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal Buka Tender RFQ Baru */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Buka Tender RFQ Baru</h3>
                  <p className="text-xs text-slate-500">Tender Penawaran Harga Minimal 3 Rekanan</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRfq} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Judul Paket Pengadaan:
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Departemen:</label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Batas Akhir:</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pagu Anggaran Target (IDR):</label>
                <input
                  type="number"
                  required
                  value={targetBudget}
                  onChange={(e) => setTargetBudget(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold"
                />
              </div>

              <div className="pt-2 border-t border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-slate-600 block uppercase tracking-wider">
                  Item Spesifikasi Pengadaan:
                </span>
                <div>
                  <input
                    type="text"
                    required
                    value={itemDescription}
                    onChange={(e) => setItemDescription(e.target.value)}
                    placeholder="Deskripsi item / spesifikasi teknis"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">Kuantitas</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={itemQuantity}
                      onChange={(e) => setItemQuantity(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">Satuan</label>
                    <input
                      type="text"
                      required
                      value={itemUnit}
                      onChange={(e) => setItemUnit(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">Harga Target</label>
                    <input
                      type="number"
                      required
                      value={itemTargetPrice}
                      onChange={(e) => setItemTargetPrice(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
                >
                  Buka Tender RFQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Input Penawaran Vendor */}
      {isSubmitBidModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Input Penawaran Rekanan</h3>
                  <p className="text-xs text-slate-500 font-mono">{activeRfq.rfqNumber}</p>
                </div>
              </div>
              <button
                onClick={() => setIsSubmitBidModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBid} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pilih Rekanan / Vendor:</label>
                <select
                  value={bidSupplierId}
                  onChange={(e) => setBidSupplierId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Harga Penawaran Satuan (IDR):
                </label>
                <input
                  type="number"
                  required
                  value={bidUnitPrice}
                  onChange={(e) => setBidUnitPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Waktu Kirim (Hari Kerja):</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={bidDeliveryDays}
                    onChange={(e) => setBidDeliveryDays(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Masa Garansi (Bulan):</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={bidWarrantyMonths}
                    onChange={(e) => setBidWarrantyMonths(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Termin Pembayaran:</label>
                <select
                  value={bidPaymentTerms}
                  onChange={(e) => setBidPaymentTerms(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                >
                  <option value="Net 14 Days">Net 14 Hari</option>
                  <option value="Net 30 Days">Net 30 Hari</option>
                  <option value="Net 45 Days">Net 45 Hari</option>
                  <option value="Net 60 Days">Net 60 Hari</option>
                  <option value="Cash Before Delivery">CBD (Cash Before Delivery)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Tambahan Vendor:</label>
                <textarea
                  rows={2}
                  value={bidNotes}
                  onChange={(e) => setBidNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSubmitBidModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                >
                  Kalkulasi & Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Penetapan Pemenang Tender */}
      {isAwardModalOpen && selectedBidToAward && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Penetapan Pemenang Tender</h3>
                  <p className="text-xs text-slate-500 font-mono">{activeRfq.rfqNumber}</p>
                </div>
              </div>
              <button
                onClick={() => setIsAwardModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 mb-4 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Pemenang Terpilih:</span>
                <span className="font-bold text-slate-900">{selectedBidToAward.supplierName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Nilai Kontrak Tender:</span>
                <span className="font-mono font-bold text-blue-700">
                  {formatRupiah(selectedBidToAward.totalPrice)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Skor Evaluasi:</span>
                <span className="font-mono font-bold text-emerald-700">
                  {selectedBidToAward.overallScore}/100
                </span>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Justifikasi / Alasan Pemilihan Pemenang (Untuk Audit):
              </label>
              <textarea
                rows={3}
                required
                value={awardReason}
                onChange={(e) => setAwardReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsAwardModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmAward}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
              >
                Konfirmasi Pemenang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
