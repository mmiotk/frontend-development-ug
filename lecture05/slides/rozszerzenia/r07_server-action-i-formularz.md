# Rozszerzenia do slajdu 07: Zapis, który wykonuje się na serwerze

Powrót: [`slide_07_server-action-i-formularz.md`](../slide_07_server-action-i-formularz.md)

## Rozszerzenie: dodatkowy argument akcji

Formularz edycji potrzebuje identyfikatora artykułu, którego użytkownik nie wpisuje. Przewodnik Next.js o formularzach pokazuje na to metodę `bind`. Metoda tworzy nową funkcję z ustalonymi z góry pierwszymi argumentami.

```js
function save(id, text) {
  return `zapis ${id}: ${text}`;
}
const saveSeven = save.bind(null, 7); // pierwszy argument ustalony z góry
saveSeven("nowa treść");              // "zapis 7: nowa treść"
```

Zapis `updateArticle.bind(null, article.id)` daje więc akcję, która dostaje identyfikator przed `FormData`. Według przewodnika `bind` działa w komponentach serwerowych i klienckich i wspiera progresywne wzbogacanie, czyli działanie formularza bez JavaScriptu. Alternatywą jest pole `<input type="hidden" name="id">`, którego wartość staje się częścią wyrenderowanego HTML-a i nie jest kodowana. W obu przypadkach identyfikator przychodzi od klienta, więc akcja sprawdza, czy wolno go zmienić.

## Rozszerzenie: ukryte pola i formularz przed hydratacją

React dokłada do formularza z akcją ukryte pola. Widać je, gdy akcja wypisze klucze `FormData`.

```js
// Przykład spoza demo: pierwsza linia createArticle w lib/actions.js
console.log(JSON.stringify([...formData.keys()]));
// z JavaScriptem  → ["$ACTION_REF_1","$ACTION_1:0","$ACTION_1:1","$ACTION_KEY","title","author","body"]
// bez JavaScriptu → ["title","author","body"]

// pola innych typów w osobnym formularzu: <input type="number" name="count" defaultValue={42}> i pusty <input type="file" name="cover">
console.log(typeof formData.get("count"), formData.get("cover").constructor.name); // → string File
```

Bez JavaScriptu przeglądarka wysyła zwykły formularz HTML z tymi polami, a Next.js odczytuje z nich, którą akcję wywołać, i usuwa je przed wywołaniem. `createArticle` wybiera pola jawnie, po jednym, więc dodatkowe klucze nie mają znaczenia. Dokumentacja `useActionState` opisuje skutek.

> **„W połączeniu z funkcją serwerową `useActionState` pozwala pokazać odpowiedź serwera, zanim zakończy się hydratacja.”**
>
> *„When used with a Server Function, `useActionState` allows the server's response to be shown before hydration (when React attaches to server-rendered HTML) completes.”*
>
> — dokumentacja React, *useActionState*

Przed hydratacją nie działa natomiast `SubmitButton`. `useFormStatus` nie ma czego zgłosić, więc przycisk nie blokuje się w czasie wysyłki, a dwa szybkie kliknięcia mogą zapisać dwa artykuły o tej samej treści.

## Rozszerzenie: identyfikatory po wdrożeniu

Identyfikator akcji jest częścią artefaktów budowania. Według przewodnika nowe wdrożenie zwykle generuje nowe identyfikatory, a Next.js zmienia je najrzadziej co 14 dni, nawet bez zmian w kodzie.

```text
# Przykład spoza demo: ten sam kod, identyfikator createArticle z .next/server/server-reference-manifest.json
build w katalogu z poprzednim .next      → 60f7b4fc…, bez zmian
build po usunięciu .next (czysty build)  → 60323dde…, nowy
# stara karta wysyła stary identyfikator do nowego serwera:
POST /new, Next-Action: 60be19ea…  → 409 Conflict, „Server Action unavailable.”
terminal serwera: Error: Failed to find Server Action "60be19ea…". This request might be from an older or newer deployment.
```

Klucz leży w pliku `.next/cache/.rscinfo` z datą wygaśnięcia za 14 dni, więc nowe identyfikatory daje czysty build albo upływ tego czasu. Odświeżenie strony pobiera nowe identyfikatory.
