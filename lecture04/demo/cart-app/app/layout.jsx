import Link from 'next/link';
import { CartProvider } from './context/CartContext';
import './globals.css';

export const metadata = { title: 'Coffee shop — demo' };

// Server Component — can render Client Components (CartProvider) as children.
// CartProvider establishes the client boundary for the entire app tree.
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <nav>
          <Link href="/">Shop</Link>
          {' | '}
          <Link href="/cart">Cart</Link>
        </nav>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
