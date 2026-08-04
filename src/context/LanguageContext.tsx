import React, { createContext, useContext, useState } from 'react';

export type Language = 'en' | 'hi' | 'bn';

export const translations = {
  en: {
    // Nav
    home: 'Home',
    categories: 'Categories',
    wishlist: 'Wishlist',
    cart: 'Cart',
    profile: 'Profile',
    
    // Header & Search
    searchPlaceholder: 'Search mattresses, pillows, cushions...',
    location: 'Gorakhpur, UP',
    recentSearch: 'Recent Searches',
    popularSearch: 'Popular Categories',
    voiceSearch: 'Tap mic & speak...',
    listening: 'Listening...',
    voiceNotSupported: 'Voice search not supported in this browser.',
    
    // CTAs
    buyNow: 'Buy Now',
    addToCart: 'Add to Cart',
    outOfStock: 'Out of Stock',
    lowStock: 'Only a few left',
    save: 'Save',
    edit: 'Edit',
    delete: 'Delete',
    cancel: 'Cancel',
    remove: 'Remove',
    apply: 'Apply',
    
    // Home sections
    popularChoice: 'Popular Choice',
    trending: 'Trending Products',
    bestSellers: 'Best Sellers',
    todayDeals: 'Today\'s Deals',
    whyChooseUs: 'Why Choose Siraj Bedding',
    testimonials: 'What Our Customers Say',
    faqs: 'Frequently Asked Questions',
    viewAll: 'View All',
    quickView: 'Quick View',
    
    // Cart page
    shoppingCart: 'Shopping Cart',
    orderSummary: 'Order Summary',
    promoCode: 'Promo Code',
    savedLater: 'Saved for Later',
    applyCoupon: 'Apply Coupon',
    enterCoupon: 'Enter coupon code',
    invalidCoupon: 'Invalid coupon code',
    couponDiscount: 'Coupon Discount',
    subtotal: 'Subtotal',
    tax: 'Estimated Tax',
    shipping: 'Shipping Charge',
    total: 'Grand Total',
    checkout: 'Checkout',
    moveToCart: 'Move to Cart',
    emptyCart: 'Your cart is empty',
    
    // Checkout
    deliveryAddress: 'Delivery Address',
    addNewAddress: 'Add New Address',
    selectSlot: 'Select Delivery Slot',
    paymentMethod: 'Select Payment Method',
    placeOrder: 'Place Order',
    backToPayments: 'Back to Payments',
    processing: 'Processing...',
    placeOrderNow: 'Place Order Now',
    cod: 'Cash on Delivery (COD)',
    online: 'UPI / Cards / NetBanking',
    gpsSuccess: 'Coordinates fetched successfully!',
    gpsError: 'Could not fetch your coordinates.',
    
    // Order Success
    orderSuccess: 'Order Placed Successfully!',
    orderNo: 'Order Number',
    estimatedDelivery: 'Estimated Delivery',
    continueShopping: 'Continue Shopping',
    trackOrder: 'Track Order',
    
    // Profile & Orders
    myAccount: 'My Account',
    editProfile: 'Edit Profile',
    supportHelp: 'Support & Help',
    helpCenter: 'Help Center',
    myOrders: 'My Orders',
    addressBook: 'Address Book',
    logout: 'Logout',
    languageLabel: 'App Language',
    themeLabel: 'App Theme',
    secureAccess: 'Secure Access',
    accessSuite: 'Access Your Suite',
    signInDetails: 'Sign in to access addresses, check timeline logs, and edit preferences.',
    timeline: 'Tracking Progress',
    
    // Categories listing
    filterTitle: 'Filters',
    sortBy: 'Sort By',
    priceLowHigh: 'Price: Low to High',
    priceHighLow: 'Price: High to Low',
    ratingHighLow: 'Rating: High to Low',
    clearAll: 'Clear All',

    // Product Details & Reviews
    description: 'Description',
    specifications: 'Specifications',
    reviews: 'Reviews',
    addReview: 'Add a Review',
    relatedProducts: 'Related Products',
    rating: 'Rating',
    comment: 'Comment',
    submitReview: 'Submit Review',

    // Wishlist
    myWishlist: 'My Wishlist',
    emptyWishlist: 'Your Wishlist is Empty',

    // Notifications
    notifications: 'Notifications',
    markAllRead: 'Mark all as read',
    noNotifications: 'No notifications yet'
  },
  hi: {
    // Nav
    home: 'होम',
    categories: 'श्रेणियाँ',
    wishlist: 'विशलिस्ट',
    cart: 'कार्ट',
    profile: 'प्रोफाइल',
    
    // Header & Search
    searchPlaceholder: 'गद्दे, तकिए, कुशन खोजें...',
    location: 'गोरखपुर, यूपी',
    recentSearch: 'हालिया खोज',
    popularSearch: 'लोकप्रिय श्रेणियां',
    voiceSearch: 'माइक दबाकर बोलें...',
    listening: 'सुन रहा है...',
    voiceNotSupported: 'इस ब्राउज़र में वॉयस सर्च समर्थित नहीं है।',
    
    // CTAs
    buyNow: 'अभी खरीदें',
    addToCart: 'कार्ट में जोड़ें',
    outOfStock: 'स्टक खत्म',
    lowStock: 'कुछ ही बचे हैं',
    save: 'सहेजें',
    edit: 'संपादित करें',
    delete: 'हटाएं',
    cancel: 'रद्द करें',
    remove: 'हटाएं',
    apply: 'लागू करें',
    
    // Home sections
    popularChoice: 'लोकप्रिय पसंद',
    trending: 'ट्रेंडिंग उत्पाद',
    bestSellers: 'बेस्ट सेलर्स',
    todayDeals: 'आज के ऑफर्स',
    whyChooseUs: 'सिराज बेडिंग क्यों चुनें',
    testimonials: 'हमारे ग्राहक क्या कहते हैं',
    faqs: 'अक्सर पूछे जाने वाले प्रश्न',
    viewAll: 'सभी देखें',
    quickView: 'त्वरित झलक',
    
    // Cart page
    shoppingCart: 'शॉपिंग कार्ट',
    orderSummary: 'ऑर्डर सारांश',
    promoCode: 'प्रोमो कोड',
    savedLater: 'बाद के लिए सहेजा गया',
    applyCoupon: 'कूपन लागू करें',
    enterCoupon: 'कूपन कोड दर्ज करें',
    invalidCoupon: 'अमान्य कूपन कोड',
    couponDiscount: 'कूपन छूट',
    subtotal: 'उपयोगिता योग',
    tax: 'अनुमानित कर',
    shipping: 'शिपिंग शुल्क',
    total: 'कुल राशि',
    checkout: 'चेकआउट',
    moveToCart: 'कार्ट में डालें',
    emptyCart: 'आपकी कार्ट खाली है',
    
    // Checkout
    deliveryAddress: 'डिलिवरी का पता',
    addNewAddress: 'नया पता जोड़ें',
    selectSlot: 'डिलिवरी स्लॉट चुनें',
    paymentMethod: 'भुगतान विधि चुनें',
    placeOrder: 'ऑर्डर करें',
    backToPayments: 'भुगतान पर वापस जाएं',
    processing: 'प्रक्रिया जारी है...',
    placeOrderNow: 'अभी ऑर्डर करें',
    cod: 'कैश ऑन डिलीवरी (COD)',
    online: 'UPI / कार्ड / नेटबैंकिंग',
    gpsSuccess: 'स्थान सफलतापूर्वक मिल गया!',
    gpsError: 'आपका स्थान नहीं मिल सका।',
    
    // Order Success
    orderSuccess: 'ऑर्डर सफलतापूर्वक दिया गया!',
    orderNo: 'ऑर्डर नंबर',
    estimatedDelivery: 'अनुमानित डिलीवरी',
    continueShopping: 'खरीदारी जारी रखें',
    trackOrder: 'ऑर्डर ट्रैक करें',
    
    // Profile & Orders
    myAccount: 'मेरा अकाउंट',
    editProfile: 'प्रोफाइल बदलें',
    supportHelp: 'सहायता और सपोर्ट',
    helpCenter: 'सहायता केंद्र',
    myOrders: 'मेरे ऑर्डर्स',
    addressBook: 'पते की सूची',
    logout: 'लॉगआउट',
    languageLabel: 'ऐप की भाषा',
    themeLabel: 'ऐप की थीम',
    secureAccess: 'सुरक्षित प्रवेश',
    accessSuite: 'अपने अकाउंट में आएं',
    signInDetails: 'पते प्रबंधित करने, डिलीवरी ट्रैक करने और प्राथमिकताओं के लिए लॉग इन करें।',
    timeline: 'ट्रैकिंग स्थिति',
    
    // Categories listing
    filterTitle: 'फिल्टर्स',
    sortBy: 'क्रमबद्ध करें',
    priceLowHigh: 'कीमत: कम से अधिक',
    priceHighLow: 'कीमत: अधिक से कम',
    ratingHighLow: 'रेटिंग: अधिक से कम',
    clearAll: 'साफ़ करें',

    // Product Details & Reviews
    description: 'विवरण',
    specifications: 'विशेषताएं',
    reviews: 'समीक्षाएं',
    addReview: 'समीक्षा जोड़ें',
    relatedProducts: 'संबंधित उत्पाद',
    rating: 'रेटिंग',
    comment: 'टिप्पणी',
    submitReview: 'समीक्षा भेजें',

    // Wishlist
    myWishlist: 'मेरी विशलिस्ट',
    emptyWishlist: 'आपकी विशलिस्ट खाली है',

    // Notifications
    notifications: 'सूचनाएं',
    markAllRead: 'सभी को पढ़ा हुआ चिह्नित करें',
    noNotifications: 'अभी कोई सूचना नहीं है'
  },
  bn: {
    // Nav
    home: 'হোম',
    categories: 'ক্যাটেগরি',
    wishlist: 'উইশলিস্ট',
    cart: 'কার্ট',
    profile: 'প্রোফাইল',
    
    // Header & Search
    searchPlaceholder: 'তোশক, বালিশ, কুশন খুঁজুন...',
    location: 'গোরক্ষপুর, ইউপি',
    recentSearch: 'সাম্প্রতিক অনুসন্ধান',
    popularSearch: 'জনপ্রিয় ক্যাটেগরি',
    voiceSearch: 'মাইক টিপে কথা বলুন...',
    listening: 'শুনছি...',
    voiceNotSupported: 'এই ব্রাউজারে ভয়েস অনুসন্ধান সমর্থিত নয়।',
    
    // CTAs
    buyNow: 'এখনই কিনুন',
    addToCart: 'কার্টে যোগ করুন',
    outOfStock: 'স্টক শেষ',
    lowStock: 'অল্প কিছু বাকি আছে',
    save: 'সংরক্ষণ',
    edit: 'সম্পাদনা',
    delete: 'মুছে ফেলুন',
    cancel: 'বাতিল',
    remove: 'মুছে ফেলুন',
    apply: 'প্রয়োগ',
    
    // Home sections
    popularChoice: 'জনপ্রিয় পছন্দ',
    trending: 'জনপ্রিয় পণ্যসমূহ',
    bestSellers: 'সেরা বিক্রি',
    todayDeals: 'আজকের ডিল',
    whyChooseUs: 'কেন সিরাজ বেডিং বেছে নেবেন',
    testimonials: 'গ্রাহকরা যা বলছেন',
    faqs: 'সাধারণ জিজ্ঞাসা',
    viewAll: 'সব দেখুন',
    quickView: 'ঝটপট দেখুন',
    
    // Cart page
    shoppingCart: 'শপিং কার্ট',
    orderSummary: 'অর্ডার বিবরণ',
    promoCode: 'প্রোমো কোড',
    savedLater: 'পরে কেনার জন্য সংরক্ষিত',
    applyCoupon: 'কুপন কোড দিন',
    enterCoupon: 'কুপন কোডটি লিখুন',
    invalidCoupon: 'ভুল कুপন কোড',
    couponDiscount: 'কুপন ছাড়',
    subtotal: 'মোট দাম',
    tax: 'আনুমানিক ট্যাক্স',
    shipping: 'ডেলিভারি চার্জ',
    total: 'সর্বমোট পরিমাণ',
    checkout: 'চেকআউট',
    moveToCart: 'কার্টে নিয়ে যান',
    emptyCart: 'আপনার কার্ট খালি রয়েছে',
    
    // Checkout
    deliveryAddress: 'ডেলিভারি ঠিকানা',
    addNewAddress: 'নতুন ঠিকানা যোগ করুন',
    selectSlot: 'ডেলিভারি স্লট নির্বাচন করুন',
    paymentMethod: 'পেমেন্ট পদ্ধতি নির্বাচন করুন',
    placeOrder: 'অর্ডার সম্পন্ন করুন',
    backToPayments: 'পেমেন্টে ফিরে যান',
    processing: 'প্রক্রিয়াকরণ হচ্ছে...',
    placeOrderNow: 'এখনই অর্ডার করুন',
    cod: 'ক্যাশ অন ডেলিভারি (COD)',
    online: 'UPI / কার্ড / নেটব্যাংকিং',
    gpsSuccess: 'অবস্থান সফলভাবে পাওয়া গেছে!',
    gpsError: 'আপনার অবস্থান পাওয়া যায়নি।',
    
    // Order Success
    orderSuccess: 'অর্ডার সফলভাবে সম্পন্ন হয়েছে!',
    orderNo: 'অর্ডার নম্বর',
    estimatedDelivery: 'আনুমানিক ডেলিভারি',
    continueShopping: 'কেনাকাটা চালু রাখুন',
    trackOrder: 'অর্ডার ট্র্যাক করুন',
    
    // Profile & Orders
    myAccount: 'আমার অ্যাকাউন্ট',
    editProfile: 'প্রোফাইল সম্পাদন',
    supportHelp: 'সাহায্য ও সাপোর্ট',
    helpCenter: 'সাহায্য কেন্দ্র',
    myOrders: 'আমার অর্ডার',
    addressBook: 'ঠিকানার বই',
    logout: 'লগআউট',
    languageLabel: 'অ্যাপের ভাষা',
    themeLabel: 'অ্যাপ থিম',
    secureAccess: 'নিরাপদ প্রবেশাধিকার',
    accessSuite: 'আপনার অ্যাকাউন্টে যান',
    signInDetails: 'ঠিকানা অ্যাক্সেস করতে, ট্র্যাক করতে এবং পছন্দ সম্পাদনা করতে লগ ইন করুন।',
    timeline: 'অর্ডার ট্র্যাকিং',
    
    // Categories listing
    filterTitle: 'ফিল্টার',
    sortBy: 'বাছাই করুন',
    priceLowHigh: 'মূল্য: কম থেকে বেশি',
    priceHighLow: 'মূল্য: বেশি থেকে কম',
    ratingHighLow: 'রেটিং: বেশি থেকে কম',
    clearAll: 'মুছে ফেলুন',

    // Product Details & Reviews
    description: 'বর্ণনা',
    specifications: 'পণ্য বিবরণ',
    reviews: 'রিভিউ সমূহ',
    addReview: 'রিভিউ যোগ করুন',
    relatedProducts: 'সম্পর্কিত পণ্য',
    rating: 'রেটিং',
    comment: 'মন্তব্য',
    submitReview: 'রিভিউ জমা দিন',

    // Wishlist
    myWishlist: 'আমার উইশলিস্ট',
    emptyWishlist: 'আপনার উইশলিস্ট খালি',

    // Notifications
    notifications: 'বিজ্ঞপ্তি সমূহ',
    markAllRead: 'সব পঠিত হিসেবে চিহ্নিত করুন',
    noNotifications: 'কোনো বিজ্ঞপ্তি নেই'
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations.en) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const local = localStorage.getItem('siraj_language');
    if (local === 'hi' || local === 'bn') return local;
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('siraj_language', lang);
  };

  const t = (key: keyof typeof translations.en) => {
    return translations[language][key] || translations['en'][key] || String(key);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
