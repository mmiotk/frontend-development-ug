# Rozszerzenia do slajdu 03: Komponent, który czeka na dane

Powrót: [`slide_03_async-server-component.md`](../slide_03_async-server-component.md)

## Rozszerzenie: status 200 z dokumentem HTML

Nagłówek `Content-Type` pozwala wyłapać przypadek, którego `res.ok` nie widzi. Żądanie pod adres strony `/new` zamiast pod adres API dostaje status 200, bo strona istnieje.

```js
// Przykład spoza demo: adres strony zamiast adresu API
const res = await fetch(`${BASE_URL}/new`);
console.log(res.ok, res.headers.get("content-type")); // → true text/html; charset=utf-8
await res.json(); // → SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON

// sprawdzenie przed res.json() nazywa przyczynę zamiast skutku
const type = res.headers.get("content-type") ?? "";
if (!type.includes("application/json")) throw new Error(`Expected JSON, got ${type}`);
// → Error: Expected JSON, got text/html; charset=utf-8
```

Odpowiedzi Route Handlera mają nagłówek `application/json`, więc poprawne wywołanie przechodzi przez sprawdzenie bez zmian.

## Rozszerzenie: wynik każdego żądania osobno

Dla wyróżnionego artykułu zasada „wszystko albo nic” z `Promise.all` jest zbyt surowa, bo lista mogłaby się wyświetlić bez niego. Dokumentacja Next.js wskazuje na taki przypadek `Promise.allSettled`, którego działanie opisuje MDN:

> **„Zwrócony obiekt Promise zostaje spełniony, gdy rozstrzygną się wszystkie wejściowe obiekty Promise, a jego wartością jest tablica obiektów opisujących wynik każdego z nich.”**
>
> *„This returned promise fulfills when all of the input's promises settle […], with an array of objects that describe the outcome of each promise.”*
>
> — MDN Web Docs, *Promise.allSettled()*

```jsx
// Przykład spoza demo: lista i wyróżniony artykuł, który nie istnieje
async function fetchJson(path) {
  const res = await fetch(`${BASE_URL}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`);
  return res.json();
}
const [list, featured] = await Promise.allSettled([fetchJson("/api/articles"), fetchJson("/api/articles/99")]);
console.log(list.status, featured.status); // → fulfilled rejected
console.log(featured.reason.message);      // → Failed to fetch /api/articles/99: 404
// JSX: {featured.status === "fulfilled" ? <h2>{featured.value.title}</h2> : <p>Featured article unavailable</p>}
```

Spełniony wynik niesie dane w `value`, odrzucony powód w `reason`, więc strona pokazuje trzy tytuły i komunikat „Featured article unavailable”.

## Rozszerzenie: limit czasu dla `fetch`

`res.ok` pomaga, gdy odpowiedź przyszła. Wywołanie `fetch` bez limitu czeka natomiast tak długo jak serwer, a razem z nim czeka render strony. Według MDN metoda statyczna `AbortSignal.timeout()` zwraca sygnał, który sam przerywa operację po zadanym czasie.

```js
// Przykład spoza demo: Route Handler /api/slow odpowiada po 300 ms
await fetch(`${BASE_URL}/api/slow`, { signal: AbortSignal.timeout(100) });
// → TimeoutError: The operation was aborted due to timeout
const res = await fetch(`${BASE_URL}/api/slow`, { signal: AbortSignal.timeout(1000) });
console.log(res.status); // → 200
```

W `fetchArticles` taki sygnał zamienia zawieszoną stronę na zwykły wyjątek, który obsługuje `error.jsx`.

## Rozszerzenie: zmienna, której zabrakło

Zapis `process.env.BASE_URL ?? "http://localhost:3000"` zakłada, że API leży pod tym samym adresem co strona. Serwer uruchomiony na innym porcie albo na innej maszynie bez ustawionej zmiennej wysyła więc żądanie pod `localhost:3000`, gdzie nic nie nasłuchuje.

```js
// Przykład spoza demo: żądanie pod port, na którym nic nie nasłuchuje
try {
  await fetch("http://localhost:3000/api/articles");
} catch (e) {
  console.log(e.message, e.cause.code); // → fetch failed ECONNREFUSED
}

// komponent kliencki ("use client") po next build z BASE_URL i NEXT_PUBLIC_SITE_NAME
<p>{String(process.env.BASE_URL)} | {process.env.NEXT_PUBLIC_SITE_NAME}</p> // → undefined | Articles Viewer
```

Komunikat nie wspomina o zmiennej środowiskowej, więc przyczyny szuka się w konfiguracji, a nie w kodzie strony. Do przeglądarki trafiają wyłącznie zmienne z przedrostkiem `NEXT_PUBLIC_`, wpisywane w pliki przy budowaniu.
