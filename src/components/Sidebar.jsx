import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, CheckCircle, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ mobileOpen, onCloseMobile }) {
  const { logout } = useAuth();

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Content */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0F172A] text-white flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Logo Section */}
        <div className="h-20 flex items-center px-6 border-b border-slate-800">
          <div className="bg-white p-1.5 rounded-xl mr-3 flex-shrink-0">
            <img src="/logo.png" alt="SafeDrive Logo" className="h-8 w-auto object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-tight text-white leading-none">SafeDrive</span>
            <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-widest mt-1">Partner Portal</span>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          
          <NavLink
            to="/dashboard"
            onClick={handleLinkClick}
            end
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3.5 rounded-2xl font-bold transition-all duration-200 ${
                isActive 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50 scale-[1.02]' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`
            }
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Overview</span>
          </NavLink>

          <NavLink
            to="/dashboard/ready"
            onClick={handleLinkClick}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3.5 rounded-2xl font-bold transition-all duration-200 ${
                isActive 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50 scale-[1.02]' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`
            }
          >
            <ShoppingBag className="w-5 h-5" />
            <span>Ready to Sell</span>
          </NavLink>

          <NavLink
            to="/dashboard/activated"
            onClick={handleLinkClick}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3.5 rounded-2xl font-bold transition-all duration-200 ${
                isActive 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50 scale-[1.02]' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`
            }
          >
            <CheckCircle className="w-5 h-5" />
            <span>Activated Tags</span>
          </NavLink>

          <NavLink
            to="/dashboard/buy-bulk"
            onClick={handleLinkClick}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3.5 rounded-2xl font-bold transition-all duration-200 ${
                isActive 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50 scale-[1.02]' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`
            }
          >
            <ShoppingBag className="w-5 h-5" />
            <span>Buy Bulk Tags</span>
          </NavLink>

          <NavLink
            to="/dashboard/my-orders"
            onClick={handleLinkClick}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3.5 rounded-2xl font-bold transition-all duration-200 ${
                isActive 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50 scale-[1.02]' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`
            }
          >
            <CheckCircle className="w-5 h-5" />
            <span>My Bulk Orders</span>
          </NavLink>

        </div>

        {/* Logout Section */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={logout}
            className="flex items-center justify-center space-x-2 w-full px-4 py-3.5 bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 rounded-2xl font-bold transition-colors border border-transparent hover:border-red-500/30"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}
