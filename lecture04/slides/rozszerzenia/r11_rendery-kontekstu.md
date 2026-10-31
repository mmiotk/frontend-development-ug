# Rozszerzenia do slajdu 11: Kto renderuje się po zmianie kontekstu

Powrót: [`slide_11_rendery-kontekstu.md`](../slide_11_rendery-kontekstu.md)

## Rozszerzenie: druga pułapka, czyli nowy obiekt bez zmiany danych

W sklepie `CartProvider` renderuje się tylko po zmianie koszyka, prawdziwego albo optymistycznego. Wystarczy jednak dodać mu własny stan, na przykład `isCartOpen` dla wysuwanego panelu, żeby problem się rozszerzył. Dokumentacja opisuje ten sam przypadek na przykładzie kontekstu logowania:

> **„Za każdym razem, gdy `MyApp` renderuje się ponownie, na przykład po zmianie trasy, powstaje inny obiekt wskazujący na inną funkcję, więc React musi ponownie wyrenderować wszystkie komponenty w głębi drzewa, które wywołują `useContext(AuthContext)`.”**
>
> *„Whenever MyApp re-renders (for example, on a route update), this will be a different object pointing at a different function, so React will also have to re-render all components deep in the tree that call useContext(AuthContext).”*
>
> — dokumentacja React, *useContext*

```jsx
// Przykład spoza demo: CartProvider z jednym kontekstem i stanem panelu
const [isCartOpen, setIsCartOpen] = useState(false);
return (
  <CartContext value={{ cart: optimisticCart, dispatch, addOptimistic, isCartOpen, setIsCartOpen }}>
    {children}
  </CartContext>
);
// jedno kliknięcie przełącznika panelu, koszyk bez zmian (next dev):
// AddToCartButton render 1 … 5 → po 2 wpisy, CartSummary render → 2 wpisy
```

Koszyk się nie zmienił, a wszyscy konsumenci wyrenderowali się ponownie, bo literał wartości powstał od nowa. Pułapka dotyczy tylko obiektów, tablic i funkcji: dla napisu, jak `value={theme}` z kontekstu motywu w dokumentacji `useContext`, `Object.is` porównuje samą wartość i ponowny render dostawcy nie dotyka konsumentów.

## Rozszerzenie: wartość, która zmienia się bardzo często

Z reguły porównania wynika jeszcze jedno kryterium. Liczba zbędnych renderów to liczba konsumentów pomnożona przez liczbę zmian wartości. Koszyk zmienia się po kliknięciu, czyli rzadko. Barklund przyznaje, że walka o dodatkowe rendery jednego komponentu może wyglądać na przesadną optymalizację. Ostrzega jednak przed skalą:

> **„W dużej aplikacji z wieloma kontekstami te dodatkowe aktualizacje jednak szybko się sumują!”**
>
> *„In a large application with many contexts, however, these extra updates add up quickly!”*
>
> — Morten Barklund, *React in Depth*

Tekst pola wyszukiwania w tym samym kontekście co koszyk zmienia wartość przy każdym znaku.

```jsx
// Przykład spoza demo: tekst wyszukiwania w tym samym kontekście co koszyk
const [query, setQuery] = useState('');
<CartContext value={{ cart: optimisticCart, dispatch, addOptimistic, query, setQuery }}>

// SearchBox, czyli pole nad listą produktów:
<input value={query} onChange={e => setQuery(e.target.value)} />
// wpisanie „tea” (next dev) → po 6 wpisów z każdego z 5 przycisków i z CartSummary, razem 36
```

<u>Wartość zmieniana przy każdym zdarzeniu nie powinna dzielić kontekstu z wartością czytaną przez wielu konsumentów</u>. Tekst w polu wyszukiwania zostaje w stanie komponentu, który go pokazuje.

## Rozszerzenie: rendery, które przychodzą od rodzica

Kontekst to nie jedyne źródło renderu. Na stronie `/cart` każdy `CartItem` czyta z kontekstu tylko `dispatch`, ale renderuje go `CartPage`, który czyta stan koszyka. Zmiana ilości jednej pozycji renderuje `CartPage`, a ten tworzy od nowa elementy wszystkich wierszy, tak jak `PanelInline` tworzy `<Child />`.

```jsx
// Przykład spoza demo: licznik renderów w CartItem
export default function CartItem({ item }) {
  const dispatch = useCartDispatch();
  console.log('CartItem render', item.id);
  // ...
}
// trzy pozycje, ilość kawy zmieniona na 2 (next dev) → CartItem render 1, 2 i 3: po 2 wpisy
// to samo z export default memo(CartItem)          → tylko CartItem render 1: 2 wpisy
```

Ten render przychodzi od rodzica, więc żadna zmiana w kontekście go nie usunie, a `memo` go zatrzymuje, bo reducer zostawia pozostałe pozycje tymi samymi obiektami. Wpis w konsoli mówi tylko, że komponent się wyrenderował, a nie dlaczego.
