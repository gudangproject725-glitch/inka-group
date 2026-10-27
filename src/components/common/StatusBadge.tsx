/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { POStatus, PRStatus } from '../../types/procurement';
import { CheckCircle2, Clock, XCircle, FileText, ArrowRightCircle, AlertCircle, Ban } from 'lucide-react';

export const formatRupiah = (amount: number, currency: string = 'IDR'): string => {
  if (currency === 'IDR') {
    return `Rp ${Math.round(amount).toLocaleString('id-ID')}`;
  }
  return `${currency} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
};

export const PRStatusBadge: React.FC<{ status: PRStatus }> = ({ status }) => {
  switch (status) {
    case 'draft':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
          <FileText className="w-3.5 h-3.5 text-slate-500" />
          Draft
        </span>
      );
    case 'pending_approval':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          Menunggu Approval
        </span>
      );
    case 'approved':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Disetujui (Approved)
        </span>
      );
    case 'rejected':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <XCircle className="w-3.5 h-3.5 text-rose-600" />
          Ditolak (Rejected)
        </span>
      );
    case 'converted_to_po':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <ArrowRightCircle className="w-3.5 h-3.5 text-blue-600" />
          Telah Diterbitkan ke PO
        </span>
      );
    case 'cancelled':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
          <Ban className="w-3.5 h-3.5 text-slate-400" />
          Dibatalkan
        </span>
      );
    default:
      return null;
  }
};

export const POStatusBadge: React.FC<{ status: POStatus }> = ({ status }) => {
  switch (status) {
    case 'draft':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
          <FileText className="w-3.5 h-3.5 text-slate-500" />
          Draft PO
        </span>
      );
    case 'issued':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
          Resmi Diterbitkan
        </span>
      );
    case 'sent_to_supplier':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <Clock className="w-3.5 h-3.5 text-blue-600" />
          Terkirim ke Pemasok
        </span>
      );
    case 'partially_received':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
          <AlertCircle className="w-3.5 h-3.5 text-purple-600" />
          Diterima Sebagian
        </span>
      );
    case 'completed':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Selesai (Completed)
        </span>
      );
    case 'cancelled':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
          <Ban className="w-3.5 h-3.5 text-rose-600" />
          Dibatalkan
        </span>
      );
    default:
      return null;
  }
};
