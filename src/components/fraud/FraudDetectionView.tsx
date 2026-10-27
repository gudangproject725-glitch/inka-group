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
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  FileCheck2,
  History,
  Info,
  Layers,
  PieChart,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  X,
  Zap,
} from 'lucide-react';
import { formatRupiah } from '../common/StatusBadge';
import { ProcurementAnomaly } from '../../types/procurement';

export const FraudDetectionView: React.FC = () => {
  const { anomalies, dismissAnomaly, refreshAnomalies, currentUser } = useProcurement();

  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [selectedAnomaly, setSelectedAnomaly] = useState<ProcurementAnomaly | null>(null);
  const [dismissReason, setDismissReason] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const handleRunScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      refreshAnomalies();
      setIsScanning(false);
    }, 600);
  };

  const handleOpenDismissModal = (anomaly: ProcurementAnomaly) => {
    setSelectedAnomaly(anomaly);
    setDismissReason(
      `Telah diverifikasi oleh ${currentUser.name} (${currentUser.jobTitle}): Transaksi telah diklarifikasi sah secara operasional.`
    );
  };

  const handleConfirmDismiss = () => {
    if (!selectedAnomaly) return;
    dismissAnomaly(selectedAnomaly.id, dismissReason);
    setSelectedAnomaly(null);
  };

  // Filter anomalies
  const filtered = anomalies.filter((a) => {
    if (filterSeverity === 'active') return !a.dismissed;
    if (filterSeverity === 'dismissed') return a.dismissed;
    if (filterSeverity === 'high') return a.severity === 'high' && !a.dismissed;
    if (filterSeverity === 'medium') return a.severity === 'medium' && !a.dismissed;
    return true;
  });

  const activeHighCount = anomalies.filter((a) => a.severity === 'high' && !a.dismissed).length;
  const activeMediumCount = anomalies.filter((a) => a.severity === 'medium' && !a.dismissed).length;
  const dismissedCount = anomalies.filter((a) => a.dismissed).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-lg bg-rose-100 text-rose-800">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Deteksi Anomali & Pencegahan Fraud Pengadaan
            </h1>
          </div>
          <p className="text-sm text-slate-600">
            Pemindaian otomatis berbasis aturan kepatuhan: mendeteksi indikasi pemecahan PR (*Split PR*), konsentrasi vendor, dan transaksi rekanan belum terverifikasi.
          </p>
        </div>

        <button
          onClick={handleRunScan}
          disabled={isScanning}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition shrink-0 disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
          <span>{isScanning ? 'Memindai Database...' : 'Pindai Ulang Anomali'}</span>
        </button>
      </div>

      {/* Threat Radar Scorecards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Threat Meter */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Level Risiko Sistem
            </span>
            <div className="text-xl font-black text-slate-900 mt-1 flex items-center gap-1.5">
              {activeHighCount > 0 ? (
                <>
                  <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
                  <span className="text-rose-600">Perhatian Tinggi</span>
                </>
              ) : activeMediumCount > 0 ? (
                <>
                  <span className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="text-amber-600">Sedang</span>
                </>
              ) : (
                <>
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-emerald-600">Aman & Terkendali</span>
                </>
              )}
            </div>
            <span className="text-[11px] text-slate-500">Berdasarkan 4 modul audit</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        {/* High Severity */}
        <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-xs flex items-center justify-between bg-linear-to-br from-white to-rose-50/40">
          <div>
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider block">
              Anomali Kritis (High)
            </span>
            <div className="text-2xl font-black text-rose-950 mt-1">{activeHighCount}</div>
            <span className="text-[11px] text-rose-600 font-medium">Memerlukan mitigasi audit</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Medium Severity */}
        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-xs flex items-center justify-between bg-linear-to-br from-white to-amber-50/40">
          <div>
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block">
              Peringatan (Medium)
            </span>
            <div className="text-2xl font-black text-amber-950 mt-1">{activeMediumCount}</div>
            <span className="text-[11px] text-amber-600 font-medium">Konsentrasi & dokumen</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Resolved Anomaly */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Telah Dimutakhirkan
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">{dismissedCount}</div>
            <span className="text-[11px] text-emerald-600 font-medium">Terdokumentasi di log audit</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'all', label: `Semua Temuan (${anomalies.length})` },
            { id: 'active', label: `Aktif (${activeHighCount + activeMediumCount})` },
            { id: 'high', label: `Risiko Tinggi (${activeHighCount})` },
            { id: 'medium', label: `Risiko Sedang (${activeMediumCount})` },
            { id: 'dismissed', label: `Diselesaikan (${dismissedCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterSeverity(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                filterSeverity === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-1">
          <Info className="w-4 h-4 text-blue-600" />
          <span>Pemindaian aktif otomatis setiap ada PR/PO baru.</span>
        </div>
      </div>

      {/* Anomalies List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
            <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">Tidak Ditemukan Indikasi Fraud</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Seluruh transaksi Purchase Request, Purchase Order, dan rekanan saat ini berada dalam koridor kepatuhan normal.
            </p>
          </div>
        ) : (
          filtered.map((anomaly) => {
            const isHigh = anomaly.severity === 'high';
            const isDismissed = anomaly.dismissed;

            return (
              <div
                key={anomaly.id}
                className={`p-5 rounded-2xl border shadow-xs transition relative overflow-hidden ${
                  isDismissed
                    ? 'bg-slate-50 border-slate-200 opacity-70'
                    : isHigh
                    ? 'bg-white border-rose-300 ring-1 ring-rose-500/20'
                    : 'bg-white border-amber-300'
                }`}
              >
                <div
                  className={`absolute top-0 left-0 bottom-0 w-1.5 ${
                    isDismissed ? 'bg-slate-300' : isHigh ? 'bg-rose-600' : 'bg-amber-500'
                  }`}
                />

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1 pl-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          isDismissed
                            ? 'bg-slate-200 text-slate-700'
                            : isHigh
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {isDismissed
                          ? 'SUDAH DISELESAIKAN'
                          : isHigh
                          ? 'HIGH RISK ANOMALY'
                          : 'MEDIUM RISK'}
                      </span>

                      <span className="font-mono text-xs font-bold text-slate-700">
                        Entitas: {anomaly.entityNumber}
                      </span>

                      <span className="text-[11px] text-slate-400">
                        Terdeteksi: {new Date(anomaly.detectedAt).toLocaleString('id-ID')}
                      </span>
                    </div>

                    <h3 className="text-sm font-black text-slate-900">{anomaly.title}</h3>

                    <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                      {anomaly.description}
                    </p>

                    {isDismissed && anomaly.dismissedReason && (
                      <div className="mt-2 p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-start gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <strong>Diselesaikan oleh {anomaly.dismissedBy}:</strong> {anomaly.dismissedReason}
                        </div>
                      </div>
                    )}
                  </div>

                  {!isDismissed && (
                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                      <button
                        onClick={() => handleOpenDismissModal(anomaly)}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition shadow-xs flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Klarifikasi & Selesaikan</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Klarifikasi Anomali */}
      {selectedAnomaly && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Klarifikasi Temuan Risiko</h3>
                  <p className="text-xs text-slate-500 font-mono">{selectedAnomaly.entityNumber}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAnomaly(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 mb-4 text-xs space-y-1">
              <p className="font-bold text-slate-900">{selectedAnomaly.title}</p>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Tindakan ini akan mencatat justifikasi sah Anda ke dalam log audit kepatuhan permanen.
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Catatan Justifikasi Pemeriksa (Wajib Audit):
              </label>
              <textarea
                rows={3}
                required
                value={dismissReason}
                onChange={(e) => setDismissReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedAnomaly(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDismiss}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
              >
                Simpan & Tandai Aman
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
