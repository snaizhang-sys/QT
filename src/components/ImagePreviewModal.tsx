import React from 'react';
import { X, ExternalLink, Tag, Package, DollarSign } from 'lucide-react';

interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
  subtitle?: string;
  code?: string;
  price?: number;
  specification?: string;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  title,
  subtitle,
  code,
  price,
  specification
}) => {
  if (!isOpen || !imageUrl) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200/80 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/10 text-purple-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{title}</h3>
                {code && (
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-purple-500/30 text-purple-200 border border-purple-400/30">
                    {code}
                  </span>
                )}
              </div>
              {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              title="在新分頁開啟原始圖片"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              title="關閉"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Large Image Container */}
        <div className="relative flex-1 min-h-[300px] max-h-[65vh] bg-slate-950 flex items-center justify-center p-4 overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            referrerPolicy="no-referrer"
            className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-2xl transition-all select-none"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>

        {/* Modal Footer with specs & details */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
          <div className="text-slate-600">
            {specification ? (
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">規格：</span>
                <span className="text-slate-600">{specification}</span>
              </div>
            ) : (
              <span className="text-slate-400">產品高畫質實體圖示預覽</span>
            )}
          </div>

          <div className="flex items-center gap-4 self-end sm:self-auto">
            {price !== undefined && (
              <div className="flex items-center gap-1 font-mono">
                <span className="text-slate-500">建議售價：</span>
                <span className="text-base font-black text-purple-700">
                  NT$ {price.toLocaleString()}
                </span>
              </div>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
            >
              關閉視窗
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
