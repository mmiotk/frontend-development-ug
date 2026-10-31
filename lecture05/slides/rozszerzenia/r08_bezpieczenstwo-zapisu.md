# Rozszerzenia do slajdu 08: Każde wejście do zapisu pilnuje się samo

Powrót: [`slide_08_bezpieczenstwo-zapisu.md`](../slide_08_bezpieczenstwo-zapisu.md)

## Rozszerzenie: ochrony wbudowane i ich granice

Next.js dokłada zabezpieczenia bez udziału programisty. Akcję wywołuje się wyłącznie metodą `POST`. Nagłówek `Origin` żądania jest porównywany z nagłówkiem `Host` albo `X-Forwarded-Host`, a niezgodne żądania są odrzucane. Chroni to przed **CSRF** (*Cross-Site Request Forgery*), czyli przed cudzą stroną, która w tle wysyła żądanie w imieniu zalogowanego użytkownika. Ochrona ma jednak granicę.

```bash
# Przykład spoza demo: formularz /new wysłany z terminala, tak jak bez JavaScriptu
# ACTION_ID: identyfikator createArticle z .next/server/server-reference-manifest.json
send() { curl -s -o /dev/null -w "%{http_code}\n" -X POST localhost:3000/new "$@" \
  -F '$ACTION_REF_1=' -F "\$ACTION_1:0={\"id\":\"$ACTION_ID\",\"bound\":\"\$@1\"}" -F '$ACTION_1:1=[null]' \
  -F '$ACTION_KEY=k1' -F title="Sent from terminal" -F author=Mallory -F body="No browser was involved here."; }
send -H "Origin: https://evil.example" # → 500, artykułu nie przybywa
send                                   # → 303, artykuł zapisany
```

Przy pierwszym żądaniu serwer notuje „… does not match `origin` header with value `evil.example` … Aborting the action.”, przy drugim tylko ostrzeżenie „Missing `origin` header from a forwarded Server Actions request.”. Ochrona blokuje więc obce strony w przeglądarce, ale nie zatrzymuje programu wysyłającego żądania z terminala.

Tę samą granicę ma plik **`proxy.js`**, czyli kod uruchamiany przed obsługą żądania (dawniej `middleware`), który bywa używany do sprawdzania sesji. Dokumentacja tego pliku przypomina, że funkcje serwerowe nie są osobnymi trasami. Obsługuje się je jako żądania `POST` pod adres strony, na której ich użyto. Wzorzec `matcher`, który pomija daną ścieżkę, pomija więc także wywołania akcji na tej ścieżce. Przeniesienie akcji na inną trasę może po cichu zdjąć z niej kontrolę, dlatego sprawdzenie zostaje w samej funkcji serwerowej.

Druga granica dotyczy liczby żądań. Formularz można wysłać tysiąc razy z rzędu, a każde wysłanie przejdzie kontrolę sesji i schematu. Przewodnik *Data Security* zaleca przy kosztownych operacjach, takich jak wysyłka e-maili czy zapis do bazy, **ograniczanie liczby żądań** (*rate limiting*). Przykład w przewodniku *Backend for Frontend* odpowiada na nadmiar żądań kodem 429 i treścią `{ error: 'Rate limit exceeded' }`.

## Rozszerzenie: domknięcia i wartość zwracana

Akcja zdefiniowana wewnątrz komponentu serwerowego może korzystać ze zmiennych otaczającej funkcji, czyli tworzy domknięcie. Zmienne przechwycone przez akcję wędrują do klienta i z powrotem, więc Next.js je szyfruje.

```jsx
// Przykład spoza demo: app/closure/page.jsx
export default async function ClosurePage() {
  const article = getArticle(1);
  const draftNote = "internal-note-42"; // wartość, której nie ma w interfejsie
  async function publish() {
    "use server";
    console.log("PUBLISH", article.id, draftNote); // → PUBLISH 1 internal-note-42
  }
  return <form action={publish}><p>{article.title}</p><button type="submit">Publish</button></form>;
}
// HTML strony i treść POST: zaszyfrowany napis w polu $ACTION_1:2, bez „internal-note-42”
// ta sama treść POST wysłana do serwera z innego buildu → 500, OperationError przy odszyfrowaniu
```

Przewodnik *Data Security* zastrzega, że samo szyfrowanie nie wystarcza do ochrony wartości wrażliwych. Bezpieczniej jest odczytać je ponownie na serwerze w chwili wywołania.

Wartość zwracana przez akcję jest serializowana do klienta, więc kształtuje się ją według tego, co wyświetla interfejs. `createArticle` zwraca `{ success: true }` zamiast pełnego rekordu, który mógłby zawierać pola nieprzeznaczone dla przeglądarki.

## Rozszerzenie: tekst od użytkownika na stronie

Zapisany tekst wraca na ekran pod `/articles/[id]`. JSX zamienia tekst na bezpieczną postać przed wstawieniem do strony, a atrybut `dangerouslySetInnerHTML` wstawia surowy HTML.

```jsx
// Przykład spoza demo: artykuł z treścią <img src=x onerror="alert(1)"><script>alert(2)</script>
<p>{article.body}</p>
// → w HTML &lt;img src=x onerror=&quot;alert(1)&quot;&gt;…, napis na ekranie, żadne okno alert
<div dangerouslySetInnerHTML={{ __html: article.body }} />
// → dwa okna alert: „2”, potem „1”
```

Taki atak nazywa się **XSS** (*Cross-Site Scripting*). Treść od użytkowników wstawia się przez `dangerouslySetInnerHTML` tylko po oczyszczeniu biblioteką do sanityzacji HTML.
