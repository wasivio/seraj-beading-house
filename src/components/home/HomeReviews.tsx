import React from 'react';
import { Star, Quote } from 'lucide-react';

interface ReviewItem {
  name: string;
  role: string;
  rating: number;
  comment: string;
}

const REVIEWS: ReviewItem[] = [
  {
    name: 'Gaurav Srivastava',
    role: 'Homeowner, Gorakhpur',
    rating: 5,
    comment: 'Siraj Bedding House has been our family shop for mattresses and foams for the last 20 years. The quality of foam they provide is unmatched, and their custom size mattresses fit our beds perfectly!'
  },
  {
    name: 'Anjali Mishra',
    role: 'Interior Designer, Lucknow',
    rating: 5,
    comment: 'As a designer, I always recommend Siraj Bedding House for custom sofa fillings and heavy curtains. Their High Resilience foams maintain shape for years. The Egyptian sheets are of extreme luxury standard.'
  },
  {
    name: 'Sardar Manpreet Singh',
    role: 'Hotel Owner, Gorakhpur',
    rating: 5,
    comment: 'Ordered 50 custom pocket-spring orthopedic mattresses for our luxury suites. The guests are loving the sleep quality. Delivered right on schedule. 50 years of trust is fully visible in their service.'
  }
];

export const HomeReviews: React.FC = () => {
  return (
    <section className="py-8 w-full">
      <div className="text-center mb-8">
        <span className="text-[10px] uppercase font-bold tracking-widest text-amber-700 dark:text-amber-400">Testimonials</span>
        <h2 className="font-sans font-extrabold text-2xl sm:text-3xl mt-1 tracking-tight">Customer Stories</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {REVIEWS.map((rev, idx) => (
          <div 
            key={idx}
            className="bg-white dark:bg-stone-900 border border-stone-200/50 dark:border-stone-850/50 p-6 rounded-3xl relative flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Quote Icon Background */}
            <Quote size={40} className="absolute top-4 right-4 text-stone-100 dark:text-stone-800 opacity-30 pointer-events-none" />

            <div>
              {/* Star Ratings */}
              <div className="flex gap-0.5 text-yellow-500 mb-3">
                {Array.from({ length: rev.rating }).map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" />
                ))}
              </div>

              {/* Comment */}
              <p className="font-sans text-xs text-stone-500 dark:text-stone-400 leading-relaxed italic mb-4">
                "{rev.comment}"
              </p>
            </div>

            {/* Author */}
            <div className="border-t border-stone-100 dark:border-stone-850/50 pt-3 mt-auto">
              <h4 className="font-sans font-bold text-xs text-stone-900 dark:text-stone-100">{rev.name}</h4>
              <span className="text-[10px] text-stone-400">{rev.role}</span>
            </div>

          </div>
        ))}
      </div>
    </section>
  );
};
