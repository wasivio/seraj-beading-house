import React, { useState } from 'react';
import { useCompare } from '../../context/CompareContext';
import { X, GitCompare, Trash2 } from 'lucide-react';
import { getThumbnailUrl } from '../../services/cloudinaryService';

export const CompareFloatingBar: React.FC = () => {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const [isOpen, setIsOpen] = useState(false);

  if (compareList.length === 0) return null;

  return (
    <>
      {/* Floating Pill at bottom */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 bg-stone-900 text-stone-100 rounded-full px-5 py-3 shadow-2xl flex items-center gap-4 border border-stone-800 backdrop-blur-md bg-stone-900/95">
        <div className="flex items-center gap-2">
          <GitCompare size={16} className="text-amber-500 animate-pulse" />
          <span className="font-sans text-xs font-bold whitespace-nowrap">
            Compare ({compareList.length}/4)
          </span>
        </div>
        
        <div className="flex gap-1.5 items-center border-l border-stone-800 pl-3">
          <button
            onClick={() => setIsOpen(true)}
            className="bg-luxury-gold hover:opacity-90 active:scale-95 text-stone-100 font-sans font-bold text-[10px] uppercase tracking-wider py-1.5 px-3 rounded-full cursor-pointer transition-all"
          >
            Compare Now
          </button>
          <button
            onClick={clearCompare}
            className="text-stone-400 hover:text-red-400 p-1.5 rounded-full hover:bg-stone-800 transition-colors"
            title="Clear all"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Comparison Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-stone-950/65 backdrop-blur-sm"
          />

          {/* Table Container */}
          <div className="relative z-10 bg-white dark:bg-stone-950 rounded-3xl w-full max-w-4xl max-h-[85vh] overflow-y-auto shadow-2xl border border-stone-200/50 dark:border-stone-850 p-6 flex flex-col gap-6">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-900 pb-3">
              <div className="flex items-center gap-2">
                <GitCompare className="text-amber-700 dark:text-amber-400" size={20} />
                <h3 className="font-sans font-extrabold text-base sm:text-lg">Product Comparison Table</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full text-stone-450 hover:bg-stone-100 dark:hover:bg-stone-850 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans text-xs border-collapse">
                <thead>
                  <tr className="border-b border-stone-100 dark:border-stone-900">
                    <th className="py-3 px-2 font-bold text-stone-400 w-1/5">Attribute</th>
                    {compareList.map((prod) => (
                      <th key={prod.id} className="py-3 px-4 font-bold relative w-1/4 min-w-[150px]">
                        <button
                          onClick={() => removeFromCompare(prod.id)}
                          className="absolute top-0 right-2 p-1 text-stone-400 hover:text-red-500 transition-colors"
                          title="Remove"
                        >
                          <X size={14} />
                        </button>
                        <div className="flex flex-col items-center text-center gap-2 pt-4">
                          <img 
                            src={getThumbnailUrl(prod.mainImage)} 
                            alt={prod.name} 
                            className="w-16 h-16 rounded-xl object-cover border border-stone-100 dark:border-stone-850"
                          />
                          <span className="font-bold line-clamp-2 text-[11px] text-stone-900 dark:text-stone-100 leading-tight">
                            {prod.name}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Brand */}
                  <tr className="border-b border-stone-50 dark:border-stone-900/50">
                    <td className="py-3 px-2 font-bold text-stone-500">Brand</td>
                    {compareList.map((prod) => (
                      <td key={prod.id} className="py-3 px-4 text-stone-700 dark:text-stone-300 font-semibold">{prod.brand}</td>
                    ))}
                  </tr>
                  
                  {/* Price */}
                  <tr className="border-b border-stone-50 dark:border-stone-900/50 bg-stone-50/50 dark:bg-stone-900/10">
                    <td className="py-3 px-2 font-bold text-stone-500">Price</td>
                    {compareList.map((prod) => (
                      <td key={prod.id} className="py-3 px-4 font-extrabold text-stone-900 dark:text-stone-100">
                        ₹{prod.price.toLocaleString('en-IN')}
                      </td>
                    ))}
                  </tr>

                  {/* Rating */}
                  <tr className="border-b border-stone-50 dark:border-stone-900/50">
                    <td className="py-3 px-2 font-bold text-stone-500">Rating</td>
                    {compareList.map((prod) => (
                      <td key={prod.id} className="py-3 px-4 font-semibold">
                        ★ {prod.rating} ({prod.reviewCount} reviews)
                      </td>
                    ))}
                  </tr>

                  {/* Material */}
                  <tr className="border-b border-stone-50 dark:border-stone-900/50 bg-stone-50/50 dark:bg-stone-900/10">
                    <td className="py-3 px-2 font-bold text-stone-500">Material</td>
                    {compareList.map((prod) => (
                      <td key={prod.id} className="py-3 px-4 text-stone-605 dark:text-stone-350">{prod.material}</td>
                    ))}
                  </tr>

                  {/* Size Options */}
                  <tr className="border-b border-stone-50 dark:border-stone-900/50">
                    <td className="py-3 px-2 font-bold text-stone-500">Sizes</td>
                    {compareList.map((prod) => (
                      <td key={prod.id} className="py-3 px-4 text-stone-605 dark:text-stone-350">
                        <div className="flex flex-wrap gap-1">
                          {prod.size.map((s, idx) => (
                            <span key={idx} className="bg-stone-100 dark:bg-stone-850 px-1.5 py-0.5 rounded text-[10px]">
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Colors */}
                  <tr className="border-b border-stone-50 dark:border-stone-900/50 bg-stone-50/50 dark:bg-stone-900/10">
                    <td className="py-3 px-2 font-bold text-stone-500">Colors</td>
                    {compareList.map((prod) => (
                      <td key={prod.id} className="py-3 px-4 text-stone-605 dark:text-stone-350">
                        {prod.color.join(', ')}
                      </td>
                    ))}
                  </tr>

                  {/* Warranty */}
                  <tr className="border-b border-stone-50 dark:border-stone-900/50">
                    <td className="py-3 px-2 font-bold text-stone-500">Warranty</td>
                    {compareList.map((prod) => (
                      <td key={prod.id} className="py-3 px-4 text-stone-705 dark:text-stone-300 font-medium">{prod.warranty}</td>
                    ))}
                  </tr>

                  {/* Availability */}
                  <tr className="border-b border-stone-50 dark:border-stone-900/50 bg-stone-50/50 dark:bg-stone-900/10">
                    <td className="py-3 px-2 font-bold text-stone-500">Availability</td>
                    {compareList.map((prod) => (
                      <td key={prod.id} className="py-3 px-4">
                        <span className={`font-bold ${prod.stockStatus === 'in_stock' ? 'text-emerald-600' : 'text-red-500'}`}>
                          {prod.stockStatus.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Footer actions */}
            <div className="flex justify-end gap-2 border-t border-stone-100 dark:border-stone-900 pt-4">
              <button
                onClick={clearCompare}
                className="bg-stone-100 dark:bg-stone-850 hover:bg-stone-200 text-stone-700 dark:text-stone-200 font-sans font-bold text-xs py-2 px-4 rounded-xl cursor-pointer transition-colors"
              >
                Clear Comparison List
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
