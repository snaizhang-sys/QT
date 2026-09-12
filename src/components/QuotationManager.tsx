import React, { useState } from 'react';
import { Quotation, Customer, Product, QuotationItem, ChangeLogItem } from '../types';
import { 
  FileSpreadsheet, Plus, Search, Edit2, Trash2, History, 
  Printer, Check, X, AlertCircle, Trash, Calculator,
  Calendar, User, Phone, MapPin, Building, ChevronDown
} from 'lucide-react';
import { 
  formatDate, formatDateTime, addDays, 
  generateQuotationNumber 
} from '../utils/storage';

interface QuotationManagerProps {
  quotations: Quotation[];
  customers: Customer[];
  products: Product[];
  onSave: (quotation: Quotation) => void;
  onDelete: (id: string) => void;
  onShowChangeLog: (quotation: Quotation) => void;
  onPrint: (quotation: Quotation) => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

interface FormErrors {
  quotationNumber?: string;
  quotationDate?: string;
  validUntil?: string;
  customerId?: string;
  salesPerson?: string;
  contactPhone?: string;
  address?: string;
  items?: string;
  itemDetails?: { [index: number]: { productId?: string; quantity?: string; unitPrice?: string } };
}

export const QuotationManager: React.FC<QuotationManagerProps> = ({
  quotations,
  customers,
  products,
  onSave,
  onDelete,
  onShowChangeLog,
  onPrint,
  showToast
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Quotation>>({
    items: []
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Open modal for new quotation
  const handleOpenAddModal = () => {
    const today = new Date();
    const newNumber = generateQuotationNumber(quotations);
    
    setEditingQuotation(null);

    // Initial default 1 empty item
    const initialItem: QuotationItem = {
      id: 'item-' + Date.now(),
      productId: '',
      productName: '',
      unitPrice: 0,
      description: '',
      quantity: 1,
      subtotal: 0
    };

    setFormData({
      quotationNumber: newNumber,
      quotationDate: formatDate(today),
      validUntil: addDays(today, 30),
      customerId: '',
      customerName: '',
      salesPerson: '張宇翔',
      contactPhone: '',
      address: '',
      items: [initialItem],
      totalAmount: 0,
      taxRate: 0.05,
      notes: '1. 本報價單有效期限30天。\n2. 保固條件依原廠規範。\n3. 確認訂購請蓋印或簽署後回傳。',
      status: '草稿'
    });

    setErrors({});
    setSubmitAttempted(false);
    setIsModalOpen(true);
  };

  // Open modal for editing quotation
  const handleOpenEditModal = (quot: Quotation) => {
    setEditingQuotation(quot);
    setFormData({
      ...quot,
      items: quot.items.map((it) => ({ ...it }))
    });
    setErrors({});
    setSubmitAttempted(false);
    setIsModalOpen(true);
  };

  // 連動 1: 當選擇客戶時，自動帶出該客戶的「電話」與「住址」
  const handleCustomerChange = (customerId: string) => {
    const selectedCust = customers.find((c) => c.id === customerId);
    if (selectedCust) {
      setFormData((prev) => ({
        ...prev,
        customerId: selectedCust.id,
        customerName: selectedCust.companyName,
        contactPhone: selectedCust.phone || '',
        address: selectedCust.address || ''
      }));

      // Clear related errors
      if (errors.customerId || errors.contactPhone || errors.address) {
        setErrors((prev) => ({
          ...prev,
          customerId: undefined,
          contactPhone: undefined,
          address: undefined
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        customerId: '',
        customerName: '',
        contactPhone: '',
        address: ''
      }));
    }
  };

  // 明細動態新增
  const handleAddItem = () => {
    const newItem: QuotationItem = {
      id: 'item-' + Date.now() + Math.random().toString(36).substring(2, 5),
      productId: '',
      productName: '',
      unitPrice: 0,
      description: '',
      quantity: 1,
      subtotal: 0
    };

    const updatedItems = [...(formData.items || []), newItem];
    setFormData((prev) => ({
      ...prev,
      items: updatedItems
    }));
  };

  // 明細動態刪除
  const handleRemoveItem = (index: number) => {
    const items = formData.items || [];
    if (items.length <= 1) {
      showToast('報價單至少須保留一筆產品明細', 'error');
      return;
    }
    const updated = items.filter((_, i) => i !== index);
    const newTotal = updated.reduce((acc, it) => acc + (it.subtotal || 0), 0);
    setFormData((prev) => ({
      ...prev,
      items: updated,
      totalAmount: newTotal
    }));
  };

  // 連動 2: 當選擇產品時，自動帶出預設單價與說明，並計算複價與總價
  const handleProductChange = (index: number, productId: string) => {
    const selectedProd = products.find((p) => p.id === productId);
    const items = [...(formData.items || [])];

    if (selectedProd) {
      const qty = items[index].quantity > 0 ? items[index].quantity : 1;
      const price = selectedProd.price;
      const subtotal = Math.round(price * qty);

      items[index] = {
        ...items[index],
        productId: selectedProd.id,
        productName: selectedProd.name,
        unitPrice: price,
        description: selectedProd.specification 
          ? `${selectedProd.specification}${selectedProd.description ? ' - ' + selectedProd.description : ''}` 
          : selectedProd.description || '',
        quantity: qty,
        subtotal
      };
    } else {
      items[index] = {
        ...items[index],
        productId: '',
        productName: '',
        unitPrice: 0,
        description: '',
        subtotal: 0
      };
    }

    const newTotal = items.reduce((acc, it) => acc + (it.subtotal || 0), 0);
    setFormData((prev) => ({
      ...prev,
      items,
      totalAmount: newTotal
    }));
  };

  // 連動 3: 當修改數量或單價時，即時重算「複價」與「總價」
  const handleItemValueChange = (
    index: number, 
    field: 'quantity' | 'unitPrice' | 'description', 
    value: any
  ) => {
    const items = [...(formData.items || [])];
    const current = items[index];
    if (!current) return;

    if (field === 'quantity') {
      const qty = parseFloat(value) || 0;
      const subtotal = Math.round((current.unitPrice || 0) * qty);
      items[index] = { ...current, quantity: qty, subtotal };
    } else if (field === 'unitPrice') {
      const price = parseFloat(value) || 0;
      const subtotal = Math.round(price * (current.quantity || 0));
      items[index] = { ...current, unitPrice: price, subtotal };
    } else if (field === 'description') {
      items[index] = { ...current, description: value };
    }

    const newTotal = items.reduce((acc, it) => acc + (it.subtotal || 0), 0);
    setFormData((prev) => ({
      ...prev,
      items,
      totalAmount: newTotal
    }));
  };

  // Validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const itemDetailsErrors: { [index: number]: any } = {};

    if (!formData.quotationNumber?.trim()) {
      newErrors.quotationNumber = '報價單號為必填欄位';
    } else {
      const duplicate = quotations.find(
        (q) => q.quotationNumber.toLowerCase() === formData.quotationNumber?.trim().toLowerCase() && 
               q.id !== editingQuotation?.id
      );
      if (duplicate) {
        newErrors.quotationNumber = '此報價單號已存在';
      }
    }

    if (!formData.quotationDate?.trim()) {
      newErrors.quotationDate = '報價日期為必填欄位';
    }

    if (!formData.validUntil?.trim()) {
      newErrors.validUntil = '有效期限為必填欄位';
    }

    if (!formData.customerId) {
      newErrors.customerId = '請選擇報價客戶';
    }

    if (!formData.salesPerson?.trim()) {
      newErrors.salesPerson = '報價人員為必填欄位';
    }

    if (!formData.contactPhone?.trim()) {
      newErrors.contactPhone = '連絡電話為必填欄位';
    }

    if (!formData.address?.trim()) {
      newErrors.address = '公司住址為必填欄位';
    }

    // Validate Items
    const items = formData.items || [];
    if (items.length === 0) {
      newErrors.items = '報價單必須包含至少一筆明細項目';
    } else {
      items.forEach((it, idx) => {
        const itemErr: any = {};
        if (!it.productId) {
          itemErr.productId = '請選擇產品';
        }
        if (it.quantity === undefined || isNaN(it.quantity) || it.quantity <= 0) {
          itemErr.quantity = '數量需大於 0';
        }
        if (it.unitPrice === undefined || isNaN(it.unitPrice) || it.unitPrice < 0) {
          itemErr.unitPrice = '單價不可小於 0';
        }

        if (Object.keys(itemErr).length > 0) {
          itemDetailsErrors[idx] = itemErr;
        }
      });
    }

    if (Object.keys(itemDetailsErrors).length > 0) {
      newErrors.itemDetails = itemDetailsErrors;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);

    if (!validateForm()) {
      showToast('報價單有必填欄位未填或明細數值不正確，請檢查紅字標示處', 'error');
      return;
    }

    const now = formatDateTime();
    const finalTotal = (formData.items || []).reduce((acc, it) => acc + (it.subtotal || 0), 0);

    if (editingQuotation) {
      const updatedLog: ChangeLogItem = {
        timestamp: now,
        action: '更新報價單內容',
        note: `調整明細與總金額: NT$ ${finalTotal.toLocaleString()}`
      };
      const updated: Quotation = {
        ...(editingQuotation as Quotation),
        ...(formData as Quotation),
        totalAmount: finalTotal,
        updatedAt: now,
        changeLog: [updatedLog, ...(editingQuotation.changeLog || [])]
      };
      onSave(updated);
      showToast(`已成功更新報價單【${updated.quotationNumber}】`, 'success');
    } else {
      const newId = 'quot-' + Date.now();
      const newQuotation: Quotation = {
        id: newId,
        quotationNumber: formData.quotationNumber!.trim(),
        quotationDate: formData.quotationDate!.trim(),
        validUntil: formData.validUntil!.trim(),
        customerId: formData.customerId!,
        customerName: formData.customerName || '客戶',
        salesPerson: formData.salesPerson!.trim(),
        contactPhone: formData.contactPhone!.trim(),
        address: formData.address!.trim(),
        items: formData.items || [],
        totalAmount: finalTotal,
        taxRate: formData.taxRate || 0.05,
        notes: formData.notes || '',
        status: formData.status || '草稿',
        createdAt: now,
        updatedAt: now,
        changeLog: [{ timestamp: now, action: '建立新報價單' }]
      };
      onSave(newQuotation);
      showToast(`已成功建立報價單【${newQuotation.quotationNumber}】`, 'success');
    }

    setIsModalOpen(false);
  };

  const filteredQuotations = quotations.filter((q) => {
    const kw = searchTerm.toLowerCase();
    const matchesKeyword =
      q.quotationNumber.toLowerCase().includes(kw) ||
      q.customerName.toLowerCase().includes(kw) ||
      q.salesPerson.toLowerCase().includes(kw);

    const matchesStatus = !statusFilter || q.status === statusFilter;

    return matchesKeyword && matchesStatus;
  });

  const getCustomer = (customerId: string) => {
    return customers.find((c) => c.id === customerId);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-indigo-600" />
            報價單管理
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            選定客戶自動連動電話住址，選定產品自動帶出單價說明，複價與總價即時試算
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenAddModal}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-xs transition-all active:scale-98"
          >
            <Plus className="w-4 h-4" />
            開立新報價單
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="搜尋報價單號、客戶名稱、業務負責人..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all placeholder:text-slate-400"
          />
        </div>
        <div className="w-full md:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full py-2.5 px-3 text-sm bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-700"
          >
            <option value="">全部狀態篩選</option>
            <option value="草稿">草稿</option>
            <option value="已發送">已發送</option>
            <option value="已確認">已確認</option>
            <option value="已過期">已過期</option>
            <option value="已作廢">已作廢</option>
          </select>
        </div>
        <div className="text-xs text-slate-500 self-center whitespace-nowrap">
          共 <span className="font-semibold text-slate-700">{filteredQuotations.length}</span> 張報價單
        </div>
      </div>

      {/* Quotations Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredQuotations.length === 0 ? (
          <div className="p-12 text-center">
            <FileSpreadsheet className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-medium text-slate-700">查無報價單資料</h3>
            <p className="text-xs text-slate-400 mt-1">
              {searchTerm || statusFilter ? '請調整搜尋條件' : '點擊右上角「開立新報價單」開始建立'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-600 whitespace-nowrap">
                  <th className="py-3.5 px-4 min-w-[140px] whitespace-nowrap">報價單號</th>
                  <th className="py-3.5 px-4 min-w-[180px] whitespace-nowrap">客戶名稱</th>
                  <th className="py-3.5 px-4 min-w-[150px] whitespace-nowrap">報價 / 有效日期</th>
                  <th className="py-3.5 px-4 min-w-[110px] whitespace-nowrap">報價人員</th>
                  <th className="py-3.5 px-4 text-center min-w-[90px] whitespace-nowrap">明細項數</th>
                  <th className="py-3.5 px-4 text-right min-w-[140px] whitespace-nowrap">報價總額 (未稅)</th>
                  <th className="py-3.5 px-4 text-center min-w-[90px] whitespace-nowrap">狀態</th>
                  <th className="py-3.5 px-4 text-center min-w-[130px] whitespace-nowrap">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredQuotations.map((quot) => (
                  <tr key={quot.id} className="hover:bg-indigo-50/20 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-700 text-xs whitespace-nowrap">
                      {quot.quotationNumber}
                    </td>
                    <td className="py-3.5 px-4 min-w-[180px]">
                      <div className="font-semibold text-slate-800">{quot.customerName}</div>
                      <div className="text-xs text-slate-400 mt-0.5 truncate max-w-[200px]" title={quot.address}>
                        {quot.address}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs whitespace-nowrap">
                      <div className="font-mono text-slate-700">{quot.quotationDate}</div>
                      <div className="font-mono text-slate-400">至 {quot.validUntil}</div>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-slate-700 whitespace-nowrap">
                      {quot.salesPerson}
                    </td>
                    <td className="py-3.5 px-4 text-center text-xs whitespace-nowrap">
                      <span className="px-2 py-0.5 bg-slate-100 rounded-full font-medium text-slate-600">
                        {quot.items.length} 項
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 text-sm whitespace-nowrap">
                      NT$ {quot.totalAmount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full ${
                        quot.status === '已確認' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : quot.status === '已發送'
                          ? 'bg-blue-100 text-blue-800'
                          : quot.status === '已過期'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {quot.status || '草稿'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onPrint(quot)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="預覽與列印報價單"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(quot)}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                          title="編輯報價單"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onShowChangeLog(quot)}
                          className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                          title="檢視異動記錄"
                        >
                          <History className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(quot.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="刪除報價單"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quotation Editor Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full border border-slate-200 overflow-hidden my-6 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-bold">
                  {editingQuotation ? `編輯報價單 (${formData.quotationNumber})` : '開立新報價單'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSubmit} noValidate className="p-6 overflow-y-auto space-y-6 flex-1">
              {submitAttempted && Object.keys(errors).length > 0 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-xs text-red-700">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-sm">報價單驗證未通過，請檢查下列問題：</span>
                    <ul className="list-disc list-inside mt-1.5 space-y-0.5">
                      {errors.quotationNumber && <li>{errors.quotationNumber}</li>}
                      {errors.customerId && <li>{errors.customerId}</li>}
                      {errors.salesPerson && <li>{errors.salesPerson}</li>}
                      {errors.contactPhone && <li>{errors.contactPhone}</li>}
                      {errors.address && <li>{errors.address}</li>}
                      {errors.items && <li>{errors.items}</li>}
                      {errors.itemDetails && <li>明細中有產品未選、數量或單價格式錯誤</li>}
                    </ul>
                  </div>
                </div>
              )}

              {/* Section 1: 報價基本資料 */}
              <div className="bg-slate-50/70 p-5 rounded-xl border border-slate-200/80 space-y-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  單據與客戶基本資訊
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      報價單號 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.quotationNumber || ''}
                      onChange={(e) => setFormData({ ...formData, quotationNumber: e.target.value })}
                      className={`w-full px-3 py-2 text-sm rounded-lg border font-mono ${
                        errors.quotationNumber ? 'border-red-500 bg-red-50/30' : 'border-slate-200 bg-white'
                      }`}
                      placeholder="QT-20260911-001"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      報價日期 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.quotationDate || ''}
                      onChange={(e) => setFormData({ ...formData, quotationDate: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      有效期限 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.validUntil || ''}
                      onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">報價狀態</label>
                    <select
                      value={formData.status || '草稿'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white"
                    >
                      <option value="草稿">草稿</option>
                      <option value="已發送">已發送</option>
                      <option value="已確認">已確認</option>
                      <option value="已過期">已過期</option>
                      <option value="已作廢">已作廢</option>
                    </select>
                  </div>
                </div>

                {/* 客戶連動區塊 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-200/60">
                  <div className="md:col-span-1">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      選擇客戶 (連動帶入) <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.customerId || ''}
                      onChange={(e) => handleCustomerChange(e.target.value)}
                      className={`w-full px-3 py-2 text-sm rounded-lg border bg-white ${
                        errors.customerId ? 'border-red-500 bg-red-50/30' : 'border-slate-200'
                      }`}
                    >
                      <option value="">-- 請選擇客戶 --</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.companyName} ({c.code})
                        </option>
                      ))}
                    </select>
                    {errors.customerId && <p className="text-xs text-red-500 mt-1">{errors.customerId}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      連絡電話 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.contactPhone || ''}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      className={`w-full px-3 py-2 text-sm rounded-lg border ${
                        errors.contactPhone ? 'border-red-500 bg-red-50/30' : 'border-slate-200 bg-white'
                      }`}
                      placeholder="選定客戶自動帶出，可修改"
                    />
                    {errors.contactPhone && <p className="text-xs text-red-500 mt-1">{errors.contactPhone}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      報價人員 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.salesPerson || ''}
                      onChange={(e) => setFormData({ ...formData, salesPerson: e.target.value })}
                      className={`w-full px-3 py-2 text-sm rounded-lg border ${
                        errors.salesPerson ? 'border-red-500 bg-red-50/30' : 'border-slate-200 bg-white'
                      }`}
                      placeholder="例: 張宇翔"
                    />
                    {errors.salesPerson && <p className="text-xs text-red-500 mt-1">{errors.salesPerson}</p>}
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      送貨／服務住址 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.address || ''}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className={`w-full px-3 py-2 text-sm rounded-lg border ${
                        errors.address ? 'border-red-500 bg-red-50/30' : 'border-slate-200 bg-white'
                      }`}
                      placeholder="選定客戶自動連動帶出住址，可手動修正"
                    />
                    {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
                  </div>
                </div>
              </div>

              {/* Section 2: 報價明細 (支援動態新增/刪除多筆) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-indigo-600" />
                    <h4 className="text-sm font-bold text-slate-800">報價商品明細項目</h4>
                    <span className="text-xs text-slate-400">（選定產品自動帶出單價與說明，修改數量自動重算複價）</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    新增明細
                  </button>
                </div>

                {errors.items && <p className="text-xs text-red-500 font-medium">{errors.items}</p>}

                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-100/80 border-b border-slate-200 font-semibold text-slate-700 whitespace-nowrap">
                          <th className="py-2.5 px-3 w-10 text-center whitespace-nowrap">#</th>
                          <th className="py-2.5 px-3 min-w-[200px] whitespace-nowrap">
                            產品品名 <span className="text-red-500">*</span>
                          </th>
                          <th className="py-2.5 px-3 min-w-[160px] whitespace-nowrap">規格說明</th>
                          <th className="py-2.5 px-3 min-w-[110px] text-right whitespace-nowrap">
                            單價 (NT$) <span className="text-red-500">*</span>
                          </th>
                          <th className="py-2.5 px-3 min-w-[80px] text-center whitespace-nowrap">
                            數量 <span className="text-red-500">*</span>
                          </th>
                          <th className="py-2.5 px-3 min-w-[110px] text-right whitespace-nowrap">複價 (小計)</th>
                          <th className="py-2.5 px-3 w-12 text-center whitespace-nowrap">操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(formData.items || []).map((item, idx) => {
                          const itemErr = errors.itemDetails?.[idx];
                          return (
                            <tr key={item.id || idx} className="hover:bg-slate-50/60">
                              <td className="py-2.5 px-3 text-center font-mono text-slate-400 font-medium">
                                {idx + 1}
                              </td>
                              <td className="py-2.5 px-3">
                                <select
                                  value={item.productId}
                                  onChange={(e) => handleProductChange(idx, e.target.value)}
                                  className={`w-full px-2 py-1.5 text-xs rounded border bg-white ${
                                    itemErr?.productId ? 'border-red-500 bg-red-50/30' : 'border-slate-200'
                                  }`}
                                >
                                  <option value="">-- 請選擇產品 --</option>
                                  {products.map((p) => (
                                    <option key={p.id} value={p.id}>
                                      {p.name} ({p.code}) - NT$ {p.price.toLocaleString()}
                                    </option>
                                  ))}
                                </select>
                                {itemErr?.productId && (
                                  <p className="text-[11px] text-red-500 mt-0.5">{itemErr.productId}</p>
                                )}
                              </td>
                              <td className="py-2.5 px-3">
                                <input
                                  type="text"
                                  value={item.description}
                                  onChange={(e) => handleItemValueChange(idx, 'description', e.target.value)}
                                  className="w-full px-2 py-1.5 text-xs rounded border border-slate-200 bg-white"
                                  placeholder="規格、型號或備註說明..."
                                />
                              </td>
                              <td className="py-2.5 px-3">
                                <input
                                  type="number"
                                  min="0"
                                  step="1"
                                  value={item.unitPrice !== undefined ? item.unitPrice : ''}
                                  onChange={(e) => handleItemValueChange(idx, 'unitPrice', e.target.value)}
                                  className={`w-full px-2 py-1.5 text-xs rounded border font-mono text-right ${
                                    itemErr?.unitPrice ? 'border-red-500 bg-red-50/30' : 'border-slate-200 bg-white'
                                  }`}
                                />
                              </td>
                              <td className="py-2.5 px-3">
                                <input
                                  type="number"
                                  min="1"
                                  step="1"
                                  value={item.quantity !== undefined ? item.quantity : ''}
                                  onChange={(e) => handleItemValueChange(idx, 'quantity', e.target.value)}
                                  className={`w-full px-2 py-1.5 text-xs rounded border font-mono text-center ${
                                    itemErr?.quantity ? 'border-red-500 bg-red-50/30' : 'border-slate-200 bg-white'
                                  }`}
                                />
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800 text-xs">
                                NT$ {Number(item.subtotal || 0).toLocaleString()}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(idx)}
                                  className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                                  title="刪除此列"
                                >
                                  <Trash className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Calculations Summary Card */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-900 text-white p-4 rounded-xl gap-4">
                  <div className="text-xs text-slate-400 space-y-1">
                    <p>💡 單價修改或數量調整皆即時自動重算複價與總價</p>
                    <p>已選擇 {(formData.items || []).length} 項明細項目</p>
                  </div>
                  <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-6 text-sm">
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">報價單未稅總額</span>
                      <span className="font-mono font-black text-2xl text-indigo-400">
                        NT$ {Number(formData.totalAmount || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: 備註與附加條款 */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  備註條款與付款說明
                </label>
                <textarea
                  rows={3}
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white"
                  placeholder="合約條款、保固說明、匯款帳號等..."
                />
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
                >
                  <Check className="w-4 h-4" />
                  儲存報價單
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
