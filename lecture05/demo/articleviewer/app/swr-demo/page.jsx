// app/swr-demo/page.jsx — pełna wersja
"use client";

import useSWR from "swr";

const fetcher = (url) => fetch(url).then((r) => r.json());

export default function SwrDemoPage() {
  const { data: articles, error, isLoading, mutate } = useSWR("/api/articles", fetcher, {
    refreshInterval: 5000,
  });

  async function handleAddTest() {
    await fetch("/api/articles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Test SWR " + Date.now(),
        author: "SWR User",
        body: "Article added directly via fetch + SWR mutate revalidation.",
      }),
    });
    mutate(); // tell SWR: re-fetch now, don't wait for refreshInterval
  }

  if (isLoading) return <p>Ładowanie (SWR)...</p>;
  if (error) return <p>Błąd: {error.message}</p>;

  return (
    <div>
      <h1>Artykuły — SWR</h1>
      <button onClick={handleAddTest}>Dodaj testowy artykuł</button>
      <ul>
        {articles.map((a) => (
          <li key={a.id}>
            {a.title} — {a.author}
          </li>
        ))}
      </ul>
    </div>
  );
}
