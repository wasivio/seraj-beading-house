import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { SlidersHorizontal, ArrowUpDown, X, AlertCircle, Grid, List } from 'lucide-react';
import { ProductCard } from '../components/product/ProductCard';
import { QuickViewModal } from '../components/product/QuickViewModal';
import type { Product } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { MOCK_CATEGORIES } from '../utils/mockData';
import { useProductsQuery } from '../hooks/useProductsQuery';

export const Categories: React.FC = () => {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: products = [], isLoading: loading, refetch } = useProductsQuery();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  useEffect(() => {
    const handleRefresh = () => refetch();
    window.addEventListener('app_refresh_trigger', handleRefresh);
    return () => window.removeEventListener('app_refresh_trigger', handleRefresh);
  }, [refetch]);

  // Filter Drawer states
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Active filters inside Drawer
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [maxPrice, setMaxPrice] = useState<number>(40000);
  const [minRating, setMinRating] = useState<number>(0);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [minDiscount, setMinDiscount] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>('popularity');

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [visibleCount, setVisibleCount] = useState<number>(8);
  const [isInfinite, setIsInfinite] = useState<boolean>(false);

  // Extra dynamic filters
  const [selectedMaterial, setSelectedMaterial] = useState<string>('all');
  const [selectedColor, setSelectedColor] = useState<string>('all');
  const [selectedSize, setSelectedSize] = useState<string>('all');

  // Quick view state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  // Read URL query values
  const urlSearch = searchParams.get('search') || '';
  const urlCategory = searchParams.get('category') || '';
  const urlFilter = searchParams.get('filter') || '';
  const urlBrand = searchParams.get('brand') || '';

  // Update filter parameters when URL query parameters change
  useEffect(() => {
    if (urlCategory) {
      setSelectedCategory(urlCategory);
    } else {
      setSelectedCategory('all');
    }

    if (urlBrand) {
      setSelectedBrand(urlBrand);
    } else {
      setSelectedBrand('all');
    }
  }, [urlCategory, urlBrand]);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...products];

    // 1. Search Query filter
    if (urlSearch) {
      const q = urlSearch.toLowerCase();
      result = result.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    // 2. Category Filter
    if (selectedCategory && selectedCategory !== 'all') {
      result = result.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    // 3. Brand Filter
    if (selectedBrand && selectedBrand !== 'all') {
      result = result.filter(p => p.brand.toLowerCase() === selectedBrand.toLowerCase());
    }

    // 4. URL badge filters (trending / best sellers)
    if (urlFilter === 'trending') {
      result = result.filter(p => p.isTrending);
    } else if (urlFilter === 'best_seller') {
      result = result.filter(p => p.isBestSeller);
    }

    // 5. Price Filter
    result = result.filter(p => p.price <= maxPrice);

    // 6. Rating Filter
    if (minRating > 0) {
      result = result.filter(p => p.rating >= minRating);
    }

    // 7. Stock Availability
    if (inStockOnly) {
      result = result.filter(p => p.stockStatus !== 'out_of_stock');
    }

    // 8. Discount Filter
    if (minDiscount > 0) {
      result = result.filter(p => p.discountPercent >= minDiscount);
    }

    // Material Filter
    if (selectedMaterial && selectedMaterial !== 'all') {
      result = result.filter(p => p.material.toLowerCase() === selectedMaterial.toLowerCase());
    }

    // Color Filter
    if (selectedColor && selectedColor !== 'all') {
      result = result.filter(p => p.color.some(c => c.toLowerCase() === selectedColor.toLowerCase()));
    }

    // Size Filter
    if (selectedSize && selectedSize !== 'all') {
      result = result.filter(p => p.size.some(s => s.toLowerCase() === selectedSize.toLowerCase()));
    }

    // 9. Sorting Actions
    if (sortBy === 'price_asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'discount') {
      result.sort((a, b) => b.discountPercent - a.discountPercent);
    } else if (sortBy === 'newest') {
      result.sort((a, b) => (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0));
    } else {
      // Default: Popularity / Best Selling combo
      result.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
    }

    // Reset pagination on filter changes
    setCurrentPage(1);
    setVisibleCount(8);

    setFilteredProducts(result);
  }, [products, urlSearch, selectedCategory, selectedBrand, urlFilter, maxPrice, minRating, inStockOnly, minDiscount, sortBy, selectedMaterial, selectedColor, selectedSize]);

  const handleQuickView = (product: Product) => {
    setSelectedProduct(product);
    setIsQuickViewOpen(true);
  };

  const clearAllFilters = () => {
    setSelectedCategory('all');
    setSelectedBrand('all');
    setMaxPrice(40000);
    setMinRating(0);
    setInStockOnly(false);
    setMinDiscount(0);
    setSortBy('popularity');
    setSelectedMaterial('all');
    setSelectedColor('all');
    setSelectedSize('all');
    setCurrentPage(1);
    setVisibleCount(8);
    setIsInfinite(false);
    setSearchParams({});
  };

  // Extract unique brands, materials, colors, and sizes present in the product database
  const uniqueBrands = Array.from(new Set(products.map(p => p.brand).filter(Boolean)));
  const uniqueMaterials = Array.from(new Set(products.map(p => p.material).filter(Boolean)));
  const uniqueColors = Array.from(new Set(products.flatMap(p => p.color || []).filter(Boolean)));
  const uniqueSizes = Array.from(new Set(products.flatMap(p => p.size || []).filter(Boolean)));

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header and Controls */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold tracking-widest text-amber-700 dark:text-amber-400">Products Studio</span>
          <h2 className="font-sans font-extrabold text-2xl sm:text-3xl tracking-tight mt-0.5">
            {urlSearch ? `Search Results for "${urlSearch}"` : 'Browse Catalog'}
          </h2>
          <span className="text-xs text-stone-400 font-sans mt-1">{filteredProducts.length} items found</span>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-stone-200/40 dark:border-stone-850/40">
          
          <div className="flex items-center gap-2">
            {/* Active Filter Indicators */}
            <button
              onClick={() => setIsFilterOpen(true)}
              className="flex items-center gap-2 px-4 py-2 border border-stone-200 dark:border-stone-800 rounded-xl text-xs font-sans font-bold hover:bg-stone-50 dark:hover:bg-stone-900 transition-all cursor-pointer text-stone-805 dark:text-stone-150"
            >
              <SlidersHorizontal size={14} />
              <span>{t('filterTitle')}</span>
            </button>

            {/* Grid/List View switcher */}
            <div className="flex items-center border border-stone-205 dark:border-stone-800 rounded-xl overflow-hidden bg-stone-50 dark:bg-stone-900 p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-amber-700 text-stone-100'
                    : 'text-stone-400 hover:text-stone-600'
                }`}
                title="Grid View"
              >
                <Grid size={14} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-amber-700 text-stone-100'
                    : 'text-stone-400 hover:text-stone-600'
                }`}
                title="List View"
              >
                <List size={14} />
              </button>
            </div>
          </div>

          {/* Quick Sorting dropdown */}
          <div className="flex items-center gap-2">
            <ArrowUpDown size={14} className="text-stone-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent border-none outline-none font-sans text-xs font-bold text-stone-800 dark:text-stone-200 cursor-pointer focus:ring-0"
            >
              <option value="popularity" className="bg-stone-50 dark:bg-stone-950">Popularity</option>
              <option value="price_asc" className="bg-stone-50 dark:bg-stone-950">{t('priceLowHigh')}</option>
              <option value="price_desc" className="bg-stone-50 dark:bg-stone-950">{t('priceHighLow')}</option>
              <option value="rating" className="bg-stone-50 dark:bg-stone-950">{t('ratingHighLow')}</option>
              <option value="discount" className="bg-stone-50 dark:bg-stone-950">Discount Percent</option>
              <option value="newest" className="bg-stone-50 dark:bg-stone-950">New Arrivals</option>
            </select>
          </div>

        </div>
      </div>

      {/* Grid listing */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="bg-stone-100 dark:bg-stone-900 aspect-square rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center max-w-sm mx-auto">
          <div className="p-4 bg-stone-100 dark:bg-stone-900 rounded-full text-stone-400">
            <AlertCircle size={32} />
          </div>
          <h4 className="font-sans font-bold text-base">No Products Found</h4>
          <p className="font-sans text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
            We couldn't find matches for your active filters. Try resetting specifications or refining keywords.
          </p>
          <button
            onClick={clearAllFilters}
            className="mt-2 bg-luxury-gold hover:opacity-90 py-2.5 px-6 rounded-xl font-sans font-bold text-xs text-stone-100 cursor-pointer shadow-md"
          >
            {t('clearAll')}
          </button>
        </div>
      ) : (() => {
        const totalPages = Math.ceil(filteredProducts.length / 8);
        const paginatedProducts = isInfinite 
          ? filteredProducts.slice(0, visibleCount) 
          : filteredProducts.slice((currentPage - 1) * 8, currentPage * 8);

        return (
          <div>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {paginatedProducts.map((prod) => (
                  <ProductCard key={prod.id} product={prod} onQuickView={handleQuickView} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {paginatedProducts.map((prod) => (
                  <div key={prod.id} className="bg-white dark:bg-stone-900 border border-stone-200/50 dark:border-stone-850/40 rounded-3xl p-4 flex gap-4 shadow-sm hover:shadow-md transition-shadow relative">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden bg-stone-50 dark:bg-stone-850 flex-shrink-0">
                      <img src={prod.mainImage} alt={prod.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow flex flex-col justify-between min-w-0 pr-6 text-left">
                      <div>
                        <span className="text-[10px] text-stone-400 font-bold uppercase">{prod.brand}</span>
                        <h3 className="font-sans font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 truncate mt-0.5">{prod.name}</h3>
                        <p className="text-[11px] text-stone-400 mt-1 line-clamp-2">{prod.description}</p>
                      </div>
                      <div className="flex items-center justify-between gap-4 mt-3">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-sans font-extrabold text-xs sm:text-sm text-stone-900 dark:text-stone-100 font-bold">₹{prod.price.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex gap-2 scale-90 origin-right font-bold">
                          <button 
                            type="button"
                            onClick={() => handleQuickView(prod)} 
                            className="bg-stone-100 dark:bg-stone-800 text-stone-850 dark:text-stone-200 text-[10px] font-bold px-3 py-1.5 rounded-xl cursor-pointer"
                          >
                            Quick View
                          </button>
                          <Link 
                            to={`/product/${prod.id}`} 
                            className="bg-luxury-gold text-stone-100 text-[10px] font-bold px-3 py-1.5 rounded-xl cursor-pointer"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Toggle / Loader panel */}
            <div className="flex flex-col items-center gap-4 mt-8 pt-4 border-t border-stone-100 dark:border-stone-900">
              
              {isInfinite ? (
                /* Infinite Scroll View Controls */
                <div className="flex flex-col items-center gap-2">
                  {visibleCount < filteredProducts.length ? (
                    <button
                      type="button"
                      onClick={() => setVisibleCount(prev => Math.min(prev + 8, filteredProducts.length))}
                      className="bg-stone-100 dark:bg-stone-900 hover:bg-stone-200 border border-stone-200 dark:border-stone-800 text-stone-805 dark:text-stone-100 font-sans font-bold text-xs py-2.5 px-6 rounded-xl cursor-pointer transition-colors shadow-sm"
                    >
                      Load More Products (Infinite Scroll)
                    </button>
                  ) : (
                    <span className="text-xs font-semibold text-stone-400">All products loaded</span>
                  )}
                  <span className="text-[10px] text-stone-400 font-medium font-sans">
                    Showing {Math.min(visibleCount, filteredProducts.length)} of {filteredProducts.length} items
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsInfinite(false)}
                    className="text-[10px] font-bold text-amber-700 hover:underline cursor-pointer"
                  >
                    Switch to Page Navigation
                  </button>
                </div>
              ) : (
                /* Page Navigation Controls */
                <div className="flex flex-col items-center gap-3 w-full">
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2.5">
                      <button
                        type="button"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-800 text-[11px] font-bold disabled:opacity-40 cursor-pointer text-stone-705 dark:text-stone-300"
                      >
                        Prev
                      </button>
                      <div className="flex gap-1.5">
                        {Array.from({ length: totalPages }).map((_, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setCurrentPage(idx + 1)}
                            className={`w-7 h-7 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                              currentPage === idx + 1
                                ? 'border-amber-750 bg-amber-50 dark:bg-amber-955/20 text-amber-705 font-extrabold'
                                : 'border-stone-200 dark:border-stone-850 text-stone-500'
                            }`}
                          >
                            {idx + 1}
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-800 text-[11px] font-bold disabled:opacity-40 cursor-pointer text-stone-705 dark:text-stone-300"
                      >
                        Next
                      </button>
                    </div>
                  )}
                  <span className="text-[10px] text-stone-400 font-medium font-sans">
                    Showing Page {currentPage} of {totalPages} ({filteredProducts.length} total items)
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsInfinite(true)}
                    className="text-[10px] font-bold text-amber-700 hover:underline cursor-pointer"
                  >
                    Switch to Infinite Scroll
                  </button>
                </div>
              )}

            </div>
          </div>
        );
      })()}

      {/* Luxury Filter Drawer (Framer Motion slide overlay) */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop overlay */}
          <div 
            onClick={() => setIsFilterOpen(false)}
            className="fixed inset-0 bg-stone-950/40 dark:bg-stone-950/60 backdrop-blur-sm"
          />

          {/* Drawer container */}
          <div className="relative z-10 w-full max-w-xs h-full bg-white dark:bg-stone-950 shadow-2xl p-5 overflow-y-auto flex flex-col justify-between border-l border-stone-200/50 dark:border-stone-900">
            
            {/* Drawer Header */}
            <div>
              <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-900 pb-3 mb-4">
                <h3 className="font-sans font-extrabold text-base flex items-center gap-2">
                  <SlidersHorizontal size={16} />
                  <span>{t('filterTitle')}</span>
                </h3>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="p-1 rounded-full text-stone-450 hover:bg-stone-100 dark:hover:bg-stone-850"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Filters list */}
              <div className="flex flex-col gap-5">
                
                {/* Category Spec */}
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 mb-2">Category</span>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-2 text-xs font-semibold focus:outline-none"
                  >
                    <option value="all">All Categories</option>
                    {MOCK_CATEGORIES.map(c => (
                      <option key={c.id} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Brand Spec */}
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 mb-2">Brand</span>
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-2 text-xs font-semibold focus:outline-none"
                  >
                    <option value="all">All Brands</option>
                    {uniqueBrands.map((b, idx) => (
                      <option key={idx} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                {/* Price Slider */}
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400">Max Price</span>
                    <span className="text-xs font-extrabold">₹{maxPrice.toLocaleString('en-IN')}</span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="50000"
                    step="500"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full h-1 bg-stone-200 dark:bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-700"
                  />
                  <div className="flex items-center justify-between text-[10px] text-stone-400 mt-1">
                    <span>₹500</span>
                    <span>₹50,000+</span>
                  </div>
                </div>

                {/* Minimum Star Rating */}
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 mb-2">Minimum Rating</span>
                  <div className="flex items-center gap-1.5">
                    {[0, 3, 4, 4.5].map((rt) => (
                      <button
                        key={rt}
                        type="button"
                        onClick={() => setMinRating(rt)}
                        className={`text-xs py-1.5 px-2.5 rounded-xl border transition-all ${
                          minRating === rt
                            ? 'border-amber-700 bg-amber-50 dark:bg-amber-950/20 text-amber-750 font-bold'
                            : 'border-stone-200 dark:border-stone-800 text-stone-500'
                        }`}
                      >
                        {rt === 0 ? 'All' : `${rt}★+`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Material Spec */}
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 mb-2">Material</span>
                  <select
                    value={selectedMaterial}
                    onChange={(e) => setSelectedMaterial(e.target.value)}
                    className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-2 text-xs font-semibold focus:outline-none"
                  >
                    <option value="all">All Materials</option>
                    {uniqueMaterials.map((m, idx) => (
                      <option key={idx} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                {/* Color Spec */}
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 mb-2">Color</span>
                  <select
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-2 text-xs font-semibold focus:outline-none"
                  >
                    <option value="all">All Colors</option>
                    {uniqueColors.map((c, idx) => (
                      <option key={idx} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Size Spec */}
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 mb-2">Size</span>
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-2 text-xs font-semibold focus:outline-none"
                  >
                    <option value="all">All Sizes</option>
                    {uniqueSizes.map((s, idx) => (
                      <option key={idx} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Discount Percentage */}
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 mb-2">Min Discount %</span>
                  <div className="flex items-center gap-1.5">
                    {[0, 10, 25, 40].map((ds) => (
                      <button
                        key={ds}
                        onClick={() => setMinDiscount(ds)}
                        className={`text-xs py-1.5 px-2.5 rounded-xl border transition-all ${
                          minDiscount === ds
                            ? 'border-amber-700 bg-amber-50 dark:bg-amber-950/20 text-amber-750 font-bold'
                            : 'border-stone-200 dark:border-stone-800 text-stone-500'
                        }`}
                      >
                        {ds === 0 ? 'Any' : `${ds}%+`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Switch Options */}
                <label className="flex items-center gap-2.5 cursor-pointer select-none py-1">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="rounded text-amber-700 focus:ring-amber-550 border-stone-300 dark:border-stone-800 h-4 w-4 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">Exclude Out of Stock</span>
                </label>

              </div>
            </div>

            {/* Bottom drawer action buttons */}
            <div className="flex items-center gap-2 border-t border-stone-100 dark:border-stone-900 pt-4 mt-6">
              <button
                onClick={clearAllFilters}
                className="flex-grow bg-stone-100 dark:bg-stone-850 hover:bg-stone-200 text-stone-700 dark:text-stone-200 py-3 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                {t('clearAll')}
              </button>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="flex-grow bg-luxury-gold hover:opacity-90 text-stone-100 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
              >
                {t('apply')}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Floating Quick View Modal Container */}
      <QuickViewModal 
        product={selectedProduct} 
        isOpen={isQuickViewOpen} 
        onClose={() => setIsQuickViewOpen(false)} 
      />

    </div>
  );
};
