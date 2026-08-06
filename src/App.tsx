import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Context Providers
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { NotificationProvider } from './context/NotificationContext';
import { CompareProvider } from './context/CompareContext';

// Layout
import { AppLayout } from './components/layout/AppLayout';

// Pages
import { Home } from './pages/Home';
import { Categories } from './pages/Categories';
import { ProductDetails } from './pages/ProductDetails';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { OrderSuccess } from './pages/OrderSuccess';
import { Profile } from './pages/Profile';
import { MyOrders } from './pages/MyOrders';
import { Wishlist } from './pages/Wishlist';
import { Notifications } from './pages/Notifications';
import { HelpCenter } from './pages/HelpCenter';
import { NotFound } from './pages/NotFound';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <CartProvider>
                <WishlistProvider>
                  <NotificationProvider>
                    <CompareProvider>
                      <AppLayout>
                        <Routes>
                          <Route path="/" element={<Home />} />
                          <Route path="/categories" element={<Categories />} />
                          <Route path="/product/:id" element={<ProductDetails />} />
                          <Route path="/cart" element={<Cart />} />
                          <Route path="/checkout" element={<Checkout />} />
                          <Route path="/order-success" element={<OrderSuccess />} />
                          <Route path="/profile" element={<Profile />} />
                          <Route path="/profile/orders" element={<MyOrders />} />
                          <Route path="/wishlist" element={<Wishlist />} />
                          <Route path="/notifications" element={<Notifications />} />
                          <Route path="/help" element={<HelpCenter />} />
                          <Route path="/contact" element={<HelpCenter />} />
                          <Route path="/about" element={<HelpCenter />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </AppLayout>
                    </CompareProvider>
                  </NotificationProvider>
                </WishlistProvider>
              </CartProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
