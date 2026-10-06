// Root layout — shared HTML shell for every route.
import "./globals.css";

export const metadata = {
  title: "Task Board — Demo L02",
  description: "Lecture 02 — live-coding: hooks (React 19 + Next.js 16)",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  );
}
