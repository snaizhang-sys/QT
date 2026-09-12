import React, { useState } from 'react';
import { Vendor, ChangeLogItem } from '../types';
import { 
  Truck, Plus, Search, Edit2, Trash2, History, 
  Building2, Phone, Mail, MapPin, AlertCircle, X, Check
} from 'lucide-react';
import { formatDateTime, generateVendorCode } from '../utils/storage';

interface VendorManagerProps {
  vendors: Vendor[];
  onSave: (vendor: Vendor) => void;
  onDelete: (id: string) => void;
  onShowChangeLog: (vendor: Vendor) => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

interface FormErrors {
  code?: string;
  companyName?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  taxId?: string;
  address?: string;
}

export const VendorManager: React.FC<VendorManagerProps> = ({
  vendors,
  onSave,
  onDelete,
  onShowChangeLog,
  showToast
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Vendor>>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Open modal for new vendor
  const handleOpenAddModal = () => {
    const newCode = generateVendorCode(vendors);
    setEditingVendor(null);
    setFormData({
      code: newCode,
      companyName: '',
      contactPerson: '',
      englishName: '',
      department: '',
      jobTitle: '',
      phone: '',
      email: '',
      taxId: '',
      address: '',
      paymentTerms: '月結30天電匯',
      notes: ''
    });
    setErrors({});
    setSubmitAttempted(false);
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEditModal = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setFormData({ ...vendor });
    setErrors({});
    setSubmitAttempted(false);
    setIsModalOpen(true);
  };

  // Form Validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.code?.trim()) {
      newErrors.code = '廠商代碼為必填欄位';
    } else {
      const duplicate = vendors.find(
        (v) => v.code.toLowerCase() === formData.code?.trim().toLowerCase() && v.id !== editingVendor?.id
      );
      if (duplicate) {
        newErrors.code = '此廠商代碼已存在，請使用不同代碼';
      }
    }

    if (!formData.companyName?.trim()) {
      newErrors.companyName = '公司名稱為必填欄位';
    }

    if (!formData.contactPerson?.trim()) {
      newErrors.contactPerson = '聯絡窗口為必填欄位';
    }

    if (!formData.phone?.trim()) {
      newErrors.phone = '電話為必填欄位';
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'Email 為必填欄位';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = '請輸入正確的 Email 電子郵件格式 (例如 contact@vendor.com)';
      }
    }

    if (!formData.taxId?.trim()) {
      newErrors.taxId = '統一編號為必填欄位';
    } else {
      const taxClean = formData.taxId.trim();
      if (!/^\d{8}$/.test(taxClean)) {
        newErrors.taxId = '統一編號應為 8 碼數字';
      }
    }

    if (!formData.address?.trim()) {
      newErrors.address = '公司住址為必填欄位';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);

    if (!validateForm()) {
      showToast('廠商表單包含未填之必填欄位或格式錯誤，請修正後再送出', 'error');
      return;
    }

    const now = formatDateTime();

    if (editingVendor) {
      // Update existing
      const updatedLog: ChangeLogItem = {
        timestamp: now,
        action: '修改廠商資訊',
        note: `更新公司資料與聯絡窗口`
      };
      const updated: Vendor = {
        ...(editingVendor as Vendor),
        ...(formData as Vendor),
        updatedAt: now,
        changeLog: [updatedLog, ...(editingVendor.changeLog || [])]
      };
      onSave(updated);
      showToast(`已成功更新廠商【${updated.companyName}】`, 'success');
    } else {
      // Create new
      const newId = 'vend-' + Date.now();
      const newVendor: Vendor = {
        id: newId,
        code: formData.code!.trim(),
        companyName: formData.companyName!.trim(),
        contactPerson: formData.contactPerson!.trim(),
        englishName: formData.englishName?.trim() || '',
        department: formData.department?.trim() || '',
        jobTitle: formData.jobTitle?.trim() || '',
        phone: formData.phone!.trim(),
        email: formData.email!.trim(),
        taxId: formData.taxId!.trim(),
        address: formData.address!.trim(),
        paymentTerms: formData.paymentTerms?.trim() || '',
        notes: formData.notes?.trim() || '',
        createdAt: now,
        updatedAt: now,
        changeLog: [{ timestamp: now, action: '新增廠商資料' }]
      };
      onSave(newVendor);
      showToast(`已成功新增廠商【${newVendor.companyName}】`, 'success');
    }

