# Rozszerzenia do slajdu 06: Dane, które przetrwają przejście między stronami

Powrót: [`slide_06_dane-w-module.md`](../slide_06_dane-w-module.md)

## Rozszerzenie: jak React czyta zewnętrzny magazyn

Dane trzymane poza Reactem dokumentacja nazywa **zewnętrznym magazynem** (*external store*), a do ich odczytu służy hook `useSyncExternalStore`. Hook przyjmuje funkcję `subscribe`, przez którą komponent zapisuje się na powiadomienia o zmianie, i funkcję `getSnapshot`, która odczytuje bieżącą wartość. Gdy zwrócona wartość jest inna w porównaniu `Object.is`, React renderuje komponent ponownie. Migawka musi być niezmienna, co `store.js` spełnia, bo `addIssue` podmienia całą tablicę. Funkcję `subscribe` deklaruje się poza komponentem. Dokumentacja ostrzega, że nowa funkcja przy kolejnym renderze każe Reactowi zapisać się do magazynu od nowa. Szkic takiego magazynu:

```js
// Rozszerzenie spoza demo: magazyn, który powiadamia o zmianach.
const listeners = new Set();               // zbiór funkcji do powiadomienia

export function subscribe(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback); // funkcja wypisania
}

// w addIssue, po podmianie tablicy:
  listeners.forEach((notify) => notify()); // React dowiaduje się o zmianie

// w komponencie klienckim; trzeci argument to migawka dla renderu na serwerze:
// const issues = useSyncExternalStore(subscribe, getIssues, getIssues);
```

Lista zbudowana w ten sposób odświeżyłaby się także wtedy, gdy formularz stałby na tej samej stronie.

## Rozszerzenie: wspólne dane kart przez `localStorage`

Magazyn na `localStorage` daje wspólne dane kart, a zdarzenie `storage` powiadamia pozostałe karty o zmianie. W magazynie z subskrypcją wystarczy dopisać w `subscribe` wywołanie `window.addEventListener("storage", callback)`. Odczyt ma pułapkę po stronie `getSnapshot`. React porównuje kolejne migawki przez `Object.is`, a `JSON.parse` przy każdym wywołaniu buduje nową tablicę, nawet z tego samego napisu. Dla Reacta każda migawka wygląda więc na zmianę, a każda zmiana wymusza kolejny render. React 19.3.0 w trybie deweloperskim ostrzega, że wynik `getSnapshot` trzeba zapamiętać, bo inaczej powstanie pętla (*„The result of getSnapshot should be cached to avoid an infinite loop”*). Sam render przerywa błędem *Maximum update depth exceeded*. Wyjściem jest pamięć podręczna w module: ostatni napis i ostatnia tablica.

```js
// getSnapshot z pamięcią: parsuje tylko wtedy, gdy napis w localStorage się zmienił.
let lastText = null, lastIssues = [];
export function getSnapshot() {
  const text = localStorage.getItem("issues");
  if (text !== lastText) { lastText = text; lastIssues = JSON.parse(text ?? "[]"); }
  return lastIssues;   // ten sam obiekt, dopóki dane się nie zmienią
}
```
