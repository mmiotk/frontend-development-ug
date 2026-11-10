# cart-app — projekt referencyjny wykładu 04

Demo live-coding: **Sklep kawowy** (koszyk): `useReducer` + kontekst + `useOptimistic` + `use` z `Suspense` + granica błędów + podział kontekstu na trzy.

Temat celowo inny niż lab 04 (Pokédex), by student przenosił pojęcia, a nie kopiował demo.

## Uruchomienie

```bash
npm install
npm run dev
# http://localhost:3000
node cart.test.mjs   # test reducera bez Reacta (krok 1.7)
```

## Trasy

| Trasa | Plik | Opis |
|-------|------|------|
| `/` | `app/page.jsx` | Komponent serwerowy: podsumowanie koszyka, lista produktów z przyciskami, rekomendacje |
| `/cart` | `app/cart/page.jsx` | Komponent kliencki: podsumowanie, pozycje koszyka, usuwanie, „Clear cart” |
| `/server-client` | `app/server-client/page.jsx` | Komponent serwerowy `ServerInfo` (`node:os`) w kliencie `ClientBox` przez `children`; bez linku w nawigacji |

## Etapy budowy aplikacji

Kolejność i czasy: `../PROWADZACY.md` (120 min, kod pisany ręcznie); kod każdego etapu jest też na slajdach `../../slides/`.
Projekt zawiera stan końcowy (po kroku 6.5): 13 plików w `app/` (267 linii) oraz `cart.test.mjs` (9 linii). Pliki pośrednie powstają na zajęciach.

| Etap | Slajd | Temat | Nowe pliki |
|------|-------|-------|------------|
| 0 | 01 | Projekt i nawigacja (projekt i `products.js` gotowe przed wykładem) | `app/data/products.js`, `app/layout.jsx`, `app/page.jsx` |
| 1 | 01–03 | Reducer, `useReducer`, test reducera | `app/lib/cartReducer.js`, `cart.test.mjs` (krok 1.5 to tymczasowa trasa `app/reducer-vs-state/`, usuwana na końcu kroku) |
| 2 | 04–05 | Prop drilling i kontekst | `app/context/CartContext.jsx` |
| 3 | 06 | Dostawca w layoucie, serwer i klient, komponenty z koszykiem | `app/server-client/ClientBox.jsx`, `page.jsx`, `app/components/CartSummary.jsx`, `AddToCartButton.jsx`, `app/cart/page.jsx` |
| 4 | 07 | `useOptimistic`: koszyk optymistyczny | `app/lib/fakeApi.js` (zmiany w `CartContext.jsx` i `AddToCartButton.jsx`; krok 4.2 to przejściowy przycisk bez `useOptimistic`) |
| 5 | 08–10 | `use`, `Suspense`, granica błędów | `app/components/Recommended.jsx`, `ErrorBoundary.jsx` |
| 6 | 11–12 | Pomiar renderów i podział kontekstu | zmiany w `CartContext.jsx` (trzy konteksty, hooki `useCartState`, `useCartDispatch`, `useCartOptimistic`) i u trzech konsumentów; dwa `console.log` z kroku 6.1 są usuwane w 6.5 |

## Zgodność ze slajdami

Pliki są kodem ze slajdów w stanie końcowym. Różnią się od bloków na slajdach tylko komentarzami (po angielsku w projekcie, po polsku na slajdach) oraz
poniższymi odstępstwami:

- **Slajd 02, `reducer-vs-state` (krok 1.5).** Slajd ma dwa osobne komponenty (`Counter` z jednym `dispatch` i `console.log(n)`, `Both` z dwoma `dispatch`
  i dwoma `setM`). Demo składa je w jeden komponent `Both` z `console.log(n)` na końcu `handleClick`; konsola wypisuje wtedy 0 przy pierwszym kliknięciu
  i 2 przy drugim (slajd: 0 i 1 dla pojedynczego `dispatch`). Trasa jest tymczasowa i nie wchodzi do stanu końcowego.
- **Slajd 03, `cart.test.mjs` (krok 1.7).** Kod 1:1; plik leży w katalogu głównym projektu, obok `package.json`.
- **Slajd 06, `server-client/` (krok 3.2).** Kod 1:1 (funkcja strony nazywa się `Page`), podzielony na `ClientBox.jsx` i `page.jsx` w katalogu trasy.
  Trasa istnieje w stanie końcowym, ale nie ma linku w nawigacji.
- **Slajdy 11–12 (segment 6).** Slajd 11 pokazuje `console.log` w jednym komponencie; demo wstawia go w dwóch (`AddToCartButton`, `CartSummary`) i po pomiarze usuwa,
  więc w projekcie ich nie ma. Slajd 12 opisuje `useCartState()` i `useCartOptimistic()` słowami („wyglądają tak samo”); w projekcie są napisane w całości,
  każdy z własnym strażnikiem i komunikatem `use… must be used inside <CartProvider>`. Hook `useCart()` z segmentów 2–5 nie istnieje w stanie końcowym.

## Uwagi

- Napis „Loading recommendations...” widać pod `npm run dev` przy pierwszym wejściu po starcie serwera i po zapisaniu pliku; po `next build` strona `/` jest statyczna.
- Stan koszyka żyje w pamięci otwartej strony; po F5 koszyk jest pusty (trwałość to wykład 05).
- Wersje przypięte w `package.json`: Next.js 16.4.0, React 19.3.0; Node.js >= 20.9.
- `node cart.test.mjs` wypisuje ostrzeżenie `MODULE_TYPELESS_PACKAGE_JSON` (w `package.json` nie ma `"type": "module"`); test przechodzi z kodem wyjścia 0.
