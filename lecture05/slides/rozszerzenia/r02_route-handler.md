# Rozszerzenia do slajdu 02: Własne API w katalogu `app/api`

Powrót: [`slide_02_route-handler.md`](../slide_02_route-handler.md)

## Rozszerzenie: metody bezpieczne i idempotentne

Słownik MDN nazywa dwie własności metod. Metoda jest **bezpieczna** (*safe*), gdy „nie zmienia stanu serwera” (*„doesn't alter the state of the server”*): `GET`, `HEAD` i `OPTIONS`. Metoda jest **idempotentna** (*idempotent*), gdy kilka identycznych żądań ma ten sam zamierzony skutek co jedno. Idempotentne są metody bezpieczne oraz `PUT` i `DELETE`. `POST` tej gwarancji nie ma.

```bash
# Przykład spoza demo: dwa identyczne POST-y dopisują dwa artykuły
for i in 1 2; do
  curl -s -X POST localhost:3000/api/articles -H "Content-Type: application/json" \
    -d '{"title":"Caching in Next.js","author":"Alice","body":"Notes about fetch cache."}'
done
# → {"id":4,"title":"Caching in Next.js",…}
# → {"id":5,"title":"Caching in Next.js",…}
```

Dwa `GET`-y przed zapisem zwróciły tę samą listę trzech artykułów, dlatego klient może ponowić `GET` po zerwanym połączeniu, a `POST` nie. Według MDN <u>pilnowanie tej umowy należy do aplikacji</u>, bo serwer nie zabroni funkcji `GET` zapisywać danych.

## Rozszerzenie: odpowiedź 400 i nagłówek `Location`

Zły format ciała to błąd klienta, więc odpowiada się na niego kodem 400. Kod 201 ma też drugą stronę: według MDN nowy zasób musi dać się znaleźć pod adresem z nagłówka `Location`. Wariant spoza demo:

```js
// Rozszerzenie spoza demo: 400 przy złym JSON-ie i nagłówek Location
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const article = addArticle(body);
  return NextResponse.json(article, {
    status: 201,
    headers: { Location: `/api/articles/${article.id}` }, // adres nowego zasobu
  });
}
```

Ciało `{"title":` daje teraz `400 Bad Request`, a poprawny artykuł `201 Created` z nagłówkiem `location`, na przykład `/api/articles/5`. Sprawdzenie, czy obiekt ma właściwe pola, to osobny krok, którego ten wariant nadal nie robi.

## Rozszerzenie: filtr `?author=`

Część adresu po znaku `?` czyta się z obiektu żądania. W Route Handlerze `request` jest obiektem **`NextRequest`**, który ma przetworzony adres w polu `nextUrl`:

```js
// Rozszerzenie spoza demo: filtr po parametrze ?author=
export async function GET(request) {
  const author = request.nextUrl.searchParams.get("author"); // null, gdy parametru brak
  const articles = getArticles();
  return NextResponse.json(author ? articles.filter((a) => a.author === author) : articles);
}
```

Adres z `?author=Alice` zwraca jeden artykuł, a `?author=Nikt` pustą tablicę z kodem 200. Pusta lista jest poprawnym wynikiem wyszukiwania, więc nie jest przypadkiem dla 404.

## Rozszerzenie: nagłówki i ciasteczka żądania

Route Handler może czytać nagłówki i ciasteczka. `request.headers` daje standardowy obiekt `Headers`, a `request.cookies` ciasteczka.

```js
// Przykład spoza demo: app/api/whoami/route.js
import { NextResponse } from "next/server";

export async function GET(request) {
  const agent = request.headers.get("user-agent");
  const token = request.cookies.get("token")?.value ?? null; // null, gdy ciasteczka brak
  // nagłówek odpowiedzi ustawia się w nowym obiekcie odpowiedzi
  return NextResponse.json({ agent, token }, { headers: { "X-Has-Token": token ? "yes" : "no" } });
}
```

```text
$ curl -i -H "Cookie: token=abc123" localhost:3000/api/whoami
x-has-token: yes
{"agent":"curl/8.5.0","token":"abc123"}
$ curl -i localhost:3000/api/whoami
x-has-token: no
{"agent":"curl/8.5.0","token":null}
```

Te same dane zwracają funkcje `headers()` i `cookies()` z `next/headers`, a obiekt z `headers()` służy według dokumentacji tylko do odczytu. W `articleviewer` w tym miejscu stałoby sprawdzenie tokenu w API dla aplikacji zewnętrznych.

## Rozszerzenie: odpowiedź dla innej domeny

Przeglądarka pilnuje, kto czyta odpowiedź. Skrypt może odczytać odpowiedź tylko z tego samego **pochodzenia** (*origin*), czyli z tej samej kombinacji schematu, domeny i portu. MDN opisuje **CORS** (*Cross-Origin Resource Sharing*) jako mechanizm oparty na nagłówkach HTTP, którym serwer wskazuje inne pochodzenia, z których przeglądarka może ładować jego zasoby.

```js
// Przykład spoza demo: app/api/public/route.js, lista dla strony z innego portu
import { NextResponse } from "next/server";
import { getArticles } from "@/lib/store";

export async function GET() {
  return NextResponse.json(getArticles(), {
    headers: { "Access-Control-Allow-Origin": "http://localhost:3001" }, // dozwolone pochodzenie
  });
}
// w przeglądarce na http://localhost:3001:
// await fetch("http://localhost:3000/api/articles") → TypeError: Failed to fetch
// await fetch("http://localhost:3000/api/public")   → status 200, trzy artykuły
```

Konsola pod pierwszym wywołaniem pisze „No 'Access-Control-Allow-Origin' header is present on the requested resource.”. `curl` dostaje obie odpowiedzi bez przeszkód, bo CORS jest regułą przeglądarki, a nie serwera.
