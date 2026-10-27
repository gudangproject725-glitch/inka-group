/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import {
  Bell,
  Building2,
  CheckCircle,
  ChevronDown,
  Globe,
  RotateCcw,
  Shield,
  ShieldAlert,
  UserCheck,
  X,
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isPublicView: boolean;
  setIsPublicView: (val: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  isPublicView,
  setIsPublicView,
}) => {
  const {
    organization,
    currentUser,
    users,
    setCurrentUserById,
    notifications,
    markNotificationRead,
    clearAllNotifications,
    resetToDefaultData,
    purchaseRequests,
  } = useProcurement();

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);

  const unreadNotifs = notifications.filter((n) => !n.read);

  // Calculate pending items requiring current user's approval
  const myPendingApprovals = purchaseRequests.filter((pr) => {
    if (pr.status !== 'pending_approval') return false;
    if (pr.requesterId === currentUser.id) return false; // Self-approval blocked
    const currentStep = pr.approvalInstances.find((s) => s.stepOrder === pr.currentStepOrder);
    if (!currentStep || currentStep.status !== 'pending') return false;
    return (
      currentStep.requiredRole === currentUser.role ||
      currentStep.assignedUserId === currentUser.id ||
      currentUser.role === 'organization_admin'
    );
  });

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      {/* Top Notification Bar for Simulation / Persona Switcher */}
      <div className="bg-slate-900 text-white px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-semibold border border-blue-400/30">
            <Shield className="w-3.5 h-3.5" />
            B2B Multi-Tenant Simulation
          </span>
          <span className="text-slate-400 hidden sm:inline">
            Organisasi: <strong className="text-white">{organization.name}</strong> ({organization.currency})
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Persona Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-2.5 py-1 rounded border border-slate-700 transition"
              aria-label="Ganti simulasi pengguna dan peran"
            >
              <UserCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>
                Simulasi Peran: <strong className="text-white">{currentUser.name}</strong> ({currentUser.role})
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-1.5 w-80 bg-white rounded-lg shadow-xl border border-slate-200 py-1.5 text-slate-800 z-50">
                <div className="px-3 py-2 border-b border-slate-100 bg-slate-50 text-[11px] text-slate-500 font-medium">
                  Pilih Pengguna untuk Menguji Hak Akses & Workflow
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {users.map((u) => {
                    const isSelected = u.id === currentUser.id;
                    return (
                      <button
                        key={u.id}
                        onClick={() => {
                          setCurrentUserById(u.id);
                          setShowUserDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 hover:bg-blue-50 flex items-start gap-2.5 transition ${
                          isSelected ? 'bg-blue-50/70 border-l-4 border-blue-600' : ''
                        }`}
                      >
                        <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 shrink-0">
                          {u.name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-xs text-slate-900 flex items-center justify-between">
                            <span className="truncate">{u.name}</span>
                            <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                              {u.role}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 truncate">{u.jobTitle}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Reset Demo Data Button */}
          <button
            onClick={() => {
              if (resetConfirm) {
                resetToDefaultData();
                setResetConfirm(false);
              } else {
                setResetConfirm(true);
                setTimeout(() => setResetConfirm(false), 4000);
              }
            }}
            className={`flex items-center gap-1.5 px-2 py-1 rounded transition text-xs ${
              resetConfirm
                ? 'bg-rose-600 text-white font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Reset ulang data simulasi ke awal"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{resetConfirm ? 'Klik Sekali Lagi' : 'Reset Demo'}</span>
          </button>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Mode Toggle */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => {
              setIsPublicView(false);
              setCurrentTab('dashboard');
            }}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <span className="font-black text-lg tracking-wider">IK</span>
            </div>
            <div>
              <div className="font-extrabold text-slate-900 tracking-tight leading-none text-base group-hover:text-blue-600 transition">
                Inka Company
              </div>
              <div className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">
                B2B Procurement SaaS
              </div>
            </div>
          </button>

          {/* View switcher between Marketing and SaaS Portal */}
          <div className="hidden md:flex items-center p-1 bg-slate-100 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setIsPublicView(true)}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition ${
                isPublicView
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              Website & Fitur
            </button>
            <button
              onClick={() => setIsPublicView(false)}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition ${
                !isPublicView
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              SaaS Workspace
            </button>
          </div>
        </div>

        {/* Right Side: Quick Action, Pending Approvals Pill & Notifications */}
        <div className="flex items-center gap-3">
          {/* Pending Approval Badge if any */}
          {!isPublicView && myPendingApprovals.length > 0 && (
            <button
              onClick={() => setCurrentTab('approvals')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-300 hover:bg-amber-100 transition animate-bounce"
            >
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>{myPendingApprovals.length} Menunggu Approval Anda</span>
            </button>
          )}

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 relative transition"
              aria-label="Notifikasi dalam aplikasi"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifs.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadNotifs.length}
                </span>
              )}
            </button>

            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-800">Notifikasi</span>
                  {unreadNotifs.length > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="text-xs text-blue-600 hover:underline font-medium"
                    >
                      Tandai semua dibaca
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      Tidak ada notifikasi baru.
                    </div>
                  ) : (
                    notifications.slice(0, 8).map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => markNotificationRead(notif.id)}
                        className={`p-3 hover:bg-slate-50 transition cursor-pointer text-xs ${
                          !notif.read ? 'bg-blue-50/50' : ''
                        }`}
                      >
                        <div className="font-semibold text-slate-900 mb-0.5 flex items-center justify-between">
                          <span>{notif.title}</span>
                          {!notif.read && (
                            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                          )}
                        </div>
                        <div className="text-slate-600 leading-relaxed mb-1">{notif.message}</div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(notif.createdAt).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shadow-xs">
              {currentUser.name[0]}
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-bold text-slate-800 leading-tight">{currentUser.name}</div>
              <div className="text-[11px] text-slate-500 capitalize">{currentUser.role.replace('_', ' ')}</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
