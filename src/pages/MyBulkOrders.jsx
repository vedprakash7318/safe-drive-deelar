import React from 'react';

export default function MyBulkOrders() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-black text-slate-800 mb-6">My Bulk Orders</h1>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <p className="text-slate-600 mb-6">
          Track the status of your bulk tag orders here.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b">
                <th className="p-3 text-sm font-semibold text-slate-600">Order ID</th>
                <th className="p-3 text-sm font-semibold text-slate-600">Product</th>
                <th className="p-3 text-sm font-semibold text-slate-600">Quantity</th>
                <th className="p-3 text-sm font-semibold text-slate-600">Total Price</th>
                <th className="p-3 text-sm font-semibold text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-3 text-sm text-slate-500" colSpan="5">You haven't placed any bulk orders yet.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
