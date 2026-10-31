# Rozszerzenia do slajdu 07: Formularz, który przekazuje dane funkcji

Powrót: [`slide_07_form-action.md`](../slide_07_form-action.md)

## Rozszerzenie: kilka przycisków w jednym formularzu

Formularz może też mieć więcej niż jedną akcję. Przycisk z atrybutem `formAction` nadpisuje akcję całego formularza, więc „Submit” i „Save draft” mogą wywołać dwie różne funkcje z tymi samymi polami. Demo tego nie używa:

```jsx
<form action={submitIssue}>
  <input name="title" />
  <button type="submit">Submit</button>
  {/* formAction: ten przycisk wywoła saveDraft zamiast submitIssue */}
  <button formAction={saveDraft}>Save draft</button>
</form>
```

Gdy oba przyciski robią to samo i różnią się jednym parametrem, wystarczy atrybut `name` na przycisku. MDN opisuje go tak:

> **„Nazwa przycisku, wysyłana w parze z jego wartością `value` jako część danych formularza, gdy formularz zostanie wysłany tym przyciskiem.”**
>
> *„The name of the button, submitted as a pair with the button's `value` as part of the form data, when that button is used to submit the form.”*
>
> — MDN Web Docs, *&lt;button&gt;: The Button element*

Przykład spoza projektu zastępuje listę priorytetów dwoma przyciskami:

```jsx
<form action={action}>
  <input name="title" />
  {/* para priority=medium albo priority=high, zależnie od klikniętego przycisku */}
  <button type="submit" name="priority" value="medium">Submit</button>
  <button type="submit" name="priority" value="high">Submit as urgent</button>
</form>
```

Kliknięcie „Submit as urgent” daje w akcji `FormData` z parami `title` i `priority` równym `"high"`. Klawisz Enter w polu tekstowym wysyła formularz tak, jakby kliknięto pierwszy przycisk wysyłania, więc akcja dostaje wtedy `"medium"`. Ta sama operacja z innym parametrem to `name` i `value` na przyciskach, a inna operacja, jak zapis szkicu, to `formAction` z osobną funkcją.
