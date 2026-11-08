# Koszyk, który odpowiada przed serwerem

## Dodanie do koszyka trwa

W prawdziwym sklepie kliknięcie „Add to cart” wysyła żądanie do serwera, który zapisuje koszyk w bazie. Odpowiedź przychodzi po czasie, którego aplikacja nie kontroluje. Do tej pory koszyk zmieniał się natychmiast, bo `dispatch` działa lokalnie. Żeby zobaczyć problem czekania, sklep dostaje symulację sieci w nowym pliku `app/lib/fakeApi.js`:

```js
// Udawany serwer: odpowiada po opóźnieniu, bez prawdziwego backendu.
// fail = true: serwer odmawia, czyli droga błędu w przycisku.
export function fakeAddToCart(fail = false) {
  return new Promise((resolve, reject) =>
    setTimeout(() => (fail ? reject(new Error('Server refused')) : resolve()), 1500)
  );
}
```

Funkcja zwraca obiekt Promise, czyli wynik, który pojawi się później. Timer `setTimeout` odkłada rozstrzygnięcie o 1500 ms. Po tym czasie Promise spełnia się bez wartości albo, gdy argument `fail` ma wartość `true`, zostaje odrzucony z błędem „Server refused”. Obie drogi da się w ten sposób przejść bez prawdziwego serwera.

Zanim sklep dostanie interfejs optymistyczny, przycisk robi to, co przychodzi do głowy jako pierwsze: czeka na serwer i dopiero potem zmienia koszyk. W `app/components/AddToCartButton.jsx` wygląda to tak:

```jsx
'use client';

import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { fakeAddToCart } from '../lib/fakeApi';

export default function AddToCartButton({ product }) {
  const { dispatch } = useCart();
  const [error, setError] = useState(null);

  async function handleAdd() {
    setError(null);
    try {
      await fakeAddToCart(); // serwer odpowiada po 1,5 s
      dispatch({ type: 'ADD_ITEM', product });
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <>
      <button onClick={handleAdd}>Add to cart</button>
      {error && <span> {error}</span>}
    </>
  );
}
```

Ten kod działa, ale zachowuje się źle. Pomiar w trybie deweloperskim (Playwright, dwa kliknięcia przy kawie, czasy liczone od pierwszego), konsola bez błędów:

```text
0,1 s   nagłówek: Cart: 0 pcs — 0.00 PLN
0,6 s   drugie kliknięcie
1,7 s   nagłówek: Cart: 1 pcs — 49.99 PLN
2,5 s   nagłówek: Cart: 2 pcs — 99.98 PLN
```

Przez półtorej sekundy po kliknięciu nic się nie zmienia, więc użytkownik nie wie, czy kliknięcie zadziałało. Klika drugi raz, co widać w pomiarze po 0,6 s. Drugie kliknięcie wysyła drugie żądanie, które też się udaje, i po 2,5 s w koszyku leżą dwie paczki kawy, choć ktoś mógł chcieć jedną.

## Czym jest interfejs optymistyczny

**Interfejs optymistyczny** (*optimistic UI*) odwraca kolejność. Najpierw pokazuje wynik, którego się spodziewa, a dopiero potem czeka na potwierdzenie. Jeśli potwierdzenie przyjdzie, nic się nie zmienia, bo ekran już wygląda właściwie. Jeśli przyjdzie błąd, ekran wraca do stanu sprzed kliknięcia.

Morten Barklund w *React in Depth* opisuje tę technikę przy pamięci podręcznej danych, czyli lokalnej kopii danych z serwera, którą aplikacja trzyma w przeglądarce. Przy wysłaniu zmiany lokalny obraz danych od razu zmienia się tak, jak zmieni go serwer. Nieudane żądanie cofa wszystkie zmiany optymistyczne:

> **„Nieudana zmiana to to samo co stan wyjściowy: nic się nie zmienia.”**
>
> *„A failed mutation is the same as status quo: nothing changes.”*
>
> — Morten Barklund, *React in Depth*

Po udanym żądaniu miejsce danych optymistycznych zajmują prawdziwe dane z odpowiedzi serwera. Barklund zaznacza, że optymistyczna wartość ma tylko zakryć krótki czas oczekiwania, więc może być uproszczona.

