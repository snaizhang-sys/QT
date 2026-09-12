import React from 'react';
import { History, X, Clock, Calendar } from 'lucide-react';
import { ChangeLogItem } from '../types';

interface ChangeLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  itemCode: string;
  createdAt: string;
  updatedAt: string;
  changeLog: ChangeLogItem[];
}

export const ChangeLogModal: React.FC<ChangeLogModalProps> = ({
  isOpen,
  onClose,
  title,
  itemCode,
  createdAt,
  updatedAt,
  changeLog
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200"
        role="dialog"
        aria-modal="true"
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-base font-bold text-slate-800">異動歷史紀錄</h3>
              <p className="text-xs text-slate-500 font-mono">{title} ({itemCode})</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Metadata Cards */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-xs">
            <div>
              <span className="text-slate-500 flex items-center gap-1 mb-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> 建立時間
              </span>
              <span className="font-medium text-slate-800 font-mono">{createdAt || '無資料'}</span>
            </div>
            <div>
              <span className="text-slate-500 flex items-center gap-1 mb-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> 最後異動時間
              </span>
              <span className="font-medium text-slate-800 font-mono">{updatedAt || '無資料'}</span>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">異動日誌列表</h4>
            {changeLog && changeLog.length > 0 ? (
              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-indigo-100">
                {changeLog.map((log, idx) => (
                  <div key={idx} className="relative group">
                    <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-indigo-600 ring-4 ring-indigo-50" />
                    <div className="bg-white border border-slate-200/70 p-3 rounded-lg shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-800">{log.action}</span>
                        <span className="text-xs text-slate-400 font-mono">{log.timestamp}</span>
                      </div>
                      {log.note && (
                        <p className="mt-1 text-xs text-slate-600 bg-slate-50 p-1.5 rounded">{log.note}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">尚無詳細歷史異動紀錄</p>
            )}
          </div>
        </div>

        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors shadow-2xs"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
};
