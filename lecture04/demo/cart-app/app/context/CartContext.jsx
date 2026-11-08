'use client';

import { createContext, useContext, useOptimistic, useReducer } from 'react';
import { cartReducer, initialCartState } from '../lib/cartReducer';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, initialCartState);
  // Cart on screen = real cart + actions still waiting for the server.
  const [optimisticCart, addOptimistic] = useOptimistic(cart, cartReducer);

  return (
    <CartContext value={{ cart: optimisticCart, dispatch, addOptimistic }}>
      {children}
    </CartContext>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (ctx === null) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
