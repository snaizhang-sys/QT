export interface QuotationItem {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  spec: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number;
  costPrice?: number;
  remark?: string;
}

export interface Quotation {
  id: string;
  quoteNumber: string;
  date: string;
  validUntil: string;
  customerId: string;
  customerName: string;
  customerAddress?: string;
  contactPerson?: string;
  contactPhone?: string;
  paymentTerms: string;
  salesPerson: string;
  status: '草稿' | '已發送' | '已確認' | '已作廢';
  items: QuotationItem[];
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
  history?: {
    timestamp: string;
    version: number;
    salesPerson: string;
    notes: string;
  }[];
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  contactPerson: string;
  phone: string;
  email?: string;
  address: string;
  taxId?: string;
  paymentTerms?: string;
  notes?: string;
}

export interface Vendor {
  id: string;
  code: string;
  name: string;
  contactPerson: string;
  phone: string;
  email?: string;
  address?: string;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  spec: string;
  unit: string;
  costPrice: number;
  standardPrice: number;
  vendorId?: string;
}
