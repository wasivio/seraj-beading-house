import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Award, ArrowRight, Mail, Phone, Clock, MapPin, Check } from 'lucide-react';
import { HeroBanner } from '../components/home/HeroBanner';
import { HomeReviews } from '../components/home/HomeReviews';
import { FaqSection } from '../components/home/FaqSection';
import { ProductCard } from '../components/product/ProductCard';
import { QuickViewModal } from '../components/product/QuickViewModal';
import type { Product } from '../types';
import { WHY_CHOOSE_US, STORE_STATS, BRAND_DATA } from '../utils/mockData';
import { useNotifications } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';

import { useProductsQuery } from '../hooks/useProductsQuery';

export const Home: React.FC = () => {
  const { data: products = [], refetch } = useProductsQuery();
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const navigate = useNavigate();
  const { showToast } = useNotifications();
  const { t } = useLanguage();

  useEffect(() => {
    if (products.length > 0) {
      const local = localStorage.getItem('siraj_recently_viewed');
      if (local) {
        const ids: string[] = JSON.parse(local);
        const recents = ids
          .map(rid => products.find(p => p.id === rid))
          .filter((p): p is Product => !!p);
        setRecentlyViewed(recents);
      }
    }
  }, [products]);

  useEffect(() => {
    const handleRefresh = () => refetch();
    window.addEventListener('app_refresh_trigger', handleRefresh);
    return () => window.removeEventListener('app_refresh_trigger', handleRefresh);
  }, []);

  const handleQuickView = (product: Product) => {
    setSelectedProduct(product);
    setIsQuickViewOpen(true);
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      showToast('Invalid Email', 'Please enter a valid email address.', 'announcement');
      return;
    }
    setSubscribed(true);
    showToast('Subscribed! ✉️', 'Thank you for subscribing to Siraj Bedding House newsletter.', 'announcement');
    setEmail('');
  };

  // Sections filtering
  const trending = products.filter(p => p.isTrending).slice(0, 4);
  const bestSellers = products.filter(p => p.isBestSeller).slice(0, 4);
  const todayDeals = products.filter(p => p.isTodayDeal).slice(0, 4);
  const featured = products.filter(p => p.isFeatured).slice(0, 4);
  const newArrivals = products.filter(p => p.isNewArrival).slice(0, 4);

  const categoriesList = Array.from(new Set(products.map(p => p.category).filter(Boolean))).map(cat => ({
    id: cat,
    name: cat.charAt(0).toUpperCase() + cat.slice(1),
    slug: cat,
    image: products.find(p => p.category === cat)?.mainImage || 'https://via.placeholder.com/150'
  }));

  return (
    <div className="flex flex-col gap-10">
      
      {/* 1. Hero banner auto slider */}
      <HeroBanner />

      {/* 2. Horizontal Categories list */}
      {categoriesList.length > 0 && (
        <section className="w-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-sans font-extrabold text-lg sm:text-xl tracking-tight">Shop By Category</h2>
            <Link to="/categories" className="text-xs font-bold text-amber-700 dark:text-amber-455 hover:underline flex items-center gap-1">
              <span>{t('viewAll')}</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          {/* Scrollable container */}
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 px-1">
            {categoriesList.map((cat) => (
              <div
                key={cat.id}
                onClick={() => navigate(`/categories?category=${cat.slug}`)}
                className="flex-shrink-0 w-24 sm:w-28 flex flex-col items-center gap-2 cursor-pointer group"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border border-stone-200/50 dark:border-stone-850/50 group-hover:border-amber-700 dark:group-hover:border-amber-450 transition-colors">
                  <img 
                    src={cat.image} 
                    alt={cat.name} 
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <span className="font-sans text-[11px] font-semibold text-stone-700 dark:text-stone-300 text-center line-clamp-1 group-hover:text-amber-750 dark:group-hover:text-amber-400 transition-colors">
                  {cat.name}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. Today's Deals (Flash Sale Banner) */}
      {todayDeals.length > 0 && (
        <section className="w-full">
          <div className="bg-gradient-to-r from-amber-900 to-amber-700 text-stone-100 rounded-3xl p-5 sm:p-8 relative overflow-hidden mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl">
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10 flex flex-col">
              <span className="bg-white/20 text-white text-[9px] font-sans font-bold px-2 py-0.5 rounded-full w-max mb-3 uppercase tracking-wider">Flash Sale</span>
              <h3 className="font-sans font-extrabold text-xl sm:text-2xl leading-tight">{t('todayDeals')} - Flat 40% Off</h3>
              <p className="font-sans text-xs text-stone-200 mt-1">Upgrade your sleep posture with premium Memory Contour Pillows.</p>
            </div>
            <button 
              onClick={() => navigate('/categories?category=pillow')}
              className="bg-white text-amber-900 hover:bg-stone-50 font-sans font-bold text-xs py-3 px-6 rounded-xl transition-all relative z-10 cursor-pointer flex items-center gap-2"
            >
              <span>{t('buyNow')}</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {todayDeals.map((prod) => (
              <ProductCard key={prod.id} product={prod} onQuickView={handleQuickView} />
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="w-full">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-700 dark:text-amber-400">Selected Comforts</span>
              <h2 className="font-sans font-extrabold text-lg sm:text-xl mt-0.5 tracking-tight">Featured Products</h2>
            </div>
            <Link to="/categories?filter=featured" className="text-xs font-bold text-amber-700 dark:text-amber-450 hover:underline flex items-center gap-1">
              <span>{t('viewAll')}</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {featured.map((prod) => (
              <ProductCard key={prod.id} product={prod} onQuickView={handleQuickView} />
            ))}
          </div>
        </section>
      )}

      {/* 4. Trending collections */}
      {trending.length > 0 && (
        <section className="w-full">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-700 dark:text-amber-400">{t('popularChoice')}</span>
              <h2 className="font-sans font-extrabold text-lg sm:text-xl mt-0.5 tracking-tight">{t('trending')}</h2>
            </div>
            <Link to="/categories?filter=trending" className="text-xs font-bold text-amber-700 dark:text-amber-450 hover:underline flex items-center gap-1">
              <span>{t('viewAll')}</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {trending.map((prod) => (
              <ProductCard key={prod.id} product={prod} onQuickView={handleQuickView} />
            ))}
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="w-full">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-700 dark:text-amber-400">Fresh Stock</span>
              <h2 className="font-sans font-extrabold text-lg sm:text-xl mt-0.5 tracking-tight">New Arrivals</h2>
            </div>
            <Link to="/categories?filter=newest" className="text-xs font-bold text-amber-700 dark:text-amber-450 hover:underline flex items-center gap-1">
              <span>{t('viewAll')}</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {newArrivals.map((prod) => (
              <ProductCard key={prod.id} product={prod} onQuickView={handleQuickView} />
            ))}
          </div>
        </section>
      )}

      {/* 5. Video Banner (Simulated luxury bed visualization) */}
      <section className="w-full">
        <div className="relative h-[250px] sm:h-[300px] rounded-3xl overflow-hidden shadow-lg bg-stone-900 group">
          <img 
            src="https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=1200" 
            alt="Luxury sleep showroom" 
            className="w-full h-full object-cover brightness-[0.4] group-hover:scale-102 transition-transform duration-700"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-100 p-6 text-center">
            <span className="text-[10px] font-sans font-semibold uppercase tracking-widest text-amber-455 mb-2">Siraj Bedding Showcase</span>
            <h3 className="font-sans font-extrabold text-lg sm:text-2xl max-w-lg leading-tight">Explore the Art of Deep Sleep</h3>
            <p className="font-sans text-stone-300 text-xs mt-1.5 max-w-sm">Watch our orthopedists explain how spine alignment changes sleep quality.</p>
            
            {/* Play button indicator */}
            <div className="mt-4 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 transition-all cursor-pointer flex items-center justify-center scale-90 sm:scale-100 active:scale-95">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-stone-100 pl-0.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Best Sellers */}
      {bestSellers.length > 0 && (
        <section className="w-full">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-700 dark:text-amber-400">Customer Favorites</span>
              <h2 className="font-sans font-extrabold text-lg sm:text-xl mt-0.5 tracking-tight">{t('bestSellers')}</h2>
            </div>
            <Link to="/categories?filter=best_seller" className="text-xs font-bold text-amber-700 dark:text-amber-455 hover:underline flex items-center gap-1">
              <span>{t('viewAll')}</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {bestSellers.map((prod) => (
              <ProductCard key={prod.id} product={prod} onQuickView={handleQuickView} />
            ))}
          </div>
        </section>
      )}

      {/* 7. Store Statistics */}
      <section className="bg-stone-100 dark:bg-stone-900/60 rounded-3xl p-6 sm:p-8 w-full border border-stone-200/40 dark:border-stone-850/30">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {STORE_STATS.map((stat, idx) => (
            <div key={idx} className="flex flex-col gap-1">
              <span className="font-sans font-extrabold text-2xl sm:text-3xl text-amber-700 dark:text-amber-400">
                {stat.value}
              </span>
              <span className="font-sans text-[10px] sm:text-xs text-stone-400 font-medium">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <section className="w-full">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-700 dark:text-amber-400">Your History</span>
              <h2 className="font-sans font-extrabold text-lg sm:text-xl mt-0.5 tracking-tight">Recently Viewed Products</h2>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {recentlyViewed.map((prod) => (
              <ProductCard key={prod.id} product={prod} onQuickView={handleQuickView} />
            ))}
          </div>
        </section>
      )}

      {/* 8. Why Choose Us */}
      <section className="w-full">
        <div className="text-center mb-8">
          <span className="text-[10px] uppercase font-bold tracking-widest text-amber-700 dark:text-amber-400">Our Pillars</span>
          <h2 className="font-sans font-extrabold text-2xl sm:text-3xl mt-1 tracking-tight">{t('whyChooseUs')}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {WHY_CHOOSE_US.map((item, idx) => {
            return (
              <div 
                key={idx}
                className="flex items-start gap-4 p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-150/40 dark:border-stone-850/40 hover:shadow-md transition-shadow"
              >
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-750 dark:text-amber-400 flex-shrink-0 mt-0.5">
                  <Award size={18} />
                </div>
                <div>
                  <h4 className="font-sans font-bold text-sm text-stone-900 dark:text-stone-100 mb-1">{item.title}</h4>
                  <p className="font-sans text-xs text-stone-500 dark:text-stone-400 leading-relaxed">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 9. Brands We Sell */}
      <section className="w-full">
        <div className="text-center mb-6">
          <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400">Shop By Brand</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 opacity-70 dark:opacity-80">
          {BRAND_DATA.map((br, idx) => (
            <span 
              key={idx} 
              onClick={() => navigate(`/categories?brand=${encodeURIComponent(br.name)}`)}
              className="font-sans text-sm sm:text-base font-extrabold tracking-widest text-stone-600 dark:text-stone-400 cursor-pointer hover:text-amber-700 hover:opacity-100 transition-all"
            >
              {br.name.toUpperCase()}
            </span>
          ))}
        </div>
      </section>

      {/* 10. Reviews & FAQs Accordion */}
      <HomeReviews />
      <FaqSection />

      {/* 11. Newsletter Sub */}
      <section className="bg-stone-900 text-stone-100 rounded-3xl p-6 sm:p-10 w-full relative overflow-hidden shadow-xl border border-stone-850">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-700/10 rounded-full blur-2xl pointer-events-none" />
        <div className="max-w-md mx-auto text-center flex flex-col items-center gap-4 relative z-10">
          <div className="p-3 bg-amber-800/20 text-amber-450 border border-amber-800/40 rounded-2xl">
            <Mail size={20} />
          </div>
          <h3 className="font-sans font-extrabold text-xl leading-tight">Stay updated with Sleep Tips & Offers</h3>
          <p className="font-sans text-xs text-stone-400 leading-relaxed">Subscribe to get flat 10% discount on your next mattress order.</p>
          
          {subscribed ? (
            <div className="flex items-center gap-2 bg-emerald-950/30 text-emerald-400 border border-emerald-800/50 py-2 px-4 rounded-xl text-xs font-semibold">
              <Check size={14} />
              <span>Subscription Successful! Check your inbox.</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="w-full flex gap-2">
              <input
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-grow bg-stone-850 border border-stone-800 rounded-xl px-4 py-2 text-stone-100 text-xs focus:outline-none focus:border-amber-700"
              />
              <button
                type="submit"
                className="bg-luxury-gold hover:opacity-90 font-sans font-bold text-xs py-2 px-4 rounded-xl cursor-pointer"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      </section>

      {/* 12. Footer Section */}
      <footer className="border-t border-stone-200/50 dark:border-stone-900 pt-8 pb-6 text-stone-500 dark:text-stone-400 text-xs flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Col 1 */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <img 
                src="/logo.jpg" 
                alt="Siraj Bedding House Logo" 
                className="w-7 h-7 rounded-full object-cover border border-stone-200 dark:border-stone-800"
              />
              <h4 className="font-sans font-bold text-sm text-stone-900 dark:text-stone-100">Siraj Bedding House</h4>
            </div>
            <p className="font-sans leading-relaxed text-stone-400">
              Premium orthopedic mattresses, cushions, luxury sheets and foam blocks since 1976. Gorakhpur's leading sleep studio.
            </p>
          </div>
          {/* Col 2 */}
          <div className="flex flex-col gap-2">
            <h4 className="font-sans font-bold text-sm text-stone-900 dark:text-stone-100">Contact & Timing</h4>
            <div className="flex flex-col gap-1.5 text-stone-400">
              <span className="flex items-center gap-1.5"><Phone size={12} /> +91 99887 76655</span>
              <span className="flex items-center gap-1.5"><Mail size={12} /> info@sirajbedding.com</span>
              <span className="flex items-center gap-1.5"><Clock size={12} /> 10:00 AM - 08:30 PM (Sun Closed)</span>
            </div>
          </div>
          {/* Col 3 */}
          <div className="flex flex-col gap-2">
            <h4 className="font-sans font-bold text-sm text-stone-900 dark:text-stone-100">Store Address</h4>
            <span className="flex items-start gap-1.5 text-stone-400 leading-relaxed">
              <MapPin size={12} className="mt-0.5 flex-shrink-0" />
              <span>Shop 4-5, Luxury Market Complex, Civil Lines, Gorakhpur, UP - 273001</span>
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-stone-100 dark:border-stone-900 pt-6 gap-4 text-stone-400 text-[10px]">
          <span>© 2026 Siraj Bedding House. All Rights Reserved. Custom-crafted by Antigravity.</span>
          <div className="flex gap-4">
            <Link to="/about" className="hover:underline">About Us</Link>
            <Link to="/contact" className="hover:underline">Contact Us</Link>
            <Link to="/help" className="hover:underline">Privacy & Terms</Link>
          </div>
        </div>
      </footer>

      {/* Floating Quick View Modal Container */}
      <QuickViewModal 
        product={selectedProduct} 
        isOpen={isQuickViewOpen} 
        onClose={() => setIsQuickViewOpen(false)} 
      />

    </div>
  );
};
