import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center pt-16 pb-20 max-w-sm mx-auto text-center gap-4">
      <div className="p-4 bg-amber-50 dark:bg-amber-950/20 text-amber-705 rounded-full">
        <AlertCircle size={36} />
      </div>
      <h2 className="font-sans font-extrabold text-2xl tracking-tight mt-2">Page Not Found</h2>
      <p className="font-sans text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
        The bedroom layout or item you are looking for has been moved or doesn't exist.
      </p>
      <Link
        to="/"
        className="mt-4 bg-luxury-gold hover:opacity-90 py-3 px-6 rounded-xl font-sans font-bold text-xs text-stone-100 flex items-center justify-center gap-2 cursor-pointer shadow-lg"
      >
        <ArrowLeft size={14} />
        <span>Return to Home</span>
      </Link>
    </div>
  );
};
