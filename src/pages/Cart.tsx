import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Trash2, Heart, ArrowRight, Tag, AlertCircle, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { getThumbnailUrl } from '../services/cloudinaryService';
import { useLanguage } from '../context/LanguageContext';

export const Cart: React.FC = () => {
  const { t } = useLanguage();
  const {
    cartItems,
    savedForLater,
    appliedCoupon,
    couponError,
    removeFromCart,
    updateQuantity,
    saveForLater,
    moveToCart,
    removeFromSaved,
    applyCouponCode,
    removeCouponCode,
    subtotal,
    shippingCharge,
    discount,
    grandTotal
  } = useCart();

  const { isAuthenticated } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const [couponInput, setCouponInput] = useState('');
  const [applying, setApplying] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setApplying(true);
    const success = await applyCouponCode(couponInput);
    setApplying(false);

    if (success) {
      showToast('Coupon Applied! 🏷️', `Discount applied: ₹${discount.toLocaleString()}`, 'offer');
      setCouponInput('');
    } else {
      showToast('Coupon Failed', 'Invalid or expired coupon code.', 'announcement');
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;

    if (!isAuthenticated) {
      // Rule 6: "Login is required ONLY when customer clicks Place Order or Checkout."
      // Navigate to profile with redirect query back to checkout
      navigate('/profile?redirect=checkout');
    } else {
      navigate('/checkout');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Title */}
      <div className="flex flex-col">
        <span className="text-[10px] uppercase font-bold tracking-widest text-amber-700 dark:text-amber-400">{t('shoppingCart')}</span>
        <h2 className="font-sans font-extrabold text-2xl sm:text-3xl mt-0.5 tracking-tight">Your Comfort Bag</h2>
      </div>

      {cartItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center max-w-sm mx-auto">
          <div className="p-4 bg-stone-100 dark:bg-stone-900 rounded-full text-stone-400">
            <ShoppingBag size={32} />
          </div>
          <h4 className="font-sans font-bold text-base">{t('emptyCart')}</h4>
          <p className="font-sans text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
            Discover premium mattresses and home accessories to start crafting your ultimate bedroom suite.
          </p>
          <Link
            to="/categories"
            className="mt-2 bg-luxury-gold hover:opacity-90 py-2.5 px-6 rounded-xl font-sans font-bold text-xs text-stone-100 cursor-pointer shadow-md inline-block"
          >
            {t('continueShopping')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left: Cart Items list */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {cartItems.map((item) => (
              <div 
                key={item.id}
                className="bg-white dark:bg-stone-900 border border-stone-200/50 dark:border-stone-850/40 rounded-3xl p-4 flex gap-4 shadow-sm hover:shadow-md transition-shadow relative"
              >
                {/* Thumbnail */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-stone-50 dark:bg-stone-850 flex-shrink-0">
                  <img 
                    src={getThumbnailUrl(item.product.mainImage)} 
                    alt={item.product.name} 
                    className="w-full h-full object-cover" 
                  />
                </div>

                {/* Details */}
                <div className="flex-grow flex flex-col justify-between min-w-0 pr-6">
                  <div>
                    <h3 className="font-sans font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 truncate">
                      {item.product.name}
                    </h3>
                    
                    {/* Config params */}
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className="text-[10px] bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 px-2 py-0.5 rounded-md font-semibold">
                        Size: {item.selectedSize}
                      </span>
                      <span className="text-[10px] bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 px-2 py-0.5 rounded-md font-semibold">
                        Color: {item.selectedColor}
                      </span>
                    </div>
                  </div>

                  {/* Qty controller & Price */}
                  <div className="flex items-center justify-between gap-4 mt-3">
                    <div className="flex items-center border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden bg-stone-50 dark:bg-stone-900 scale-90 sm:scale-100 origin-left">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-2.5 py-1 text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-850 cursor-pointer"
                      >
                        -
                      </button>
                      <span className="px-2.5 text-xs font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-2.5 py-1 text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-850 cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    <span className="font-sans font-extrabold text-xs sm:text-sm text-stone-900 dark:text-stone-100">
                      ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Remove & Save buttons */}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-1 text-stone-400 hover:text-red-500 transition-colors cursor-pointer"
                    title="Remove from Cart"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button
                    onClick={() => saveForLater(item.id)}
                    className="p-1 text-stone-400 hover:text-amber-700 transition-colors cursor-pointer"
                    title="Save For Later"
                  >
                    <Heart size={16} />
                  </button>
                </div>

              </div>
            ))}
          </div>

          {/* Right: Checkout Summaries */}
          <div className="flex flex-col gap-4">
            
            {/* Coupon Code Input */}
            <div className="bg-white dark:bg-stone-900 border border-stone-200/50 dark:border-stone-850/40 rounded-3xl p-5 shadow-sm">
              <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block mb-2">{t('applyCoupon')}</span>
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/20 text-emerald-805 dark:text-emerald-450 border border-emerald-200/40 p-3 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Tag size={16} />
                    <div className="flex flex-col">
                      <span className="font-sans font-bold text-xs">{appliedCoupon.code}</span>
                      <span className="text-[10px] text-emerald-600 font-medium">Coupon applied successfully!</span>
                    </div>
                  </div>
                  <button
                    onClick={removeCouponCode}
                    className="text-stone-400 hover:text-stone-700 p-1 text-xs font-bold"
                  >
                    {t('remove')}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder={t('enterCoupon')}
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    className="flex-grow bg-stone-50 dark:bg-stone-900 border border-stone-250 dark:border-stone-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-700"
                  />
                  <button
                    type="submit"
                    disabled={applying}
                    className="bg-luxury-gold hover:opacity-90 text-stone-100 font-sans font-bold text-xs py-2 px-4 rounded-xl cursor-pointer disabled:opacity-50"
                  >
                    {applying ? 'Applying...' : t('apply')}
                  </button>
                </form>
              )}
              {couponError && (
                <span className="text-[10px] text-red-500 font-semibold mt-1.5 flex items-center gap-1">
                  <AlertCircle size={10} />
                  <span>{couponError}</span>
                </span>
              )}
            </div>

            {/* Billing details */}
            <div className="bg-white dark:bg-stone-900 border border-stone-200/50 dark:border-stone-850/40 rounded-3xl p-5 shadow-sm flex flex-col gap-4">
              <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 border-b border-stone-100 dark:border-stone-950 pb-2">{t('orderSummary')}</span>

              <div className="flex flex-col gap-2.5 text-xs font-sans">
                <div className="flex justify-between text-stone-500 dark:text-stone-400">
                  <span>{t('subtotal')}</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>{t('couponDiscount')}</span>
                    <span>- ₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-500 dark:text-stone-400">
                  <span>{t('shipping')}</span>
                  <span>{shippingCharge === 0 ? 'FREE' : `₹${shippingCharge.toLocaleString('en-IN')}`}</span>
                </div>

                <div className="flex justify-between border-t border-stone-100 dark:border-stone-850/30 pt-3 text-sm font-extrabold text-stone-900 dark:text-stone-100">
                  <span>{t('total')}</span>
                  <span>₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                className="w-full bg-luxury-gold hover:opacity-90 active:scale-[0.98] text-stone-100 font-sans font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all"
              >
                <span>{t('checkout')}</span>
                <ArrowRight size={14} />
              </button>
            </div>

          </div>

        </div>
      )}

      {/* Saved For Later Section */}
      {savedForLater.length > 0 && (
        <section className="flex flex-col gap-4 pt-8 border-t border-stone-200/50 dark:border-stone-850/50 mt-4">
          <h3 className="font-sans font-extrabold text-sm uppercase tracking-wider">{t('savedLater')} ({savedForLater.length})</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedForLater.map((item) => (
              <div 
                key={item.id}
                className="bg-white dark:bg-stone-900 border border-stone-200/50 dark:border-stone-850/40 rounded-3xl p-4 flex gap-4 shadow-sm relative"
              >
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-stone-50 dark:bg-stone-850 flex-shrink-0">
                  <img src={getThumbnailUrl(item.product.mainImage)} alt={item.product.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-grow flex flex-col justify-between pr-8">
                  <div>
                    <h4 className="font-sans font-bold text-xs text-stone-900 dark:text-stone-100 truncate">{item.product.name}</h4>
                    <span className="text-[10px] text-stone-400">Size: {item.selectedSize}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 mt-2">
                    <span className="font-sans font-extrabold text-xs">₹{item.product.price.toLocaleString('en-IN')}</span>
                    <button
                      onClick={() => moveToCart(item.id)}
                      className="text-xs font-bold text-amber-700 dark:text-amber-405 hover:underline cursor-pointer"
                    >
                      {t('moveToCart')}
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => removeFromSaved(item.id)}
                  className="absolute top-4 right-4 text-stone-400 hover:text-red-500 cursor-pointer"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
};
