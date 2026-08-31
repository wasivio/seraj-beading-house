import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, ShieldCheck, CreditCard, ChevronRight, Check, Compass, Plus, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { firebaseService } from '../services/firebaseService';
import { useLanguage } from '../context/LanguageContext';
import { useCurrentLocation } from '../hooks/useCurrentLocation';
import { AddressService } from '../services/AddressService';
import { LocationConfirmationModal } from '../components/common/LocationConfirmationModal';
import type { ReverseGeocodedAddress } from '../services/ReverseGeocodingService';
import type { Address } from '../types';

export const Checkout: React.FC = () => {
  const { t } = useLanguage();
  const { cartItems, subtotal, shippingCharge, tax, discount, grandTotal, clearCart } = useCart();
  const { currentUser, isAuthenticated } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  // Location Hook
  const {
    isDetecting,
    detectedAddress,
    accuracy,
    isAccuracyPoor,
    errorDetails,
    detectLocation,
    confirmLocation,
    resetDetection
  } = useCurrentLocation();

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

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

  // New Address Form fields
  const [newAddrName, setNewAddrName] = useState('');
  const [newAddrPhone, setNewAddrPhone] = useState('');
  const [newAddrLine, setNewAddrLine] = useState('');
  const [newAddrArea, setNewAddrArea] = useState('');
  const [newAddrLandmark, setNewAddrLandmark] = useState('');
  const [newAddrCity, setNewAddrCity] = useState('');
  const [newAddrDistrict, setNewAddrDistrict] = useState('');
  const [newAddrState, setNewAddrState] = useState('');
  const [newAddrPincode, setNewAddrPincode] = useState('');
  const [newAddrType, setNewAddrType] = useState<'home' | 'work' | 'other'>('home');
  const [gpsCoords, setGpsCoords] = useState<{ lat?: number; lng?: number; accuracy?: number }>({});

  // Slot states
  const [deliveryDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toISOString().split('T')[0];
  });
  const [deliveryTime] = useState('Standard Delivery');

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'net_banking' | 'cod' | 'wallet'>('cod');
  const [placingOrder, setPlacingOrder] = useState(false);

  // Fetch addresses
  const loadAddresses = async () => {
    if (isAuthenticated) {
      const list = await firebaseService.firestore.getAddresses();
      setAddresses(list);
      const def = list.find(a => a.isDefault);
      if (def) setSelectedAddressId(def.id);
      else if (list.length > 0) setSelectedAddressId(list[0].id);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, [isAuthenticated]);

  // Handle explicit "Use My Current Location" click
  const handleUseCurrentLocationClick = async () => {
    setIsLocationModalOpen(true);
    await detectLocation();
  };

  // When customer confirms detected location in confirmation modal
  const handleConfirmDetectedLocation = (addr: ReverseGeocodedAddress) => {
    confirmLocation();
    setIsLocationModalOpen(false);
    setIsAddingAddress(true);

    // Auto-fill form fields
    if (!newAddrName && currentUser?.name) setNewAddrName(currentUser.name);
    if (!newAddrPhone && (currentUser?.mobileNumber || currentUser?.phone)) {
      setNewAddrPhone(currentUser.mobileNumber || currentUser.phone || '');
    }
    setNewAddrLine(addr.addressLine || '');
    setNewAddrArea(addr.area || addr.locality || '');
    setNewAddrCity(addr.city || 'Hooghly');
    setNewAddrDistrict(addr.district || 'Hooghly');
    setNewAddrState(addr.state || 'West Bengal');
    setNewAddrPincode(addr.pincode || '712304');
    setGpsCoords({
      lat: addr.latitude,
      lng: addr.longitude,
      accuracy: addr.accuracy
    });

    showToast('Location Detected 📍', `${addr.city}, ${addr.state} (${addr.pincode}) auto-filled.`, 'announcement');
  };

  // When customer clicks "Edit Address" in modal
  const handleEditDetectedLocation = (addr: ReverseGeocodedAddress) => {
    setIsLocationModalOpen(false);
    setIsAddingAddress(true);

    if (!newAddrName && currentUser?.name) setNewAddrName(currentUser.name);
    if (!newAddrPhone && currentUser?.phone) setNewAddrPhone(currentUser.phone);
    setNewAddrLine(addr.addressLine || '');
    setNewAddrArea(addr.area || addr.locality || '');
    setNewAddrCity(addr.city || 'Hooghly');
    setNewAddrDistrict(addr.district || 'Hooghly');
    setNewAddrState(addr.state || 'West Bengal');
    setNewAddrPincode(addr.pincode || '712304');
    setGpsCoords({
      lat: addr.latitude,
      lng: addr.longitude,
      accuracy: addr.accuracy
    });
  };

  // PIN code automatic lookup
  const handlePincodeChange = async (val: string) => {
    setNewAddrPincode(val);
    const cleaned = val.replace(/\D/g, '');
    if (cleaned.length === 6) {
      const lookup = await AddressService.lookupPincode(cleaned);
      if (lookup) {
        if (!newAddrCity) setNewAddrCity(lookup.city || lookup.district);
        if (!newAddrDistrict) setNewAddrDistrict(lookup.district);
        if (!newAddrState) setNewAddrState(lookup.state);
        showToast('PIN Code Verified 📮', `${lookup.city || lookup.district}, ${lookup.state}`, 'announcement');
      }
    }
  };

  const handleAddAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrName.trim() || !newAddrPhone.trim() || !newAddrLine.trim() || !newAddrPincode.trim()) {
      showToast('Validation Error', 'Please fill in all required address fields.', 'announcement');
      return;
    }

    const newAddr: any = {
      name: newAddrName.trim(),
      phone: newAddrPhone.trim(),
      addressLine: newAddrLine.trim(),
      city: newAddrCity.trim() || 'Hooghly',
      state: newAddrState.trim() || 'West Bengal',
      pincode: newAddrPincode.trim(),
      postalCode: newAddrPincode.trim(),
      country: 'India',
      countryCode: 'IN',
      isDefault: addresses.length === 0,
      type: newAddrType
    };

    if (newAddrArea.trim()) newAddr.area = newAddrArea.trim();
    if (newAddrLandmark.trim()) newAddr.landmark = newAddrLandmark.trim();
    if (newAddrDistrict.trim()) newAddr.district = newAddrDistrict.trim();
    if (typeof gpsCoords.lat === 'number') newAddr.latitude = gpsCoords.lat;
    if (typeof gpsCoords.lng === 'number') newAddr.longitude = gpsCoords.lng;
    if (typeof gpsCoords.accuracy === 'number') newAddr.accuracy = gpsCoords.accuracy;

    try {
      const saved = await firebaseService.firestore.saveAddress(newAddr);
      setAddresses(prev => [...prev, saved]);
      setSelectedAddressId(saved.id);
      setIsAddingAddress(false);

      // Reset Form
      setNewAddrName('');
      setNewAddrPhone('');
      setNewAddrLine('');
      setNewAddrArea('');
      setNewAddrLandmark('');
      setNewAddrCity('');
      setNewAddrDistrict('');
      setNewAddrState('');
      setNewAddrPincode('');
      setGpsCoords({});
      resetDetection();
      
      showToast('Address Saved 🏠', 'Delivery address saved successfully.', 'announcement');
    } catch (err) {
      console.error(err);
      showToast('Error', 'Failed to save address. Please try again.', 'announcement');
    }
  };

  const handleDeleteAddress = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await AddressService.deleteAddress(currentUser?.uid || '', id);
      setAddresses(prev => prev.filter(a => a.id !== id));
      if (selectedAddressId === id) {
        const remaining = addresses.filter(a => a.id !== id);
        setSelectedAddressId(remaining.length > 0 ? remaining[0].id : '');
      }
      showToast('Address Deleted', 'Address removed from your address book.', 'announcement');
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
      const orderPayload: any = {
        orderNumber: `SBH-${Math.floor(100000 + Math.random() * 900000)}`,
        status: 'pending',
        items: cartItems,
        subtotal,
        shippingCharge,
        tax,
        discount,
        grandTotal,
        paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'success',
        address,
        deliveryAddress: address,
        deliverySlot: {
          date: deliveryDate,
          time: deliveryTime
        },
        trackingTimeline: [
          {
            status: 'pending',
            title: 'Order Placed',
            description: 'Your order was submitted successfully.',
            date: new Date().toISOString(),
            isCompleted: true
          }
        ],
        estimatedDelivery: new Date(Date.now() + 3600000 * 24 * 3).toISOString()
      };

      if (typeof address.latitude === 'number') orderPayload.latitude = address.latitude;
      if (typeof address.longitude === 'number') orderPayload.longitude = address.longitude;
      if (typeof address.accuracy === 'number') orderPayload.locationAccuracy = address.accuracy;

      const order = await firebaseService.firestore.createOrder(orderPayload);

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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-850/50 pb-3 mb-4">
                <h3 className="font-sans font-extrabold text-sm uppercase tracking-wider flex items-center gap-2">
                  <MapPin size={16} className="text-amber-700" />
                  <span>{t('deliveryAddress')}</span>
                </h3>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleUseCurrentLocationClick}
                    className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 border border-amber-200/60 dark:border-amber-900/50 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    <Compass size={14} className="text-amber-700 dark:text-amber-400" />
                    <span>Use My Current Location</span>
                  </button>

                  {!isAddingAddress && (
                    <button
                      onClick={() => {
                        setIsAddingAddress(true);
                        setNewAddrName(currentUser?.name || '');
                        setNewAddrPhone(currentUser?.phone || '');
                      }}
                      className="flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer py-1.5 px-2"
                    >
                      <Plus size={14} />
                      <span>{t('addNewAddress')}</span>
                    </button>
                  )}
                </div>
              </div>

              {isAddingAddress ? (
                // Add New Address block
                <form onSubmit={handleAddAddressSubmit} className="flex flex-col gap-4">
                  
                  {/* GPS Detected Badge */}
                  {gpsCoords.lat && (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-emerald-600 dark:text-emerald-400" />
                        <span className="font-semibold">GPS Coordinates Linked ({gpsCoords.lat.toFixed(4)}°N, {gpsCoords.lng?.toFixed(4)}°E)</span>
                      </div>
                      {gpsCoords.accuracy && (
                        <span className="text-[10px] bg-white dark:bg-stone-900 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                          ±{Math.round(gpsCoords.accuracy)}m
                        </span>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-stone-400 font-bold uppercase">Recipient Name *</span>
                      <input
                        type="text" required
                        value={newAddrName} onChange={(e) => setNewAddrName(e.target.value)}
                        placeholder="e.g. John Doe"
                        className="bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 rounded-xl p-2.5 text-xs text-stone-800 dark:text-stone-200 focus:outline-none focus:border-amber-700"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-stone-400 font-bold uppercase">Phone Number *</span>
                      <input
                        type="tel" required
                        value={newAddrPhone} onChange={(e) => setNewAddrPhone(e.target.value)}
                        placeholder="+91 98000 94590"
                        className="bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 rounded-xl p-2.5 text-xs text-stone-800 dark:text-stone-200 focus:outline-none focus:border-amber-700"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-stone-400 font-bold uppercase">Flat / House / Building / Street Address *</span>
                    <input
                      type="text" required
                      value={newAddrLine} onChange={(e) => setNewAddrLine(e.target.value)}
                      placeholder="e.g. Flat 4B, Janai Subeder More"
                      className="bg-stone-50 dark:bg-stone-950 border border-stone-200/50 dark:border-stone-850 rounded-xl p-2.5 text-xs text-stone-800 dark:text-stone-200 focus:outline-none focus:border-amber-700"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-stone-400 font-bold uppercase">Area / Locality</span>
                      <input
                        type="text"
                        value={newAddrArea} onChange={(e) => setNewAddrArea(e.target.value)}
                        placeholder="e.g. Subeder More, Janai"
                        className="bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 rounded-xl p-2.5 text-xs text-stone-800 dark:text-stone-200 focus:outline-none focus:border-amber-700"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-stone-400 font-bold uppercase">Landmark (Optional)</span>
                      <input
                        type="text"
                        value={newAddrLandmark} onChange={(e) => setNewAddrLandmark(e.target.value)}
                        placeholder="e.g. Near Janai High School"
                        className="bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 rounded-xl p-2.5 text-xs text-stone-800 dark:text-stone-200 focus:outline-none focus:border-amber-700"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-stone-400 font-bold uppercase">PIN Code *</span>
                      <input
                        type="text" required maxLength={6}
                        value={newAddrPincode} onChange={(e) => handlePincodeChange(e.target.value)}
                        placeholder="712304"
                        className="bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 rounded-xl p-2.5 text-xs text-stone-800 dark:text-stone-200 focus:outline-none focus:border-amber-700 font-medium"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-stone-400 font-bold uppercase">City / District *</span>
                      <input
                        type="text" required
                        value={newAddrCity} onChange={(e) => setNewAddrCity(e.target.value)}
                        placeholder="Hooghly"
                        className="bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 rounded-xl p-2.5 text-xs text-stone-800 dark:text-stone-200 focus:outline-none focus:border-amber-700"
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1 flex flex-col gap-1">
                      <span className="text-[10px] text-stone-400 font-bold uppercase">State *</span>
                      <input
                        type="text" required
                        value={newAddrState} onChange={(e) => setNewAddrState(e.target.value)}
                        placeholder="West Bengal"
                        className="bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 rounded-xl p-2.5 text-xs text-stone-800 dark:text-stone-200 focus:outline-none focus:border-amber-700"
                      />
                    </div>
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
                              ? 'border-amber-700 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 font-semibold'
                              : 'border-stone-200 dark:border-stone-800 text-stone-500 hover:border-stone-300'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-2 pt-3 border-t border-stone-100 dark:border-stone-850/50">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingAddress(false);
                        resetDetection();
                      }}
                      className="flex-grow bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-grow bg-luxury-gold hover:opacity-90 text-stone-100 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                    >
                      Save Address
                    </button>
                  </div>
                </form>
              ) : (
                // Addresses list selection
                <div className="flex flex-col gap-3">
                  {addresses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 gap-3 text-center border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-2xl p-6">
                      <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-full text-amber-700 dark:text-amber-400">
                        <MapPin size={24} />
                      </div>
                      <div className="flex flex-col gap-1">
                        <h4 className="font-bold text-sm">No Delivery Address Found</h4>
                        <p className="text-xs text-stone-400 max-w-xs">
                          Detect your current location with one click or enter your address manually.
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 justify-center mt-2">
                        <button
                          type="button"
                          onClick={handleUseCurrentLocationClick}
                          className="flex items-center gap-1.5 bg-luxury-gold hover:opacity-90 text-stone-100 py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                        >
                          <Compass size={14} />
                          <span>Use My Current Location</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingAddress(true);
                            setNewAddrName(currentUser?.name || '');
                            setNewAddrPhone(currentUser?.phone || '');
                          }}
                          className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer"
                        >
                          <Plus size={14} />
                          <span>Enter Manually</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    addresses.map(a => (
                      <div
                        key={a.id}
                        onClick={() => setSelectedAddressId(a.id)}
                        className={`p-4 border rounded-2xl cursor-pointer transition-all flex justify-between gap-3 relative ${
                          selectedAddressId === a.id
                            ? 'border-amber-700 bg-amber-50/10 dark:bg-amber-950/10 shadow-sm'
                            : 'border-stone-200 dark:border-stone-800 hover:border-stone-300'
                        }`}
                      >
                        <div className="flex gap-3">
                          <div className="pt-0.5">
                            <input
                              type="radio"
                              name="selected_address"
                              checked={selectedAddressId === a.id}
                              onChange={() => setSelectedAddressId(a.id)}
                              className="text-amber-700 focus:ring-amber-500 border-stone-300 cursor-pointer"
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2">
                              <span className="font-sans font-bold text-xs">{a.name}</span>
                              <span className="text-[9px] bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 py-0.5 px-2 rounded-md font-semibold capitalize">
                                {a.type}
                              </span>
                              {a.isDefault && (
                                <span className="text-[9px] bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 py-0.5 px-1.5 rounded font-bold">
                                  Default
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-stone-600 dark:text-stone-300 font-sans leading-relaxed">
                              {a.addressLine}{a.area ? `, ${a.area}` : ''}, {a.city}, {a.state} - {a.pincode}
                            </span>
                            <span className="text-[10px] text-stone-400">Phone: {a.phone}</span>
                            {a.latitude && (
                              <span className="text-[9px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                                <Check size={10} strokeWidth={3} /> GPS Linked
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => handleDeleteAddress(a.id, e)}
                          title="Delete address"
                          className="text-stone-300 hover:text-rose-500 p-1.5 rounded-lg transition-colors self-start cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))
                  )}

                  {addresses.length > 0 && (
                    <button
                      onClick={() => setStep(2)}
                      disabled={!selectedAddressId}
                      className="w-full bg-luxury-gold hover:opacity-90 active:scale-[0.98] text-stone-100 font-sans font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg mt-4 disabled:opacity-50"
                    >
                      <span>Proceed to Payments</span>
                      <ChevronRight size={14} />
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* STEP 2: SLOTS & PAYMENT DETAILS */}
          {step === 2 && (
            <div className="flex flex-col gap-4">
              
              {/* Expected Delivery Date */}
              <div className="bg-white dark:bg-stone-900 border border-stone-200/50 dark:border-stone-850/40 rounded-3xl p-5 shadow-sm text-left">
                <h3 className="font-sans font-extrabold text-sm uppercase tracking-wider flex items-center gap-2 mb-3 border-b border-stone-100 dark:border-stone-850/30 pb-2">
                  <Clock size={16} className="text-amber-705" />
                  <span>Delivery Details</span>
                </h3>

                <div className="flex flex-col gap-2.5">
                  <div className="p-4 bg-amber-50/10 dark:bg-amber-955/10 border border-amber-600/25 rounded-2xl">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-amber-700 dark:text-amber-400">
                      Expected Hand-Delivery Date
                    </span>
                    <h4 className="font-sans font-extrabold text-base text-stone-900 dark:text-stone-100 mt-1">
                      {new Date(deliveryDate).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </h4>
                    <p className="text-[11px] text-stone-400 mt-1 leading-relaxed">
                      Standard home delivery takes exactly 5 days from the order date. Dispatched via Siraj Bedding House delivery partners.
                    </p>
                  </div>
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
                    { id: 'cod', label: 'Cash On Delivery (COD)', desc: 'Pay when items are hand-delivered.', isComingSoon: false },
                    { id: 'upi', label: 'UPI (Paytm / GPay / PhonePe)', desc: 'Instant verification. Seamless payout.', isComingSoon: true },
                    { id: 'card', label: 'Credit / Debit Card', desc: 'Secure card checkout.', isComingSoon: true },
                    { id: 'net_banking', label: 'Net Banking', desc: 'Secure banking gateway.', isComingSoon: true }
                  ] as const).map(pm => {
                    const active = paymentMethod === pm.id;
                    const isComingSoon = pm.isComingSoon;
                    return (
                      <div
                        key={pm.id}
                        onClick={() => {
                          if (!isComingSoon) {
                            setPaymentMethod(pm.id);
                          }
                        }}
                        className={`p-3.5 border rounded-2xl flex gap-3 items-start transition-all ${
                          isComingSoon
                            ? 'opacity-60 cursor-not-allowed border-stone-200 dark:border-stone-850'
                            : active
                            ? 'border-amber-700 bg-amber-50/10 dark:bg-amber-955/15 cursor-pointer'
                            : 'border-stone-200 hover:border-stone-300 cursor-pointer'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment_choice"
                          checked={active}
                          disabled={isComingSoon}
                          onChange={() => {
                            if (!isComingSoon) {
                              setPaymentMethod(pm.id);
                            }
                          }}
                          className={`text-amber-700 focus:ring-amber-550 border-stone-300 mt-0.5 ${
                            isComingSoon ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                          }`}
                        />
                        <div className="flex flex-col text-left">
                          <div className="flex items-center gap-2">
                            <span className="font-sans font-bold text-xs">{pm.label}</span>
                            {isComingSoon && (
                              <span className="text-[9px] font-bold bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 px-2 py-0.5 rounded-full border border-stone-200/50 dark:border-stone-800">
                                Coming Soon
                              </span>
                            )}
                          </div>
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

      {/* Location Confirmation & Error Modal */}
      <LocationConfirmationModal
        isOpen={isLocationModalOpen}
        isDetecting={isDetecting}
        address={detectedAddress}
        accuracy={accuracy}
        isAccuracyPoor={isAccuracyPoor}
        errorDetails={errorDetails}
        onConfirm={handleConfirmDetectedLocation}
        onEdit={handleEditDetectedLocation}
        onRetry={detectLocation}
        onClose={() => setIsLocationModalOpen(false)}
        onManualEntry={() => {
          setIsLocationModalOpen(false);
          setIsAddingAddress(true);
        }}
      />

    </div>
  );
};
