// Widok, gdy IssueDetailPage rzuci nieobsłużony wyjątek.
// MUSI mieć "use client": granice błędów Reacta działają w przeglądarce.
// retry() (Next.js 16.3+) pobiera segment od nowa i renderuje go ponownie.
"use client";

// error: obiekt wyjątku; retry: funkcja od Next.js do ponownej próby.
export default function IssueError({ error, retry }) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <button onClick={retry}>Try again</button>
    </div>
  );
}
