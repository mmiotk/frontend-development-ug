# Dane pobierane w przeglądarce: SWR

## Kiedy dane pobiera przeglądarka

Każda dotychczasowa trasa pobierała dane na serwerze, a po zapisie widok odświeżało unieważnienie pamięci albo przekierowanie. Strona `/` jest więc aktualna w chwili renderu. Gdy artykuł doda ktoś inny, otwarta strona tego nie pokaże do przeładowania. Do przeglądarki przenosi się pobieranie, gdy odpowiedź na jedno z trzech pytań tego wymaga:

1. **Czy dane mają się zmieniać w trakcie oglądania strony?** Lista odświeżana co pięć sekund wymaga kodu w przeglądarce.
2. **Czy dane zależą od interakcji po załadowaniu?** Wyniki wyszukiwania wpisywanego znak po znaku pobiera się w przeglądarce.
3. **Czy dane mogą przyjść dopiero po załadowaniu strony?** Pobranie w przeglądarce zostawia pierwszy HTML bez nich, więc treść dla wyszukiwarek pobiera się na serwerze.

Granicę wyznacza też bezpieczeństwo. Klucze API, czyli tajne identyfikatory, którymi aplikacja przedstawia się zewnętrznej usłudze, oraz hasła do bazy nie mogą trafić do przeglądarki. Pobieranie z ich użyciem zostaje więc na serwerze. Lista artykułów, która ma sama pokazywać cudze zapisy, spełnia pierwszy warunek.

## Najmniejszy przykład `useSWR`

Biblioteka SWR (projekt przypina ją w wersji 2.5.1) daje jeden główny hook, `useSWR`. Najmniejszy komponent, który pobiera dane w przeglądarce, ma kilka linii:

```jsx
"use client"; // hook działa tylko w komponencie klienckim
import useSWR from "swr";

const fetcher = (url) => fetch(url).then((r) => r.json()); // dostaje klucz, zwraca Promise z danymi

export default function Count() {
  const { data } = useSWR("/api/articles", fetcher); // klucz i funkcja pobierająca
  return <p>{data ? data.length : "…"}</p>;           // przed odpowiedzią data to undefined
}
```

Pierwszy render pokazuje „…”, bo odpowiedzi jeszcze nie ma. Po nadejściu danych komponent renderuje się ponownie i pokazuje liczbę artykułów, w projekcie 3. Hook łączy **klucz** (*key*), czyli identyfikator danych, z funkcją **`fetcher`**, która dostaje ten klucz i zwraca Promise. SWR wywołuje ją za każdym razem, gdy potrzebuje danych.

## Lista, która odświeża się sama

Strona `/swr-demo` pokazuje drugi model: dane pobiera kod w przeglądarce, który sam pilnuje ich świeżości. Plik `app/swr-demo/page.jsx` jest nowy. W pierwszej wersji wygląda tak:

