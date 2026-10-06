import Link from 'next/link';
import { CartProvider } from './context/CartContext';
import './globals.css';

export const metadata = { title: 'Sklep kawowy — demo' };

// Server Component — can render Client Components (CartProvider) as children.
// CartProvider establishes the client boundary for the entire app tree.
export default function RootLayout({ children }) {
  return (
    <html lang="pl">
      <body>
        <nav>
          <Link href="/">Sklep</Link>
          {' | '}
          <Link href="/cart">Koszyk</Link>
        </nav>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
