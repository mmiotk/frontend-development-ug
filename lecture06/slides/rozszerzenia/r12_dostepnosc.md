# Rozszerzenia do slajdu 12: Dostępność: co czytnik ekranu wie o stronie

Powrót: [`slide_12_dostepnosc.md`](../slide_12_dostepnosc.md)

## Rozszerzenie: omijanie bloków

Kryterium WCAG 2.4.1 *Bypass Blocks* wymaga sposobu ominięcia bloków powtarzanych na wielu stronach, na przykład nawigacji. W3C wymienia wśród technik wystarczających link na początku strony prowadzący do głównej treści, punkty orientacyjne ARIA i nagłówki na początku sekcji. Pierwsza technika to jeden link z adresem `#id`:

```jsx
// Przykład spoza demo: app/skip/page.jsx, link omijający nawigację przed listą kontaktów
<>
  <a href="#contacts">Skip to contacts</a>
  <nav aria-label="Main">
    <a href="/">Home</a> <a href="/about">About</a> <a href="/help">Help</a>
  </nav>
  <main id="contacts">
    <ContactList contacts={initialContacts} onDelete={() => {}} />
  </main>
</>
```

```text
Tab, Enter, Tab       → fokus na „Usun kontakt Anna Kowalska”
Tab ×5 bez Enter      → Skip to contacts, Home, About, Help, „Usun kontakt Anna Kowalska”
```

Po Enter fokus nie trafia na `<main>`, ale Chromium zaczyna od niego kolejne przejście klawiszem Tab. `contacts-app` ma jedną stronę bez nawigacji, a `<main>` i tak jest punktem orientacyjnym.

## Rozszerzenie: kontrast tekstu

Kryterium WCAG 1.4.3 *Contrast (Minimum)* wymaga kontrastu tekstu z tłem co najmniej 4,5:1, a dla dużego tekstu 3:1. W3C zaznacza, że kryterium obejmuje też tekst zastępczy pól (*placeholder*). Plik `globals.css` w `contacts-app` jest pusty, więc tekst jest czarny na białym tle, z kontrastem 21:1. Granicę widać na polu wyszukiwania. Domyślny kolor tekstu zastępczego „wpisz imie lub email...” w Chromium 154 to `rgb(117, 117, 117)`, czyli `#757575`. Kontrast liczy się ze wzoru WCAG na luminancję względną:

```js
// Przykład spoza demo: współczynnik kontrastu dla kolorów z contacts-app
const luminance = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)); // usunięcie korekcji gamma
  return 0.2126 * r + 0.7152 * g + 0.0722 * b; // zielony waży najwięcej
};
const contrast = (fg, bg) => {
  const [hi, lo] = [luminance(fg), luminance(bg)].sort((a, b) => b - a);
  return (hi + 0.05) / (lo + 0.05);
};
console.log(contrast('#000000', '#ffffff').toFixed(2)); // → 21.00: tekst strony
console.log(contrast('#757575', '#ffffff').toFixed(2)); // → 4.61: placeholder w Chromium
console.log(contrast('#a9a9a9', '#ffffff').toFixed(2)); // → 2.35: poniżej progu 4,5
```

Jaśniejszy szary `#a9a9a9` w regule `::placeholder` złamałby więc kryterium.

## Rozszerzenie: zmiana trasy w Next.js

Przy nawigacji przez `next/link` strona się nie przeładowuje, więc czytnik nie ogłasza nowej strony sam. Next.js dodaje do tego **route announcer**, czyli element, który odczytuje nazwę nowej strony:

> **„Route announcer w Next.js szuka nazwy strony do ogłoszenia, sprawdzając najpierw `document.title`, potem element `<h1>`, a na końcu ścieżkę URL.”**
>
> *„The Next.js route announcer looks for the page name to announce by first inspecting document.title, then the <h1> element, and finally the URL pathname.”*
>
> — dokumentacja Next.js, *Accessibility*

Dokumentacja zaleca unikalny, opisowy tytuł każdej strony. Poniżej strona `/about` dostaje własny.

```jsx
// Przykład spoza demo: app/about/page.jsx z własnym tytułem
export const metadata = { title: 'About contacts' };

export default function AboutPage() {
  return <h1>About this app</h1>;
}
// w app/page.jsx: <Link href="/about">About</Link> nad ContactStats
```

```text
po kliknięciu „About”, element role="alert" aria-live="assertive" w <next-route-announcer>:
z metadata.title    → About contacts
bez metadata.title  → (pusty)
```

Bez własnego tytułu strona dziedziczy „Contacts App” z layoutu, a announcer ogłasza tylko zmianę tytułu, więc milczy. Next.js dołącza też wtyczkę `eslint-plugin-jsx-a11y`, która ostrzega między innymi przed brakującym tekstem alternatywnym obrazów.
