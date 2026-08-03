import type { Product, Category, Review, Coupon, Notification } from '../types';

export const MOCK_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    name: 'Mattress',
    slug: 'mattress',
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&q=80&w=400',
    iconName: 'BedDouble'
  },
  {
    id: 'cat-2',
    name: 'Furniture Foam',
    slug: 'foam',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=400',
    iconName: 'Layers'
  },
  {
    id: 'cat-3',
    name: 'Pillow & Cushion',
    slug: 'pillow',
    image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&q=80&w=400',
    iconName: 'Smile'
  },
  {
    id: 'cat-4',
    name: 'Bedsheet',
    slug: 'bedsheet',
    image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=400',
    iconName: 'Grid'
  },
  {
    id: 'cat-5',
    name: 'Blanket & Quilt',
    slug: 'blanket',
    image: 'https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?auto=format&fit=crop&q=80&w=400',
    iconName: 'Wind'
  },
  {
    id: 'cat-6',
    name: 'Mattress Protector',
    slug: 'protector',
    image: 'https://images.unsplash.com/photo-1617806118233-18e1db207f62?auto=format&fit=crop&q=80&w=400',
    iconName: 'ShieldAlert'
  },
  {
    id: 'cat-7',
    name: 'Curtains & Home Decor',
    slug: 'decor',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=400',
    iconName: 'Palette'
  }
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Orthopedic Memory Foam Mattress',
    brand: 'Sleepwell',
    sku: 'SBH-MAT-001',
    category: 'mattress',
    price: 18499,
    originalPrice: 24999,
    discountPercent: 26,
    rating: 4.8,
    reviewCount: 142,
    isAvailable: true,
    stockStatus: 'in_stock',
    mainImage: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Designed specifically to support spinal alignment and relieve pressure points. Made with high-density orthopedic memory foam, this mattress adapts dynamically to body heat and weight, providing a therapeutic sleeping environment for deep rest.',
    specifications: {
      'Material': 'High-Density Memory Foam & Pocket Springs',
      'Thickness': '8 Inches',
      'Warranty': '10 Years Manufacturer Warranty',
      'Firmness': 'Medium Firm',
      'Cover Material': 'Premium Breathable Jacquard Fabric'
    },
    material: 'Memory Foam',
    size: ['Single (72x36)', 'Double (72x48)', 'Queen (78x60)', 'King (78x72)'],
    color: ['Luxury White', 'Classic Grey'],
    warranty: '10 Years',
    deliveryInfo: 'Free delivery within 3-5 business days. Safe, contactless shipping in sanitized vehicles.',
    returnPolicy: '10-day replacement policy if damage occurs during shipping or manufacturing defects found.',
    isTrending: true,
    isBestSeller: true,
    isFeatured: true
  },
  {
    id: 'prod-2',
    name: 'Natural Latex Luxury Hybrid Mattress',
    brand: 'Duroflex',
    sku: 'SBH-MAT-002',
    category: 'mattress',
    price: 29999,
    originalPrice: 38500,
    discountPercent: 22,
    rating: 4.9,
    reviewCount: 88,
    isAvailable: true,
    stockStatus: 'in_stock',
    mainImage: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Crafted with 100% natural organic latex and pocket springs, our hybrid mattress offers unmatched breathability, bounce, and pressure relief. Sleep cool and healthy with hypoallergenic, eco-friendly certifications.',
    specifications: {
      'Material': '100% Natural Dunlop Latex & 5-Zone Pocket Springs',
      'Thickness': '10 Inches',
      'Warranty': '15 Years Warranty',
      'Hypoallergenic': 'Yes',
      'Eco-Friendly': 'GOLS Certified Organic'
    },
    material: 'Natural Latex',
    size: ['Queen (78x60)', 'King (78x72)'],
    color: ['Organic Cream'],
    warranty: '15 Years',
    deliveryInfo: 'Free white-glove home installation. Shipped directly from production warehouse.',
    returnPolicy: '30-night risk-free trial. Return for full refund if unsatisfied.',
    isNewArrival: true,
    isFeatured: true
  },
  {
    id: 'prod-3',
    name: 'Premium High-Resilience Sofa Foam',
    brand: 'Siraj Luxury',
    sku: 'SBH-FOA-001',
    category: 'foam',
    price: 3499,
    originalPrice: 4999,
    discountPercent: 30,
    rating: 4.7,
    reviewCount: 215,
    isAvailable: true,
    stockStatus: 'in_stock',
    mainImage: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Ultra-durable, premium 40-density High Resilience (HR) foam suitable for luxury sofas, chairs, and custom upholstery. Maintains shape and provides perfect cushioning support for decades.',
    specifications: {
      'Density': '40-Density HR',
      'Use Case': 'Sofa cushions, chair seats, bedding upholstery',
      'Warranty': '7 Years Shape Retention Warranty',
      'Compressive Strength': 'High'
    },
    material: 'Polyurethane HR Foam',
    size: ['Standard Sheet (72x36x4)', 'Sofa Block (24x24x4)'],
    color: ['Royal Blue Foam', 'Premium Yellow Foam'],
    warranty: '7 Years',
    deliveryInfo: 'Packed and rolled safely. Delivered within 2-4 business days.',
    returnPolicy: 'Replacement within 7 days for size errors.',
    isBestSeller: true,
    isTodayDeal: true
  },
  {
    id: 'prod-4',
    name: 'Memory Foam Contour Neck Pillow',
    brand: 'Sleepyhead',
    sku: 'SBH-PIL-001',
    category: 'pillow',
    price: 1499,
    originalPrice: 2499,
    discountPercent: 40,
    rating: 4.6,
    reviewCount: 340,
    isAvailable: true,
    stockStatus: 'in_stock',
    mainImage: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&q=80&w=800',
    images: ['https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&q=80&w=800'],
    description: 'Ergonomically contoured pillow designed to cradle the cervical spine. Reduces neck stiffness, shoulder strain, and tension headaches by providing perfect cervical support.',
    specifications: {
      'Material': '100% Pure Slow-Rebound Memory Foam',
      'Cover': 'Removable & Washable Bamboo Fiber Cover',
      'Dimensions': '24 x 14 x 4.5 Inches',
      'Anti-Dust Mite': 'Yes'
    },
    material: 'Memory Foam',
    size: ['Standard Size'],
    color: ['Ice White', 'Steel Blue'],
    warranty: '2 Years',
    deliveryInfo: 'Fast dispatch. Delivered within 1-2 days.',
    returnPolicy: '10-day hygienic return policy (must be unused and in original packaging).',
    isTrending: true,
    isTodayDeal: true
  },
  {
    id: 'prod-5',
    name: '1000 TC Egyptian Cotton Bedsheet',
    brand: 'Siraj Luxury',
    sku: 'SBH-SHE-001',
    category: 'bedsheet',
    price: 2499,
    originalPrice: 4500,
    discountPercent: 44,
    rating: 4.9,
    reviewCount: 65,
    isAvailable: true,
    stockStatus: 'in_stock',
    mainImage: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Indulge in five-star hotel comfort with our ultra-soft 1000 Thread Count Egyptian cotton sateen bedsheets. Features an elegant glossy sheen and breathability that gets softer with every wash.',
    specifications: {
      'Thread Count': '1000 TC',
      'Weave': 'Sateen Weave',
      'Material': 'Long-Staple Egyptian Cotton',
      'Set Includes': '1 Double Bedsheet + 2 Pillow Covers'
    },
    material: 'Egyptian Cotton',
    size: ['Queen Size (90x100)', 'Super King Size (108x108)'],
    color: ['Snow White', 'Ivory Cream', 'Silver Satin'],
    warranty: '1 Year Color Fastness Warranty',
    deliveryInfo: 'Free courier shipping across India.',
    returnPolicy: '15-day hassle-free returns.',
    isTrending: true,
    isNewArrival: true
  },
  {
    id: 'prod-6',
    name: 'Premium All-Weather Microfiber Comforter',
    brand: 'Kurlon',
    sku: 'SBH-BLA-001',
    category: 'blanket',
    price: 1999,
    originalPrice: 3499,
    discountPercent: 42,
    rating: 4.7,
    reviewCount: 195,
    isAvailable: true,
    stockStatus: 'in_stock',
    mainImage: 'https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?auto=format&fit=crop&q=80&w=800',
    images: ['https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?auto=format&fit=crop&q=80&w=800'],
    description: 'Hypoallergenic all-season microfiber quilt with premium box-stitch pattern to prevent filling shift. Provides cozy insulation in winters and stays breathable in air-conditioned summers.',
    specifications: {
      'Fill': '300 GSM Siliconized Microfiber',
      'Fabric': 'Premium Peach-Finished Polyester Outer shell',
      'Warmth Level': 'Moderate (All-Season)',
      'Machine Washable': 'Yes, Gentle Cycle'
    },
    material: 'Microfiber & Polyester',
    size: ['Single (60x90)', 'Double (90x100)'],
    color: ['Reversible Navy/Silver', 'Classic Charcoal'],
    warranty: '1 Year',
    deliveryInfo: 'Dispatched next day. Free delivery.',
    returnPolicy: '10-day return policy.',
    isBestSeller: true
  },
  {
    id: 'prod-7',
    name: 'Waterproof Breathable Mattress Protector',
    brand: 'Siraj Luxury',
    sku: 'SBH-PRO-001',
    category: 'protector',
    price: 899,
    originalPrice: 1599,
    discountPercent: 43,
    rating: 4.5,
    reviewCount: 428,
    isAvailable: true,
    stockStatus: 'in_stock',
    mainImage: 'https://images.unsplash.com/photo-1617806118233-18e1db207f62?auto=format&fit=crop&q=80&w=800',
    images: ['https://images.unsplash.com/photo-1617806118233-18e1db207f62?auto=format&fit=crop&q=80&w=800'],
    description: 'Guard your mattress against spills, fluid accidents, dust-mites, and bedbugs. Made with soft cotton terry surface layer laminated with highly breathable, noiseless waterproof TPU membrane.',
    specifications: {
      'Top Surface': '80% Cotton Terry / 20% Polyester',
      'Backing': 'Waterproof TPU film',
      'Skirt Material': 'Stretchable Lycra fabric',
      'Fit': 'Elasticated skirt (fits up to 10" mattress height)'
    },
    material: 'Cotton Terry & TPU',
    size: ['Single', 'Double', 'Queen', 'King'],
    color: ['Pure White', 'Slate Grey'],
    warranty: '3 Years Warranty on waterproof lamination',
    deliveryInfo: 'Delivered in 2-3 business days.',
    returnPolicy: '10-day return policy.',
    isBestSeller: true
  },
  {
    id: 'prod-8',
    name: 'Luxury Velvet Blackout Curtains',
    brand: 'Siraj Luxury',
    sku: 'SBH-DEC-001',
    category: 'decor',
    price: 1299,
    originalPrice: 2499,
    discountPercent: 48,
    rating: 4.8,
    reviewCount: 76,
    isAvailable: true,
    stockStatus: 'low_stock',
    mainImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800',
    images: ['https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800'],
    description: 'Add a touch of elegance and noise-dampening insulation to your living room or master bedroom. Completely blocks out sunlight, hot drafts, and cold breezes for an energy-efficient room.',
    specifications: {
      'Material': 'Heavyweight Premium Velvet (300 GSM)',
      'Opacity': '95% Blackout',
      'Header Type': 'Rust-proof Stainless Steel Eyelets',
      'Cleaning': 'Dry Clean Recommended'
    },
    material: 'Velvet',
    size: ['Window (5 feet)', 'Door (7 feet)', 'Long Door (9 feet)'],
    color: ['Royal Blue', 'Champagne Gold', 'Emerald Green'],
    warranty: '6 Months Stitching Warranty',
    deliveryInfo: 'Ships within 24 hours. Custom dimensions available.',
    returnPolicy: '7-day replacement for manufacturing defects.',
    isNewArrival: true
  }
];

