import React, { useState, useEffect } from 'react';
import { Vendor } from '../types';
import { X, Check } from 'lucide-react';

interface VendorModalProps {
  vendor: Vendor | null;
  onClose: () => void;
  onSave: (vendor: Vendor) => void;
}

export default function VendorModal({ vendor, onClose, onSave }: VendorModalProps) {
  const [formData, setFormData] = useState<Partial<Vendor>>({
    code: '',
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: ''
  });

  useEffect(() => {
    if (vendor) {
      setFormData(vendor);
    } else {
      setFormData({
        id: 'vend-' + Date.now(),
        code: 'VEND-' + Math.floor(100 + Math.random() * 900),
        name: '',
        contactPerson: '',
        phone: '',
        email: '',
        address: ''
      });
    }
  }, [vendor]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert('請填寫廠商名稱與電話');
      return;
    }
    onSave(formData as Vendor);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 className="text-lg font-bold text-slate-900">
            {vendor ? '編輯廠商資料' : '新增廠商資料'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">廠商代碼 *</label>
              <input
                type="text"
                required
                value={formData.code || ''}
                onChange={e => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">廠商名稱 *</label>
              <input
                type="text"
                required
                placeholder="例: 聯發智能元件科技"
                value={formData.name || ''}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">聯絡窗口 *</label>
              <input
                type="text"
                required
                placeholder="例: 李業務"
                value={formData.contactPerson || ''}
                onChange={e => setFormData({ ...formData, contactPerson: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">聯絡電話 *</label>
              <input
                type="text"
                required
                placeholder="例: 03-578-8888"
                value={formData.phone || ''}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
            <input
              type="email"
              value={formData.email || ''}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">地址</label>
            <input
              type="text"
              value={formData.address || ''}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            />
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
              <Check className="w-4 h-4 mr-1.5" /> 儲存廠商資料
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
