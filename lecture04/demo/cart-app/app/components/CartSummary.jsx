'use client';

import Link from 'next/link';
import { useCartState, useCartDispatch } from '../context/CartContext';

// Reads cart state from context — no props needed from parent.
export default function CartSummary() {
  const cart = useCartState();
  const dispatch = useCartDispatch();

  const count = cart.items.reduce((s, i) => s + i.qty, 0);
  const total = cart.items.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <section>
      <h2>Cart: {count} pcs — {total.toFixed(2)} PLN</h2>
      <Link href="/cart">Go to cart</Link>
      {' '}
      <button
        onClick={() => dispatch({ type: 'CLEAR_CART' })}
        disabled={cart.items.length === 0}
      >
        Clear cart
      </button>
    </section>
  );
}
