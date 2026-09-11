import React, { useState, useEffect } from 'react';
import { X, MapPin, Phone, CreditCard, Banknote, User, Package, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { API_BASE, useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function CheckoutModal({ isOpen, onClose, product, pkg, onSuccess }) {
  const { dealer, token } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [isCODEnabled, setIsCODEnabled] = useState(true);

  const [formData, setFormData] = useState({
    deliveryAddress: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    alternatePhone: '',
    paymentMethod: 'ONLINE' // Default to online
  });

  // Load existing dealer details into form, and fetch settings
  useEffect(() => {
    if (dealer) {
      setFormData(prev => ({
        ...prev,
        deliveryAddress: dealer.address || '',
        city: dealer.city || '',
        state: dealer.state || '',
        pincode: dealer.pincode || '',
      }));
    }

    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${API_BASE}/dealer/settings`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setIsCODEnabled(res.data.data.isCODEnabled);
          if (!res.data.data.isCODEnabled) {
            setFormData(prev => ({ ...prev, paymentMethod: 'ONLINE' }));
          }
        }
      } catch (err) {
        console.error('Failed to fetch settings');
      }
    };
    
    if (isOpen) {
      fetchSettings();
    }
  }, [dealer, isOpen, token]);

  if (!isOpen || !product || !pkg) return null;

  const grandTotal = pkg.totalPrice + pkg.deliveryCharge;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        productId: product._id,
        packageId: pkg._id,
        ...formData
      };

      const res = await axios.post(`${API_BASE}/dealer/partner-orders`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        if (formData.paymentMethod === 'ONLINE' && res.data.requiresPayment) {
          // Initialize Razorpay
          const isScriptLoaded = await loadRazorpayScript();
          if (!isScriptLoaded) {
            toast.error('Razorpay SDK failed to load. Are you online?');
            setLoading(false);
            return;
          }

          const { razorpayOrderId, razorpayKey, data: order } = res.data;

          const options = {
            key: razorpayKey,
            amount: grandTotal * 100,
            currency: 'INR',
            name: 'SafeDrive',
            description: `Purchase of ${product.name} - ${pkg.quantity} pcs`,
            order_id: razorpayOrderId,
            handler: async function (response) {
              try {
                // Verify payment
                const verifyRes = await axios.post(`${API_BASE}/dealer/partner-orders/verify`, {
                  orderId: order._id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature
                }, {
                  headers: { Authorization: `Bearer ${token}` }
                });

                if (verifyRes.data.success) {
                  toast.success('Payment successful! Order placed.');
                  onSuccess(order);
                  navigate('/dashboard/my-orders');
                }
              } catch (verifyErr) {
                toast.error('Payment verification failed.');
              }
            },
            prefill: {
              name: dealer.name,
              email: dealer.email,
              contact: formData.alternatePhone || dealer.phone
            },
            theme: {
              color: '#fb641b'
            },
            modal: {
              ondismiss: function() {
                toast.error('Payment cancelled');
                setLoading(false);
              }
            }
          };

          const rzp = new window.Razorpay(options);
          rzp.open();

        } else {
          // COD Flow
          toast.success('Order placed successfully!');
          onSuccess(res.data.data);
          navigate('/dashboard/my-orders'); // Navigate to My Orders
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col md:flex-row">
        
        {/* Left Side: Order Summary */}
        <div className="md:w-1/3 bg-slate-50 p-6 md:p-8 border-b md:border-b-0 md:border-r border-slate-200">
          <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-600" />
            Order Summary
          </h3>

          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm mb-6">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-bold text-slate-900">{product.name}</p>
                <p className="text-xs text-slate-500">{product.category} • {pkg.quantity} pcs</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 text-sm border-t border-slate-200 pt-4">
            <div className="flex justify-between text-slate-600">
              <span>Items Total</span>
              <span className="font-medium">₹{pkg.totalPrice}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Delivery Charge</span>
              <span className="font-medium text-amber-600">+ ₹{pkg.deliveryCharge}</span>
            </div>
            <div className="flex justify-between text-slate-900 font-black text-lg pt-3 border-t border-slate-200">
              <span>Grand Total</span>
              <span className="text-emerald-600">₹{grandTotal}</span>
            </div>
          </div>

          <div className="mt-8 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-800 mb-2">Partner Details</h4>
            <div className="space-y-1 text-sm text-blue-900">
              <p className="font-semibold">{dealer?.name}</p>
              <p>{dealer?.shopName}</p>
              <p>{dealer?.phone}</p>
              <p className="text-xs text-blue-700/70">{dealer?.email}</p>
            </div>
          </div>
        </div>

        {/* Right Side: Checkout Form */}
        <div className="md:w-2/3 p-6 md:p-8 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>

          <h3 className="text-xl font-black text-slate-900 mb-6">Shipping & Payment</h3>

          <form onSubmit={handlePlaceOrder} className="space-y-6">
            {/* Address Details */}
            <div>
              <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Delivery Address
              </h4>
              <div className="space-y-4">
                <input 
                  required
                  type="text" 
                  name="deliveryAddress" 
                  value={formData.deliveryAddress} 
                  onChange={handleChange}
                  placeholder="Street Address, House No." 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:bg-white focus:border-emerald-500 focus:outline-none transition"
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    required
                    type="text" 
                    name="city" 
                    value={formData.city} 
                    onChange={handleChange}
                    placeholder="City" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:bg-white focus:border-emerald-500 focus:outline-none transition"
                  />
                  <input 
                    required
                    type="text" 
                    name="state" 
                    value={formData.state} 
                    onChange={handleChange}
                    placeholder="State" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:bg-white focus:border-emerald-500 focus:outline-none transition"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    required
                    type="text" 
                    name="pincode" 
                    value={formData.pincode} 
                    onChange={handleChange}
                    placeholder="Pincode" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:bg-white focus:border-emerald-500 focus:outline-none transition"
                  />
                  <input 
                    type="text" 
                    name="landmark" 
                    value={formData.landmark} 
                    onChange={handleChange}
                    placeholder="Landmark (Optional)" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:bg-white focus:border-emerald-500 focus:outline-none transition"
                  />
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Alternate Phone */}
            <div>
              <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <Phone className="w-4 h-4" /> Alternate Contact
              </h4>
              <input 
                type="text" 
                name="alternatePhone" 
                value={formData.alternatePhone} 
                onChange={handleChange}
                placeholder="Alternate Mobile Number (Optional)" 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:bg-white focus:border-emerald-500 focus:outline-none transition"
              />
            </div>

            <hr className="border-slate-100" />

            {/* Payment Method */}
            <div>
              <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> Payment Method
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className={`cursor-pointer border-2 rounded-xl p-4 flex items-center gap-3 transition-all ${
                  formData.paymentMethod === 'ONLINE' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-emerald-200 bg-white'
                }`}>
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="ONLINE" 
                    checked={formData.paymentMethod === 'ONLINE'}
                    onChange={handleChange}
                    className="hidden" 
                  />
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.paymentMethod === 'ONLINE' ? 'border-emerald-500' : 'border-slate-300'}`}>
                    {formData.paymentMethod === 'ONLINE' && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">Pay Online</p>
                    <p className="text-xs text-slate-500">UPI, Cards, NetBanking</p>
                  </div>
                </label>

                {isCODEnabled && (
                  <label className={`cursor-pointer border-2 rounded-xl p-4 flex items-center gap-3 transition-all ${
                    formData.paymentMethod === 'COD' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-emerald-200 bg-white'
                  }`}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="COD" 
                      checked={formData.paymentMethod === 'COD'}
                      onChange={handleChange}
                      className="hidden" 
                    />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.paymentMethod === 'COD' ? 'border-emerald-500' : 'border-slate-300'}`}>
                      {formData.paymentMethod === 'COD' && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">Cash on Delivery</p>
                      <p className="text-xs text-slate-500">Pay when you receive</p>
                    </div>
                  </label>
                )}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-emerald-500/20 disabled:opacity-70 mt-6 flex justify-center items-center gap-2"
            >
              {loading ? 'Processing...' : (
                <>
                  <CheckCircle2 className="w-5 h-5" /> Confirm & Pay ₹{grandTotal}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
