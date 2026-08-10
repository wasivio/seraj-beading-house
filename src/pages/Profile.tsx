import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { User, LogOut, MapPin, ShoppingBag, Heart, Bell, Edit, Mail, Phone, ChevronRight, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { firebaseService } from '../services/firebaseService';
import { useLanguage } from '../context/LanguageContext';
import type { Address } from '../types';

export const Profile: React.FC = () => {
  const { currentUser, isAuthenticated, loginWithGoogle, logout, updateUserProfile } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();

  // Redirect check
  const redirectPath = searchParams.get('redirect') || '';

  // Auth screen loading state
  const [authLoading, setAuthLoading] = useState(false);

  // Profile Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
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
      showToast('Database Cleared 🗑️', 'Mock data has been wiped from Firestore.', 'announcement');
      window.dispatchEvent(new CustomEvent('app_refresh_trigger'));
      window.location.reload();
    } catch (err: any) {
      console.error(err);
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
      setEditName(currentUser.name || '');
      setEditPhone(currentUser.phone || '');
      
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
      showToast('Welcome!', 'Logged in successfully with Google.', 'announcement');
      if (redirectPath === 'checkout') {
        navigate('/checkout');
      }
    } catch (e) {
      console.error(e);
      showToast('Error', 'Google authentication failed. Please try again.', 'announcement');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;

    setSavingProfile(true);
    try {
      await updateUserProfile({
        name: editName.trim(),
        phone: editPhone.trim()
      });
      showToast('Profile Saved 👍', 'Your contact details have been updated in Firebase.', 'announcement');
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving profile:', err);
      showToast('Error', 'Failed to update profile. Please try again.', 'announcement');
    } finally {
      setSavingProfile(false);
    }
  };

  // RENDER: GUEST ACCESS / SIGN-IN VIEW (GOOGLE ONLY)
  if (!isAuthenticated || !currentUser) {
    return (
      <div className="flex flex-col gap-6 max-w-md mx-auto items-center pt-8 px-2">
        
        {/* Logo */}
        <div className="relative">
          <img 
            src="/logo.jpg" 
            alt="Siraj Bedding House" 
            className="w-20 h-20 rounded-full object-cover border-2 border-amber-700/40 shadow-xl"
          />
          <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-stone-900 flex items-center justify-center text-[10px] text-white">✓</span>
        </div>

        {/* Title */}
        <div className="text-center flex flex-col items-center gap-1.5">
          <span className="text-[10px] uppercase font-bold tracking-widest text-amber-700 dark:text-amber-400">{t('secureAccess')}</span>
          <h2 className="font-sans font-extrabold text-2xl sm:text-3xl tracking-tight text-stone-900 dark:text-stone-100">
            {redirectPath === 'checkout' ? 'Sign In to Complete Order' : 'Welcome to Siraj Bedding'}
          </h2>
          <p className="font-sans text-xs text-stone-500 dark:text-stone-400 max-w-xs mt-1 leading-relaxed">
            {redirectPath === 'checkout' 
              ? 'Sign in securely with your Google account to complete your checkout and track delivery.' 
              : 'Sign in to access your order history, saved addresses, and exclusive member discounts.'}
          </p>
        </div>

        {/* Auth Box */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-850/60 rounded-3xl p-6 sm:p-7 shadow-xl w-full flex flex-col gap-5 text-center">
          
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs font-semibold text-stone-600 dark:text-stone-300">
              Instant 1-Tap Google Sign-In
            </span>
            <p className="text-[11px] text-stone-400 dark:text-stone-500 leading-relaxed">
              No passwords to remember. One-click secure authentication.
            </p>
          </div>

          {/* GOOGLE SIGN IN BUTTON */}
          <button
            onClick={handleGoogleLogin}
            disabled={authLoading}
            className="w-full bg-white dark:bg-stone-950 hover:bg-stone-50 dark:hover:bg-stone-900 text-stone-800 dark:text-stone-100 border-2 border-stone-200 dark:border-stone-800 py-3.5 px-4 rounded-2xl font-sans font-bold text-xs sm:text-sm flex items-center justify-center gap-3 cursor-pointer shadow-md hover:shadow-lg transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {authLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                <span>Connecting with Google...</span>
              </div>
            ) : (
              <>
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {/* Privacy Trust Badge */}
          <div className="pt-2 border-t border-stone-100 dark:border-stone-850 flex items-center justify-center gap-1.5 text-[10px] text-stone-400">
            <span>🔒 End-to-end 256-bit encrypted authentication</span>
          </div>

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
                  disabled={savingProfile}
                  className="flex-grow bg-luxury-gold hover:opacity-90 disabled:opacity-50 text-stone-100 text-xs py-2 rounded-xl font-bold cursor-pointer transition-opacity"
                >
                  {savingProfile ? 'Saving...' : t('save')}
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
          { to: '/notifications', icon: Bell, label: t('notifications'), desc: 'Manage channels welcome offer subscriptions.' },
          { to: '/help', icon: Mail, label: 'Help & Support Desk', desc: 'FAQs, store address, contact and policy details.' }
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

      {/* WHATSAPP CUSTOMER SUPPORT CARD */}
      <div className="bg-gradient-to-br from-emerald-950/20 via-stone-900 to-stone-950 border border-emerald-500/30 rounded-3xl p-5 shadow-lg flex flex-col gap-4 text-stone-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Phone size={20} />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">24/7 Customer Support</span>
              <h4 className="font-sans font-bold text-sm text-white">Need Help with Your Order?</h4>
            </div>
          </div>
          <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-500/30">
            Online
          </span>
        </div>

        <p className="text-xs text-stone-300 leading-relaxed text-left">
          Have questions about sizing, custom mattress orders, delivery, or payments? Chat with Siraj Bedding House directly on WhatsApp.
        </p>

        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <a
            href="https://wa.me/917352502508?text=Hello%20Siraj%20Bedding%20House,%20I%20need%20help%20with%20my%20order/account."
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold text-xs py-3 px-4 rounded-xl transition-all shadow-md cursor-pointer"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
            </svg>
            <span>WhatsApp (+91 73525 02508)</span>
          </a>

          <a
            href="tel:+919800094590"
            className="flex items-center justify-center gap-2 bg-stone-800 hover:bg-stone-750 active:scale-[0.98] text-stone-200 font-bold text-xs py-3 px-4 rounded-xl transition-all border border-stone-700 cursor-pointer"
          >
            <Phone size={14} className="text-amber-400" />
            <span>Call: 98000 94590</span>
          </a>
        </div>
      </div>

    </div>
  );
};
