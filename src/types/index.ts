export interface Product {
  id: string;
  name: string;
  brand: string;
  sku: string;
  category: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  rating: number;
  reviewCount: number;
  isAvailable: boolean;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  mainImage: string;
  images: string[];
  description: string;
  specifications: Record<string, string>;
  material: string;
  size: string[];
  color: string[];
  warranty: string;
  deliveryInfo: string;
  returnPolicy: string;
  isNewArrival?: boolean;
  isTodayDeal?: boolean;
  isTrending?: boolean;
  isBestSeller?: boolean;
  isFeatured?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  iconName: string; // Lucide icon identifier
}

export interface Review {
  id: string;
  productId: string;
  rating: number;
  userName: string;
  userAvatar?: string;
  content: string;
  date: string;
  verified: boolean;
  likes: number;
  reported: boolean;
  photos?: string[];
  userId?: string;
}

export interface CartItem {
  id: string; // combination of productId + size + color
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

export interface Address {
  id: string;
  name: string;
  phone: string;
  email?: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  type: 'home' | 'work' | 'other';
  latitude?: number;
  longitude?: number;
}

export interface OrderTimelineStep {
  status: 'pending' | 'confirmed' | 'packed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'returned';
  title: string;
  description: string;
  date: string;
  isCompleted: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  items: CartItem[];
  subtotal: number;
  shippingCharge: number;
  tax: number;
  discount: number;
  grandTotal: number;
  status: 'pending' | 'confirmed' | 'packed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'returned';
  paymentMethod: 'upi' | 'card' | 'net_banking' | 'cod' | 'wallet';
  paymentStatus: 'pending' | 'success' | 'failed';
  address: Address;
  deliverySlot: {
    date: string;
    time: string;
  };
  trackingTimeline: OrderTimelineStep[];
  createdAt: string;
  estimatedDelivery: string;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'offer' | 'product' | 'festival' | 'order' | 'delivery' | 'price_drop' | 'back_in_stock' | 'announcement';
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export interface FCMConfig {
  token: string | null;
  permission: 'default' | 'granted' | 'denied';
  enabled: boolean;
  settings: {
    welcome: boolean;
    newProduct: boolean;
    festivalOffer: boolean;
    flashSale: boolean;
    priceDrop: boolean;
    orderUpdate: boolean;
    deliveryUpdate: boolean;
    backInStock: boolean;
  };
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  minPurchase: number;
  description: string;
  expiryDate: string;
}
