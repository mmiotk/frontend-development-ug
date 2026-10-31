'use client';

import { startTransition, useState } from 'react';
import { useCartDispatch, useCartOptimistic } from '../context/CartContext';
import { fakeAddToCart } from '../lib/fakeApi';

// Optimistic add: the cart on screen changes at once, the server answers after 1.5 s.
// On success dispatch commits the item to the real cart state.
// On error the optimistic item disappears when the transition ends (rollback).
export default function AddToCartButton({ product }) {
  const dispatch = useCartDispatch();
  const addOptimistic = useCartOptimistic();
  const [error, setError] = useState(null);

  function handleAdd() {
    setError(null);
    startTransition(async () => {
      addOptimistic({ type: 'ADD_ITEM', product }); // immediate UI: item in the cart
      try {
        await fakeAddToCart(product);               // 1.5 s simulated network call
        startTransition(() => {
          dispatch({ type: 'ADD_ITEM', product });  // commit to real state
        });
      } catch (err) {
        setError(err.message);                      // optimistic item reverts
      }
    });
  }

  return (
    <>
      <button onClick={handleAdd}>Add to cart</button>
      {error && <span> Error: {error}</span>}
    </>
  );
}
