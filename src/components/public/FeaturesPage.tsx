/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  Clock,
  Download,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  History,
  Layers,
  Lock,
  PieChart,
  Printer,
  Receipt,
  Scale,
  Server,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Stamp,
  Truck,
  UserCheck,
  Users,
  Wallet,
  Zap,
} from 'lucide-react';
import { TrustCenterModal } from './TrustCenterModal';

interface FeaturesPageProps {
  onBack: () => void;
  onOpenApp: () => void;
  onOpenPricing: () => void;
}

export const FeaturesPage: React.FC<FeaturesPageProps> = ({
  onBack,
  onOpenApp,
  onOpenPricing,
}) => {
  const [isTrustModalOpen, setIsTrustModalOpen] = useState(false);

  const featuresList = [
    {
      icon: Stamp,
      badge: 'Legal & Kepatuhan Bea',
      title: 'e-Meterai & Digital Signature Resmi (PSrE)',
      description:
        'Otomatisasi pembubuhan meterai elektronik Rp 10.000 untuk PO bernilai ≥ Rp 5.000.000 (UU Bea Meterai No. 10/2020) melalui PSrE resmi (Peruri, PrivyID, VIDA). Dilengkapi nomor seri unik, QR verifikasi DJP, dan hash dokumen SHA-256.',
      accent: 'border-amber-300 bg-amber-50/40 text-amber-900',
      iconColor: 'bg-amber-100 text-amber-700',
    },
    {
      icon: FileCheck2,
      badge: 'Zero Overbilling',
      title: '3-Way Matching Rekonsiliasi Otomatis',
      description:
        'Pencocokan presisi 3 arah: Purchase Order ↔ Bukti Terima Barang (GRN / Surat Jalan) ↔ Faktur Tagihan Vendor & e-Faktur Pajak. Sistem memblokir pembayaran secara otomatis jika ditemukan selisih kuantitas atau lonjakan harga.',
      accent: 'border-emerald-300 bg-emerald-50/40 text-emerald-900',
      iconColor: 'bg-emerald-100 text-emerald-700',
    },
    {
      icon: Scale,
      badge: 'Efisiensi Pengadaan',
      title: '3-Way RFQ & Matriks Perbandingan Vendor',
      description:
        'Buka tender pengadaan dan bandingkan minimal 3 penawaran harga vendor secara berdampingan. Algoritma menghitung skor komposit otomatis (50% Harga, 20% Kecepatan Kirim, 20% Kepatuhan, 10% Garansi) untuk rekomendasi terbaik.',
      accent: 'border-indigo-300 bg-indigo-50/40 text-indigo-900',
      iconColor: 'bg-indigo-100 text-indigo-700',
    },
    {
      icon: UserCheck,
      badge: 'Transparansi Rekanan',
      title: 'Portal Vendor Rekanan Mandiri (Self-Service)',
      description:
        'Mitra vendor dapat mengakses portal khusus untuk mengunduh PO resmi, mengirim nomor Surat Jalan pengiriman fisik, mengunggah e-Faktur, serta memperbarui verifikasi legalitas (NPWP, NIB, & rekening bank).',
      accent: 'border-blue-300 bg-blue-50/40 text-blue-900',
      iconColor: 'bg-blue-100 text-blue-700',
    },
    {
      icon: ShieldAlert,
      badge: 'Audit & Deteksi Fraud',
      title: 'Radar Deteksi Anomali & Pencegahan Fraud',
      description:
        'Deteksi cerdas pola transaksi mencurigakan: Split PR (pemecahan pengajuan beruntun di bawah pagu persetujuan direktur Rp 50 Jt), lonjakan harga di atas katalog acuan, dan peringatan konsentrasi belanja vendor >60%.',
      accent: 'border-rose-300 bg-rose-50/40 text-rose-900',
      iconColor: 'bg-rose-100 text-rose-700',
    },
    {
      icon: ShieldCheck,
      badge: 'Anti-Conflict of Interest',
      title: 'Strict Anti-Self Approval & Alur Sekuensial',
      description:
        'Pemohon secara absolut dilarang menyetujui dokumennya sendiri meskipun memiliki jabatan direktur atau manajer. Approval Level 2 & 3 terkunci rapat sebelum Level sebelumnya memberikan persetujuan sah.',
      accent: 'border-slate-300 bg-slate-50 text-slate-900',
      iconColor: 'bg-slate-200 text-slate-800',
    },
    {
      icon: Wallet,
      badge: 'Disiplin Anggaran',
      title: 'Validasi Pagu Anggaran Real-Time (Budget Guardrails)',
      description:
        'Pengecekan sisa anggaran departemen dan pusat biaya (cost center) saat item PR dimasukkan. Pengajuan melebihi pagu langsung dicegah oleh sistem sebelum membebani arus kas perusahaan.',
      accent: 'border-purple-300 bg-purple-50/40 text-purple-900',
      iconColor: 'bg-purple-100 text-purple-700',
    },
    {
      icon: History,
      badge: 'Kesiapan Audit Eksternal',
      title: 'Append-Only Tamper-Proof Audit Trail',
      description:
        'Seluruh jejak transaksi, stempel waktu, perubahan status, alasan penolakan, dan identitas pelaku tercatat permanen tanpa opsi edit/hapus manual, siap diaudit sewaktu-waktu oleh KAP dan BPK.',
      accent: 'border-cyan-300 bg-cyan-50/40 text-cyan-900',
      iconColor: 'bg-cyan-100 text-cyan-700',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Top Header */}
      <header className="bg-slate-900 text-white sticky top-0 z-30 border-b border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition flex items-center gap-1.5 text-xs font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali</span>
            </button>
            <div className="h-4 w-px bg-slate-700" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-black text-white text-xs">
                IK
              </div>
              <span className="font-extrabold text-base tracking-tight">Inka Company</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsTrustModalOpen(true)}
              className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-slate-800 transition"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Trust & Compliance Center</span>
            </button>
            <button
              onClick={onOpenApp}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition flex items-center gap-1.5"
            >
              <span>Buka Demo Aplikasi</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold mb-4">
          <Sparkles className="w-4 h-4" />
          <span>Arsitektur Fitur Procurement Enterprise B2B</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight max-w-3xl mx-auto leading-tight">
          Kendali Penuh Dari Pengajuan Hingga Pembayaran Sah
        </h1>
        <p className="mt-4 text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Dirancang untuk menghilangkan celah *maverick spend*, manipulasi nominal, persetujuan sepihak, dan overbilling vendor dengan standar tata kelola kepatuhan tertinggi di Indonesia.
        </p>
      </section>

      {/* Grid of 8 Core Capabilities */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuresList.map((f, idx) => {
            const Icon = f.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl ${f.iconColor} flex items-center justify-center`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {f.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 mb-2 leading-snug">
                    {f.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">{f.description}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-blue-600">
                  <span>Aktif di Inka Company</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Enterprise Security & Compliance Bar */}
      <section className="bg-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Kedaulatan & Keamanan Data Indonesia</span>
            </div>
            <h2 className="text-2xl font-black text-white">
              Sesuai Regulasi UU PDP & PP No. 71/2019
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Seluruh data transaksi, identitas persetujuan, dan arsip PO disimpan dalam infrastruktur Tier-IV berlokasi di Jakarta dengan enkripsi AES-256 GCM at-rest dan TLS 1.3 in-transit.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              onClick={() => setIsTrustModalOpen(true)}
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4 text-blue-400" />
              <span>Buka Dokumen Kepatuhan</span>
            </button>
            <button
              onClick={onOpenApp}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2"
            >
              <span>Uji Demo Langsung</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Trust Center Modal */}
      <TrustCenterModal isOpen={isTrustModalOpen} onClose={() => setIsTrustModalOpen(false)} />
    </div>
  );
};
