// Layout zagnieżdżony: renderuje się WEWNĄTRZ RootLayout i otacza każdą trasę /issue/*.
// Pokazuje składanie layoutów: RootLayout > IssueLayout > strona.
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
