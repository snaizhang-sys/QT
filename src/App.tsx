import React, { useState, useEffect } from 'react';
import { Customer, Vendor, Product, Quotation, ActiveTab, ChangeLogItem } from './types';
import { 
  loadCustomers, saveCustomers, 
  loadVendors, saveVendors, 
  loadProducts, saveProducts, 
  loadQuotations, saveQuotations,
  resetAllToSeedData 
} from './utils/storage';
import { Header } from './components/Header';
import { CustomerManager } from './components/CustomerManager';
import { VendorManager } from './components/VendorManager';
import { ProductManager } from './components/ProductManager';
import { QuotationManager } from './components/QuotationManager';
import { ConfirmModal } from './components/ConfirmModal';
import { ChangeLogModal } from './components/ChangeLogModal';
import { QuotationPrintView } from './components/QuotationPrintView';
import { ToastContainer, ToastMessage } from './components/Toast';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<ActiveTab>('quotations');

  // Main Datasets (Synced with LocalStorage)
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Toast System
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modals State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const [changeLogModal, setChangeLogModal] = useState<{
    isOpen: boolean;
    title: string;
    itemCode: string;
    createdAt: string;
    updatedAt: string;
    changeLog: ChangeLogItem[];
  }>({
    isOpen: false,
    title: '',
    itemCode: '',
    createdAt: '',
    updatedAt: '',
    changeLog: []
  });

  const [printModal, setPrintModal] = useState<{
    isOpen: boolean;
    quotation: Quotation | null;
  }>({
    isOpen: false,
    quotation: null
  });

  // Initial Load from LocalStorage
  useEffect(() => {
    const c = loadCustomers();
    const v = loadVendors();
    const p = loadProducts();
    const q = loadQuotations();

    setCustomers(c);
    setVendors(v);
    setProducts(p);
    setQuotations(q);
    setIsLoaded(true);
  }, []);

  // Toast Helper
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, type, message }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // --- Customer Operations ---
  const handleSaveCustomer = (customer: Customer) => {
    const exists = customers.some((c) => c.id === customer.id);
    let updated: Customer[];
    if (exists) {
      updated = customers.map((c) => (c.id === customer.id ? customer : c));
    } else {
      updated = [customer, ...customers];
    }
    setCustomers(updated);
    saveCustomers(updated);
  };

  const handleDeleteCustomer = (id: string) => {
    const target = customers.find((c) => c.id === id);
    if (!target) return;

    // Check if any quotation uses this customer
    const usedInQuotes = quotations.filter((q) => q.customerId === id);
    let warningMsg = `確定要刪除客戶【${target.companyName} (${target.code})】嗎？此動作將無法復原。`;
    if (usedInQuotes.length > 0) {
      warningMsg = `警告：目前有 ${usedInQuotes.length} 張報價單關聯至此客戶【${target.companyName}】！確定仍要刪除嗎？`;
    }

    setConfirmModal({
      isOpen: true,
      title: '刪除客戶確認',
      message: warningMsg,
      onConfirm: () => {
        const updated = customers.filter((c) => c.id !== id);
        setCustomers(updated);
        saveCustomers(updated);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        showToast(`已刪除客戶【${target.companyName}】`, 'info');
      }
    });
  };

  // --- Vendor Operations ---
  const handleSaveVendor = (vendor: Vendor) => {
    const exists = vendors.some((v) => v.id === vendor.id);
    let updated: Vendor[];
    if (exists) {
      updated = vendors.map((v) => (v.id === vendor.id ? vendor : v));
    } else {
      updated = [vendor, ...vendors];
    }
    setVendors(updated);
    saveVendors(updated);
  };

  const handleDeleteVendor = (id: string) => {
    const target = vendors.find((v) => v.id === id);
    if (!target) return;

    const usedInProducts = products.filter((p) => p.vendorId === id);
    let warningMsg = `確定要刪除廠商【${target.companyName} (${target.code})】嗎？此動作無法復原。`;
    if (usedInProducts.length > 0) {
      warningMsg = `警告：目前有 ${usedInProducts.length} 個產品指定此廠商為供應商！刪除後產品將無供應商關聯。確定要刪除嗎？`;
    }

    setConfirmModal({
      isOpen: true,
      title: '刪除廠商確認',
      message: warningMsg,
      onConfirm: () => {
        const updated = vendors.filter((v) => v.id !== id);
        setVendors(updated);
        saveVendors(updated);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        showToast(`已刪除廠商【${target.companyName}】`, 'info');
      }
    });
  };

  // --- Product Operations ---
  const handleSaveProduct = (product: Product) => {
    const exists = products.some((p) => p.id === product.id);
    let updated: Product[];
    if (exists) {
      updated = products.map((p) => (p.id === product.id ? product : p));
    } else {
      updated = [product, ...products];
    }
    setProducts(updated);
    saveProducts(updated);
  };

  const handleDeleteProduct = (id: string) => {
    const target = products.find((p) => p.id === id);
    if (!target) return;

    setConfirmModal({
      isOpen: true,
      title: '刪除產品確認',
      message: `確定要刪除產品【${target.name} (${target.code})】嗎？此動作無法復原。`,
      onConfirm: () => {
        const updated = products.filter((p) => p.id !== id);
        setProducts(updated);
        saveProducts(updated);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        showToast(`已刪除產品【${target.name}】`, 'info');
      }
    });
  };

  // --- Quotation Operations ---
  const handleSaveQuotation = (quotation: Quotation) => {
    const exists = quotations.some((q) => q.id === quotation.id);
    let updated: Quotation[];
    if (exists) {
      updated = quotations.map((q) => (q.id === quotation.id ? quotation : q));
    } else {
      updated = [quotation, ...quotations];
    }
    setQuotations(updated);
    saveQuotations(updated);
  };

  const handleDeleteQuotation = (id: string) => {
    const target = quotations.find((q) => q.id === id);
    if (!target) return;

    setConfirmModal({
      isOpen: true,
      title: '刪除報價單確認',
      message: `確定要刪除報價單【${target.quotationNumber} (${target.customerName})】嗎？此動作無法復原。`,
      onConfirm: () => {
        const updated = quotations.filter((q) => q.id !== id);
        setQuotations(updated);
        saveQuotations(updated);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        showToast(`已刪除報價單【${target.quotationNumber}】`, 'info');
      }
    });
  };

  // --- Reset All Data to Demo Seed ---
  const handleResetData = () => {
    setConfirmModal({
      isOpen: true,
      title: '示範資料重置確認',
      message: '這將會清除您目前在瀏覽器中所有異動，並重新載入系統預設示範資料（客戶、廠商、產品及報價單）。確定要繼續嗎？',
      onConfirm: () => {
        resetAllToSeedData();
        setCustomers(loadCustomers());
        setVendors(loadVendors());
        setProducts(loadProducts());
        setQuotations(loadQuotations());
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        showToast('已成功回復系統預設示範資料！', 'success');
      }
    });
  };

  // Show ChangeLog Modal
  const handleOpenChangeLog = (entity: { 
    companyName?: string; 
    name?: string; 
    quotationNumber?: string; 
    code?: string;
    createdAt: string; 
    updatedAt: string; 
    changeLog: ChangeLogItem[];
  }) => {
    const title = entity.companyName || entity.name || entity.quotationNumber || '項目';
    const code = entity.code || entity.quotationNumber || '';
    setChangeLogModal({
      isOpen: true,
      title,
      itemCode: code,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      changeLog: entity.changeLog || []
    });
  };

  // Show Print View Modal
  const handleOpenPrint = (quotation: Quotation) => {
    setPrintModal({
      isOpen: true,
      quotation
    });
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-slate-500 font-medium">報價單管理系統載入中...</p>
        </div>
      </div>
    );
  }

  // Find customer for the print preview
  const printCustomer = printModal.quotation 
    ? customers.find((c) => c.id === printModal.quotation?.customerId)
    : undefined;

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col">
      {/* Top Navbar */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onResetData={handleResetData}
        counts={{
          customers: customers.length,
          vendors: vendors.length,
          products: products.length,
          quotations: quotations.length
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'quotations' && (
          <QuotationManager
            quotations={quotations}
            customers={customers}
            products={products}
            onSave={handleSaveQuotation}
            onDelete={handleDeleteQuotation}
            onShowChangeLog={handleOpenChangeLog}
            onPrint={handleOpenPrint}
            showToast={showToast}
          />
        )}

        {activeTab === 'customers' && (
          <CustomerManager
            customers={customers}
            onSave={handleSaveCustomer}
            onDelete={handleDeleteCustomer}
            onShowChangeLog={handleOpenChangeLog}
            showToast={showToast}
          />
        )}

        {activeTab === 'vendors' && (
          <VendorManager
            vendors={vendors}
            onSave={handleSaveVendor}
            onDelete={handleDeleteVendor}
            onShowChangeLog={handleOpenChangeLog}
            showToast={showToast}
          />
        )}

        {activeTab === 'products' && (
          <ProductManager
            products={products}
            vendors={vendors}
            onSave={handleSaveProduct}
            onDelete={handleDeleteProduct}
            onShowChangeLog={handleOpenChangeLog}
            showToast={showToast}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500 print:hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>報價單管理系統 · 純前端 SPA 架構 · 支援 RWD 響應式與 LocalStorage 資料暫存</span>
          <span className="font-mono text-slate-400">v1.0.0 · SmartQuote System</span>
        </div>
      </footer>

      {/* Global Modals */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />

      <ChangeLogModal
        isOpen={changeLogModal.isOpen}
        onClose={() => setChangeLogModal((prev) => ({ ...prev, isOpen: false }))}
        title={changeLogModal.title}
        itemCode={changeLogModal.itemCode}
        createdAt={changeLogModal.createdAt}
        updatedAt={changeLogModal.updatedAt}
        changeLog={changeLogModal.changeLog}
      />

      <QuotationPrintView
        isOpen={printModal.isOpen}
        onClose={() => setPrintModal({ isOpen: false, quotation: null })}
        quotation={printModal.quotation}
        customer={printCustomer}
      />

      {/* Notification Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
