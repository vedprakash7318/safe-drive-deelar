import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE } from '../context/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Loader2, QrCode, CheckCircle, ArrowRight, LayoutDashboard } from 'lucide-react';

export default function Dashboard() {
  const { authHeader, dealer } = useAuth();
  const [qrs, setQrs] = useState([]);
  const [dashboardMessage, setDashboardMessage] = useState('Welcome to your new Partner Portal. Manage your inventory, activate tags for your customers, and track your sales all in one place.');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQRs();
  }, []);

  const fetchQRs = async () => {
    try {
      const res = await axios.get(`${API_BASE}/dealer/qrs`, { headers: authHeader });
      if (res.data.success) {
        setQrs(res.data.qrs);
        if (res.data.dashboardMessage) {
          setDashboardMessage(res.data.dashboardMessage);
        }
      }
    } catch (err) {
      toast.error('Failed to load summary');
    } finally {
      setLoading(false);
    }
  };

  const pendingCount = qrs.filter(qr => qr.status === 'ASSIGNED_TO_DEALER').length;
  const activeCount = qrs.filter(qr => qr.status === 'ACTIVE').length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#1D56A5]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="bg-gradient-to-br from-[#1D56A5] to-blue-800 rounded-3xl p-6 sm:p-10 text-white shadow-xl shadow-blue-900/20 relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl sm:text-4xl font-black mb-2 tracking-tight">Hello, {dealer?.name} 👋</h1>
          <p className="text-blue-100 font-medium max-w-xl text-sm sm:text-base">
            {dashboardMessage}
          </p>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4 pointer-events-none">
          <LayoutDashboard className="w-64 h-64" />
        </div>
        <div className="absolute left-1/4 bottom-0 w-32 h-32 bg-white rounded-full blur-3xl opacity-10"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        
        {/* Ready to Sell Card */}
        <Link 
          to="/dashboard/ready" 
          className="group bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:border-emerald-200 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden relative"
        >
          <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-50 rounded-bl-[100px] -z-0 transition-transform group-hover:scale-110"></div>
          
          <div className="relative z-10">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
              <QrCode className="w-7 h-7" />
            </div>
            <h2 className="text-5xl font-black text-slate-800 tracking-tight">{pendingCount}</h2>
            <p className="text-sm font-bold text-slate-500 mt-2 uppercase tracking-widest">Ready to Sell</p>
          </div>
          
          <div className="mt-8 flex items-center text-emerald-600 font-bold text-sm relative z-10 group-hover:text-emerald-700">
            <span>Activate new tags</span>
            <ArrowRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Activated Tags Card */}
        <Link 
          to="/dashboard/activated" 
          className="group bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-200 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden relative"
        >
          <div className="absolute right-0 top-0 w-32 h-32 bg-blue-50 rounded-bl-[100px] -z-0 transition-transform group-hover:scale-110"></div>
          
          <div className="relative z-10">
            <div className="w-14 h-14 bg-blue-100 text-[#1D56A5] rounded-2xl flex items-center justify-center mb-6 shadow-inner">
              <CheckCircle className="w-7 h-7" />
            </div>
            <h2 className="text-5xl font-black text-slate-800 tracking-tight">{activeCount}</h2>
            <p className="text-sm font-bold text-slate-500 mt-2 uppercase tracking-widest">Activated Tags</p>
          </div>
          
          <div className="mt-8 flex items-center text-[#1D56A5] font-bold text-sm relative z-10 group-hover:text-blue-800">
            <span>View activation history</span>
            <ArrowRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

      </div>
      
    </div>
  );
}
