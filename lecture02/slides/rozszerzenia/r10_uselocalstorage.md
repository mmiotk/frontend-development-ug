# Rozszerzenia do slajdu 10: Filtr, liczniki i własny hook `useLocalStorage`

Powrót: [`slide_10_uselocalstorage.md`](../slide_10_uselocalstorage.md)

## Rozszerzenie: granice hooka

Drugi przebieg ma swoją cenę. Po odświeżeniu przez ułamek sekundy widać wartość zapasową z HTML serwera, a dopiero potem zapisaną. Komponent, który ma tej chwili nie pokazywać, czeka z listą, aż odczyt się skończy. Hook oddaje mu wtedy także flagę `loaded`.

```jsx
// Przykład spoza demo: useLocalStorage oddaje też flagę loaded.
// w useLocalStorage zamiast return [value, setValue]:
return [value, setValue, loaded]; // trzeci element: true, gdy odczyt magazynu się skończył

// w komponencie: trzecia nazwa w destrukturyzacji
const [tasks, setTasks, loaded] = useLocalStorage("tasks", initialTasks);

// w JSX, w miejscu listy: napis zastępczy do końca odczytu
{loaded ? <ul>{/* zadania jak dotąd */}</ul> : <p>Loading tasks…</p>}
```

```text
HTML z serwera                          → <p>Loading tasks…</p>, bez zadań
w magazynie „Buy milk” i drugie zadanie → Loading tasks…, potem dwa zapisane zadania
pusty magazyn                           → Loading tasks…, potem pięć zadań startowych
```

Przy zapisanej liście pięć zadań startowych nie pojawia się ani na chwilę. Wywołanie z dwiema nazwami, `[tasks, setTasks]`, działa bez zmian, bo destrukturyzacja tablicy pomija nadmiarowe elementy.

Hook nie słyszy też zmian z innych kart tej samej strony. Druga karta zapisuje swoją listę pod tym samym kluczem, a pierwsza przy najbliższej zmianie nadpisze magazyn. Przeglądarka zgłasza taki zapis pozostałym kartom zdarzeniem `storage`, więc hook może go nasłuchiwać w trzecim efekcie.

```js
// Przykład spoza demo: useLocalStorage słyszy zapis z innej karty.
// w useLocalStorage, pod efektem zapisu:
useEffect(() => {
  function handleStorage(e) {
    // e.key: klucz zmieniony w innej karcie, e.newValue: nowy napis JSON
    if (e.key === key && e.newValue) setValue(JSON.parse(e.newValue));
  }
  window.addEventListener("storage", handleStorage);
  return () => window.removeEventListener("storage", handleStorage); // sprzątanie: koniec nasłuchu
}, [key]);
```

```text
karta B: „Buy milk” + Add        → karta A: 6 pending / 6 total, tytuł (6) Task Board
karta B: zaznaczenie zadania 1   → karta A: 5 pending / 6 total
zdarzenia storage                → karta A: 2, karta B: 0
```

## Rysunek 2.17 — dwie karty po dodaniu zadania w karcie B

![dwie karty z tą samą listą](../../figures/out/rys_02_17.png)

Na Rysunku 2.17 lewy zrzut to karta, w której wpisano „Buy milk”, a prawy to karta, której nikt nie dotknął. Obie mają sześć wierszy. Prawa dostała listę tylko przez zdarzenie `storage` i własny setter, więc przeliczyła też liczniki i tytuł karty.

Karta, która zapisuje, nie dostaje własnego zdarzenia, a ponowny zapis tego samego napisu w karcie A nie wywołuje go w karcie B, więc karty się nie zapętlają. React czyta takie magazyny także hookiem `useSyncExternalStore`, który ma osobną funkcję dla renderu na serwerze.
