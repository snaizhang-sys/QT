import { Customer, Vendor, Product, Quotation, ChangeLogItem } from '../types';

export function formatDateTime(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
}

export function formatDate(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDays(date: Date, days: number): string {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return formatDate(next);
}

// Initial Sample Seed Data
export const INITIAL_VENDORS: Vendor[] = [
  {
    id: 'vend-1',
    code: 'VEND-001',
    companyName: '聯創科技有限公司',
    contactPerson: '張志偉',
    englishName: 'TechVenture Co., Ltd.',
    department: '企業業務處',
    jobTitle: '資深業務經理',
    phone: '02-27891234',
    email: 'chihwei.chang@techventure.com.tw',
    taxId: '54892147',
    address: '台北市南港區園區街3號8樓',
    paymentTerms: '月結30天電匯',
    notes: '核心伺服器與邊緣運算硬體原廠授權代理商',
    createdAt: '2026-08-15 09:30:00',
    updatedAt: '2026-08-15 09:30:00',
    changeLog: [
      { timestamp: '2026-08-15 09:30:00', action: '系統建立資料' }
    ]
  },
  {
    id: 'vend-2',
    code: 'VEND-002',
    companyName: '光訊網通元件股份有限公司',
    contactPerson: '林怡君',
    englishName: 'OptiCom Networks Corp.',
    department: '銷售部',
    jobTitle: '專案副理',
    phone: '03-5778899',
    email: 'yichun.lin@opticom.tw',
    taxId: '89562143',
    address: '新竹科學園區工業東四路22號',
    paymentTerms: '次月15日電匯',
    notes: '高階企業級路由器與網路交換器供應商',
    createdAt: '2026-08-18 14:15:00',
    updatedAt: '2026-08-18 14:15:00',
    changeLog: [
      { timestamp: '2026-08-18 14:15:00', action: '系統建立資料' }
    ]
  },
  {
    id: 'vend-3',
    code: 'VEND-003',
    companyName: '智雲資訊軟體股份有限公司',
    contactPerson: '陳俊宏',
    englishName: 'SmartCloud Solutions Inc.',
    department: '通路合作部',
    jobTitle: '客戶成功經理',
    phone: '04-23589900',
    email: 'sales@smartcloud.com.tw',
    taxId: '28741935',
    address: '台中市西屯區台灣大道三段658號12樓',
    paymentTerms: '預付訂金50%，驗收50%',
    notes: '企業資安防火牆授權與雲端備份軟體原廠',
    createdAt: '2026-08-20 11:00:00',
    updatedAt: '2026-08-20 11:00:00',
    changeLog: [
      { timestamp: '2026-08-20 11:00:00', action: '系統建立資料' }
    ]
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    code: 'CUST-001',
    companyName: '宏達數位創新智慧股份有限公司',
    contactPerson: '黃信榮',
    englishName: 'Grand Innovation Technologies',
    department: '資訊研發處',
    jobTitle: '資訊總監 (CIO)',
    phone: '02-87654321',
    email: 'sr.huang@grandinno.com.tw',
    taxId: '12345678',
    address: '台北市內湖區瑞光路513號6樓',
    paymentTerms: '月結30天',
    notes: '年度長期維護合約客戶，預算充裕且回款穩定',
    createdAt: '2026-08-22 10:00:00',
    updatedAt: '2026-08-22 10:00:00',
    changeLog: [
      { timestamp: '2026-08-22 10:00:00', action: '系統建立資料' }
    ]
  },
  {
    id: 'cust-2',
    code: 'CUST-002',
    companyName: '東捷物流商務股份有限公司',
    contactPerson: '王珮珊',
    englishName: 'EastJet Logistics Corp.',
    department: '營運管理部',
    jobTitle: '採購課長',
    phone: '03-3861234',
    email: 'ps.wang@eastjet-logistics.com',
    taxId: '23456789',
    address: '桃園市大園區航翔路101號物流園區A棟',
    paymentTerms: '貨到驗收後30天',
    notes: '倉庫自動化升級專案採購中',
    createdAt: '2026-08-25 15:30:00',
    updatedAt: '2026-08-25 15:30:00',
    changeLog: [
      { timestamp: '2026-08-25 15:30:00', action: '系統建立資料' }
    ]
  },
  {
    id: 'cust-3',
    code: 'CUST-003',
    companyName: '安聯精密工業股份有限公司',
    contactPerson: '郭冠廷',
    englishName: 'Alliance Precision Industry',
    department: '總經理室',
    jobTitle: '資深特助',
    phone: '04-7654321',
    email: 'kt.kuo@alliance-ind.com.tw',
    taxId: '34567890',
    address: '台中市南屯區精科路28號',
    paymentTerms: '訂金30%、交機尾款70%',
    notes: '智慧製造產線數位化專案評估',
    createdAt: '2026-08-28 16:45:00',
    updatedAt: '2026-08-28 16:45:00',
    changeLog: [
      { timestamp: '2026-08-28 16:45:00', action: '系統建立資料' }
    ]
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    code: 'PROD-001',
    name: 'Dell PowerEdge R760 企業機架式伺服器',
    cost: 168000,
    price: 245000,
    unit: '台',
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&q=80',
    brand: 'Dell Technologies',
    specification: '2x Intel Xeon Gold 6430 / 128GB DDR5 / 4x 1.92TB NVMe SSD / 雙冗餘電源',
    description: '專為企業核心虛擬化平台與高運算負載資料庫設計之 2U 高可用伺服器',
    stockQuantity: 8,
    vendorId: 'vend-1',
    createdAt: '2026-08-20 10:20:00',
    updatedAt: '2026-08-20 10:20:00',
    changeLog: [
      { timestamp: '2026-08-20 10:20:00', action: '系統建立商品' }
    ]
  },
  {
    id: 'prod-2',
    code: 'PROD-002',
    name: 'Cisco Catalyst 9300 48埠 PoE+ 企業級交換器',
    cost: 82000,
    price: 126000,
    unit: '台',
    imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&q=80',
    brand: 'Cisco',
    specification: '48x 1G PoE+ (總供電 715W) / 4x 10G SFP+ 上行光纖埠 / Network Essentials 授權',
    description: '支援第3層進階路由與企業零信任網路架構',
    stockQuantity: 15,
    vendorId: 'vend-2',
    createdAt: '2026-08-21 11:30:00',
    updatedAt: '2026-08-21 11:30:00',
    changeLog: [
      { timestamp: '2026-08-21 11:30:00', action: '系統建立商品' }
    ]
  },
  {
    id: 'prod-3',
    code: 'PROD-003',
    name: 'FortiGate 100F 新世代高可用防火牆',
    cost: 58000,
    price: 89000,
    unit: '台',
    imageUrl: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=400&q=80',
    brand: 'Fortinet',
    specification: '含1年 UTP 全功能資安授權 (IPS, 防毒, 網頁過濾, 應用程式控制)',
    description: '具備 1 Gbps 威脅防禦效能與雙電源供應設計',
    stockQuantity: 12,
    vendorId: 'vend-3',
    createdAt: '2026-08-22 14:00:00',
    updatedAt: '2026-08-22 14:00:00',
    changeLog: [
      { timestamp: '2026-08-22 14:00:00', action: '系統建立商品' }
    ]
  },
  {
    id: 'prod-4',
    code: 'PROD-004',
    name: 'APC Smart-UPS 3000VA 在線互動式不斷電系統',
    cost: 38000,
    price: 52000,
    unit: '台',
    imageUrl: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&q=80',
    brand: 'APC by Schneider',
    specification: '3000VA / 2700W 2U 機架式 / 純純正弦波輸出 / 含網路管理卡 NMC3',
    description: '提供伺服器機房穩壓備援，支援斷電自動平順關機排程',
    stockQuantity: 6,
    vendorId: 'vend-1',
    createdAt: '2026-08-23 09:15:00',
    updatedAt: '2026-08-23 09:15:00',
    changeLog: [
      { timestamp: '2026-08-23 09:15:00', action: '系統建立商品' }
    ]
  },
  {
    id: 'prod-5',
    code: 'PROD-005',
    name: '專業機房佈線建置與系統安裝導入服務',
    cost: 15000,
    price: 36000,
    unit: '式',
    imageUrl: 'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?w=400&q=80',
    brand: '自有技術顧問團隊',
    specification: '含 Cat.6A 六類無遮蔽雙絞線敷設、配線架跳接、機櫃整線及5年工程保固',
    description: '資深工程師到府施工與驗收測試報告',
    stockQuantity: 99,
    vendorId: 'vend-2',
    createdAt: '2026-08-24 13:40:00',
    updatedAt: '2026-08-24 13:40:00',
    changeLog: [
      { timestamp: '2026-08-24 13:40:00', action: '系統建立商品' }
    ]
  }
];

export const INITIAL_QUOTATIONS: Quotation[] = [
  {
    id: 'quot-1',
    quotationNumber: 'QT-20260901-001',
    quotationDate: '2026-09-01',
    validUntil: '2026-09-30',
    customerId: 'cust-1',
    customerName: '宏達數位創新智慧股份有限公司',
    salesPerson: '張宇翔',
    contactPhone: '02-87654321',
    address: '台北市內湖區瑞光路513號6樓',
    items: [
      {
        id: 'item-1',
        productId: 'prod-1',
        productName: 'Dell PowerEdge R760 企業機架式伺服器',
        unitPrice: 245000,
        description: '2x Intel Xeon Gold 6430 / 128GB DDR5 / 4x 1.92TB NVMe SSD / 雙冗餘電源',
        quantity: 2,
        subtotal: 490000
      },
      {
        id: 'item-2',
        productId: 'prod-2',
        productName: 'Cisco Catalyst 9300 48埠 PoE+ 企業級交換器',
        unitPrice: 126000,
        description: '48x 1G PoE+ (總供電 715W) / 4x 10G SFP+ 上行光纖埠',
        quantity: 1,
        subtotal: 126000
      },
      {
        id: 'item-3',
        productId: 'prod-5',
        productName: '專業機房佈線建置與系統安裝導入服務',
        unitPrice: 36000,
        description: '資深工程師到府施工與驗收測試報告',
        quantity: 1,
        subtotal: 36000
      }
    ],
    totalAmount: 652000,
    taxRate: 0.05,
    notes: '1. 本報價單有效期限30天。\n2. 交貨期：合約簽訂後 14 個工作天。\n3. 保固期：硬體原廠3年隔工作日到府保固，施工部分保固1年。',
    status: '已確認',
    createdAt: '2026-09-01 11:20:00',
    updatedAt: '2026-09-02 15:40:00',
    changeLog: [
      { timestamp: '2026-09-01 11:20:00', action: '建立報價單', note: '初版提供客戶確認' },
      { timestamp: '2026-09-02 15:40:00', action: '更新狀態為已確認', note: '客戶 CIO 已簽回確認單' }
    ]
  },
  {
    id: 'quot-2',
    quotationNumber: 'QT-20260908-002',
    quotationDate: '2026-09-08',
    validUntil: '2026-09-22',
    customerId: 'cust-2',
    customerName: '東捷物流商務股份有限公司',
    salesPerson: '林詩涵',
    contactPhone: '03-3861234',
    address: '桃園市大園區航翔路101號物流園區A棟',
    items: [
      {
        id: 'item-4',
        productId: 'prod-3',
        productName: 'FortiGate 100F 新世代高可用防火牆',
        unitPrice: 89000,
        description: '含1年 UTP 全功能資安授權 (IPS, 防毒, 網頁過濾, 應用程式控制)',
        quantity: 2,
        subtotal: 178000
      },
      {
        id: 'item-5',
        productId: 'prod-4',
        productName: 'APC Smart-UPS 3000VA 在線互動式不斷電系統',
        unitPrice: 52000,
        description: '3000VA / 2700W 2U 機架式 / 純純正弦波輸出',
        quantity: 2,
        subtotal: 104000
      }
    ],
    totalAmount: 282000,
    taxRate: 0.05,
    notes: '本案配合物流中心週年慶網路升級排程，預計於週末離峰時間進場施作。',
    status: '已發送',
    createdAt: '2026-09-08 14:30:00',
    updatedAt: '2026-09-08 14:30:00',
    changeLog: [
      { timestamp: '2026-09-08 14:30:00', action: '建立並寄出報價單' }
    ]
  }
];

const STORAGE_KEYS = {
  CUSTOMERS: 'quote_app_customers_v1',
  VENDORS: 'quote_app_vendors_v1',
  PRODUCTS: 'quote_app_products_v1',
  QUOTATIONS: 'quote_app_quotations_v1'
};

export function loadCustomers(): Customer[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    if (!raw) {
      saveCustomers(INITIAL_CUSTOMERS);
      return INITIAL_CUSTOMERS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load customers from localStorage', e);
    return INITIAL_CUSTOMERS;
  }
}

export function saveCustomers(customers: Customer[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  } catch (e) {
    console.error('Failed to save customers', e);
  }
}

export function loadVendors(): Vendor[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.VENDORS);
    if (!raw) {
      saveVendors(INITIAL_VENDORS);
      return INITIAL_VENDORS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load vendors', e);
    return INITIAL_VENDORS;
  }
}

