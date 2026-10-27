/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { Plus, Search, X } from 'lucide-react';
import { Supplier } from '../../types/procurement';

export const SuppliersView: React.FC = () => {
  const { suppliers, addSupplier } = useProcurement();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [code, setCode] = useState(`SUP-00${suppliers.length + 1}`);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('Perangkat IT & Komputer');
  const [address, setAddress] = useState('');
  const [taxId, setTaxId] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('Net 30 Days');

  const filteredSuppliers = suppliers.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.code.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q)
    );
  });

  const handleCreateSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addSupplier({
      code: code || `SUP-00${suppliers.length + 1}`,
      name: name.trim(),
      email: email.trim() || 'vendor@example.com',
      phone: phone.trim() || '+62 (21) 500-0000',
      address: address.trim() || 'DKI Jakarta',
      category,
      taxId: taxId.trim() || '01.000.000.0-000.000',
      paymentTerms,
      status: 'active',
    });

    setName('');
    setEmail('');
    setPhone('');
    setAddress('');
    setTaxId('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">
            Daftar Mitra Pemasok (Suppliers & Vendors)
          </h1>
          <p className="text-xs text-slate-500">
            Kelola master vendor resmi, syarat pembayaran, NPWP, dan kontak operasional
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center gap-2 transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Pemasok Baru</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama vendor, kode supplier, atau kategori bisnis..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSuppliers.map((s) => (
          <div
            key={s.id}
            className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  {s.code}
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Aktif & Terverifikasi
                </span>
              </div>

              <h3 className="font-extrabold text-slate-900 text-sm mb-1">{s.name}</h3>
              <div className="text-xs text-blue-600 font-medium mb-3">{s.category}</div>

              <div className="space-y-2 text-xs text-slate-600 pt-3 border-t border-slate-100">
                <div className="flex items-start gap-2">
                  <span className="text-slate-400 min-w-[70px]">Alamat:</span>
                  <span className="text-slate-800 leading-tight">{s.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 min-w-[70px]">Email:</span>
                  <span className="text-slate-800 truncate">{s.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 min-w-[70px]">Telepon:</span>
                  <span className="text-slate-800 font-mono">{s.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 min-w-[70px]">NPWP:</span>
                  <span className="text-slate-800 font-mono text-[11px]">{s.taxId}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 text-[11px]">Syarat Bayar:</span>
              <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                {s.paymentTerms}
              </span>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 text-xs animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h2 className="text-base font-extrabold text-slate-900">
                Tambah Mitra Pemasok (Vendor) Baru
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSupplier} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Nama Perusahaan Vendor <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: PT Sumber Rezeki Mandiri"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Kode Pemasok</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-white"
                  >
                    <option value="Perangkat IT & Komputer">Perangkat IT & Komputer</option>
                    <option value="Furnitur & Perlengkapan Kantor">Furnitur & Perlengkapan</option>
                    <option value="Layanan Cloud & Hosting">Layanan Cloud & Hosting</option>
                    <option value="Percetakan & Merchandise">Percetakan & Merchandise</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Email Penjualan / Billing</label>
                  <input
                    type="email"
                    placeholder="sales@vendor.co.id"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Nomor Telepon</label>
                  <input
                    type="text"
                    placeholder="+62 (21) ..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Alamat Kantor / Gudang</label>
                <textarea
                  rows={2}
                  placeholder="Alamat lengkap..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">NPWP Perusahaan</label>
                  <input
                    type="text"
                    placeholder="01.234.567.8-012.000"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Syarat Pembayaran</label>
                  <select
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-white"
                  >
                    <option value="Net 14 Days">Net 14 Days</option>
                    <option value="Net 30 Days">Net 30 Days</option>
                    <option value="Net 60 Days">Net 60 Days</option>
                    <option value="Cash Before Delivery">Cash Before Delivery</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-xs"
                >
                  Simpan Pemasok
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
