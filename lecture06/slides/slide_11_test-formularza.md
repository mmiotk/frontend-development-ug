# Test formularza: walidacja, komunikat i czyszczenie pól

## Co test musi wiedzieć o formularzu

Formularz dodawania jest najbardziej złożonym komponentem w `contacts-app`, a testy nie wymagają w nim żadnej poprawki. Funkcja `handleSubmit` w `components/AddContactForm.jsx` sprawdza dwie reguły: niepuste imię i znak `@` w adresie e-mail. Test korzysta wyłącznie z tego, co widać z zewnątrz. Wejściem są trzy pola podpisane etykietami „Imie i nazwisko”, „Telefon” i „Email” oraz przycisk „Dodaj”. Wyjściem jest akapit `<p role="alert">` z komunikatem, wywołanie `onAdd` z obiektem o czterech polach (kategoria wpisana na sztywno jako `'friends'`) i pola wyzerowane po sukcesie. Kolejność reguł też ma znaczenie, bo pierwszy błąd kończy funkcję i drugiego komunikatu już nie ma.

Część komponentu, której dotykają testy, wygląda tak:

```jsx
// components/AddContactForm.jsx (fragment)
  function handleSubmit(e) {
    e.preventDefault();                       // bez przeładowania strony
    if (!name.trim()) {                       // reguła 1: imię bez samych spacji
      setError('Imie jest wymagane.');
      return;                                 // pierwszy błąd kończy funkcję
    }
    if (!email.includes('@')) {               // reguła 2: znak @ w adresie
      setError('Podaj prawidlowy adres email.');
      return;
    }
    setError('');                             // sukces czyści komunikat
    onAdd({ name: name.trim(), phone, email, category: 'friends' });
    setName('');                              // pola wracają do pustych wartości
    setPhone('');
    setEmail('');
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h2>Dodaj kontakt</h2>
      {error && <p role="alert">{error}</p>}
      <div>
        <label htmlFor="name">Imie i nazwisko</label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      {/* pola „Telefon” (id="phone") i „Email” (id="email", type="email") zbudowane tak samo */}
      <button type="submit">Dodaj</button>
    </form>
  );
```

