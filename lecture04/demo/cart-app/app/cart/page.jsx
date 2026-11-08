'use client';

import { useCart } from '../context/CartContext';
import CartSummary from '../components/CartSummary';

export default function CartPage() {
  const { cart, dispatch } = useCart();

  return (
    <main>
      <h1>Cart</h1>
      <CartSummary />
      <ul>
        {cart.items.map(item => (
          <li key={item.id}>
            {item.name} × {item.qty}{' '}
            <button onClick={() => dispatch({ type: 'REMOVE_ITEM', id: item.id })}>Remove</button>
          </li>
        ))}
      </ul>
      <button onClick={() => dispatch({ type: 'CLEAR_CART' })}>Clear cart</button>
    </main>
  );
}
