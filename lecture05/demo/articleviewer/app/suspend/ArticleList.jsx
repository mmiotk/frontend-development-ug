// app/suspend/ArticleList.jsx
"use client";
import { use } from "react";

export default function ArticleList({ promise }) {
  const articles = use(promise); // czeka, aż Promise z serwera się rozstrzygnie
  return (
    <ul>
      {articles.map((a) => (
        <li key={a.id}>{a.title}</li>
      ))}
    </ul>
  );
}
