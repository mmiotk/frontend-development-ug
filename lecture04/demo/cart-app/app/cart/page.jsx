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
        <h1>Cart</h1>
        <p>Your cart is empty.</p>
        <Link href="/">Back to shop</Link>
      </main>
    );
  }

  const total = cart.items.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <main>
      <h1>Cart</h1>
      <ul>
        {cart.items.map(item => (
          <CartItem key={item.id} item={item} />
        ))}
      </ul>
      <p>Total: <strong>{total.toFixed(2)} PLN</strong></p>
      <button onClick={() => dispatch({ type: 'CLEAR_CART' })}>Clear cart</button>
      {' '}
      <Link href="/">Continue shopping</Link>
    </main>
  );
}
