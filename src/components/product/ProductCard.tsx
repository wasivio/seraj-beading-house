import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Eye, Share2, Star, GitCompare } from 'lucide-react';
import type { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useNotifications } from '../../context/NotificationContext';
import { useCompare } from '../../context/CompareContext';
import { getCardUrl } from '../../services/cloudinaryService';
import { useLanguage } from '../../context/LanguageContext';

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const { showToast } = useNotifications();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const isFav = isInWishlist(product.id);
  const isCompared = isInCompare(product.id);
  const cardImage = getCardUrl(product.mainImage);

  const handleCompareToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isCompared) {
      removeFromCompare(product.id);
      showToast('Removed from Compare', `"${product.name}" removed from comparison.`, 'announcement');
    } else {
      addToCompare(product);
      showToast('Added to Compare ⚖️', `"${product.name}" added to comparison.`, 'announcement');
    }
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFav) {
      removeFromWishlist(product.id);
      showToast('Removed from Wishlist', `"${product.name}" has been removed.`, 'announcement');
    } else {
      addToWishlist(product);
      showToast('Added to Wishlist 💖', `"${product.name}" added successfully.`, 'announcement');
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    showToast('Added to Cart 🛒', `"${product.name}" is now in your shopping cart.`, 'order');
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    navigate('/checkout');
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const productUrl = `${window.location.origin}/product/${product.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: productUrl
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(productUrl);
      showToast('Link Copied! 🔗', 'Product URL copied to clipboard.', 'announcement');
    }
  };

  return (
    <div className="group relative bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/50 dark:border-stone-850/40 p-3 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      
      {/* Upper Badging and Image wrapper */}
      <div className="relative aspect-square w-full rounded-2xl bg-stone-50 dark:bg-stone-850 overflow-hidden mb-3">
        
        {/* Lazy loading images */}
        <img 
          src={cardImage} 
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {product.discountPercent > 0 && (
            <span className="bg-amber-700/90 text-stone-100 text-[10px] font-sans font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
              {product.discountPercent}% OFF
            </span>
          )}
          {product.isTodayDeal && (
            <span className="bg-yellow-600/90 text-stone-900 text-[9px] font-sans font-extrabold px-2 py-0.5 rounded-full backdrop-blur-sm">
              TODAY'S DEAL
            </span>
          )}
          {product.isBestSeller && (
            <span className="bg-emerald-700/90 text-stone-100 text-[9px] font-sans font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm">
              BEST SELLER
            </span>
          )}
        </div>

        {/* Favorite Icon */}
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-2 right-2 p-2 rounded-full shadow-md z-10 cursor-pointer backdrop-blur-md transition-all ${
            isFav 
              ? 'bg-amber-700/90 text-stone-100 scale-105' 
              : 'bg-white/80 dark:bg-stone-900/80 text-stone-700 dark:text-stone-305 hover:bg-stone-50'
          }`}
          aria-label="Add to Wishlist"
        >
          <Heart size={16} fill={isFav ? 'currentColor' : 'none'} />
        </button>

        {/* Compare Icon */}
        <button
          onClick={handleCompareToggle}
          className={`absolute top-11 right-2 p-2 rounded-full shadow-md z-10 cursor-pointer backdrop-blur-md transition-all ${
            isCompared 
              ? 'bg-amber-700/90 text-stone-100 scale-105' 
              : 'bg-white/80 dark:bg-stone-900/80 text-stone-700 dark:text-stone-305 hover:bg-stone-50'
          }`}
          aria-label="Compare Product"
          title="Compare Product"
        >
          <GitCompare size={16} />
        </button>

        {/* Action Tray Overlay on Hover (Desktop only) */}
        <div className="absolute inset-0 bg-stone-950/20 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2.5 transition-opacity duration-300 z-10 pointer-events-none group-hover:pointer-events-auto">
          <button
            onClick={() => onQuickView(product)}
            className="p-2.5 rounded-full bg-white text-stone-900 shadow-lg hover:scale-110 active:scale-95 transition-transform cursor-pointer"
            title="Quick View"
          >
            <Eye size={18} />
          </button>
          <button
            onClick={handleShare}
            className="p-2.5 rounded-full bg-white text-stone-900 shadow-lg hover:scale-110 active:scale-95 transition-transform cursor-pointer"
            title="Share"
          >
            <Share2 size={18} />
          </button>
        </div>
      </div>

      {/* Product Details */}
      <Link to={`/product/${product.id}`} className="flex-grow flex flex-col justify-between px-1">
        
        {/* Brand & Stock Status */}
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-stone-400">
            {product.brand}
          </span>
          {product.stockStatus === 'out_of_stock' ? (
            <span className="text-[9px] font-sans font-bold text-red-500 bg-red-50 dark:bg-red-950/20 px-1.5 py-0.5 rounded-md">
              OUT OF STOCK
            </span>
          ) : product.stockStatus === 'low_stock' ? (
            <span className="text-[9px] font-sans font-bold text-amber-500 bg-amber-50 dark:bg-amber-950/20 px-1.5 py-0.5 rounded-md">
              ONLY A FEW LEFT
            </span>
          ) : null}
        </div>

        {/* Title */}
        <h3 className="font-sans font-bold text-sm text-stone-900 dark:text-stone-100 line-clamp-1 mb-1 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
          {product.name}
        </h3>

        {/* Ratings */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex items-center gap-0.5 text-yellow-500">
            <Star size={12} fill="currentColor" />
          </div>
          <span className="font-sans text-[11px] font-bold text-stone-700 dark:text-stone-300">
            {product.rating}
          </span>
          <span className="font-sans text-[10px] text-stone-400">
            ({product.reviewCount})
          </span>
        </div>

        {/* Price & Cart CTA */}
        <div className="flex flex-col gap-2 mt-auto pt-2 border-t border-stone-100 dark:border-stone-850/50">
          
          {/* Price row */}
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-baseline gap-1.5">
              <span className="font-sans font-extrabold text-stone-900 dark:text-stone-100 text-sm">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.originalPrice > product.price && (
                <span className="font-sans text-[10px] text-stone-400 line-through">
                  ₹{product.originalPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            {product.discountPercent > 0 && (
              <span className="text-[9px] font-sans text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/20 px-1.5 py-0.5 rounded-md">
                -{product.discountPercent}%
              </span>
            )}
          </div>

          {/* Action buttons row */}
          <div className="flex items-center gap-1.5 w-full">
            {/* Quick Add To Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={product.stockStatus === 'out_of_stock'}
              className="p-2 rounded-xl bg-stone-100 dark:bg-stone-850 text-stone-750 dark:text-stone-300 hover:bg-amber-700 hover:text-stone-100 dark:hover:bg-amber-600 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0"
              title={t('addToCart')}
            >
              <ShoppingBag size={14} />
            </button>
            <button
              onClick={handleBuyNow}
              disabled={product.stockStatus === 'out_of_stock'}
              className="flex-grow py-2 rounded-xl bg-luxury-gold hover:opacity-90 active:scale-95 text-stone-100 text-xs font-sans font-bold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-center"
            >
              {t('buyNow')}
            </button>
          </div>
        </div>

      </Link>
    </div>
  );
};
