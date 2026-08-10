import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Bell, User, Search, MapPin, Sun, Moon, WifiOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useNotifications } from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { LocationService } from '../../services/LocationService';

interface HeaderProps {
  onSearchOpen: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSearchOpen }) => {
  const { currentUser, isAuthenticated } = useAuth();
  const { cartItems } = useCart();
  const { wishlist } = useWishlist();
  const { unreadCount, showToast } = useNotifications();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [avatarError, setAvatarError] = useState(false);
  const [detectingLoc, setDetectingLoc] = useState(false);
  const [userLocation, setUserLocation] = useState<string>(() => localStorage.getItem('siraj_user_loc') || '');
  const selectedLocation = t('location');

  const handleDetectHeaderLocation = async () => {
    if (detectingLoc) return;
    setDetectingLoc(true);
    showToast('Locating... 🛰️', 'Detecting your real-time location...', 'announcement');
    try {
      const loc = await LocationService.detectCurrentLocation();
      const label = `${loc.city}, ${loc.pincode}`;
      setUserLocation(label);
      localStorage.setItem('siraj_user_loc', label);
      showToast('Location Detected 📍', `Deliver to ${loc.city}, ${loc.state} (${loc.pincode})`, 'announcement');
    } catch {
      showToast('Location Error', 'Unable to auto-detect location.', 'announcement');
    } finally {
      setDetectingLoc(false);
    }
  };

  useEffect(() => {
    setAvatarError(false);
  }, [currentUser?.photoURL]);

  useEffect(() => {
    const goOnline = () => setIsOffline(false);
    const goOffline = () => setIsOffline(true);

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  const totalCartQty = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <>
      {/* Offline Banner */}
      {isOffline && (
        <div className="bg-amber-700 text-stone-100 text-xs py-1 px-4 flex items-center justify-center gap-2 animate-pulse sticky top-0 z-50">
          <WifiOff size={14} />
          <span>You are currently offline. Browsing previously loaded pages.</span>
        </div>
      )}

      <header className="sticky top-0 z-40 w-full glass-nav border-b border-stone-200/50 dark:border-stone-800/30 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          
          {/* Logo & Brand */}
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2 select-none group">
            <img 
              src="/logo.jpg" 
              alt="Siraj Bedding House" 
              className="w-10 h-10 rounded-full object-cover border border-stone-200 dark:border-stone-850 group-hover:scale-105 transition-transform duration-300"
            />
            <div className="flex flex-col">
              <span className="font-sans font-extrabold tracking-tight text-base text-stone-900 dark:text-stone-100 leading-none group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                SIRAJ
              </span>
              <span className="font-sans font-medium tracking-[0.18em] text-[7px] text-amber-700 dark:text-amber-400 mt-0.5 leading-none">
                BEDDING HOUSE
              </span>
            </div>
          </Link>

          {/* Quick Location (Desktop/Tablet) */}
          <div 
            onClick={handleDetectHeaderLocation}
            title="Click to auto-detect current location"
            className="hidden md:flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 max-w-[170px] truncate cursor-pointer hover:text-amber-700 dark:hover:text-amber-400 transition-colors"
          >
            <MapPin size={14} className={`text-amber-700 dark:text-amber-400 flex-shrink-0 ${detectingLoc ? 'animate-bounce' : ''}`} />
            <span className="truncate">{detectingLoc ? 'Detecting...' : (userLocation || selectedLocation)}</span>
          </div>

          {/* Search Trigger Bar (Simulates search bar in header) */}
          <div 
            onClick={onSearchOpen}
            className="flex-grow max-w-lg relative cursor-pointer group hidden sm:block"
          >
            <div className="w-full bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-full py-1.5 pl-4 pr-10 text-sm text-stone-400 flex items-center justify-between group-hover:border-stone-300 dark:group-hover:border-stone-700 transition-all duration-200">
              <span>{t('searchPlaceholder')}</span>
              <Search size={16} className="text-stone-400 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors" />
            </div>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-3 md:gap-4">
            
            {/* Search Trigger for Mobile */}
            <button 
              onClick={onSearchOpen}
              className="p-2 sm:hidden text-stone-700 dark:text-stone-300 hover:text-amber-700 dark:hover:text-amber-400 transition-colors tap-highlight-none"
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            {/* Language Selector */}
            <div className="relative flex items-center">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="text-[10px] font-sans font-extrabold bg-stone-100 dark:bg-stone-850 text-stone-700 dark:text-stone-300 rounded-lg px-1.5 py-1 border-none outline-none focus:ring-0 cursor-pointer appearance-none min-w-[34px] text-center"
              >
                <option value="en">EN</option>
                <option value="hi">हि</option>
                <option value="bn">বা</option>
              </select>
            </div>

            {/* Dark/Light Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 text-stone-700 dark:text-stone-300 hover:text-amber-700 dark:hover:text-amber-400 transition-colors tap-highlight-none"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Notifications */}
            <Link 
              to="/notifications" 
              className="p-2 text-stone-700 dark:text-stone-300 hover:text-amber-700 dark:hover:text-amber-400 relative transition-colors tap-highlight-none"
              aria-label="Notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-amber-700 dark:bg-amber-600 text-stone-100 font-sans font-bold text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center scale-90 border border-stone-50 dark:border-stone-950">
                  {unreadCount}
                </span>
              )}
            </Link>

            {/* Wishlist */}
            <Link 
              to="/wishlist" 
              className="p-2 text-stone-700 dark:text-stone-300 hover:text-amber-700 dark:hover:text-amber-400 relative transition-colors tap-highlight-none hidden sm:block"
              aria-label="Wishlist"
            >
              <Heart size={20} />
              {wishlist.length > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-amber-700 dark:bg-amber-600 text-stone-100 font-sans font-bold text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center scale-90 border border-stone-50 dark:border-stone-950">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link 
              to="/cart" 
              className="p-2 text-stone-700 dark:text-stone-300 hover:text-amber-700 dark:hover:text-amber-400 relative transition-colors tap-highlight-none hidden sm:block"
              aria-label="Cart"
            >
              <ShoppingBag size={20} />
              {totalCartQty > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-amber-700 dark:bg-amber-600 text-stone-100 font-sans font-bold text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center scale-90 border border-stone-50 dark:border-stone-950">
                  {totalCartQty}
                </span>
              )}
            </Link>

            {/* User Profile */}
            <Link 
              to="/profile" 
              className="p-2 text-stone-700 dark:text-stone-300 hover:text-amber-700 dark:hover:text-amber-400 transition-colors tap-highlight-none"
              aria-label="Profile"
            >
              {isAuthenticated && currentUser?.photoURL && !avatarError ? (
                <img 
                  src={currentUser.photoURL} 
                  alt="Profile" 
                  className="w-6 h-6 rounded-full border border-amber-700/30 object-cover" 
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <User size={20} />
              )}
            </Link>

          </div>
        </div>
      </header>
    </>
  );
};