React 19 ma do tego własny hook. Dokumentacja definiuje go jednym zdaniem:

> **„`useOptimistic` to hook Reacta, który pozwala optymistycznie zaktualizować interfejs.”**
>
> *„useOptimistic is a React Hook that lets you optimistically update the UI.”*
>
> — dokumentacja React, *useOptimistic*

Hook nie wysyła żądań i nic nie wie o sieci. Zarządza wyłącznie tym, co widać na ekranie w czasie trwania operacji.

## Najmniejszy przykład

Przycisk „polub” poza sklepem pokazuje nową liczbę od razu, a prawdziwy licznik zwiększa dopiero po odpowiedzi „serwera”. Wariant z propem `fail` dostaje odmowę:

```jsx
import { useState, useOptimistic, startTransition } from 'react';

const wait = ms => new Promise(r => setTimeout(r, ms));

function Like({ fail }) {
  const [likes, setLikes] = useState(0);           // wartość prawdziwa
  const [shown, setShown] = useOptimistic(likes);  // to, co widać na ekranie

  function click() {
    startTransition(async () => {
      setShown(likes + 1);                     // ekran od razu pokazuje 1
      try {
        await wait(300);                       // „serwer” odpowiada po 300 ms
        if (fail) throw new Error('rejected');
        setLikes(l => l + 1);                  // prawdziwa wartość dogania wyświetlaną
      } catch {}                               // odmowa: wartość prawdziwa zostaje 0
    });
  }
  return <button onClick={click}>{shown}</button>;
}
// <Like />:      0 → 1 od razu, po 300 ms nadal 1
// <Like fail />: 0 → 1 od razu, po 300 ms z powrotem 0
```

Hook **`useOptimistic(value)`** zwraca parę: wartość do wyświetlenia i funkcję, która ustawia wartość tymczasową. Gdy nic nie trwa, wyświetlana wartość jest równa prawdziwej. Wartość tymczasowa potrzebuje okna, czyli chwili, od której stoi na ekranie, i końca, po którym znika. To okno wyznacza **przejście** (*Transition*), aktualizacja, której przebieg React śledzi od startu do końca. Funkcja **`startTransition`** oznacza przekazaną funkcję jako przejście. Dopóki ono trwa, ekran pokazuje wartość tymczasową, a po jego końcu hook oddaje wartość prawdziwą. W wariancie z odmową wartość prawdziwa się nie zmieniła, więc przycisk wraca do 0 bez żadnego kodu cofającego.

Funkcję przekazaną do `startTransition` dokumentacja nazywa **akcją**. To inne znaczenie słowa niż przy reducerze: tam akcja jest obiektem, który opisuje zmianę, a tu funkcją, która ją wykonuje.

## Wartość prawdziwa i wartość optymistyczna

Pełna sygnatura hooka to `useOptimistic(value, reducer?)`. Pierwszy argument to **wartość prawdziwa**. Według dokumentacji hook zwraca ją zawsze wtedy, gdy nie trwa żadna akcja. Drugi, opcjonalny argument to czysta funkcja, która z bieżącego stanu i przekazanej wartości wylicza stan optymistyczny. Bez niej stanem optymistycznym staje się wartość przekazana do settera.

Dokumentacja rozpisuje drogę jednej aktualizacji na pięć kroków, które w `Like` wyglądają tak:

1. `setShown(likes + 1)` od razu wywołuje render z wartością 1.
2. W czasie `await` ta wartość zostaje na ekranie.
3. `setLikes` planuje zmianę wartości prawdziwej.
4. Gdyby nowa wartość wymagała jeszcze czekania na dane, ekran nadal pokazywałby 1.
5. Na końcu obie wartości trafiają na ekran w jednym **zatwierdzeniu**, czyli w jednej zmianie DOM.

> **„Nie ma dodatkowego renderu, który by go »czyścił«. Stan optymistyczny i prawdziwy schodzą się w tym samym renderze, gdy przejście się kończy.”**
>
> *„There’s no extra render to “clear” the optimistic state. The optimistic and real state converge in the same render when the Transition completes.”*
>
> — dokumentacja React, *useOptimistic*

