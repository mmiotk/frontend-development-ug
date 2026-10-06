// Nested layout — rendered INSIDE RootLayout, wraps every /issue/* route.
// Demonstrates layout composition: RootLayout > IssueLayout > Page.
import Link from "next/link";

export default function IssueLayout({ children }) {
  return (
    <section>
      <p>
        <Link href="/">← Back to issues</Link>
      </p>
      {children}
    </section>
  );
}
