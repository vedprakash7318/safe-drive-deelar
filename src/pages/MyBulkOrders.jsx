import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth, API_BASE } from '../context/AuthContext';
import { Package, Truck, CheckCircle, Clock } from 'lucide-react';

export default function MyBulkOrders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, [token]);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_BASE}/dealer/partner-orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to fetch your orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'PENDING': return <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 w-max"><Clock className="w-3 h-3"/> Pending</span>;
      case 'DISPATCHED': 
      case 'SHIPPED': return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 w-max"><Truck className="w-3 h-3"/> Shipped</span>;
      case 'DELIVERED': return <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 w-max"><CheckCircle className="w-3 h-3"/> Delivered</span>;
      default: return <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-md text-xs font-bold">{status}</span>;
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-black text-slate-800 mb-6 flex items-center gap-3">
        <Package className="w-8 h-8 text-emerald-600" />
        My Bulk Orders
      </h1>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <p className="text-slate-600 mb-6">
          Track the status of your bulk tag orders here.
        </p>

        {loading ? (
          <div className="text-center py-10 text-slate-500">Loading orders...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-max">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 text-sm font-semibold text-slate-600 rounded-tl-xl">Order ID</th>
                  <th className="p-4 text-sm font-semibold text-slate-600">Product</th>
                  <th className="p-4 text-sm font-semibold text-slate-600 text-center">Quantity</th>
                  <th className="p-4 text-sm font-semibold text-slate-600 text-right">Total Price</th>
                  <th className="p-4 text-sm font-semibold text-slate-600">Payment</th>
                  <th className="p-4 text-sm font-semibold text-slate-600 rounded-tr-xl">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.length === 0 ? (
                  <tr>
                    <td className="p-8 text-sm text-slate-500 text-center" colSpan="6">
                      You haven't placed any bulk orders yet.
                    </td>
                  </tr>
                ) : (
                  orders.map(order => (
                    <tr key={order._id} className="hover:bg-slate-50 transition">
                      <td className="p-4 text-sm font-bold text-emerald-600">{order.orderNumber}</td>
                      <td className="p-4">
                        <p className="text-sm font-semibold text-slate-800">{order.productName}</p>
                        <p className="text-xs text-slate-500">{order.category}</p>
                      </td>
                      <td className="p-4 text-sm text-slate-700 text-center font-bold bg-slate-50/50">{order.quantity} pcs</td>
                      <td className="p-4 text-sm text-slate-900 font-bold text-right">₹{order.grandTotal}</td>
                      <td className="p-4">
                        <p className="text-xs font-bold text-slate-600">{order.paymentMethod}</p>
                        <p className={`text-[10px] font-bold ${order.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {order.paymentStatus}
                        </p>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(order.orderStatus)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
