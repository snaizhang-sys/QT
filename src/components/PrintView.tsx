import React from 'react';
import { Quotation } from '../types';
import { Printer, X } from 'lucide-react';

interface PrintViewProps {
  quotation: Quotation;
  onClose: () => void;
}

export default function PrintView({ quotation, onClose }: PrintViewProps) {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-8 shadow-2xl space-y-6 my-8">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4 print:hidden">
          <h3 className="text-lg font-bold text-slate-900">報價單預覽與列印</h3>
          <div className="flex space-x-3">
            <button
              onClick={() => window.print()}
              className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg"
            >
              <Printer className="w-4 h-4 mr-1.5" /> 列印 / 另存 PDF
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* 可列印範圍 */}
        <div id="printable-quotation-content" className="space-y-6 text-slate-800 font-sans">
          <div className="flex justify-between items-start border-b-2 border-indigo-600 pb-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900">專 業 報 價 單</h1>
              <p className="text-xs text-slate-500 mt-1">智慧資訊技術解決方案顧問團隊</p>
            </div>
            <div className="text-right text-xs space-y-1">
              <div className="font-mono font-bold text-indigo-700 text-base">{quotation.quoteNumber}</div>
              <div>報價日期：{quotation.date}</div>
              <div>有效期限：{quotation.validUntil}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl">
            <div className="space-y-1">
              <div className="font-bold text-slate-900 text-sm">{quotation.customerName}</div>
              <div>聯絡窗口：{quotation.contactPerson || '業務窗口'}</div>
              <div>聯絡電話：{quotation.contactPhone || '未提供'}</div>
              <div>送達地址：{quotation.customerAddress || '台灣營運處'}</div>
            </div>
            <div className="space-y-1 text-right">
              <div className="font-semibold text-slate-700">業務代表：{quotation.salesPerson}</div>
              <div>付款條件：{quotation.paymentTerms}</div>
              <div>當前狀態：<span className="font-bold text-indigo-600">{quotation.status}</span></div>
            </div>
          </div>

          <table className="w-full text-left text-xs border border-slate-200">
            <thead className="bg-slate-100 border-b border-slate-200 font-semibold">
              <tr>
                <th className="p-2.5">項次</th>
                <th className="p-2.5">品名與規格</th>
                <th className="p-2.5 text-center">數量</th>
                <th className="p-2.5 text-center">單位</th>
                <th className="p-2.5 text-right">單價</th>
                <th className="p-2.5 text-right">複價小計</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {quotation.items.map((it, idx) => (
                <tr key={it.id}>
                  <td className="p-2.5 text-slate-500">{idx + 1}</td>
                  <td className="p-2.5">
                    <div className="font-semibold text-slate-900">{it.productName}</div>
                    <div className="text-slate-400 text-xxs">{it.spec}</div>
                  </td>
                  <td className="p-2.5 text-center">{it.quantity}</td>
                  <td className="p-2.5 text-center">{it.unit}</td>
                  <td className="p-2.5 text-right">NT$ {it.unitPrice.toLocaleString()}</td>
                  <td className="p-2.5 text-right font-semibold">NT$ {it.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end">
            <div className="w-64 space-y-1.5 text-xs text-right">
              <div className="flex justify-between">
                <span>合計金額 (未稅)：</span>
                <span className="font-semibold">NT$ {quotation.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>營業稅 (5%)：</span>
                <span className="font-semibold">NT$ {quotation.tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-indigo-700 border-t border-slate-300 pt-1.5">
                <span>總計金額 (含稅)：</span>
                <span>NT$ {quotation.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4 text-xs text-slate-500">
            <div className="font-bold text-slate-700 mb-1">備註說明：</div>
            <p>{quotation.notes || '無特殊約定事項。'}</p>
          </div>

          <div className="grid grid-cols-2 gap-8 pt-8 text-center text-xs">
            <div className="border-t border-slate-300 pt-2 text-slate-400">
              客戶簽章回傳
            </div>
            <div className="border-t border-slate-300 pt-2 text-slate-400">
              報價主管簽章
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
