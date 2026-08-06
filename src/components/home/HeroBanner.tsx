import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useHeroBannersQuery } from '../../hooks/useHeroBannersQuery';

interface Slide {
  id: string | number;
  title: string;
  subtitle: string;
  tagline: string;
  image: string;
  link: string;
  colorTheme: string;
}

const FALLBACK_SLIDES: Slide[] = [
  {
    id: 1,
    title: 'Comfort Redefined.',
    subtitle: 'Orthopedic Spine-Care Mattresses',
    tagline: '50 Years of Trust & Sleep Excellence',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=1200',
    link: '/categories?category=mattress',
    colorTheme: 'from-stone-900/90 to-stone-950/70'
  },
  {
    id: 2,
    title: 'Premium Sofa Foams',
    subtitle: '40 Density High Resilience Upholstery',
    tagline: 'Craft Custom Cushions & Sofa Blocks',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=1200',
    link: '/categories?category=foam',
    colorTheme: 'from-amber-950/90 to-stone-900/60'
  },
  {
    id: 3,
    title: 'Hotel Luxury Collection',
    subtitle: '1000 TC Egyptian Cotton Bedsheets',
    tagline: 'Unparalleled Silky Weaves & Texture',
    image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=1200',
    link: '/categories?category=bedsheet',
    colorTheme: 'from-neutral-900/90 to-stone-950/80'
  }
];

export const HeroBanner: React.FC = () => {
  const { data: dbSlides = [], isLoading } = useHeroBannersQuery();
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  // Map db slides dynamically if they exist, else fallback
  const slides = dbSlides.length > 0 ? dbSlides.map((s, idx) => ({
    id: s.id || idx,
    title: s.title || '',
    subtitle: s.subtitle || '',
    tagline: s.tagline || '',
    image: s.image || s.imageUrl || '',
    link: s.link || '',
    colorTheme: s.colorTheme || 'from-stone-900/90 to-stone-950/70'
  })) : FALLBACK_SLIDES;

  // Safeguard index out of bounds
  useEffect(() => {
    if (current >= slides.length) {
      setCurrent(0);
    }
  }, [slides.length, current]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % slides.length);
    }, 6000); // 6 seconds auto slide
    return () => clearInterval(timer);
  }, [slides.length]);

  const handleNext = () => {
    if (slides.length <= 1) return;
    setCurrent(prev => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    if (slides.length <= 1) return;
    setCurrent(prev => (prev - 1 + slides.length) % slides.length);
  };

  if (isLoading) {
    return (
      <div className="w-full h-[380px] sm:h-[450px] md:h-[500px] rounded-3xl bg-stone-100 dark:bg-stone-900 animate-pulse flex items-center justify-center">
        <span className="text-xs font-semibold text-stone-400">Loading banner...</span>
      </div>
    );
  }

  const activeSlide = slides[current] || slides[0] || FALLBACK_SLIDES[0];

  return (
    <div className="relative w-full h-[380px] sm:h-[450px] md:h-[500px] rounded-3xl overflow-hidden shadow-2xl bg-stone-900">
      
      {/* Slider View */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 w-full h-full"
        >
          {/* Background Image */}
          <img
            src={activeSlide.image}
            alt={activeSlide.title}
            className="w-full h-full object-cover object-center"
          />

          {/* Luxury Overlay */}
          <div className={`absolute inset-0 bg-gradient-to-r ${activeSlide.colorTheme} flex flex-col justify-center px-6 sm:px-12 md:px-16 pt-8`} />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-center items-start px-6 sm:px-12 md:px-16 text-stone-100 max-w-xl z-10">
            {activeSlide.tagline && (
              <motion.span
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-[9px] sm:text-[11px] font-sans font-bold uppercase tracking-[0.25em] text-amber-450 mb-2 text-left"
              >
                {activeSlide.tagline}
              </motion.span>
            )}
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="font-sans font-extrabold text-2xl sm:text-4xl md:text-5xl tracking-tight leading-tight text-left"
            >
              {activeSlide.title}
            </motion.h2>

            {activeSlide.subtitle && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="font-sans text-stone-300 text-xs sm:text-sm md:text-base mt-2.5 mb-6 text-left"
              >
                {activeSlide.subtitle}
              </motion.p>
            )}

            {activeSlide.link && (
              <motion.button
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(activeSlide.link)}
                className="bg-luxury-gold hover:opacity-90 py-3 px-6 rounded-xl font-sans font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg transition-all"
              >
                <span>Explore Collection</span>
                <ArrowRight size={14} />
              </motion.button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-stone-100 backdrop-blur-sm transition-all cursor-pointer hidden sm:flex items-center justify-center z-10"
            aria-label="Previous Slide"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-stone-100 backdrop-blur-sm transition-all cursor-pointer hidden sm:flex items-center justify-center z-10"
            aria-label="Next Slide"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                current === idx ? 'w-6 bg-amber-600' : 'w-2 bg-stone-500/50'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}

    </div>
  );
};
