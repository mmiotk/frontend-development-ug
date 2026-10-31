# Rozszerzenia do slajdu 09: Granica błędów: awaria jednej sekcji zamiast całej strony

Powrót: [`slide_09_error-boundary.md`](../slide_09_error-boundary.md)

## Rozszerzenie: jak granica wraca do pracy

Granica w sklepie nie ma przycisku ponowienia. Flaga `hasError` raz ustawiona zostaje, dopóki egzemplarz granicy żyje. Poprawione dziecko niczego nie zmienia, bo `render` granicy dalej widzi `hasError: true`. Stan da się wyczyścić z zewnątrz, zmieniając `key`:

```jsx
// nowy key: React odmontowuje starą granicę i montuje nową, ze stanem początkowym
<ErrorBoundary key={attempt}>
  <Flaky />
</ErrorBoundary>
```

Z tym samym `key` granica po naprawie dziecka nadal pokazuje „Something went wrong: raz”. Po zmianie `key` React tworzy nowy egzemplarz klasy, a ten renderuje już poprawne dziecko.

Biblioteka `react-error-boundary`, polecana przez dokumentację Reacta, ma ponowienie wbudowane. Według jej README treść zastępcza dostaje funkcję `resetErrorBoundary`, która czyści błąd i ponawia render poddrzewa, a prop `resetKeys` robi to samo po zmianie wskazanej wartości.
