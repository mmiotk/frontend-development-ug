# Rozszerzenia do slajdu 10: Reguły walidacji zapisane w jednym schemacie

Powrót: [`slide_10_walidacja-zod.md`](../slide_10_walidacja-zod.md)

## Rozszerzenie: atrybuty HTML jako trzeci poziom sprawdzania

Atrybuty HTML `required`, `minlength` i `maxlength` sprawdza sama przeglądarka, zanim w ogóle wywoła akcję. W JSX zapisuje się je przy polu tytułu w `app/new/page.jsx`.

```jsx
// Przykład spoza demo: reguły tytułu w atrybutach pola.
// required: pole niepuste; minLength i maxLength: liczba znaków, spacje też się liczą
<input id="title" name="title" type="text" required minLength={3} maxLength={100} />
```

```text
„ab” + Submit    → dymek „Please lengthen this text to 3 characters or more (you are currently using 2 characters).”, akcja się nie wykonuje
puste + Submit   → dymek „Please fill out this field.”
„   ” + Submit   → akcja się wykonuje, pod polem „Title must be at least 3 characters.”
105 znaków       → w polu zostaje 100
```

Treść dymku pochodzi od przeglądarki (tu Chromium w wersji angielskiej). Trzy spacje przechodzą oba atrybuty i zatrzymuje je dopiero `.trim()` w schemacie. Atrybuty chronią dane tak samo słabo jak kod w przeglądarce, bo żądanie można wysłać z pominięciem formularza.
