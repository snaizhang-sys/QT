import React from 'react';
import { Quotation, Customer } from '../types';
import { Printer, X, FileText, CheckCircle } from 'lucide-react';

interface QuotationPrintViewProps {
  quotation: Quotation | null;
  customer?: Customer;
  isOpen: boolean;
  onClose: () => void;
}

export const QuotationPrintView: React.FC<QuotationPrintViewProps> = ({
  quotation,
  customer,
  isOpen,
  onClose
}) => {
  if (!isOpen || !quotation) return null;

  const handlePrint = () => {
    window.print();
  };

  const taxAmount = quotation.taxRate ? Math.round(quotation.totalAmount * quotation.taxRate) : 0;
  const grandTotal = quotation.totalAmount + taxAmount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden my-8 print:m-0 print:border-none print:shadow-none print:max-w-none print:w-full">
        {/* Modal Toolbar - Hidden when printing */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold">報價單預覽與列印</h3>
            <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
              {quotation.quotationNumber}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-colors shadow-xs"
            >
              <Printer className="w-4 h-4" />
              列印 / 另存 PDF
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet (A4 ratio feel) */}
        <div className="p-8 md:p-12 text-slate-800 bg-white" id="printable-quotation-content">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between border-b-2 border-slate-900 pb-6 gap-6">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow-xs">
                  Q
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">智匯數位科技有限公司</h1>
                  <p className="text-xs text-slate-500">SmartQuote Enterprise Solutions</p>
                </div>
              </div>
              <div className="mt-3 text-xs text-slate-500 space-y-0.5">
                <p>地址：114 台北市內湖區科技一路 88 號 10 樓</p>
                <p>電話：(02) 2658-9900 ｜ 統一編號：88997766</p>
                <p>電子郵件：sales@smartquote-tw.com</p>
              </div>
            </div>

            <div className="text-left md:text-right">
              <h2 className="text-3xl font-black text-blue-900 tracking-widest uppercase">報價單</h2>
              <p className="text-xs text-slate-400 tracking-wider">OFFICIAL QUOTATION</p>
              <div className="mt-3 space-y-1 text-xs">
                <div className="flex md:justify-end gap-2">
                  <span className="text-slate-500">報價單號：</span>
                  <span className="font-mono font-bold text-slate-900">{quotation.quotationNumber}</span>
                </div>
                <div className="flex md:justify-end gap-2">
                  <span className="text-slate-500">報價日期：</span>
                  <span className="font-mono text-slate-800">{quotation.quotationDate}</span>
                </div>
                <div className="flex md:justify-end gap-2">
                  <span className="text-slate-500">有效期限：</span>
                  <span className="font-mono text-slate-800">{quotation.validUntil}</span>
                </div>
                <div className="flex md:justify-end gap-2">
                  <span className="text-slate-500">業務負責：</span>
                  <span className="font-semibold text-slate-900">{quotation.salesPerson}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer / Bill To Box */}
          <div className="my-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">客戶資訊 (Customer Details)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
              <div>
                <span className="text-slate-500 text-xs">客戶名稱：</span>
                <span className="font-bold text-slate-900 ml-1">{quotation.customerName}</span>
                {customer?.taxId && (
                  <span className="text-xs text-slate-500 ml-2 font-mono">（統編：{customer.taxId}）</span>
                )}
              </div>
              <div>
                <span className="text-slate-500 text-xs">聯絡窗口：</span>
                <span className="font-medium text-slate-800 ml-1">{customer?.contactPerson || '指定窗口'}</span>
              </div>
              <div>
                <span className="text-slate-500 text-xs">連絡電話：</span>
                <span className="font-mono text-slate-800 ml-1">{quotation.contactPhone}</span>
              </div>
              <div>
                <span className="text-slate-500 text-xs">電子郵件：</span>
                <span className="text-slate-800 ml-1">{customer?.email || '無'}</span>
              </div>
              <div className="md:col-span-2">
                <span className="text-slate-500 text-xs">送貨／服務住址：</span>
                <span className="text-slate-800 ml-1">{quotation.address}</span>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mt-6 border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-xs font-bold text-slate-700">
                  <th className="py-3 px-4 w-12 text-center">項次</th>
                  <th className="py-3 px-4">產品品名及規格說明</th>
                  <th className="py-3 px-4 w-20 text-center">數量</th>
                  <th className="py-3 px-4 w-28 text-right">單價 (未稅)</th>
                  <th className="py-3 px-4 w-32 text-right">複價 (小計)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {quotation.items.map((item, index) => (
                  <tr key={item.id} className="text-slate-800">
                    <td className="py-3.5 px-4 text-center font-mono text-xs text-slate-500">
                      {index + 1}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{item.productName}</div>
                      {item.description && (
                        <div className="text-xs text-slate-500 mt-1 whitespace-pre-line leading-relaxed">
                          {item.description}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-semibold">
                      {item.quantity}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-700">
                      NT$ {item.unitPrice.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                      NT$ {item.subtotal.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Section */}
          <div className="mt-6 flex flex-col md:flex-row justify-between gap-6">
            <div className="flex-1 text-xs text-slate-600 bg-slate-50/70 p-4 rounded-lg border border-slate-200">
              <h5 className="font-bold text-slate-800 mb-2">備註條款與付款說明：</h5>
              <div className="whitespace-pre-line leading-relaxed">
                {quotation.notes || '1. 報價單有效期限如上所示。\n2. 如蒙惠顧，請簽名或蓋統一發票章後回傳以利備貨。\n3. 保固條件依原廠出廠規定執行。'}
              </div>
            </div>

            <div className="w-full md:w-72 space-y-2 text-sm">
              <div className="flex justify-between py-1 text-slate-600">
                <span>合計金額 (未稅)：</span>
                <span className="font-mono font-semibold">NT$ {quotation.totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 text-slate-600">
                <span>營業稅 5% (VAT)：</span>
                <span className="font-mono">NT$ {taxAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 border-t-2 border-slate-900 text-base font-black text-slate-900">
                <span>報價總計 (含稅)：</span>
                <span className="font-mono text-blue-700">NT$ {grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="mt-12 pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs text-slate-600">
            <div>
              <p className="font-bold text-slate-800 mb-8">報價單位簽章 (Authorized Signature)：</p>
              <div className="border-b border-dashed border-slate-400 w-48 mb-1"></div>
              <p className="text-slate-400">智匯數位科技有限公司 / {quotation.salesPerson}</p>
            </div>
            <div>
              <p className="font-bold text-slate-800 mb-8">客戶簽回確認 (Client Confirmation)：</p>
              <div className="border-b border-dashed border-slate-400 w-48 mb-1"></div>
              <p className="text-slate-400">請簽章回傳以確立正式訂購契約</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