```jsx
// app/swr-demo/page.jsx
"use client"; // komponent kliencki: korzysta z hooków SWR

import useSWR from "swr";

const fetcher = (url) => fetch(url).then((r) => r.json());

export default function SwrDemoPage() {
  const { data: articles, error, isLoading } = useSWR("/api/articles", fetcher);

  if (isLoading) return <p>Ładowanie (SWR)...</p>;
  if (error) return <p>Błąd: {error.message}</p>;

  return (
    <div>
      <h1>Artykuły — SWR</h1>
      <p>SWR odświeża dane przy fokusie okna i ponownym połączeniu.</p>
      <ul>
        {articles.map((a) => (
          <li key={a.id}>
            {a.title} — {a.author}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

Funkcja `fetcher` stoi poza komponentem, więc nie powstaje na nowo przy każdym renderze. Nie sprawdza `r.ok`, więc odpowiedź 404 z treścią JSON trafiłaby do `data`, a nie do `error`. Dwa wczesne `return` obsługują ładowanie i błąd, a lista renderuje się dopiero przy gotowej tablicy. Strona najpierw pokazuje „Ładowanie (SWR)...”, a potem listę w formacie „Intro to Server Components — Alice”. Przeglądarka wysyła przy tym jedno żądanie `GET /api/articles`.

Kod działa w przeglądarce, więc wystarcza ścieżka `/api/articles` bez hosta. Źródłem danych jest Route Handler, jedyne miejsce, z którego przeglądarka odczytuje artykuły. Zapis z formularza idzie inną drogą, przez akcję `createArticle`. Druga wersja dodaje odświeżanie co pięć sekund. Zmienia się tylko wywołanie hooka:

```jsx
// app/swr-demo/page.jsx: wywołanie useSWR z odpytywaniem
const { data: articles, error, isLoading } = useSWR("/api/articles", fetcher, {
  refreshInterval: 5000, // ponowne pobranie co 5 sekund
});
```

Przeglądarka wysyła teraz żądanie `/api/articles` co pięć sekund. Artykuł dodany przez formularz `/new` w innym oknie pojawia się na `/swr-demo` najpóźniej po pięciu sekundach, bez odświeżania strony.

## SWR jako biblioteka danych

Nazwa SWR pochodzi od strategii *stale-while-revalidate*, tej samej, którą Next.js stosuje przy pamięci czasowej, tyle że tutaj pamięć leży w przeglądarce. Morten Barklund w *React in Depth* ujmuje rolę takich narzędzi tak:

> **„Wiele bibliotek ułatwia pracę z danymi zdalnymi, w tym TanStack Query. Te biblioteki nie są bibliotekami żądań sieciowych, tylko bibliotekami danych zbudowanymi do pracy z danymi zdalnymi.”**
>
> *„Several libraries make working with remote data easier, including TanStack Query. These libraries aren’t network request libraries—merely data libraries built for working with remote data.”*
>
> — Morten Barklund, *React in Depth*

Żądanie wysyła `fetch`, a SWR decyduje, kiedy go użyć i co zrobić z wynikiem. Dokumentacja Reacta, przy wadach pobierania w efekcie, wymienia `useSWR` i TanStack Query jako gotowe pamięci po stronie klienta. Pamięć jest wspólna dla komponentów z tym samym kluczem: trzy komponenty z kluczem `"/api/articles"` czytają jeden wpis.

## Co zwraca `useSWR`

- **`data`** to wynik `fetcher`, przed pierwszą odpowiedzią `undefined`.
- **`error`** pojawia się, gdy `fetcher` rzuci wyjątek.
- **`isLoading`** według dokumentacji API oznacza trwające żądanie przy braku załadowanych danych.
- **`isValidating`** oznacza każde trwające żądanie albo rewalidację.

Przy pierwszym wejściu obie flagi są prawdziwe, a `data` jest puste. Przy każdym kolejnym pobraniu `isLoading` zostaje fałszywe, `isValidating` staje się prawdziwe, a na ekranie zostaje stara lista. <u>Ekran ładowania zależy od `isLoading`</u>, a mały wskaźnik odświeżania od `isValidating`. Ekran oparty na `isValidating` zastępowałby listę co pięć sekund.

Dokumentacja dodaje szczegół: dane startowe i dane poprzedniego klucza nie liczą się jako załadowane. Opcja **`keepPreviousData`**, domyślnie wyłączona, zwraca dane poprzedniego klucza, dopóki nie przyjdą nowe. Wyniki wyszukiwania nie znikają wtedy przy każdej wpisanej literze.

## Czego nie ma w pierwszym HTML-u

Strona `/` wysyła listę w HTML-u. Strona `/swr-demo` wysyła napis „Ładowanie (SWR)...” i pobiera dane po załadowaniu JavaScriptu, więc robot, który skryptu nie wykona, listy nie zobaczy. Oba modele można łączyć: dane z komponentu serwerowego mogą być wartością startową dla SWR, a odpytywanie w przeglądarce dba o ich dalszą świeżość.

## Przycisk, który dodaje artykuł

Po własnym zapisie użytkownik nie powinien czekać na kolejny cykl. Ostatnia wersja pliku dostaje przycisk „Dodaj testowy artykuł”, a zdanie o fokusie okna znika. Nowe są `mutate` w wyniku hooka, funkcja obsługi i przycisk:

```jsx
// app/swr-demo/page.jsx (nowe linie)
const { data: articles, error, isLoading, mutate } = useSWR("/api/articles", fetcher, {
  refreshInterval: 5000,
});

async function handleAddTest() {
  await fetch("/api/articles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Test SWR " + Date.now(),
      author: "SWR User",
      body: "Article added directly via fetch + SWR mutate revalidation.",
    }),
  });
  mutate(); // pobierz od razu, bez czekania na refreshInterval
}

