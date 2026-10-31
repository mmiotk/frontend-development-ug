# Rozszerzenia do slajdu 07: Koszyk, który odpowiada przed serwerem

Powrót: [`slide_07_useoptimistic.md`](../slide_07_useoptimistic.md)

## Rozszerzenie: pozycja oznaczona jako niepotwierdzona

Reducer stanu optymistycznego nie musi być tym samym reducerem co prawdziwy. Dokumentacja pokazuje wariant, w którym pozycja tymczasowa niesie flagę. Poniższy fragment nie należy do projektu:

```jsx
// Rozszerzenie spoza demo: optymistyczne wiersze z flagą, wzór z dokumentacji useOptimistic.
const [optimisticItems, addOptimisticItem] = useOptimistic(
  items,
  (currentItems, product) => [
    ...currentItems,
    { ...product, qty: 1, pending: true }, // pending: serwer jeszcze nie potwierdził
  ]
);
```

Wiersz z polem `pending: true` może pokazać dopisek „(dodawanie)” albo szarszy kolor. Gdy rodzic zapisze potwierdzoną pozycję w `items`, na ekranie zostaje wersja bez flagi. Użytkownik widzi wtedy nie tylko wynik, ale i to, że nie jest on jeszcze pewny.

## Rozszerzenie: dwa przyciski w tym samym czasie

Każde kliknięcie uruchamia osobne przejście, ale przejścia nie są od siebie niezależne. Dokumentacja `startTransition` mówi, że przy kilku trwających przejściach React obecnie łączy je w jedno (*„React currently batches them together”*) i nazywa to ograniczeniem, które może zniknąć w przyszłych wersjach. Gdy obie akcje się udają, skutku nie widać. Widać go, gdy pierwsza akcja kończy się błędem:

```jsx
// Przykład spoza demo: w AddToCartButton kawa kończy się błędem, herbata nie
await fakeAddToCart(product, product.id === 1);   // kawa: odrzucenie po 1,5 s

// kawa w chwili 0, herbata 0,8 s później; nagłówek CartSummary i komunikat przy kawie:
// 0,05 s → Cart: 1 pcs — 49.99 PLN
// 0,87 s → Cart: 2 pcs — 68.49 PLN
// 1,55 s → Cart: 2 pcs — 68.49 PLN, przy kawie: Error: Network error — could not add the product
// 2,37 s → Cart: 1 pcs — 18.50 PLN
```

Przez 0,8 s nagłówek liczy kawę, choć przy niej stoi już komunikat błędu, bo akcja tymczasowa kawy czeka na koniec przejścia herbaty. <u>Wartość tymczasowa trwa do końca wszystkich połączonych przejść</u>, a nie tylko własnej akcji.
