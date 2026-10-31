# Rozszerzenia do slajdu 05: Promise z serwera, odczyt w przeglądarce

Powrót: [`slide_05_promise-z-serwera.md`](../slide_05_promise-z-serwera.md)

## Rozszerzenie: jeden Promise, kilku odbiorców

Ten sam Promise może trafić do kilku komponentów, na przykład do listy tytułów i do licznika artykułów obok nagłówka.

```jsx
// Przykład spoza demo: jeden Promise, dwa komponenty klienckie z use()
const articlesPromise = fetch(`${BASE_URL}/api/articles`, { cache: "no-store" }).then((r) => r.json());
return (
  <div>
    <Suspense fallback={<p>Counting…</p>}>
      <ArticleCount promise={articlesPromise} /> {/* use(promise), potem <p>{articles.length} articles</p> */}
    </Suspense>
    <Suspense fallback={<p>Loading list…</p>}>
      <ArticleListClient promise={articlesPromise} />
    </Suspense>
  </div>
);
// → jedno żądanie GET /api/articles w logu serwera, w HTML „3 articles” i trzy tytuły
```

Przewodnik *Streaming* zaznacza, że Promise można przekazywać przez dowolnie wiele poziomów. Granicy `<Suspense>` potrzebuje tylko komponent, który wywołuje `use`. Gdy odbiorców jest wielu i leżą głęboko, przewodnik podaje wzorzec z kontekstem:

> **„Gdy kilka komponentów potrzebuje tych samych danych, pobieranie zaczyna się raz, a Promise przekazuje się przez dostawcę kontekstu, tak żeby każdy komponent w poddrzewie mógł go rozpakować przez `use()`.”**
>
> *„When multiple components need the same data, start the fetch once and pass the promise through a context provider so any component in the subtree can resolve it with `use()`”*
>
> — dokumentacja Next.js, *Streaming*

W kontekście leży wtedy sam Promise. Dostawca nie czeka na nic, więc nie wstrzymuje renderu poddrzewa. Zawiesza się dopiero komponent, który wywoła `use`. Odbiorcy pod osobnymi granicami pokazują treść niezależnie, a każda granica jest według przewodnika osobną jednostką hydratacji.

## Rozszerzenie: strumień po drodze do przeglądarki

Strumień może zniknąć między serwerem a przeglądarką. Przewodnik *Streaming* ostrzega, że każda warstwa, która zbiera odpowiedź w całości przed wysłaniem, odbiera mu sens. Serwer pośredniczący (*reverse proxy*), czyli program przyjmujący żądania przed aplikacją, na przykład Nginx, domyślnie tak robi, a przewodnik wyłącza to nagłówkiem `X-Accel-Buffering: no`.

```js
// Przykład spoza demo: next.config.js, nagłówek dla każdej trasy
const nextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: [{ key: "X-Accel-Buffering", value: "no" }] }];
  },
};
module.exports = nextConfig;
```

```text
$ curl -s -o /dev/null -w "%{time_starttransfer}\n" localhost:3000/stream   # wprost
0.009
$ curl -s -o /dev/null -w "%{time_starttransfer}\n" localhost:3001/stream   # przez pośrednik z buforem
1.024
```

Strona `/stream` ma pod granicą `<Suspense>` komponent, który czeka sekundę, więc za buforującym pośrednikiem TTFB wraca do czasu najwolniejszego zapytania, choć aplikacja strumieniuje poprawnie.
