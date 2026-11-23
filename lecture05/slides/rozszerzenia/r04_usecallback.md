# Rozszerzenia do slajdu 04: `useCallback`: ta sama funkcja między renderami

Powrót: [`slide_04_usecallback.md`](../slide_04_usecallback.md)

## Rozszerzenie: co React robi z funkcją na elemencie HTML

Kumar wyjaśnia, dlaczego nowa funkcja na przycisku nic nie kosztuje. React nie podpina jej bezpośrednio do węzła przycisku. Nasłuchuje wszystkich zdarzeń jednego rodzaju w korzeniu aplikacji i stamtąd wywołuje właściwą funkcję:

```jsx
// Przykład spoza demo: gdzie React podpina onClick przycisku „Usun”
const targets = []; // węzły, na których wywołano addEventListener('click')
const original = EventTarget.prototype.addEventListener;
EventTarget.prototype.addEventListener = function (type, fn, options) {
  if (type === 'click') targets.push(this.nodeName);
  return original.call(this, type, fn, options);
};

const { rerender } = render(<ContactItem contact={initialContacts[0]} onDelete={() => {}} />);
console.log(targets);        // → [ 'DIV', 'DIV' ]: kontener korzenia, faza bąbelkowania i przechwytywania
rerender(<ContactItem contact={initialContacts[0]} onDelete={() => {}} />); // nowa funkcja onDelete
console.log(targets.length); // → 2: żadnego nowego słuchacza
```

Przycisk nie dostaje własnego słuchacza, więc nowa funkcja po renderze po prostu zastępuje starą, bez żadnego porównania.

## Rozszerzenie: funkcja zwracana z własnego hooka

Dokumentacja zaleca, żeby własny hook owijał w `useCallback` każdą funkcję, którą zwraca. Jej przykładem jest hook nawigacji z funkcjami `navigate` i `goBack`, obie z zależnością `[dispatch]`. Uzasadnienie brzmi:

> **„Dzięki temu konsumenci twojego hooka mogą w razie potrzeby optymalizować własny kod.”**
>
> *„This ensures that the consumers of your Hook can optimize their own code when needed.”*
>
> — dokumentacja Reacta, *useCallback*

```jsx
// Przykład spoza demo: własny hook wyszukiwania, który zwraca funkcję clear
function useContactSearch() {
  const [query, setQuery] = useState('');
  const clear = useCallback(() => setQuery(''), []); // setQuery jest stabilne, więc []
  return { query, setQuery, clear };
}

const { result } = renderHook(() => useContactSearch()); // hook bez komponentu
const first = result.current.clear;
act(() => result.current.setQuery('ann'));               // nowy render hooka
console.log(result.current.query);                       // → ann
console.log(result.current.clear === first);             // → true
```

Bez `useCallback` to samo porównanie daje `false`. Autor hooka nie wie, czy ktoś przekaże `clear` do komponentu w `memo` albo do tablicy zależności efektu, a stabilna tożsamość zostawia tę decyzję użytkownikowi hooka.