export const MOCK_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    productId: 'prod-1',
    rating: 5,
    userName: 'Rajesh Kumar',
    content: 'Awesome product! I used to have severe back pain in the mornings, but after using this Orthopedic memory foam mattress for a week, my spinal posture has improved immensely. Highly recommended!',
    date: 'July 15, 2026',
    verified: true,
    likes: 42,
    reported: false,
    photos: ['https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=150']
  },
  {
    id: 'rev-2',
    productId: 'prod-1',
    rating: 4,
    userName: 'Sneha Sharma',
    content: 'Very comfortable mattress. The support is great. Only issue was delivery got delayed by 1 day, but the service team kept me updated. Mattress packaging was clean and sanitised.',
    date: 'June 28, 2026',
    verified: true,
    likes: 18,
    reported: false
  },
  {
    id: 'rev-3',
    productId: 'prod-4',
    rating: 5,
    userName: 'Vikram Singh',
    content: 'Perfect contouring for my neck. I sleep on my side mostly and this pillow has solved my shoulder pressure problems. Soft yet firm support.',
    date: 'July 20, 2026',
    verified: true,
    likes: 31,
    reported: false
  },
  {
    id: 'rev-4',
    productId: 'prod-3',
    rating: 5,
    userName: 'Amit Patel',
    content: 'High-density HR foam is really heavy and feels solid. Reshaped my old couch cushion with this, now it feels like a brand new premium luxury sofa. Amazing craftsmanship!',
    date: 'May 12, 2026',
    verified: true,
    likes: 54,
    reported: false
  }
];

