import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { User, LogOut, MapPin, ShoppingBag, Heart, Bell, Edit, Mail, Phone, Lock, ChevronRight, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { firebaseService } from '../services/firebaseService';
import { useLanguage } from '../context/LanguageContext';
import type { Address } from '../types';

export const Profile: React.FC = () => {
  const { currentUser, isAuthenticated, loginWithGoogle, loginWithEmail, loginWithPhone, logout } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();

  // Redirect check
  const redirectPath = searchParams.get('redirect') || '';

  // Auth screen states
  const [authMethod, setAuthMethod] = useState<'email' | 'phone' | 'google'>('email');
  const [emailInput, setEmailInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  // Profile Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [avatarError, setAvatarError] = useState(false);

  // Default address preview state
  const [defaultAddress, setDefaultAddress] = useState<Address | null>(null);
  const [isClearing, setIsClearing] = useState(false);

  const handleClearDatabase = async () => {
    if (!window.confirm('WARNING: This will permanently delete all mock/demo products, reviews, and coupons from your Firestore database. This action cannot be undone.\n\nAre you sure you want to proceed?')) {
      return;
    }
    
    setIsClearing(true);
    try {
      await firebaseService.firestore.clearMockData();
      alert('Firestore database cleared successfully! All mock products, reviews, and coupons have been deleted. You can now add real ones from the Admin panel.');
      window.dispatchEvent(new CustomEvent('app_refresh_trigger'));
      window.location.reload();
    } catch (err: any) {
      alert(`Error clearing database: ${err.message || err}`);
    } finally {
      setIsClearing(false);
    }
  };

  useEffect(() => {
    setAvatarError(false);
  }, [currentUser?.photoURL]);

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      setEditName(currentUser.name);
      setEditPhone(currentUser.phone);
      
      // Load default address
      firebaseService.firestore.getAddresses().then(list => {
        const def = list.find(a => a.isDefault);
        setDefaultAddress(def || null);
      });
    }
  }, [isAuthenticated, currentUser]);

  const handleGoogleLogin = async () => {
    setAuthLoading(true);
    try {
      await loginWithGoogle();
      showToast('Welcome!', 'Logged in successfully.', 'announcement');
      if (redirectPath === 'checkout') {
        navigate('/checkout');
      }
    } catch (e) {
      console.error(e);
      showToast('Error', 'Google authentication failed.', 'announcement');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !emailInput.includes('@')) {
      showToast('Validation Error', 'Please enter a valid email address.', 'announcement');
      return;
    }

    setAuthLoading(true);
    try {
      await loginWithEmail(emailInput);
      showToast('Welcome!', 'Email login successful.', 'announcement');
      if (redirectPath === 'checkout') {
        navigate('/checkout');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneInput.trim() || phoneInput.length < 10) {
      showToast('Validation Error', 'Please enter a valid 10-digit phone number.', 'announcement');
      return;
    }
    setOtpSent(true);
    showToast('OTP Sent 💬', 'Please enter OTP code 123456 to verify.', 'announcement');
  };

  const handlePhoneVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpInput.trim()) return;

    setAuthLoading(true);
    try {
      await loginWithPhone(phoneInput, otpInput);
      showToast('Verified Successful! 📱', 'Phone login successful.', 'announcement');
      if (redirectPath === 'checkout') {
        navigate('/checkout');
      }
    } catch (err: any) {
      showToast('Error', err.message || 'OTP verification failed.', 'announcement');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;

    // Simulate update in mock Auth state
    if (currentUser) {
      currentUser.name = editName;
      currentUser.phone = editPhone;
      localStorage.setItem('siraj_auth_user', JSON.stringify(currentUser));
      showToast('Profile Saved 👍', 'Your contact details have been updated.', 'announcement');
    }
    setIsEditing(false);
  };

  // RENDER: GUEST ACCESS / SIGN-IN VIEW
  if (!isAuthenticated || !currentUser) {
    return (
      <div className="flex flex-col gap-6 max-w-md mx-auto items-center pt-6">
        
        {/* Logo */}
        <img 
          src="/logo.jpg" 
          alt="Siraj Bedding House" 
          className="w-16 h-16 rounded-full object-cover border-2 border-stone-200 dark:border-stone-800 shadow-md"
        />

        {/* Title */}
        <div className="text-center flex flex-col items-center gap-1.5">
          <span className="text-[10px] uppercase font-bold tracking-widest text-amber-705">{t('secureAccess')}</span>
          <h2 className="font-sans font-extrabold text-2xl tracking-tight">{t('accessSuite')}</h2>
          <p className="font-sans text-xs text-stone-500 max-w-xs mt-1">
            {redirectPath === 'checkout' 
              ? 'Please login briefly to complete shipping payment processes.' 
              : t('signInDetails')}
          </p>
        </div>

        {/* Auth Box */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200/50 dark:border-stone-850/40 rounded-3xl p-6 shadow-xl w-full flex flex-col gap-5">
          
          {/* Method tabs */}
          <div className="flex bg-stone-100 dark:bg-stone-850 p-1 rounded-xl">
            {(['email', 'phone', 'google'] as const).map(method => (
              <button
                key={method}
                onClick={() => { setAuthMethod(method); setOtpSent(false); }}
                className={`flex-grow py-2 text-xs font-sans font-bold capitalize rounded-lg transition-all cursor-pointer ${
                  authMethod === method
                    ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-sm'
                    : 'text-stone-400'
                }`}
              >
                {method}
              </button>
            ))}
          </div>

          {/* EMAIL FORM */}
          {authMethod === 'email' && (
            <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] text-stone-400 font-bold uppercase">Email Address</span>
                <div className="flex items-center bg-stone-50 dark:bg-stone-950 border border-stone-250 dark:border-stone-800 rounded-xl px-3 py-2 text-xs">
                  <Mail size={16} className="text-stone-400 mr-2 flex-shrink-0" />
                  <input
                    type="email" required
                    placeholder="name@example.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full bg-transparent border-none outline-none focus:ring-0"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-luxury-gold hover:opacity-90 py-3 rounded-xl font-sans font-bold text-xs text-stone-100 mt-2 shadow-md cursor-pointer disabled:opacity-50"
              >
                {authLoading ? 'Verifying...' : 'Sign In with Email'}
              </button>
            </form>
          )}

          {/* PHONE OTP FORM */}
          {authMethod === 'phone' && (
            <div className="flex flex-col gap-4">
              {otpSent ? (
                // Verify OTP Form
                <form onSubmit={handlePhoneVerifySubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] text-stone-400 font-bold uppercase">Enter OTP Code (use: 123456)</span>
                    <div className="flex items-center bg-stone-50 dark:bg-stone-950 border border-stone-250 dark:border-stone-800 rounded-xl px-3 py-2 text-xs">
                      <Lock size={16} className="text-stone-400 mr-2 flex-shrink-0" />
                      <input
                        type="text" required maxLength={6}
                        placeholder="123456"
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value)}
                        className="w-full bg-transparent border-none outline-none tracking-widest text-center focus:ring-0"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full bg-luxury-gold hover:opacity-90 py-3 rounded-xl font-sans font-bold text-xs text-stone-100 mt-2 shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {authLoading ? 'Verifying OTP...' : 'Verify & Continue'}
                  </button>
                </form>
              ) : (
                // Request OTP Form
                <form onSubmit={handleSendOTP} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] text-stone-400 font-bold uppercase">Mobile Number</span>
                    <div className="flex items-center bg-stone-50 dark:bg-stone-950 border border-stone-250 dark:border-stone-800 rounded-xl px-3 py-2 text-xs">
                      <Phone size={16} className="text-stone-400 mr-2 flex-shrink-0" />
                      <input
                        type="tel" required
                        placeholder="10 digit number"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        className="w-full bg-transparent border-none outline-none focus:ring-0"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-luxury-gold hover:opacity-90 py-3 rounded-xl font-sans font-bold text-xs text-stone-100 mt-2 shadow-md cursor-pointer"
                  >
                    Send Verification SMS OTP
                  </button>
                </form>
              )}
            </div>
          )}

          {/* GOOGLE FORM */}
          {authMethod === 'google' && (
            <div className="flex flex-col gap-4 py-4 text-center">
              <span className="text-xs text-stone-500 leading-relaxed px-4">
                Authenticate instantly using your Google account parameters securely.
              </span>
              <button
                onClick={handleGoogleLogin}
                disabled={authLoading}
                className="w-full bg-stone-900 hover:bg-stone-950 dark:bg-stone-800 dark:hover:bg-stone-850 text-stone-100 border border-stone-800 py-3 rounded-xl font-sans font-bold text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {authLoading ? 'Connecting...' : 'Continue with Google'}
              </button>
            </div>
          )}

        </div>
      </div>
    );
  }

  // RENDER: LOGGED IN USER PROFILE
  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      
      {/* Header Cards details */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200/50 dark:border-stone-850/40 rounded-3xl p-5 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden flex items-center justify-center border-2 border-amber-700/20">
            {currentUser.photoURL && !avatarError ? (
              <img 
                src={currentUser.photoURL} 
                alt="Avatar" 
                className="w-full h-full object-cover" 
                onError={() => setAvatarError(true)}
              />
            ) : (
              <User size={24} className="text-stone-400" />
            )}
          </div>
          <div className="flex flex-col text-left">
            <h3 className="font-sans font-extrabold text-base leading-none">{currentUser.name}</h3>
            <span className="text-xs text-stone-450 mt-1.5">{currentUser.email || 'No email associated'}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClearDatabase}
            disabled={isClearing}
            className="p-2.5 rounded-full border border-stone-200 dark:border-stone-850 hover:bg-amber-50 hover:text-amber-700 text-stone-400 transition-all cursor-pointer disabled:opacity-50"
            title="Delete Mock/Fake Data from Firestore"
          >
            <Trash2 size={16} className={isClearing ? 'animate-pulse' : ''} />
          </button>
          <button
            onClick={logout}
            className="p-2.5 rounded-full border border-stone-200 dark:border-stone-850 hover:bg-red-50 hover:text-red-500 text-stone-400 transition-all cursor-pointer"
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Account Control panels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* EDIT PROFILE FORM */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200/50 dark:border-stone-850/40 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-stone-50 dark:border-stone-850/30">
            <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 flex items-center gap-1.5">
              <Edit size={12} />
              <span>{t('editProfile')}</span>
            </span>
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="text-[10px] font-sans font-bold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
              >
                {t('edit')}
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1 text-xs">
                <span className="font-bold text-stone-500">Name</span>
                <input
                  type="text" required
                  value={editName} onChange={(e) => setEditName(e.target.value)}
                  className="bg-stone-50 dark:bg-stone-950 border border-stone-250 dark:border-stone-800 rounded-xl p-2.5"
                />
              </div>
              <div className="flex flex-col gap-1 text-xs">
                <span className="font-bold text-stone-500">Phone Number</span>
                <input
                  type="tel"
                  value={editPhone} onChange={(e) => setEditPhone(e.target.value)}
                  className="bg-stone-50 dark:bg-stone-950 border border-stone-250 dark:border-stone-800 rounded-xl p-2.5"
                />
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  type="button" onClick={() => setIsEditing(false)}
                  className="flex-grow bg-stone-105 hover:bg-stone-200 text-xs py-2 rounded-xl animate-none"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-grow bg-luxury-gold text-stone-100 text-xs py-2 rounded-xl font-bold"
                >
                  {t('save')}
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col gap-2 font-sans text-xs">
              <div className="flex justify-between">
                <span className="text-stone-450">Name</span>
                <span className="font-bold">{currentUser.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-450">Phone</span>
                <span className="font-bold">{currentUser.phone || 'Not added'}</span>
              </div>
            </div>
          )}
        </div>

        {/* DEFAULT ADDRESS PREVIEW */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200/50 dark:border-stone-850/40 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-stone-50 dark:border-stone-850/30">
            <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 flex items-center gap-1.5">
              <MapPin size={12} />
              <span>{t('addressBook')}</span>
            </span>
          </div>

          {defaultAddress ? (
            <div className="flex flex-col gap-1 text-left font-sans text-xs flex-grow">
              <span className="font-bold">{defaultAddress.name}</span>
              <p className="text-stone-500 leading-relaxed mt-0.5 line-clamp-2">
                {defaultAddress.addressLine}, {defaultAddress.city}, {defaultAddress.pincode}
              </p>
            </div>
          ) : (
            <p className="text-xs text-stone-400 italic flex-grow">No delivery address saved yet.</p>
          )}

          <Link
            to="/checkout"
            className="text-[10px] font-sans font-bold text-amber-707 dark:text-amber-400 hover:underline mt-2 self-start flex items-center gap-1"
          >
            <span>{t('addressBook')}</span>
            <ChevronRight size={10} />
          </Link>
        </div>

      </div>

      {/* Profile quick links navigation layout */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200/50 dark:border-stone-850/40 rounded-3xl p-4 shadow-sm flex flex-col">
        {([
          { to: '/profile/orders', icon: ShoppingBag, label: t('myOrders'), desc: 'Track dispatch step statuses and invoices.' },
          { to: '/wishlist', icon: Heart, label: t('myWishlist'), desc: 'Browse products pinned for later review.' },
          { to: '/notifications', icon: Bell, label: t('notifications'), desc: 'Manage channels welcome offer subscriptions.' }
        ] as const).map((lnk, idx) => {
          const Icon = lnk.icon;
          return (
            <Link
              key={idx}
              to={lnk.to}
              className="flex items-center justify-between gap-4 p-3.5 hover:bg-stone-50 dark:hover:bg-stone-850/30 rounded-2xl transition-colors border-b border-stone-50 dark:border-stone-850/30 last:border-0"
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2 bg-stone-50 dark:bg-stone-800 text-stone-500 dark:text-stone-400 rounded-xl mt-0.5">
                  <Icon size={16} />
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-sans font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100">{lnk.label}</span>
                  <span className="text-[11px] text-stone-400 mt-0.5 leading-none">{lnk.desc}</span>
                </div>
              </div>
              <ChevronRight size={16} className="text-stone-300" />
            </Link>
          );
        })}
      </div>

    </div>
  );
};
