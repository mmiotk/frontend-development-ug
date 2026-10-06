// Shared layout (segment 6) — wraps every route: <nav> + <main>.
import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "Cookbook — Demo L01",
  description: "Lecture 01 — live-coding (React 19 + Next.js 16)",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pl">
      <body>
        <nav>
          <Link href="/">Recipes</Link>
          <Link href="/cuisine/japanese">Japanese</Link>
          <Link href="/about">About</Link>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