Dla testów ważny jest atrybut `noValidate` na `<form>`. MDN opisuje `novalidate` jako atrybut logiczny, który wskazuje, że formularz nie ma być walidowany przy wysyłaniu (*„indicates that the form shouldn't be validated when submitted”*). Pole adresu ma `type="email"`, więc bez tego atrybutu przeglądarka sama zablokowałaby adres `not-an-email`. Pokazałaby własny dymek, a `handleSubmit` w ogóle by się nie wykonał. Z `noValidate` całą kontrolę ma komponent, więc to, co sprawdzają testy w jsdom, zgadza się z tym, co zobaczy użytkownik.

## Pierwszy test: pusty formularz

Plik `__tests__/AddContactForm.test.jsx` ma cztery testy. Pierwszy wysyła pusty formularz:

```jsx
// __tests__/AddContactForm.test.jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddContactForm from '../components/AddContactForm';

test('shows error when name is empty on submit', async () => {
  const user = userEvent.setup();
  render(<AddContactForm onAdd={vi.fn()} />);
  // przycisk type="submit": kliknięcie wysyła formularz
  await user.click(screen.getByRole('button', { name: /dodaj/i }));
  // komunikat szuka się po roli, treść sprawdza wyrażenie regularne
  expect(screen.getByRole('alert')).toHaveTextContent(/imie jest wymagane/i);
});
```

Test klika „Dodaj” bez wpisywania czegokolwiek, a `handleSubmit` ustawia błąd „Imie jest wymagane.”. Po ponownym renderze w drzewie pojawia się akapit z rolą `alert`. Asercja szuka go po roli, a treść sprawdza matcherem `toHaveTextContent`, który dopasowuje wyrażenie regularne do tekstu elementu.

Test nie przywiązuje się do znacznika `<p>`. Zmiana na `<div role="alert">` nie zmieni wyniku, bo rola zostaje. Zmiana na zwykły `<p>` bez roli zmieni, i słusznie: rola `alert` należy do kontraktu komponentu, bo oznacza tekst jako komunikat o błędzie. `getByText` przepuściłby taką zmianę, a `getByRole('alert')` ją zatrzyma. Czy czytnik ekranu ogłosi komunikat, zależy jeszcze od tego, czy element z rolą istniał przed zmianą tekstu.

## Drugi test: błędny adres

Drugi test wpisuje dane do pól:

```jsx
test('shows error when email is invalid', async () => {
  const user = userEvent.setup();
  render(<AddContactForm onAdd={vi.fn()} />);
  // user.type klika w pole i wpisuje tekst znak po znaku
  await user.type(screen.getByLabelText(/imie i nazwisko/i), 'Jan Kowalski');
  await user.type(screen.getByLabelText(/email/i), 'not-an-email');
  await user.click(screen.getByRole('button', { name: /dodaj/i }));
  expect(screen.getByRole('alert')).toHaveTextContent(/prawidlowy adres email/i);
});
```

Imię jest poprawne, więc pierwsza reguła przechodzi, a druga zatrzymuje formularz komunikatem „Podaj prawidlowy adres email.”. Pola znajduje `getByLabelText`, tak jak znalazłby je użytkownik.

**`user.type`** jest skrótem złożonym z dwóch czynności. Według dokumentacji `user-event` najpierw klika w element, o ile opcja `skipClick` nie ma wartości `true` (*„Unless skipClick is true, click the element”*). Potem wpisuje tekst przez niskopoziomowe API klawiatury (*„Type the given text per keyboard()”*). Kliknięcie przenosi fokus do pola, a każdy znak wywołuje `onChange` i aktualizację stanu, więc wpisanie „Jan Kowalski” to dwanaście takich kroków. Klawisze specjalne zapisuje się w nawiasach klamrowych: `'jan@example.com{Enter}'` po adresie naciska Enter.

Druga metoda z tej grupy, **`user.clear`**, według tej samej dokumentacji ustawia fokus w polu, zaznacza całą zawartość i usuwa ją. Przydaje się w teście poprawiania błędu, który nie należy do pliku demo:

```jsx
test('fixing the email clears the alert', async () => {
  const user = userEvent.setup();
  const handleAdd = vi.fn();
  render(<AddContactForm onAdd={handleAdd} />);
  await user.type(screen.getByLabelText(/imie i nazwisko/i), 'Jan Kowalski');
  const email = screen.getByLabelText(/email/i);
  await user.type(email, 'not-an-email');
  await user.click(screen.getByRole('button', { name: /dodaj/i }));
  await user.clear(email);                     // pole znów puste
  await user.type(email, 'jan@example.com');
  await user.click(screen.getByRole('button', { name: /dodaj/i }));
  expect(screen.queryByRole('alert')).toBeNull(); // komunikat zniknął
  expect(handleAdd).toHaveBeenCalledTimes(1);     // rodzic dostał dane raz
});
```

Test przechodzi i pilnuje, że `setError('')` na ścieżce sukcesu działa. Bez tej linii alert zostałby na ekranie obok poprawnie dodanego kontaktu.

## Trzeci i czwarty test: sukces i czyszczenie

Trzeci i czwarty test pliku sprawdzają poprawną ścieżkę:

```jsx
test('calls onAdd with correct data on valid submit', async () => {
  const user = userEvent.setup();
  const handleAdd = vi.fn();
  render(<AddContactForm onAdd={handleAdd} />);
  await user.type(screen.getByLabelText(/imie i nazwisko/i), 'Jan Kowalski');
  await user.type(screen.getByLabelText(/telefon/i), '600 111 222');
  await user.type(screen.getByLabelText(/email/i), 'jan@example.com');
  await user.click(screen.getByRole('button', { name: /dodaj/i }));
  // obiekt porównywany pole po polu, kolejność kluczy bez znaczenia
  expect(handleAdd).toHaveBeenCalledWith({
    name: 'Jan Kowalski',
    phone: '600 111 222',
    email: 'jan@example.com',
    category: 'friends',
  });
});

test('clears the form after successful submit', async () => {
  const user = userEvent.setup();
  render(<AddContactForm onAdd={vi.fn()} />);
  const nameInput = screen.getByLabelText(/imie i nazwisko/i); // ten sam element przed i po wysłaniu
  await user.type(nameInput, 'Jan Kowalski');
  await user.type(screen.getByLabelText(/email/i), 'jan@example.com');
  await user.click(screen.getByRole('button', { name: /dodaj/i }));
  expect(nameInput).toHaveValue('');
});
```

Z czterema testami formularza raport projektu pokazuje `Test Files  4 passed (4)` i `Tests  12 passed (12)`: trzy testy wiersza, dwa listy, trzy wyszukiwarki i cztery formularza. Wartość `category: 'friends'` wynika z kodu komponentu, więc zmiana domyślnej kategorii złamie trzeci test. To zamierzone, bo rodzic dostałby inne dane. Pole nadmiarowe w obiekcie też daje czerwony wynik. Obcięcia spacji przez `name.trim()` żaden z czterech testów nie sprawdza, bo żaden ich nie wpisuje. Osobny test z imieniem `'  Jan Kowalski  '` przechodzi i pokazuje, że `onAdd` dostaje `'Jan Kowalski'`.

Czwarty test zapamiętuje pole imienia w zmiennej `nameInput` przed wysłaniem i po kliknięciu sprawdza na tym samym elemencie, że wartość jest pusta. Telefon pomija, bo nie jest wymagany. Każdy test renderuje komponent od nowa, więc czwarty nie widzi pól wypełnionych w trzecim.

## Test, który przechodzi za darmo

Czwarty test bez `await` w trzech liniach akcji przechodzi zawsze. Asercja trafia wtedy na pole, w którym jeszcze nic nie wpisano, a pusta wartość zgadza się z oczekiwaną. Przechodzi też wtedy, gdy z komponentu zniknie linia `setName('')`, której miał pilnować. Ta sama zmiana w komponencie przy teście z `await` daje czerwony wynik z komunikatem `expect(element).toHaveValue()`. <u>Test, który nie może się nie udać, niczego nie sprawdza</u>.

Zielony wynik bez treści ma w `contacts-app` jeszcze jedną postać. Test renderu wiersza przechodzi także po usunięciu `onDelete` z wywołania `render`, bo nikt nie klika. Brakuje w nim asercji na skutku, którego test miałby pilnować, więc przejście nie dowodzi, że prop jest przekazywany.

Stąd prosta metoda kontroli każdego nowego testu: usunięcie z komponentu linii, której test pilnuje, musi dać czerwony wynik. Test, który po takiej zmianie zostaje zielony, trzeba przepisać. Metoda działa też w drugą stronę: refaktoryzacja, po której ekran wygląda tak samo, ma zostawić wszystkie testy zielone. Ta sama kontrola wyłapuje zapytanie `getByDisplayValue('Jan Kowalski')`, które szuka pola po wpisanej wartości. Po zmianie `id` pola, która zrywa połączenie z `<label>`, taki test zostaje zielony, choć pole straciło etykietę.

## Trzy testy na luki w czterech testach

Cztery testy demo przechodzą przez każde z trzech wyjść `handleSubmit`: dwa wczesne `return` i ścieżkę sukcesu, więc pokrycie linii wyszłoby pełne. Zostają jednak dwa pytania bez odpowiedzi. Testy ścieżek błędu sprawdzają komunikat, ale nie sprawdzają, czy rodzic nie dostał danych. Wszystkie testy wysyłają formularz kliknięciem, a użytkownik klawiatury naciska Enter w ostatnim polu. Poniższe testy nie należą do projektu demo. Wszystkie trzy przechodzą:

```jsx
test('does not call onAdd when name is empty', async () => {
  const user = userEvent.setup();
  const handleAdd = vi.fn();
  render(<AddContactForm onAdd={handleAdd} />);
  await user.click(screen.getByRole('button', { name: /dodaj/i }));
  expect(screen.getByRole('alert')).toHaveTextContent(/imie jest wymagane/i);
  expect(handleAdd).not.toHaveBeenCalled(); // druga asercja ścieżki błędu
});

test('submits with Enter key', async () => {
  const user = userEvent.setup();
  const handleAdd = vi.fn();
  render(<AddContactForm onAdd={handleAdd} />);
  await user.type(screen.getByLabelText(/imie i nazwisko/i), 'Jan Kowalski');
  await user.type(screen.getByLabelText(/email/i), 'jan@example.com{Enter}');
  expect(handleAdd).toHaveBeenCalledTimes(1);
});

test('error message is not linked to the field', async () => {
  const user = userEvent.setup();
  render(<AddContactForm onAdd={vi.fn()} />);
  await user.click(screen.getByRole('button', { name: /dodaj/i }));
  const nameInput = screen.getByRole('textbox', { name: 'Imie i nazwisko' });
  expect(nameInput).toHaveAccessibleName('Imie i nazwisko');
  expect(nameInput).toHaveAccessibleDescription(''); // komunikat nie jest opisem pola
});
```

**Pierwszy** chroni przed błędem, którego cztery testy nie widzą. Gdy wywołanie `onAdd` przeniesie się na początek `handleSubmit`, przed reguły walidacji, alert nadal się pojawia i wszystkie cztery testy demo zostają zielone. Rodzic dostaje jednak kontakt z pustym imieniem, a nowy test pada z komunikatem `expected "spy" to not be called at all, but actually been called 1 times`. Ta sama zmiana psuje test z Enterem, bo atrapa dostaje dwa wywołania zamiast jednego. Trzeci test demo zostaje przy niej zielony, bo `toHaveBeenCalledWith` wystarcza jedno pasujące wywołanie, więc liczbę wywołań pilnuje osobno `toHaveBeenCalledTimes(1)`.

**Drugi** wysyła formularz klawiszem, bez kliknięcia. Formularz z przyciskiem `type="submit"` wysyła się po Enterze w polu tekstowym tak samo jak po kliknięciu. Test pilnuje, żeby nikt nie zamienił przycisku na `type="button"` z obsługą `onClick`. Mysz działałaby dalej, a klawiatura już nie.

**Trzeci** sprawdza stan pola po błędzie. Matchery `toHaveAccessibleName` i `toHaveAccessibleDescription` z `jest-dom` czytają nazwę i opis dostępny pola, czyli dodatkowy tekst, który czytnik ekranu odczytuje razem z nazwą. Komunikat w alercie nie jest z polem powiązany, więc opis jest pusty. Asercja dokumentuje tę lukę i po dodaniu powiązania zmieni kolor na czerwony.

## Test formularza razem ze stroną

Testy `AddContactForm` kończą się na granicy komponentu: sprawdzają, że `onAdd` dostało właściwy obiekt. Czy kontakt naprawdę pojawia się na liście, zależy już od `HomePage`, która trzyma stan i przekazuje `handleAdd`. Test, który renderuje całą stronę i sprawdza kilka komponentów naraz, nazywa się **testem integracyjnym**. Atrapy nie ma w nim wcale, bo w miejscu `onAdd` stoi prawdziwa funkcja rodzica:

```jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HomePage from '../app/page';

test('adding a contact shows it on the list', async () => {
  const user = userEvent.setup();
  render(<HomePage />);
  // każdy wiersz ma jeden przycisk usuwania, więc liczba przycisków to liczba wierszy
  expect(screen.getAllByRole('button', { name: /usun kontakt/i })).toHaveLength(5);
  await user.type(screen.getByLabelText(/imie i nazwisko/i), 'Jan Kowalski');
  await user.type(screen.getByLabelText(/email/i), 'jan@example.com');
  await user.click(screen.getByRole('button', { name: /dodaj/i }));
  expect(screen.getAllByRole('button', { name: /usun kontakt/i })).toHaveLength(6);
  expect(screen.getByText('Jan Kowalski')).toBeInTheDocument();
});
```

Test przechodzi: przed kliknięciem lista ma pięć wierszy, po nim sześć, a statystyka pokazuje łącznie 6. Wiersze liczy się po przyciskach usuwania, bo element `<li>` mają także pozycje statystyki, a `toHaveLength` sprawdza długość zwróconej tablicy. Ten sam układ sprawdza wyszukiwanie: po wpisaniu „ann” w pole wyszukiwania na liście zostaje sam wiersz Anny Kowalskiej. Test integracyjny łapie błąd, którego testy komponentów nie widzą, na przykład `HomePage` przekazującą formularzowi niewłaściwą funkcję. Przy porażce trudniej z niego odczytać przyczynę, bo w grę wchodzą cztery komponenty. Zestaw testów łączy więc oba rodzaje: dużo szybkich testów komponentów i pojedyncze testy całej strony. Projekt demo testu integracyjnego nie ma: jego testy dotyczą czterech komponentów osobno. Test całej strony nadal działa w jsdom, więc nie sprawdza buildu, serwera ani prawdziwej przeglądarki. To zostaje dla testów *end-to-end*, które uruchamiają zbudowaną aplikację.

> 💡 **Zapamiętaj:** test formularza wpisuje i wysyła tak jak użytkownik, także klawiszem Enter, a sprawdza to, co widać na ekranie i co dostał rodzic. Ścieżka błędu potrzebuje dwóch asercji: komunikatu i braku wywołania `onAdd`.


Materiał rozszerzony do tego slajdu: [`rozszerzenia/r11_test-formularza.md`](rozszerzenia/r11_test-formularza.md)
