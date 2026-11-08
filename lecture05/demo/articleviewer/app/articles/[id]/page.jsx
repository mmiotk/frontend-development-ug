// app/articles/[id]/page.jsx
// Server Component — direct data access (no HTTP round-trip)
import { getArticle } from "@/lib/store";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function ArticlePage({ params }) {
  const { id } = await params;
  const article = getArticle(id);
  if (!article) notFound();

  return (
    <article>
      <Link href="/">← List</Link>
      <h1>{article.title}</h1>
      <p>
        Author: {article.author} | Date: {article.createdAt}
      </p>
      <p>{article.body}</p>
    </article>
  );
}
