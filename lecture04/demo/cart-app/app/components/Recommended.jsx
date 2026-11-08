'use client';

import { Suspense, use } from 'react';
import { fetchRecommended } from '../lib/fakeApi';
import ErrorBoundary from './ErrorBoundary';

// Created once, when the module loads, not on every render.
const recommendedPromise = fetchRecommended();

function RecommendedList() {
  const recommended = use(recommendedPromise); // waits for the data
  return (
    <ul>
      {recommended.map(p => (
        <li key={p.id}>{p.name} — {p.price.toFixed(2)} PLN</li>
      ))}
    </ul>
  );
}

export default function Recommended() {
  return (
    <section>
      <h2>You may also like</h2>
      <ErrorBoundary>
        <Suspense fallback={<p>Loading recommendations...</p>}>
          <RecommendedList />
        </Suspense>
      </ErrorBoundary>
    </section>
  );
}
