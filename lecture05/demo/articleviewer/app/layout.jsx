// Layout obejmuje każdą stronę i zostaje na ekranie przy przejściach,
// więc pasek nawigacji widać także wtedy, gdy strona czeka albo padnie.
import Link from "next/link";

// tytuł karty przeglądarki dla wszystkich stron
export const metadata = { title: "Articles" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* Link zmienia stronę bez przeładowania dokumentu */}
        <nav>
          <Link href="/">Articles</Link> | <Link href="/new">Add</Link>
        </nav>
        {children}
      </body>
    </html>
  );
}
