# Rozszerzenia do slajdu 03: `memo`: React pomija komponent, gdy propsy są te same

Powrót: [`slide_03_react-memo.md`](../slide_03_react-memo.md)

## Rozszerzenie: komponent czysty, klasy i wnętrze `memo`

Alex Banks i Eve Porcello w *Learning React* nazywają wynik `memo` komponentem czystym:

> **„W Reakcie komponent czysty to komponent, który przy tych samych propsach zawsze renderuje ten sam wynik.”**
>
> *„In React, a pure component is a component that always renders the same output, given the same properties.”*
>
> — Alex Banks, Eve Porcello, *Learning React*

Autorzy przypominają też, skąd ten mechanizm się wziął. W komponentach klasowych tę samą decyzję podejmowała metoda `shouldComponentUpdate`, a później klasa bazowa `React.PureComponent`. Według autorów `PureComponent` działa tak samo jak `memo`, ale tylko dla klas, a `memo` jest jego odpowiednikiem dla komponentów funkcyjnych. Ich przykład z kotami ma budowę listy kontaktów: bez `memo` dodanie czwartego kota wypisuje w konsoli cztery linie, a z `memo` tylko jedną, dla nowego kota.

Tejas Kumar zagląda przy tym do kodu źródłowego Reacta. `memo` zwraca zwykły obiekt z trzema polami i nie tworzy żadnej nowej funkcji:

```jsx
// Przykład spoza demo: co zwraca memo dla ContactItem
import ContactItem from '../components/ContactItem';

console.log(typeof ContactItem);       // → object
console.log(Object.keys(ContactItem)); // → [ '$$typeof', 'type', 'compare' ]
console.log(ContactItem.$$typeof);     // → Symbol(react.memo): znacznik komponentu memoizowanego
console.log(typeof ContactItem.type);  // → function: oryginalny komponent
console.log(ContactItem.compare);      // → null: brak własnej funkcji porównującej
```

Decyzję z Rysunku 6.3 Kumar rozpisuje, czytając w kodzie Reacta funkcję `updateMemoComponent`.
