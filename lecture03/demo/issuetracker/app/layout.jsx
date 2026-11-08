// app/layout.jsx
import Link from "next/link";

export const metadata = { title: "Issue Tracker" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <nav>
          <Link href="/">Issues</Link> | <Link href="/new">New</Link> | <Link href="/new-rhf">New (RHF)</Link>
        </nav>
        {children}
      </body>
    </html>
  );
}
