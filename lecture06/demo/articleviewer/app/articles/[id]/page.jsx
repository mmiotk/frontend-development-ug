// Komponent serwerowy czyta magazyn zwykłym wywołaniem funkcji: bez fetch,
// bez adresu i bez JSON-u, bo to API nie ma tu innych odbiorców.
import { notFound } from "next/navigation";
import { getArticle } from "@/lib/store";

export default async function ArticlePage({ params }) {
  const { id } = await params; // w Next.js 16 params to Promise
  const article = getArticle(id); // id z adresu jest napisem, np. "1"
  if (!article) notFound(); // widok „nie znaleziono”

  return (
    <main>
      <h1>{article.title}</h1>
      <p>{article.body}</p>
    </main>
  );
}
