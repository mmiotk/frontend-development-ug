// Ekran zamiast strony, która rzuciła wyjątek. Nazwa Error przesłania
// wbudowaną klasę, co nie przeszkadza, bo plik nie tworzy wyjątków.
"use client"; // granica błędów działa w przeglądarce

export default function Error({ error, retry }) {
  return (
    <div>
      <p>Error: {error.message}</p>
      {/* retry() pobiera stronę od nowa (Next.js 16.3+) */}
      <button onClick={() => retry()}>Try again</button>
    </div>
  );
}