export function saveVendors(vendors: Vendor[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.VENDORS, JSON.stringify(vendors));
  } catch (e) {
    console.error('Failed to save vendors', e);
  }
}

export function loadProducts(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!raw) {
      saveProducts(INITIAL_PRODUCTS);
      return INITIAL_PRODUCTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load products', e);
    return INITIAL_PRODUCTS;
  }
}

export function saveProducts(products: Product[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  } catch (e) {
    console.error('Failed to save products', e);
  }
}

export function loadQuotations(): Quotation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QUOTATIONS);
    if (!raw) {
      saveQuotations(INITIAL_QUOTATIONS);
      return INITIAL_QUOTATIONS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load quotations', e);
    return INITIAL_QUOTATIONS;
  }
}

export function saveQuotations(quotations: Quotation[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.QUOTATIONS, JSON.stringify(quotations));
  } catch (e) {
    console.error('Failed to save quotations', e);
  }
}

export function resetAllToSeedData() {
  saveCustomers(INITIAL_CUSTOMERS);
  saveVendors(INITIAL_VENDORS);
  saveProducts(INITIAL_PRODUCTS);
  saveQuotations(INITIAL_QUOTATIONS);
}

// Code generators
export function generateCustomerCode(existingList: Customer[]): string {
  const prefix = 'CUST-';
  let maxNum = 0;
  for (const item of existingList) {
    if (item.code && item.code.startsWith(prefix)) {
      const numPart = parseInt(item.code.replace(prefix, ''), 10);
      if (!isNaN(numPart) && numPart > maxNum) {
        maxNum = numPart;
      }
    }
  }
  return `${prefix}${String(maxNum + 1).padStart(3, '0')}`;
}

