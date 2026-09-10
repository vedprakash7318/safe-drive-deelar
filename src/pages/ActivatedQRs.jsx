import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Search, Loader2, CheckCircle, Tag, CheckCircle2, Eye, X, User, Truck, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ActivatedQRs() {
  const { authHeader } = useAuth();
  const [qrs, setQrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchCode, setSearchCode] = useState('');

  useEffect(() => {
    fetchQRs();
  }, []);

  const fetchQRs = async () => {
    try {
      const res = await axios.get(`${API_BASE}/dealer/qrs`, { headers: authHeader });
      if (res.data.success) {
        setQrs(res.data.qrs);
      }
    } catch (err) {
      toast.error('Failed to load QR codes');
    } finally {
      setLoading(false);
    }
  };

  const activeQRs = qrs.filter(qr => qr.status === 'ACTIVE');
  const filteredActive = activeQRs.filter(qr => 
    qr.copyCode?.toLowerCase().includes(searchCode.toLowerCase()) || 
    qr.publicToken?.toLowerCase().includes(searchCode.toLowerCase()) ||
    qr.userId?.name?.toLowerCase().includes(searchCode.toLowerCase()) ||
    qr.userId?.phone?.includes(searchCode)
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center">
            <CheckCircle className="w-7 h-7 mr-2 text-emerald-600" />
            Activated Tags
          </h1>
          <p className="text-sm font-semibold text-slate-500 mt-1">Review tags you have successfully activated</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by ID, name or phone..."
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {filteredActive.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center text-slate-400">
            <CheckCircle2 className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-lg font-bold text-slate-500">No Activated Tags</p>
            <p className="text-sm mt-1">You haven't activated any tags yet or none match your search.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredActive.map(qr => (
              <div key={qr._id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0 border border-emerald-100">
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 text-lg tracking-tight">{qr.copyCode}</h3>
                    <div className="text-xs font-bold text-slate-500 flex flex-wrap items-center mt-1 gap-2">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded">{qr.qrFor || 'Car'}</span>
                      <span className="text-slate-400">•</span>
                      <span>👤 {qr.userId?.name || 'Unknown'}</span>
                      <span className="text-slate-400">•</span>
                      <span>📱 {qr.userId?.phone || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4 w-full sm:w-auto">
                  <div className="text-left sm:text-right bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-lg flex-1 sm:flex-none">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Activated On</p>
                    <p className="text-sm font-black text-slate-700">
                      {qr.activationDate ? new Date(qr.activationDate).toLocaleDateString('en-GB') : 'Unknown'}
                    </p>
                  </div>
                  <Link 
                    to={`/dashboard/activated/${qr._id}`}
                    className="p-2.5 bg-blue-50 text-[#1D56A5] hover:bg-blue-100 rounded-xl transition-colors shadow-sm"
                    title="View Details"
                  >
                    <Eye className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
