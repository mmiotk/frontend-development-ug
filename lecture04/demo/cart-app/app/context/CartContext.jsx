'use client';

import { createContext, useContext, useOptimistic, useReducer } from 'react';
import { cartReducer, initialCartState } from '../lib/cartReducer';

// Split into contexts to avoid unnecessary re-renders:
//   CartStateContext      — the cart shown on screen (changes on every action)
//   CartDispatchContext   — dispatch from useReducer (stable reference)
//   CartOptimisticContext — the optimistic setter from useOptimistic (stable reference)
// A component that reads only the stable functions is not re-rendered by a cart change
// through context (it still re-renders when its parent does).
// React 19: the context object itself is the provider (<Ctx value>), no .Provider.
const CartStateContext = createContext(null);
const CartDispatchContext = createContext(null);
const CartOptimisticContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, initialCartState);
  // Optimistic cart: the real cart plus actions still waiting for the server.
  // The same reducer computes both.
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

// Hook for reading the cart shown on screen.
export function useCartState() {
  const ctx = useContext(CartStateContext);
  if (ctx === null) throw new Error('useCartState must be used inside <CartProvider>');
  return ctx;
}

// Hook for dispatching cart actions.
export function useCartDispatch() {
  const ctx = useContext(CartDispatchContext);
  if (ctx === null) throw new Error('useCartDispatch must be used inside <CartProvider>');
  return ctx;
}

// Hook for showing an action before the server confirms it.
export function useCartOptimistic() {
  const ctx = useContext(CartOptimisticContext);
  if (ctx === null) throw new Error('useCartOptimistic must be used inside <CartProvider>');
  return ctx;
}
