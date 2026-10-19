// app/page.jsx
// Server Component — no "use client" directive = runs only on the server
import Link from "next/link";
import { connection } from "next/server";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";

async function fetchArticles() {
  const res = await fetch(`${BASE_URL}/api/articles`, {
    next: { revalidate: 60 }, // keep the response for 60 s
  });
  if (!res.ok) throw new Error(`Failed to fetch articles: ${res.status}`);
  return res.json();
}

export default async function HomePage() {
  console.log("HomePage render — server side"); // appears in the terminal; in dev, DevTools also shows it tagged "Server"
  await connection(); // render per request, never prerender at build time
  const articles = await fetchArticles();

  return (
    <div>
      <h1>Artykuły ({articles.length})</h1>
      <ul>
        {articles.map((article) => (
          <li key={article.id}>
            <Link href={`/articles/${article.id}`}>{article.title}</Link>
            {" — "}
            {article.author} ({article.createdAt})
          </li>
        ))}
      </ul>
    </div>
  );
}
