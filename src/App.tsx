import React, { useState, useEffect } from 'react';
import { 
  FileText, Users, Building2, Package, Plus, Search, Edit, Trash2, 
  Printer, History, CheckCircle, Clock, AlertCircle, Send, Database, RefreshCw, Server
} from 'lucide-react';
import { Quotation, Customer, Vendor, Product } from './types';
import { initialCustomers, initialVendors, initialProducts, initialQuotations } from './mockData';
import QuotationModal from './components/QuotationModal';
import CustomerModal from './components/CustomerModal';
import VendorModal from './components/VendorModal';
import ProductModal from './components/ProductModal';
import PrintView from './components/PrintView';
import HistoryModal from './components/HistoryModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<'quotations' | 'customers' | 'vendors' | 'products'>('quotations');
  
  // 本地狀態管理
  const [quotations, setQuotations] = useState<Quotation[]>(() => {
    const saved = localStorage.getItem('quotations');
    return saved ? JSON.parse(saved) : initialQuotations;
  });
  
  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('customers');
    return saved ? JSON.parse(saved) : initialCustomers;
  });

  const [vendors, setVendors] = useState<Vendor[]>(() => {
    const saved = localStorage.getItem('vendors');
    return saved ? JSON.parse(saved) : initialVendors;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('products');
    return saved ? JSON.parse(saved) : initialProducts;
  });

  // Neon 資料庫連線狀態
  const [dbStatus, setDbStatus] = useState<{
    connected: boolean;
    provider: string;
    message: string;
    loading: boolean;
  }>({
    connected: false,
    provider: 'checking',
    message: '正在偵測連線狀態...',
    loading: true
  });
  const [showDbModal, setShowDbModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // 檢查後端與 Neon 連線狀態
  const checkDbConnection = async () => {
    setDbStatus(prev => ({ ...prev, loading: true }));
    try {
      const res = await fetch('/api/db-status');
      if (res.ok) {
        const data = await res.json();
        setDbStatus({
          connected: data.connected,
          provider: data.provider || (data.connected ? 'neon' : 'none'),
          message: data.message || (data.connected ? '已連線至 Neon PostgreSQL' : '未連線'),
          loading: false
        });
      } else {
        setDbStatus({
          connected: false,
          provider: 'offline',
          message: '未偵測到 /api 後端服務，目前處於離線 SPA 模式',
          loading: false
        });
      }
    } catch {
      setDbStatus({
        connected: false,
        provider: 'offline',
        message: '無法連線到後端 API，使用本機 LocalStorage 運行',
        loading: false
      });
    }
  };

  useEffect(() => {
    checkDbConnection();
  }, []);

  // 同步儲存至 LocalStorage 作為快取備份
  useEffect(() => {
    localStorage.setItem('quotations', JSON.stringify(quotations));
  }, [quotations]);

  useEffect(() => {
    localStorage.setItem('customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('vendors', JSON.stringify(vendors));
  }, [vendors]);

  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  // 模態視窗控制
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [printQuotation, setPrintQuotation] = useState<Quotation | null>(null);

  // 編輯項目
  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedHistoryQuote, setSelectedHistoryQuote] = useState<Quotation | null>(null);

  // 搜尋與篩選
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // 一鍵推送本機資料至 Neon
  const handlePushToCloud = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/sync/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customers, vendors, products, quotations })
      });
      const data = await res.json();
      if (res.ok) {
        alert('✅ 資料已成功推送到 Neon PostgreSQL 雲端資料庫！');
      } else {
        alert(`❌ 推送失敗: ${data.error || '請確認 DATABASE_URL 是否正確'}`);
      }
    } catch (e: any) {
      alert(`❌ 無法連線至伺服器: ${e.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // 從 Neon 拉取雲端資料
  const handlePullFromCloud = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/sync/pull');
      const data = await res.json();
      if (res.ok && data.fromDb) {
        if (data.customers?.length) setCustomers(data.customers);
        if (data.vendors?.length) setVendors(data.vendors);
        if (data.products?.length) setProducts(data.products);
        if (data.quotations?.length) setQuotations(data.quotations);
        alert('✅ 成功從 Neon 雲端資料庫載入最新資料！');
      } else {
        alert('⚠️ 雲端資料庫目前無資料或尚未連線');
      }
    } catch (e: any) {
      alert(`❌ 拉取失敗: ${e.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* 頂部導航列 */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-sm">
              Q
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold text-slate-900 leading-none">報價單管理系統</h1>
                {/* 動態連線狀態標籤 */}
                {dbStatus.loading ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" /> 連線檢查中
                  </span>
                ) : dbStatus.connected ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                    🟢 Neon PostgreSQL 已連線
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
                    🟡 Neon / 離線模式
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">智慧報價連動 · Neon / PostgreSQL 關聯式資料庫 · Vercel 雲端部署</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <nav className="flex space-x-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('quotations')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'quotations' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>報價單管理</span>
                <span className={`ml-1 px-1.5 py-0.2 rounded-full text-xs ${activeTab === 'quotations' ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {quotations.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('customers')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'customers' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>客戶管理</span>
                <span className={`ml-1 px-1.5 py-0.2 rounded-full text-xs ${activeTab === 'customers' ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {customers.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('vendors')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'vendors' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>廠商管理</span>
                <span className={`ml-1 px-1.5 py-0.2 rounded-full text-xs ${activeTab === 'vendors' ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {vendors.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('products')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'products' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>產品管理</span>
                <span className={`ml-1 px-1.5 py-0.2 rounded-full text-xs ${activeTab === 'products' ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {products.length}
                </span>
              </button>
            </nav>

            {/* Neon 設定按鈕 */}
            <button
              onClick={() => setShowDbModal(true)}
              className="flex items-center space-x-1 px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-xs"
              title="Neon 資料庫連線狀態與同步"
            >
              <Database className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Neon 設定</span>
            </button>
          </div>
        </div>
      </header>

      {/* 主內容區 */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'quotations' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-indigo-600" /> 報價單管理
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">選定客戶自動連動電話住址，選定產品自動帶出單價說明，複價與總價即時試算</p>
              </div>
              <button
                onClick={() => { setEditingQuotation(null); setIsQuoteModalOpen(true); }}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4 mr-1.5" /> 開立新報價單
              </button>
            </div>

            {/* 搜尋與篩選列 */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="搜尋報價單號、客戶名稱、業務負責人..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">全部狀態篩選</option>
                <option value="草稿">草稿</option>
                <option value="已發送">已發送</option>
                <option value="已確認">已確認</option>
                <option value="已作廢">已作廢</option>
              </select>
              <div className="text-xs text-slate-500 flex items-center px-2">
                共 {quotations.length} 張報價單
              </div>
            </div>

            {/* 報價單清單表格 */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                    <th className="py-3 px-4">報價單號</th>
                    <th className="py-3 px-4">客戶名稱</th>
                    <th className="py-3 px-4">報價 / 有效日期</th>
                    <th className="py-3 px-4">報價人員</th>
                    <th className="py-3 px-4">明細項數</th>
                    <th className="py-3 px-4">報價總額 (未稅)</th>
                    <th className="py-3 px-4">狀態</th>
                    <th className="py-3 px-4 text-center">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {quotations.map((q) => (
                    <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-indigo-600">{q.quoteNumber}</td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900">{q.customerName}</div>
                        <div className="text-xs text-slate-400 truncate max-w-xs">{q.customerAddress}</div>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-500">
                        <div>{q.date}</div>
                        <div className="text-slate-400">至 {q.validUntil}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-700">{q.salesPerson}</td>
                      <td className="py-3 px-4 text-slate-600">{q.items.length} 項</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">NT$ {q.subtotal.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          q.status === '已確認' ? 'bg-emerald-100 text-emerald-800' :
                          q.status === '已發送' ? 'bg-blue-100 text-blue-800' :
                          q.status === '已作廢' ? 'bg-rose-100 text-rose-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {q.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => setPrintQuotation(q)}
                            className="p-1 text-slate-500 hover:text-indigo-600 transition-colors"
                            title="列印 / 匯出 PDF"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => { setEditingQuotation(q); setIsQuoteModalOpen(true); }}
                            className="p-1 text-slate-500 hover:text-indigo-600 transition-colors"
                            title="編輯"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => { setSelectedHistoryQuote(q); setIsHistoryModalOpen(true); }}
                            className="p-1 text-slate-500 hover:text-indigo-600 transition-colors"
                            title="版本修訂歷程"
                          >
                            <History className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`確定要刪除報價單 ${q.quoteNumber} 嗎？`)) {
                                setQuotations(prev => prev.filter(item => item.id !== q.id));
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                            title="刪除"
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
          </div>
        )}

        {/* 客戶管理 */}
        {activeTab === 'customers' && (
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-bold text-slate-900">客戶基本資料</h2>
              <button
                onClick={() => { setEditingCustomer(null); setIsCustomerModalOpen(true); }}
                className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg"
              >
                + 新增客戶
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {customers.map(c => (
                <div key={c.id} className="py-3 flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{c.name} ({c.code})</div>
                    <div className="text-xs text-slate-500">聯絡人: {c.contactPerson} | 電話: {c.phone} | 統編: {c.taxId || '無'}</div>
                  </div>
                  <div className="space-x-2">
                    <button onClick={() => { setEditingCustomer(c); setIsCustomerModalOpen(true); }} className="text-indigo-600 text-xs">編輯</button>
                    <button onClick={() => setCustomers(prev => prev.filter(x => x.id !== c.id))} className="text-rose-600 text-xs">刪除</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 廠商管理 */}
        {activeTab === 'vendors' && (
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-bold text-slate-900">廠商基本資料</h2>
              <button
                onClick={() => { setEditingVendor(null); setIsVendorModalOpen(true); }}
                className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg"
              >
                + 新增廠商
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {vendors.map(v => (
                <div key={v.id} className="py-3 flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{v.name} ({v.code})</div>
                    <div className="text-xs text-slate-500">聯絡人: {v.contactPerson} | 電話: {v.phone}</div>
                  </div>
                  <div className="space-x-2">
                    <button onClick={() => { setEditingVendor(v); setIsVendorModalOpen(true); }} className="text-indigo-600 text-xs">編輯</button>
                    <button onClick={() => setVendors(prev => prev.filter(x => x.id !== v.id))} className="text-rose-600 text-xs">刪除</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 產品管理 */}
        {activeTab === 'products' && (
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-bold text-slate-900">產品與價目資料</h2>
              <button
                onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }}
                className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg"
              >
                + 新增產品
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {products.map(p => (
                <div key={p.id} className="py-3 flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{p.name} ({p.code})</div>
                    <div className="text-xs text-slate-500">標準售價: NT$ {p.standardPrice.toLocaleString()} | 單位: {p.unit}</div>
                  </div>
                  <div className="space-x-2">
                    <button onClick={() => { setEditingProduct(p); setIsProductModalOpen(true); }} className="text-indigo-600 text-xs">編輯</button>
                    <button onClick={() => setProducts(prev => prev.filter(x => x.id !== p.id))} className="text-rose-600 text-xs">刪除</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* 資料庫與同步管理彈窗 */}
      {showDbModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 flex items-center">
                <Database className="w-5 h-5 mr-2 text-emerald-600" /> Neon PostgreSQL 資料庫狀態
              </h3>
              <button onClick={() => setShowDbModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className={`p-4 rounded-xl border ${
              dbStatus.connected ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              <div className="font-semibold flex items-center">
                <span className={`w-2.5 h-2.5 rounded-full mr-2 ${dbStatus.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                {dbStatus.connected ? '🟢 已成功連線至 Neon 雲端資料庫' : '🟡 目前為 LocalStorage 離線模式'}
              </div>
              <p className="text-xs mt-1 text-slate-600">{dbStatus.message}</p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-700">雲端同步操作</h4>
              <div className="grid grid-cols-2 gap-3">
                <button
                  disabled={isSyncing}
                  onClick={handlePushToCloud}
                  className="flex items-center justify-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  <Server className="w-4 h-4 mr-1.5" />
                  {isSyncing ? '同步中...' : '推送到 Neon 雲端'}
                </button>
                <button
                  disabled={isSyncing}
                  onClick={handlePullFromCloud}
                  className="flex items-center justify-center px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  <RefreshCw className="w-4 h-4 mr-1.5" />
                  從 Neon 雲端載入
                </button>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
              <button
                onClick={checkDbConnection}
                className="text-xs text-indigo-600 hover:underline flex items-center"
              >
                <RefreshCw className="w-3 h-3 mr-1" /> 重新測試連線
              </button>
              <button
                onClick={() => setShowDbModal(false)}
                className="px-4 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-lg"
              >
                完成
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 互動視窗 (Modals) */}
      {isQuoteModalOpen && (
        <QuotationModal
          quotation={editingQuotation}
          customers={customers}
          vendors={vendors}
          products={products}
          onClose={() => setIsQuoteModalOpen(false)}
          onSave={(newQuote) => {
            setQuotations(prev => {
              const idx = prev.findIndex(x => x.id === newQuote.id);
              if (idx >= 0) {
                const updated = [...prev];
                updated[idx] = newQuote;
                return updated;
              }
              return [newQuote, ...prev];
            });
            setIsQuoteModalOpen(false);
          }}
        />
      )}

      {isCustomerModalOpen && (
        <CustomerModal
          customer={editingCustomer}
          onClose={() => setIsCustomerModalOpen(false)}
          onSave={(c) => {
            setCustomers(prev => {
              const idx = prev.findIndex(x => x.id === c.id);
              if (idx >= 0) {
                const u = [...prev];
                u[idx] = c;
                return u;
              }
              return [...prev, c];
            });
            setIsCustomerModalOpen(false);
          }}
        />
      )}

      {isVendorModalOpen && (
        <VendorModal
          vendor={editingVendor}
          onClose={() => setIsVendorModalOpen(false)}
          onSave={(v) => {
            setVendors(prev => {
              const idx = prev.findIndex(x => x.id === v.id);
              if (idx >= 0) {
                const u = [...prev];
                u[idx] = v;
                return u;
              }
              return [...prev, v];
            });
            setIsVendorModalOpen(false);
          }}
        />
      )}

      {isProductModalOpen && (
        <ProductModal
          product={editingProduct}
          vendors={vendors}
          onClose={() => setIsProductModalOpen(false)}
          onSave={(p) => {
            setProducts(prev => {
              const idx = prev.findIndex(x => x.id === p.id);
              if (idx >= 0) {
                const u = [...prev];
                u[idx] = p;
                return u;
              }
              return [...prev, p];
            });
            setIsProductModalOpen(false);
          }}
        />
      )}

      {printQuotation && (
        <PrintView quotation={printQuotation} onClose={() => setPrintQuotation(null)} />
      )}

      {isHistoryModalOpen && selectedHistoryQuote && (
        <HistoryModal
          quotation={selectedHistoryQuote}
          onClose={() => setIsHistoryModalOpen(false)}
          onRestore={(oldQuote) => {
            setQuotations(prev => prev.map(q => q.id === oldQuote.id ? oldQuote : q));
            setIsHistoryModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
