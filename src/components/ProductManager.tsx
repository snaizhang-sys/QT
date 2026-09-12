import React, { useState, useRef } from 'react';
import { Product, Vendor, ChangeLogItem } from '../types';
import { 
  Package, Plus, Search, Edit2, Trash2, History, 
  Image as ImageIcon, DollarSign, AlertCircle, X, Check,
  Layers, Tag, Info, ZoomIn, Upload, Link as LinkIcon,
  FolderOpen
} from 'lucide-react';
import { formatDateTime, generateProductCode } from '../utils/storage';
import { ImagePreviewModal } from './ImagePreviewModal';

interface ProductManagerProps {
  products: Product[];
  vendors: Vendor[];
  onSave: (product: Product) => void;
  onDelete: (id: string) => void;
  onShowChangeLog: (product: Product) => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

interface FormErrors {
  code?: string;
  name?: string;
  cost?: string;
  price?: string;
  vendorId?: string;
  stockQuantity?: string;
}

export const ProductManager: React.FC<ProductManagerProps> = ({
  products,
  vendors,
  onSave,
  onDelete,
  onShowChangeLog,
  showToast
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVendorFilter, setSelectedVendorFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Image Preview Lightbox Modal State
  const [previewImage, setPreviewImage] = useState<{
    isOpen: boolean;
    imageUrl: string;
    title: string;
    subtitle?: string;
    code?: string;
    price?: number;
    specification?: string;
  } | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<Product>>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Local Image Upload & Drag-and-Drop state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlInputText, setUrlInputText] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Helper to apply online image URL
  const handleApplyUrl = (rawUrl: string) => {
    const trimmed = rawUrl?.trim();
    if (!trimmed) {
      showToast('請先輸入圖片網址 (URL)', 'error');
      return;
    }
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('data:')) {
      showToast('圖片網址必須以 http:// 或 https:// 開頭', 'error');
      return;
    }
    setFormData((prev) => ({ ...prev, imageUrl: trimmed }));
    setUrlInputText(trimmed);
    showToast('已成功套用並載入圖片網址！', 'success');
  };