export const MOCK_COUPONS: Coupon[] = [
  {
    code: 'WELCOME100',
    discountType: 'fixed',
    value: 100,
    minPurchase: 999,
    description: 'Flat ₹100 Off on your first bedding purchase.',
    expiryDate: 'Dec 31, 2026'
  },
  {
    code: 'SIRAJFESTIVE',
    discountType: 'percentage',
    value: 10,
    minPurchase: 4999,
    description: 'Get 10% Off on orders above ₹4,999. Max discount ₹1,000.',
    expiryDate: 'Nov 15, 2026'
  },
  {
    code: 'LUXURYCOZY',
    discountType: 'percentage',
    value: 15,
    minPurchase: 14999,
    description: 'Extra 15% Off on premium mattresses and collections.',
    expiryDate: 'Oct 30, 2026'
  }
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    title: 'Welcome to Siraj Bedding House!',
    body: 'Thank you for choosing us for your luxury sleep solutions. Explore our range of products and use code WELCOME100 for a special discount.',
    type: 'announcement',
    isRead: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'notif-2',
    title: 'Festive Season Flash Sale! 🌟',
    body: 'Get up to 45% discount on all premium mattresses and luxury comforters. Valid only for the next 24 hours!',
    type: 'festival',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    link: '/category/mattress'
  },
  {
    id: 'notif-3',
    title: 'Price Drop Alert: Natural Latex Mattress',
    body: 'Your wishlisted item Natural Latex Hybrid Mattress has dropped in price by ₹2000! Secure yours now.',
    type: 'price_drop',
    isRead: true,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    link: '/product/prod-2'
  }
];

