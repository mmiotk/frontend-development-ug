# Contacts App — projekt referencyjny (wykład 06)

Aplikacja demo do wykładu „Wydajność, testowanie i wdrożenie”.
Temat demo (lista kontaktów) różni się od tematu labu (Pokédex).

## Uruchomienie

```bash
npm install
npm run dev
```

Otworzyć http://localhost:3000.

## Testy

```bash
npm run test       # tryb watch (Vitest)
npm run test:run   # jednorazowo
```

## Build produkcyjny

```bash
npm run build
npm run start
```

## Struktura

```
app/           # Next.js App Router
components/    # ContactItem, ContactList, SearchBar, AddContactForm, ContactStats
lib/           # contacts.js — dane i czyste funkcje
__tests__/     # testy RTL + Vitest
```
