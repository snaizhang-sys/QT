import React, { useState, useEffect } from 'react';
import { Quotation, QuotationItem, Customer, Vendor, Product } from '../types';
import { X, Plus, Trash2, Check } from 'lucide-react';

interface QuotationModalProps {
  quotation: Quotation | null;
  customers: Customer[];
  vendors: Vendor[];
  products: Product[];
  onClose: () => void;
  onSave: (quote: Quotation) => void;
}

export default function QuotationModal({ quotation, customers, vendors, products, onClose, onSave }: QuotationModalProps) {
  const [formData, setFormData] = useState<Partial<Quotation>>({
    quoteNumber: '',
    date: new Date().toISOString().slice(0, 10),
    validUntil: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().slice(0, 10),
    customerId: '',
    customerName: '',
    customerAddress: '',
    contactPerson: '',
    contactPhone: '',
    paymentTerms: '簽約預付30%，驗收完成後付清70%',
    salesPerson: '張宇翔',
    status: '草稿',
    items: [],
    subtotal: 0,
    tax: 0,
    total: 0,
    notes: '本報價單有效期限 30 天，確認後請簽名回傳。'
  });

  useEffect(() => {
    if (quotation) {
      setFormData(quotation);
    } else {
      const initCustomer = customers[0] || {};
      const newNo = `QT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;
      setFormData({
        id: 'quote-' + Date.now(),
        quoteNumber: newNo,
        date: new Date().toISOString().slice(0, 10),
        validUntil: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().slice(0, 10),
        customerId: initCustomer.id || '',
        customerName: initCustomer.name || '',
        customerAddress: initCustomer.address || '',
        contactPerson: initCustomer.contactPerson || '',
        contactPhone: initCustomer.phone || '',
        paymentTerms: '月結 30 天',
        salesPerson: '張宇翔',
        status: '草稿',
        items: products[0] ? [{
          id: 'item-1',
          productId: products[0].id,
          productCode: products[0].code,
          productName: products[0].name,
          spec: products[0].spec,
          quantity: 1,
          unit: products[0].unit,
          unitPrice: products[0].standardPrice,
          amount: products[0].standardPrice
        }] : [],
        subtotal: products[0]?.standardPrice || 0,
        tax: Math.round((products[0]?.standardPrice || 0) * 0.05),
        total: Math.round((products[0]?.standardPrice || 0) * 1.05),
        notes: '含一年保固與技術諮詢服務'
      });
    }
  }, [quotation, customers, products]);

  // 當切換客戶時，自動連動填寫地址與電話
  const handleCustomerChange = (cid: string) => {
    const c = customers.find(x => x.id === cid);
    if (c) {
      setFormData(prev => ({
        ...prev,
        customerId: c.id,
        customerName: c.name,
        customerAddress: c.address,
        contactPerson: c.contactPerson,
        contactPhone: c.phone
      }));
    }
  };

  // 重新計算總計
  const recalculateTotals = (items: QuotationItem[]) => {
    const subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
    const tax = Math.round(subtotal * 0.05);
    const total = subtotal + tax;
    setFormData(prev => ({ ...prev, items, subtotal, tax, total }));
  };

  const handleAddItem = () => {
    const p = products[0];
    const newItem: QuotationItem = {
      id: 'item-' + Date.now(),
      productId: p?.id || '',
      productCode: p?.code || 'P-01',
      productName: p?.name || '新增項目',
      spec: p?.spec || '',
      quantity: 1,
      unit: p?.unit || '式',
      unitPrice: p?.standardPrice || 0,
      amount: p?.standardPrice || 0
    };
    const newItems = [...(formData.items || []), newItem];
    recalculateTotals(newItems);
  };

  const handleItemChange = (idx: number, field: keyof QuotationItem, value: any) => {
    const items = [...(formData.items || [])];
    items[idx] = { ...items[idx], [field]: value };
    if (field === 'quantity' || field === 'unitPrice') {
      const q = Number(items[idx].quantity) || 0;
      const u = Number(items[idx].unitPrice) || 0;
      items[idx].amount = q * u;
    }
    recalculateTotals(items);
  };

  const handleProductSelect = (idx: number, pid: string) => {
    const p = products.find(x => x.id === pid);
    if (p) {
      const items = [...(formData.items || [])];
      items[idx] = {
        ...items[idx],
        productId: p.id,
        productCode: p.code,
        productName: p.name,
        spec: p.spec,
        unit: p.unit,
        unitPrice: p.standardPrice,
        amount: (items[idx].quantity || 1) * p.standardPrice
      };
      recalculateTotals(items);
    }
  };

  const handleDeleteItem = (idx: number) => {
    const items = (formData.items || []).filter((_, i) => i !== idx);
    recalculateTotals(items);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as Quotation);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl space-y-6 my-8">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              {quotation ? '編輯報價單' : '開立新報價單'}
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">{formData.quoteNumber}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 客戶與表頭資訊 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">選擇客戶 (自動連動) *</label>
              <select
                value={formData.customerId}
                onChange={e => handleCustomerChange(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
              >
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">客戶聯絡人</label>
              <input
                type="text"
                value={formData.contactPerson || ''}
                onChange={e => setFormData({ ...formData, contactPerson: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">聯絡電話</label>
              <input
                type="text"
                value={formData.contactPhone || ''}
                onChange={e => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">報價日期</label>
              <input
                type="date"
                value={formData.date || ''}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">有效期限</label>
              <input
                type="date"
                value={formData.validUntil || ''}
                onChange={e => setFormData({ ...formData, validUntil: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">報價狀態</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-indigo-600"
              >
                <option value="草稿">草稿</option>
                <option value="已發送">已發送</option>
                <option value="已確認">已確認</option>
                <option value="已作廢">已作廢</option>
              </select>
            </div>
          </div>

          {/* 報價單項目清單 */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-bold text-slate-900">報價明細項目</h4>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                <Plus className="w-4 h-4 mr-1" /> 新增一列品項
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">選擇產品</th>
                    <th className="py-2.5 px-3">規格說明</th>
                    <th className="py-2.5 px-3 w-20">數量</th>
                    <th className="py-2.5 px-3 w-20">單位</th>
                    <th className="py-2.5 px-3 w-28">單價 (NT$)</th>
                    <th className="py-2.5 px-3 w-28">複價小計</th>
                    <th className="py-2.5 px-3 w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(formData.items || []).map((item, idx) => (
                    <tr key={item.id}>
                      <td className="p-2">
                        <select
                          value={item.productId}
                          onChange={e => handleProductSelect(idx, e.target.value)}
                          className="w-full px-2 py-1 border border-slate-200 rounded-md text-xs"
                        >
                          {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={item.spec}
                          onChange={e => handleItemChange(idx, 'spec', e.target.value)}
                          className="w-full px-2 py-1 border border-slate-200 rounded-md text-xs"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={e => handleItemChange(idx, 'quantity', e.target.value)}
                          className="w-full px-2 py-1 border border-slate-200 rounded-md text-xs"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={item.unit}
                          onChange={e => handleItemChange(idx, 'unit', e.target.value)}
                          className="w-full px-2 py-1 border border-slate-200 rounded-md text-xs"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={e => handleItemChange(idx, 'unitPrice', e.target.value)}
                          className="w-full px-2 py-1 border border-slate-200 rounded-md text-xs font-medium"
                        />
                      </td>
                      <td className="p-2 font-semibold text-slate-900 text-xs">
                        NT$ {(item.amount || 0).toLocaleString()}
                      </td>
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(idx)}
                          className="text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 總結與備註 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">付款條件與備註說明</label>
              <textarea
                rows={3}
                value={formData.notes || ''}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
              <div className="flex justify-between text-xs text-slate-600">
                <span>合計未稅金額：</span>
                <span className="font-semibold">NT$ {(formData.subtotal || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>營業稅 (5%)：</span>
                <span className="font-semibold">NT$ {(formData.tax || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-indigo-700 border-t border-slate-200 pt-2">
                <span>報價含稅總額：</span>
                <span>NT$ {(formData.total || 0).toLocaleString()}</span>
              </div>
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
              className="flex items-center px-6 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
            >
              <Check className="w-4 h-4 mr-1.5" /> 儲存報價單
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