// w JSX, pod nagłówkiem:
<button onClick={handleAddTest}>Dodaj testowy artykuł</button>
```

Funkcja **`mutate`** z wyniku hooka to według dokumentacji **związany `mutate`** (*bound mutate*), który zna klucz z wywołania `useSWR`. Wywołany bez danych oznacza wpis jako przeterminowany i pobiera go ponownie. Po kliknięciu przeglądarka wysyła `POST`, a zaraz po nim `GET` do `/api/articles`, a na końcu listy staje pozycja „Test SWR 17… — SWR User”.

`await fetch(...)` czeka na potwierdzenie zapisu. Bez `await` żądanie listy mogłoby dotrzeć przed zapisem i przynieść jeszcze trzy artykuły. Zapis idzie przez `POST /api/articles`, czyli przez Route Handler, który niczego nie waliduje. Przycisk wysyła mimo to treść zgodną ze schematem, dłuższą niż dziesięć znaków.

## Klucz jako nazwa wpisu i argument `fetcher`

Domyślnie klucz trafia do `fetcher` jako argument, więc tutaj musi być adresem. Klucz `"moje-artykuly"` daje `fetch("moje-artykuly")`, czyli `/moje-artykuly`. Next.js odpowiada stroną 404 w HTML-u, a `r.json()` rzuca `SyntaxError`. Ekran pokazuje wtedy „Błąd: Unexpected token '<', "<!DOCTYPE "... is not valid JSON”.

## Odpytywanie czy unieważnienie

Pamięć SWR jest osobna od pamięci Next.js na serwerze, więc `revalidatePath` w akcji jej nie dotyka. Artykuł z `/new` pojawia się na `/swr-demo` dzięki odpytywaniu. Unieważnienie po własnym zapisie kosztuje jedno żądanie i działa od razu, jak `mutate()`. Odpytywanie kosztuje żądanie co ustalony czas i ma sens tylko dla zmian z innego okna albo od innego użytkownika.

## Rysunek 5.11 — co uruchamia pobranie wpisu SWR

```mermaid
%%{init: {"flowchart": {"wrappingWidth": 360}}}%%
flowchart LR
    M["montowanie, klucz /api/articles"] --> E{"wpis w pamięci?"}
    E -- "nie" --> L["isLoading = true<br/>„Ładowanie (SWR)...”"] --> F["fetcher(klucz)"]
    E -- "tak" --> S["stara lista od razu<br/>isValidating = true"] --> F
    T["fokus, sieć, co 5 s,<br/>mutate()"] --> S
    RP["revalidatePath('/')"] -. "✗ brak połączenia" .-> S
    F --> D["wpis zaktualizowany<br/>lista na ekranie"]
```

Rysunek 5.11 zbiera w jednym węźle wszystkie wyzwalacze pobrania i pokazuje przerywaną strzałką ze znakiem ✗ połączenie, którego nie ma: `revalidatePath` nie uruchamia pobrania w SWR.

## Rozszerzenie: kiedy SWR pyta serwer

Dokumentacja API podaje wartości domyślne:

- **`revalidateOnFocus = true`**: odświeżenie, gdy okno odzyskuje fokus, najwyżej raz na `focusThrottleInterval = 5000` ms.
- **`revalidateOnReconnect = true`**: odświeżenie po powrocie sieci.
- **`dedupingInterval = 2000`**: żądania z tym samym kluczem w oknie dwóch sekund łączą się w jedno.
- **`refreshInterval = 0`** i **`refreshWhenHidden = false`**: odpytywanie jest wyłączone, a włączone nie działa w karcie schowanej w tle.

Przy `refreshInterval: 5000` jedno okno wysyła dwanaście żądań na minutę, także gdy nikt niczego nie dodaje. Sto otwartych okien to tysiąc dwieście żądań na minutę, prawie zawsze z tą samą listą. Interwał dobiera się więc do tempa zmian danych.

## Rozszerzenie: wyścig żądań

Dokumentacja Reacta ostrzega, że odpowiedzi sieciowe mogą przyjść w innej kolejności, niż wysłano żądania. Przy własnym `fetch` w efekcie stare żądanie przerywa się obiektem `AbortController`, który według MDN pozwala przerwać jedno albo więcej żądań w wybranej chwili. SWR nie wymaga tu własnego kodu, bo każda odpowiedź trafia do wpisu swojego klucza. Gdy odpowiedź dla artykułu 1 przyjdzie później niż odpowiedź dla artykułu 2, zapisze się pod kluczem artykułu 1 i nie nadpisze widoku artykułu 2. Wyścig między zapisem a odświeżaniem w tle rozwiązuje osobny hook do zapisu, `useSWRMutation`, który po mutacji porzuca trwające żądanie `useSWR` i pobiera dane ponownie.

## Rozszerzenie: dane z serwera jako wartość startowa

Komponent serwerowy pobiera listę i przekazuje ją komponentowi klienckiemu, a ten podaje ją do SWR w opcji `fallbackData`. Takiej trasy nie ma w projekcie:

```jsx
// Rozszerzenie spoza demo: dane z serwera jako wartość startowa SWR
"use client";
import useSWR from "swr";

