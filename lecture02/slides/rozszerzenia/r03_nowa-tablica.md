# Rozszerzenia do slajdu 03: Nowa tablica zamiast zmienionej

Powrót: [`slide_03_nowa-tablica.md`](../slide_03_nowa-tablica.md)

## Rozszerzenie: ten sam obiekt w dwóch miejscach stanu

Niemutowalność ma skutek, który ujawnia się przy drugiej zmiennej stanu. Przypuśćmy, że `TaskBoard` dostaje panel edycji i zapamiętuje w stanie zaznaczone zadanie. Są na to dwa sposoby:

```jsx
// Przykład spoza demo: zaznaczone zadanie w drugiej zmiennej stanu, w komponencie ze stanem tasks.
// ŹLE: stan powiela obiekt, który leży też w tasks.
const [selectedTask, setSelectedTask] = useState(null);
// po edycji tasks w stanie zostaje stara kopia obiektu

// DOBRZE (osobny wariant, nie obok poprzedniego): stan trzyma tylko identyfikator, obiekt wyszukuje się w każdym renderze.
const [selectedId, setSelectedId] = useState(null);
const selectedTask = tasks.find((t) => t.id === selectedId);
```

W pierwszej wersji `selectedTask` wskazuje ten sam obiekt, który leży w tablicy `tasks`. Kliknięcie pola wyboru przy tym zadaniu zastępuje go w tablicy nowym obiektem z `map`. Zmienna `selectedTask` dalej wskazuje stary obiekt z `done: false`, więc panel pokazuje nieaktualne dane. Dokumentacja (*Choosing the State Structure*) opisuje ten sam przypadek na liście przekąsek: po edycji pole się zmienia, a podpis pod listą nie. Zasadę formułuje tak:

> **„Gdy te same dane są powielone w kilku zmiennych stanu albo w zagnieżdżonych obiektach, trudno utrzymać je w zgodzie.”**
>
> *„When the same data is duplicated between multiple state variables, or within nested objects, it is difficult to keep them in sync.”*
>
> — dokumentacja React, *Choosing the State Structure*

Druga wersja trzyma w stanie tylko identyfikator. Obiekt zadania wyszukuje się w każdym renderze z aktualnej tablicy, więc zawsze odpowiada ostatniej kopii.

## Rozszerzenie: zagnieżdżony stan i spłaszczanie

Lista zadań w `TaskBoard` ma dwa poziomy: tablicę i obiekty zadań. Gdyby zadania należały do projektów, a projekty do grup, zmiana jednej flagi `done` wymagałaby nowego zadania, nowej tablicy zadań, nowego projektu i nowej tablicy projektów. Dokumentacja opisuje aktualizację zagnieżdżonego stanu jako kopiowanie obiektów aż do samej góry, od części, która się zmieniła. Dlatego zaleca stan płaski.

Płaski stan trzyma każdy obiekt raz, w słowniku według identyfikatora. Zamiast zagnieżdżonych obiektów-dzieci element przechowuje tylko ich identyfikatory:

```js
// Przykład spoza demo: zadania pogrupowane w projekty, w dwóch kształtach stanu.
// Zagnieżdżony: zadanie siedzi wewnątrz projektu.
const nested = { projects: [{ id: "p1", tasks: [{ id: 1, done: false }] }] };

// Płaski: każdy obiekt raz, projekt zna tylko identyfikatory swoich zadań.
const flat = {
  projects: { p1: { id: "p1", taskIds: [1] } },
  tasks:    { 1: { id: 1, done: false } },
};
```

Zmiana jednego elementu dotyka wtedy tylko jego wpisu i samego słownika. Dokumentacja porównuje to z **normalizacją** bazy danych, którą projektant przeprowadza, żeby zmniejszyć ryzyko błędów.

## Rozszerzenie: głęboka kopia przez `structuredClone`

Skoro płytka kopia zostawia wspólne obiekty, nasuwa się kopia pełna. Przeglądarki mają do tego funkcję `structuredClone`:

> **„Metoda `structuredClone()` tworzy głęboką kopię wartości za pomocą algorytmu klonowania strukturalnego.”**
>
> *„The `structuredClone()` method […] creates a deep clone of a value using the structured clone algorithm.”*
>
> — MDN Web Docs, *Window: structuredClone() method*

Wersja `toggleTask` mogłaby skopiować całą listę, zmienić flagę w kopii i przekazać ją do `setTasks`. Żadna wcześniejsza wersja stanu nie zostanie wtedy naruszona. Różnicę wobec `map` widać na pięciu zadaniach z `app/data/initialTasks.js`:

```js
// Przykład spoza demo: głęboka kopia listy zadań obok kopii przez map
const copy = structuredClone(tasks); // nowa tablica i pięć nowych obiektów zadań
copy[1].done = true;                 // zmiana w kopii, oryginał nietknięty
console.log(tasks[1].done, copy[0] === tasks[0]); // → false false

const viaMap = tasks.map((t) => (t.id === 2 ? { ...t, done: true } : t));
console.log(viaMap[0] === tasks[0]); // → true: niezmienione zadanie 1 to ten sam obiekt

structuredClone({ ...tasks[0], onDelete: () => {} }); // → wyjątek DataCloneError: ()=>{} could not be cloned.
```

Głęboka kopia zamienia na Rysunku 2.4 każdą przerywaną strzałkę w ciągłą. Jedno kliknięcie tworzy sześć nowych obiektów zamiast dwóch, a porównanie `prevObj === obj` uznaje niezmienione zadanie 1 za zmienione. Funkcji algorytm nie kopiuje wcale, co MDN opisuje jako ograniczenie klonowania strukturalnego.
