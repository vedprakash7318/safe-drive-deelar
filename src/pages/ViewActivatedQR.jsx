import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth, API_BASE } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ArrowLeft, Loader2, User, Truck, Shield, Calendar } from 'lucide-react';

export default function ViewActivatedQR() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authHeader } = useAuth();
  const [qr, setQr] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQRDetails();
  }, [id]);

  const fetchQRDetails = async () => {
    try {
      // Re-use the existing endpoint and filter (assuming there's no single fetch endpoint for dealer yet)
      const res = await axios.get(`${API_BASE}/dealer/qrs`, { headers: authHeader });
      if (res.data.success) {
        const found = res.data.qrs.find(q => q._id === id);
        if (found) {
          setQr(found);
        } else {
          toast.error('QR not found');
          navigate('/dashboard/activated');
        }
      }
    } catch (err) {
      toast.error('Failed to load details');
      navigate('/dashboard/activated');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#1D56A5]" />
      </div>
    );
  }

  if (!qr) return null;

  const isLuggage = qr.qrFor === 'Luggage';

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => navigate('/dashboard/activated')}
          className="p-2 bg-white rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 shadow-sm transition border border-slate-200"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center">
            Tag Details
          </h1>
          <p className="text-sm font-semibold text-slate-500 mt-1">
            {qr.activationDate ? `Activated on ${new Date(qr.activationDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}` : 'Activation date unknown'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 text-slate-50/50 pointer-events-none">
          <Shield className="w-64 h-64" />
        </div>
        
        <div className="relative z-10 space-y-8">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-6">
            <div>
              <p className="text-xs uppercase font-bold text-slate-400 tracking-widest mb-1">Tag ID</p>
              <p className="text-3xl font-black text-[#1D56A5] tracking-tight">{qr.copyCode}</p>
            </div>
            <div className="text-right">
              <span className="inline-block bg-emerald-100 text-emerald-700 text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full">
                Active
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Customer Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-black uppercase text-slate-400 tracking-wider flex items-center">
                <User className="w-4 h-4 mr-2" /> Customer Information
              </h3>
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-4">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Name</p>
                  <p className="font-black text-slate-800 text-lg">{qr.userId?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Phone Number</p>
                  <p className="font-bold text-slate-800">{qr.userId?.phone || 'N/A'}</p>
                </div>
                {qr.userId?.email && (
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Email</p>
                    <p className="font-bold text-slate-800">{qr.userId.email}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Asset Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-black uppercase text-slate-400 tracking-wider flex items-center">
                <Truck className="w-4 h-4 mr-2" /> {qr.qrFor || 'Vehicle'} Details
              </h3>
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-4">
                
                {isLuggage ? (
                  <>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Item Name</p>
                      <p className="font-black text-slate-800 text-lg">{qr.vehicleId?.itemName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Item Type</p>
                      <p className="font-bold text-slate-800">{qr.vehicleId?.itemType || 'N/A'}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Vehicle Registration No.</p>
                      <div className="inline-block bg-white border-2 border-slate-300 rounded-lg px-4 py-2 mt-1">
                        <p className="font-black text-slate-800 text-xl tracking-widest">{qr.vehicleId?.vehicleNumber || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Brand</p>
                        <p className="font-bold text-slate-800">{qr.vehicleId?.vehicleBrand || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Model</p>
                        <p className="font-bold text-slate-800">{qr.vehicleId?.vehicleModel || 'N/A'}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

          </div>
          
        </div>
      </div>

    </div>
  );
}