export const FAQ_DATA = [
  {
    question: 'How do I choose the correct mattress size?',
    answer: 'Measure your bed frame length and width internally (where the mattress will sit). Standard Indian sizes include Single (72x36 inches), Double (72x48 inches), Queen (78x60 inches), and King (78x72 inches). We also provide custom size mattresses to perfectly fit any bespoke bedding layout.'
  },
  {
    question: 'What is High Resilience (HR) Foam?',
    answer: 'High Resilience (HR) Foam has a cell structure that is highly responsive to body weight, offering increased elasticity and pressure distribution. It retains its shape much longer than standard polyurethane foams, making it ideal for luxury sofa cushions and premium supportive beddings.'
  },
  {
    question: 'Does Siraj Bedding House ship nationwide?',
    answer: 'Yes! We deliver home furnishing items and compressed roll-pack mattresses nationwide with free delivery. Upholstery foam sheets and bulky non-compressed items are delivered locally via our regional logistics hubs.'
  },
  {
    question: 'What is the return/exchange policy?',
    answer: 'We offer a 10-day replacement policy on manufacturing defects or items damaged during transit. For select premium mattresses, we also offer a 30-night trial period.'
  }
];

export const BRAND_DATA = [
  { name: 'Sleepwell', logo: 'Sleepwell' },
  { name: 'Kurlon', logo: 'Kurlon' },
  { name: 'Duroflex', logo: 'Duroflex' },
  { name: 'Sleepyhead', logo: 'Sleepyhead' },
  { name: 'Siraj Luxury', logo: 'Siraj Luxury' },
  { name: 'Centuary', logo: 'Centuary' }
];

export const WHY_CHOOSE_US = [
  {
    title: '50 Years of Trust',
    description: 'Providing premium comfort and luxury furnishing products since 1976 with thousands of satisfied clients.',
    iconName: 'Award'
  },
  {
    title: 'Orthopedic Spine Support',
    description: 'All mattresses are anatomically tested to ensure optimal spinal alignment, posture correction and pressure relief.',
    iconName: 'Activity'
  },
  {
    title: 'Hypoallergenic & Eco-Safe',
    description: 'We use natural latex, organic bamboo fabrics, and non-toxic materials certified safe for kids and elderly.',
    iconName: 'ShieldCheck'
  },
  {
    title: 'Custom Fabrications',
    description: 'Need specific dimensions, densities or colors? We craft cushions, sofa foams and mattress protectors to your exact needs.',
    iconName: 'Settings'
  }
];

export const STORE_STATS = [
  { label: 'Happy Customers', value: '50K+' },
  { label: 'Years of Experience', value: '50+' },
  { label: 'Products Sold', value: '200K+' },
  { label: 'Store Ratings', value: '4.9/5' }
];
