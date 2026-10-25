// Layout główny: powłoka HTML wspólna dla wszystkich tras.
// Nawigacja używa Link: przejście po stronie klienta, bez przeładowania strony.
import "./globals.css";                      // arkusz ładowany raz, dla całej aplikacji
import Link from "next/link";                // komponent linku z Next.js

export const metadata = {                    // obiekt, z którego Next.js składa <head>
  title: "Issue Tracker — Demo L03",
  description: "Live-coding demo: routing and forms (React 19 + Next.js 16)", // opis strony w <head>
};

export default function RootLayout({ children }) {  // children: strona bieżącego adresu
  return (
    <html lang="en">
      <body>
        <nav>                                {/* poza <main>: wspólne dla każdej trasy */}
          <Link href="/">Issues</Link>
          {" | "}                            {/* napis w klamrach, żeby JSX nie przyciął spacji */}
          <Link href="/new">+ New Issue</Link>
          {" | "}
          <Link href="/new-rhf">+ New (RHF)</Link>
        </nav>
        <main>{children}</main>              {/* tu Next.js wstawia stronę bieżącego adresu */}
      </body>
    </html>
  );
}
