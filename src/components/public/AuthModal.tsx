/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { UserCheck, X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  mode: 'login' | 'register';
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  mode,
  onClose,
  onSuccess,
}) => {
  const { users, setCurrentUserById, updateOrganization } = useProcurement();

  const [authMode, setAuthMode] = useState<'login' | 'register'>(mode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');

  if (!isOpen) return null;

  const handleQuickLogin = (userId: string) => {
    setCurrentUserById(userId);
    onSuccess();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === 'register' && companyName.trim()) {
      updateOrganization({ name: companyName.trim() });
    }
    setCurrentUserById(users[0].id);
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-xs animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
              IK
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                {authMode === 'login' ? 'Masuk ke Inka Company' : 'Daftarkan Workspace Baru'}
              </h2>
              <p className="text-[11px] text-slate-400">Platform SaaS B2B Procurement Modern</p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1-Click Persona Simulator Selector */}
        <div className="mb-6 p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-900 space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-xs text-blue-800">
            <UserCheck className="w-4 h-4 text-blue-600" />
            <span>Pilih Cepat Akun Simulasi (1-Click Demo Login):</span>
          </div>
          <div className="space-y-1.5">
            {users.slice(0, 4).map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => handleQuickLogin(u.id)}
                className="w-full text-left p-2 rounded-lg bg-white border border-blue-200 hover:border-blue-400 hover:shadow-xs flex items-center justify-between transition"
              >
                <div>
                  <div className="font-bold text-slate-900 text-xs">{u.name}</div>
                  <div className="text-[10px] text-slate-500">{u.jobTitle}</div>
                </div>
                <span className="font-mono text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                  {u.role}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Standard Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {authMode === 'register' && (
            <>
              <div>
                <label className="block font-bold text-slate-800 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="Nama Anda"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-800 mb-1">Nama Perusahaan / Organisasi</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: PT Surya Niaga Mandiri"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
                />
              </div>
            </>
          )}

          <div>
            <label className="block font-bold text-slate-800 mb-1">Email Perusahaan</label>
            <input
              type="email"
              required
              placeholder="user@inka.co.id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">Kata Sandi (Password)</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition"
          >
            {authMode === 'login' ? 'Masuk ke Workspace' : 'Daftar & Buat Workspace'}
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
          {authMode === 'login' ? (
            <span>
              Belum memiliki akun?{' '}
              <button
                onClick={() => setAuthMode('register')}
                className="text-blue-600 font-bold hover:underline"
              >
                Daftar sekarang
              </button>
            </span>
          ) : (
            <span>
              Sudah memiliki akun?{' '}
              <button
                onClick={() => setAuthMode('login')}
                className="text-blue-600 font-bold hover:underline"
              >
                Masuk di sini
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
