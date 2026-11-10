'use client';

import { createContext, useContext, useOptimistic, useReducer } from 'react';
import { cartReducer, initialCartState } from '../lib/cartReducer';

const CartStateContext = createContext(null); // changes on every action
const CartDispatchContext = createContext(null); // stable identity: dispatch from useReducer
const CartOptimisticContext = createContext(null); // stable identity: setter from useOptimistic

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, initialCartState);
  // Cart on screen = real cart + actions still waiting for the server.
  const [optimisticCart, addOptimistic] = useOptimistic(cart, cartReducer);

  return (
    <CartStateContext value={optimisticCart}>
      <CartDispatchContext value={dispatch}>
        <CartOptimisticContext value={addOptimistic}>
          {children}
        </CartOptimisticContext>
      </CartDispatchContext>
    </CartStateContext>
  );
}

export function useCartState() {
  const ctx = useContext(CartStateContext);
  if (ctx === null) throw new Error('useCartState must be used inside <CartProvider>');
  return ctx;
}

export function useCartDispatch() {
  const ctx = useContext(CartDispatchContext);
  if (ctx === null) throw new Error('useCartDispatch must be used inside <CartProvider>');
  return ctx;
}

export function useCartOptimistic() {
  const ctx = useContext(CartOptimisticContext);
  if (ctx === null) throw new Error('useCartOptimistic must be used inside <CartProvider>');
  return ctx;
}