Render, który pokazuje nową wartość prawdziwą, jest tym samym renderem, który zdejmuje wartość tymczasową. Na ekranie nie ma więc chwili, w której przycisk pokazuje znów starą liczbę.

Ten sam mechanizm obsługuje porażkę. Gdy akcja rzuci wyjątek, przejście i tak się kończy, a React renderuje z aktualną wartością prawdziwą. Zasada „nieudana zmiana niczego nie zmienia” działa więc sama, o ile akcja nie zdążyła przed błędem zmienić wartości prawdziwej.

## Przejście trzyma wartość tymczasową

Setter z `useOptimistic` działa tylko w akcji, czyli w funkcji przekazanej do `startTransition` albo do atrybutu `action` formularza. Bez przejścia React nie wie, kiedy okno wartości tymczasowej ma się zamknąć. Wywołanie settera w zwykłej procedurze obsługi zdarzenia nie rzuca wyjątku. W trybie deweloperskim React zapisuje w konsoli błąd (`console.error`) z komunikatem:

```
An optimistic state update occurred outside a transition or action. To fix, move the update to an action, or wrap with startTransition.
```

Komunikat podaje obie dopuszczalne drogi: przenieść aktualizację do akcji albo owinąć ją w `startTransition`. Dokumentacja dodaje, że stan optymistyczny wyrenderuje się wtedy tylko na moment, a wartość prawdziwa się nie zmienia. W wersji zbudowanej wpisu w konsoli nie ma. Druga granica dotyczy renderu: setter wywołany wprost w ciele komponentu rzuca wyjątek „Cannot update optimistic state while rendering.” i strona kończy się ekranem błędu. <u>Setter stanu optymistycznego wywołuje się wyłącznie wewnątrz akcji albo przejścia</u>.

Formularz z funkcją w atrybucie `action` uruchamia ją w przejściu sam, więc tam `startTransition` nie jest potrzebne. Przycisk z `onClick` takiego udogodnienia nie ma i wywołuje `startTransition` jawnie.

## Koszyk optymistyczny w dostawcy

W sklepie wartością prawdziwą jest cały koszyk. Trzyma go `useReducer` w `CartProvider`, więc tam stoi też hook optymistyczny. W pliku `app/context/CartContext.jsx` import z `react` dostaje `useOptimistic`. Dostawca dostaje jedną linię i nową wartość kontekstu, a `useCart` zostaje bez zmian:

```jsx
import { createContext, useContext, useOptimistic, useReducer } from 'react';
```

```jsx
export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, initialCartState);
  // Koszyk na ekranie = prawdziwy koszyk + akcje, które czekają na serwer.
  const [optimisticCart, addOptimistic] = useOptimistic(cart, cartReducer);

  return (
    <CartContext value={{ cart: optimisticCart, dispatch, addOptimistic }}>
      {children}
    </CartContext>
  );
}
```

Drugim argumentem hooka jest **reducer stanu optymistycznego**: funkcja, która z bieżącej wartości i przekazanej akcji liczy wartość do pokazania. Tu to ten sam `cartReducer`, więc akcja tymczasowa `ADD_ITEM` liczy się dokładnie tak jak prawdziwa: nowy produkt dostaje `qty: 1`, a produkt już obecny ilość większą o jeden. Kontekst podaje `optimisticCart` pod starą nazwą `cart`. `CartSummary` i strona `/cart` pokazują więc koszyk razem z akcjami w drodze, bez żadnej zmiany w ich kodzie.

Dokumentacja wyjaśnia, dlaczego przy danych złożonych reducer jest potrzebny. Jeśli wartość prawdziwa zmieni się w trakcie akcji, React uruchomi reducer jeszcze raz, z nowym koszykiem i tymi samymi akcjami tymczasowymi. Akcja optymistyczna trafia więc zawsze na wierzch najnowszych danych. Setter z gotową wartością, w stylu `addOptimistic(cart + 1)`, widziałby tylko koszyk z chwili kliknięcia.

