// app/error.jsx
"use client";

export default function Error({ error, retry }) {
  return (
    <div>
      <p>Błąd: {error.message}</p>
      {/* retry() fetches the segment again (Next.js 16.3+); reset() would only re-render it */}
      <button onClick={() => retry()}>Spróbuj ponownie</button>
    </div>
  );
}
