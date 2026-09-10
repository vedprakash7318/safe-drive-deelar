import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth, API_BASE } from '../context/AuthContext';
import { Search, Filter, X, ChevronRight, ShoppingBag, ArrowLeft, Info, Package } from 'lucide-react';

export default function BuyBulkTags() {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Modal State
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, [token]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE}/dealer/partner-products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setProducts(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to fetch bulk products');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = (pkg) => {
    toast.info(`Selected ${pkg.quantity} pcs. Checkout flow coming soon!`);
    // Here we'd actually route to a checkout page with state
    // navigate('/dashboard/checkout', { state: { product: selectedProduct, package: pkg } })
  };

  // Derived state for filtering
  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category));
    return ['All', ...Array.from(cats)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const getStartingPrice = (pkgs) => {
    if (!pkgs || pkgs.length === 0) return 0;
    return Math.min(...pkgs.map(p => p.totalPrice));
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium">Loading premium products...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen bg-slate-50/50">
      
      {/* Header Area */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-2">Buy Bulk Tags</h1>
        <p className="text-slate-500 font-medium">Discover premium quality QR tags at wholesale prices.</p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search products by name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border-none rounded-xl pl-12 pr-4 py-3.5 focus:ring-2 focus:ring-emerald-500 text-slate-700 font-medium transition"
          />
        </div>
        
        {/* Categories (Horizontal Slider) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 w-full snap-x">
          <Filter className="w-5 h-5 text-slate-400 mr-1 hidden md:block shrink-0" />
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap shrink-0 snap-start transition-all ${
                selectedCategory === cat 
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white p-16 text-center rounded-3xl shadow-sm border border-slate-200">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-700 mb-2">No products found</h3>
          <p className="text-slate-500">Try adjusting your search or category filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <div 
              key={product._id} 
              onClick={() => setSelectedProduct(product)}
              className="group bg-white rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 overflow-hidden cursor-pointer flex flex-col"
            >
              {/* Image Placeholder / Banner */}
              <div className="h-40 bg-slate-50 relative overflow-hidden flex flex-col items-center justify-center border-b border-slate-100">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain p-2 mix-blend-multiply" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex flex-col items-center justify-center">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                    <ShoppingBag className="w-12 h-12 text-emerald-400 mb-2 drop-shadow-lg" />
                  </div>
                )}
              </div>
              
              {/* Product Info */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="bg-slate-100 text-slate-600 font-bold uppercase tracking-widest text-[10px] px-2.5 py-1 rounded-md border border-slate-200">{product.category}</span>
                  {product.qrType && (
                    <span className="bg-emerald-50 text-emerald-600 font-bold uppercase tracking-widest text-[10px] px-2.5 py-1 rounded-md border border-emerald-200">{product.qrType} QR</span>
                  )}
                </div>
                <h3 className="text-xl font-black text-slate-800 mb-1 line-clamp-1 group-hover:text-emerald-600 transition-colors">{product.name}</h3>
                {product.description && (
                  <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">{product.description}</p>
                )}
                
                <div className="mt-auto pt-4 flex items-end justify-between border-t border-slate-50">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Starting from</p>
                    <p className="text-2xl font-black text-emerald-600 leading-none">₹{getStartingPrice(product.packages)}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-600 transition-colors">
                    <ChevronRight className="w-5 h-5 text-emerald-600 group-hover:text-white" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Slabs Modal / Overlay */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedProduct(null)}
          ></div>
          
          {/* Side Panel */}
          <div className="relative w-full max-w-lg bg-[#f8fafc] h-full shadow-2xl flex flex-col animate-slide-in-right overflow-hidden">
            {/* Header */}
            <div className="bg-white px-6 py-5 flex items-center justify-between border-b border-slate-200 z-10">
              <button 
                onClick={() => setSelectedProduct(null)}
                className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h2 className="text-xl font-black text-slate-800 line-clamp-1">{selectedProduct.name}</h2>
              <div className="w-10"></div> {/* Spacer for centering */}
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
              <div className="mb-8 bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
                  {selectedProduct.imageUrl ? (
                    <img src={selectedProduct.imageUrl} alt="" className="w-32 h-32 -mt-4 -mr-4 object-contain rounded-full" />
                  ) : (
                    <ShoppingBag className="w-32 h-32 -mt-4 -mr-4" />
                  )}
                </div>
                <div className="flex gap-2 mb-3">
                  <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest backdrop-blur-md inline-block">
                    {selectedProduct.category}
                  </span>
                  {selectedProduct.qrType && (
                    <span className="bg-emerald-500/50 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest backdrop-blur-md inline-block">
                      {selectedProduct.qrType} QR
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-black mb-2">Select a Package</h3>
                {selectedProduct.description ? (
                  <p className="text-emerald-50 text-sm font-medium mb-3">{selectedProduct.description}</p>
                ) : (
                  <p className="text-emerald-100 text-sm font-medium mb-3">Choose the quantity slab that fits your needs.</p>
                )}
              </div>

              <div className="space-y-4">
                {selectedProduct.packages?.map((pkg, idx) => (
                  <div 
                    key={idx} 
                    className={`relative bg-white rounded-3xl p-1 transition-all duration-300 border-2 ${
                      pkg.isOutOfStock 
                        ? 'border-transparent opacity-60 grayscale' 
                        : 'border-transparent hover:border-emerald-500 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10'
                    }`}
                  >
                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 relative overflow-hidden">
                      {/* Out of Stock Ribbon */}
                      {pkg.isOutOfStock && (
                        <div className="absolute top-4 right-4 bg-red-100 text-red-600 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider z-10">
                          Sold Out
                        </div>
                      )}
                      
                      {/* Discount Tag */}
                      {!pkg.isOutOfStock && pkg.discountPercent > 0 && (
                        <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-black px-4 py-1.5 rounded-bl-xl uppercase tracking-wider shadow-md">
                          {pkg.discountPercent}% OFF
                        </div>
                      )}

                      <div className="flex items-center gap-4 mb-4 pt-2">
                        <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center flex-shrink-0 border border-emerald-200">
                          <Package className="w-7 h-7 text-emerald-600" />
                        </div>
                        <div>
                          <h4 className="text-2xl font-black text-slate-800 leading-none">{pkg.quantity} <span className="text-base text-slate-500 font-bold">pcs</span></h4>
                          <p className="text-xs font-bold text-slate-400 mt-1 flex items-center gap-1">
                            <Info className="w-3 h-3" /> Delivery: ₹{pkg.deliveryCharge}
                          </p>
                        </div>
                      </div>

                      <div className="bg-white rounded-xl p-4 flex items-center justify-between border border-slate-100">
                        <div>
                          {pkg.mrp > pkg.totalPrice && (
                            <div className="text-xs font-bold text-slate-400 line-through mb-0.5">MRP: ₹{pkg.mrp}</div>
                          )}
                          <div className="text-xl font-black text-emerald-600 leading-none">₹{pkg.totalPrice}</div>
                        </div>
                        <button 
                          disabled={pkg.isOutOfStock}
                          onClick={() => handleCheckout(pkg)}
                          className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md ${
                            pkg.isOutOfStock 
                              ? 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed' 
                              : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-emerald-600/30 active:scale-95'
                          }`}
                        >
                          {pkg.isOutOfStock ? 'Unavailable' : 'Buy Now'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global CSS for Animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
