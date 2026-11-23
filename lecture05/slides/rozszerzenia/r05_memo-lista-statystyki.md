# Rozszerzenia do slajdu 05: Gdzie `memo` się opłaca, a gdzie tylko porównuje

Powrót: [`slide_05_memo-lista-statystyki.md`](../slide_05_memo-lista-statystyki.md)

## Rozszerzenie: własna funkcja porównująca

`memo` przyjmuje drugi argument: funkcję `arePropsEqual(prevProps, nextProps)`. Dokumentacja określa jej znaczenie jednoznacznie. Ma zwrócić `true`, gdy stare i nowe propsy są równe, czyli render można pominąć. Kuszące jest porównanie samego identyfikatora. Przykład spoza `contacts-app` pokazuje skutek:

```jsx
// arePropsEqual: true znaczy „propsy równe, pomiń render”
const Badge = memo(
  function Badge({ user }) { return <b>{user.name}</b>; },
  (prev, next) => prev.user.id === next.user.id // porównuje tylko id
);

// rodzic zmienia { id: 1, name: 'Ala' } na { id: 1, name: 'Ola' }:
// id się nie zmieniło, więc Badge nadal pokazuje „Ala”
```

Funkcja porównująca pominęła pole, które się zmieniło, więc ekran pokazuje stare imię. To samo spotkałoby wiersz kontaktu porównujący tylko `contact.id`: zatrzymałby starą funkcję `onDelete` na zawsze.

> **„Jeśli podaje się własną implementację `arePropsEqual`, trzeba porównać każdy prop, łącznie z funkcjami.”**
>
> *„If you provide a custom arePropsEqual implementation, you must compare every prop, including functions.”*
>
> — dokumentacja Reacta, *memo*

Przy tym argumencie źródła potrafią się rozjechać. Schwarzmüller pisze, że funkcja ma zwrócić `true`, gdy komponent trzeba wyrenderować ponownie, i pokazuje porównanie `!==` imion użytkownika. To odwrotność opisu w dokumentacji. Funkcja napisana według książki pomijałaby render dokładnie wtedy, gdy imię się zmieniło. <u>Znaczenie `true` sprawdza się w dokumentacji `memo`, nie w przykładzie z książki.</u> Dokumentacja ostrzega też przed porównaniem głębokim. Gdy ktoś później rozbuduje strukturę danych, takie porównanie może zamrozić aplikację na wiele sekund (*„can freeze your app for many seconds”*).
