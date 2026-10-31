# Rozszerzenia do slajdu 03: `useReducer` czy `useState`: jeden mechanizm, dwa zapisy

Powrót: [`slide_03_usereducer-czy-usestate.md`](../slide_03_usereducer-czy-usestate.md)

## Rozszerzenie: przejście w trzech krokach

Dokumentacja dzieli zamianę `useState` na `useReducer` na trzy kroki. Najpierw procedury obsługi przestają ustawiać stan i zaczynają wysyłać akcje. Potem powstaje funkcja reducera z jedną gałęzią na każdą akcję. Na końcu komponent zamienia `useState` na `useReducer`.

W koszyku opartym na `useState` pierwszy krok zmienia cztery procedury obsługi. Funkcja `handleAdd(product)` przestaje liczyć nową listę i wysyła akcję:

```jsx
// Spoza demo: krok 1, procedura obsługi wysyła akcję zamiast liczyć listę.
function handleAdd(product) {
  dispatch({ type: 'ADD_ITEM', product });
}
```

Pozostałe trzy zmieniają się tak samo. Funkcja `handleQtyChange` wysyła `UPDATE_QTY` z polami `id` i `qty`, `handleRemove` wysyła `REMOVE_ITEM`, a `handleClear` wysyła `CLEAR_CART`. W drugim kroku reguły z tych funkcji przechodzą do `cartReducer`: zwiększanie ilości tego samego produktu do gałęzi `ADD_ITEM`, a dolna granica 1 do gałęzi `UPDATE_QTY`. Po trzecim kroku każda procedura obsługi ma jedną linię i żadnej reguły koszyka.

Kolejność ma znaczenie. Dopóki w kodzie zostaje choć jedno stare wywołanie `setItems`, koszyk ma dwa źródła zmian. <u>Hook wymienia się dopiero wtedy, gdy wszystkie procedury obsługi wysyłają już akcje</u>. Po wymianie stary setter przestaje istnieć, więc każde pominięte wywołanie od razu zgłosi błąd.

Miarą poprawnego przejścia jest ta sama seria akcji przed zmianą i po niej. Dwa dodania tej samej kawy mają dać jedną pozycję z `qty: 2`, a ilość 0 ma zostać zamieniona na 1. Sprawdzenia z `node:assert` opisują dokładnie tę serię, więc po drugim kroku da się je uruchomić, zanim komponent w ogóle zobaczy reducer. Inny wynik znaczy, że reguła zgubiła się po drodze: została w procedurze obsługi, której nikt już nie wywołuje, albo nie trafiła do gałęzi reducera.

## Rozszerzenie: `useState` zapisany przez `useReducer`

Tejas Kumar w *Fluent React* opisuje tę równoważność od środka biblioteki.

> **„Ciekawostka: `useState` wewnętrznie używa `useReducer`. Można traktować `useState` jako abstrakcję wyższego poziomu nad `useReducer`.”**
>
> *„Fun fact: `useState` uses `useReducer` internally. You can think of `useState` as a higher-level abstraction of `useReducer`.”*
>
> — Tejas Kumar, *Fluent React*

Kumar pokazuje też, jak odtworzyć `useState` za pomocą `useReducer`:

```js
// Spoza demo: useState odtworzony na useReducer.
import { useReducer } from "react";

function useState(initialState) {
  const [state, dispatch] = useReducer(
    (state, newValue) => newValue,   // „akcja” to gotowa nowa wartość
    initialState
  );
  return [state, dispatch];
}
```

Reducer w tym przykładzie ignoruje stary stan i zwraca to, co dostał jako „akcję”. Funkcja `dispatch` staje się więc zwykłym setterem: `dispatch(5)` ustawia stan na 5. Przykład pomija wariant z aktualizatorem. `useState` to szczególny przypadek reducera, w którym akcją jest gotowa nowa wartość.

Alex Banks i Eve Porcello w *Learning React* dokładają przełącznik `useReducer(checked => !checked, false)`, w którym każde `dispatch` odwraca wartość. Taki reducer nie ma listy dozwolonych zmian. Pojawia się ona dopiero przy akcjach z polem `type`, jak w `cartReducer`.

## Rozszerzenie: jeden reducer czy kilka

Bugl łączy w swojej aplikacji dwa reducery w jeden: `userReducer` zarządza kawałkiem stanu `user`, a `postsReducer` kawałkiem `posts`. Połączony `appReducer` oddaje każdemu z nich jego kawałek i tę samą akcję:

```js
// Spoza demo: dwa reducery częściowe połączone w jeden.
function appReducer(state, action) {
  return { user: userReducer(state.user, action), posts: postsReducer(state.posts, action) };
}
```

Komponent ma wtedy jedno `dispatch` i jeden obiekt stanu.

Połączenie ma skutek dla gałęzi `default`. Każdy reducer częściowy dostaje teraz każdą akcję, także cudzą. Bugl opisuje, że logowanie kończy się błędem z `postsReducer`, bo ten nie zna akcji logowania, więc zamienia `throw` na `return state` w obu reducerach. Do tego `appReducer` zawsze buduje nowy obiekt, więc nawet akcja bez skutku nie pozwala Reactowi pominąć renderu.

> **„Przy złożonych zmianach stanu lokalnego rozsądniej może być jednak zostawić reducery osobno.”**
>
> *„However, for complex local state changes, it might make more sense to keep the reducers separate.”*
>
> — Daniel Bugl, *Learn React Hooks*
