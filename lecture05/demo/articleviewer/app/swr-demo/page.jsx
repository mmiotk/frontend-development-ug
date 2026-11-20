// Komponent kliencki: listę pobiera przeglądarka po załadowaniu skryptu,
// więc HTML z serwera ma tylko napis ładowania, bez tytułów artykułów.
"use client"; // hooki SWR działają tylko w komponencie klienckim

import useSWR from "swr";

// fetcher dostaje klucz (tu adres) i zwraca Promise z danymi;
// nie sprawdza r.ok, więc odpowiedź 404 z JSON-em trafi do data
const fetcher = (url) => fetch(url).then((r) => r.json());

export default function SwrDemoPage() {
  const { data: articles, error, isLoading } = useSWR(
    "/api/articles", // klucz: nazwa wpisu w pamięci i argument fetchera
    fetcher,
    // odpytywanie: nowe pobranie 5 s po końcu poprzedniego, także wtedy,
    // gdy nic się nie zmieniło; w ukrytej karcie SWR nie odpytuje
    { refreshInterval: 5000 }, // ponowne pobranie co 5 sekund
  );

  if (isLoading) return <p>Loading (SWR)...</p>; // brak danych, trwa pobranie
  if (error) return <p>Error: {error.message}</p>; // fetcher rzucił wyjątek

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
