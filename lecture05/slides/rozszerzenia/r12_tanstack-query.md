# Rozszerzenia do slajdu 12: TanStack Query: zapytanie z cyklem życia

Powrót: [`slide_12_tanstack-query.md`](../slide_12_tanstack-query.md)

## Rozszerzenie: wersja 5 i obiekt w argumencie

Wersja 5 przyjmuje wyłącznie obiekt. Przewodnik migracji pisze krótko: „teraz obsługujemy wyłącznie format obiektowy” (*„now we only support the object format.”*). Stare wywołanie z poradników nie zadziała, tak samo jak `invalidateQueries(['posts'])` z książki Bugla, pisanej pod wersję 4.

```jsx
// Przykład spoza demo: zapis z wersji 4 w @tanstack/react-query 5.104.1
const { data } = useQuery(["articles"], getArticles);
// next dev   → Error: Bad argument type. Starting with v5, only the "Object" form is allowed when calling query related functions. …
// next build → TypeError: m.defaultQueryOptions is not a function (przerwany prerender strony)
const { data: ok } = useQuery({ queryKey: ["articles"], queryFn: getArticles }); // zapis z wersji 5
```

Opcja `cacheTime` z wersji 4 nazywa się teraz `gcTime`, a stan `loading` ma teraz nazwę `pending`.

## Rozszerzenie: klucze zapytań

Klucz jest tablicą. Dokumentacja *Query Keys* zaczyna od zdania, że biblioteka zarządza pamięcią na podstawie kluczy. Jeśli funkcja zapytania zależy od zmiennej, zmienna trafia do klucza: lista po autorze ma klucz `["articles", { author }]`. Klucze działają jak zależności funkcji zapytania, więc zmiana klucza oznacza nowe zapytanie.

Klucze układa się hierarchicznie: `["articles"]` dla listy, `["articles", id]` dla szczegółów. Barklund zauważa zaletę: do zapytań odwołuje się dokładnym kluczem albo jego początkiem. `invalidateQueries({ queryKey: ["articles"] })` oznacza jako nieświeże wszystkie zapytania z kluczem zaczynającym się od `"articles"`, a aktywne pobierają się od razu.

Trzy opcje sterują tym, co zapytanie robi z kluczem:

- **`enabled: false`** wstrzymuje zapytanie. Według dokumentacji nie pobiera się przy montowaniu ani w tle i ignoruje `invalidateQueries`.
- **`select`** wybiera fragment danych. Komponent renderuje się wtedy tylko przy zmianie wybranej wartości.
- **`placeholderData: keepPreviousData`** robi przy paginacji z kluczem `["articles", page]` to samo co `keepPreviousData` w SWR, a flaga `isPlaceholderData` mówi, że na ekranie są stare dane.

```jsx
// Przykład spoza demo: liczba artykułów autora, pobierana dopiero po wyborze
const [author, setAuthor] = useState("");
const { data: count, status, fetchStatus } = useQuery({
  queryKey: ["articles", { author }],
  queryFn: () => fetch(`/api/articles?author=${author}`).then((r) => r.json()),
  enabled: !!author,              // czeka na wybór autora
  select: (data) => data.length,  // komponent dostaje samą liczbę
});
// przed wyborem           → status "pending", fetchStatus "idle", count undefined, brak żądań
// po setAuthor("Alice")   → GET /api/articles?author=Alice, status "success", count 1
```

## Rozszerzenie: ręczne wycofanie zmiany

Zmianę pamięci przed odpowiedzią serwera z ręcznym wycofaniem zapisuje się w trzech funkcjach, zgodnie z przewodnikiem *Optimistic Updates*. W wersji 5.104.1 każda z nich dostaje ostatnim argumentem kontekst z polem `client`, czyli klientem zapytań:

```jsx
// Rozszerzenie spoza demo: aktualizacja optymistyczna z ręcznym wycofaniem
const saveArticle = (article) => // POST /api/articles, zwraca zapisany artykuł
  fetch("/api/articles", { method: "POST", body: JSON.stringify(article) }).then((r) => r.json());

useMutation({
  mutationFn: saveArticle,
  onMutate: async (newArticle, context) => {
    await context.client.cancelQueries({ queryKey: ["articles"] }); // przerwij pobierania, które nadpisałyby zmianę
    const previous = context.client.getQueryData(["articles"]);
    context.client.setQueryData(["articles"], (old) => [...old, newArticle]);
    return { previous }; // kopia do wycofania
  },
  onError: (err, newArticle, onMutateResult, context) => {
    context.client.setQueryData(["articles"], onMutateResult.previous);
  },
  onSettled: (data, error, variables, onMutateResult, context) =>
    context.client.invalidateQueries({ queryKey: ["articles"] }),
});
```

`onMutate` przerywa pobierania w tle przez `cancelQueries`, bo starsza odpowiedź nadpisałaby zmianę. Potem zapisuje kopię listy i dopisuje artykuł. `onError` przywraca kopię, a `onSettled` unieważnia listę po każdym wyniku. W SWR wycofanie robi opcja `rollbackOnError`, a tu pisze się je samemu. Ten sam przewodnik opisuje prostszy wariant bez dotykania pamięci: lista renderuje dodatkową pozycję z `variables` mutacji, dopóki `isPending` ma wartość `true`.

## Rozszerzenie: dane z serwera na start

Dane z komponentu serwerowego można przekazać do `useQuery` w opcji `initialData`. Barklund odróżnia ją od `placeholderData`. Dane startowe to prawdziwe dane, które mogą zastąpić odpowiedź. Dane zastępcze tylko wyglądają podobnie i najpewniej nie są prawdziwe.

Przewodnik *Advanced Server Rendering* zaleca w App Routerze drugą drogę.

```jsx
// Przykład spoza demo: komponent serwerowy wypełnia pamięć, kliencki czyta ją przez useQuery
export default async function Page() {
  await connection();
  const queryClient = new QueryClient();
  await queryClient.query({ queryKey: ["articles"], queryFn: getArticles }); // odrzuca Promise przy błędzie
  return (
    <Providers>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ArticleList /> {/* "use client": useQuery({ queryKey: ["articles"], queryFn, staleTime }) */}
      </HydrationBoundary>
    </Providers>
  );
}
// HTML strony → trzy <li> z tytułami
// staleTime: 0         → po hydratacji GET /api/articles
// staleTime: 60 * 1000 → po hydratacji brak żądań
```

W wersji 5.104.1 metoda `prefetchQuery` z wcześniejszych poradników jest oznaczona jako przestarzała na rzecz `query`. Przy funkcji, która odrzuca Promise, `prefetchQuery` kończy się sukcesem, a `query` błędem, więc nieudane pobranie przerywa render komponentu serwerowego. Komentarz w kodzie przewodnika zaleca przy SSR `staleTime` powyżej zera, na przykład 60 sekund.

Przewodnik zawiera też ostrzeżenie ważne dla tej aplikacji. Server Actions nie nadają się do `queryFn`, bo wykonują się po kolei, a zapytania mają biec równolegle. Do odczytu służy Route Handler, taki jak `/api/articles`, a akcje zostają dla `useMutation`.
