/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import {
  Building2,
  CheckCircle2,
  Layers,
  Save,
  Users2,
} from 'lucide-react';

export const OrganizationView: React.FC = () => {
  const {
    organization,
    updateOrganization,
    users,
    departments,
    costCenters,
    currentUser,
  } = useProcurement();

  const [name, setName] = useState(organization.name);
  const [address, setAddress] = useState(organization.address);
  const [taxNumber, setTaxNumber] = useState(organization.taxNumber);
  const [phone, setPhone] = useState(organization.phone);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveOrg = (e: React.FormEvent) => {
    e.preventDefault();
    updateOrganization({
      name,
      address,
      taxNumber,
      phone,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900">
          Pengaturan Organisasi & Struktur Tim
        </h1>
        <p className="text-xs text-slate-500">
          Konfigurasi identitas perusahaan tenant, departemen, pusat biaya, dan hak akses anggota
        </p>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Profil organisasi berhasil diperbarui dan tercatat pada audit trail!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Building2 className="w-5 h-5 text-blue-600" />
            <h2 className="font-extrabold text-sm text-slate-900">Profil Organisasi Tenant</h2>
          </div>

          <form onSubmit={handleSaveOrg} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Nama Resmi Perusahaan</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Kode Unik / Slug Tenant</label>
              <input
                type="text"
                disabled
                value={organization.slug}
                className="w-full p-2 rounded-lg border border-slate-200 bg-slate-100 text-slate-500 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Mata Uang Acuan Utama</label>
              <input
                type="text"
                disabled
                value={`${organization.currency} (Indonesian Rupiah)`}
                className="w-full p-2 rounded-lg border border-slate-200 bg-slate-100 text-slate-500 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">NPWP Perusahaan</label>
              <input
                type="text"
                value={taxNumber}
                onChange={(e) => setTaxNumber(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-300 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Nomor Telepon Kantor</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-300 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Alamat Kantor Pusat</label>
              <textarea
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-300 text-xs leading-relaxed"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan Organisasi</span>
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users2 className="w-5 h-5 text-blue-600" />
                <div>
                  <h2 className="font-extrabold text-sm text-slate-900">
                    Daftar Anggota & Wewenang Peran
                  </h2>
                  <p className="text-xs text-slate-400">
                    6 pengguna aktif terdaftar dengan simulasi peran RBAC
                  </p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">Nama Staf & Jabatan</th>
                    <th className="py-2.5 px-4">Email</th>
                    <th className="py-2.5 px-4">Peran (Role)</th>
                    <th className="py-2.5 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => {
                    const isCurrent = u.id === currentUser.id;
                    return (
                      <tr key={u.id} className={isCurrent ? 'bg-blue-50/50' : 'hover:bg-slate-50/50'}>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 flex items-center gap-2">
                            <span>{u.name}</span>
                            {isCurrent && (
                              <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.2 rounded font-bold">
                                Anda
                              </span>
                            )}
                          </div>
                          <div className="text-slate-500 text-[11px]">{u.jobTitle}</div>
                        </td>

                        <td className="py-3 px-4 font-mono text-slate-600 text-[11px]">{u.email}</td>

                        <td className="py-3 px-4">
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                            {u.role}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Aktif
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
            <h3 className="font-extrabold text-sm text-slate-900 mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Departemen & Pusat Biaya (Cost Centers)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {departments.map((dept) => {
                const ccs = costCenters.filter((c) => c.departmentId === dept.id);
                return (
                  <div key={dept.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900">{dept.name}</span>
                      <span className="font-mono text-[11px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded">
                        {dept.code}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 mt-2">
                      <span className="font-semibold text-slate-700 block mb-1">Pusat Biaya:</span>
                      {ccs.length > 0 ? (
                        <ul className="space-y-0.5 pl-3 list-disc">
                          {ccs.map((cc) => (
                            <li key={cc.id}>
                              {cc.name} ({cc.code})
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="italic text-slate-400">Pusat biaya umum</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
