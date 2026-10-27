/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import {
  AlertTriangle,
  Building2,
  CheckCircle,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  GitBranch,
  History,
  Home,
  Layers,
  LogOut,
  Package,
  PieChart,
  Scale,
  Settings,
  Shield,
  ShieldAlert,
  ShoppingCart,
  Store,
  Tag,
  Truck,
  UserCheck,
  Users,
  Wallet,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onOpenPublicSite: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  onOpenPublicSite,
}) => {
  const {
    organization,
    purchaseRequests,
    purchaseOrders,
    currentUser,
    anomalies,
    rfqs,
  } = useProcurement();

  // Calculate pending items
  const pendingApprovalsCount = purchaseRequests.filter(
    (pr) => pr.status === 'pending_approval' && pr.requesterId !== currentUser.id
  ).length;

  const activeAnomaliesCount = anomalies.filter((a) => !a.dismissed && a.severity === 'high').length;

  const navSections = [
    {
      title: 'OPERASIONAL PENGADAAN',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard Eksekutif',
          icon: Home,
        },
        {
          id: 'requests',
          label: 'Purchase Requests (PR)',
          icon: FileText,
          badge: purchaseRequests.length,
        },
        {
          id: 'approvals',
          label: 'Inbox Persetujuan',
          icon: CheckCircle,
          badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
          badgeColor: 'bg-amber-500 text-white',
        },
        {
          id: 'orders',
          label: 'Purchase Orders (PO)',
          icon: ShoppingCart,
          badge: purchaseOrders.length,
        },
        {
          id: 'matching',
          label: '3-Way Matching Otomatis',
          icon: FileCheck2,
          isNew: true,
        },
        {
          id: 'rfq',
          label: '3-Way RFQ Tender',
          icon: Scale,
          badge: rfqs.length,
          isNew: true,
        },
      ],
    },
    {
      title: 'MITRA & REKANAN',
      items: [
        {
          id: 'suppliers',
          label: 'Master Rekanan / Vendor',
          icon: Store,
        },
        {
          id: 'vendor-portal',
          label: 'Portal Vendor Mandiri',
          icon: UserCheck,
          isNew: true,
        },
        {
          id: 'catalog',
          label: 'Katalog Barang & Jasa',
          icon: Package,
        },
      ],
    },
    {
      title: 'TATA KELOLA & KONTROL',
      items: [
        {
          id: 'budgets',
          label: 'Anggaran & Pagu Biaya',
          icon: Wallet,
        },
        {
          id: 'fraud',
          label: 'Deteksi Fraud & Risiko',
          icon: ShieldAlert,
          badge: activeAnomaliesCount > 0 ? activeAnomaliesCount : undefined,
          badgeColor: 'bg-rose-600 text-white animate-pulse',
          isNew: true,
        },
        {
          id: 'workflows',
          label: 'Aturan Alur Persetujuan',
          icon: GitBranch,
        },
        {
          id: 'audit',
          label: 'Audit Trail Permanen',
          icon: History,
        },
        {
          id: 'organization',
          label: 'Profil & Izin Organisasi',
          icon: Building2,
        },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col h-screen select-none shrink-0 no-print">
      {/* Brand & Workspace Context */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-black shadow-md shadow-blue-500/20 text-sm">
            IK
          </div>
          <div>
            <div className="font-extrabold text-white text-sm tracking-tight flex items-center gap-1.5">
              <span>Inka Company</span>
              <span className="text-[9px] uppercase px-1.5 py-0.5 rounded-sm bg-blue-500/20 text-blue-400 font-mono font-bold">
                B2B
              </span>
            </div>
            <div className="text-[11px] text-slate-400 truncate max-w-[140px]" title={organization.name}>
              {organization.name}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <div className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2">
              {section.title}
            </div>
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    {item.isNew && !item.badge && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-sm bg-indigo-500/30 text-indigo-300">
                        BARU
                      </span>
                    )}
                    {item.badge !== undefined && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.badgeColor || (isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300')
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer Info & Public Landing Switch */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40 space-y-2">
        <button
          onClick={onOpenPublicSite}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-bold transition border border-slate-700/60"
        >
          <Layers className="w-3.5 h-3.5 text-blue-400" />
          <span>Lihat Halaman Website</span>
        </button>

        <div className="px-2 pt-1 flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span>v2.2.0 Enterprise</span>
          <span>Jakarta Tier-IV DC</span>
        </div>
      </div>
    </aside>
  );
};
