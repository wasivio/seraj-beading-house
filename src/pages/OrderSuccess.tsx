import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Check, ShoppingBag, Download, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { firebaseService } from '../services/firebaseService';
import type { Order } from '../types';

export const OrderSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState<Order | null>(null);

  const orderId = searchParams.get('orderId') || '';

  useEffect(() => {
    const fetchOrder = async () => {
      if (orderId) {
        const data = await firebaseService.firestore.getOrderById(orderId);
        if (data) {
          setOrder(data);
        }
      }
    };
    fetchOrder();
  }, [orderId]);

  const handleDownloadInvoice = () => {
    if (!order) return;
    
    // Simulating invoice PDF printing
    window.print();
  };

  return (
    <div className="flex flex-col items-center justify-center pt-8 pb-12 max-w-md mx-auto text-center gap-6">
      
      {/* Animated Success Check Circle */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="w-16 h-16 rounded-full bg-emerald-500 text-stone-100 flex items-center justify-center shadow-xl shadow-emerald-500/20"
      >
        <Check size={32} strokeWidth={3} />
      </motion.div>

      {/* Title */}
      <div className="flex flex-col gap-1.5">
        <h2 className="font-sans font-extrabold text-2xl tracking-tight">Order Placed Successfully!</h2>
        <p className="font-sans text-xs text-stone-500 dark:text-stone-400">
          Your payment was processed, and your luxury bedding order is registered.
        </p>
      </div>

      {order && (
        <div className="w-full bg-white dark:bg-stone-900 border border-stone-200/50 dark:border-stone-850/40 rounded-3xl p-5 shadow-sm text-left flex flex-col gap-3 font-sans text-xs">
          <div className="flex justify-between border-b border-stone-100 dark:border-stone-850/30 pb-2.5">
            <span className="text-stone-400">Order Number</span>
            <span className="font-bold text-stone-900 dark:text-stone-100">{order.orderNumber}</span>
          </div>
          <div className="flex justify-between border-b border-stone-100 dark:border-stone-850/30 pb-2.5">
            <span className="text-stone-400">Total Amount</span>
            <span className="font-bold text-stone-900 dark:text-stone-100">₹{order.grandTotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between border-b border-stone-100 dark:border-stone-850/30 pb-2.5">
            <span className="text-stone-400">Delivery Slot</span>
            <span className="font-semibold text-stone-800 dark:text-stone-200">
              {new Date(order.deliverySlot.date).toLocaleDateString()} ({order.deliverySlot.time.split(' ')[0]})
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-400">Estimated Delivery</span>
            <span className="font-bold text-amber-700 dark:text-amber-400">{order.estimatedDelivery}</span>
          </div>
        </div>
      )}

      {/* CTAs */}
      <div className="w-full flex flex-col gap-2.5 mt-2">
        <Link
          to="/profile/orders"
          className="w-full bg-luxury-gold hover:opacity-90 active:scale-[0.98] py-3 rounded-xl font-sans font-bold text-xs text-stone-100 flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all"
        >
          <ShoppingBag size={14} />
          <span>Track Your Order</span>
        </Link>
        
        <button
          onClick={handleDownloadInvoice}
          className="w-full bg-stone-100 dark:bg-stone-850 hover:bg-stone-200 text-stone-700 dark:text-stone-200 font-sans font-semibold text-xs py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
        >
          <Download size={14} />
          <span>Download Invoice</span>
        </button>

        <Link
          to="/"
          className="text-stone-400 hover:text-amber-705 text-xs font-semibold mt-2 flex items-center justify-center gap-1 cursor-pointer"
        >
          <span>Continue Upholstery Shopping</span>
          <ArrowRight size={12} />
        </Link>
      </div>

    </div>
  );
};
