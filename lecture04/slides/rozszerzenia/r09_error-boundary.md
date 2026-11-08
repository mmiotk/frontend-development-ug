# Rozszerzenia do slajdu 09: Granica błędów: awaria jednej sekcji zamiast całej strony

Powrót: [`slide_09_error-boundary.md`](../slide_09_error-boundary.md)

## Rozszerzenie: jak granica wraca do pracy

Granica w sklepie nie ma przycisku ponowienia. Błąd raz zapisany w `state.error` zostaje, dopóki egzemplarz granicy żyje. Poprawione dziecko niczego nie zmienia, bo `render` granicy dalej widzi wypełnione `state.error`. Stan da się wyczyścić z zewnątrz, zmieniając `key`:

```jsx
// nowy key: React odmontowuje starą granicę i montuje nową, ze stanem początkowym
<ErrorBoundary key={attempt}>
  <Flaky />
</ErrorBoundary>
```

Z tym samym `key` granica po naprawie dziecka nadal pokazuje „Something went wrong: first failure”. Po zmianie `key` React tworzy nowy egzemplarz klasy, a ten renderuje już poprawne dziecko.

Biblioteka `react-error-boundary`, polecana przez dokumentację Reacta, ma ponowienie wbudowane. Według jej README treść zastępcza dostaje funkcję `resetErrorBoundary`, która czyści błąd i ponawia render poddrzewa, a prop `resetKeys` robi to samo po zmianie wskazanej wartości.

## Rozszerzenie: konstruktor i `componentDidCatch`

Granica w sklepie ustawia stan polem `state = { error: null };` i niczego nie raportuje. Starszy zapis robi to samo w konstruktorze, a `componentDidCatch` dokłada efekt uboczny po złapaniu błędu. Poniższa granica nie należy do projektu:

```jsx
// Przykład spoza demo: granica z konstruktorem i metodą componentDidCatch
class LoggingBoundary extends Component {
  constructor(props) {
    super(props);                    // konstruktor Component zapisuje propsy w this.props
    this.state = { error: null };    // to samo co pole state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  // React wywołuje ją po zatwierdzeniu zmian, więc wolno tu wykonać efekt uboczny.
  componentDidCatch(error, info) {
    const first = info.componentStack.trim().split('\n')[0].trim().split(' (')[0];
    console.log('caught:', error.message, '|', first); // → caught: first failure | at Flaky
  }

  render() {
    if (this.state.error) return <p>Something went wrong: {this.state.error.message}</p>;
    return this.props.children;
  }
}
```

Dla dziecka `Flaky`, które rzuca `new Error('first failure')`, konsola dostaje jeden wpis, a ekran pokazuje „Something went wrong: first failure”. Obiekt `info.componentStack` zaczyna się od komponentu, który rzucił wyjątek (`at Flaky`), i idzie w górę drzewa. W aplikacji produkcyjnej tu stałoby wysłanie raportu do serwisu analitycznego.

Wywołanie `super(props)` w konstruktorze jest obowiązkowe. Klasa pochodna, która sięgnie po `this` przed `super`, kończy się wyjątkiem `ReferenceError: Must call super constructor in derived class before accessing 'this' or returning from derived constructor`. Pole `state = …` tego problemu nie ma, bo JavaScript sam wstawia konstruktor, który woła `super(...args)`.