export function generateVendorCode(existingList: Vendor[]): string {
  const prefix = 'VEND-';
  let maxNum = 0;
  for (const item of existingList) {
    if (item.code && item.code.startsWith(prefix)) {
      const numPart = parseInt(item.code.replace(prefix, ''), 10);
      if (!isNaN(numPart) && numPart > maxNum) {
        maxNum = numPart;
      }
    }
  }
  return `${prefix}${String(maxNum + 1).padStart(3, '0')}`;
}

export function generateProductCode(existingList: Product[]): string {
  const prefix = 'PROD-';
  let maxNum = 0;
  for (const item of existingList) {
    if (item.code && item.code.startsWith(prefix)) {
      const numPart = parseInt(item.code.replace(prefix, ''), 10);
      if (!isNaN(numPart) && numPart > maxNum) {
        maxNum = numPart;
      }
    }
  }
  return `${prefix}${String(maxNum + 1).padStart(3, '0')}`;
}

export function generateQuotationNumber(existingList: Quotation[]): string {
  const todayStr = formatDate().replace(/-/g, '');
  const prefix = `QT-${todayStr}-`;
  let maxNum = 0;
  for (const item of existingList) {
    if (item.quotationNumber && item.quotationNumber.startsWith(prefix)) {
      const numPart = parseInt(item.quotationNumber.replace(prefix, ''), 10);
      if (!isNaN(numPart) && numPart > maxNum) {
        maxNum = numPart;
      }
    }
  }
  return `${prefix}${String(maxNum + 1).padStart(3, '0')}`;
}
