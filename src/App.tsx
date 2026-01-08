import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import ChatbotWidget from "@/components/ChatbotWidget";
import Index from "./pages/Index";
import About from "./pages/About";
import Shop from "./pages/Shop";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Articles from "./pages/Articles";
import ArticleDetail from "./pages/ArticleDetail";
import Community from "./pages/Community";
import CommunityPost from "./pages/CommunityPost";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import VFlowProduct from "./pages/VFlowProduct";
import Reviews from "./pages/Reviews";
import FAQ from "./pages/FAQ";
import OrderHistory from "./pages/OrderHistory";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

// Admin pages
import { AdminLayout } from "@/components/admin/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminArticles from "./pages/admin/AdminArticles";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminCommunity from "./pages/admin/AdminCommunity";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminBrandStory from "./pages/admin/AdminBrandStory";
import AdminBrandStoryGallery from "./pages/admin/AdminBrandStoryGallery";
import AdminTrustElements from "./pages/admin/AdminTrustElements";
import AdminPaymentSettings from "./pages/admin/AdminPaymentSettings";
import AdminContact from "./pages/admin/AdminContact";
import AdminFAQ from "./pages/admin/AdminFAQ";
import AdminFAQImages from "./pages/admin/AdminFAQImages";
import AdminLogo from "./pages/admin/AdminLogo";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CartProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/articles" element={<Articles />} />
            <Route path="/articles/:slug" element={<ArticleDetail />} />
            <Route path="/community" element={<Community />} />
            <Route path="/community/:id" element={<CommunityPost />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/products/vflow" element={<VFlowProduct />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/orders" element={<OrderHistory />} />
            <Route path="/admin" element={<Admin />} />
            
            {/* Admin Dashboard Routes */}
            <Route path="/admin/dashboard" element={<AdminLayout />}>
              <Route index element={<AdminOverview />} />
              <Route path="articles" element={<AdminArticles />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="community" element={<AdminCommunity />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="brand-story" element={<AdminBrandStory />} />
              <Route path="brand-story-gallery" element={<AdminBrandStoryGallery />} />
              <Route path="trust-elements" element={<AdminTrustElements />} />
              <Route path="payment-settings" element={<AdminPaymentSettings />} />
              <Route path="contact" element={<AdminContact />} />
              <Route path="faq" element={<AdminFAQ />} />
              <Route path="faq-images" element={<AdminFAQImages />} />
              <Route path="logo" element={<AdminLogo />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ChatbotWidget />
        </BrowserRouter>
      </TooltipProvider>
    </CartProvider>
  </QueryClientProvider>
);

export default App;
