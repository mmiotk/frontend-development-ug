'use client';

import { createContext, useContext, useReducer } from 'react';
import { cartReducer, initialCartState } from '../lib/cartReducer';

// Split into two contexts to avoid unnecessary re-renders:
//   CartStateContext  — the cart data (changes on every action)
//   CartDispatchContext — the dispatch function (stable reference, never changes)
// A component that reads only dispatch is not re-rendered by a cart change
// through context (it still re-renders when its parent does).
// React 19: the context object itself is the provider (<Ctx value>), no .Provider.
const CartStateContext = createContext(null);
const CartDispatchContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, initialCartState);

  return (
    <CartStateContext value={cart}>
      <CartDispatchContext value={dispatch}>
        {children}
      </CartDispatchContext>
    </CartStateContext>
  );
}

// Hook for reading cart data.
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
