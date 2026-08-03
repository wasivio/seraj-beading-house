import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Grid, Heart, ShoppingBag, User } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

export const BottomNav: React.FC = () => {
  const { cartItems } = useCart();
  const { wishlist } = useWishlist();
  const location = useLocation();

  const totalCartQty = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const navItems = [
    {
      to: '/',
      label: 'Home',
      icon: Home,
      exact: true
    },
    {
      to: '/categories',
      label: 'Categories',
      icon: Grid
    },
    {
      to: '/wishlist',
      label: 'Wishlist',
      icon: Heart,
      badge: wishlist.length
    },
    {
      to: '/cart',
      label: 'Cart',
      icon: ShoppingBag,
      badge: totalCartQty
    },
    {
      to: '/profile',
      label: 'Profile',
      icon: User
    }
  ];

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-stone-50/80 dark:bg-stone-950/80 backdrop-blur-lg border-t border-stone-200/50 dark:border-stone-850/50 h-16 pb-safe flex items-center justify-around px-2 shadow-lg transition-colors duration-300">
      {navItems.map((item) => {
        const Icon = item.icon;
        
        // Active tab matching logic
        const isActive = item.exact 
          ? location.pathname === item.to 
          : location.pathname.startsWith(item.to);

        return (
          <NavLink
            key={item.to}
            to={item.to}
            className="flex flex-col items-center justify-center w-14 h-full relative tap-highlight-none text-stone-500 dark:text-stone-400"
          >
            <div className={`p-1.5 rounded-full transition-all duration-200 ${
              isActive 
                ? 'text-amber-700 dark:text-amber-400 scale-110' 
                : 'active:scale-95'
            }`}>
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            </div>

            <span className={`text-[10px] tracking-wide font-sans font-medium transition-colors duration-200 mt-px ${
              isActive 
                ? 'text-amber-750 dark:text-amber-400 font-semibold' 
                : 'text-stone-400 dark:text-stone-500'
            }`}>
              {item.label}
            </span>

            {/* Badges for Wishlist and Cart */}
            {!!item.badge && item.badge > 0 && (
              <span className="absolute top-1.5 right-2 bg-amber-700 dark:bg-amber-600 text-stone-100 font-sans font-bold text-[8px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center scale-90 border border-stone-50 dark:border-stone-950">
                {item.badge}
              </span>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
};
