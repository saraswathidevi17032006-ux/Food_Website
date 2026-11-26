import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { CartContext } from './useCart';

const loadInitialCart = () => {
  try {
    const localData = localStorage.getItem('cartItems');
    if (!localData) return [];
    const parsed = JSON.parse(localData);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) =>
        item &&
        typeof item.foodItem === 'string' &&
        typeof item.name === 'string' &&
        typeof item.price === 'number' &&
        Number.isFinite(item.price) &&
        typeof item.qty === 'number' &&
        Number.isInteger(item.qty) &&
        item.qty > 0
    );
  } catch {
    return [];
  }
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(loadInitialCart);

  useEffect(() => {
    try {
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
    } catch {
      // Ignore storage quota / privacy mode errors
    }
  }, [cartItems]);

  const addToCart = (foodItem, qty = 1) => {
    const existItem = cartItems.find((x) => x.foodItem === foodItem._id);
    if (existItem) {
      toast.info(`Updated ${foodItem.name} quantity in cart!`, { autoClose: 2000 });
      setCartItems((prevItems) =>
        prevItems.map((x) =>
          x.foodItem === foodItem._id ? { ...x, qty: x.qty + qty } : x
        )
      );
    } else {
      toast.success(`Added ${foodItem.name} to cart!`, { autoClose: 2000 });
      setCartItems((prevItems) => [
        ...prevItems,
        {
          foodItem: foodItem._id,
          name: foodItem.name,
          image: foodItem.image,
          price: foodItem.price,
          qty,
        },
      ]);
    }
  };

  const removeFromCart = (id) => {
    const item = cartItems.find((x) => x.foodItem === id);
    if (item) {
      toast.error(`Removed ${item.name} from cart`, { autoClose: 2000 });
    }
    setCartItems((prevItems) => prevItems.filter((x) => x.foodItem !== id));
  };

  const updateQuantity = (id, qty) => {
    if (qty <= 0) {
      removeFromCart(id);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((x) => (x.foodItem === id ? { ...x, qty } : x))
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
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
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
