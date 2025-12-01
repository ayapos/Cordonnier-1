import { useState, useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import axios from "axios";
import { CartProvider } from "@/context/CartContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import "./i18n"; // Initialize i18n

// Pages
import Home from "@/pages/Home";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import Services from "@/pages/Services";
import CreateOrder from "@/pages/CreateOrder";
import OrderDetails from "@/pages/OrderDetails";
import Payment from "@/pages/Payment";
import OrderConfirmation from "@/pages/OrderConfirmation";
import BecomePartner from "@/pages/BecomePartner";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import Legal from "@/pages/Legal";
import PartnerTerms from "@/pages/PartnerTerms";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Axios interceptor for auth
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/auth" />;
};

function App() {
  const [user, setUser] = useState(null);

  // Configure axios interceptor to include token in all requests
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUserData();
    }
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await axios.get(`${API}/auth/me`);
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      localStorage.removeItem('token');
    }
  };

  const refreshUserData = () => {
    fetchUserData();
  };

  return (
    <CurrencyProvider>
      <CartProvider>
        <div className="App">
          <BrowserRouter>
            <Routes>
            <Route path="/" element={<Home user={user} />} />
            <Route path="/auth" element={<Auth setUser={setUser} />} />
            <Route path="/services" element={<Services user={user} />} />
            <Route path="/cart" element={<Cart user={user} />} />
            <Route path="/checkout" element={<Checkout user={user} />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  {user?.role === 'admin' ? <AdminDashboard user={user} /> : <Dashboard user={user} refreshUser={refreshUserData} />}
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <AdminDashboard user={user} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/order/new" 
              element={
                <ProtectedRoute>
                  <CreateOrder user={user} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/order/:orderId" 
              element={
                <ProtectedRoute>
                  <OrderDetails user={user} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/payment/:orderId" 
              element={
                <ProtectedRoute>
                  <Payment user={user} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/order-confirmation/:orderId" 
              element={<OrderConfirmation user={user} />} 
            />
            <Route path="/become-partner" element={<BecomePartner />} />
            <Route path="/partner-terms" element={<PartnerTerms />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/legal" element={<Legal />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-center" richColors />
      </div>
    </CartProvider>
    </CurrencyProvider>
  );
}

export default App;
