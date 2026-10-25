# Własne API w katalogu `app/api`

## Adres HTTP dla danych z magazynu

Kod w przeglądarce, skrypt w terminalu albo aplikacja mobilna nie zaimportują `lib/store.js`, więc potrzebują zwykłego adresu HTTP. W App Routerze taki adres daje **Route Handler**, czyli plik `route.js` z funkcjami nazwanymi jak metody HTTP.

> **„Route Handlery pozwalają tworzyć własne procedury obsługi żądań dla danej trasy, używając webowych API Request i Response.”**
>
> *„Route Handlers allow you to create custom request handlers for a given route using the Web Request and Response APIs.”*
>
> — dokumentacja Next.js, *Route Handlers*

Schwarzmüller w *React Key Concepts* opisuje taki plik krótko. To trasa, która „nie renderuje komponentów, tylko zwraca dane (na przykład w formacie JSON)” (*„do not render components but instead return data (e.g., in the JSON format)”*). Komponenty serwerowe API nie potrzebują, bo mogą wywołać funkcje magazynu bezpośrednio. Daniel Bugl w *Modern Full-Stack React Projects* zauważa jednak, że „czasem nadal ma sens wystawienie zewnętrznego API” (*„sometimes, it still makes sense to expose an external API”*). Jako przykład podaje aplikacje firm trzecich. W przeglądarce artykułów takim odbiorcą jest strona pobierająca dane po stronie klienta.

## Żądanie i odpowiedź HTTP

Protokół HTTP przesyła tekst w ustalonym układzie. **Żądanie** zaczyna się od linii z metodą, ścieżką i wersją protokołu. Pod nią stoją nagłówki, czyli pary „nazwa: wartość”, a po pustej linii opcjonalne ciało. **Odpowiedź** ma ten sam układ, tylko pierwsza linia niesie kod statusu:

```http
POST /api/articles HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{"title":"Nowy","author":"Ala","body":"Treść artykułu"}
```

```http
HTTP/1.1 201 Created
Content-Type: application/json

{"id":4,"title":"Nowy","author":"Ala","body":"Treść artykułu","createdAt":"2026-10-18"}
```

Adres wskazuje **zasób** (*resource*), na przykład kolekcję artykułów. **Metoda** mówi, co z nim zrobić: `GET` odczytuje, `POST` tworzy nowy element kolekcji, `PUT` i `PATCH` zmieniają istniejący element, a `DELETE` go usuwa. Banks i Porcello w *Learning React* streszczają to tak:

> **„Zwykle żądania POST używa się przy tworzeniu danych, a żądania PUT przy ich modyfikowaniu.”**
>
> *„Typically, we use a POST request when we’re creating data and a PUT request when we’re modifying it.”*
>
> — Alex Banks, Eve Porcello, *Learning React*

**Kod statusu** podaje wynik: 2xx oznacza sukces, 4xx błąd po stronie klienta, a 5xx błąd serwera. Nagłówek `Content-Type` mówi, w jakim formacie jest ciało. Dla danych jest to zwykle **JSON**, tekstowy zapis obiektów i tablic, który zna tylko napisy, liczby, wartości logiczne, `null`, tablice i zwykłe obiekty.

Każde żądanie HTTP jest samodzielne. Serwer nie pamięta poprzedniego żądania tego samego klienta, więc wszystko, czego potrzebuje do odpowiedzi, musi przyjść w adresie, nagłówkach albo ciele. Taki protokół nazywa się **bezstanowym** (*stateless*). Stan aplikacji żyje gdzie indziej: artykuły w magazynie serwera, a tożsamość użytkownika w ciasteczku, które przeglądarka dołącza do każdego żądania.

## `Request` i `Response` jako obiekty JavaScriptu

Route Handler nie czyta surowego tekstu. Next.js podaje mu żądanie jako obiekt `Request` i oczekuje w zamian obiektu `Response`. To te same klasy, których przeglądarka używa przy `fetch`, a Node.js ma je wbudowane.

```js
// odpowiedź z ciałem JSON, kodem 201 i ustawionym nagłówkiem
const res = Response.json({ ok: 1 }, { status: 201 });
res.status;                      // 201
res.headers.get("content-type"); // "application/json"

// żądanie z ciałem; json() czyta ciało i parsuje je, zwraca Promise
const req = new Request("http://x/", { method: "POST", body: '{"title":"A"}' });
await req.json(); // { title: "A" }
```

Metoda `json()` odrzuca Promise wyjątkiem `SyntaxError`, gdy ciało nie jest poprawnym JSON-em, na przykład z komunikatem „Unexpected end of JSON input” dla uciętego `{"title":` i dla pustego ciała. Nagłówka `Content-Type` metoda nie sprawdza, więc ciało formularza `title=A&author=B` też kończy się wyjątkiem, a nie innym sposobem odczytu.

## Który kod statusu dla którego wyniku

