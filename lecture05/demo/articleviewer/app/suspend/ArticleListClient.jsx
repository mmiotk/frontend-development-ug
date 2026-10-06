// app/suspend/ArticleListClient.jsx
"use client";
import { use } from "react";

export default function ArticleListClient({ promise }) {
  // use() suspends this component until the promise resolves
  const articles = use(promise);

  return (
    <ul>
      {articles.map((a) => (
        <li key={a.id}>
          {a.title} — {a.author}
        </li>
      ))}
    </ul>
  );
}
