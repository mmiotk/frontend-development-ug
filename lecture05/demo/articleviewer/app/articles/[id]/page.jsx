// app/articles/[id]/page.jsx
// Komponent serwerowy: dane prosto z magazynu, bez żądania HTTP
import { notFound } from "next/navigation";
import { getArticle } from "@/lib/store";

export default async function ArticlePage({ params }) {
  const { id } = await params;
  const article = getArticle(id);
  if (!article) notFound(); // widok „nie znaleziono”

  return (
    <main>
      <h1>{article.title}</h1>
      <p>{article.body}</p>
    </main>
  );
}
