// app/suspend/page.jsx
// Server Component — creates Promise but does NOT await it
import { Suspense } from "react";
import ArticleListClient from "./ArticleListClient";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";

export default function SuspendPage() {
  // Promise created here — NOT awaited — passed as prop to Client Component
  const articlesPromise = fetch(`${BASE_URL}/api/articles`, {
    cache: "no-store",
  }).then((r) => r.json());

  return (
    <div>
      <h1>Artykuły — use() + Suspense</h1>
      <Suspense fallback={<p>Suspense czeka na dane...</p>}>
        <ArticleListClient promise={articlesPromise} />
      </Suspense>
    </div>
  );
}
