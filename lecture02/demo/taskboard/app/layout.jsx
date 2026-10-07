// Root layout — shared HTML shell for every route.
import "./globals.css";

export const metadata = {
  title: "Task Board — Demo L02",
  description: "Live-coding demo: state and hooks (React 19 + Next.js 16)",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  );
}
