/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ArrowRight,
  Award,
  BarChart3,
  Building2,
  Calculator,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Download,
  FileCheck2,
  FileText,
  Lock,
  PiggyBank,
  Quote,
  Server,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { formatRupiah } from '../common/StatusBadge';
import { TrustCenterModal } from './TrustCenterModal';

interface LandingPageProps {
  onEnterApp: () => void;
  onOpenPricing: () => void;
  onOpenFeatures: () => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterApp,
  onOpenPricing,
  onOpenFeatures,
  onOpenAuth,
}) => {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [demoAmount, setDemoAmount] = useState<number>(65000000);
  const [isTrustModalOpen, setIsTrustModalOpen] = useState(false);

  // ROI Calculator States
  const [employeeCount, setEmployeeCount] = useState<number>(120);
  const [annualSpend, setAnnualSpend] = useState<number>(4500000000); // 4.5 Milyar

  // ROI Calculated Metrics
  // Maverick spend reduction averages ~8.5% in mid-to-large enterprises
  const estimatedAnnualSavings = Math.round(annualSpend * 0.085);
  // Hours saved in approval administration ~ 1.25 hours per employee per month
  const monthlyHoursSaved = Math.round(employeeCount * 1.25);
  // Estimated starter/pro SaaS investment (~Rp 45,000,000 / year)
  const estimatedCostPerYear = employeeCount > 100 ? 55000000 : 36000000;
  const netRoi = Math.max(0, Math.round(((estimatedAnnualSavings - estimatedCostPerYear) / estimatedCostPerYear) * 100));

  // Dynamic preview of approval chain based on demo amount
  const getApprovalStages = (amount: number) => {
    return [
      {
        order: 1,
        title: 'Level 1: Kepala Departemen',
        role: 'Head of Engineering / Dept Head',
        applies: true,
        threshold: 'Semua nominal',
      },
      {
        order: 2,
        title: 'Level 2: Finance & Budget Controller',
        role: 'Finance Manager',
        applies: amount >= 10000000,
        threshold: 'Nominal ≥ Rp 10.000.000',
      },
      {
        order: 3,
        title: 'Level 3: Otorisasi Eksekutif',
        role: 'VP Operations / Direktur',
        applies: amount >= 50000000,
        threshold: 'Nominal ≥ Rp 50.000.000',
      },
    ];
  };

  const currentStages = getApprovalStages(demoAmount);

  const testimonials = [
    {
      name: 'Bambang Sutrisno, SE., M.B.A.',
      role: 'Chief Financial Officer (CFO)',
      company: 'PT Nusantara Manufaktur Presisi',
      industry: 'Manufaktur & Komponen Otomotif (850 Karyawan)',
      quote:
        'Sebelum menggunakan Inka Company, rata-rata 11% pengeluaran kami berupa pembelian maverick (tanpa persetujuan resmi). Dalam 4 bulan penerapan, kami berhasil menghemat lebih dari Rp 620 Juta dan 100% dokumen pengadaan tercatat rapi di audit trail.',
      metric: 'Hemat Rp 620 Jt & Siklus Approval 90% Lebih Cepat',
      rating: 5,
    },
    {
      name: 'Rian Anggoro, S.T.',
      role: 'Head of Supply Chain & Procurement',
      company: 'PT Samudera Logistik Indonesia',
      industry: 'Logistik & Cold Storage (350 Karyawan)',
      quote:
        'Fitur Anti-Self Approval dan penguncian pagu anggaran otomatis adalah penyelamat kepatuhan kami. Audit tahunan dari KAP eksternal berjalan mulus tanpa satu pun temuan janggal pada berkas Purchase Order.',
      metric: '0 Temuan Audit Eksternal & PO Terbit Otomatis',
      rating: 5,
    },
    {
      name: 'Linda Kusuma, Ak.',
      role: 'Finance & Budget Controller',
      company: 'PT Retail Niaga Sejahtera',
      industry: 'Ritel & Distribusi Multi-Cabang (500 Karyawan)',
      quote:
        'Peringatan anggaran waktu nyata saat pembuatan PR membuat departemen tidak bisa lagi belanja melebihi kuota. Tim Finance sekarang punya visibilitas penuh setiap hari tanpa harus menunggu rekap Excel di akhir bulan.',
      metric: '100% Kontrol Pagu Anggaran Real-Time',
      rating: 5,
    },
  ];

  const comparisonRows = [
    {
      criteria: 'Kecepatan Implementasi',
      manual: 'Instan tapi berantakan (Chat/Excel)',
      erp: '6 hingga 12 bulan (Perlu konsultan)',
      inka: '1 Hari (Siap pakai langsung)',
    },
    {
      criteria: 'Proteksi Anti-Self Approval',
      manual: 'Tidak ada (Rawan konflik kepentingan)',
      erp: 'Kaku & sulit diubah',
      inka: 'Otomatis & Terproteksi di Backend',
    },
    {
      criteria: 'Monitoring Pagu Anggaran',
      manual: 'Manual, sering baru sadar saat over-budget',
      erp: 'Lambat, butuh batch closing bulanan',
      inka: 'Waktu Nyata (Live Budget Gate)',
    },
    {
      criteria: 'Kemudahan Digunakan Staf',
      manual: 'Sering lupa format / salah ketik',
      erp: 'Sangat rumit, butuh pelatihan intensif',
      inka: 'Sangat Intuitif (Precoro-grade UI)',
    },
    {
      criteria: 'Jejak Audit (Audit Trail)',
      manual: 'Bisa dihapus atau dipalsukan',
      erp: 'Tersedia tapi sulit diekspor',
      inka: 'Kekal (Immutable append-only)',
    },
    {
      criteria: 'Total Biaya Kepemilikan (TCO)',
      manual: 'Biaya tersembunyi dari maverick spend',
      erp: 'Ratusan juta + biaya lisensi tahunan',
      inka: 'Transparan, mulai Rp 1.5 Jt/bln',
    },
  ];

  const faqs = [
    {
      q: 'Apa itu Inka Company dan bagaimana perbedaannya dengan sistem procurement konvensional?',
      a: 'Inka Company adalah platform SaaS B2B terpusat yang menggantikan proses pengadaan manual (email, WhatsApp, formulir kertas, dan spreadsheet) dengan alur digital yang terstruktur. Platform ini memiliki proteksi ketat di backend sehingga Purchase Order (PO) mustahil diterbitkan sebelum seluruh persetujuan wajib dan verifikasi anggaran selesai.',
    },
    {
      q: 'Bagaimana Inka Company mencegah terjadinya persetujuan sendiri (self-approval)?',
      a: 'Sistem menerapkan aturan anti-konflik kepentingan ketat di level domain engine. Jika seorang pengguna berposisi sebagai Approver atau Admin namun mengajukan permintaannya sendiri (Requester), tombol approval untuk dokumen miliknya akan diblokir total secara otomatis oleh server.',
    },
    {
      q: 'Apakah data pengadaan perusahaan kami aman dan mematuhi UU PDP Indonesia?',
      a: 'Sangat aman. Inka Company mematuhi penuh UU No. 27/2022 tentang Perlindungan Data Pribadi dan PP No. 71/2019. Seluruh data disimpan di Tier-IV Data Center lokal di Jakarta dengan enkripsi AES-256 saat tersimpan dan TLS 1.3 saat transmisi.',
    },
    {
      q: 'Bagaimana sistem memastikan batas anggaran departemen tidak terlampaui?',
      a: 'Sebelum Purchase Request diajukan dan disetujui, sistem melakukan kalkulasi waktu nyata terhadap anggaran departemen yang tersedia. Jika permintaan melebihi sisa anggaran, peringatan merah dan notifikasi langsung dikirimkan ke tim Finance Controller.',
    },
    {
      q: 'Dapatkah saya mencetak dokumen Purchase Order (PO) resmi ke PDF?',
      a: 'Tentu. Setiap Purchase Order yang diterbitkan dilengkapi dengan layout standar korporasi profesional, nomor unik berurutan, rincian barang/jasa, PPN 11%, syarat pembayaran, alamat pengiriman, dan cap otorisasi digital siap cetak atau ekspor PDF.',
    },
    {
      q: 'Berapa lama waktu yang dibutuhkan untuk onboarding dan migrasi data dari Excel?',
      a: 'Mayoritas organisasi dapat mulai menggunakan Inka Company dalam 1 hari kerja. Tim onboarding kami siap membantu mengimpor master vendor, katalog item, dan struktur departemen Anda tanpa biaya tambahan.',
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white pt-16 pb-24 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(37,99,235,0.18),transparent_50%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(79,70,229,0.15),transparent_50%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-400 text-xs font-semibold mb-6">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>Platform B2B Procurement Modern Terinspirasi Standar Precoro</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white mb-6">
              Sederhanakan Alur Pengadaan & Lindungi Anggaran dengan{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
                Approval Tanpa Bocor
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-300 leading-relaxed mb-8">
              Inka Company mengotomatisasi Purchase Request, persetujuan bertingkat, dan penerbitan Purchase Order
              resmi. Hentikan pembelian liar dan ketahui setiap rupiah yang dibelanjakan organisasi Anda.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onEnterApp}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-base shadow-xl shadow-blue-600/30 hover:shadow-blue-500/40 flex items-center justify-center gap-2.5 transition transform hover:-translate-y-0.5"
              >
                <span>Buka Demo Interaktif Langsung</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => setIsTrustModalOpen(true)}
                className="w-full sm:w-auto px-6 py-4 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-base border border-slate-700 transition flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>Pusat Kepatuhan & Keamanan</span>
              </button>
            </div>

            {/* Trust Micro-Badges */}
            <div className="mt-10 pt-8 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Patuh UU PDP No. 27/2022</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Enkripsi AES-256 & TLS 1.3</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Data Center Tier-IV Jakarta</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Garansi Uptime 99.9%</span>
              </div>
            </div>
          </div>

          {/* Interactive Hero Widget: Live Multi-Tier Approval Chain Simulator */}
          <div className="mt-12 bg-slate-800/90 rounded-2xl border border-slate-700 p-6 sm:p-8 shadow-2xl backdrop-blur-sm max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-700">
              <div>
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                  Simulasi Dinamis Approval Engine Inka
                </span>
                <h3 className="text-lg font-bold text-white mt-1">
                  Aturan Berjenjang Berdasarkan Nominal Pembelian
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">Pilih Nominal:</span>
                <select
                  value={demoAmount}
                  onChange={(e) => setDemoAmount(Number(e.target.value))}
                  className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-1.5 text-xs text-white font-mono font-bold focus:outline-none focus:border-blue-500"
                >
                  <option value={5000000}>Rp 5.000.000 (Tier Standar)</option>
                  <option value={25000000}>Rp 25.000.000 (Tier Menengah)</option>
                  <option value={65000000}>Rp 65.000.000 (Tier Eksekutif)</option>
                  <option value={150000000}>Rp 150.000.000 (Pengadaan Skala Besar)</option>
                </select>
              </div>
            </div>

            {/* Stages Display */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {currentStages.map((stage) => (
                <div
                  key={stage.order}
                  className={`p-4 rounded-xl border transition ${
                    stage.applies
                      ? 'bg-slate-900/80 border-blue-500/50 shadow-md shadow-blue-500/10'
                      : 'bg-slate-900/40 border-slate-800 opacity-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        stage.applies
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      Tahap {stage.order}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400">
                      {stage.applies ? 'Wajib Review' : 'Dilewati (Bypass aman)'}
                    </span>
                  </div>

                  <div className="font-bold text-sm text-white">{stage.title}</div>
                  <div className="text-xs text-slate-400 mt-1">{stage.role}</div>
                  <div className="text-[11px] text-blue-400 font-mono mt-3 pt-3 border-t border-slate-800">
                    Syarat: {stage.threshold}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>
                  Hasil untuk {formatRupiah(demoAmount)}: Memerlukan{' '}
                  <strong className="text-white">
                    {currentStages.filter((s) => s.applies).length} tingkat persetujuan
                  </strong>{' '}
                  sebelum PO dapat terbit.
                </span>
              </div>
              <button
                onClick={onEnterApp}
                className="text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center gap-1"
              >
                Coba langsung di aplikasi &rarr;
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Builder 1: Interactive ROI & Spend Savings Calculator */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center justify-center gap-1.5">
              <Calculator className="w-4 h-4" />
              <span>Kalkulator ROI & Efisiensi Pengadaan</span>
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-2">
              Berapa Banyak yang Dapat Anda Hemat dengan Inka Company?
            </h2>
            <p className="text-slate-600 mt-3 text-sm">
              Gunakan parameter organisasi Anda untuk melihat proyeksi penghematan pengeluaran maverick
              dan percepatan jam kerja persetujuan.
            </p>
          </div>

          <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-2xl max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Sliders Area (7 Cols) */}
            <div className="lg:col-span-7 space-y-8">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="font-bold text-sm text-slate-200">
                    Jumlah Karyawan / Pengguna:
                  </label>
                  <span className="font-mono text-base font-black text-blue-400">
                    {employeeCount} Orang
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="1000"
                  step="10"
                  value={employeeCount}
                  onChange={(e) => setEmployeeCount(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                  <span>20 Karyawan</span>
                  <span>1.000 Karyawan</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="font-bold text-sm text-slate-200">
                    Estimasi Belanja Pengadaan Tahunan (Annual Spend):
                  </label>
                  <span className="font-mono text-base font-black text-emerald-400">
                    {formatRupiah(annualSpend)}
                  </span>
                </div>
                <input
                  type="range"
                  min="500000000"
                  max="20000000000"
                  step="250000000"
                  value={annualSpend}
                  onChange={(e) => setAnnualSpend(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                  <span>Rp 500 Juta / tahun</span>
                  <span>Rp 20 Milyar / tahun</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Berdasarkan riset industri B2B procurement, penerapan alur approval terstruktur dan kontrol anggaran
                  mencegah rata-rata <strong>8.5% pembelian liar (maverick spend)</strong> serta memangkas waktu proses hingga 70%.
                </p>
              </div>
            </div>

            {/* Calculations Box (5 Cols) */}
            <div className="lg:col-span-5 bg-gradient-to-br from-blue-900/60 to-indigo-900/60 rounded-2xl p-6 border border-blue-500/30 text-center space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-300">
                  Estimasi Penghematan Biaya Belanja
                </span>
                <div className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono mt-1">
                  {formatRupiah(estimatedAnnualSavings)}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">per tahun (~{formatRupiah(Math.round(estimatedAnnualSavings / 12))}/bulan)</div>
              </div>

              <div className="grid grid-cols-2 gap-4 py-4 border-y border-blue-400/20 text-left">
                <div>
                  <span className="text-[11px] text-slate-300 block">Jam Kerja Dihemat:</span>
                  <span className="font-black text-lg text-white font-mono">
                    ~{monthlyHoursSaved} Jam/bln
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-300 block">Siklus Approval:</span>
                  <span className="font-black text-lg text-white font-mono">
                    6 Hari &rarr; 3 Jam
                  </span>
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-300">
                  Proyeksi Net Return on Investment (ROI):
                </div>
                <div className="text-2xl font-black text-blue-300 font-mono mt-1">
                  {netRoi}% Net ROI
                </div>
              </div>

              <button
                onClick={onEnterApp}
                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/30 transition flex items-center justify-center gap-2"
              >
                <span>Uji Coba Penghematan di Aplikasi</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Builder 2: Social Proof & Client Testimonials */}
      <section className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center justify-center gap-1.5">
              <Award className="w-4 h-4" />
              <span>Kisah Sukses Perusahaan di Indonesia</span>
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-2">
              Dipercaya CFO & Praktisi Pengadaan Terkemuka
            </h2>
            <p className="text-slate-600 mt-3 text-sm">
              Lihat bagaimana para pemimpin keuangan dan rantai pasok mengendalikan pengeluaran dengan Inka Company.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-7 border border-slate-200/90 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  {/* Rating Stars */}
                  <div className="flex items-center gap-1 text-amber-400 mb-4">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>

                  {/* Impact Highlight Badge */}
                  <div className="inline-block px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-bold text-[11px] mb-4 border border-blue-100">
                    {t.metric}
                  </div>

                  {/* Quote */}
                  <p className="text-slate-700 text-xs leading-relaxed italic mb-6">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>

                {/* Author Info */}
                <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="font-extrabold text-xs text-slate-900">{t.name}</div>
                    <div className="text-[11px] text-slate-500 font-medium">{t.role}</div>
                    <div className="text-[10px] text-blue-600 font-bold mt-0.5">{t.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Builder 3: Solution Comparison Matrix (Spreadsheet vs Heavy ERP vs Inka) */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Perbandingan Solusi Pengadaan
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-2">
              Mengapa Inka Company Unggul Dibanding Alternatif Lain?
            </h2>
            <p className="text-slate-600 mt-3 text-sm">
              Bukan spreadsheet manual yang rapuh, bukan juga ERP raksasa yang mahal dan rumit.
            </p>
          </div>

          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs max-w-5xl mx-auto">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                    <th className="py-4 px-5 font-bold w-1/4">Kriteria Penilaian</th>
                    <th className="py-4 px-5 font-semibold text-slate-500 w-1/4">Manual / Excel & Chat</th>
                    <th className="py-4 px-5 font-semibold text-slate-500 w-1/4">ERP Tradisional Berat</th>
                    <th className="py-4 px-5 font-extrabold text-blue-700 bg-blue-50/70 w-1/4">
                      Inka Company (SaaS)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {comparisonRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition">
                      <td className="py-3.5 px-5 font-bold text-slate-900">{row.criteria}</td>
                      <td className="py-3.5 px-5 text-slate-500">{row.manual}</td>
                      <td className="py-3.5 px-5 text-slate-500">{row.erp}</td>
                      <td className="py-3.5 px-5 font-semibold text-blue-900 bg-blue-50/40">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{row.inka}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Builder 4: Security, Compliance & Data Center Trust Banner */}
      <section className="py-16 bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>Standar Keamanan Enterprise Kelas Perbankan</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Keamanan & Privasi Data Pengadaan Anda Adalah Prioritas Mutlak
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Kami menerapkan enkripsi end-to-end AES-256, isolasi data multi-tenant ketat, kepatuhan UU PDP No. 27/2022,
                serta penempatan server pada Tier-IV Data Center Jakarta dengan audit trail yang tak dapat dimanipulasi.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <button
                onClick={() => setIsTrustModalOpen(true)}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                <span>Buka Pusat Kepatuhan & Whitepaper</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive FAQ Section */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Pertanyaan Umum (FAQ)
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-2">
              Segala Hal Tentang Inka Company
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div
                  key={index}
                  className="border border-slate-200 rounded-xl overflow-hidden transition"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="w-full text-left p-5 flex items-center justify-between gap-4 bg-slate-50 hover:bg-slate-100/80 transition"
                  >
                    <span className="font-bold text-sm text-slate-900">{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="p-5 text-sm text-slate-600 leading-relaxed bg-white border-t border-slate-200">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-16 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
            Siap Mengendalikan Pengeluaran Organisasi Anda?
          </h2>
          <p className="text-blue-100 text-base max-w-2xl mx-auto mb-8">
            Uji coba langsung workspace Inka Company hari ini dengan berbagai simulasi peran karyawan, approver, procurement, dan finance.
          </p>
          <button
            onClick={onEnterApp}
            className="px-8 py-4 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-extrabold text-base shadow-xl shadow-blue-900/30 transition transform hover:-translate-y-0.5 inline-flex items-center gap-2"
          >
            <span>Buka Aplikasi SaaS Sekarang</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm">
              IK
            </div>
            <span className="font-bold text-white text-sm">Inka Company</span>
            <span className="text-slate-500">| B2B Procurement & Purchase Order SaaS</span>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={onOpenFeatures} className="hover:text-white transition">
              Fitur Lengkap
            </button>
            <button onClick={onOpenPricing} className="hover:text-white transition">
              Harga & Paket
            </button>
            <button onClick={() => setIsTrustModalOpen(true)} className="hover:text-white transition">
              Pusat Keamanan & Kepatuhan
            </button>
            <button onClick={onEnterApp} className="hover:text-white transition">
              Akses Workspace
            </button>
          </div>

          <div className="text-slate-500">
            &copy; 2026 Inka Company. Hak Cipta Dilindungi Undang-Undang.
          </div>
        </div>
      </footer>

      {/* Trust & Compliance Modal */}
      <TrustCenterModal
        isOpen={isTrustModalOpen}
        onClose={() => setIsTrustModalOpen(false)}
      />
    </div>
  );
};
