// Root layout — HTML shell shared by every route.
// Navigation uses Link: client-side navigation, no full page reload.
import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "Issue Tracker — Demo L03",
  description: "Live-coding demo: routing and forms (React 19 + Next.js 16)",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pl">
      <body>
        <nav>
          <Link href="/">Issues</Link>
          {" | "}
          <Link href="/new">+ New Issue</Link>
          {" | "}
          <Link href="/new-rhf">+ New (RHF)</Link>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
