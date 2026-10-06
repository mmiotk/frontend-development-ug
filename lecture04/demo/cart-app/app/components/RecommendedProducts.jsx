'use client';

import { use } from 'react';

// This component suspends until the promise resolves.
// Must be wrapped in <Suspense fallback={...}> by its parent.
// If the promise rejects, the nearest ErrorBoundary catches the error.
export default function RecommendedProducts({ recommendedPromise }) {
  const recommended = use(recommendedPromise); // suspends here until resolved

  return (
    <section>
      <h3>Polecamy również</h3>
      <ul>
        {recommended.map(p => (
          <li key={p.id}>
            {p.name} — {p.price.toFixed(2)} zł
          </li>
        ))}
      </ul>
    </section>
  );
}
