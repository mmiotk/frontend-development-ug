// Server Component — no 'use client' needed here.
// Client Components (CartSummary, ProductList, RecommendedSection) bring
// their own 'use client' directives and establish the client boundary themselves.
import CartSummary from './components/CartSummary';
import ProductList from './components/ProductList';
import RecommendedSection from './components/RecommendedSection';

export default function HomePage() {
  return (
    <main>
      <h1>Sklep kawowy</h1>
      <CartSummary />
      <ProductList />
      <hr />
      <RecommendedSection />
    </main>
  );
}
