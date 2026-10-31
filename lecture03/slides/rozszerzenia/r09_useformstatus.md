# Rozszerzenia do slajdu 09: Przycisk, który sam wie, że formularz się wysyła

Powrót: [`slide_09_useformstatus.md`](../slide_09_useformstatus.md)

## Rozszerzenie: cztery pola statusu

Hook zwraca obiekt z czterema polami. Demo używa tylko `pending`, ale pozostałe przydają się przy bardziej rozbudowanych przyciskach.

- **`pending`** ma wartość `true` na czas wysyłania formularza nadrzędnego.
- **`data`** to obiekt `FormData` z danymi, które formularz właśnie wysyła. Gdy nic się nie wysyła albo formularza nadrzędnego nie ma, pole ma wartość `null`.
- **`method`** to napis `"get"` albo `"post"`, odczytany z atrybutu `method` formularza.
- **`action`** to odwołanie do funkcji przekazanej w atrybucie `action` formularza.

Pole `method` przy akcji z funkcją łatwo źle odczytać. Formularz `/new` nie ma atrybutu `method`, więc przeglądarka przyjmuje domyślne GET i w trakcie wysyłania hook zwraca `method: "get"`, choć akcja niczego nie wysyła przez sieć. Poza wysyłaniem pole ma wartość `null`. Dokumentacja zastrzega też, że pole `action` nigdy nie zawiera adresu jako napisu. Gdy w atrybucie `action` stoi adres URI albo atrybutu nie ma wcale, `status.action` ma wartość `null`.

Pole `data` pozwala pokazać, co jest w drodze:

```jsx
// Rozszerzenie spoza demo: przycisk pokazuje, co jest wysyłane.
function SubmitButtonWithTitle() {
  const { pending, data } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {/* data.get tylko w gałęzi pending: poza wysyłaniem data to null */}
      {pending ? `Sending: ${data.get("title")}` : "Submit"}
    </button>
  );
}
```

Wywołanie metody na `null` rzuciłoby wyjątek, dlatego odczyt stoi tylko w gałęzi `pending`.

## Rozszerzenie: przycisk zostaje w kolejności fokusu

MDN opisuje alternatywę dla `disabled`: atrybut `aria-disabled`. Wśród przykładów jego użycia wymienia przycisk wysyłania.

> **„Przycisk, który trzeba zachować w kolejności fokusu strony, choć jego działanie jest chwilowo niedostępne, na przykład wysłanie formularza.”**
>
> *„A button which is important to keep in the page's focus order, but its action is presently unavailable - such as submitting a form”*
>
> — MDN, *ARIA: aria-disabled attribute*

Ta sama strona podaje cenę. `aria-disabled="true"` tylko ogłasza stan wyłączenia, a blokadę działania i wygląd musi dopisać programista. Przycisk z samym tym atrybutem dalej wysyła formularz, a każde kliknięcie w trakcie wysyłania dopisuje kolejne wywołanie akcji do kolejki `useActionState`. Wersja zachowująca fokus odrzuca więc kliknięcie sama. To przykład spoza projektu:

```jsx
// Przykład spoza projektu: przycisk zostaje w kolejności klawisza Tab podczas wysyłania.
function FocusableSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      aria-disabled={pending}
      onClick={(e) => {
        if (pending) e.preventDefault(); // anuluje drugie wysłanie
      }}
    >
      {pending ? "Submitting..." : "Submit"}
    </button>
  );
}
```

Wywołanie `e.preventDefault()` anuluje domyślne działanie przycisku typu `submit`, czyli wysłanie formularza. Wygląd stanu wyłączonego dopisuje się selektorem `[aria-disabled="true"]`, bo pseudoklasa `:disabled` takiego przycisku nie obejmie. Wersja z `aria-disabled` lepiej służy osobie poruszającej się klawiszem Tab, pod warunkiem że blokada jest w kodzie.
