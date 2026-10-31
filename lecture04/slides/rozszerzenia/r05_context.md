# Rozszerzenia do slajdu 05: Kontekst: koszyk dostępny w całym poddrzewie

Powrót: [`slide_05_context.md`](../slide_05_context.md)

## Rozszerzenie: komponent, który czyta i dostarcza ten sam kontekst

Osobna reguła dotyczy komponentu, który kontekst jednocześnie czyta i dostarcza. `useContext` nie widzi dostawcy zwróconego przez ten sam komponent, tylko szuka wyżej:

```jsx
function SelfProvider() {
  const seen = useContext(ThemeContext); // szuka NAD SelfProvider: dostawcy nie ma, więc 'light'
  return (
    <ThemeContext value="inner">
      <p>sam widzi: {seen}</p>
      <Label />                          {/* dziecko widzi 'inner' */}
    </ThemeContext>
  );
}
// renderuje: <p>sam widzi: light</p><p>motyw: inner</p>
```

Wartość z JSX komponentu trafia do jego dzieci, a nie do niego samego, bo hook wykonuje się, zanim komponent zwróci dostawcę.

## Rozszerzenie: ten sam obiekt po obu stronach

Kontekst łączy dostawcę i odbiorcę przez tożsamość obiektu. Dokumentacja zastrzega, że przekazanie działa tylko wtedy, gdy dostawca i komponent czytający używają dokładnie tego samego obiektu, porównanego operatorem `===`. Każde wywołanie `createContext` tworzy nowy obiekt:

```js
const a = createContext(null);
const b = createContext(null);
console.log(a === b); // false: dwa wywołania, dwa niezależne kanały
```

Stąd zalecenie dokumentacji, żeby wywoływać `createContext` poza komponentami. Wywołanie w ciele komponentu tworzyłoby przy każdym renderze nowy obiekt, czyli za każdym razem inny kontekst. Odbiorca szukałby wtedy dostawcy kanału, którego nikt już nie dostarcza.

## Rozszerzenie: dwie kopie modułu z kontekstem

Ten sam warunek tłumaczy rzadszą awarię. Narzędzie budujące może przez dowiązania symboliczne (pliki wskazujące na inny katalog) umieścić w paczce dwie kopie modułu z kontekstem. Każda kopia wywołuje własne `createContext`, więc powstają dwa różne obiekty. Skutek da się odtworzyć dosłowną kopią pliku z kontekstem:

```jsx
// Przykład spoza demo: CartContextCopy.jsx to dosłowna kopia CartContext.jsx
import { useCartState } from './CartContextCopy';   // dostawca w layoucie pochodzi z CartContext.jsx

function Badge() {
  const cart = useCartState();                      // szuka dostawcy z kopii: nie ma go nad Badge
  return <p>Items: {cart.items.length}</p>;
}
// <ErrorBoundary><Badge /></ErrorBoundary> → Something went wrong: useCartState must be used inside <CartProvider>

// diagnoza z dokumentacji: obie kopie zapisują swój obiekt w window, porównanie w konsoli przeglądarki
window.ctxMain === window.ctxCopy;                  // → false
```

Dostawca korzysta z jednej kopii, odbiorca z drugiej i nie znajduje dostawcy. Dokumentacja radzi właśnie takie porównanie przez `===`: wynik `false` oznacza dwa obiekty kontekstu w paczce.

## Rozszerzenie: wiele egzemplarzy jednego dostawcy

`CartProvider` to zwykły komponent, więc można go wyrenderować więcej niż raz. Każdy egzemplarz wywołuje własny `useReducer` i ma własny koszyk. Morten Barklund w *React in Depth* wykorzystuje tę cechę celowo. Formularz śniadania w jego przykładzie ma cztery grupy przycisków radiowych na jednej stronie. Każda grupa jest osobnym dostawcą z własnym zaznaczeniem, więc opcje kawy nie widzą zaznaczenia w grupie pieczywa.

```jsx
// Przykład spoza demo: dwa egzemplarze CartProvider obok siebie
<CartProvider>
  <CartSummary />
  <AddToCartButton product={products[0]} />   {/* kawa */}
</CartProvider>
<CartProvider>
  <CartSummary />
</CartProvider>
// kliknięcie i 1,5 s → pierwszy: Cart: 1 pcs — 49.99 PLN, drugi: Cart: 0 pcs — 0.00 PLN
```

Koszyk sklepu korzysta z drugiej skrajności: jeden egzemplarz dostawcy obejmuje wszystkie komponenty, które go czytają.
