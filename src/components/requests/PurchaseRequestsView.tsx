/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import {
  CheckCircle2,
  Clock,
  Filter,
  Plus,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import { PurchaseRequest, PRStatus } from '../../types/procurement';
import { formatRupiah, PRStatusBadge } from '../common/StatusBadge';

interface PurchaseRequestsViewProps {
  onOpenCreateModal: () => void;
  onSelectPr: (pr: PurchaseRequest) => void;
}

export const PurchaseRequestsView: React.FC<PurchaseRequestsViewProps> = ({
  onOpenCreateModal,
  onSelectPr,
}) => {
  const { purchaseRequests, departments, organization } = useProcurement();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDept, setSelectedDept] = useState<string>('all');

  const statusTabs = [
    { id: 'all', label: 'Semua Status', count: purchaseRequests.length },
    {
      id: 'pending_approval',
      label: 'Menunggu Approval',
      count: purchaseRequests.filter((p) => p.status === 'pending_approval').length,
    },
    {
      id: 'approved',
      label: 'Disetujui (Approved)',
      count: purchaseRequests.filter((p) => p.status === 'approved').length,
    },
    {
      id: 'converted_to_po',
      label: 'Sudah Jadi PO',
      count: purchaseRequests.filter((p) => p.status === 'converted_to_po').length,
    },
    {
      id: 'rejected',
      label: 'Ditolak',
      count: purchaseRequests.filter((p) => p.status === 'rejected').length,
    },
    {
      id: 'draft',
      label: 'Draft',
      count: purchaseRequests.filter((p) => p.status === 'draft').length,
    },
  ];

  const filteredPrs = purchaseRequests.filter((pr) => {
    // Status check
    if (selectedStatus !== 'all' && pr.status !== selectedStatus) return false;

    // Dept check
    if (selectedDept !== 'all' && pr.departmentId !== selectedDept) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNumber = pr.requestNumber.toLowerCase().includes(q);
      const matchPurpose = pr.purpose.toLowerCase().includes(q);
      const matchRequester = pr.requesterName.toLowerCase().includes(q);
      if (!matchNumber && !matchPurpose && !matchRequester) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">
            Daftar Purchase Request (PR)
          </h1>
          <p className="text-xs text-slate-500">
            Pusat pengelolaan dan pelacakan seluruh permintaan barang dan jasa dalam organisasi
          </p>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center gap-2 transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Purchase Request</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
        {statusTabs.map((tab) => {
          const isActive = selectedStatus === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-3 py-2 rounded-xl whitespace-nowrap transition flex items-center gap-2 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-blue-800 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Department Selector */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari berdasarkan nomor PR (PR-2026-...), keperluan, atau nama staf..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full sm:w-48 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="all">Semua Departemen</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* PR Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">No. Dokumen & Keperluan</th>
                <th className="py-3 px-4">Pemohon & Departemen</th>
                <th className="py-3 px-4">Tanggal Pengajuan</th>
                <th className="py-3 px-4">Nilai Estimasi</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPrs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Tidak ada Purchase Request yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredPrs.map((pr) => {
                  const dept = departments.find((d) => d.id === pr.departmentId);
                  return (
                    <tr
                      key={pr.id}
                      onClick={() => onSelectPr(pr)}
                      className="hover:bg-slate-50/70 transition cursor-pointer"
                    >
                      <td className="py-3 px-4">
                        <div className="font-extrabold text-slate-900 font-mono text-xs flex items-center gap-1.5">
                          <span>{pr.requestNumber}</span>
                        </div>
                        <div className="text-slate-600 text-[11px] truncate max-w-sm font-medium mt-0.5">
                          {pr.purpose}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{pr.requesterName}</div>
                        <div className="text-slate-400 text-[10px]">{dept?.name || 'Umum'}</div>
                      </td>

                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {new Date(pr.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      <td className="py-3 px-4 font-extrabold text-slate-900 font-mono">
                        {formatRupiah(pr.grandTotal, pr.currency)}
                      </td>

                      <td className="py-3 px-4">
                        <PRStatusBadge status={pr.status} />
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectPr(pr);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 font-semibold text-[11px] transition"
                        >
                          Lihat Detail
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Menampilkan <strong>{filteredPrs.length}</strong> dokumen dari total {purchaseRequests.length}
          </span>
          <span className="font-mono text-[11px]">PT Inka Nusantara Teknologi</span>
        </div>
      </div>
    </div>
  );
};