## Przycisk, który wysyła akcję optymistyczną

Ten sam przycisk, dotąd czekający na serwer przed `dispatch`, pobiera z kontekstu obie funkcje i wysyła tę samą akcję dwa razy: najpierw jako tymczasową, po odpowiedzi serwera jako prawdziwą.

```jsx
'use client';

import { startTransition, useState } from 'react';
import { useCart } from '../context/CartContext';
import { fakeAddToCart } from '../lib/fakeApi';

export default function AddToCartButton({ product }) {
  const { dispatch, addOptimistic } = useCart();
  const [error, setError] = useState(null);

  function handleAdd() {
    setError(null);
    startTransition(async () => {
      addOptimistic({ type: 'ADD_ITEM', product }); // ekran od razu: produkt w koszyku
      try {
        await fakeAddToCart(); // serwer odpowiada po 1,5 s
        startTransition(() => dispatch({ type: 'ADD_ITEM', product }));
      } catch (e) {
        setError(e.message); // pozycja tymczasowa sama zniknie
      }
    });
  }

  return (
    <>
      <button onClick={handleAdd}>Add to cart</button>
      {error && <span> {error}</span>}
    </>
  );
}
```

Funkcja `handleAdd` czyści poprzedni błąd i uruchamia przejście z funkcją asynchroniczną. W przejściu `addOptimistic` dopisuje akcję tymczasową, a nagłówek koszyka zmienia się w tej samej chwili. Potem akcja czeka na `fakeAddToCart`. Po sukcesie `dispatch` zapisuje produkt w prawdziwym koszyku. Po porażce `catch` zapisuje komunikat w `error`, a koszyka nikt nie cofa ręcznie. Przy sukcesie `fakeAddToCart` nie zwraca żadnej wartości, bo przycisk potrzebuje tylko informacji, że serwer się zgodził. Pusty fragment `<>…</>` zwraca przycisk i komunikat obok siebie bez dodatkowego elementu w DOM.

Wewnętrzne `startTransition` wokół `dispatch` ma konkretny powód. Dokumentacja zaznacza, że aktualizacje stanu po `await` nie należą już do przejścia. Bez owinięcia `dispatch` wykonałby się od razu, jeszcze przed końcem przejścia, a reducer stanu optymistycznego dołożyłby akcję tymczasową do koszyka, który ma już kawę. Na jeden render nagłówek pokazałby wtedy „2 pcs — 99.98 PLN”, a przy dwóch szybkich kliknięciach podwojenie trwa około 0,3 s. Owinięty `dispatch` trafia na ekran w tym samym zatwierdzeniu, w którym znika akcja tymczasowa. <u>Aktualizację wartości prawdziwej po `await` owija się w kolejne `startTransition`</u>.

Przycisk nie jest blokowany na czas zapisu. Drugie kliknięcie od razu widać w nagłówku jako drugą sztukę, więc użytkownik nie klika w ciemno, a każde kliknięcie wysyła własne żądanie i własną akcję.

## Rysunek 4.7 — półtorej sekundy w życiu koszyka

```mermaid
%%{init: {"flowchart": {"wrappingWidth": 360}}}%%
flowchart LR
    K["klik"] --> T["startTransition<br/>addOptimistic(ADD_ITEM)"]
    T --> W["nagłówek: koszyk + 1<br/>await fakeAddToCart, 1500 ms"]
    W -->|"sukces"| D["startTransition<br/>dispatch ADD_ITEM"]
    W -->|"błąd"| E["setError(e.message)<br/>cart bez zmian"]
    D --> F["koniec przejścia<br/>pokazany = prawdziwy, koszyk + 1"]
    E --> G["koniec przejścia<br/>pozycja tymczasowa znika"]
```

Na Rysunku 4.7 pozycja tymczasowa żyje w środkowym prostokącie, a wynik widać od pierwszej chwili. Gałąź sukcesu kończy się tym samym obrazem, który był już na ekranie, więc w nagłówku nic się nie zmienia. <u>Gałąź błędu kończy się koszykiem sprzed kliknięcia</u>, bo prawdziwy `cart` nigdy nie dostał tej akcji.