const fetcher = (url) => fetch(url).then((r) => r.json());

export default function LiveArticles({ initialArticles }) {
  const { data } = useSWR("/api/articles", fetcher, {
    fallbackData: initialArticles, // pokazywane przed pierwszym żądaniem z przeglądarki
    refreshInterval: 5000,
  });
  return <ul>{data.map((a) => <li key={a.id}>{a.title}</li>)}</ul>;
}
```

Pierwszy render ma wtedy listę z serwera, a odpytywanie działa dalej. Komponent nie sprawdza `isLoading`, bo przy pierwszym żądaniu flaga i tak ma wartość `true`, choć na ekranie stoją już dane startowe: wartość z `fallbackData` nie liczy się jako załadowana.

## Rozszerzenie: klucze złożone, `SWRConfig` i `useSWRMutation`

Zmienna, od której zależą dane, musi być częścią klucza. Dokumentacja pokazuje błąd z tokenem przekazanym tylko do `fetcher`: klucz się nie zmienia, więc SWR zwróci złe dane. Rozwiązaniem jest klucz-tablica, na przykład `["/api/articles", author]`, związany z pamięcią w całości. Klucz `null` wyłącza pobieranie: ``useSWR(id ? `/api/articles/${id}` : null, fetcher)`` nie wyśle żądania pod `/api/articles/undefined`.

Po zapisie nieaktualna może być też lista pod `/api/articles?author=Ala`. Globalna funkcja `mutate` z `swr` przyjmuje zamiast klucza funkcję filtrującą: `mutate((key) => typeof key === "string" && key.startsWith("/api/articles"))` odświeża wszystkie pasujące wpisy. Dokumentacja zastrzega, że globalny `mutate` z samym kluczem nic nie zrobi bez zamontowanego hooka z tym kluczem.

Gdy wiele komponentów korzysta z tego samego `fetcher`, podaje się go raz w `<SWRConfig value={{ fetcher }}>` nad drzewem, a `useSWR` dostaje sam klucz. Jedna funkcja może wtedy sprawdzać `r.ok` za wszystkie zapytania.

Zapis z przycisku ma w SWR także osobny hook. **`useSWRMutation`** z `swr/mutation` według dokumentacji uruchamia mutację wyłącznie ręcznie, przez zwracaną funkcję `trigger`. Funkcja zapisu dostaje klucz i obiekt z polem `arg`, czyli argumentem przekazanym do `trigger`. Hook zwraca też flagę `isMutating`, przydatną do wyłączenia przycisku na czas zapisu. Opcja `populateCache` ma tu domyślnie wartość `false`, odwrotnie niż w `mutate`, więc odpowiedź `POST` z jednym artykułem nie nadpisze listy.

## Rozszerzenie: zmiana widoczna przed odpowiedzią serwera

SWR potrafi pokazać zmianę przed odpowiedzią. Funkcja `saveArticle` wysyłałaby `POST` i zwracała nowy artykuł:

```jsx
// Rozszerzenie spoza demo: aktualizacja optymistyczna z wycofaniem
await mutate(saveArticle(newArticle), {
  optimisticData: (current) => [...current, { ...newArticle, id: "temp" }],
  rollbackOnError: true, // przywróć starą listę, gdy POST się nie uda
  populateCache: false,  // POST zwraca jeden artykuł, a nie listę
});
```

- **`optimisticData`** trafia od razu do pamięci albo jest funkcją bieżących danych.
- **`rollbackOnError`**, domyślnie włączone, przywraca poprzednią listę po nieudanym zapisie.
- **`populateCache`**, domyślnie włączone, zapisuje wynik mutacji jako dane klucza. `POST` zwraca jeden artykuł, więc bez `false` lista zamieniłaby się w obiekt, a `articles.map` zgłosiłby wyjątek.

Po zakończeniu SWR i tak pobiera listę, bo `revalidate` jest domyślnie włączone. Wartość tymczasowa trafia przy tym do **wspólnej pamięci**: widzi ją każdy komponent z kluczem `"/api/articles"`, także w innej części strony. `useOptimistic` z Reacta trzyma wartość tymczasową w stanie jednego komponentu, tylko na czas akcji.

> 💡 **Zapamiętaj:** klucz SWR jest nazwą wpisu w pamięci i argumentem `fetcher`. Ekran ładowania zależy od `isLoading`, a związany `mutate()` odświeża wpis po własnym zapisie. Pamięć SWR żyje w przeglądarce i nie widzi rewalidacji z serwera.

