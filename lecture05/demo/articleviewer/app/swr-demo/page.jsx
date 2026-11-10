// app/swr-demo/page.jsx
"use client"; // komponent kliencki: korzysta z hooków SWR

import useSWR from "swr";

const fetcher = (url) => fetch(url).then((r) => r.json());

export default function SwrDemoPage() {
  const { data: articles, error, isLoading } = useSWR("/api/articles", fetcher, {
    refreshInterval: 5000, // ponowne pobranie co 5 sekund
  });

  if (isLoading) return <p>Loading (SWR)...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h1>Articles — SWR</h1>
      <ul>
        {articles.map((a) => (
          <li key={a.id}>{a.title}</li>
        ))}
      </ul>
    </div>
  );
}
