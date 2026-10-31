# Rozszerzenia do slajdu 06: `useMemo`: zapamiętany wynik obliczenia

Powrót: [`slide_06_usememo.md`](../slide_06_usememo.md)

## Rozszerzenie: gdy zapytanie zmienia się przy każdej literze

Przy dziesięciu tysiącach kontaktów filtrowanie przekracza próg, a `useMemo` nadal nie pomaga, bo każda litera zmienia `query`. Na taki przypadek dokumentacja Reacta wskazuje hook **`useDeferredValue`**, który zwraca opóźnioną kopię wartości. Przy zmianie React najpierw renderuje komponent ze starą kopią, a w tle próbuje renderu z nową. Poniższy fragment nie należy do `contacts-app`:

```jsx
const deferredQuery = useDeferredValue(query); // kopia query, która nadąża z opóźnieniem
const filtered = useMemo(
  () => filterContacts(contacts, deferredQuery),
  [contacts, deferredQuery] // zależnością jest kopia, a nie samo query
);
```

W pierwszym renderze po literze `query` jest już nowe, a `deferredQuery` jeszcze stare. Zależności `useMemo` się nie zmieniły, więc hook oddaje zapisaną tablicę. `ContactList` w `memo` dostaje ten sam prop i zostaje pominięta, a pole pokazuje literę od razu. Filtrowanie i render listy odbywają się w drugim renderze, w tle. Bez `useDeferredValue` filtrowanie i lista wykonują się już w pierwszym renderze po literze. Dokumentacja stawia przy tym warunek:

> **„Ta optymalizacja wymaga, żeby `SlowList` była owinięta w `memo`. […] Podczas tego renderu `deferredText` ma jeszcze poprzednią wartość, więc `SlowList` może pominąć render (jej propsy się nie zmieniły).”**
>
> *„This optimization requires SlowList to be wrapped in memo. […] During that re-render, deferredText still has its previous value, so SlowList is able to skip re-rendering (its props have not changed).”*
>
> — dokumentacja Reacta, *useDeferredValue*

W takiej wersji `memo` na liście i `useMemo` na wyniku zaczynają pracować razem. Granicę metody dokumentacja też podaje. Hook pozwala odłożyć render listy za obsługę klawisza, ale samego renderu nie przyspiesza. Lista „zostaje w tyle” za polem. W odróżnieniu od opóźniania przez `setTimeout` hook nie ustala stałego czasu oczekiwania. Render w tle przerywa każda kolejna litera.

## Rozszerzenie: czysta funkcja obliczająca i dwa błędy zapisu

Funkcja przekazana do `useMemo` ma być czysta, czyli nie może zmieniać obiektów istniejących przed jej wywołaniem. Dokumentacja dopuszcza za to zmiany obiektów, które funkcja sama utworzyła. `ContactStats` stosuje tę granicę poprawnie: `reduce` zmienia obiekt `acc`, ale ten obiekt powstaje w tym samym wywołaniu z literału `{}`.

Przykład Schwarzmüllera z *React Key Concepts* tę granicę przekracza. Jego komponent `List` sortuje w `useMemo` tablicę z propsów wywołaniem `items.sort(...)`. Metoda `sort` porządkuje tablicę w miejscu:

```js
const items = [3, 1, 2];
items.sort((a, b) => a - b);          // zwraca tę samą tablicę
console.log(items);                   // [1, 2, 3]: oryginał zmieniony

const props = [3, 1, 2];
const sorted = [...props].sort((a, b) => a - b); // sortuje kopię
console.log(props, sorted);           // [3, 1, 2] [1, 2, 3]
```

Sortowanie w miejscu zmienia więc dane rodzica. Bezpieczna wersja sortuje kopię zrobioną rozwinięciem tablicy.

Dwa kolejne błędy dotyczą zapisu. Pierwszy dotyczy obiektu jako wyniku. W zapisie `() => {` nawias klamrowy otwiera ciało funkcji strzałkowej. JavaScript nie traktuje go jako początku obiektu:

```js
const a = () => { total: 5 };          // ciało funkcji z etykietą total, wynik undefined
const b = () => ({ total: 5 });        // nawiasy: wynikiem jest obiekt
const c = () => { return { total: 5 }; }; // jawne return: też obiekt
```

Bez `return` hook zwraca więc `undefined`. Dokumentacja wskazuje nawiasy `({ ... })` jako poprawkę, ale ocenia je jako łatwe do przypadkowego usunięcia i zaleca jawne `return`.

Drugi dotyczy list. `useMemo` jest hookiem, więc nie wolno go wywołać w pętli `map` dla każdego elementu. Dokumentacja proponuje wydzielić komponent wiersza i w nim zapamiętać wynik dla jednego elementu. Drugą drogą jest owinięcie tego komponentu w `memo`.

## Rozszerzenie: zapamiętany fragment JSX i różnica wobec `useEffect`

`useMemo` może zapamiętać także element JSX. Element JSX jest niezmiennym obiektem, więc gdy React dostaje dokładnie ten sam obiekt co przy poprzednim renderze, nie renderuje komponentu ponownie. Barklund mierzy ten wariant na liście zadań: z `useMemo` obsługa klawisza trwa 2 ms, bez niego 3–4 ms. Dokumentacja uważa jednak ręczną memoizację JSX za niewygodną, choćby dlatego, że nie da się go zrobić warunkowo, i zaleca zamiast niego `memo` na komponencie.

```jsx
// Przykład spoza demo: element listy zapamiętany w useMemo, lista bez memo
let renders = 0;
function PlainList({ contacts }) {
  renders++; // licznik wywołań komponentu
  return <ul>{contacts.map((c) => <li key={c.id}>{c.name}</li>)}</ul>;
}

function Page() {
  const [clicks, setClicks] = useState(0);
  const list = useMemo(() => <PlainList contacts={initialContacts} />, []);
  return (
    <>
      <button onClick={() => setClicks(clicks + 1)}>Clicks: {clicks}</button>
      {list}
    </>
  );
}
// po trzech kliknięciach w przycisk:
console.log(screen.getByRole('button').textContent, renders); // → Clicks: 3 1
```

Z `<PlainList contacts={initialContacts} />` wpisanym wprost zamiast `{list}` licznik po trzech kliknięciach pokazuje 4, bo `PlainList` renderuje się przy każdym kliknięciu.

Oba hooki, `useMemo` i `useEffect`, przyjmują funkcję i tablicę zależności, ale działają w innym momencie. Schwarzmüller pisze, że `useMemo` działa razem z resztą kodu funkcji komponentu (*„runs at the same time as the rest of the code in the component function”*). `useEffect` działa dopiero po zakończeniu renderu. Wynik `useMemo` jest więc gotowy w tym samym renderze, w którym zmieniło się zapytanie. Efekt zapisujący wynik do stanu dokłada drugi render: po jednej literze komponent renderuje się dwa razy zamiast raz.
