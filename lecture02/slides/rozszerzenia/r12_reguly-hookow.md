# Rozszerzenia do slajdu 12: Reguły hooków i ich powód

Powrót: [`slide_12_reguly-hookow.md`](../slide_12_reguly-hookow.md)

## Rozszerzenie: wczesny return przed hookami

Ten sam mechanizm stoi za zakazem hooka po wczesnym `return`. Zabezpieczenie `if (!initialTasks) return null;` wstawione na początku `TaskBoard`, nad wywołaniem `useTasks`, wygląda niewinnie. Gdy strona przekaże pustą wartość, render kończy się przed wszystkimi hookami. Gdyby przy następnym renderze dane już były, React dostałby osiem wywołań tam, gdzie poprzednio nie było żadnego.

Ten przypadek zachowuje się inaczej niż hook w warunku. Gdy komponent nadrzędny podaje `TaskBoard` raz listę, a raz `undefined`, serwer deweloperski nie pokazuje tabeli z kolejnością hooków ani żadnego wpisu w konsoli. Przy przejściu od ośmiu hooków do zera lista po prostu znika, a przy przejściu od zera do ośmiu React zakłada pozycje od nowa, jak przy pierwszym renderze. Render zakończony przed pierwszym hookiem nie zostawia żadnej pozycji do porównania, więc nie ma czego zgłosić. Taki błąd najpewniej łapie linter. Wskazuje go przy każdym wywołaniu hooka pod wczesnym `return`, komunikatem „React Hook "useTasks" is called conditionally” i dalej „Did you accidentally call a React Hook after an early return?”. Takie zabezpieczenie stawia się pod ostatnim hookiem.

```jsx
// Przykład spoza demo: zabezpieczenie przed brakiem danych pod ostatnim hookiem TaskBoard.
const {
  visibleTasks, filter, setFilter, counts, addTask, toggleTask, deleteTask, clearDone,
} = useTasks(initialTasks ?? []); // hook zawsze; ?? podstawia [] za undefined

const [text, setText] = useState("");
const inputRef = useRef(null);
useEffect(() => { /* tytuł karty jak dotąd */ }, [counts.pending]);

if (!initialTasks) return null; // wczesny return dopiero pod ósmym hookiem
```

```text
zadanie 1 zaznaczone, potem dane: lista → undefined → lista
undefined   → TaskBoard nie renderuje niczego, konsola bez ostrzeżeń Reacta
lista       → pięć zadań, zadanie 1 dalej zaznaczone, 4 pending / 5 total
linter      → 0 zgłoszeń reguły rules-of-hooks
```

W każdym renderze wywołuje się wszystkie osiem hooków, więc pozycje i stan listy przetrwają przerwę w danych. Druga droga to warunek w komponencie nadrzędnym, który nie renderuje `TaskBoard` bez danych.
