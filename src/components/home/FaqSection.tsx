import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FAQ_DATA } from '../../utils/mockData';

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleIndex = (idx: number) => {
    setOpenIndex(prev => (prev === idx ? null : idx));
  };

  return (
    <section className="py-8 w-full max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <span className="text-[10px] uppercase font-bold tracking-widest text-amber-700 dark:text-amber-400">Help Center</span>
        <h2 className="font-sans font-extrabold text-2xl sm:text-3xl mt-1 tracking-tight">Frequently Asked Questions</h2>
      </div>

      <div className="flex flex-col gap-3">
        {FAQ_DATA.map((faq, idx) => {
          const isOpen = openIndex === idx;

          return (
            <div 
              key={idx}
              className="bg-white dark:bg-stone-900 border border-stone-200/50 dark:border-stone-850/50 rounded-2xl overflow-hidden shadow-sm transition-all"
            >
              {/* Question Trigger */}
              <button
                onClick={() => toggleIndex(idx)}
                className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 font-sans font-bold text-xs sm:text-sm text-stone-800 dark:text-stone-150 cursor-pointer hover:bg-stone-50/50 dark:hover:bg-stone-850/30 transition-colors"
              >
                <span>{faq.question}</span>
                <div className={`text-stone-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                  <ChevronDown size={16} />
                </div>
              </button>

              {/* Answer block */}
              {isOpen && (
                <div className="px-5 pb-4 pt-1 border-t border-stone-100 dark:border-stone-850/30">
                  <p className="font-sans text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}

            </div>
          );
        })}
      </div>
    </section>
  );
};
