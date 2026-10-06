'use client';

import Link from 'next/link';
import { useCartState, useCartDispatch } from '../context/CartContext';
import CartItem from '../components/CartItem';

export default function CartPage() {
  const cart = useCartState();
  const dispatch = useCartDispatch();

  if (cart.items.length === 0) {
    return (
      <main>
        <h1>Koszyk</h1>
        <p>Koszyk jest pusty.</p>
        <Link href="/">Wróć do sklepu</Link>
      </main>
    );
  }

  const total = cart.items.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <main>
      <h1>Koszyk</h1>
      <ul>
        {cart.items.map(item => (
          <CartItem key={item.id} item={item} />
        ))}
      </ul>
      <p>Razem: <strong>{total.toFixed(2)} zł</strong></p>
      <button onClick={() => dispatch({ type: 'CLEAR_CART' })}>Wyczyść koszyk</button>
      {' '}
      <Link href="/">Kontynuuj zakupy</Link>
    </main>
  );
}
