'use client';

import { Suspense } from 'react';
import { fetchRecommended } from '../lib/fakeApi';
import RecommendedProducts from './RecommendedProducts';
import ErrorBoundary from './ErrorBoundary';

// Promise created at module level — once, when this module is first imported,
// not on every render. A promise created in the component that calls use()
// would be recreated on every retry, and that component would suspend forever.
// To demo ErrorBoundary: change to fetchRecommended(true) → promise rejects → boundary catches.
const recommendedPromise = fetchRecommended();

export default function RecommendedSection() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<p>Ładowanie rekomendacji...</p>}>
        <RecommendedProducts recommendedPromise={recommendedPromise} />
      </Suspense>
    </ErrorBoundary>
  );
}
