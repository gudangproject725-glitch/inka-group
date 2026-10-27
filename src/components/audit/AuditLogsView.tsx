/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { Filter, History, Lock, Search } from 'lucide-react';

export const AuditLogsView: React.FC = () => {
  const { auditLogs, organization } = useProcurement();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<string>('all');

  const filteredLogs = auditLogs.filter((log) => {
    if (selectedEntity !== 'all' && log.entityType !== selectedEntity) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchActor = log.actorName.toLowerCase().includes(q);
      const matchAction = log.action.toLowerCase().includes(q);
      const matchRef = log.entityReference.toLowerCase().includes(q);
      const matchDetails = log.details.toLowerCase().includes(q);
      if (!matchActor && !matchAction && !matchRef && !matchDetails) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">
            Jejak Audit Keamanan (Audit Trail)
          </h1>
          <p className="text-xs text-slate-500">
            Catatan kekal (append-only) seluruh transaksi, keputusan approval, dan perubahan data penting
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl">
          <Lock className="w-3.5 h-3.5 text-emerald-600" />
          <span>Sifat: Immutable (Tidak Dapat Dimodifikasi)</span>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari berdasarkan nomor dokumen (PR/PO), nama pengambil keputusan, atau aksi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedEntity}
            onChange={(e) => setSelectedEntity(e.target.value)}
            className="w-full sm:w-56 px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Semua Jenis Entitas</option>
            <option value="purchase_request">Purchase Request</option>
            <option value="purchase_order">Purchase Order</option>
            <option value="supplier">Pemasok (Vendor)</option>
            <option value="workflow">Workflow Rules</option>
            <option value="organization">Organisasi</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Waktu (WIB)</th>
                <th className="py-3 px-4">Aktor & Peran</th>
                <th className="py-3 px-4">Aksi Dilakukan</th>
                <th className="py-3 px-4">Referensi Entitas</th>
                <th className="py-3 px-4 min-w-[260px]">Rincian & Catatan Transaksi</th>
                <th className="py-3 px-4 text-right">Alamat IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Tidak ada catatan audit yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{log.actorName}</div>
                      <div className="text-[10px] text-slate-400 uppercase font-mono">{log.actorRole}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-bold text-blue-700 font-mono text-xs">
                      {log.entityReference}
                    </td>

                    <td className="py-3 px-4 text-slate-700 leading-relaxed font-normal">
                      {log.details}
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-slate-400 text-[11px]">
                      {log.ipAddress}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-400">
          Semua catatan waktu tersinkronisasi dengan stempel waktu UTC terverifikasi
        </div>
      </div>
    </div>
  );
};
