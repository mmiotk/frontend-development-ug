# Rozszerzenia do slajdu 11: Test formularza: walidacja, komunikat i czyszczenie pól

Powrót: [`slide_11_test-formularza.md`](../slide_11_test-formularza.md)

## Rozszerzenie: wspólne przygotowanie testów

Każdy test zaczyna się tak samo: `userEvent.setup()`, `render` i wyszukanie pól po etykietach. Barklund opisuje typowy sposób na takie powtórzenia. Na początku pliku testu tworzy się własną funkcję `setup` (*„It is common practice to create a custom setup function at the top of a test file”*). Funkcja przygotowuje przypadek testowy i zwraca to, czego potrzebują testy:

```jsx
function setup() {
  const user = userEvent.setup();
  const onAdd = vi.fn();
  render(<AddContactForm onAdd={onAdd} />);
  // zwraca wszystko, czego testy potrzebują, pod krótkimi nazwami
  return {
    user, onAdd,
    name: screen.getByLabelText(/imie i nazwisko/i),
    email: screen.getByLabelText(/email/i),
    submit: screen.getByRole('button', { name: /dodaj/i }),
  };
}

test('setup: valid submit', async () => {
  const { user, onAdd, name, email, submit } = setup();
  await user.type(name, 'Jan Kowalski');
  await user.type(email, 'jan@example.com');
  await user.click(submit);
  expect(onAdd).toHaveBeenCalledTimes(1);
});
```

W `contacts-app` testy są rozpisane w pełni, żeby każdy dało się przeczytać bez skakania po pliku. Funkcja `setup` opłaca się, gdy plik ma kilkanaście testów z tym samym początkiem.

## Rozszerzenie: atrapa, która zwraca Promise

Walidacja w `AddContactForm` jest synchroniczna, więc alert jest w drzewie od razu po `await user.click(...)`. Formularz, który wysyła dane do serwera, najpierw pokazuje stan oczekiwania, a komunikat o sukcesie pojawia się po spełnieniu Promise. Poniższy komponent jest spoza `contacts-app`.

```jsx
// NewsletterForm.jsx: czeka na Promise zwrócony przez onSubscribe
import { useState } from 'react';

export default function NewsletterForm({ onSubscribe }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('Zapisywanie...');
    try {
      await onSubscribe(email);
      setStatus('Zapisano.');
    } catch {
      setStatus('Nie udalo sie zapisac.');
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="nl-email">Email</label>
      <input id="nl-email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <button type="submit">Zapisz</button>
      <p role="status">{status}</p> {/* rola status: komunikat o stanie, obecny od początku */}
    </form>
  );
}
```

Jego test podstawia atrapę, która zwraca spełniony Promise. Metoda `mockResolvedValue` ustawia, co atrapa zwraca: Promise spełniony podaną wartością. Na stan końcowy czeka `findBy…`.

```jsx
test('shows pending text, then success', async () => {
  const user = userEvent.setup();
  const save = vi.fn().mockResolvedValue({ ok: true }); // zwraca spełniony Promise
  render(<NewsletterForm onSubscribe={save} />);
  await user.type(screen.getByLabelText(/email/i), 'ola@example.com');
  await user.click(screen.getByRole('button', { name: /zapisz/i }));
  expect(await screen.findByText(/zapisano/i)).toBeInTheDocument();     // czeka na koniec
  expect(screen.queryByText(/zapisywanie/i)).not.toBeInTheDocument(); // stan pośredni zniknął
  expect(save).toHaveBeenCalledWith('ola@example.com');
});
```

Kolejność asercji ma znaczenie: najpierw czeka się na stan końcowy, potem sprawdza, że stan pośredni zniknął. Ścieżkę błędu sprawdza się tak samo, tylko atrapa dostaje `mockRejectedValue(new Error('Network'))`, a test czeka na „Nie udalo sie zapisac.”. Obie ścieżki różnią się jedną linią przygotowania. Atrapa, której Promise jeszcze się nie spełnił, pozwala złapać stan pośredni: zaraz po kliknięciu akapit ze statusem ma tekst „Zapisywanie...”. Sztuczne `setTimeout` w testach są zbędne, bo spowalniają cały zestaw i pękają na wolniejszym komputerze.
