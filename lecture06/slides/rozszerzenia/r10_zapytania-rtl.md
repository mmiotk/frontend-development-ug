# Rozszerzenia do slajdu 10: Jak test znajduje element: zapytania i ich odmiany

Powrót: [`slide_10_zapytania-rtl.md`](../slide_10_zapytania-rtl.md)

## Rozszerzenie: zawężanie przez `within`

Gdy na stronie pasuje kilka elementów, obszar wyszukiwania zawęża funkcja `within`:

```jsx
import { render, screen, within } from '@testing-library/react';

test('within narrows the search', () => {
  render(
    <>
      <ul aria-label="A"><li>1</li><li>2</li></ul>
      <ul aria-label="B"><li>3</li></ul>
    </>
  );
  // screen.getByRole('list') rzuciłby błąd: dwie listy
  const list = screen.getByRole('list', { name: 'A' });
  expect(within(list).getAllByRole('listitem')).toHaveLength(2); // długość zwróconej tablicy
});
```

`within(list)` zwraca te same zapytania co `screen`, ale przypięte do jednego elementu. Samo `screen.getByRole('list')` kończy się tu błędem „Found multiple elements with the role "list"”. Zawężenie przydaje się na stronie z dwiema listami albo dwoma formularzami o tych samych etykietach.

## Rozszerzenie: pełna kolejność zapytań i sita `getByRole`

W pełnej kolejności dokumentacji, w grupie dostępnej dla wszystkich użytkowników, stoją po `getByRole` **`getByLabelText`** do pól formularza, **`getByPlaceholderText`**, **`getByText`** do elementów nieinteraktywnych i **`getByDisplayValue`**. Przy placeholderze dokumentacja zaznacza, że nie zastępuje on etykiety (*„A placeholder is not a substitute for a label”*). Niżej stoją zapytania semantyczne `getByAltText` i `getByTitle`. Na samym końcu jest `getByTestId`, który szuka po atrybucie `data-testid`. Dokumentacja zaleca go tylko wtedy, gdy elementu nie da się dopasować po roli ani tekście, bo użytkownik tego atrybutu nie widzi ani nie słyszy. Wprowadzenie do React Testing Library nazywa go „furtką awaryjną” (*„escape hatch”*).

Poniższy fragment sprawdza oba sita z Rysunku 6.10, dosłowne porównanie ról i opcję `level`:

```jsx
// Przykład spoza demo: elementy, które getByRole pomija albo widzi inaczej
render(
  <>
    <div style={{ display: 'none' }}><button>Delete all</button></div>
    <label htmlFor="pw">Password</label>
    <input id="pw" type="password" />
    <button role="switch" aria-checked="false">Favorites only</button>
    <h1>Contacts</h1>
    <h2>Add contact</h2>
  </>
);
console.log(screen.queryByRole('button'));                              // → null: ukryty przez display: none
console.log(screen.getByRole('button', { hidden: true }).textContent);  // → Delete all
console.log(screen.queryByRole('textbox'));                             // → null: pole hasła nie ma roli
console.log(screen.getByLabelText('Password').type);                    // → password
console.log(screen.queryByRole('checkbox'));                            // → null: rola to switch
console.log(screen.getByRole('switch').textContent);                    // → Favorites only
console.log(screen.getByRole('heading', { level: 2 }).textContent);     // → Add contact
```

Pole `<input type="password">` według specyfikacji nie ma roli domyślnej, więc znajduje się je przez `getByLabelText`. Role porównuje się dosłownie, a bez opcji `level` zapytanie o `heading` kończy się tu błędem „Found multiple elements with the role "heading"”.
