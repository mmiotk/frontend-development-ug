// Server Component: the client parts bring their own 'use client'.
import { products } from './data/products';
import CartSummary from './components/CartSummary';
import AddToCartButton from './components/AddToCartButton';
import Recommended from './components/Recommended';

export default function HomePage() {
  return (
    <main>
      <h1>Coffee shop</h1>
      <CartSummary />
      <ul>
        {products.map(product => (
          <li key={product.id}>
            {product.name} — {product.price.toFixed(2)} PLN{' '}
            <AddToCartButton product={product} />
          </li>
        ))}
      </ul>
      <Recommended />
    </main>
  );
}
