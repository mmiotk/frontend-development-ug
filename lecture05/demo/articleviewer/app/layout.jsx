// app/layout.jsx
import Link from "next/link";

export const metadata = { title: "Articles Viewer" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <nav>
          <Link href="/">Articles</Link>
          {" | "}
          <Link href="/new">Add</Link>
          {" | "}
          <Link href="/suspend">use() demo</Link>
          {" | "}
          <Link href="/swr-demo">SWR demo</Link>
        </nav>
        <hr />
        {children}
      </body>
    </html>
  );
}
