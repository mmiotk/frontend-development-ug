# Rozszerzenia do slajdu 08: Komponent, który czeka na dane

Powrót: [`slide_08_use-i-suspense.md`](../slide_08_use-i-suspense.md)

## Rozszerzenie: ta sama sekcja bez `use`

Dla porównania poniższy kod, który nie należy do projektu, pobiera rekomendacje w efekcie:

```jsx
// Rozszerzenie spoza demo: ta sama sekcja bez use() i bez Suspense.
function RecommendedProducts() {
  const [recommended, setRecommended] = useState([]);
  const [isLoading, setIsLoading] = useState(true);   // flaga ładowania
  const [error, setError] = useState(null);           // komunikat błędu

  useEffect(() => {
    fetchRecommended()
      .then(setRecommended)
      .catch(err => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);                                              // pobranie raz, po pierwszym renderze

  if (isLoading) return <p>Loading recommendations...</p>;
  if (error) return <p>Something went wrong: {error}</p>;
  return <ul>{recommended.map(p => <li key={p.id}>{p.name}</li>)}</ul>;
}
```

Ta wersja obsługuje wszystkie trzy stany sama, w trzech zmiennych stanu i dwóch warunkach przed listą. Pierwszy render kończy się normalnie, z pustą tablicą i flagą ładowania, a efekt startuje dopiero po nim. Wersja z `use` przenosi napis ładowania do granicy u rodzica, a komunikat błędu do granicy błędów, więc w komponencie zostaje sama lista. Różnica rośnie z liczbą sekcji: każda kolejna sekcja z efektem powtarza te same trzy zmienne, a sekcje z `use` dzielą jedną parę granic.

## Rozszerzenie: cztery źródła zawieszenia

Dokumentacja wymienia wszystkie źródła, które zatrzymują odsłonięcie granicy:

- **`lazy`**, czyli komponent, którego kod przeglądarka pobiera osobnym plikiem, przez dynamiczny `import()`, dopiero przy pierwszym renderze;
- **`use` z Promise**, także z danymi przychodzącymi z komponentów serwerowych albo ładowanymi przez framework obsługujący Suspense;
- **arkusz stylów** `<link rel="stylesheet">` z propem `precedence`, który każe Reactowi wstrzymać odsłonięcie treści do załadowania stylów;
- **strumieniowanie HTML**, czyli odpowiedź serwera wysyłana w kawałkach, przy którym granica czeka na swój kawałek, tak jak segment z `loading.jsx`.

Najprościej zobaczyć pierwsze źródło na podsumowaniu koszyka wczytywanym dopiero po kliknięciu:

```jsx
// Przykład spoza demo: CartSummary w osobnym pliku JS, wczytywany przez lazy
const LazySummary = lazy(() => import('./CartSummary'));   // plik obok, w app/components/

<button onClick={() => setShow(true)}>Show summary</button>
{show && (
  <Suspense fallback={<p>Loading summary...</p>}>
    <LazySummary />
  </Suspense>
)}
// kliknięcie „Show summary” → Loading summary..., jeden nowy plik JS, potem Cart: 0 pcs — 0.00 PLN
```

Plik z kodem podsumowania przeglądarka pobiera dopiero po kliknięciu i do jego wczytania granica pokazuje treść zastępczą.

## Rozszerzenie: `use` w warunku i w `try/catch`

Mimo nazwy `use` nie jest hookiem. Dokumentacja mówi:

> **„Mimo nazwy `use` nie jest hookiem. W przeciwieństwie do hooków można go wywołać w pętli i w instrukcji warunkowej, takiej jak `if`.”**
>
> *„Despite its name, `use` is not a Hook. Unlike Hooks, it can be called inside loops and conditional statements like `if`.”*
>
> — dokumentacja React, *use*

Ta swoboda dotyczy także odczytu kontekstu, którego `useContext` w warunku zrobić nie może:

```jsx
const ThemeContext = createContext('light');

function Cond({ show }) {
  if (show) {
    const theme = use(ThemeContext);   // use w if: dozwolone
    return <p>{theme}</p>;
  }
  return <p>-</p>;
}
// pod <ThemeContext value="dark">: <Cond show /> daje <p>dark</p>, <Cond show={false} /> daje <p>-</p>
```

Wolność ma jedną granicę: `use` nie może stać w bloku `try/catch`. Oczekujący Promise przerywa render podobnie jak wyjątek. Ręczny `catch` przechwyci więc zwykłe czekanie na dane.

```jsx
function Tried() {
  let v;
  try {
    v = use(slowPromise);
  } catch (e) {
    v = e.message;   // „Suspense Exception: This is not a real error! …”
  }
  return <p>{v}</p>;
}
```

Komponent pokazuje wtedy tekst „Suspense Exception: This is not a real error!” i zostaje przy nim także po spełnieniu Promise, bo React nie dowiedział się o czekaniu. Dokumentacja `use` zapisuje to jako ograniczenie i kieruje obsługę błędu do granicy błędów (*„`use` cannot be called inside a try-catch block. Instead, wrap your component in an Error Boundary to catch the error and display a fallback.”*).

## Rozszerzenie: ukryta treść i odsłanianie

Granica pokazuje treść zastępczą nie tylko przy pierwszym renderze.

> **„Jeśli Suspense wyświetlał już treść drzewa, a potem znów nastąpiło zawieszenie, treść zastępcza pojawi się ponownie, chyba że aktualizację wywołały `startTransition` lub `useDeferredValue`.”**
>
> *„If Suspense was displaying content for the tree, but then it suspended again, the fallback will be shown again unless the update causing it was caused by startTransition or useDeferredValue.”*
>
> — dokumentacja React, *Suspense*

Dla użytkownika wygląda to jak znikanie gotowej listy. Dokumentacja dodaje, że w przejściu natychmiast pokażą treść zastępczą tylko granice nowe, czyli takie, których przed aktualizacją nie było na ekranie. Hook `useDeferredValue` z cytatu zwraca opóźnioną kopię wartości z propsa, więc na ekranie zostaje stara treść, dopóki nowa nie będzie gotowa. Różnicę widać, gdy Promise rekomendacji trafi do stanu komponentu:

```jsx
// Przykład spoza demo: Promise rekomendacji w stanie, dwa przyciski odświeżania nad granicą Suspense
const [promise, setPromise] = useState(recommendedPromise);

<button onClick={() => setPromise(fetchRecommended())}>Refresh</button>
<button onClick={() => startTransition(() => setPromise(fetchRecommended()))}>Refresh in transition</button>
// „Refresh”               → po 0,1 s: 0 z 3 <li> widocznych, Loading recommendations...; po 2 s: 3 <li>
// „Refresh in transition” → przez 2,5 s: 3 widoczne <li>, treść zastępcza się nie pojawia
```

Zwykła aktualizacja chowa trzy polecane produkty: elementy `<li>` zostają w DOM, ale są ukryte. Przejście zostawia starą listę na ekranie, dopóki nowy Promise się nie spełni.
