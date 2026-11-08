// app/layout.jsx
import Link from "next/link";

export const metadata = { title: "Articles" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <nav>
          <Link href="/">Articles</Link> | <Link href="/new">Add</Link>
        </nav>
        {children}
      </body>
    </html>
  );
}
