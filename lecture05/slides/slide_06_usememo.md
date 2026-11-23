# `useMemo`: zapamiętany wynik obliczenia

## Obliczenie, które wykonuje się przy każdym renderze

Po dodaniu `memo` i `useCallback` w `app/page.jsx` zostaje jedna linia, która nie korzysta z żadnej memoizacji:

```jsx
const filtered = filterContacts(contacts, query); // wykonuje się przy każdym renderze
```

Każde wywołanie `HomePage` filtruje listę od nowa. Filtrowanie ma przy tym tylko dwa wejścia: tablicę `contacts` i tekst `query`. Jeśli żadne z nich się nie zmieniło, wynik musi być taki sam, bo `filterContacts` jest czystą funkcją, czyli jej wynik zależy tylko od argumentów. To dokładnie sytuacja, którą obsługuje hook `useMemo`.

## Czym jest `useMemo`

Hook **`useMemo`** przechowuje wynik obliczenia. Samej funkcji obliczającej nie zapamiętuje. Wywołuje się go jako `useMemo(calculateValue, dependencies)`. Pierwszy argument dokumentacja Reacta opisuje tak:

> **„`calculateValue`: funkcja obliczająca wartość, którą chcesz zapamiętać. Powinna być czysta, nie powinna przyjmować argumentów i może zwracać wartość dowolnego typu. React wywoła ją przy pierwszym renderze. Przy kolejnych renderach zwróci tę samą wartość, jeśli zależności nie zmieniły się od ostatniego renderu.”**
>
> *„calculateValue: The function calculating the value that you want to cache. It should be pure, should take no arguments, and should return a value of any type. React will call your function during the initial render. On next renders, React will return the same value again if the dependencies have not changed since the last render.”*
>
> — dokumentacja Reacta, *useMemo*

Drugi argument to tablica zależności, taka sama jak w `useEffect` i `useCallback`: React porównuje każdą jej pozycję z poprzednim renderem funkcją `Object.is`. Najmniejszy przykład spoza `contacts-app` liczy wywołania obliczenia. Ma też drugi stan, od którego obliczenie nie zależy:

```jsx
import { useMemo, useState } from 'react';

let calls = 0;                                // licznik wywołań obliczenia
const square = (n) => { calls++; return n * n; };

function Square() {
  const [n, setN] = useState(3);
  const [dark, setDark] = useState(false);
  const sq = useMemo(() => square(n), [n]);   // liczy tylko po zmianie n
  return (
    <div>
      <button onClick={() => setDark(!dark)}>motyw</button>  {/* nowy render, calls nadal 1 */}
      <button onClick={() => setN(n + 1)}>n+1</button>        {/* n z 3 na 4: calls 2, sq 16 */}
      <p>{sq}</p>
    </div>
  );
}
```

Liczby w komentarzach dotyczą środowiska testowego. W trybie ścisłym `next dev` React wywołuje obliczenie przy zamontowaniu dwa razy, więc licznik startuje od 2.

Gdy którakolwiek zależność się zmieni, React wywołuje funkcję jeszcze raz, zapamiętuje nowy wynik i go zwraca. Barklund w *React in Depth* podkreśla, że poprzedni wynik nie jest dostępny w kodzie komponentu jako zmienna. Trzyma go React w swojej pamięci hooków i oddaje tylko jako wynik `useMemo`. Z tego samego powodu `useMemo` nie przyspiesza pierwszego renderu. Dokumentacja pisze wprost, że hook pomaga tylko pominąć zbędną pracę przy aktualizacjach.

## Dwa zastosowania jednego hooka

Barklund wymienia dwa cele, którym `useMemo` służy osobno albo jednocześnie:

1. **Uniknięcie kosztownego obliczenia** (*„To prevent expensive recalculations”*). Wynik, którego policzenie trwa długo, liczy się tylko po zmianie wejścia.
2. **Zachowanie równości referencji** (*„To maintain referential equality”*). Tablica albo obiekt zwrócony z `useMemo` jest tym samym obiektem, dopóki zależności się nie zmienią. Dla komponentu w `memo`, który dostaje ten obiekt w propsach, to warunek pominięcia renderu.

