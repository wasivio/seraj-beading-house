import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Search, Mic, Trash2, Clock, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProductsQuery } from '../../hooks/useProductsQuery';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const { data: products = [] } = useProductsQuery();
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [listeningText, setListeningText] = useState('Listening...');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Load recent searches
  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem('siraj_recent_searches');
      setRecentSearches(saved ? JSON.parse(saved) : []);
      // Auto focus
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Compute suggestions based on query
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    const cleanQuery = query.toLowerCase();
    
    // Find unique matching terms from product names, brands, categories
    const terms = new Set<string>();
    products.forEach(p => {
      if (p.name.toLowerCase().includes(cleanQuery)) terms.add(p.name);
      if (p.brand.toLowerCase().includes(cleanQuery)) terms.add(p.brand);
      if (p.category.toLowerCase().includes(cleanQuery)) terms.add(p.category);
    });

    setSuggestions(Array.from(terms).slice(0, 6));
  }, [query, products]);

  const handleSearchSubmit = (searchTerm: string) => {
    if (!searchTerm.trim()) return;

    // Save to recents
    const recents = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5);
    localStorage.setItem('siraj_recent_searches', JSON.stringify(recents));

    onClose();
    // Redirect to products listing page with search query
    navigate(`/categories?search=${encodeURIComponent(searchTerm)}`);
  };

  const deleteRecentSearch = (e: React.MouseEvent, s: string) => {
    e.stopPropagation();
    const updated = recentSearches.filter(item => item !== s);
    setRecentSearches(updated);
    localStorage.setItem('siraj_recent_searches', JSON.stringify(updated));
  };

  const clearAllRecents = () => {
    setRecentSearches([]);
    localStorage.removeItem('siraj_recent_searches');
  };

  // Voice Search Handler
  const handleVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'en-IN';
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        setListeningText('Speak now...');
      };

      recognition.onerror = () => {
        setListeningText('Speech recognition error. Try typing.');
        setTimeout(() => setIsListening(false), 1500);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        handleSearchSubmit(transcript);
      };

      recognition.start();
    } else {
      // Simulation for unsupported browsers (premium fallback UI)
      setIsListening(true);
      setListeningText('Simulating voice query...');
      
      const mockPhrases = [
        'Orthopedic Mattress',
        'Natural Latex Mattress Queen Size',
        '40 Density Sofa Foam Sheet',
        'Egyptian Cotton Bedsheet 1000 TC'
      ];
      const randomPhrase = mockPhrases[Math.floor(Math.random() * mockPhrases.length)];
      
      setTimeout(() => {
        setListeningText(`Heard: "${randomPhrase}"`);
        setTimeout(() => {
          setIsListening(false);
          setQuery(randomPhrase);
          handleSearchSubmit(randomPhrase);
        }, 1200);
      }, 1500);
    }
  };

  const popularSearches = [
    'Orthopedic Mattress',
    'Sofa Foam 40 Density',
    'Memory Foam Pillow',
    'Egyptian Cotton Bedsheet',
    'All Weather Comforter',
    'Mattress Protector'
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-stone-950/40 dark:bg-stone-950/60 backdrop-blur-sm"
          />

          {/* Modal Drawer */}
          <motion.div
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className="fixed top-0 left-0 right-0 bg-white dark:bg-stone-950 border-b border-stone-250/20 shadow-2xl p-4 z-10"
          >
            <div className="max-w-3xl mx-auto flex flex-col gap-4">
              
              {/* Search Bar Input */}
              <div className="flex items-center gap-2">
                <div className="flex-grow bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-full flex items-center px-4 py-1.5 focus-within:border-amber-700 dark:focus-within:border-amber-400 transition-colors">
                  <Search size={18} className="text-stone-400 flex-shrink-0" />
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search mattresses, cushions, luxury sheets..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit(query)}
                    className="w-full bg-transparent border-none outline-none py-1 px-3 text-sm text-stone-800 dark:text-stone-150 focus:ring-0"
                  />
                  {query && (
                    <button 
                      onClick={() => setQuery('')}
                      className="p-1 rounded-full text-stone-400 hover:text-stone-600"
                    >
                      <X size={14} />
                    </button>
                  )}
                  <button
                    onClick={handleVoiceSearch}
                    className="p-1 rounded-full text-stone-400 hover:text-amber-700 dark:hover:text-amber-400 ml-1 cursor-pointer"
                    aria-label="Voice Search"
                  >
                    <Mic size={18} />
                  </button>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-stone-500 dark:text-stone-400 hover:text-stone-800 font-sans text-sm font-semibold cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              {/* Suggestions View */}
              {suggestions.length > 0 && (
                <div className="flex flex-col border-t border-stone-100 dark:border-stone-900 pt-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 mb-1">Suggestions</span>
                  {suggestions.map((s, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSearchSubmit(s)}
                      className="flex items-center gap-3 py-2 px-2 hover:bg-stone-50 dark:hover:bg-stone-900/60 rounded-xl cursor-pointer text-sm text-stone-750 dark:text-stone-250 transition-all"
                    >
                      <Search size={14} className="text-stone-400" />
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Suggestions Overlay if Query is empty */}
              {!query && (
                <div className="flex flex-col gap-4">
                  {/* Recent Searches */}
                  {recentSearches.length > 0 && (
                    <div className="flex flex-col">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400">Recent Searches</span>
                        <button 
                          onClick={clearAllRecents}
                          className="text-[10px] font-sans font-semibold text-stone-400 hover:text-red-500 flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 size={12} />
                          <span>Clear All</span>
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {recentSearches.map((s, idx) => (
                          <div
                            key={idx}
                            onClick={() => handleSearchSubmit(s)}
                            className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-900 py-1.5 px-3 rounded-full text-xs text-stone-700 dark:text-stone-300 cursor-pointer hover:bg-stone-200 dark:hover:bg-stone-850 hover:text-stone-900 transition-colors"
                          >
                            <Clock size={12} className="text-stone-400" />
                            <span>{s}</span>
                            <X 
                              size={12} 
                              onClick={(e) => deleteRecentSearch(e, s)}
                              className="text-stone-450 hover:text-stone-700 p-0.5 rounded-full ml-1"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Popular Searches */}
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 mb-2">Popular Searches</span>
                    <div className="flex flex-wrap gap-2">
                      {popularSearches.map((s, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleSearchSubmit(s)}
                          className="bg-stone-50 dark:bg-stone-900 border border-stone-200/50 dark:border-stone-800/40 py-1.5 px-3 rounded-xl text-xs text-stone-750 dark:text-stone-350 cursor-pointer hover:border-amber-700 dark:hover:border-amber-400 transition-colors flex items-center gap-1"
                        >
                          <Sparkles size={12} className="text-amber-605" />
                          <span>{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </motion.div>

          {/* Voice Search Listening Fullscreen Modal */}
          <AnimatePresence>
            {isListening && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-60 bg-stone-950/80 flex flex-col items-center justify-center text-stone-100 gap-6 backdrop-blur-md"
              >
                <div className="relative">
                  {/* Pulse wave animation */}
                  <div className="absolute inset-0 bg-amber-700 rounded-full scale-120 animate-ping opacity-25" />
                  <div className="relative p-6 rounded-full bg-amber-750 border border-amber-500 shadow-xl flex items-center justify-center">
                    <Mic size={32} className="text-stone-100" />
                  </div>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="font-sans font-bold text-lg">{listeningText}</span>
                  <span className="font-sans text-xs text-stone-400">Say what you are looking for...</span>
                </div>
                <button
                  onClick={() => setIsListening(false)}
                  className="mt-6 px-6 py-2.5 rounded-full border border-stone-800 hover:bg-stone-900 text-xs font-semibold"
                >
                  Cancel
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  );
};
