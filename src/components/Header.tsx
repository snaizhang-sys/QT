import React, { useState } from 'react';
import { ActiveTab } from '../types';
import { 
  FileSpreadsheet, Users, Truck, Package, 
  RotateCcw, Menu, X, ShieldCheck, Database
} from 'lucide-react';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onResetData: () => void;
  counts: {
    customers: number;
    vendors: number;
    products: number;
    quotations: number;
  };
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onResetData,
  counts
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; count: number; color: string }[] = [
    { 
      id: 'quotations', 
      label: '報價單管理', 
      icon: <FileSpreadsheet className="w-4 h-4" />, 
      count: counts.quotations,
      color: 'bg-indigo-600 text-white' 
    },
    { 
      id: 'customers', 
      label: '客戶管理', 
      icon: <Users className="w-4 h-4" />, 
      count: counts.customers,
      color: 'bg-blue-600 text-white' 
    },
    { 
      id: 'vendors', 
      label: '廠商管理', 
      icon: <Truck className="w-4 h-4" />, 
      count: counts.vendors,
      color: 'bg-emerald-600 text-white' 
    },
    { 
      id: 'products', 
      label: '產品管理', 
      icon: <Package className="w-4 h-4" />, 
      count: counts.products,
      color: 'bg-purple-600 text-white' 
    }
  ];

  const handleTabClick = (tab: ActiveTab) => {
    onTabChange(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Company LOGO & System Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-800 flex items-center justify-center text-white font-black text-xl shadow-md shadow-indigo-200 shrink-0">
              Q
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 tracking-tight text-lg sm:text-xl">
                  報價單管理系統
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-semibold bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
                  SPA 純前端
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                智慧報價連動 · 客戶廠商商品整合 · LocalStorage 實時儲存
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? `${item.color} shadow-xs`
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {item.count}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Right Action: Reset Seed Data / Mobile Hamburger */}
          <div className="flex items-center gap-2">
            <button
              onClick={onResetData}
              title="重設為系統預設示範資料"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 border border-slate-200 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              示範資料重置
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="選單開關"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-2 shadow-lg animate-in slide-in-from-top-2 duration-150">
          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`flex items-center justify-between p-2.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? `${item.color} shadow-xs`
                      : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {item.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <Database className="w-3.5 h-3.5" />
              LocalStorage 本地儲存中
            </span>
            <button
              onClick={() => {
                onResetData();
                setIsMobileMenuOpen(false);
              }}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium py-1 px-2 rounded hover:bg-indigo-50"
            >
              回復示範資料
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
