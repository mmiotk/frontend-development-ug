// app/suspend/page.jsx
// Komponent serwerowy: tworzy Promise, ale na niego nie czeka
import { Suspense } from "react";
import ArticleList from "./ArticleList";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";

export default function SuspendPage() {
  const promise = fetch(`${BASE_URL}/api/articles`, { cache: "no-store" }).then((r) => r.json());

  return (
    <main>
      <h1>Articles with use()</h1>
      <Suspense fallback={<p>Waiting for data...</p>}>
        <ArticleList promise={promise} />
      </Suspense>
    </main>
  );
}
