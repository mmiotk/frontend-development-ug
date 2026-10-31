# Rozszerzenia do slajdu 06: Jak długo serwer pamięta odpowiedź

Powrót: [`slide_06_cache-fetch.md`](../slide_06_cache-fetch.md)

## Rozszerzenie: konfiguracja całego segmentu

Zamiast opcji przy każdym `fetch` można ustawić zachowanie całej strony eksportem z `page.jsx` albo `layout.jsx`.

```js
// rozszerzenie spoza demo: konfiguracja segmentu, eksport na poziomie modułu
export const revalidate = 30; // ISR dla całego segmentu
// export const dynamic = "force-dynamic"; // odpowiednik cache: "no-store"
```

**`export const revalidate = 30`** ustawia domyślny czas odświeżania strony, ale nie nadpisuje wartości z pojedynczego `fetch`. Najniższa wartość spośród layoutów i stron jednej trasy wyznacza częstotliwość odświeżania całej trasy. Wartość musi być stałą liczbą: `600` przejdzie, a `60 * 10` już nie, bo Next.js odczytuje ją z kodu w czasie budowania. **`export const dynamic = "force-dynamic"`** każe renderować stronę przy każdym żądaniu.

## Rozszerzenie: dane spoza `fetch` i deduplikacja

`ArticlePage` czyta magazyn wywołaniem `getArticle(id)`, bez `fetch`, więc żadna z opcji powyżej jej nie dotyczy. Dla takich funkcji model oparty na opcjach `fetch` ma `unstable_cache` z `next/cache`. Bugl uspokaja co do nazwy: „mimo nazwy tej funkcji można już bezpiecznie używać w produkcji” (*„Despite its name, this function can already safely be used in production.”*). Dokumentacja Next.js 16 ma do niej nowszą uwagę: API zostało zastąpione dyrektywą `use cache`, częścią opcjonalnego modelu Cache Components, z którego ta aplikacja nie korzysta.

```js
// Przykład spoza demo: odczyt magazynu przez unstable_cache na stronie z connection()
import { unstable_cache } from "next/cache";
const getCachedArticles = unstable_cache(async () => getArticles(), ["articles"], { revalidate: 30 });
const articles = await getCachedArticles(); // pierwsze wejście → 3
// po POST /api/articles: API → 4 artykuły, strona dalej → 3 (wynik z pamięci)
```

Osobnym mechanizmem jest **deduplikacja żądań** (w dokumentacji *request memoization*, bez związku z `useMemo`). Według dokumentacji `fetch` żądania `GET` z tym samym adresem i opcjami wykonują się w trakcie jednego przebiegu renderu raz.

```jsx
// Przykład spoza demo: dwa komponenty serwerowe z tym samym fetch
async function ArticleCount() {
  const articles = await fetch(`${BASE_URL}/api/articles`).then((r) => r.json());
  return <p>{articles.length} articles</p>;
}
async function ArticleTitles() {
  const articles = await fetch(`${BASE_URL}/api/articles`).then((r) => r.json());
  return <ul>{articles.map((a) => <li key={a.id}>{a.title}</li>)}</ul>;
}
// <ArticleCount /> i <ArticleTitles /> na jednej stronie → jedno GET /api/articles w logu serwera
```

Dzięki temu dane pobiera się w komponencie, który ich potrzebuje, zamiast przekazywać je przez propsy. Deduplikacja nie działa w Route Handlerach, bo te nie należą do drzewa komponentów.

## Rozszerzenie: nagłówki i pliki pamięci czasowej

Pamięć czasowa zmienia też wynik buildu. Strona `/` bez `connection()`, z samym `revalidate: 30` przy `fetch`, renderuje się już przy budowaniu.

```js
// Przykład spoza demo: app/page.jsx bez await connection()
const res = await fetch(`${BASE_URL}/api/articles`, { next: { revalidate: 30 } });
```

```text
$ next build
Route (app)             Revalidate  Expire
┌ ○ /                          30s      1y
$ curl -sI localhost:3000/ | grep -i cache-control
Cache-Control: s-maxage=30, stale-while-revalidate=31535970
```

Druga liczba w nagłówku to rok w sekundach pomniejszony o 30. Dokumentacja opcji `expireTime` w `next.config.js` wyjaśnia, że ten nagłówek jest przeznaczony dla sieci CDN (*Content Delivery Network*), czyli serwerów pośrednich trzymających kopie odpowiedzi blisko użytkowników.

Pamięć `fetch` żyje poza procesem pojedynczego żądania: zapisane odpowiedzi leżą jako pliki w katalogu `.next/cache/fetch-cache`. Przewodnik *How Revalidation Works* nazywa to domyślną pamięcią w systemie plików, wystarczającą dla jednej instancji serwera. Pamięć przeżywa restart serwera, a magazyn artykułów nie. Po restarcie `/api/articles` zwraca znowu trzy wpisy, a strona `/` nadal pokazuje „Artykuły (4)” z zapisanej odpowiedzi. Ten sam przewodnik dodaje, że przy rewalidacji trasy Next.js generuje od nowa zarówno HTML, jak i RSC Payload, i trzyma je w jednym wpisie.

## Rozszerzenie: pamięć w trybie deweloperskim

Twarde odświeżenie (Ctrl+Shift+R) albo zaznaczone „Disable cache” w narzędziach przeglądarki wysyłają nagłówek `cache-control: no-cache`. Według dokumentacji `next dev` ignoruje wtedy opcje `cache`, `revalidate` i `tags`.

```js
// Przykład spoza demo: strona /dev-cache pod next dev
const res = await fetch(`${BASE_URL}/api/articles`, { cache: "force-cache" });
// po POST /api/articles (4 artykuły w magazynie):
// zwykłe żądanie                     → Articles (3), odpowiedź z pamięci
// żądanie z cache-control: no-cache  → Articles (4)
// zwykłe żądanie potem               → Articles (4), wpis w pamięci nadpisany

// Przykład spoza demo: sprzeczne opcje w jednym wywołaniu
await fetch(`${BASE_URL}/api/articles`, { cache: "no-store", next: { revalidate: 3600 } });
// → w terminalu next dev: ⚠ Specified "cache: no-store" and "revalidate: 3600", only one should be specified.
```

Przy `force-cache` lista po twardym odświeżeniu wygląda więc na świeżą, a efekt pamięci widać tylko przy zwykłym odświeżeniu przed takim żądaniem.