  // Helper to read and compress local image file
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('請選擇圖檔格式 (支援 JPG、PNG、WebP、GIF)', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Offscreen canvas compression to avoid LocalStorage quota limits
        const canvas = document.createElement('canvas');
        const maxDimension = 800;
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setFormData((prev) => ({ ...prev, imageUrl: compressedDataUrl }));
          setUrlInputText('');
          showToast(`已成功載入本機圖片：${file.name}`, 'success');
        }
      };
      img.onerror = () => {
        showToast('本機圖片讀取失敗，請確認檔案格式', 'error');
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  // Open modal for adding
  const handleOpenAddModal = () => {
    const newCode = generateProductCode(products);
    setEditingProduct(null);
    setUrlInputText('');
    setFormData({
      code: newCode,
      name: '',
      cost: 0,
      price: 0,
      unit: '台',
      imageUrl: '',
      brand: '',
      specification: '',
      description: '',
      stockQuantity: 10,
      vendorId: vendors.length > 0 ? vendors[0].id : ''
    });
    setErrors({});
    setSubmitAttempted(false);
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setUrlInputText(prod.imageUrl && prod.imageUrl.startsWith('http') ? prod.imageUrl : '');
    setFormData({ ...prod });
    setErrors({});
    setSubmitAttempted(false);
    setIsModalOpen(true);
  };

  // Validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.code?.trim()) {
      newErrors.code = '產品代碼為必填欄位';
    } else {
      const duplicate = products.find(
        (p) => p.code.toLowerCase() === formData.code?.trim().toLowerCase() && p.id !== editingProduct?.id
      );
      if (duplicate) {
        newErrors.code = '此產品代碼已存在，請使用不同代碼';
      }
    }

    if (!formData.name?.trim()) {
      newErrors.name = '產品名稱為必填欄位';
    }

    if (formData.cost === undefined || formData.cost === null || isNaN(formData.cost) || formData.cost < 0) {
      newErrors.cost = '成本必須為大於或等於 0 的數字';
    }

    if (formData.price === undefined || formData.price === null || isNaN(formData.price) || formData.price < 0) {
      newErrors.price = '售價必須為大於或等於 0 的數字';
    }

    if (!formData.vendorId) {
      newErrors.vendorId = '請選擇供應商（由廠商管理資料載入）';
    }

    if (formData.stockQuantity !== undefined && (isNaN(formData.stockQuantity) || formData.stockQuantity < 0)) {
      newErrors.stockQuantity = '庫存數量必須為 0 或正數';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);

    if (!validateForm()) {
      showToast('產品表單包含未填之必填欄位或數值錯誤，請修正後再送出', 'error');
      return;
    }

    const now = formatDateTime();

    if (editingProduct) {
      const updatedLog: ChangeLogItem = {
        timestamp: now,
        action: '修改產品規格/價格',
        note: `調整售價: NT$ ${formData.price?.toLocaleString()} / 庫存: ${formData.stockQuantity}`
      };
      const updated: Product = {
        ...(editingProduct as Product),
        ...(formData as Product),
        cost: Number(formData.cost),
        price: Number(formData.price),
        stockQuantity: Number(formData.stockQuantity || 0),
        updatedAt: now,
        changeLog: [updatedLog, ...(editingProduct.changeLog || [])]
      };
      onSave(updated);
      showToast(`已成功更新產品【${updated.name}】`, 'success');
    } else {
      const newId = 'prod-' + Date.now();
      const newProduct: Product = {
        id: newId,
        code: formData.code!.trim(),
        name: formData.name!.trim(),
        cost: Number(formData.cost),
        price: Number(formData.price),
        unit: formData.unit?.trim() || '台',
        imageUrl: formData.imageUrl?.trim() || '',
        brand: formData.brand?.trim() || '',
        specification: formData.specification?.trim() || '',
        description: formData.description?.trim() || '',
        stockQuantity: Number(formData.stockQuantity || 0),
        vendorId: formData.vendorId!,
        createdAt: now,
        updatedAt: now,
        changeLog: [{ timestamp: now, action: '建立新產品' }]
      };
      onSave(newProduct);
      showToast(`已成功新增產品【${newProduct.name}】`, 'success');
    }

    setIsModalOpen(false);
  };

  const getVendor = (vendorId: string) => {
    return vendors.find((item) => item.id === vendorId);
  };

  const getVendorName = (vendorId: string) => {
    const v = vendors.find((item) => item.id === vendorId);
    return v ? v.companyName : '未指定廠商';
  };

  const filteredProducts = products.filter((p) => {
    const q = searchTerm.toLowerCase();
    const matchesQuery =
      p.name.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q) ||
      (p.brand && p.brand.toLowerCase().includes(q)) ||
      (p.specification && p.specification.toLowerCase().includes(q));

    const matchesVendor = !selectedVendorFilter || p.vendorId === selectedVendorFilter;

    return matchesQuery && matchesVendor;
  });

  // Calculate gross margin preview
  const costVal = Number(formData.cost) || 0;
  const priceVal = Number(formData.price) || 0;
  const marginProfit = priceVal - costVal;
  const marginRate = priceVal > 0 ? ((marginProfit / priceVal) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Package className="w-6 h-6 text-purple-600" />
            產品管理
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            設定產品代碼、成本售價、規格圖示及庫存，供應商選單連動自廠商管理
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenAddModal}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold shadow-xs transition-all active:scale-98"
          >
            <Plus className="w-4 h-4" />
            新增產品
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="搜尋產品代碼、名稱、廠牌或規格..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all placeholder:text-slate-400"
          />
        </div>
        <div className="w-full md:w-64">
          <select
            value={selectedVendorFilter}
            onChange={(e) => setSelectedVendorFilter(e.target.value)}
            className="w-full py-2.5 px-3 text-sm bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 text-slate-700"
          >
            <option value="">全部供應商篩選</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.companyName}
              </option>
            ))}
          </select>
        </div>
        <div className="text-xs text-slate-500 self-center whitespace-nowrap">
          共 <span className="font-semibold text-slate-700">{filteredProducts.length}</span> 項商品
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-medium text-slate-700">查無產品資料</h3>
            <p className="text-xs text-slate-400 mt-1">
              {searchTerm || selectedVendorFilter ? '請調整篩選條件' : '點擊右上角「新增產品」開始建檔'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-600">
                  <th className="py-3 px-4 min-w-[140px] whitespace-nowrap">產品圖 / 代碼</th>
                  <th className="py-3 px-4 min-w-[200px]">產品名稱 / 廠牌</th>
                  <th className="py-3 px-4 min-w-[170px] whitespace-nowrap">供應商</th>
                  <th className="py-3 px-4 text-right min-w-[90px] whitespace-nowrap">成本價</th>
                  <th className="py-3 px-4 text-right min-w-[100px] whitespace-nowrap">建議售價</th>
                  <th className="py-3 px-4 text-center min-w-[80px] whitespace-nowrap">毛利率</th>
                  <th className="py-3 px-4 text-center min-w-[90px] whitespace-nowrap">庫存 / 單位</th>
                  <th className="py-3 px-4 text-center min-w-[90px] whitespace-nowrap">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((prod) => {
                  const profit = prod.price - prod.cost;
                  const rate = prod.price > 0 ? ((profit / prod.price) * 100).toFixed(0) : '0';
                  return (
                    <tr key={prod.id} className="hover:bg-purple-50/20 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div 
                            onClick={() => {
                              if (prod.imageUrl) {
                                setPreviewImage({
                                  isOpen: true,
                                  imageUrl: prod.imageUrl,
                                  title: prod.name,
                                  subtitle: prod.brand ? `廠牌：${prod.brand}` : undefined,
                                  code: prod.code,
                                  price: prod.price,
                                  specification: prod.specification
                                });
                              }
                            }}
                            className={`relative w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center group ${
                              prod.imageUrl ? 'cursor-pointer hover:ring-2 hover:ring-purple-500 hover:shadow-md transition-all' : ''
                            }`}
                            title={prod.imageUrl ? "點選放大檢視產品圖片" : "未設定圖片"}
                          >
                            {prod.imageUrl ? (
                              <>
                                <img
                                  src={prod.imageUrl}
                                  alt={prod.name}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
                                  onError={(e) => {
                                    // Fallback on error
                                    (e.target as HTMLElement).style.display = 'none';
                                  }}
                                />
                                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                  <ZoomIn className="w-4 h-4 drop-shadow-sm" />
                                </div>
                              </>
                            ) : (
                              <ImageIcon className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <span className="font-mono font-medium text-purple-700 text-xs block">
                              {prod.code}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800 max-w-[260px]">{prod.name}</div>
                        <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                          {prod.brand && <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-medium">{prod.brand}</span>}
                          {prod.specification && <span className="truncate max-w-[200px]" title={prod.specification}>{prod.specification}</span>}
                        </div>
                      </td>
                      <td className="py-3 px-4 min-w-[170px]">
                        {(() => {
                          const vendor = getVendor(prod.vendorId);
                          if (!vendor) {
                            return <span className="text-xs text-slate-400">未指定廠商</span>;
                          }
                          return (
                            <div className="flex flex-col">
                              <span className="font-semibold text-slate-800 text-xs whitespace-nowrap inline-block">
                                {vendor.companyName}
                              </span>
                              {vendor.englishName && (
                                <span className="text-[11px] text-slate-400 font-normal break-words leading-tight mt-0.5">
                                  {vendor.englishName}
                                </span>
                              )}
                            </div>
                          );
                        })()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-500 text-xs">
                        NT$ {prod.cost.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-800 text-sm">
                        NT$ {prod.price.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
                          Number(rate) >= 30 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : Number(rate) > 0 
                            ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          {rate}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-xs">
                        <span className="font-bold text-slate-700">{prod.stockQuantity}</span>
                        <span className="text-slate-400 ml-1">{prod.unit || '件'}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(prod)}
                            className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                            title="編輯產品"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onShowChangeLog(prod)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                            title="檢視異動記錄"
                          >
                            <History className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDelete(prod.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="刪除產品"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-8">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-bold text-slate-800">
                  {editingProduct ? '編輯產品資料' : '新增產品建檔'}
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

              {/* Row 1: 產品代碼 & 產品名稱 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    產品代碼 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.code || ''}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className={`w-full px-3 py-2 text-sm rounded-lg border font-mono ${
                      errors.code ? 'border-red-500 bg-red-50/30' : 'border-slate-200 focus:border-purple-500'
                    }`}
                    placeholder="例: PROD-001"
                  />
                  {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    產品名稱 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-3 py-2 text-sm rounded-lg border ${
                      errors.name ? 'border-red-500 bg-red-50/30' : 'border-slate-200 focus:border-purple-500'
                    }`}
                    placeholder="例: Dell PowerEdge R760 機架伺服器"
                  />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>
              </div>

              {/* Row 2: 供應商 (廠商管理連動*) & 廠牌 & 單位 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    供應商 (連動廠商) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.vendorId || ''}
                    onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
                    className={`w-full px-3 py-2 text-sm rounded-lg border bg-white ${
                      errors.vendorId ? 'border-red-500 bg-red-50/30' : 'border-slate-200 focus:border-purple-500'
                    }`}
                  >
                    <option value="">請選擇供應商</option>
                    {vendors.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.companyName} ({v.code})
                      </option>
                    ))}
                  </select>
                  {errors.vendorId && <p className="text-xs text-red-500 mt-1">{errors.vendorId}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">廠牌</label>
                  <input
                    type="text"
                    value={formData.brand || ''}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-purple-500"
                    placeholder="例: Cisco / Dell / 華碩"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">單位</label>
                  <select
                    value={formData.unit || '台'}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:border-purple-500"
                  >
                    <option value="台">台</option>
                    <option value="個">個</option>
                    <option value="組">組</option>
                    <option value="式">式</option>
                    <option value="套">套</option>
                    <option value="箱">箱</option>
                    <option value="包">包</option>
                    <option value="條">條</option>
                    <option value="支">支</option>
                  </select>
                </div>
              </div>

              {/* Row 3: 成本* & 售價* & 庫存數量 & 即時毛利預覽 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    成本價 (NT$) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.cost !== undefined ? formData.cost : ''}
                    onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 text-sm rounded-lg border font-mono ${
                      errors.cost ? 'border-red-500 bg-red-50/30' : 'border-slate-200 focus:border-purple-500'
                    }`}
                    placeholder="0"
                  />
                  {errors.cost && <p className="text-xs text-red-500 mt-1">{errors.cost}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    建議售價 (NT$) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.price !== undefined ? formData.price : ''}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 text-sm rounded-lg border font-mono font-bold text-slate-800 ${
                      errors.price ? 'border-red-500 bg-red-50/30' : 'border-slate-200 focus:border-purple-500'
                    }`}
                    placeholder="0"
                  />
                  {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">庫存數量</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.stockQuantity !== undefined ? formData.stockQuantity : ''}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 font-mono focus:border-purple-500"
                    placeholder="0"
                  />
                </div>
                {/* Real-time calculated margin display */}
                <div className="md:col-span-3 flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                  <span className="text-slate-500">預估單件毛利：</span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-semibold text-slate-700">
                      NT$ {marginProfit.toLocaleString()}
                    </span>
                    <span className={`font-semibold px-2 py-0.5 rounded ${
                      Number(marginRate) >= 30 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      毛利率 {marginRate}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Row 4: 產品圖片（本機檔案選取與線上圖片網址同時並存） */}
              <div className="space-y-3 bg-slate-50/80 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-purple-600" />
                    產品圖片設定（支援「本機圖檔」與「圖片網址」共存，皆可自由選取）
                  </label>
                  {formData.imageUrl && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-purple-100 text-purple-700">
                      {formData.imageUrl.startsWith('data:') ? '已載入本機圖檔' : '已載入網路圖片'}
                    </span>
                  )}
                </div>

                {/* Hidden Native File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png, image/jpeg, image/webp, image/gif"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="product-local-file-input"
                />

                {/* Coexisting Input Panels Grid: 本機選取 + 圖片網址 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Panel A: 本機檔案選取 / 拖曳 */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                    }}
                    onDrop={handleFileDrop}
                    className={`p-3.5 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center transition-all bg-white ${
                      isDragging
                        ? 'border-purple-500 bg-purple-50/80 scale-[1.01]'
                        : 'border-slate-300 hover:border-purple-400'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-1.5 shadow-2xs">
                      <FolderOpen className="w-4 h-4" />
                    </div>
                    <div className="text-xs font-bold text-slate-800">
                      方式一：本機選取或拖曳圖檔
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 mb-2.5">
                      支援 JPG / PNG / WebP（自動離線快取儲存）
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      開啟本機資料夾選取檔案
                    </button>
                  </div>

                  {/* Panel B: 圖片網址輸入與套用 */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-1">
                        <LinkIcon className="w-4 h-4 text-purple-600" />
                        方式二：線上圖片網址 (URL)
                      </div>
                      <p className="text-[11px] text-slate-400 mb-2">
                        輸入公開圖床或網路圖片 HTTP/HTTPS 網址
                      </p>
                      <div className="flex gap-1.5">
                        <input
                          id="product-image-url-input"
                          type="url"
                          value={urlInputText}
                          onChange={(e) => {
                            setUrlInputText(e.target.value);
                            // Also if user clears it completely and it was a URL, clear preview
                            if (!e.target.value && formData.imageUrl?.startsWith('http')) {
                              setFormData((prev) => ({ ...prev, imageUrl: '' }));
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleApplyUrl(urlInputText);
                            }
                          }}
                          placeholder="https://images.unsplash.com/..."
                          className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-200 placeholder:text-slate-400 font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => handleApplyUrl(urlInputText)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors shrink-0 flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          套用網址
                        </button>
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <span>貼上網址後點選「套用網址」即可預覽</span>
                      {urlInputText && urlInputText !== formData.imageUrl && (
                        <span className="text-amber-600 font-medium animate-pulse">
                          尚未套用
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Image Preview & Current Active Status Box */}
                {formData.imageUrl ? (
                  <div className="p-3 bg-white border border-purple-200/90 rounded-xl flex items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewImage({
                            isOpen: true,
                            imageUrl: formData.imageUrl!,
                            title: formData.name || '產品圖片預覽',
                            subtitle: formData.brand ? `廠牌：${formData.brand}` : undefined,
                            code: formData.code,
                            price: formData.price,
                            specification: formData.specification
                          });
                        }}
                        className="relative group w-14 h-14 rounded-lg border border-purple-200 overflow-hidden bg-slate-100 shrink-0 cursor-pointer hover:ring-2 hover:ring-purple-500 transition-all shadow-xs"
                        title="點選彈出大圖預覽"
                      >
                        <img
                          src={formData.imageUrl}
                          alt="產品預覽"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <ZoomIn className="w-4 h-4" />
                        </div>
                      </button>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800">
                            目前已設定圖片
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                              formData.imageUrl.startsWith('data:')
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {formData.imageUrl.startsWith('data:') ? '本機圖檔 (已快取)' : '網路圖片 (URL)'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate max-w-xs sm:max-w-md mt-0.5 font-mono">
                          {formData.imageUrl.startsWith('data:')
                            ? '本機已快取圖片，點選左側縮圖可放大檢視'
                            : formData.imageUrl}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewImage({
                            isOpen: true,
                            imageUrl: formData.imageUrl!,
                            title: formData.name || '產品圖片預覽',
                            subtitle: formData.brand ? `廠牌：${formData.brand}` : undefined,
                            code: formData.code,
                            price: formData.price,
                            specification: formData.specification
                          });
                        }}
                        className="px-2.5 py-1.5 text-xs text-purple-700 hover:bg-purple-50 rounded-lg border border-purple-200 font-medium transition-colors flex items-center gap-1"
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                        放大檢視
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, imageUrl: '' }));
                          setUrlInputText('');
                          showToast('已清除產品圖片', 'info');
                        }}
                        className="px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 font-medium transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        清除圖片
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-white border border-slate-200 rounded-xl text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
                    <Info className="w-4 h-4 text-slate-300" />
                    <span>尚未設定圖片，您可以直接「從本機選取檔案」或「輸入圖片網址並點選套用」</span>
                  </div>
                )}
              </div>

              {/* Row 5: 規格 */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">規格</label>
                <input
                  type="text"
                  value={formData.specification || ''}
                  onChange={(e) => setFormData({ ...formData, specification: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-purple-500"
                  placeholder="例: 48 埠 1G PoE+ / 4x 10G SFP+ / 715W 電源"
                />
              </div>

              {/* Row 6: 說明 */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">產品說明</label>
                <textarea
                  rows={2}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-purple-500"
                  placeholder="詳細功能敘述或代理特點..."
                />
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
                  className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-xs transition-colors"
                >
                  <Check className="w-4 h-4" />
                  儲存產品資料
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Image Preview Lightbox Modal */}
      {previewImage && (
        <ImagePreviewModal
          isOpen={previewImage.isOpen}
          onClose={() => setPreviewImage(null)}
          imageUrl={previewImage.imageUrl}
          title={previewImage.title}
          subtitle={previewImage.subtitle}
          code={previewImage.code}
          price={previewImage.price}
          specification={previewImage.specification}
        />
      )}
    </div>
  );
};