Kumar w *Fluent React* pokazuje pierwszy cel na sortowaniu listy miliona osób. Komponent bez `useMemo` sortuje całą listę przy każdej literze wpisanej w pole imienia, więc pięcioliterowe imię daje pięć pełnych sortowań. Z `useMemo` i listą osób jako zależnością sortowanie powtarza się dopiero po zmianie listy.

## `HomePage` z zapamiętanym filtrowaniem

W `app/page.jsx` zmieniają się dwie linie. Import rozszerza się o `useMemo`, a `filtered` dostaje wynik hooka:

```jsx
import { useState, useCallback, useMemo } from 'react';

  // useMemo: filtrowanie tylko po zmianie contacts albo query
  const filtered = useMemo(
    () => filterContacts(contacts, query),
    [contacts, query]
  );
```

Pierwszy argument to funkcja strzałkowa bez parametrów, która woła `filterContacts`. Drugi to tablica `[contacts, query]`, czyli zmienne komponentu, których ta funkcja używa. Funkcja `filterContacts` w tablicy nie stoi, bo jest importem spoza komponentu i nie zmienia się między renderami. Reszta pliku, w tym oba `useCallback` i JSX, zostaje bez zmian.

## Kiedy `useMemo` oddaje zapisany wynik

`HomePage` ma tylko dwa stany: `contacts` i `query`. Każdy jego render jest skutkiem zmiany jednego z nich, a oba są zależnościami. <u>W tej aplikacji `useMemo` nigdy nie oddaje więc zapisanego wyniku</u> i wywołuje `filterContacts` przy każdym renderze. Drugi cel, stała referencja dla `ContactList`, też odpada z tego samego powodu co `memo` na liście.

Barklund opisuje identyczny przypadek na liście pracowników z jednym przełącznikiem filtra i uznaje go za przykład nietrafiony. Wskazuje też, kiedy sytuacja się odwraca. Wystarczy, że komponent ma stan zmieniający się niezależnie od zależności, na przykład osobny stan sortowania. Render po zmianie sortowania nie zmienia listy ani filtra, więc `useMemo` oddaje zapisany wynik. W `HomePage` takim stanem byłby przełącznik motywu, tak jak `dark` w przykładzie z kwadratem liczby.

## Kiedy obliczenie jest kosztowne

Dokumentacja podaje praktyczną granicę. Jeśli kod nie tworzy ani nie przechodzi pętlą po tysiącach obiektów, prawdopodobnie nie jest kosztowny (*„unless you’re creating or looping over thousands of objects, it’s probably not expensive”*). Pewność daje pomiar: `console.time('filter array')` przed obliczeniem i `console.timeEnd('filter array')` po nim. Dokumentacja podaje też próg decyzji:

> **„Jeśli łączny zmierzony czas jest znaczący (powiedzmy 1 ms lub więcej), memoizacja tego obliczenia może mieć sens.”**
>
> *„If the overall logged time adds up to a significant amount (say, 1ms or more), it might make sense to memoize that calculation.”*
>
> — dokumentacja Reacta, *useMemo*

Funkcja `filterContacts` z `lib/contacts.js` z zapytaniem „ann” trwa w Node.js 24 poniżej 0,1 ms dla pięciu kontaktów. Dla listy powiększonej do 10 000 kontaktów pierwsze wywołanie trwa ponad 3 ms, a kolejne ponad 1,6 ms. Pięć kontaktów leży więc daleko pod progiem, a dziesięć tysięcy go przekracza. Memoizacja w `contacts-app` ma charakter pokazowy. Pomiar w Node.js daje tylko rząd wielkości. Decyzję podejmuje się na pomiarze w przeglądarce, w buildzie produkcyjnym i na spowolnionym procesorze, bo komputer autora jest zwykle szybszy niż sprzęt użytkowników.

## Trzy przypadki, w których `useMemo` się opłaca

Dokumentacja wymienia trzy sytuacje:

