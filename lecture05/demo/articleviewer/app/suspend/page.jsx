// Komponent serwerowy bez async: zaczyna pobieranie i nie czeka na wynik.
// Nagłówek stoi poza <Suspense>: trafia do pierwszego kawałka odpowiedzi.
import { Suspense } from "react";
import ArticleList from "./ArticleList";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";

export default function SuspendPage() {
  // bez await: żądanie już trwa, a w zmiennej jest Promise
  const promise = fetch(`${BASE_URL}/api/articles`, { cache: "no-store" })
    .then((r) => r.json()); // do przeglądarki idą dane, nie obiekt Response

  return (
    <main>
      <h1>Articles with use()</h1>
      {/* treść zastępcza tylko w miejscu listy */}
      <Suspense fallback={<p>Waiting for data...</p>}>
        <ArticleList promise={promise} />
      </Suspense>
    </main>
  );
}
