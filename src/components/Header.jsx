import React from 'react';
import { Menu, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header({ onToggleSidebar }) {
  const { dealer } = useAuth();

  return (
    <header className="h-20 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      
      <div className="flex items-center">
        {/* Mobile menu button */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 -ml-2 mr-2 text-slate-500 hover:bg-slate-100 rounded-xl transition"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        <div className="hidden sm:block">
          <h1 className="text-xl font-black text-slate-800 tracking-tight">Partner Portal</h1>
          <p className="text-xs font-bold text-slate-400">Manage your tags and activations</p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <button className="p-2 text-slate-400 hover:text-[#1D56A5] hover:bg-blue-50 rounded-full transition relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        {/* User Profile */}
        <div className="flex items-center pl-4 border-l border-slate-200">
          <div className="text-right mr-3 hidden sm:block">
            <div className="flex items-center justify-end space-x-1.5">
              {dealer?.isVerifiedPartner && (
                <span className="bg-emerald-100 text-emerald-700 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center" title="Verified Partner">
                  ✓ Verified
                </span>
              )}
              <p className="text-sm font-black text-slate-900 leading-tight">{dealer?.name || 'Partner'}</p>
            </div>
            <p className="text-[10px] uppercase font-bold text-slate-400 mt-0.5">{dealer?.shopName || 'Authorized Dealer'}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 flex items-center justify-center font-black text-lg shadow-sm">
            {dealer?.name ? dealer.name.charAt(0).toUpperCase() : 'P'}
          </div>
        </div>
      </div>

    </header>
  );
}
