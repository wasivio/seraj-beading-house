import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, ShoppingBag, ArrowRight } from 'lucide-react';
import type { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useNotifications } from '../../context/NotificationContext';
import { Dialog } from '../common/Dialog';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, isOpen, onClose }) => {
  const { addToCart } = useCart();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [qty, setQty] = useState(1);

  if (!product) return null;

  // Initialize options
  const defaultSize = selectedSize || (product.size.length > 0 ? product.size[0] : '');
  const defaultColor = selectedColor || (product.color.length > 0 ? product.color[0] : '');

  const handleAddToCart = () => {
    addToCart(product, qty, defaultSize, defaultColor);
    showToast('Added to Cart 🛒', `"${product.name}" added successfully.`, 'order');
    onClose();
  };

  const handleBuyNow = () => {
    addToCart(product, qty, defaultSize, defaultColor);
    onClose();
    navigate('/checkout');
  };

  const handleViewDetails = () => {
    onClose();
    navigate(`/product/${product.id}`);
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={product.name} maxWidth="lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
        {/* Left: Image display */}
        <div className="relative aspect-square rounded-2xl bg-stone-50 dark:bg-stone-850 overflow-hidden">
          <img 
            src={product.mainImage} 
            alt={product.name} 
            className="w-full h-full object-cover"
          />
          {product.discountPercent > 0 && (
            <span className="absolute top-3 left-3 bg-amber-700 text-stone-100 text-xs font-sans font-bold px-2 py-0.5 rounded-full">
              {product.discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Right: Details & Config */}
        <div className="flex flex-col justify-between">
          <div>
            {/* Brand, SKU & Stock */}
            <div className="flex items-center justify-between gap-4 mb-2">
              <span className="text-xs text-stone-400 font-bold uppercase tracking-wider">{product.brand}</span>
              <span className="text-[10px] text-stone-400">SKU: {product.sku}</span>
            </div>

            {/* Price section */}
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-xl font-sans font-extrabold text-stone-900 dark:text-stone-100">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-sm text-stone-400 line-through">
                  ₹{product.originalPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1 mb-4">
              <div className="flex items-center text-yellow-500">
                <Star size={14} fill="currentColor" />
              </div>
              <span className="text-xs font-bold text-stone-700 dark:text-stone-300">{product.rating}</span>
              <span className="text-[11px] text-stone-400">({product.reviewCount} verified reviews)</span>
            </div>

            {/* Description */}
            <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-3 mb-4 leading-relaxed">
              {product.description}
            </p>

            {/* Size Configurations */}
            {product.size.length > 0 && (
              <div className="mb-3">
                <span className="text-xs font-bold text-stone-700 dark:text-stone-350 block mb-1.5">Select Size</span>
                <div className="flex flex-wrap gap-2">
                  {product.size.map((sz, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedSize(sz)}
                      className={`text-xs py-1.5 px-3 rounded-xl border transition-all cursor-pointer ${
                        (selectedSize || defaultSize) === sz
                          ? 'border-amber-700 bg-amber-50 dark:bg-amber-950/20 text-amber-705 font-semibold'
                          : 'border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-450 hover:bg-stone-50'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Configurations */}
            {product.color.length > 0 && (
              <div className="mb-4">
                <span className="text-xs font-bold text-stone-700 dark:text-stone-350 block mb-1.5">Select Color</span>
                <div className="flex flex-wrap gap-2">
                  {product.color.map((cl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedColor(cl)}
                      className={`text-xs py-1.5 px-3 rounded-xl border transition-all cursor-pointer ${
                        (selectedColor || defaultColor) === cl
                          ? 'border-amber-700 bg-amber-50 dark:bg-amber-950/20 text-amber-705 font-semibold'
                          : 'border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-450 hover:bg-stone-50'
                      }`}
                    >
                      {cl}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center gap-3 mb-5">
              <span className="text-xs font-bold text-stone-700 dark:text-stone-350">Quantity:</span>
              <div className="flex items-center border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden bg-stone-50 dark:bg-stone-900">
                <button
                  onClick={() => setQty(prev => Math.max(1, prev - 1))}
                  className="px-3 py-1 text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                >
                  -
                </button>
                <span className="px-3 text-xs font-bold">{qty}</span>
                <button
                  onClick={() => setQty(prev => prev + 1)}
                  className="px-3 py-1 text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-4 border-t border-stone-100 dark:border-stone-850/50">
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddToCart}
                disabled={product.stockStatus === 'out_of_stock'}
                className="flex-grow bg-stone-100 dark:bg-stone-850 hover:bg-stone-200 text-stone-800 dark:text-stone-100 font-sans font-semibold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-55"
              >
                <ShoppingBag size={14} />
                <span>Add To Cart</span>
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.stockStatus === 'out_of_stock'}
                className="flex-grow bg-luxury-gold hover:opacity-90 active:scale-95 text-stone-100 font-sans font-semibold text-xs py-3 px-4 rounded-xl transition-all cursor-pointer disabled:opacity-55"
              >
                Buy Now
              </button>
            </div>
            <button
              onClick={handleViewDetails}
              className="text-stone-400 hover:text-amber-705 text-[11px] font-semibold mt-1 flex items-center justify-center gap-1 cursor-pointer self-center"
            >
              <span>View Full Details & Specs</span>
              <ArrowRight size={10} />
            </button>
          </div>

        </div>
      </div>
    </Dialog>
  );
};
