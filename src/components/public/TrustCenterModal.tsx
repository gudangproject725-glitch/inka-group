/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  CheckCircle2,
  Download,
  FileCheck2,
  FileText,
  Lock,
  Printer,
  Server,
  Shield,
  ShieldAlert,
  ShieldCheck,
  X,
} from 'lucide-react';

interface TrustCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TrustCenterModal: React.FC<TrustCenterModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'security' | 'compliance' | 'sla' | 'whitepaper'>('security');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-xs">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-400/30 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white">
                  Pusat Keamanan, Kepatuhan & Sertifikasi Inka Company
                </h2>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-400/30">
                  Terverifikasi 2026
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-0.5">
                Standar tata kelola data enterprise, privasi UU PDP Indonesia, dan keandalan sistem
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Tutup Pusat Keamanan"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 gap-2 text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setActiveTab('security')}
            className={`py-3 px-3 border-b-2 transition flex items-center gap-2 ${
              activeTab === 'security'
                ? 'border-blue-600 text-blue-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Keamanan Data & Enkripsi</span>
          </button>
          <button
            onClick={() => setActiveTab('compliance')}
            className={`py-3 px-3 border-b-2 transition flex items-center gap-2 ${
              activeTab === 'compliance'
                ? 'border-blue-600 text-blue-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Kepatuhan UU PDP & Regulasi RI</span>
          </button>
          <button
            onClick={() => setActiveTab('sla')}
            className={`py-3 px-3 border-b-2 transition flex items-center gap-2 ${
              activeTab === 'sla'
                ? 'border-blue-600 text-blue-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>SLA 99.9% & Data Center Lokal</span>
          </button>
          <button
            onClick={() => setActiveTab('whitepaper')}
            className={`py-3 px-3 border-b-2 transition flex items-center gap-2 ${
              activeTab === 'whitepaper'
                ? 'border-blue-600 text-blue-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Whitepaper Resmi Siap Cetak</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700 leading-relaxed">
          {activeTab === 'security' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="flex items-center gap-2 font-bold text-slate-900 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Enkripsi Berlapis (At Rest & In Transit)</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Setiap data nominal pengadaan, rincian vendor, dan riwayat persetujuan dienkripsi menggunakan
                    algoritma standar perbankan <strong>AES-256 GCM</strong> saat tersimpan di database, serta
                    dilindungi protokol <strong>TLS 1.3</strong> dengan Perfect Forward Secrecy saat transmisi.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="flex items-center gap-2 font-bold text-slate-900 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Isolasi Multi-Tenant Ketat</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Setiap tenant organisasi beroperasi dalam batasan partisi logis dan skema terisolasi. Seluruh kueri
                    database diverifikasi secara kriptografis pada tingkat aplikasi dan middleware otorisasi,
                    mencegah kebocoran lintas entitas perusahaan (IDOR immune).
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="flex items-center gap-2 font-bold text-slate-900 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Audit Trail Kekal (Tamper-Proof)</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Log audit dirancang berprinsip <em>append-only</em>. Tidak ada pengguna, termasuk Administrator
                    organisasi, yang memiliki wewenang untuk menghapus atau menyunting rekam jejak keputusan persetujuan,
                    alasan penolakan, maupun cap waktu (timestamp).
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="flex items-center gap-2 font-bold text-slate-900 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Pencegahan Konflik Kepentingan Bawaan</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Mesin persetujuan memblokir secara mutlak hak persetujuan oleh pemohon sendiri (<em>Anti-Self Approval</em>).
                    Dokumen tidak dapat diproses lebih lanjut tanpa otorisasi sah dari pejabat berwenang yang berbeda.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'compliance' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-950">
                <h3 className="font-extrabold text-sm mb-1">
                  Kepatuhan Terhadap Undang-Undang Perlindungan Data Pribadi (UU No. 27/2022)
                </h3>
                <p className="text-xs leading-relaxed text-blue-900">
                  Inka Company sepenuhnya mematuhi prinsip pemrosesan data pribadi di Indonesia. Akses informasi karyawan,
                  rekening vendor, dan data finansial dibatasi atas dasar kebutuhan operasional (<em>least privilege access</em>),
                  dilengkapi hak penghapusan data tenant (<em>right to be forgotten</em>), serta enkripsi data personal sensitif.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-white text-center">
                  <div className="font-black text-lg text-slate-900 font-mono mb-1">PP No. 71/2019</div>
                  <p className="text-[11px] text-slate-500">
                    Penyelenggaraan Sistem dan Transaksi Elektronik dengan kepatuhan penempatan data finansial publik & privat.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white text-center">
                  <div className="font-black text-lg text-slate-900 font-mono mb-1">PPN 11% & e-Faktur</div>
                  <p className="text-[11px] text-slate-500">
                    Kalkulasi pajak pertambahan nilai terstandarisasi sesuai PMK terbaru Direktorat Jenderal Pajak RI.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white text-center">
                  <div className="font-black text-lg text-slate-900 font-mono mb-1">ISO 27001 Ready</div>
                  <p className="text-[11px] text-slate-500">
                    Framework manajemen keamanan informasi terstruktur untuk audit kepatuhan eksternal dan BPK/KAP.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sla' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-900 text-white">
                  <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider block mb-1">
                    Garansi Ketersediaan
                  </span>
                  <div className="text-2xl font-black font-mono text-white">99.9% Uptime</div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Jaminan operasional dengan kompensasi kredit layanan jika SLA terganggu.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 text-white">
                  <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider block mb-1">
                    Lokasi Data Center
                  </span>
                  <div className="text-xl font-black text-white">Jakarta (Tier IV)</div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Infrastruktur lokal latensi rendah (&lt;15ms) dengan backup redundan harian.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 text-white">
                  <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider block mb-1">
                    RPO & RTO
                  </span>
                  <div className="text-xl font-black text-white">&lt; 15 Menit / &lt; 2 Jam</div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Disaster Recovery siap siaga dengan snapshot multi-zona berkala.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs">
                <h4 className="font-bold text-slate-900 mb-1">Dukungan Responsif Berbahasa Indonesia</h4>
                <p className="text-slate-600">
                  Tim teknis dan Customer Success Inka Company berbasis di Jakarta, siap membantu melalui Live Chat,
                  Email, dan pendampingan migrasi data master dari spreadsheet atau sistem ERP lama tanpa hambatan bahasa atau zona waktu.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'whitepaper' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-6 rounded-xl border border-slate-200 bg-slate-50 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">
                      Inka Company — Security & Compliance Architecture Brief 2026
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Dokumen resmi 18 halaman ringkasan arsitektur sistem untuk Tim IT Security & Audit Internal
                    </p>
                  </div>
                  <button
                    onClick={() => window.print()}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 font-bold flex items-center gap-1.5 shadow-xs transition"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak / Simpan PDF</span>
                  </button>
                </div>

                <div className="space-y-2 text-xs text-slate-600">
                  <p>
                    Dokumen ini merangkum secara lengkap topologi jaringan, manajemen kunci enkripsi KMS, protokol penanganan
                    insiden keamanan (Incident Response Plan), mekanisme pemisahan data penyewa (*tenant isolation*),
                    dan matriks hak akses kontrol peran (RBAC) pada platform pengadaan Inka Company.
                  </p>
                  <p>
                    Brosur ini siap dilampirkan dalam pengajuan komite pengadaan korporat (*Corporate Procurement Committee*)
                    dan penilaian vendor IT (*Vendor Risk Assessment*).
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-500 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Dokumentasi Kepatuhan Resmi Inka Company — Diperbarui Kuartal IV 2026</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
          >
            Tutup Pusat Keamanan
          </button>
        </div>
      </div>
    </div>
  );
};
