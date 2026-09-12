export interface ChangeLogItem {
  timestamp: string;
  action: string;
  note?: string;
  operator?: string;
}

export interface Customer {
  id: string;
  code: string; // 客戶代碼*
  companyName: string; // 公司名稱*
  contactPerson: string; // 聯絡窗口*
  englishName?: string; // 英文名
  department?: string; // 部門
  jobTitle?: string; // 職稱
  phone: string; // 電話*
  email: string; // Email*
  taxId: string; // 統編*
  address: string; // 住址*
  paymentTerms?: string; // 付款條件
  notes?: string; // 備註
  createdAt: string; // 建立時間
  updatedAt: string; // 異動記錄
  changeLog: ChangeLogItem[];
}

export interface Vendor {
  id: string;
  code: string; // 廠商代碼*
  companyName: string; // 公司名稱*
  contactPerson: string; // 聯絡窗口*
  englishName?: string; // 英文名
  department?: string; // 部門
  jobTitle?: string; // 職稱
  phone: string; // 電話*
  email: string; // Email*
  taxId: string; // 統編*
  address: string; // 住址*
  paymentTerms?: string; // 付款條件
  notes?: string; // 備註
  createdAt: string; // 建立時間
  updatedAt: string; // 異動記錄
  changeLog: ChangeLogItem[];
}

export interface Product {
  id: string;
  code: string; // 產品代碼*
  name: string; // 產品名稱*
  cost: number; // 成本*
  price: number; // 售價*
  unit?: string; // 單位 (台/個/式/組/箱...)
  imageUrl?: string; // 圖片（支援圖片 URL 預覽）
  brand?: string; // 廠牌
  specification?: string; // 規格
  description?: string; // 說明
  stockQuantity: number; // 庫存數量
  vendorId: string; // 供應商*（由「廠商管理」資料帶入下拉選單）
  createdAt: string; // 建立時間
  updatedAt: string; // 異動記錄
  changeLog: ChangeLogItem[];
}

export interface QuotationItem {
  id: string;
  productId: string; // 產品*
  productName: string;
  unitPrice: number; // 單價* (選定後自動帶出，可手動微調)
  description: string; // 說明 (選定後自動帶出，可手動修改)
  quantity: number; // 數量*
  subtotal: number; // 複價* (單價 × 數量)
}

export interface Quotation {
  id: string;
  quotationNumber: string; // 報價單號*（系統自動編號）
  quotationDate: string; // 報價日期*
  validUntil: string; // 有效期限*
  customerId: string; // 客戶名稱*（由「客戶管理」資料帶入）
  customerName: string;
  salesPerson: string; // 報價人員*
  contactPhone: string; // 連絡電話*
  address: string; // 住址*
  items: QuotationItem[]; // 報價明細
  totalAmount: number; // 總價（自動加總所有明細複價）
  taxRate?: number; // 稅率 0 or 0.05
  notes?: string; // 備註條款
  status?: '草稿' | '已發送' | '已確認' | '已過期' | '已作廢';
  createdAt: string; // 建立時間
  updatedAt: string; // 異動記錄
  changeLog: ChangeLogItem[];
}

export type ActiveTab = 'quotations' | 'customers' | 'vendors' | 'products';
