/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { Package, Plus, Search, X } from 'lucide-react';
import { formatRupiah } from '../common/StatusBadge';
import { CatalogItem } from '../../types/procurement';

export const CatalogView: React.FC = () => {
  const { catalogItems, addCatalogItem, organization } = useProcurement();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [sku, setSku] = useState(`ITEM-${Date.now().toString().slice(-4)}`);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Hardware');
  const [description, setDescription] = useState('');
  const [unit, setUnit] = useState('Unit');
  const [defaultPrice, setDefaultPrice] = useState<number>(1000000);

  const filteredItems = catalogItems.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.sku.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addCatalogItem({
      sku: sku.trim() || `ITEM-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      category,
      description: description.trim(),
      unit,
      defaultPrice: Math.max(0, defaultPrice),
      currency: organization.currency,
      status: 'active',
    });

    setName('');
    setDescription('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">
            Katalog Barang & Jasa Perusahaan
          </h1>
          <p className="text-xs text-slate-500">
            Daftar harga standar dan SKU terverifikasi untuk mempercepat penyusunan Purchase Request
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center gap-2 transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Item Katalog</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama barang, nomor SKU, atau kategori item..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Catalog Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Nama Barang & Deskripsi</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4 text-center">Satuan</th>
                <th className="py-3 px-4 text-right">Harga Patokan Standar</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4 font-mono font-bold text-slate-700">{item.sku}</td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{item.name}</div>
                    <div className="text-slate-500 text-[11px] truncate max-w-md">{item.description}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-medium text-slate-600">{item.unit}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                    {formatRupiah(item.defaultPrice, item.currency)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Aktif
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-xs animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h2 className="text-base font-extrabold text-slate-900">
                Tambah Item Katalog Master
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Nama Barang / Jasa <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Monitor LG 24 Inch IPS"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">SKU</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
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
                    <option value="Hardware">Hardware</option>
                    <option value="Furnitur">Furnitur</option>
                    <option value="Perlengkapan Kantor">Perlengkapan Kantor</option>
                    <option value="Cloud Services">Cloud Services</option>
                    <option value="Jasa Profesional">Jasa Profesional</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Satuan (Unit)</label>
                  <input
                    type="text"
                    placeholder="Pcs, Unit, Box, Bulan"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 text-xs text-center"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Harga Patokan (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={defaultPrice}
                    onChange={(e) => setDefaultPrice(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 rounded-lg border border-slate-300 text-xs font-mono text-right"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Spesifikasi Singkat</label>
                <textarea
                  rows={2}
                  placeholder="Keterangan garansi, model..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs"
                />
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
                  Simpan Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
