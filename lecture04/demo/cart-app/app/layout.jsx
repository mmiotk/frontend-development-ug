import Link from 'next/link';
import { CartProvider } from './context/CartContext';

export const metadata = { title: 'Coffee shop' };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <nav>
          <Link href="/">Shop</Link> | <Link href="/cart">Cart</Link>
        </nav>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