    setIsModalOpen(false);
  };

  const filteredVendors = vendors.filter((v) => {
    const q = searchTerm.toLowerCase();
    return (
      v.companyName.toLowerCase().includes(q) ||
      v.code.toLowerCase().includes(q) ||
      v.contactPerson.toLowerCase().includes(q) ||
      (v.department && v.department.toLowerCase().includes(q)) ||
      (v.jobTitle && v.jobTitle.toLowerCase().includes(q)) ||
      v.taxId.includes(q) ||
      v.phone.includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Truck className="w-6 h-6 text-emerald-600" />
            廠商管理
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            管理設備原廠、軟硬體代理商與原物料供應商，用於產品管理之供應商下拉資料
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenAddModal}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-xs transition-all active:scale-98"
          >
            <Plus className="w-4 h-4" />
            新增廠商
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="搜尋廠商代碼、公司名稱、統編、窗口、部門、職稱或電話..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all placeholder:text-slate-400"
          />
        </div>
        <div className="text-xs text-slate-500 self-center whitespace-nowrap">
          共 <span className="font-semibold text-slate-700">{filteredVendors.length}</span> 家合作廠商
        </div>
      </div>

      {/* Vendors Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredVendors.length === 0 ? (
          <div className="p-12 text-center">
            <Truck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-medium text-slate-700">查無廠商資料</h3>
            <p className="text-xs text-slate-400 mt-1">
              {searchTerm ? '請嘗試更改搜尋關鍵字' : '點擊右上角「新增廠商」開始建立'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-600 whitespace-nowrap">
                  <th className="py-3 px-4 min-w-[110px] whitespace-nowrap">廠商代碼</th>
                  <th className="py-3 px-4 min-w-[170px] whitespace-nowrap">公司名稱 / 統編</th>
                  <th className="py-3 px-4 min-w-[100px] whitespace-nowrap">聯絡窗口</th>
                  <th className="py-3 px-4 min-w-[120px] whitespace-nowrap">部門</th>
                  <th className="py-3 px-4 min-w-[120px] whitespace-nowrap">職稱</th>
                  <th className="py-3 px-4 min-w-[150px] whitespace-nowrap">電話 / Email</th>
                  <th className="py-3 px-4 min-w-[170px] whitespace-nowrap">地址</th>
                  <th className="py-3 px-4 min-w-[95px] whitespace-nowrap">付款條件</th>
                  <th className="py-3 px-4 text-center min-w-[90px] whitespace-nowrap">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVendors.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-emerald-700 text-xs whitespace-nowrap">
                      {vendor.code}
                    </td>
                    <td className="py-3.5 px-4 min-w-[170px]">
                      <div className="font-semibold text-slate-800">{vendor.companyName}</div>
                      {vendor.englishName && (
                        <div className="text-[11px] text-slate-400 font-normal truncate max-w-[180px]">{vendor.englishName}</div>
                      )}
                      <div className="text-xs text-slate-400 font-mono mt-0.5">統編：{vendor.taxId}</div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="text-slate-800 font-medium">{vendor.contactPerson}</div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {vendor.department ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          {vendor.department}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-300">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {vendor.jobTitle ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                          {vendor.jobTitle}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-300">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="text-slate-700 font-mono text-xs">{vendor.phone}</div>
                      <div className="text-slate-400 text-xs truncate max-w-[160px]">{vendor.email}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 text-xs max-w-[200px] truncate" title={vendor.address}>
                      {vendor.address}
                    </td>
                    <td className="py-3.5 px-4 text-xs whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                        {vendor.paymentTerms || '未設定'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(vendor)}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                          title="編輯資料"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onShowChangeLog(vendor)}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                          title="檢視異動記錄"
                        >
                          <History className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(vendor.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="刪除廠商"
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

      {/* Vendor Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-8">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-bold text-slate-800">
                  {editingVendor ? '編輯廠商資料' : '新增廠商資料'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4">
              {submitAttempted && Object.keys(errors).length > 0 && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">請檢查表單欄位：</span>
                    <ul className="list-disc list-inside mt-1 space-y-0.5">
                      {Object.values(errors).map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Row 1: 代碼 & 公司名稱 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    廠商代碼 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.code || ''}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className={`w-full px-3 py-2 text-sm rounded-lg border font-mono ${
                      errors.code ? 'border-red-500 bg-red-50/30' : 'border-slate-200 focus:border-emerald-500'
                    }`}
                    placeholder="例: VEND-001"
                  />
                  {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    公司名稱 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.companyName || ''}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className={`w-full px-3 py-2 text-sm rounded-lg border ${
                      errors.companyName ? 'border-red-500 bg-red-50/30' : 'border-slate-200 focus:border-emerald-500'
                    }`}
                    placeholder="例: 光訊網通元件股份有限公司"
                  />
                  {errors.companyName && <p className="text-xs text-red-500 mt-1">{errors.companyName}</p>}
                </div>
              </div>

              {/* Row 2: 英文名 & 統編 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">英文名稱</label>
                  <input
                    type="text"
                    value={formData.englishName || ''}
                    onChange={(e) => setFormData({ ...formData, englishName: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-emerald-500"
                    placeholder="OptiCom Corp."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    統一編號 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={8}
                    value={formData.taxId || ''}
                    onChange={(e) => setFormData({ ...formData, taxId: e.target.value.replace(/\D/g, '') })}
                    className={`w-full px-3 py-2 text-sm rounded-lg border font-mono ${
                      errors.taxId ? 'border-red-500 bg-red-50/30' : 'border-slate-200 focus:border-emerald-500'
                    }`}
                    placeholder="8 碼數字，例: 89562143"
                  />
                  {errors.taxId && <p className="text-xs text-red-500 mt-1">{errors.taxId}</p>}
                </div>
              </div>

              {/* Row 3: 聯絡窗口、部門、職稱 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    聯絡窗口 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.contactPerson || ''}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className={`w-full px-3 py-2 text-sm rounded-lg border ${
                      errors.contactPerson ? 'border-red-500 bg-red-50/30' : 'border-slate-200 focus:border-emerald-500'
                    }`}
                    placeholder="窗口姓名，例: 林怡君"
                  />
                  {errors.contactPerson && <p className="text-xs text-red-500 mt-1">{errors.contactPerson}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    所屬部門
                  </label>
                  <input
                    type="text"
                    value={formData.department || ''}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-emerald-500"
                    placeholder="例: 通路業務處 / 原廠支援處"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    擔任職稱
                  </label>
                  <input
                    type="text"
                    value={formData.jobTitle || ''}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-emerald-500"
                    placeholder="例: 業務協理 / 技術顧問"
                  />
                </div>
              </div>

              {/* Row 4: 電話 & Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    電話 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full px-3 py-2 text-sm rounded-lg border ${
                      errors.phone ? 'border-red-500 bg-red-50/30' : 'border-slate-200 focus:border-emerald-500'
                    }`}
                    placeholder="例: 03-5778899"
                  />
                  {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full px-3 py-2 text-sm rounded-lg border ${
                      errors.email ? 'border-red-500 bg-red-50/30' : 'border-slate-200 focus:border-emerald-500'
                    }`}
                    placeholder="例: sales@opticom.tw"
                  />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>
              </div>

              {/* Row 5: 住址 */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  住址 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className={`w-full px-3 py-2 text-sm rounded-lg border ${
                    errors.address ? 'border-red-500 bg-red-50/30' : 'border-slate-200 focus:border-emerald-500'
                  }`}
                  placeholder="例: 新竹科學園區工業東四路22號"
                />
                {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
              </div>

              {/* Row 6: 付款條件 & 備註 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">付款條件</label>
                  <select
                    value={formData.paymentTerms || ''}
                    onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:border-emerald-500"
                  >
                    <option value="月結30天電匯">月結30天電匯</option>
                    <option value="月結60天電匯">月結60天電匯</option>
                    <option value="次月15日電匯">次月15日電匯</option>
                    <option value="預付訂金50%，驗收50%">預付訂金50%，驗收50%</option>
                    <option value="出貨前電匯">出貨前電匯</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">備註</label>
                  <input
                    type="text"
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-emerald-500"
                    placeholder="原廠產品線、保固政策等"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
                >
                  <Check className="w-4 h-4" />
                  儲存廠商資料
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
