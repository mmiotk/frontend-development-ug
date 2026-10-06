'use client';

import { products } from '../data/products';
import AddToCartButton from './AddToCartButton';

// No props from parent and no context: the product list is static.
// Each AddToCartButton reads dispatch from context by itself.
export default function ProductList() {
  return (
    <section>
      <h2>Produkty</h2>
      <ul>
        {products.map(product => (
          <li key={product.id}>
            {product.name} — {product.price.toFixed(2)} zł
            {' '}
            <AddToCartButton product={product} />
          </li>
        ))}
      </ul>
    </section>
  );
}
