// Komponent serwerowy bez "use client": działa tylko na serwerze, więc może
// być funkcją async i przez await czekać na dane, zanim wyśle HTML.
import Link from "next/link";
// connection: render tej strony zawsze przy żądaniu, nigdy w next build
import { connection } from "next/server";

// na serwerze nie ma bieżącej strony, więc fetch potrzebuje pełnego adresu
const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";

// Strona renderuje się przy każdym żądaniu, ale lista przez 60 s
// pochodzi z pamięci fetch, więc kolejne wejścia nie pytają API.
export default async function HomePage() {
  await connection(); // bez tego next build pytałby API przy budowaniu
  const res = await fetch(`${BASE_URL}/api/articles`, {
    next: { revalidate: 60 }, // odpowiedź API zapamiętana na 60 s
  });
  // kod 404 albo 500 nie odrzuca fetch, więc status sprawdza się ręcznie
  if (!res.ok) throw new Error(`Failed to fetch articles: ${res.status}`);
  const articles = await res.json(); // tekst JSON z powrotem w tablicę

  return (
    <main>
      <h1>Articles ({articles.length})</h1>
      {/* każdy tytuł prowadzi do strony /articles/1, /articles/2 itd. */}
      <ul>
        {articles.map((a) => (
          // key: stały numer artykułu, po którym React rozpoznaje element
          <li key={a.id}>
            <Link href={`/articles/${a.id}`}>{a.title}</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
