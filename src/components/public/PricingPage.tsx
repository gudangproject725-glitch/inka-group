/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ArrowRight, Check, HelpCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { formatRupiah } from '../common/StatusBadge';

interface PricingPageProps {
  onEnterApp: () => void;
  onBackToHome: () => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ onEnterApp, onBackToHome }) => {
  const [isAnnual, setIsAnnual] = useState(true);

  const plans = [
    {
      name: 'Starter Tier',
      tagline: 'Ideal untuk startup & UKM yang beralih dari persetujuan chat manual',
      monthlyPrice: 1500000,
      annualMonthlyPrice: 1200000,
      popular: false,
      features: [
        'Hingga 15 Akun Pengguna',
        'Alur Approval Standar (2 Tahap)',
        'Maksimal 150 Purchase Order / Bulan',
        'Katalog Barang Terpusat (500 SKU)',
        'Master Vendor Terbatas (50 Pemasok)',
        'Ekspor PDF Dokumen PO Standar',
        'Dukungan Email Jam Kerja',
      ],
      cta: 'Mulai Uji Coba Starter',
    },
    {
      name: 'Professional Tier',
      tagline: 'Pilihan populer perusahaan berkembang dengan kontrol anggaran ketat',
      monthlyPrice: 3800000,
      annualMonthlyPrice: 3000000,
      popular: true,
      features: [
        'Hingga 60 Akun Pengguna',
        'Approval Workflow Multi-Tier Tanpa Batas',
        'Purchase Order Tanpa Batas Kuota',
        'Pencegahan Anti-Self Approval Wajib',
        'Monitoring Pagu Anggaran Real-time',
        'Log Audit Keamanan Kekal 1 Tahun',
        'Katalog & Pemasok Tanpa Batas',
        'Dukungan Prioritas SLA 4 Jam',
      ],
      cta: 'Uji Coba Professional',
    },
    {
      name: 'Enterprise Tier',
      tagline: 'Untuk korporasi skala besar dengan multi-anak perusahaan & audit khusus',
      monthlyPrice: null, // Custom
      annualMonthlyPrice: null,
      popular: false,
      features: [
        'Pengguna & Transaksi Tanpa Batas',
        'Multi-Tenant & Multi-Entity Perusahaan',
        'Workflow Hirarki Departemen Kustom',
        'Penyimpanan Audit Trail Selamanya',
        'Integrasi API & Webhook Kustom',
        'Dedicated Account Manager & Training Staf',
        'Jaminan Ketersediaan Layanan SLA 99.9%',
      ],
      cta: 'Hubungi Tim Penjualan',
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
          <button onClick={onBackToHome} className="hover:text-blue-600 transition">
            Beranda
          </button>
          <span>/</span>
          <span className="text-slate-800 font-semibold">Paket Langganan & Harga</span>
        </div>

        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            Investasi Terjangkau untuk Kendali Pengeluaran
          </span>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mt-2">
            Paket Transparan Sesuai Skala Bisnis Anda
          </h1>
          <p className="text-slate-600 text-base mt-3">
            Pilih paket langganan Inka Company tanpa biaya tersembunyi. Hemat hingga 20% dengan paket tahunan.
          </p>

          {/* Billing Interval Toggle */}
          <div className="mt-8 inline-flex items-center p-1 bg-slate-200/80 rounded-xl text-xs font-bold">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-4 py-2 rounded-lg transition ${
                !isAnnual ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Penagihan Bulanan
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-4 py-2 rounded-lg flex items-center gap-1.5 transition ${
                isAnnual ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Penagihan Tahunan</span>
              <span className="bg-emerald-400 text-slate-950 text-[10px] px-1.5 py-0.2 rounded font-black">
                Hemat 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16 items-stretch">
          {plans.map((plan, idx) => {
            const price = isAnnual ? plan.annualMonthlyPrice : plan.monthlyPrice;
            return (
              <div
                key={idx}
                className={`rounded-2xl p-8 flex flex-col justify-between transition relative ${
                  plan.popular
                    ? 'bg-white border-2 border-blue-600 shadow-xl shadow-blue-500/10'
                    : 'bg-white border border-slate-200 shadow-xs hover:shadow-md'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-extrabold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md">
                    Paling Banyak Dipilih
                  </div>
                )}

                <div>
                  <div className="font-extrabold text-xl text-slate-900 mb-1">{plan.name}</div>
                  <p className="text-xs text-slate-500 leading-relaxed min-h-[36px]">{plan.tagline}</p>

                  <div className="my-6 pb-6 border-b border-slate-100">
                    {price ? (
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                          {formatRupiah(price)}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">/ bulan</span>
                      </div>
                    ) : (
                      <div className="text-3xl font-extrabold text-slate-900">Kustom</div>
                    )}
                    <div className="text-[11px] text-slate-400 mt-1">
                      {price
                        ? isAnnual
                          ? 'Ditagihkan tahunan (Rp ' + (price * 12).toLocaleString('id-ID') + '/tahun)'
                          : 'Ditagihkan setiap bulan'
                        : 'Hubungi konsultan kami'}
                    </div>
                  </div>

                  <div className="space-y-3 text-xs text-slate-700 mb-8">
                    <div className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">
                      Fasilitas Termasuk:
                    </div>
                    {plan.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={onEnterApp}
                  className={`w-full py-3.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 ${
                    plan.popular
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  <span>{plan.cta}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Security & Guarantee Box */}
        <div className="max-w-3xl mx-auto rounded-2xl bg-blue-50/70 border border-blue-200 p-6 flex flex-col sm:flex-row items-center gap-4 text-xs text-blue-900">
          <ShieldCheck className="w-8 h-8 text-blue-600 shrink-0" />
          <div className="flex-1 leading-relaxed">
            <strong>Keamanan & Kepatuhan Terjamin:</strong> Data setiap penyewa (tenant) dienkripsi dalam database
            terpisah. Sistem menjamin kepatuhan audit internal dan privasi data operasional pengadaan Anda.
          </div>
          <button
            onClick={onEnterApp}
            className="shrink-0 font-bold underline hover:text-blue-700"
          >
            Uji Coba Sekarang &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
