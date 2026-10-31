# Rozszerzenia do slajdu 02: `useReducer`: strona wysyła akcje, reducer liczy stan

Powrót: [`slide_02_usereducer.md`](../slide_02_usereducer.md)

## Rozszerzenie: trzeci argument `init`

Trzeci, opcjonalny argument `init` wylicza stan początkowy z drugiego argumentu. Dokumentacja opisuje regułę tak: bez `init` stanem początkowym jest `initialArg`, a z nim wynik wywołania `init(initialArg)`. React wywołuje tę funkcję tylko przy pierwszym renderze, a w trybie ścisłym, jak reducer, dwa razy.

Różnica wobec leniwego inicjalizatora `useState` leży w argumencie. Funkcja przekazana do `useState` nie dostaje niczego, a `init` dostaje `initialArg`. Można więc przekazać osobno funkcję i dane, z których ma policzyć stan, bez opakowywania jej w funkcję strzałkową. Poniższy kod nie należy do projektu. Pokazuje koszyk, który startuje z listy produktów przekazanej w propsie:

```jsx
// Spoza demo: koszyk startowy buduje sam reducer, raz, przy pierwszym renderze.
function createInitialCart(savedProducts) {
  return savedProducts.reduce(
    (state, product) => cartReducer(state, { type: 'ADD_ITEM', product }),
    initialCartState
  );
}

function CartPage({ savedProducts }) {
  // Drugi argument to dane, trzeci to funkcja, która z nich liczy stan.
  const [cart, dispatch] = useReducer(cartReducer, savedProducts, createInitialCart);
  // ...
}
```

Funkcja `createInitialCart` nie zna żadnej reguły koszyka. Przepuszcza zapisane produkty przez `cartReducer`, więc lista `[kawa, herbata, kawa]` daje dwie pozycje, w tym kawę z `qty: 2`. Reguła koszyka obowiązuje więc już przy starcie, a nie dopiero od pierwszego kliknięcia. Gdy funkcja nie potrzebuje danych, dokumentacja pozwala przekazać `null` jako drugi argument. Pusty koszyk sklepu niczego nie wylicza, więc strona przekazuje gotowy obiekt `initialCartState`.

## Rozszerzenie: trzy przypadki, których reguła nie przewidziała

Reguła w reducerze działa przy każdej zmianie, także wtedy, gdy nikt tego nie planował. Pole ilości z konwersją przez `Number` ma trzy zachowania warte znajomości.

- **Pole nie daje się opróżnić.** Backspace na wartości 1 daje pusty tekst, `Number('')` zwraca 0, reducer zamienia je na 1 i pole od razu znów pokazuje 1. Żeby wpisać 3, trzeba zaznaczyć zawartość i wpisać nową liczbę. Dopisanie 5 za cyfrą 3 daje 35.
- **Ułamek przechodzi.** Wpisanie 1.5 zostawia w stanie `qty: 1.5`, a wiersz pokazuje „= 74.98 PLN”. `Math.max(1, 1.5)` pilnuje tylko dolnej granicy. Reguły „ilość jest liczbą całkowitą” w reducerze nie ma, więc nie działa.
- **Liczba ujemna znika.** Wklejenie −2 daje w polu 1, tak samo jak zero. Przy pisaniu znak po znaku sam minus daje pusty tekst, więc pole wraca do 1, a następna cyfra dopisuje się do niego i wychodzi 12.

Pierwszy przypadek zależy od wyboru `Number`. Pole liczbowe ma też właściwość `valueAsNumber`, która od razu daje liczbę. MDN opisuje jednak jej zachowanie przy pustym polu inaczej.

> **„Jeśli usunie się liczbę z kontrolki, wynikiem jest NaN.”**
>
> *„If you delete the number in the widget, the result is NaN.”*
>
> — MDN, *HTMLInputElement: valueAsNumber property*

`Math.max` zwraca `NaN`, gdy którykolwiek argument jest `NaN`, więc reguła minimum przestaje działać:

```js
Math.max(1, NaN);   // NaN: dolna granica nie pomaga
cartReducer(s, { type: 'UPDATE_QTY', id: 1, qty: NaN }).items;
// [{ id: 1, name: 'Coffee', price: 49.99, qty: NaN }]
```

Wersja z `valueAsNumber` zapisałaby więc w stanie `qty: NaN`, a wiersz pokazałby „= NaN zł”. Natomiast `Number('')` daje 0, które reguła minimum zamienia na 1. Konwersja w komponencie i reguła w reducerze działają razem i każda z nich zmienia wynik. Uzupełnienie reguły o liczby całkowite wymagałoby zmiany jednej gałęzi `UPDATE_QTY`, bez dotykania komponentu.