## Pięć przycisków, jeden koszyk optymistyczny

Strona główna jest komponentem serwerowym i wypisuje produkty wprost, z `<AddToCartButton product={product} />` w każdym wierszu, więc `app/page.jsx` zostaje bez zmian. Każdy z pięciu egzemplarzy ma własny komunikat błędu, a wszystkie wysyłają akcje do jednego koszyka. Kawa, a 0,3 s później herbata, dają kolejno 1 i 2 sztuki w nagłówku, bez żadnego cofania: druga akcja tymczasowa liczy się na wierzchu pierwszej.

## Gdy serwer odmówi

Drogę błędu daje wywołanie z drugim argumentem `true`:

```jsx
await fakeAddToCart(true); // fail = true: Promise zostaje odrzucony po 1,5 s
```

Odrzucony Promise rzuca wyjątek w miejscu `await`. Łapie go blok `catch`, który zapisuje komunikat w `error`, a `dispatch` nie zostaje wywołany. Nagłówek od razu pokazuje „Cart: 1 pcs — 49.99 PLN”, a po 1,5 s, razem z końcem przejścia, wraca do „Cart: 0 pcs — 0.00 PLN”. Obok przycisku stoi „Server refused”. To pełny wzorzec interfejsu optymistycznego: wynik na ekranie przed odpowiedzią i cofnięcie przy odmowie.

Bez `catch` odrzucenie przepadłoby dla interfejsu. **Granica błędów** to komponent pokazujący komunikat w miejscu poddrzewa, które rzuciło wyjątek. Samodzielna funkcja `startTransition` nie należy jednak do żadnego komponentu, więc żadna granica go nie przejmie. Koszyk i tak by się cofnął, ale bez słowa wyjaśnienia.

## Zalety i koszty interfejsu optymistycznego

Interfejs optymistyczny obiecuje wynik, którego jeszcze nie ma. Taka obietnica jest tania, gdy odmowa zdarza się rzadko i łatwo ją zrozumieć. Dodanie kawy spełnia oba warunki: przy błędzie użytkownik widzi, że kawa zniknęła z koszyka, czyta komunikat i klika jeszcze raz. Płatność ich nie spełnia, bo napis „zapłacono” pokazany przed odpowiedzią banku, a potem cofnięty, myli bardziej niż zwykły wskaźnik ładowania.

| Zyskujemy | Płacimy | Kiedy nie warto / co zamiast |
|---|---|---|
| Reakcja w chwili kliknięcia zamiast zera przez 1,5 s z pomiaru. Użytkownik widzi efekt i nie klika drugi raz z niepewności. | Ekran przez chwilę pokazuje stan, którego serwer nie potwierdził. | Rzadkie, kosztowne albo nieodwracalne operacje, na przykład płatność: zwykły wskaźnik oczekiwania. |
| Cofnięcie przy odmowie bez własnego kodu: koszyk wraca do stanu sprzed kliknięcia. | Przy odmowie pozycja znika z koszyka, więc potrzebny jest komunikat. Hook nie pamięta wyniku, więc o porażce informuje osobny stan, jak `error` w przycisku. | Odmowa częsta albo trudna do zrozumienia dla użytkownika. |
| Koszyk optymistyczny wspólny dla pięciu przycisków, bez zmian w `CartSummary` i `/cart`. | Zapis wartości prawdziwej po `await` w drugim `startTransition`, inaczej na chwilę widać „2 pcs — 99.98 PLN”. | Komponent potrzebuje tylko wiedzieć, że coś trwa: wystarczy porównanie `optimisticCart !== cart`. |

> 💡 **Zapamiętaj:** `useOptimistic(cart, cartReducer)` pokazuje koszyk z akcjami w drodze tylko w czasie trwania przejścia i sam wraca do wartości prawdziwej, także po odmowie serwera. Zapis wartości prawdziwej po `await` owija się w kolejne `startTransition`, inaczej przez chwilę na ekranie stoją obie wersje naraz.


Materiał rozszerzony do tego slajdu: [`rozszerzenia/r07_useoptimistic.md`](rozszerzenia/r07_useoptimistic.md)
