# Rozszerzenia do slajdu 11: Dane pobierane w przeglądarce: SWR

Powrót: [`slide_11_swr.md`](../slide_11_swr.md)

## Rozszerzenie: kiedy SWR pyta serwer

Dokumentacja API podaje wartości domyślne:

- **`revalidateOnFocus = true`**: odświeżenie, gdy okno odzyskuje fokus, najwyżej raz na `focusThrottleInterval = 5000` ms.
- **`revalidateOnReconnect = true`**: odświeżenie po powrocie sieci.
- **`dedupingInterval = 2000`**: żądania z tym samym kluczem w oknie dwóch sekund łączą się w jedno.
- **`refreshInterval = 0`** i **`refreshWhenHidden = false`**: odpytywanie jest wyłączone, a włączone nie działa w karcie schowanej w tle.

```js
// Przykład spoza demo: /swr-demo z projektu, licznik żądań w przeglądarce przez minutę
const { data } = useSWR("/api/articles", fetcher, { refreshInterval: 5000 });
// → 12 żądań GET /api/articles w pierwszej minucie, licząc pierwsze, bez żadnej zmiany danych
// → 0 żądań przez 15 s po ustawieniu document.visibilityState na "hidden"
```

Sto otwartych okien to tysiąc dwieście żądań na minutę, prawie zawsze z tą samą listą, więc interwał dobiera się do tempa zmian danych.

## Rozszerzenie: wyścig żądań

Dokumentacja Reacta ostrzega, że odpowiedzi sieciowe mogą przyjść w innej kolejności, niż wysłano żądania. Przy własnym `fetch` w efekcie stare żądanie przerywa się obiektem `AbortController`, który według MDN pozwala przerwać jedno albo więcej żądań w wybranej chwili. SWR nie wymaga tu własnego kodu, bo każda odpowiedź trafia do wpisu swojego klucza.

```jsx
// Przykład spoza demo: /api/slow-articles/1 odpowiada po 1500 ms, /api/slow-articles/2 po 100 ms
const [id, setId] = useState(1);
const { data } = useSWR(`/api/slow-articles/${id}`, fetcher); // każdy id to osobny klucz
// kliknięcie „Article 2” zaraz po wejściu: odpowiedzi przychodzą w kolejności 2, 1
// → nagłówek „Why use Server Actions?” (artykuł 2), spóźniona odpowiedź go nie nadpisuje
// → powrót do id 1 od razu pokazuje „Intro to Server Components” z wpisu klucza artykułu 1
```

Wyścig między zapisem a odświeżaniem w tle rozwiązuje osobny hook do zapisu, `useSWRMutation`, który po mutacji porzuca trwające żądanie `useSWR` i pobiera dane ponownie.

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

Zmienna, od której zależą dane, musi być częścią klucza. Dokumentacja pokazuje błąd z tokenem przekazanym tylko do `fetcher`: klucz się nie zmienia, więc SWR zwróci złe dane. Rozwiązaniem jest klucz-tablica związany z pamięcią w całości, a klucz `null` wyłącza pobieranie.

```jsx
// Przykład spoza demo: API z filtrem ?author= (rozszerzenie slajdu 02)
const fetcher = ([url, author]) => fetch(`${url}?author=${author}`).then((r) => r.json());
const [author, setAuthor] = useState(null);
const { data } = useSWR(author ? ["/api/articles", author] : null, fetcher); // null: bez żądania
// → przed wyborem: brak żądań, data === undefined
// → setAuthor("Alice"): GET /api/articles?author=Alice, tytuł „Intro to Server Components”
```

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
