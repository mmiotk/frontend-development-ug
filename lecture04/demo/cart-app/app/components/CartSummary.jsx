'use client';

import { useCartState } from '../context/CartContext';

export default function CartSummary() {
  const cart = useCartState();
  const count = cart.items.reduce((sum, i) => sum + i.qty, 0);
  const total = cart.items.reduce((sum, i) => sum + i.price * i.qty, 0);

  return <h2>Cart: {count} pcs — {total.toFixed(2)} PLN</h2>;
}