- **Obliczenie jest zauważalnie wolne**, a jego zależności zmieniają się rzadko.
- **Wynik trafia jako prop do komponentu w `memo`**, który ma pominąć render przy niezmienionych propsach.
- **Wynik jest zależnością innego hooka**, na przykład kolejnego `useMemo` albo `useEffect`.

W pozostałych przypadkach hook według dokumentacji nic nie daje. Kumar dodaje kryterium dla wartości prostych:

> **„Dla wartości skalarnych, takich jak napisy, liczby czy wartości logiczne, `useMemo` jest zazwyczaj zbędne.”**
>
> *„For scalar values, such as strings, numbers, or booleans, using `useMemo` is typically unnecessary.”*
>
> — Tejas Kumar, *Fluent React*

Liczba porównuje się po wartości, więc nie ma referencji do zachowania. Zapis `useMemo(() => count * 2, [count])` nie chroni żadnej referencji. Mnożenie dwóch liczb nie jest też kosztownym obliczeniem. W `ContactStats` stała `total = contacts.length` jest takim skalarem i memoizacji nie potrzebuje.

## Brakująca zależność

Tablica zależności musi wymieniać wszystkie zmienne komponentu, których używa funkcja obliczająca. Wariant z pominiętym `query` pokazuje, co się dzieje, gdy jednej brakuje:

```jsx
// BŁĄD: w tablicy brakuje query
const filtered = useMemo(
  () => filterContacts(contacts, query),
  [contacts] // query się zmienia, ale React o tym nie wie
);
```

Po wpisaniu „anna” lista nadal ma pięć wierszy. React oddaje wynik zapamiętany przy ostatniej zmianie `contacts`, a wtedy zapytanie było puste. „Usun” przy Piotrze zmienia `contacts`, więc React wywołuje funkcję z bieżącego renderu, która widzi aktualne `query`. Licznik pokazuje wtedy „Lacznie: 4”, a lista nagle tylko Annę Kowalską. Błąd wygląda jak wyszukiwarka spóźniona o jedną akcję. Przyczyną jest to samo przestarzałe domknięcie co przy `useCallback` z niepełną tablicą: funkcja z dawnego renderu pamięta dawne `query`.

Odwrotny błąd to brak całej tablicy. Zapis `useMemo(() => filterContacts(contacts, query))` liczy wynik przy każdym renderze, bez żadnego ostrzeżenia. Gdy tablica jest, a obliczenie mimo to powtarza się za często, dokumentacja proponuje prostą diagnostykę. Tablicę zależności wypisuje się w dwóch kolejnych renderach i porównuje pozycję po pozycji funkcją `Object.is`. Pozycja, dla której wynik to `false`, jest zależnością nową przy każdym renderze.

Najczęściej winny jest obiekt tworzony w ciele komponentu, na przykład opcje wyszukiwania. Dokumentacja radzi przenieść jego deklarację do środka funkcji obliczającej. Zależnością staje się wtedy napis, z którego obiekt powstaje, a napis nie zmieni się „przypadkiem”:

```jsx
function Results({ contacts, text }) {
  const options = { text };                         // nowy obiekt przy każdym renderze
  const a = useMemo(() => filterContacts(contacts, options.text), [contacts, options]); // liczy zawsze

  const b = useMemo(() => {
    const opts = { text };                           // obiekt powstaje w funkcji obliczającej
    return filterContacts(contacts, opts.text);
  }, [contacts, text]);                              // zależnością jest napis
  return <p>{a.length} / {b.length}</p>;
}
// zamontowanie i dwa rendery rodzica z tymi samymi propsami: a liczy 3 razy, b raz
```

> 💡 **Zapamiętaj:** `useMemo` liczy wartość od nowa tylko po zmianie zależności. Gdy każdy render komponentu zmienia którąś zależność, hook nigdy nie zwraca zapisanego wyniku. Pracować zaczyna dopiero wtedy, gdy część renderów nie dotyka zależności, na przykład przy niezależnym stanie motywu albo sortowania.


Materiał rozszerzony do tego slajdu: [`rozszerzenia/r06_usememo.md`](rozszerzenia/r06_usememo.md)
