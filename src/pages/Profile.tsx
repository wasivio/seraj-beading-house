import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
  User as UserIcon, 
  LogOut, 
  MapPin, 
  ShoppingBag, 
  Heart, 
  Bell, 
  Edit, 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  KeyRound, 
  ShieldCheck, 
  ChevronRight, 
  Trash2,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { firebaseService } from '../services/firebaseService';
import { useLanguage } from '../context/LanguageContext';
import { normalizeIndianPhone, validatePasswordPolicy } from '../utils/phoneUtils';
import { Dialog } from '../components/common/Dialog';
import type { Address } from '../types';

export const Profile: React.FC = () => {
  const { currentUser, isAuthenticated, login, register, changePassword, logout, updateUserProfile } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();

  // Redirect parameter check (e.g. from checkout)
  const redirectPath = searchParams.get('redirect') || '';

  // Auth screen mode: 'login' or 'register'
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [authLoading, setAuthLoading] = useState(false);

  // Login Form States
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register Form States
  const [registerName, setRegisterName] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Forgot Password Modal State
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  // Profile Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [avatarError, setAvatarError] = useState(false);

  // Security - Change Password states
  const [isChangePassOpen, setIsChangePassOpen] = useState(false);
  const [changingPass, setChangingPass] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

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
      setEditPhone(currentUser.mobileNumber || currentUser.phone || '');
      
      // Load default address
      firebaseService.firestore.getAddresses().then(list => {
        const def = list.find(a => a.isDefault);
        setDefaultAddress(def || null);
      });
    }
  }, [isAuthenticated, currentUser]);

  // LOGIN HANDLER
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const phoneVal = loginPhone.trim();
    const passVal = loginPassword;

    if (!phoneVal) {
      showToast('Validation Error', 'Please enter your 10-digit mobile number.', 'announcement');
      return;
    }
    if (!passVal) {
      showToast('Validation Error', 'Please enter your password.', 'announcement');
      return;
    }

    setAuthLoading(true);
    try {
      await login(phoneVal, passVal);
      showToast('Welcome Back! 👋', 'Logged in successfully.', 'announcement');
      if (redirectPath === 'checkout') {
        navigate('/checkout');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      showToast('Authentication Error', err.message || 'Mobile number or password is incorrect.', 'announcement');
    } finally {
      setAuthLoading(false);
    }
  };

  // REGISTRATION HANDLER
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nameVal = registerName.trim();
    const phoneVal = registerPhone.trim();
    const passVal = registerPassword;
    const confirmVal = registerConfirmPassword;

    if (!nameVal) {
      showToast('Validation Error', 'Please enter your full name.', 'announcement');
      return;
    }

    const normPhone = normalizeIndianPhone(phoneVal);
    if (!normPhone.isValid) {
      showToast('Validation Error', normPhone.error || 'Please enter a valid 10-digit Indian mobile number.', 'announcement');
      return;
    }

    const passCheck = validatePasswordPolicy(passVal);
    if (!passCheck.isValid) {
      showToast('Weak Password', passCheck.errors[0], 'announcement');
      return;
    }

    if (passVal !== confirmVal) {
      showToast('Password Mismatch', 'Password and Confirm Password do not match.', 'announcement');
      return;
    }

    setAuthLoading(true);
    try {
      await register(nameVal, phoneVal, passVal);
      showToast('Account Created! 🎉', 'Welcome to Siraj Bedding House.', 'announcement');
      if (redirectPath === 'checkout') {
        navigate('/checkout');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      showToast('Registration Error', err.message || 'Failed to create account. Please try again.', 'announcement');
    } finally {
      setAuthLoading(false);
    }
  };

  // CHANGE PASSWORD HANDLER
  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      showToast('Validation Error', 'Please enter your current password.', 'announcement');
      return;
    }

    const passCheck = validatePasswordPolicy(newPassword);
    if (!passCheck.isValid) {
      showToast('Password Policy', passCheck.errors[0], 'announcement');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      showToast('Password Mismatch', 'New Password and Confirm Password do not match.', 'announcement');
      return;
    }

    setChangingPass(true);
    try {
      await changePassword(currentPassword, newPassword);
      showToast('Password Updated! 🔒', 'Your password has been changed securely.', 'announcement');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setIsChangePassOpen(false);
    } catch (err: any) {
      console.error('Change password error:', err);
      showToast('Error', err.message || 'Current password is incorrect.', 'announcement');
    } finally {
      setChangingPass(false);
    }
  };

  // SAVE PROFILE DETAILS HANDLER
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

  // =========================================================================
  // GUEST VIEW: MOBILE + PASSWORD AUTHENTICATION (NO OTP, NO GOOGLE)
  // =========================================================================
  if (!isAuthenticated || !currentUser) {
    return (
      <div className="flex flex-col gap-6 max-w-md mx-auto items-center pt-6 px-3">
        
        {/* Store Logo */}
        <div className="relative">
          <img 
            src="/logo.jpg" 
            alt="Siraj Bedding House" 
            className="w-20 h-20 rounded-full object-cover border-2 border-amber-700/40 shadow-xl"
          />
          <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-600 rounded-full border-2 border-stone-900 flex items-center justify-center text-[9px] text-white font-bold">SB</span>
        </div>

        {/* Title & Subtitle */}
        <div className="text-center flex flex-col items-center gap-1">
          <span className="text-[10px] uppercase font-bold tracking-widest text-amber-700 dark:text-amber-400">
            {t('secureAccess')}
          </span>
          <h2 className="font-sans font-extrabold text-2xl sm:text-3xl tracking-tight text-stone-900 dark:text-stone-100">
            {authTab === 'login' ? 'Sign In with Mobile' : 'Create Customer Account'}
          </h2>
          <p className="font-sans text-xs text-stone-500 dark:text-stone-400 max-w-xs mt-0.5 leading-relaxed">
            {redirectPath === 'checkout'
              ? 'Please authenticate with your mobile number to complete your order.'
              : authTab === 'login'
              ? 'Access your orders, saved delivery addresses, and customer benefits.'
              : 'Register with your Indian mobile number and password to start shopping.'}
          </p>
        </div>

        {/* Auth Box */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-850/60 rounded-3xl p-6 sm:p-7 shadow-xl w-full flex flex-col gap-5">
          
          {/* Switch Tabs: Sign In / Register */}
          <div className="flex bg-stone-100 dark:bg-stone-850 p-1 rounded-2xl border border-stone-200/50 dark:border-stone-800">
            <button
              type="button"
              onClick={() => setAuthTab('login')}
              className={`flex-1 py-2.5 text-xs font-sans font-bold rounded-xl transition-all cursor-pointer ${
                authTab === 'login'
                  ? 'bg-white dark:bg-stone-900 text-amber-700 dark:text-amber-400 shadow-sm font-extrabold'
                  : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setAuthTab('register')}
              className={`flex-1 py-2.5 text-xs font-sans font-bold rounded-xl transition-all cursor-pointer ${
                authTab === 'register'
                  ? 'bg-white dark:bg-stone-900 text-amber-700 dark:text-amber-400 shadow-sm font-extrabold'
                  : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'
              }`}
            >
              Register
            </button>
          </div>

          {/* LOGIN FORM */}
          {authTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
              
              {/* Mobile Number */}
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-[10px] text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wider">
                  Mobile Number
                </label>
                <div className="flex items-center bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-3 py-2.5 focus-within:border-amber-600 transition-colors">
                  <span className="font-bold text-xs text-amber-700 dark:text-amber-400 mr-2 flex-shrink-0 border-r border-stone-200 dark:border-stone-800 pr-2">
                    +91
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    maxLength={10}
                    required
                    placeholder="9876543210"
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-transparent border-none outline-none text-xs text-stone-900 dark:text-stone-100 font-medium"
                  />
                  <Phone size={15} className="text-stone-400 ml-1 flex-shrink-0" />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5 text-left">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(true)}
                    className="text-[10px] font-bold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="flex items-center bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-3 py-2.5 focus-within:border-amber-600 transition-colors">
                  <Lock size={15} className="text-stone-400 mr-2 flex-shrink-0" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-xs text-stone-900 dark:text-stone-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1 cursor-pointer"
                    aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                  >
                    {showLoginPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-luxury-gold hover:opacity-90 active:scale-[0.98] py-3.5 rounded-xl font-sans font-bold text-xs sm:text-sm text-stone-100 mt-2 shadow-md cursor-pointer disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {authLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <span>Sign In with Mobile</span>
                )}
              </button>

              {/* Bottom switch helper */}
              <div className="text-center pt-2 text-xs text-stone-500">
                <span>Don't have an account? </span>
                <button
                  type="button"
                  onClick={() => setAuthTab('register')}
                  className="font-bold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
                >
                  Register here
                </button>
              </div>

            </form>
          )}

          {/* REGISTRATION FORM */}
          {authTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-3.5">
              
              {/* Full Name */}
              <div className="flex flex-col gap-1 text-left">
                <label className="text-[10px] text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wider">
                  Full Name
                </label>
                <div className="flex items-center bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-3 py-2.5 focus-within:border-amber-600 transition-colors">
                  <UserIcon size={15} className="text-stone-400 mr-2 flex-shrink-0" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-xs text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>

              {/* Mobile Number */}
              <div className="flex flex-col gap-1 text-left">
                <label className="text-[10px] text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wider">
                  Mobile Number
                </label>
                <div className="flex items-center bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-3 py-2.5 focus-within:border-amber-600 transition-colors">
                  <span className="font-bold text-xs text-amber-700 dark:text-amber-400 mr-2 flex-shrink-0 border-r border-stone-200 dark:border-stone-800 pr-2">
                    +91
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    maxLength={10}
                    required
                    placeholder="9876543210"
                    value={registerPhone}
                    onChange={(e) => setRegisterPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-transparent border-none outline-none text-xs text-stone-900 dark:text-stone-100 font-medium"
                  />
                  <Phone size={15} className="text-stone-400 ml-1 flex-shrink-0" />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1 text-left">
                <label className="text-[10px] text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wider">
                  Password
                </label>
                <div className="flex items-center bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-3 py-2.5 focus-within:border-amber-600 transition-colors">
                  <Lock size={15} className="text-stone-400 mr-2 flex-shrink-0" />
                  <input
                    type={showRegisterPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    placeholder="Enter password (min 6 characters)"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-xs text-stone-900 dark:text-stone-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1 cursor-pointer"
                    aria-label={showRegisterPassword ? 'Hide password' : 'Show password'}
                  >
                    {showRegisterPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-1 text-left">
                <label className="text-[10px] text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wider">
                  Confirm Password
                </label>
                <div className="flex items-center bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-3 py-2.5 focus-within:border-amber-600 transition-colors">
                  <Lock size={15} className="text-stone-400 mr-2 flex-shrink-0" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    placeholder="Repeat your password"
                    value={registerConfirmPassword}
                    onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-xs text-stone-900 dark:text-stone-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1 cursor-pointer"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-luxury-gold hover:opacity-90 active:scale-[0.98] py-3.5 rounded-xl font-sans font-bold text-xs sm:text-sm text-stone-100 mt-2 shadow-md cursor-pointer disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {authLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </button>

              {/* Bottom switch helper */}
              <div className="text-center pt-2 text-xs text-stone-500">
                <span>Already have an account? </span>
                <button
                  type="button"
                  onClick={() => setAuthTab('login')}
                  className="font-bold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
                >
                  Sign in here
                </button>
              </div>

            </form>
          )}

          {/* Privacy Security Note */}
          <div className="pt-2 border-t border-stone-100 dark:border-stone-850 flex items-center justify-center gap-1.5 text-[10px] text-stone-400">
            <ShieldCheck size={13} className="text-emerald-500" />
            <span>256-bit encrypted credential storage</span>
          </div>

        </div>

        {/* FORGOT PASSWORD MODAL */}
        <Dialog
          isOpen={isForgotModalOpen}
          onClose={() => setIsForgotModalOpen(false)}
          title="Password Assistance"
          maxWidth="md"
        >
          <div className="flex flex-col gap-4 py-2 text-stone-800 dark:text-stone-200">
            <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-2xl border border-amber-200/50 dark:border-amber-900/40">
              <HelpCircle size={24} className="text-amber-700 dark:text-amber-400 flex-shrink-0" />
              <div className="flex flex-col text-left">
                <span className="font-bold text-xs text-amber-900 dark:text-amber-300">Account Security Policy</span>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 leading-relaxed">
                  To protect customer privacy against unauthorized SIM takeovers, password resets are verified directly with store support.
                </p>
              </div>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed text-left">
              Please contact Siraj Bedding House with your registered mobile number to reset your password instantly:
            </p>

            <div className="flex flex-col gap-2.5 pt-1">
              <a
                href="https://wa.me/917352502508?text=Hello%20Siraj%20Bedding%20House,%20I%20forgot%20my%20account%20password.%20My%20mobile%20number%20is:%20"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 px-4 rounded-xl transition-all shadow-sm cursor-pointer"
              >
                <Phone size={14} />
                <span>Reset via WhatsApp (+91 73525 02508)</span>
              </a>

              <a
                href="tel:+919800094590"
                className="flex items-center justify-center gap-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-750 text-stone-800 dark:text-stone-200 font-bold text-xs py-3 px-4 rounded-xl transition-all border border-stone-200 dark:border-stone-700 cursor-pointer"
              >
                <Phone size={14} className="text-amber-600" />
                <span>Call Store Helpline (+91 98000 94590)</span>
              </a>
            </div>

            <button
              type="button"
              onClick={() => setIsForgotModalOpen(false)}
              className="mt-2 text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 py-1"
            >
              Back to Login
            </button>
          </div>
        </Dialog>

      </div>
    );
  }

  // =========================================================================
  // AUTHENTICATED CUSTOMER PROFILE VIEW
  // =========================================================================
  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      
      {/* Header Profile details */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200/50 dark:border-stone-850/40 rounded-3xl p-5 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden flex items-center justify-center border-2 border-amber-700/20 text-amber-700 dark:text-amber-400 font-extrabold text-lg">
            {currentUser.photoURL && !avatarError ? (
              <img 
                src={currentUser.photoURL} 
                alt="Avatar" 
                className="w-full h-full object-cover" 
                onError={() => setAvatarError(true)}
              />
            ) : (
              currentUser.name.charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-2">
              <h3 className="font-sans font-extrabold text-base leading-none text-stone-900 dark:text-stone-100">{currentUser.name}</h3>
              <span className="text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Active
              </span>
            </div>
            <span className="text-xs text-stone-500 dark:text-stone-400 mt-1 font-mono">
              {currentUser.normalizedPhone || currentUser.mobileNumber || currentUser.phone || 'No phone registered'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClearDatabase}
            disabled={isClearing}
            className="p-2.5 rounded-full border border-stone-200 dark:border-stone-850 hover:bg-amber-50 hover:text-amber-700 text-stone-400 transition-all cursor-pointer disabled:opacity-50"
            title="Delete Mock Data from Firestore"
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
        <div className="bg-white dark:bg-stone-900 border border-stone-200/50 dark:border-stone-850/40 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-stone-50 dark:border-stone-850/30">
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
                <div className="flex flex-col gap-1 text-xs text-left">
                  <span className="font-bold text-stone-500">Name</span>
                  <input
                    type="text" required
                    value={editName} onChange={(e) => setEditName(e.target.value)}
                    className="bg-stone-50 dark:bg-stone-950 border border-stone-250 dark:border-stone-800 rounded-xl p-2.5 text-stone-900 dark:text-stone-100"
                  />
                </div>
                <div className="flex flex-col gap-1 text-xs text-left">
                  <span className="font-bold text-stone-500">Mobile Number</span>
                  <input
                    type="tel"
                    value={editPhone} onChange={(e) => setEditPhone(e.target.value)}
                    className="bg-stone-50 dark:bg-stone-950 border border-stone-250 dark:border-stone-800 rounded-xl p-2.5 text-stone-900 dark:text-stone-100"
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    type="button" onClick={() => setIsEditing(false)}
                    className="flex-grow bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-xs py-2 rounded-xl"
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
              <div className="flex flex-col gap-2.5 font-sans text-xs text-left">
                <div className="flex justify-between">
                  <span className="text-stone-400">Name</span>
                  <span className="font-bold text-stone-900 dark:text-stone-100">{currentUser.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Mobile</span>
                  <span className="font-bold font-mono text-stone-900 dark:text-stone-100">
                    {currentUser.normalizedPhone || currentUser.mobileNumber || currentUser.phone || 'Not added'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Role</span>
                  <span className="font-bold capitalize text-amber-700 dark:text-amber-400">{currentUser.role || 'Customer'}</span>
                </div>
              </div>
            )}
          </div>
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
            <p className="text-xs text-stone-400 italic flex-grow text-left">No delivery address saved yet.</p>
          )}

          <Link
            to="/checkout"
            className="text-[10px] font-sans font-bold text-amber-700 dark:text-amber-400 hover:underline mt-2 self-start flex items-center gap-1"
          >
            <span>{t('addressBook')}</span>
            <ChevronRight size={10} />
          </Link>
        </div>

      </div>

      {/* SECURITY: CHANGE PASSWORD CARD */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200/50 dark:border-stone-850/40 rounded-3xl p-5 shadow-sm flex flex-col gap-3 text-left">
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-850/40 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 rounded-xl">
              <KeyRound size={16} />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm text-stone-900 dark:text-stone-100">Account Security</span>
              <span className="text-[11px] text-stone-400">Update your account login password</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsChangePassOpen(!isChangePassOpen)}
            className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
          >
            {isChangePassOpen ? 'Close' : 'Change Password'}
          </button>
        </div>

        {isChangePassOpen && (
          <form onSubmit={handleChangePasswordSubmit} className="flex flex-col gap-3 pt-2 max-w-md">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-stone-400 font-bold uppercase">Current Password</label>
              <div className="flex items-center bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-3 py-2 text-xs">
                <input
                  type={showCurrentPass ? 'text' : 'password'}
                  required
                  placeholder="Current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-stone-900 dark:text-stone-100"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  className="text-stone-400 p-1"
                >
                  {showCurrentPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-stone-400 font-bold uppercase">New Password (min 6 chars)</label>
              <div className="flex items-center bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-3 py-2 text-xs">
                <input
                  type={showNewPass ? 'text' : 'password'}
                  required
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-stone-900 dark:text-stone-100"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="text-stone-400 p-1"
                >
                  {showNewPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-stone-400 font-bold uppercase">Confirm New Password</label>
              <div className="flex items-center bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-3 py-2 text-xs">
                <input
                  type="password"
                  required
                  placeholder="Repeat new password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-stone-900 dark:text-stone-100"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={changingPass}
              className="bg-luxury-gold hover:opacity-90 py-2.5 px-4 rounded-xl font-bold text-xs text-white mt-1 shadow-md cursor-pointer disabled:opacity-50"
            >
              {changingPass ? 'Updating Password...' : 'Save New Password'}
            </button>
          </form>
        )}
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
              <h4 className="font-sans font-bold text-sm text-white">Need Help with Your Account or Order?</h4>
            </div>
          </div>
          <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-500/30">
            Online
          </span>
        </div>

        <p className="text-xs text-stone-300 leading-relaxed text-left">
          Have questions about your account, password, custom mattress sizing, or delivery? Chat with Siraj Bedding House directly on WhatsApp.
        </p>

        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <a
            href="https://wa.me/917352502508?text=Hello%20Siraj%20Bedding%20House,%20I%20need%20help%20with%20my%20account/order."
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
