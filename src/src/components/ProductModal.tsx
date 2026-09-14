import React, { useState, useEffect } from 'react';
import { Product, Vendor } from '../types';
import { X, Check } from 'lucide-react';

interface ProductModalProps {
  product: Product | null;
  vendors: Vendor[];
  onClose: () => void;
  onSave: (product: Product) => void;
}

export default function ProductModal({ product, vendors, onClose, onSave }: ProductModalProps) {
  const [formData, setFormData] = useState<Partial<Product>>({
    code: '',
    name: '',
    spec: '',
    unit: '式',
    costPrice: 0,
    standardPrice: 0,
    vendorId: ''
  });

  useEffect(() => {
    if (product) {
      setFormData(product);
    } else {
      setFormData({
        id: 'prod-' + Date.now(),
        code: 'PROD-' + Math.floor(100 + Math.random() * 900),
        name: '',
        spec: '',
        unit: '式',
        costPrice: 0,
        standardPrice: 0,
        vendorId: vendors[0]?.id || ''
      });
    }
  }, [product, vendors]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      alert('請填寫產品品名');
      return;
    }
    onSave(formData as Product);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 className="text-lg font-bold text-slate-900">
            {product ? '編輯產品資料' : '新增產品項目'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">產品編號 *</label>
              <input
                type="text"
                required
                value={formData.code || ''}
                onChange={e => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">品名規格 *</label>
              <input
                type="text"
                required
                placeholder="例: 企業級私有雲叢集建置"
                value={formData.name || ''}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">詳細規格說明</label>
            <input
              type="text"
              placeholder="例: 雙節點容錯轉移 / 包含備援設定"
              value={formData.spec || ''}
              onChange={e => setFormData({ ...formData, spec: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">計量單位</label>
              <input
                type="text"
                value={formData.unit || '式'}
                onChange={e => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">進貨成本 (未稅)</label>
              <input
                type="number"
                value={formData.costPrice || 0}
                onChange={e => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">標準售價 (未稅)</label>
              <input
                type="number"
                value={formData.standardPrice || 0}
                onChange={e => setFormData({ ...formData, standardPrice: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-indigo-600"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
            >
              <Check className="w-4 h-4 mr-1.5" /> 儲存產品
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
