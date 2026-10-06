'use client';

import { useOptimistic, startTransition, useState } from 'react';
import { useCartDispatch } from '../context/CartContext';
import { fakeAddToCart } from '../lib/fakeApi';

// Demonstrates useOptimistic: immediate UI feedback before the async op completes.
// When fakeAddToCart resolves → dispatch commits the item to real cart state.
// When fakeAddToCart rejects → optimistic state reverts (rollback), item not added.
export default function AddToCartButton({ product }) {
  const dispatch = useCartDispatch();
  const [error, setError] = useState(null);

  // Real state: false (not adding).
  // Optimistic state: true while startTransition is pending.
  // After transition ends (success or error), reverts to real state (false).
  const [optimisticAdding, setOptimisticAdding] = useOptimistic(false);

  function handleAdd() {
    setError(null);
    startTransition(async () => {
      setOptimisticAdding(true);       // immediate UI: "Dodawanie..."
      try {
        await fakeAddToCart(product);  // 1.5 s simulated network call
        dispatch({ type: 'ADD_ITEM', product }); // commit to real state
      } catch (err) {
        setError(err.message);         // optimistic state auto-reverts to false
      }
    });
  }

  return (
    <>
      <button onClick={handleAdd} disabled={optimisticAdding}>
        {optimisticAdding ? 'Dodawanie...' : 'Dodaj do koszyka'}
      </button>
      {error && <span> Błąd: {error}</span>}
    </>
  );
}
