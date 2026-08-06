import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { firebaseService } from '../services/firebaseService';
import type { Order } from '../types';
import { getThumbnailUrl } from '../services/cloudinaryService';
import { useAuth } from '../context/AuthContext';

export const MyOrders: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !currentUser) {
      setOrders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = firebaseService.firestore.subscribeOrders((data) => {
      setOrders(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [currentUser?.uid, isAuthenticated]);

  const toggleExpand = (id: string) => {
    setExpandedOrderId(prev => (prev === id ? null : id));
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'text-amber-500 bg-amber-50 dark:bg-amber-950/20';
      case 'confirmed':
        return 'text-blue-500 bg-blue-50 dark:bg-blue-950/20';
      case 'packed':
        return 'text-purple-500 bg-purple-50 dark:bg-purple-950/20';
      case 'shipped':
        return 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20';
      case 'out_for_delivery':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20';
      case 'delivered':
        return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20';
      default:
        return 'text-stone-500 bg-stone-50 dark:bg-stone-950/20';
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      
      {/* Title */}
      <div className="flex flex-col">
        <span className="text-[10px] uppercase font-bold tracking-widest text-amber-700 dark:text-amber-400">Order Logs</span>
        <h2 className="font-sans font-extrabold text-2xl sm:text-3xl mt-0.5 tracking-tight">Your Sleep Suites</h2>
        <span className="text-xs text-stone-400 font-sans mt-1">Track packing progress and download invoices.</span>
      </div>

      {loading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="bg-stone-100 dark:bg-stone-900 h-28 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center max-w-xs mx-auto">
          <div className="p-4 bg-stone-100 dark:bg-stone-900 rounded-full text-stone-450">
            <ShoppingBag size={32} />
          </div>
          <h4 className="font-sans font-bold text-base">No Orders Yet</h4>
          <p className="font-sans text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
            You haven't placed any luxury orders with us yet.
          </p>
          <Link
            to="/categories"
            className="mt-2 bg-luxury-gold hover:opacity-90 py-2.5 px-6 rounded-xl font-sans font-bold text-xs text-stone-100 cursor-pointer shadow-md"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const firstItem = order.items[0];

            return (
              <div 
                key={order.id}
                className="bg-white dark:bg-stone-900 border border-stone-200/50 dark:border-stone-850/40 rounded-3xl overflow-hidden shadow-sm"
              >
                {/* Order Header Summary */}
                <div 
                  onClick={() => toggleExpand(order.id)}
                  className="p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-stone-50/50 dark:hover:bg-stone-850/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {/* Thumbnail of first item */}
                    {firstItem && (
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-50 dark:bg-stone-850 flex-shrink-0">
                        <img 
                          src={getThumbnailUrl(firstItem.product.mainImage)} 
                          alt="First item" 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="font-sans font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100">
                        {order.orderNumber}
                      </span>
                      <span className="text-[10px] text-stone-400">
                        {new Date(order.createdAt).toLocaleDateString()} • {order.items.length} items
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                      <span className="font-sans font-extrabold text-xs text-stone-900 dark:text-stone-100">
                        ₹{order.grandTotal.toLocaleString()}
                      </span>
                      <span className={`text-[9px] font-sans font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mt-1 ${getStatusColor(order.status)}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-stone-405">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>
                </div>

                {/* Expanded Tracking Timeline details */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-3 border-t border-stone-100 dark:border-stone-850/30 bg-stone-50/20 dark:bg-stone-900/30">
                    
                    {/* Linear timeline */}
                    <div className="flex flex-col gap-4 font-sans text-xs pt-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 mb-2">Tracking Progress</span>
                      
                      <div className="relative border-l-2 border-stone-200 dark:border-stone-800 ml-3.5 pl-6 flex flex-col gap-5">
                        {order.trackingTimeline.map((step, idx) => {
                          const active = step.isCompleted;

                          return (
                            <div key={idx} className="relative">
                              {/* Step circle indicator */}
                              <span className={`absolute -left-9.5 top-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                active
                                  ? 'bg-amber-700 border-amber-700 text-stone-105 scale-110 shadow-md shadow-amber-700/25'
                                  : 'bg-white dark:bg-stone-900 border-stone-200 text-stone-300'
                              }`}>
                                {active ? <Check size={10} strokeWidth={3} /> : null}
                              </span>

                              {/* Details */}
                              <div className="flex flex-col text-left">
                                <span className={`font-bold text-xs ${active ? 'text-stone-905 dark:text-stone-100' : 'text-stone-400'}`}>
                                  {step.title}
                                </span>
                                <span className="text-[10px] text-stone-450 mt-0.5 leading-relaxed">
                                  {step.description}
                                </span>
                                {step.date && (
                                  <span className="text-[9px] text-amber-700 dark:text-amber-400 font-bold mt-0.5">{step.date}</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Invoice link */}
                      <button
                        onClick={() => window.print()}
                        className="mt-4 bg-stone-100 dark:bg-stone-850 hover:bg-stone-200 text-stone-700 dark:text-stone-250 py-2.5 rounded-xl font-sans font-semibold text-xs transition-colors cursor-pointer w-full text-center"
                      >
                        Download Order Invoice PDF
                      </button>

                    </div>

                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
