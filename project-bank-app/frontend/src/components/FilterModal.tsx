import React, { useState } from 'react';
import { X, Calendar, Search, Filter } from 'lucide-react';
import Button from './shared/Button';

interface FilterModalProps {
  onClose: () => void;
  onApply: (filters: FilterCriteria) => void;
  currentFilters: FilterCriteria;
}

export interface FilterCriteria {
  searchTerm: string;
  minAmount: string;
  maxAmount: string;
  type: 'all' | 'deposit' | 'withdrawal';
  startDate: string;
  endDate: string;
}

const FilterModal: React.FC<FilterModalProps> = ({ onClose, onApply, currentFilters }) => {
  const [filters, setFilters] = useState<FilterCriteria>(currentFilters);

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const resetFilters = () => {
    const reset = {
      searchTerm: '',
      minAmount: '',
      maxAmount: '',
      type: 'all' as const,
      startDate: '',
      endDate: '',
    };
    setFilters(reset);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="text-xl font-bold text-blue-950 flex items-center">
            <Filter className="mr-2 text-blue-600" size={20} /> İşlemleri Filtrele
          </h3>
          <button onClick={onClose} className=" bg-gray-300 p-2 hover:bg-gray-400 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          {/* Arama Kutusu */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest ml-1">İşlem Adı</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <input
                type="text"
                placeholder="Market, Kira, Maaş..."
                className="w-full pl-12 pr-4 py-3 bg-gray-100 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
                value={filters.searchTerm}
                onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
              />
            </div>
          </div>

          {/* Tutar Aralığı */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest ml-1">Min. Tutar (₺)</label>
              <input
                type="number"
                placeholder="0"
                className="w-full px-4 py-3 bg-gray-100 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
                value={filters.minAmount}
                onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest ml-1">Max. Tutar (₺)</label>
              <input
                type="number"
                placeholder="Örn: 5000"
                className="w-full px-4 py-3 bg-gray-100 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
                value={filters.maxAmount}
                onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value })}
              />
            </div>
          </div>

          {/* İşlem Tipi */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest ml-1">İşlem Tipi</label>
            <div className="flex bg-gray-100 p-1 rounded-2xl">
              {(['all', 'deposit', 'withdrawal'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilters({ ...filters, type: t })}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                    filters.type === t ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'
                  }`}
                >
                  {t === 'all' ? 'Tümü' : t === 'deposit' ? 'Yatan' : 'Çekilen'}
                </button>
              ))}
            </div>
          </div>

          {/* Tarih Aralığı */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest ml-1 text-nowrap">Başlangıç</label>
              <input
                type="date"
                className="w-full px-4 py-3 bg-gray-100 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-500"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest ml-1 text-nowrap">Bitiş</label>
              <input
                type="date"
                className="w-full px-4 py-3 bg-gray-100 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-500"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-50 flex gap-4">
          <button onClick={resetFilters} className="flex-1 py-4 text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors">
            Temizle
          </button>
          <div className="flex-[2]">
            <Button text="Filtreleri Uygula" onClick={handleApply} fullWidth className="rounded-2xl py-4" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;