Kod statusu to pierwsza informacja, którą klient odczytuje, zanim zajrzy do ciała. Program, który nie zna struktury odpowiedzi, decyduje tylko na jego podstawie: czy pokazać dane, czy komunikat, czy ponowić próbę. Dlatego kod musi opisywać wynik zgodnie z umową, a nie z wygodą autora API.

W przeglądarce artykułów kody układają się według źródła problemu:

- **200** (*OK*): odczyt listy albo artykułu się udał.
- **201** (*Created*): powstał nowy zasób, czyli artykuł.
- **400** (*Bad Request*): ciała nie da się odczytać, winny jest klient i powtórzenie tego samego żądania nic nie zmieni.
- **404** (*Not Found*): artykułu o podanym numerze nie ma, choć samo żądanie jest poprawne.
- **500** (*Internal Server Error*): awaria, której serwer się nie spodziewał.

Po kodzie z grupy 5xx klient może spróbować ponownie, po kodzie z grupy 4xx powinien najpierw poprawić żądanie. Grupa 3xx oznacza przekierowanie: nagłówek `Location` odpowiedzi wskazuje inny adres, pod który klient ma przejść. <u>Kod statusu mówi, kto ma naprawić problem: klient przy 4xx, serwer przy 5xx.</u>

## Lista i nowy artykuł: `app/api/articles/route.js`

Plik leży w katalogu `app/api/articles/`, więc jego funkcje odpowiadają pod `/api/articles`:

```js
// app/api/articles/route.js
import { NextResponse } from "next/server";
import { getArticles, addArticle } from "@/lib/store"; // @/ to alias korzenia projektu

// nazwa funkcji = nazwa metody HTTP, wielkimi literami
export async function GET() {
  const articles = getArticles();
  return NextResponse.json(articles); // JSON, Content-Type i domyślny status 200
}

export async function POST(request) {
  const body = await request.json(); // ciało żądania jako obiekt
  const article = addArticle(body);
  return NextResponse.json(article, { status: 201 }); // 201 Created: zasób utworzony
}
```

**`NextResponse`** rozszerza standardową klasę `Response`. Bugl pisze, że Next.js „rozszerza je o API NextRequest i NextResponse, które ułatwiają obsługę ciasteczek i nagłówków” (*„extends them into NextRequest and NextResponse APIs, which make handling cookies and headers easier”*). Do zwrócenia JSON-u rozszerzenie nie jest potrzebne, bo standardowe `Response.json()` przyjmuje te same argumenty. Obie funkcje zamieniają tablicę na tekst przez `JSON.stringify`, ustawiają nagłówek `Content-Type: application/json` i wkładają ten tekst do ciała odpowiedzi. Klient odtwarza z niego tablicę przez `JSON.parse`, a przy `fetch` przez metodę `res.json()`. Między serwerem a klientem wędruje więc zapis tekstowy obiektów JavaScriptu.

`POST` nie łapie wyjątku z `request.json()`. Zły format ciała kończy się więc odpowiedzią 500 bez treści, a opis błędu trafia tylko do terminala serwera. Kod 500 oznacza tu błąd serwera, choć zły format wysłał klient. `POST` nie sprawdza też pól: obiekt `{"title":5}` zostanie zapisany jako artykuł z liczbą w tytule.

## Jeden artykuł: `app/api/articles/[id]/route.js`

Katalog w nawiasach kwadratowych tworzy segment dynamiczny, więc `/api/articles/2` trafia do drugiego pliku z parametrem `id` równym `"2"`:

```js
// app/api/articles/[id]/route.js
import { NextResponse } from "next/server";
import { getArticle } from "@/lib/store";

// drugi argument to kontekst; params jest w nim obiektem Promise
export async function GET(request, { params }) {
  const { id } = await params; // Next.js 16: params trzeba odczytać przez await
  const article = getArticle(id);
  if (!article) {
    // brak zasobu to zwykła odpowiedź z innym kodem
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(article);
}
```

`params` jest obiektem Promise, tak jak w komponencie strony. W Route Handlerze pominięcie `await` daje jednak mylący objaw. Zapis `const { id } = params;` zostawia `id` z wartością `undefined`, więc klient dostaje 404 także dla `/api/articles/1`. Dla klienta API taka odpowiedź wygląda jak brak artykułu. Prawdziwą przyczynę podaje tylko terminal serwera: „`params` is a Promise and must be unwrapped with `await` or `React.use()` before accessing its properties”.

## Rysunek 5.2 — droga żądania przez Route Handler

```mermaid
%%{init: {"flowchart": {"wrappingWidth": 360}}}%%
flowchart LR
    C["klient HTTP<br/>przeglądarka, curl"] --> R{"adres i metoda"}
    R -- "GET /api/articles" --> L["route.js: GET<br/>getArticles()"]
    R -- "GET /api/articles/1" --> D["[id]/route.js: GET<br/>await params, getArticle('1')"]
    R -- "DELETE /api/articles" --> X["405, puste ciało"]
    R -- "OPTIONS /api/articles" --> O["204 + allow:<br/>GET, HEAD, OPTIONS, POST"]
    L --> J["200 + tablica"]
    D -- "artykuł jest" --> J2["200 + obiekt"]
    D -- "artykułu brak" --> N["404 + { error }"]
```

