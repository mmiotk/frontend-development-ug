# cart-app — projekt referencyjny wykładu 04

Demo live-coding: **Shopping Cart** — `useReducer` + Context API + `useOptimistic` + Suspense/Error Boundary.

Temat celowo inny niż lab 04 (Pokédex), by student przenosił pojęcia, a nie kopiował demo.

## Uruchomienie

```bash
npm install
npm run dev
# http://localhost:3000
```

## Struktura

```
app/
  layout.jsx              Root layout — CartProvider owija całe drzewo
  page.jsx                Strona główna — lista produktów + podsumowanie koszyka + rekomendacje
  globals.css             Celowo pusty — zero stylowania
  cart/page.jsx           Strona koszyka — szczegóły pozycji, zmiana ilości, usuwanie
  data/products.js        Statyczny katalog produktów
  lib/
    cartReducer.js        Czysty reducer: ADD_ITEM / REMOVE_ITEM / UPDATE_QTY / CLEAR_CART
    fakeApi.js            Symulowane opóźnienia sieciowe (bez fetch)
  context/
    CartContext.jsx       createContext + CartProvider + useCartState + useCartDispatch
  components/
    CartSummary.jsx       Suma i liczba pozycji — czyta CartStateContext
    CartItem.jsx          Wiersz pozycji: zmiana ilości, usuwanie — czyta CartDispatchContext
    ProductList.jsx       Lista produktów z AddToCartButton
    AddToCartButton.jsx   useOptimistic — natychmiastowe UI + rollback
    RecommendedSection.jsx  Wrapper: Suspense + ErrorBoundary
    RecommendedProducts.jsx use() — zawiesza się do czasu rozwiązania promise
    ErrorBoundary.jsx     Klasa React łapiąca błędy renderowania
```

## Wymagania wstępne

React 19.3.0, Next.js 16.4.0 (wersje przypięte w `package.json`), Node.js >= 20.
