import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation, Clock, ShieldCheck, CreditCard, ChevronRight, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { firebaseService } from '../services/firebaseService';
import { useLanguage } from '../context/LanguageContext';
import type { Address } from '../types';

export const Checkout: React.FC = () => {
  const { t } = useLanguage();
  const { cartItems, subtotal, shippingCharge, tax, discount, grandTotal, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  // Route protection
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/profile?redirect=checkout');
    } else if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [isAuthenticated, cartItems, navigate]);

  // Checkout states
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Address, 2: Slot & Payment, 3: Review
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  // New Address Form fields
  const [newAddrName, setNewAddrName] = useState('');
  const [newAddrPhone, setNewAddrPhone] = useState('');
  const [newAddrLine, setNewAddrLine] = useState('');
  const [newAddrCity, setNewAddrCity] = useState('');
  const [newAddrState, setNewAddrState] = useState('');
  const [newAddrPincode, setNewAddrPincode] = useState('');
  const [newAddrType, setNewAddrType] = useState<'home' | 'work' | 'other'>('home');
  const [gpsCoords, setGpsCoords] = useState<{ lat?: number; lng?: number }>({});

  // Slot states
  const [deliveryDate, setDeliveryDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [deliveryTime, setDeliveryTime] = useState('10:00 AM - 01:00 PM');

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'net_banking' | 'cod' | 'wallet'>('cod');
  const [placingOrder, setPlacingOrder] = useState(false);

  // Fetch addresses
  useEffect(() => {
    const loadAddresses = async () => {
      if (isAuthenticated) {
        const list = await firebaseService.firestore.getAddresses();
        setAddresses(list);
        const def = list.find(a => a.isDefault);
        if (def) setSelectedAddressId(def.id);
        else if (list.length > 0) setSelectedAddressId(list[0].id);
      }
    };
    loadAddresses();
  }, [isAuthenticated]);

  const handleGPSAutofill = () => {
    if (!navigator.geolocation) {
      showToast('GPS Error', 'Geolocation is not supported by your browser.', 'announcement');
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setGpsCoords({ lat: latitude, lng: longitude });
        
        // Populate inputs with mockup reverse geocode info
        setNewAddrLine(`GPS: ${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E (Simulated Upholstery Center)`);
        setNewAddrCity('Gorakhpur');
        setNewAddrState('Uttar Pradesh');
        setNewAddrPincode('273001');

        setGpsLoading(false);
        showToast('GPS Coordinates Loaded 🛰️', 'Location coordinates resolved successfully.', 'announcement');
      },
      (error) => {
        console.error(error);
        setGpsLoading(false);
        showToast('GPS Failed', 'Failed to retrieve location coordinates.', 'announcement');
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  const handleAddAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrName.trim() || !newAddrPhone.trim() || !newAddrLine.trim() || !newAddrPincode.trim()) {
      showToast('Validation Error', 'Please fill in all required address fields.', 'announcement');
      return;
    }

    const newAddr: Omit<Address, 'id'> = {
      name: newAddrName,
      phone: newAddrPhone,
      addressLine: newAddrLine,
      city: newAddrCity || 'Gorakhpur',
      state: newAddrState || 'Uttar Pradesh',
      pincode: newAddrPincode,
      isDefault: addresses.length === 0,
      type: newAddrType,
      latitude: gpsCoords.lat,
      longitude: gpsCoords.lng
    };

    try {
      const saved = await firebaseService.firestore.saveAddress(newAddr);
      setAddresses(prev => [...prev, saved]);
      setSelectedAddressId(saved.id);
      setIsAddingAddress(false);

      // Reset Form
      setNewAddrName('');
      setNewAddrPhone('');
      setNewAddrLine('');
      setNewAddrPincode('');
      setGpsCoords({});
      
      showToast('Address Saved 🏠', 'New shipping address added.', 'announcement');
    } catch (err) {
      console.error(err);
    }
  };

  const handlePlaceOrder = async () => {
    const address = addresses.find(a => a.id === selectedAddressId);
    if (!address) {
      showToast('Checkout Blocked', 'Please select a valid shipping address.', 'announcement');
      return;
    }

    setPlacingOrder(true);
    try {
      const order = await firebaseService.firestore.createOrder({
        items: cartItems,
        subtotal,
        shippingCharge,
        tax,
        discount,
        grandTotal,
        paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'success',
        address,
        deliverySlot: {
          date: deliveryDate,
          time: deliveryTime
        },
        estimatedDelivery: new Date(Date.now() + 3600000 * 24 * 3).toLocaleDateString() // 3 days
      });

      // Clear local checkout cart
      clearCart();
      
      showToast('Success! 🎉', 'Redirecting to your order invoice...', 'order');
      navigate(`/order-success?orderId=${order.id}`);
    } catch (err) {
      console.error(err);
      showToast('Payment Failed', 'Card transaction rejected. Retry cod.', 'announcement');
    } finally {
      setPlacingOrder(false);
    }
  };

  // Delivery Dates Picker options (Next 3 days)
  const getDates = () => {
    const dates = [];
    for (let i = 1; i <= 3; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  const deliveryTimes = [
    '09:00 AM - 12:00 PM (Morning)',
    '01:00 PM - 04:00 PM (Afternoon)',
    '05:00 PM - 08:00 PM (Evening)'
  ];

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      
      {/* Stepper Navigation */}
      <div className="flex items-center justify-around bg-white dark:bg-stone-900 border border-stone-200/50 dark:border-stone-850/40 p-4 rounded-2xl shadow-sm">
        <div className={`flex items-center gap-1.5 text-xs font-sans font-extrabold ${step === 1 ? 'text-amber-705' : 'text-stone-400'}`}>
          <span className="w-5 h-5 rounded-full bg-stone-100 dark:bg-stone-850 flex items-center justify-center border text-[10px]">1</span>
          <span>Shipping</span>
        </div>
        <ChevronRight size={14} className="text-stone-300" />
        <div className={`flex items-center gap-1.5 text-xs font-sans font-extrabold ${step === 2 ? 'text-amber-750' : 'text-stone-400'}`}>
          <span className="w-5 h-5 rounded-full bg-stone-100 dark:bg-stone-850 flex items-center justify-center border text-[10px]">2</span>
          <span>Payment & Slots</span>
        </div>
        <ChevronRight size={14} className="text-stone-300" />
        <div className={`flex items-center gap-1.5 text-xs font-sans font-extrabold ${step === 3 ? 'text-amber-750' : 'text-stone-400'}`}>
          <span className="w-5 h-5 rounded-full bg-stone-100 dark:bg-stone-850 flex items-center justify-center border text-[10px]">3</span>
          <span>Review</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Form Details depending on step */}
        <div className="md:col-span-2 flex flex-col gap-4">
          
          {/* STEP 1: ADDRESS BOOK */}
          {step === 1 && (
            <div className="bg-white dark:bg-stone-900 border border-stone-200/50 dark:border-stone-850/40 rounded-3xl p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-850/50 pb-3 mb-4">
                <h3 className="font-sans font-extrabold text-sm uppercase tracking-wider flex items-center gap-2">
                  <MapPin size={16} className="text-amber-700" />
                  <span>{t('deliveryAddress')}</span>
                </h3>
                {!isAddingAddress && (
                  <button
                    onClick={() => setIsAddingAddress(true)}
                    className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
                  >
                    + {t('addNewAddress')}
                  </button>
                )}
              </div>

              {isAddingAddress ? (
                // Add New Address block
                <form onSubmit={handleAddAddressSubmit} className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-stone-400 font-bold uppercase">Recipient Name *</span>
                      <input
                        type="text" required
                        value={newAddrName} onChange={(e) => setNewAddrName(e.target.value)}
                        placeholder="John Doe"
                        className="bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 rounded-xl p-2.5 text-xs text-stone-800 focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-stone-400 font-bold uppercase">Phone Number *</span>
                      <input
                        type="tel" required
                        value={newAddrPhone} onChange={(e) => setNewAddrPhone(e.target.value)}
                        placeholder="+91 99887 76655"
                        className="bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 rounded-xl p-2.5 text-xs text-stone-800 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[10px] text-stone-400 font-bold uppercase">Street Address *</span>
                      <button
                        type="button"
                        onClick={handleGPSAutofill}
                        disabled={gpsLoading}
                        className="text-[10px] font-sans font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Navigation size={12} />
                        <span>{gpsLoading ? 'Locating...' : 'Use GPS Location'}</span>
                      </button>
                    </div>
                    <input
                      type="text" required
                      value={newAddrLine} onChange={(e) => setNewAddrLine(e.target.value)}
                      placeholder="Building, Street details"
                      className="bg-stone-50 dark:bg-stone-950 border border-stone-200/50 dark:border-stone-850 rounded-xl p-2.5 text-xs text-stone-800 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-stone-400 font-bold uppercase">Pincode *</span>
                      <input
                        type="text" required
                        value={newAddrPincode} onChange={(e) => setNewAddrPincode(e.target.value)}
                        placeholder="273001"
                        className="bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 rounded-xl p-2.5 text-xs text-stone-800 focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-stone-400 font-bold uppercase">Address Type</span>
                      <div className="flex gap-2">
                        {(['home', 'work', 'other'] as const).map(type => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setNewAddrType(type)}
                            className={`flex-grow text-xs py-2 rounded-xl border capitalize transition-all cursor-pointer ${
                              newAddrType === type
                                ? 'border-amber-705 bg-amber-50 text-amber-800 font-semibold'
                                : 'border-stone-200 text-stone-500'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-2 pt-3 border-t border-stone-100 dark:border-stone-850/50">
                    <button
                      type="button"
                      onClick={() => setIsAddingAddress(false)}
                      className="flex-grow bg-stone-100 text-stone-700 py-2.5 rounded-xl text-xs font-bold transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-grow bg-luxury-gold hover:opacity-90 text-stone-100 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md"
                    >
                      Save Address
                    </button>
                  </div>
                </form>
              ) : (
                // Addresses list selection
                <div className="flex flex-col gap-3">
                  {addresses.map(a => (
                    <div
                      key={a.id}
                      onClick={() => setSelectedAddressId(a.id)}
                      className={`p-4 border rounded-2xl cursor-pointer transition-all flex gap-3 relative ${
                        selectedAddressId === a.id
                          ? 'border-amber-700 bg-amber-50/10 dark:bg-amber-955/10'
                          : 'border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <div className="pt-0.5">
                        <input
                          type="radio"
                          name="selected_address"
                          checked={selectedAddressId === a.id}
                          onChange={() => setSelectedAddressId(a.id)}
                          className="text-amber-700 focus:ring-amber-550 border-stone-300 cursor-pointer"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5 pr-10">
                        <div className="flex items-center gap-2">
                          <span className="font-sans font-bold text-xs">{a.name}</span>
                          <span className="text-[9px] bg-stone-100 dark:bg-stone-800 text-stone-505 dark:text-stone-400 py-0.5 px-2 rounded-md font-semibold capitalize">
                            {a.type}
                          </span>
                        </div>
                        <span className="text-xs text-stone-500 dark:text-stone-400 font-sans leading-relaxed">
                          {a.addressLine}, {a.city}, {a.state} - {a.pincode}
                        </span>
                        <span className="text-[10px] text-stone-400">Phone: {a.phone}</span>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => setStep(2)}
                    disabled={!selectedAddressId}
                    className="w-full bg-luxury-gold hover:opacity-90 active:scale-[0.98] text-stone-100 font-sans font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg mt-4 disabled:opacity-50"
                  >
                    <span>Proceed to Payments</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: SLOTS & PAYMENT DETAILS */}
          {step === 2 && (
            <div className="flex flex-col gap-4">
              
              {/* Delivery Slot Selector */}
              <div className="bg-white dark:bg-stone-900 border border-stone-200/50 dark:border-stone-850/40 rounded-3xl p-5 shadow-sm">
                <h3 className="font-sans font-extrabold text-sm uppercase tracking-wider flex items-center gap-2 mb-4 border-b border-stone-100 dark:border-stone-850/30 pb-2">
                  <Clock size={16} className="text-amber-705" />
                  <span>{t('selectSlot')}</span>
                </h3>

                {/* Dates pick row */}
                <div className="flex gap-3 mb-4 overflow-x-auto no-scrollbar">
                  {getDates().map((date, idx) => {
                    const dStr = date.toISOString().split('T')[0];
                    const active = deliveryDate === dStr;
                    return (
                      <button
                        key={idx}
                        onClick={() => setDeliveryDate(dStr)}
                        className={`flex-shrink-0 flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                          active
                            ? 'border-amber-700 bg-amber-50 dark:bg-amber-950/20 text-amber-705 font-bold'
                            : 'border-stone-200 text-stone-500'
                        }`}
                      >
                        <span className="text-[10px] uppercase font-bold tracking-wider">
                          {date.toLocaleDateString('en-US', { weekday: 'short' })}
                        </span>
                        <span className="text-base font-extrabold">{date.getDate()}</span>
                        <span className="text-[9px] text-stone-400">
                          {date.toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Time Slots pick */}
                <div className="flex flex-col gap-2">
                  {deliveryTimes.map((time, idx) => {
                    const active = deliveryTime === time;
                    return (
                      <button
                        key={idx}
                        onClick={() => setDeliveryTime(time)}
                        className={`w-full text-left p-3.5 border rounded-xl text-xs flex items-center justify-between cursor-pointer ${
                          active
                            ? 'border-amber-750 bg-amber-50/20 text-amber-800 dark:text-amber-450 font-semibold'
                            : 'border-stone-200 text-stone-500 hover:bg-stone-50/50'
                        }`}
                      >
                        <span>{time}</span>
                        {active && <Check size={14} className="text-amber-700 dark:text-amber-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Payment selector */}
              <div className="bg-white dark:bg-stone-900 border border-stone-200/50 dark:border-stone-850/40 rounded-3xl p-5 shadow-sm">
                <h3 className="font-sans font-extrabold text-sm uppercase tracking-wider flex items-center gap-2 mb-4 border-b border-stone-100 dark:border-stone-850/30 pb-2">
                  <CreditCard size={16} className="text-amber-705" />
                  <span>{t('paymentMethod')}</span>
                </h3>

                <div className="flex flex-col gap-3">
                  {([
                    { id: 'cod', label: 'Cash On Delivery (COD)', desc: 'Pay when items are hand-delivered.' },
                    { id: 'upi', label: 'UPI (Paytm / GPay / PhonePe)', desc: 'Instant verification. Seamless payout.' },
                    { id: 'card', label: 'Credit / Debit Card', desc: 'Secure card checkout.' },
                    { id: 'net_banking', label: 'Net Banking', desc: 'Secure banking gateway.' }
                  ] as const).map(pm => {
                    const active = paymentMethod === pm.id;
                    return (
                      <div
                        key={pm.id}
                        onClick={() => setPaymentMethod(pm.id)}
                        className={`p-3.5 border rounded-2xl cursor-pointer flex gap-3 items-start transition-all ${
                          active
                            ? 'border-amber-700 bg-amber-50/10 dark:bg-amber-955/15'
                            : 'border-stone-200 hover:border-stone-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment_choice"
                          checked={active}
                          onChange={() => setPaymentMethod(pm.id)}
                          className="text-amber-700 focus:ring-amber-550 border-stone-300 mt-0.5 cursor-pointer"
                        />
                        <div className="flex flex-col">
                          <span className="font-sans font-bold text-xs">{pm.label}</span>
                          <span className="text-[10px] text-stone-400 mt-0.5 leading-tight">{pm.desc}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 mt-6 pt-3 border-t border-stone-100 dark:border-stone-850/50">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-grow bg-stone-100 dark:bg-stone-850 text-stone-700 dark:text-stone-200 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Back to Address
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="flex-grow bg-luxury-gold hover:opacity-90 text-stone-100 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
                  >
                    Review Order
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* STEP 3: ORDER REVIEW */}
          {step === 3 && (
            <div className="bg-white dark:bg-stone-900 border border-stone-200/50 dark:border-stone-850/40 rounded-3xl p-5 shadow-sm flex flex-col gap-4">
              <h3 className="font-sans font-extrabold text-sm uppercase tracking-wider flex items-center gap-2 mb-2 border-b border-stone-100 dark:border-stone-850/30 pb-2">
                <ShieldCheck size={16} className="text-amber-705" />
                <span>Review Order Details</span>
              </h3>

              <div className="flex flex-col gap-3 font-sans text-xs border-b border-stone-100 dark:border-stone-850/30 pb-4">
                {/* Shipping info */}
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-stone-450 uppercase text-[9px] tracking-wider">Shipping To</span>
                  <span className="font-semibold text-stone-800 dark:text-stone-150">
                    {addresses.find(a => a.id === selectedAddressId)?.name}
                  </span>
                  <span className="text-stone-500 leading-relaxed mt-0.5">
                    {addresses.find(a => a.id === selectedAddressId)?.addressLine}
                  </span>
                </div>

                {/* Delivery slot info */}
                <div className="flex flex-col gap-1 mt-2">
                  <span className="font-bold text-stone-450 uppercase text-[9px] tracking-wider">Scheduled Slot</span>
                  <span className="font-semibold text-stone-800 dark:text-stone-150">
                    {new Date(deliveryDate).toLocaleDateString('en-US', { dateStyle: 'long' })}
                  </span>
                  <span className="text-stone-500">{deliveryTime}</span>
                </div>

                {/* Payment Method */}
                <div className="flex flex-col gap-1 mt-2">
                  <span className="font-bold text-stone-450 uppercase text-[9px] tracking-wider">Payment Mode</span>
                  <span className="font-semibold text-stone-850 dark:text-stone-100 uppercase">
                    {paymentMethod.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Review checkout CTA */}
              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={() => setStep(2)}
                  className="flex-grow bg-stone-100 dark:bg-stone-850 text-stone-750 dark:text-stone-200 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  {t('backToPayments')}
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={placingOrder}
                  className="flex-grow bg-luxury-gold hover:opacity-90 text-stone-100 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg disabled:opacity-50"
                >
                  {placingOrder ? t('processing') : t('placeOrderNow')}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Checkout Sidebar Summary (displays items, counts and totals) */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200/50 dark:border-stone-850/40 rounded-3xl p-5 shadow-sm flex flex-col gap-4">
          <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 border-b border-stone-100 dark:border-stone-950 pb-2">{t('orderSummary')}</span>
          
          {/* Miniature items list */}
          <div className="flex flex-col gap-3 max-h-48 overflow-y-auto no-scrollbar pr-1">
            {cartItems.map((item, idx) => (
              <div key={idx} className="flex gap-2 items-center justify-between text-xs font-sans">
                <div className="flex gap-2 items-center min-w-0">
                  <span className="text-stone-400 font-bold">{item.quantity}x</span>
                  <span className="font-semibold text-stone-700 dark:text-stone-300 truncate">{item.product.name}</span>
                </div>
                <span className="font-bold flex-shrink-0">₹{(item.product.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-stone-100 dark:border-stone-850/30 pt-3 flex flex-col gap-2 text-xs font-sans">
            <div className="flex justify-between text-stone-500 dark:text-stone-400">
              <span>{t('subtotal')}</span>
              <span>₹{subtotal.toLocaleString()}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>{t('couponDiscount')}</span>
                <span>- ₹{discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-stone-500 dark:text-stone-400">
              <span>{t('shipping')}</span>
              <span>{shippingCharge === 0 ? 'FREE' : `₹${shippingCharge}`}</span>
            </div>
            <div className="flex justify-between text-stone-500 dark:text-stone-400">
              <span>{t('tax')}</span>
              <span>₹{tax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t border-stone-100 dark:border-stone-850/30 pt-3 text-sm font-extrabold text-stone-900 dark:text-stone-100">
              <span>{t('total')}</span>
              <span>₹{grandTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
