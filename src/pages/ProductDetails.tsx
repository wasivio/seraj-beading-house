import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Star, Share2, Award, Clock, ArrowLeft, CheckCircle, ThumbsUp, ZoomIn } from 'lucide-react';
import type { Product, Review } from '../types';
import { firebaseService } from '../services/firebaseService';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useNotifications } from '../context/NotificationContext';
import { getDetailsUrl, getThumbnailUrl } from '../services/cloudinaryService';
import { ProductCard } from '../components/product/ProductCard';
import { Dialog } from '../components/common/Dialog';
import { useLanguage } from '../context/LanguageContext';

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Interaction states
  const [activeImage, setActiveImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [qty, setQty] = useState(1);
  
  // Dialogs
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [newReviewText, setNewReviewText] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);

  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { showToast } = useNotifications();

  // Load details
  useEffect(() => {
    const loadDetails = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const prod = await firebaseService.firestore.getProductById(id);
        if (!prod) {
          navigate('/404');
          return;
        }
        setProduct(prod);
        setActiveImage(prod.mainImage);
        
        // Size / Color pre-selects
        setSelectedSize(prod.size[0] || '');
        setSelectedColor(prod.color[0] || '');
        setQty(1);

        // Load reviews
        const revs = await firebaseService.firestore.getReviewsByProductId(id);
        setReviews(revs);

        // Load related
        const allProds = await firebaseService.firestore.getProducts();
        setRelatedProducts(allProds.filter(p => p.category === prod.category && p.id !== prod.id).slice(0, 4));

        // Save & Load Recently Viewed
        saveRecentlyViewed(prod, allProds);

      } catch (err) {
        console.error('Error loading product details', err);
      } finally {
        setLoading(false);
      }
    };
    loadDetails();
  }, [id, navigate]);

  const saveRecentlyViewed = (currentProd: Product, allProds: Product[]) => {
    const local = localStorage.getItem('siraj_recently_viewed');
    let recents: string[] = local ? JSON.parse(local) : [];
    
    // Push new if not duplicate, limit to 5
    recents = [currentProd.id, ...recents.filter(rid => rid !== currentProd.id)].slice(0, 5);
    localStorage.setItem('siraj_recently_viewed', JSON.stringify(recents));

    // Populate recent objects
    const list = recents
      .map(rid => allProds.find(p => p.id === rid))
      .filter((p): p is Product => !!p && p.id !== currentProd.id);
    
    setRecentlyViewed(list);
  };

  if (loading || !product) {
    return (
      <div className="flex flex-col gap-6 animate-pulse pt-4">
        <div className="w-12 h-6 bg-stone-200 dark:bg-stone-850 rounded mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-square bg-stone-250 dark:bg-stone-850 rounded-3xl" />
          <div className="flex flex-col gap-4">
            <div className="h-4 w-24 bg-stone-200 dark:bg-stone-850 rounded" />
            <div className="h-8 w-full bg-stone-200 dark:bg-stone-850 rounded" />
            <div className="h-6 w-32 bg-stone-200 dark:bg-stone-850 rounded" />
            <div className="h-24 w-full bg-stone-200 dark:bg-stone-850 rounded" />
          </div>
        </div>
      </div>
    );
  }

  const isFav = isInWishlist(product.id);

  const handleWishlistToggle = () => {
    if (isFav) {
      removeFromWishlist(product.id);
      showToast('Removed from Wishlist', `"${product.name}" has been removed.`, 'announcement');
    } else {
      addToWishlist(product);
      showToast('Added to Wishlist 💖', `"${product.name}" added successfully.`, 'announcement');
    }
  };

  const handleAddToCart = () => {
    addToCart(product, qty, selectedSize, selectedColor);
    showToast('Added to Cart 🛒', `Added ${qty} quantity of "${product.name}" to cart.`, 'order');
  };

  const handleBuyNow = () => {
    addToCart(product, qty, selectedSize, selectedColor);
    navigate('/checkout');
  };

  const handleShare = async () => {
    const productUrl = window.location.href;
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
      showToast('Link Copied! 🔗', 'Product details link copied to clipboard.', 'announcement');
    }
  };

  const handleLikeReview = (reviewId: string) => {
    setReviews(prev =>
      prev.map(r => (r.id === reviewId ? { ...r, likes: r.likes + 1 } : r))
    );
    showToast('Liked Review 👍', 'Feedback submitted.', 'announcement');
  };

  const handleReportReview = (reviewId: string) => {
    setReviews(prev =>
      prev.map(r => (r.id === reviewId ? { ...r, reported: true } : r))
    );
    showToast('Review Reported ⚠️', 'Thank you. Our moderation team will investigate.', 'announcement');
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewText.trim()) return;

    try {
      const added = await firebaseService.firestore.addReview({
        productId: product.id,
        rating: newRating,
        userName: 'Verified Buyer',
        content: newReviewText,
        verified: true
      });
      setReviews(prev => [added, ...prev]);
      setNewReviewText('');
      setNewRating(5);
      setIsReviewFormOpen(false);
      showToast('Review Posted! ⭐', 'Thank you for sharing your experience.', 'announcement');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col gap-10">
      
      {/* Back CTA */}
      <div className="flex items-center gap-2">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 rounded-full border border-stone-200 dark:border-stone-850 hover:bg-stone-100 dark:hover:bg-stone-900 cursor-pointer flex items-center justify-center text-stone-500"
          aria-label="Back"
        >
          <ArrowLeft size={16} />
        </button>
        <span className="text-xs text-stone-450 font-medium">Back to products</span>
      </div>

      {/* Main product presentation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left: Interactive Image Gallery */}
        <div className="flex flex-col gap-3">
          <div className="relative aspect-square w-full rounded-3xl bg-stone-50 dark:bg-stone-850 overflow-hidden border border-stone-200/50 dark:border-stone-850/40">
            <img 
              src={getDetailsUrl(activeImage)} 
              alt={product.name} 
              className="w-full h-full object-cover"
            />
            {/* Zoom Action overlay */}
            <button
              onClick={() => setIsZoomOpen(true)}
              className="absolute bottom-4 right-4 p-3 rounded-full bg-stone-900/80 hover:bg-stone-950 text-stone-100 backdrop-blur-md cursor-pointer flex items-center justify-center transition-all shadow-lg"
              title="Zoom Image"
            >
              <ZoomIn size={18} />
            </button>
          </div>

          {/* Thumbnails row */}
          {product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                    activeImage === img
                      ? 'border-amber-700 scale-102 shadow-md'
                      : 'border-transparent opacity-75 hover:opacity-100'
                  }`}
                >
                  <img 
                    src={getThumbnailUrl(img)} 
                    alt={`thumbnail-${idx}`} 
                    className="w-full h-full object-cover" 
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Technical specifications and purchase blocks */}
        <div className="flex flex-col justify-between">
          <div>
            {/* Top row Info */}
            <div className="flex items-center justify-between gap-4 mb-2">
              <span className="bg-amber-100 dark:bg-amber-950/20 text-amber-800 dark:text-amber-450 text-[10px] font-sans font-bold uppercase tracking-wider py-1 px-3 rounded-full">
                {product.brand}
              </span>
              <span className="text-xs text-stone-400">SKU: {product.sku}</span>
            </div>

            {/* Title */}
            <h1 className="font-sans font-extrabold text-xl sm:text-2xl tracking-tight leading-tight my-2">
              {product.name}
            </h1>

            {/* Star ratings */}
            <div className="flex items-center gap-1.5 mb-4">
              <div className="flex gap-0.5 text-yellow-500">
                <Star size={14} fill="currentColor" />
              </div>
              <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
                {product.rating}
              </span>
              <span className="text-[11px] text-stone-400">
                ({product.reviewCount} customer reviews)
              </span>
            </div>

            {/* Prices */}
            <div className="flex items-baseline gap-3 mb-5 py-3 border-y border-stone-200/40 dark:border-stone-850/40">
              <span className="text-2xl font-sans font-extrabold text-stone-900 dark:text-stone-100">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-sm text-stone-400 line-through">
                  ₹{product.originalPrice.toLocaleString('en-IN')}
                </span>
              )}
              {product.discountPercent > 0 && (
                <span className="text-xs font-sans text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-lg">
                  {product.discountPercent}% OFF
                </span>
              )}
            </div>

            {/* Custom selectors size and color */}
            {product.size.length > 0 && (
              <div className="mb-4">
                <span className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-2">
                  Select Mattress/Product Size
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.size.map((sz, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedSize(sz)}
                      className={`text-xs py-2 px-3 rounded-xl border transition-all cursor-pointer ${
                        selectedSize === sz
                          ? 'border-amber-700 bg-amber-50 dark:bg-amber-950/20 text-amber-705 font-bold'
                          : 'border-stone-200 dark:border-stone-800 text-stone-500 hover:bg-stone-50'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.color.length > 0 && (
              <div className="mb-5">
                <span className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-2">
                  Select Color option
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.color.map((cl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedColor(cl)}
                      className={`text-xs py-2 px-3 rounded-xl border transition-all cursor-pointer ${
                        selectedColor === cl
                          ? 'border-amber-700 bg-amber-50 dark:bg-amber-950/20 text-amber-705 font-bold'
                          : 'border-stone-200 dark:border-stone-800 text-stone-500 hover:bg-stone-50'
                      }`}
                    >
                      {cl}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Qty incrementer and Buy Actions */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-stone-200 dark:border-stone-800 rounded-xl bg-stone-50 dark:bg-stone-900 overflow-hidden">
                <button
                  onClick={() => setQty(prev => Math.max(1, prev - 1))}
                  className="px-3 py-2 text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-850 cursor-pointer"
                >
                  -
                </button>
                <span className="px-4 text-xs font-bold">{qty}</span>
                <button
                  onClick={() => setQty(prev => prev + 1)}
                  className="px-3 py-2 text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-850 cursor-pointer"
                >
                  +
                </button>
              </div>

              <div className="flex-grow flex gap-2">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stockStatus === 'out_of_stock'}
                  className="flex-grow bg-stone-100 dark:bg-stone-850 hover:bg-stone-200 text-stone-800 dark:text-stone-100 font-sans font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                >
                  <ShoppingBag size={16} />
                  <span>{t('addToCart')}</span>
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={product.stockStatus === 'out_of_stock'}
                  className="flex-grow bg-luxury-gold hover:opacity-90 active:scale-95 text-stone-100 font-sans font-bold text-xs py-3 px-4 rounded-xl transition-all cursor-pointer shadow-lg disabled:opacity-50"
                >
                  {t('buyNow')}
                </button>
              </div>
            </div>

            {/* Wishlist & Share controls */}
            <div className="flex items-center justify-between py-4 border-t border-stone-200/40 dark:border-stone-850/40 gap-4 text-xs text-stone-500">
              <button
                onClick={handleWishlistToggle}
                className="flex items-center gap-1.5 hover:text-amber-705 cursor-pointer"
              >
                <Heart size={16} fill={isFav ? 'currentColor' : 'none'} className={isFav ? 'text-amber-700' : ''} />
                <span>{isFav ? 'In Wishlist' : 'Add to Wishlist'}</span>
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 hover:text-amber-705 cursor-pointer"
              >
                <Share2 size={16} />
                <span>Share Product</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications & Warranties block */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-stone-200/50 dark:border-stone-850/50">
        {/* Specs column */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <h3 className="font-sans font-extrabold text-sm uppercase tracking-wider">{t('specifications')}</h3>
          <div className="border border-stone-200/60 dark:border-stone-800/40 rounded-2xl overflow-hidden bg-white dark:bg-stone-900">
            {Object.entries(product.specifications).map(([key, val], idx) => (
              <div 
                key={idx}
                className={`grid grid-cols-3 p-3.5 text-xs font-sans border-b border-stone-100 dark:border-stone-850/30 last:border-0 ${
                  idx % 2 === 0 ? 'bg-stone-50/50 dark:bg-stone-900/30' : ''
                }`}
              >
                <span className="font-bold text-stone-500 dark:text-stone-400">{key}</span>
                <span className="col-span-2 font-normal text-stone-750 dark:text-stone-200">{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Brand warranties column */}
        <div className="flex flex-col gap-4">
          <h3 className="font-sans font-extrabold text-sm uppercase tracking-wider">Brand Information</h3>
          <div className="flex flex-col gap-3 p-5 rounded-2xl border border-stone-205/60 dark:border-stone-800/40 bg-white dark:bg-stone-900">
            <div className="flex items-start gap-3">
              <Award className="text-amber-700 dark:text-amber-400 mt-0.5" size={16} />
              <div className="flex flex-col">
                <span className="font-bold text-xs">Warranty Guarantee</span>
                <p className="text-[11px] text-stone-400 mt-0.5">{product.warranty} Manufacturer Warranty coverage.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="text-amber-700 dark:text-amber-400 mt-0.5" size={16} />
              <div className="flex flex-col">
                <span className="font-bold text-xs">Delivery Information</span>
                <p className="text-[11px] text-stone-400 mt-0.5">{product.deliveryInfo}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="text-amber-700 dark:text-amber-400 mt-0.5" size={16} />
              <div className="flex flex-col">
                <span className="font-bold text-xs">Return & Cancellation Policy</span>
                <p className="text-[11px] text-stone-400 mt-0.5">{product.returnPolicy}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews listing */}
      <section className="flex flex-col gap-6 pt-6 border-t border-stone-200/50 dark:border-stone-850/50">
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-900 pb-3">
          <h3 className="font-sans font-extrabold text-sm uppercase tracking-wider">{t('reviews')} ({reviews.length})</h3>
          <button
            onClick={() => setIsReviewFormOpen(true)}
            className="text-xs font-bold text-amber-700 dark:text-amber-405 hover:underline cursor-pointer"
          >
            {t('addReview')}
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {reviews.length === 0 ? (
            <p className="text-xs text-stone-400 italic">No reviews yet for this product. Be the first to review!</p>
          ) : (
            reviews.map((rev) => (
              <div 
                key={rev.id}
                className="bg-white dark:bg-stone-900 border border-stone-200/50 dark:border-stone-850/40 p-5 rounded-2xl flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-sans font-bold text-xs">{rev.userName}</span>
                    {rev.verified && (
                      <span className="bg-emerald-100 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-450 text-[9px] font-sans font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-stone-400">{rev.date}</span>
                </div>

                {/* Stars */}
                <div className="flex gap-0.5 text-yellow-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={12} fill={i < rev.rating ? 'currentColor' : 'none'} className={i >= rev.rating ? 'text-stone-300 dark:text-stone-700' : ''} />
                  ))}
                </div>

                {/* Content */}
                <p className="font-sans text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                  {rev.content}
                </p>

                {/* Photo Review Attachment */}
                {rev.photos && rev.photos.length > 0 && (
                  <div className="flex gap-2">
                    {rev.photos.map((pUrl, idx) => (
                      <img 
                        key={idx}
                        src={pUrl}
                        alt="customer review layout"
                        loading="lazy"
                        className="w-12 h-12 object-cover rounded-xl border border-stone-200/40"
                      />
                    ))}
                  </div>
                )}

                {/* Review feedback (likes, reports) */}
                <div className="flex items-center gap-4 text-[10px] text-stone-400 border-t border-stone-50 dark:border-stone-850/30 pt-2.5">
                  <button 
                    onClick={() => handleLikeReview(rev.id)}
                    className="flex items-center gap-1 hover:text-amber-705 cursor-pointer"
                  >
                    <ThumbsUp size={12} />
                    <span>Helpful ({rev.likes})</span>
                  </button>
                  <button 
                    onClick={() => handleReportReview(rev.id)}
                    className="hover:text-red-500 cursor-pointer"
                    disabled={rev.reported}
                  >
                    {rev.reported ? 'Reported' : 'Report'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Related Products list */}
      {relatedProducts.length > 0 && (
        <section className="flex flex-col gap-4 pt-6 border-t border-stone-200/50 dark:border-stone-850/50">
          <h3 className="font-sans font-extrabold text-sm uppercase tracking-wider">Related Bedding Items</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} onQuickView={() => {}} />
            ))}
          </div>
        </section>
      )}

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <section className="flex flex-col gap-4 pt-6 border-t border-stone-200/50 dark:border-stone-850/50">
          <h3 className="font-sans font-extrabold text-sm uppercase tracking-wider">Recently Viewed</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recentlyViewed.map((prod) => (
              <ProductCard key={prod.id} product={prod} onQuickView={() => {}} />
            ))}
          </div>
        </section>
      )}

      {/* Photo Zoom Dialog Box */}
      <Dialog isOpen={isZoomOpen} onClose={() => setIsZoomOpen(false)} title="Image Zoom" maxWidth="xl">
        <div className="w-full aspect-square rounded-2xl overflow-hidden bg-stone-50 dark:bg-stone-900 border border-stone-200/40">
          <img src={activeImage} alt="Zoomed view" className="w-full h-full object-contain" />
        </div>
      </Dialog>

      {/* Review Submission Dialog Box */}
      <Dialog isOpen={isReviewFormOpen} onClose={() => setIsReviewFormOpen(false)} title="Write a Product Review">
        <form onSubmit={handleSubmitReview} className="flex flex-col gap-4 mt-2">
          {/* Star selector */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-stone-705">Rating</span>
            <div className="flex gap-1.5 text-yellow-500">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setNewRating(num)}
                  className="p-1 hover:scale-115 transition-transform"
                >
                  <Star size={20} fill={num <= newRating ? 'currentColor' : 'none'} />
                </button>
              ))}
            </div>
          </div>

          {/* Feedback message */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-stone-705">Review Comment</span>
            <textarea
              required
              rows={4}
              placeholder="What was your experience with spine support, size accuracy, packaging?"
              value={newReviewText}
              onChange={(e) => setNewReviewText(e.target.value)}
              className="bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-xl p-3 text-xs text-stone-800 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-luxury-gold hover:opacity-90 py-3 rounded-xl text-stone-100 text-xs font-bold mt-2 shadow-md cursor-pointer"
          >
            Submit Review
          </button>
        </form>
      </Dialog>

    </div>
  );
};
