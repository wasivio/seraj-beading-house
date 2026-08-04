import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingBag } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useNotifications } from '../context/NotificationContext';
import { getThumbnailUrl } from '../services/cloudinaryService';
import { useLanguage } from '../context/LanguageContext';

export const Wishlist: React.FC = () => {
  const { wishlist, removeFromWishlist, moveToCartFromWishlist } = useWishlist();
  const { showToast } = useNotifications();
  const { t } = useLanguage();

  const handleMoveToCart = (prod: any) => {
    moveToCartFromWishlist(prod);
    showToast('Moved to Cart 🛒', `"${prod.name}" moved successfully.`, 'order');
  };

  const handleRemove = (productId: string, name: string) => {
    removeFromWishlist(productId);
    showToast('Removed', `"${name}" removed from wishlist.`, 'announcement');
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Title */}
      <div className="flex flex-col">
        <span className="text-[10px] uppercase font-bold tracking-widest text-amber-705">Saved items</span>
        <h2 className="font-sans font-extrabold text-2xl sm:text-3xl mt-0.5 tracking-tight">{t('myWishlist')}</h2>
      </div>

      {wishlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center max-w-sm mx-auto">
          <div className="p-4 bg-stone-100 dark:bg-stone-900 rounded-full text-stone-400">
            <Heart size={32} />
          </div>
          <h4 className="font-sans font-bold text-base">{t('emptyWishlist')}</h4>
          <p className="font-sans text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
            Keep track of premium mattresses and sofa cushions you love. Tap the heart icon on cards.
          </p>
          <Link
            to="/categories"
            className="mt-2 bg-luxury-gold hover:opacity-90 py-2.5 px-6 rounded-xl font-sans font-bold text-xs text-stone-100 cursor-pointer shadow-md inline-block"
          >
            {t('continueShopping')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {wishlist.map((prod) => (
            <div 
              key={prod.id}
              className="bg-white dark:bg-stone-900 border border-stone-200/50 dark:border-stone-850/40 rounded-3xl p-4 flex gap-4 shadow-sm relative"
            >
              {/* Thumbnail */}
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-stone-50 dark:bg-stone-850 flex-shrink-0">
                <img 
                  src={getThumbnailUrl(prod.mainImage)} 
                  alt={prod.name} 
                  className="w-full h-full object-cover" 
                />
              </div>

              {/* Product Info */}
              <div className="flex-grow flex flex-col justify-between min-w-0 pr-8">
                <div className="text-left">
                  <h3 className="font-sans font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 truncate">
                    {prod.name}
                  </h3>
                  <span className="text-[10px] text-stone-400 font-semibold uppercase">{prod.brand}</span>
                </div>

                <div className="flex items-center justify-between gap-4 mt-2">
                  <span className="font-sans font-extrabold text-xs sm:text-sm text-stone-900 dark:text-stone-100">
                    ₹{prod.price.toLocaleString('en-IN')}
                  </span>
                  
                  <button
                    onClick={() => handleMoveToCart(prod)}
                    className="bg-luxury-gold hover:opacity-90 active:scale-95 text-stone-100 font-sans font-bold text-[10px] py-1.5 px-3 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <ShoppingBag size={12} />
                    <span>{t('moveToCart')}</span>
                  </button>
                </div>
              </div>

              {/* Remove button */}
              <button
                onClick={() => handleRemove(prod.id, prod.name)}
                className="absolute top-4 right-4 text-stone-400 hover:text-red-500 cursor-pointer"
                title="Remove"
              >
                <Trash2 size={16} />
              </button>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