Na Rysunku 5.2 klient wybiera adres i metodę, a Next.js na tej podstawie wskazuje plik i funkcję. Gałęzie `DELETE` i `OPTIONS` obsługuje sam framework, bez kodu w `route.js`. Metoda, której plik nie eksportuje, dostaje `405 Method Not Allowed` z pustym ciałem. MDN wymaga, żeby taka odpowiedź miała nagłówek `Allow` z listą metod, ale Next.js 16.4.0 go przy 405 nie wysyła. Listę podaje dopiero odpowiedź na `OPTIONS`, w nagłówku `allow`. Brak artykułu jest dla API zwykłą odpowiedzią z kodem 404. Co z nią zrobić, decyduje klient.

## Żądanie wysłane z terminala

API sprawdza się najprościej programem **`curl`**, który wysyła żądanie HTTP z terminala i wypisuje surową odpowiedź. Opcja `-i` dokłada nagłówki, `-X` wybiera metodę, `-H` dodaje nagłówek, a `-d` przekazuje ciało:

```bash
curl -i http://localhost:3000/api/articles/99
curl -X POST -H "Content-Type: application/json" \
  -d '{"title":"Z terminala","author":"Ala","body":"Treść artykułu wysłanego z terminala"}' \
  http://localhost:3000/api/articles
```

Na pierwsze polecenie serwer odpowiada linią `HTTP/1.1 404 Not Found` i ciałem `{"error":"Not found"}`. Drugie tworzy artykuł z `id` równym 4, więc od tej chwili `GET /api/articles` zwraca cztery pozycje. Taki test oddziela błędy API od błędów interfejsu. Gdy `curl` dostaje złe dane, przyczyna leży w Route Handlerze. Gdy `curl` dostaje dobre dane, a strona pokazuje złe, przyczyna leży w kodzie Reacta.

## Rozszerzenie: metody bezpieczne i idempotentne

Słownik MDN nazywa dwie własności metod. Metoda jest **bezpieczna** (*safe*), gdy „nie zmienia stanu serwera” (*„doesn't alter the state of the server”*): `GET`, `HEAD` i `OPTIONS`. Metoda jest **idempotentna** (*idempotent*), gdy kilka identycznych żądań ma ten sam zamierzony skutek co jedno. Idempotentne są metody bezpieczne oraz `PUT` i `DELETE`. `POST` tej gwarancji nie ma: dwa identyczne żądania `POST /api/articles` dopiszą dwa artykuły. Dlatego klient może ponowić żądanie idempotentne po zerwanym połączeniu, a `POST` nie. Według MDN <u>pilnowanie tej umowy należy do aplikacji</u>, bo serwer nie zabroni funkcji `GET` zapisywać danych.

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

Route Handler może czytać nagłówki i ciasteczka. `request.headers` daje standardowy obiekt `Headers`, a `request.cookies.get("token")` odczytuje ciasteczko. Te same dane zwracają funkcje `headers()` i `cookies()` z modułu `next/headers`. Dokumentacja zastrzega, że obiekt z `headers()` służy tylko do odczytu, a nagłówek odpowiedzi ustawia się w polu `headers` nowego obiektu `Response`. W `articleviewer` żaden Route Handler nie czyta nagłówków. W tym miejscu stałoby sprawdzenie tokenu w API dla aplikacji zewnętrznych.

## Rozszerzenie: odpowiedź dla innej domeny

Przeglądarka pilnuje, kto czyta odpowiedź. Skrypt może odczytać odpowiedź tylko z tego samego **pochodzenia** (*origin*), czyli z tej samej kombinacji schematu, domeny i portu. MDN opisuje **CORS** (*Cross-Origin Resource Sharing*) jako mechanizm oparty na nagłówkach HTTP, którym serwer wskazuje inne pochodzenia, z których przeglądarka może ładować jego zasoby. Strona serwowana przez sam `articleviewer` czyta `/api/articles` bez przeszkód. Aplikacja uruchomiona na innym porcie dostałaby blokadę, bo odpowiedzi nie mają nagłówka `Access-Control-Allow-Origin`. `curl` tej blokady nie zna, bo CORS jest regułą przeglądarki, a nie serwera.

> 💡 **Zapamiętaj:** Route Handler to plik `route.js`, którego funkcje nazywają się jak metody HTTP, dostają `Request` i zwracają `Response`. <u>Błąd klienta, taki jak zły JSON, odsyła się kodem 4xx</u>, bo nieprzechwycony wyjątek w Route Handlerze kończy się kodem 500.

