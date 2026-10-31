# cart-app — projekt referencyjny wykładu 04

Demo live-coding: **Sklep kawowy** (koszyk): `useReducer` + kontekst + `useOptimistic` + `use` z `Suspense` + granica błędów.

Temat celowo inny niż lab 04 (Pokédex), by student przenosił pojęcia, a nie kopiował demo.

## Uruchomienie

```bash
npm install
npm run dev
# http://localhost:3000
```

## Trasy

| Trasa | Plik | Opis |
|-------|------|------|
| `/` | `app/page.jsx` | Komponent serwerowy: podsumowanie koszyka, lista produktów, rekomendacje |
| `/cart` | `app/cart/page.jsx` | Komponent kliencki: pozycje koszyka, zmiana ilości, usuwanie |

## Etapy budowy aplikacji

Kolejność i czasy: `../PROWADZACY.md` (120 min); kod każdego etapu jest też na slajdach `../../slides/`.
Projekt zawiera stan końcowy (po kroku 6.3), pliki pośrednie powstają na zajęciach.

| Etap | Slajd | Temat | Kluczowe pliki |
|------|-------|-------|----------------|
| 0 | 01 | Projekt + statyczny szkielet | `app/data/products.js`, `app/layout.jsx`, `app/page.jsx` |
| 1 | 01–03 | Reducer i `useReducer` | `app/lib/cartReducer.js`, `app/page.jsx` |
| 2 | 04–05 | Prop drilling i kontekst | `app/context/CartContext.jsx` |
| 3 | 06 | Dostawca w layoucie, komponenty z koszykiem | `app/layout.jsx`, `app/components/CartSummary.jsx`, `CartItem.jsx`, `ProductList.jsx`, `app/cart/page.jsx` |
| 4 | 07 | `useOptimistic`: koszyk optymistyczny | `app/lib/fakeApi.js`, `app/context/CartContext.jsx`, `app/components/AddToCartButton.jsx` |
| 5 | 08–10 | `use`, `Suspense`, granica błędów | `app/components/RecommendedProducts.jsx`, `ErrorBoundary.jsx`, `RecommendedSection.jsx` |
| 6 | 11–12 | Rendery kontekstu i jego podział | `app/context/CartContext.jsx` (stan osobno, funkcje osobno) |

## Zgodność ze slajdami

Pliki są kodem ze slajdów w stanie końcowym. Różnią się od bloków na slajdach tylko komentarzami (kontrola mechaniczna
porównaniem bloków kodu ze slajdów 01–12 z plikami) oraz tym, że bloki pośrednie z `useCart()` (slajdy 05–07, 11)
w stanie końcowym używają `useCartState()`, `useCartDispatch()` i `useCartOptimistic()` (slajd 12). Blok `CartContext.jsx` ze slajdu 12 ma jeszcze
tymczasowy `useCart`, którego w projekcie już nie ma.

## Uwagi

- Napis „Loading recommendations...” widać tylko pod `npm run dev`; po `next build` strona `/` jest statyczna.
- Stan koszyka żyje w pamięci otwartej strony; po F5 koszyk jest pusty (trwałość to wykład 05).
- Wersje przypięte w `package.json`: Next.js 16.4.0, React 19.3.0; Node.js >= 20.9.
