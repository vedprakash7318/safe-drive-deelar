import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Search, Loader2, UserPlus, Tag, ShoppingBag, X, QrCode, CheckCircle } from 'lucide-react';

export default function ReadyToSell() {
  const { authHeader } = useAuth();
  const [qrs, setQrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [selectedQR, setSelectedQR] = useState(null);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [searchCode, setSearchCode] = useState('');

  const [activationStep, setActivationStep] = useState(1);
  const [otp, setOtp] = useState('');
  const [sendingOTP, setSendingOTP] = useState(false);
  const [verifyingOTP, setVerifyingOTP] = useState(false);

  const [customerForm, setCustomerForm] = useState({
    customerPhone: '',
    customerName: '',
    customerEmail: '',
    vehicleNumber: '',
    vehicleBrand: '',
    vehicleModel: '',
    itemName: '',
    itemType: '',
    sellingPrice: '',
    gender: 'MALE',
    emergencyContact1Name: '',
    emergencyContact1Phone: '',
    emergencyContact2Name: '',
    emergencyContact2Phone: ''
  });

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

  const handleActivateClick = (qr) => {
    setSelectedQR(qr);
    setActivationStep(1);
    setOtp('');
    setCustomerForm({
      customerPhone: '',
      customerName: '',
      customerEmail: '',
      vehicleNumber: '',
      vehicleBrand: '',
      vehicleModel: '',
      itemName: '',
      itemType: ''
    });
    setShowActivateModal(true);
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (customerForm.customerPhone.length < 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }
    setSendingOTP(true);
    try {
      const res = await axios.post(`${API_BASE}/dealer/qrs/send-otp`, {
        phone: customerForm.customerPhone
      }, { headers: authHeader });
      if (res.data.success) {
        toast.success(res.data.message);
        setActivationStep(2);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setSendingOTP(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length < 6) {
      toast.error('Please enter the 6-digit OTP');
      return;
    }
    setVerifyingOTP(true);
    try {
      const res = await axios.post(`${API_BASE}/dealer/qrs/verify-otp`, {
        phone: customerForm.customerPhone,
        otp
      }, { headers: authHeader });
      if (res.data.success) {
        toast.success('OTP Verified!');
        setActivationStep(3);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setVerifyingOTP(false);
    }
  };

  const handleActivateSubmit = async (e) => {
    e.preventDefault();
    setActivating(true);
    try {
      const res = await axios.post(`${API_BASE}/dealer/qrs/activate`, {
        qrId: selectedQR._id,
        ...customerForm
      }, { headers: authHeader });
      
      if (res.data.success) {
        toast.success(res.data.message || 'QR Activated Successfully!');
        setShowActivateModal(false);
        fetchQRs();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Activation failed');
    } finally {
      setActivating(false);
    }
  };

  const pendingQRs = qrs.filter(qr => qr.status === 'ASSIGNED_TO_DEALER');
  const filteredPending = pendingQRs.filter(qr => 
    qr.copyCode?.toLowerCase().includes(searchCode.toLowerCase()) || 
    qr.publicToken?.toLowerCase().includes(searchCode.toLowerCase())
  );

  const isLuggage = selectedQR?.qrFor === 'Luggage';

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
            <ShoppingBag className="w-7 h-7 mr-2 text-emerald-600" />
            Ready to Sell
          </h1>
          <p className="text-sm font-semibold text-slate-500 mt-1">Activate tags for your customers instantly</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search QR code..."
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {filteredPending.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center text-slate-400">
            <Tag className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-lg font-bold text-slate-500">No Tags Ready to Sell</p>
            <p className="text-sm mt-1">All tags have been sold or you need more inventory.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredPending.map(qr => (
              <div key={qr._id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors group">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0 border border-emerald-100 group-hover:scale-105 transition-transform">
                    <QrCode className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 text-lg tracking-tight">{qr.copyCode}</h3>
                    <p className="text-xs font-bold text-slate-500 flex items-center mt-0.5">
                      <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded mr-2">{qr.qrFor || 'Car'}</span>
                      {qr.qrType === 'DIGITAL' ? 'Digital Tag' : 'Physical Tag'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleActivateClick(qr)}
                  className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-black rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center hover:scale-[1.02]"
                >
                  <UserPlus className="w-4 h-4 mr-2" /> Activate
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Activation Modal */}
      {showActivateModal && selectedQR && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            
            <div className="bg-slate-50 border-b border-slate-100 p-5 flex justify-between items-center shrink-0 relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-xl font-black text-slate-900 flex items-center">
                  <UserPlus className="w-5 h-5 mr-2 text-emerald-600" />
                  Activate {selectedQR.copyCode}
                </h2>
                <p className="text-xs font-bold text-slate-500 mt-1">{selectedQR.qrFor || 'Car'} Tag</p>
              </div>
              <button 
                onClick={() => setShowActivateModal(false)}
                className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-800 shadow-sm border border-slate-200 relative z-10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute -right-6 -top-6 text-slate-200/50">
                <QrCode className="w-32 h-32" />
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              {/* Step 1: Send OTP */}
              {activationStep === 1 && (
                <form onSubmit={handleSendOTP} className="space-y-5">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">📱</span>
                    </div>
                    <h3 className="font-bold text-slate-800">Customer Phone Number</h3>
                    <p className="text-xs text-slate-500 mt-1">We'll send an OTP to verify the customer</p>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Mobile Number</label>
                    <input
                      type="tel"
                      required
                      maxLength="10"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-lg font-bold text-center tracking-widest focus:outline-none focus:border-[#1D56A5] focus:ring-2 focus:ring-[#1D56A5]/20 transition-all"
                      placeholder="9876543210"
                      value={customerForm.customerPhone}
                      onChange={(e) => setCustomerForm({...customerForm, customerPhone: e.target.value.replace(/\D/g, '')})}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={sendingOTP || customerForm.customerPhone.length < 10}
                    className="w-full py-3.5 bg-[#1D56A5] hover:bg-blue-800 text-white font-black rounded-xl shadow-lg shadow-blue-900/20 transition-all disabled:opacity-50 disabled:shadow-none flex justify-center items-center text-sm"
                  >
                    {sendingOTP ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send OTP'}
                  </button>
                </form>
              )}

              {/* Step 2: Verify OTP */}
              {activationStep === 2 && (
                <form onSubmit={handleVerifyOTP} className="space-y-5 animate-in slide-in-from-right-8 duration-300">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">🔐</span>
                    </div>
                    <h3 className="font-bold text-slate-800">Enter OTP</h3>
                    <p className="text-xs text-slate-500 mt-1">Sent to +91 {customerForm.customerPhone}</p>
                  </div>
                  
                  <div>
                    <input
                      type="text"
                      required
                      maxLength="6"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-2xl font-black text-center tracking-[0.5em] focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                      placeholder="------"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setActivationStep(1)}
                      className="w-1/3 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors text-sm"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={verifyingOTP || otp.length < 6}
                      className="w-2/3 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50 disabled:shadow-none flex justify-center items-center text-sm"
                    >
                      {verifyingOTP ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify OTP'}
                    </button>
                  </div>
                </form>
              )}

              {/* Step 3: Customer Details */}
              {activationStep === 3 && (
                <form onSubmit={handleActivateSubmit} className="space-y-4 animate-in slide-in-from-right-8 duration-300">
                  <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 p-3 rounded-xl text-xs font-bold flex items-center mb-4">
                    <CheckCircle className="w-4 h-4 mr-2 shrink-0" />
                    Phone verified! Please enter details.
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Customer Name *</label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-[#1D56A5] transition-colors"
                        placeholder="John Doe"
                        value={customerForm.customerName}
                        onChange={(e) => setCustomerForm({...customerForm, customerName: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Gender *</label>
                      <select
                        required
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-[#1D56A5] transition-colors"
                        value={customerForm.gender}
                        onChange={(e) => setCustomerForm({...customerForm, gender: e.target.value})}
                      >
                        <option value="MALE">👨 Male</option>
                        <option value="FEMALE">👩 Female</option>
                        <option value="OTHER">⚧ Other</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Email (Optional)</label>
                    <input
                      type="email"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-[#1D56A5] transition-colors"
                      placeholder="john@example.com"
                      value={customerForm.customerEmail}
                      onChange={(e) => setCustomerForm({...customerForm, customerEmail: e.target.value})}
                    />
                  </div>

                  {!isLuggage ? (
                    <>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Vehicle Number *</label>
                        <input
                          type="text"
                          required
                          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold uppercase focus:outline-none focus:border-[#1D56A5] transition-colors"
                          placeholder="DL01AB1234"
                          value={customerForm.vehicleNumber}
                          onChange={(e) => setCustomerForm({...customerForm, vehicleNumber: e.target.value.toUpperCase()})}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Brand</label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-[#1D56A5]"
                            placeholder="Hyundai"
                            value={customerForm.vehicleBrand}
                            onChange={(e) => setCustomerForm({...customerForm, vehicleBrand: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Model</label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-[#1D56A5]"
                            placeholder="i20"
                            value={customerForm.vehicleModel}
                            onChange={(e) => setCustomerForm({...customerForm, vehicleModel: e.target.value})}
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Item Name *</label>
                        <input
                          type="text"
                          required
                          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-[#1D56A5]"
                          placeholder="Black VIP Trolley"
                          value={customerForm.itemName}
                          onChange={(e) => setCustomerForm({...customerForm, itemName: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Item Type</label>
                        <select
                          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-[#1D56A5]"
                          value={customerForm.itemType}
                          onChange={(e) => setCustomerForm({...customerForm, itemType: e.target.value})}
                        >
                          <option value="">Select Type</option>
                          <option value="Trolley Bag">Trolley Bag</option>
                          <option value="Backpack">Backpack</option>
                          <option value="Laptop Bag">Laptop Bag</option>
                          <option value="Duffel Bag">Duffel Bag</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </>
                  )}
                  
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-4">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2 text-emerald-700">Emergency Contact 1 (Primary) *</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <input
                          type="text"
                          required
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-emerald-500"
                          placeholder="Name (e.g. Brother)"
                          value={customerForm.emergencyContact1Name}
                          onChange={(e) => setCustomerForm({...customerForm, emergencyContact1Name: e.target.value})}
                        />
                      </div>
                      <div>
                        <input
                          type="tel"
                          required
                          maxLength="10"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-emerald-500"
                          placeholder="9876543210"
                          value={customerForm.emergencyContact1Phone}
                          onChange={(e) => setCustomerForm({...customerForm, emergencyContact1Phone: e.target.value.replace(/\D/g, '')})}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-4">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Emergency Contact 2 (Optional)</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <input
                          type="text"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-slate-400"
                          placeholder="Name (e.g. Father)"
                          value={customerForm.emergencyContact2Name}
                          onChange={(e) => setCustomerForm({...customerForm, emergencyContact2Name: e.target.value})}
                        />
                      </div>
                      <div>
                        <input
                          type="tel"
                          maxLength="10"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-slate-400"
                          placeholder="9876543210"
                          value={customerForm.emergencyContact2Phone}
                          onChange={(e) => setCustomerForm({...customerForm, emergencyContact2Phone: e.target.value.replace(/\D/g, '')})}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Selling Price (₹) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-[#1D56A5] transition-colors"
                      placeholder="e.g. 500"
                      value={customerForm.sellingPrice}
                      onChange={(e) => setCustomerForm({...customerForm, sellingPrice: e.target.value})}
                    />
                  </div>

                  <div className="pt-4 flex items-center space-x-3">
                    <button
                      type="submit"
                      disabled={activating}
                      className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50 flex justify-center items-center text-sm"
                    >
                      {activating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Finalize Activation'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
