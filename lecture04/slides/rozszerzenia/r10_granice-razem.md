# Rozszerzenia do slajdu 10: Ładowanie i błąd wokół jednej sekcji

Powrót: [`slide_10_granice-razem.md`](../slide_10_granice-razem.md)

## Rozszerzenie: cena Promise w module

Stabilność ma cenę: dane nigdy się nie odświeżają. Promise rozstrzyga się raz i zostaje rozstrzygnięty do przeładowania strony, więc powrót z `/cart` po upływie dwóch sekund od załadowania strony pokaże od razu te same trzy produkty. W sklepie z prawdziwymi rekomendacjami byłby to błąd.

Stała w module ma jeszcze jedno ograniczenie: mieści dokładnie jeden Promise. Rekomendacje osobne dla kawy i dla herbaty potrzebowałyby osobnego Promise na każdą kategorię. Dokumentacja `use` pokazuje na to **pamięć Promise z kluczem**, czyli mapę, w której kluczem jest adres zapytania, a wartością Promise. Stała `recommendedPromise` to szczególny przypadek tej mapy z jednym kluczem.

```js
// Przykład spoza demo: pamięć Promise z kluczem, jeden Promise na kategorię
const cache = new Map();
function getRecommended(category) {
  if (!cache.has(category)) cache.set(category, fetchRecommended());
  return cache.get(category);
}

const coffee = getRecommended('coffee');
console.log(getRecommended('coffee') === coffee);  // → true: ten sam klucz, ten sam Promise
console.log(getRecommended('tea') === coffee);     // → false: osobny Promise
cache.delete('coffee');                            // unieważnienie wpisu
console.log(getRecommended('coffee') === coffee);  // → false: nowe pobieranie
```

Odświeżenie danych dokumentacja opisuje jako takie unieważnienie wpisu i nowe pobieranie wewnątrz `startTransition`, czyli aktualizacji, przy której React trzyma na ekranie poprzedni widok. W sklepie przycisk „Odśwież rekomendacje” wymagałby więc przeniesienia Promise ze stałej modułu do stanu `RecommendedSection`.

## Rozszerzenie: wartość w module serwera jest wspólna dla żądań

Wspólny Promise na serwerze jest w sklepie dopuszczalny, bo rekomendacje są takie same dla każdego i nie zawierają danych użytkownika. Każda inna zmienna modułu serwera zachowuje się tak samo:

```jsx
// Przykład spoza demo: app/visits/page.jsx, licznik w module serwera
export const dynamic = 'force-dynamic';  // render przy każdym żądaniu
let visits = 0;                          // jedna zmienna na cały proces serwera

export default function VisitsPage() {
  visits++;
  return <p>Visits: {visits}</p>;
}
// trzy osobne żądania curl, bez ciasteczek (next start) → Visits: 1, Visits: 2, Visits: 3
```

<u>Wartość w module serwera jest wspólna dla wszystkich żądań, więc nie może trzymać niczego, co należy do jednego użytkownika</u>. Koszyk tego problemu nie ma, bo żyje w `useReducer` wewnątrz `CartProvider`, czyli w stanie egzemplarza komponentu, osobnym dla każdego żądania i każdej karty.

## Rozszerzenie: komponent tylko dla przeglądarki

Dokumentacja Suspense opisuje drugi wariant. Gdy w przeglądarce render się uda, React nie pokazuje błędu użytkownikowi, bo treść ostatecznie się wyświetliła. Dokumentacja wykorzystuje to celowo: komponent, który ma działać tylko w przeglądarce, rzuca wyjątek na serwerze, a granica Suspense nad nim wstawia do HTML treść zastępczą.

```jsx
// Przykład spoza demo: komponent tylko dla przeglądarki pod granicą Suspense
function BrowserLanguage() {
  if (typeof window === 'undefined') throw new Error('BrowserLanguage renders only in the browser');
  return <p>Browser language: {navigator.language}</p>;
}

<Suspense fallback={<p>Loading language...</p>}>
  <BrowserLanguage />
</Suspense>
// HTML z serwera (curl) → Loading language...;  przeglądarka → Browser language: en-US
```

Strona musi się renderować przy żądaniu (`dynamic = 'force-dynamic'`), bo przy statycznym prerenderze `next build` przerywa budowanie tym wyjątkiem. W sklepie ten wariant nie zachodzi, bo Promise odrzuca się w obu środowiskach.
