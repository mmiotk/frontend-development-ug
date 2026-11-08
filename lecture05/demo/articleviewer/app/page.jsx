// app/page.jsx
// Komponent serwerowy: bez "use client" wykonuje się tylko na serwerze
import Link from "next/link";
import { connection } from "next/server";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";

export default async function HomePage() {
  await connection(); // render przy żądaniu, nigdy w next build
  const res = await fetch(`${BASE_URL}/api/articles`, {
    next: { revalidate: 60 }, // odpowiedź API zapamiętana na 60 s
  });
  if (!res.ok) throw new Error(`Failed to fetch articles: ${res.status}`);
  const articles = await res.json();

  return (
    <main>
      <h1>Articles ({articles.length})</h1>
      <ul>
        {articles.map((a) => (
          <li key={a.id}>
            <Link href={`/articles/${a.id}`}>{a.title}</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
