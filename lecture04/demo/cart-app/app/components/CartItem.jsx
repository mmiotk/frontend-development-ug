'use client';

import { useCartDispatch } from '../context/CartContext';

// Reads only dispatch from context (CartDispatchContext), so a cart change does not
// re-render it through context. It still re-renders on every cart change, because its
// parent CartPage reads cart state and renders all rows again.
export default function CartItem({ item }) {
  const dispatch = useCartDispatch();

  return (
    <li>
      <strong>{item.name}</strong>
      {' — '}
      {item.price.toFixed(2)} zł
      {' × '}
      <input
        type="number"
        value={item.qty}
        min="1"
        onChange={e =>
          dispatch({ type: 'UPDATE_QTY', id: item.id, qty: Number(e.target.value) })
        }
      />
      {' = '}
      <strong>{(item.price * item.qty).toFixed(2)} zł</strong>
      {' '}
      <button onClick={() => dispatch({ type: 'REMOVE_ITEM', id: item.id })}>Usuń</button>
    </li>
  );
}
