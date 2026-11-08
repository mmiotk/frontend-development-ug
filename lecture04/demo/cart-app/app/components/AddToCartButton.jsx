'use client';

import { startTransition, useState } from 'react';
import { useCart } from '../context/CartContext';
import { fakeAddToCart } from '../lib/fakeApi';

export default function AddToCartButton({ product }) {
  const { dispatch, addOptimistic } = useCart();
  const [error, setError] = useState(null);

  function handleAdd() {
    setError(null);
    startTransition(async () => {
      addOptimistic({ type: 'ADD_ITEM', product }); // on screen at once
      try {
        await fakeAddToCart(); // server answers after 1.5 s
        startTransition(() => dispatch({ type: 'ADD_ITEM', product }));
      } catch (e) {
        setError(e.message); // the optimistic item disappears
      }
    });
  }

  return (
    <>
      <button onClick={handleAdd}>Add to cart</button>
      {error && <span> {error}</span>}
    </>
  );
}
