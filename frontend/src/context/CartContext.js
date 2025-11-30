import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const CartContext = createContext();

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}

export function CartProvider({ children }) {
  const { t } = useTranslation();
  const [cartItems, setCartItems] = useState([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('shoerepair_cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('shoerepair_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (service) => {
    setCartItems((prev) => {
      // Check if service already in cart
      const existing = prev.find(item => item.id === service.id);
      if (existing) {
        // Increase quantity
        toast.success(t('quantityUpdated'), { duration: 2000 });
        return prev.map(item =>
          item.id === service.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Add new item
        toast.success(t('addedToCart'), { duration: 2000 });
        return [...prev, { ...service, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (serviceId) => {
    setCartItems((prev) => prev.filter(item => item.id !== serviceId));
    toast.success(t('removedFromCart'));
  };

  const updateQuantity = (serviceId, quantity) => {
    if (quantity < 1) {
      removeFromCart(serviceId);
      return;
    }
    setCartItems((prev) =>
      prev.map(item =>
        item.id === serviceId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('shoerepair_cart');
  };

  const getCartTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
