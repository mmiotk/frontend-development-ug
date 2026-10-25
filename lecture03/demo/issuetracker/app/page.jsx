// Lista zgłoszeń jako komponent kliencki, bo czyta zmienny magazyn z przeglądarki.
// getIssues() wywołuje się przy każdym montowaniu; po nawigacji po stronie klienta
// komponent montuje się od nowa i widzi nowo dodane zgłoszenia.
"use client";
import Link from "next/link";
import { getIssues } from "./lib/store";

export default function HomePage() {
  const issues = getIssues(); // odczyt tablicy z modułu przy każdym renderze

  return (
    <div>
      <h1>Issue Tracker</h1>
      <ul>
        {issues.map((issue) => (                 // jeden <li> na zgłoszenie
          <li key={issue.id}>                    {/* klucz z danych, stały między renderami */}
            <Link href={`/issue/${issue.id}`}>   {/* adres budowany z danych */}
              [{issue.priority}] {issue.title}
            </Link>
            {" — "}                              {/* status poza linkiem, jako zwykły tekst */}
            {issue.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
