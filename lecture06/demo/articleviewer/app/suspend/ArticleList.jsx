// Komponent kliencki: dostaje Promise z serwera i czyta go przez use.
// Kod jak dla gotowej tablicy, czekanie obsługuje <Suspense> wyżej.
"use client";
import { use } from "react";

export default function ArticleList({ promise }) {
  const articles = use(promise); // zawiesza komponent do nadejścia danych
  return (
    <ul>
      {articles.map((a) => (
        <li key={a.id}>{a.title}</li> // same tytuły, choć dane mają body
      ))}
    </ul>
  );
}
