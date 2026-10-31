# Rozszerzenia do slajdu 10: Przekierowanie po zapisie

Powrót: [`slide_10_przekierowanie.md`](../slide_10_przekierowanie.md)

## Rozszerzenie: historia przeglądarki, `push` i `replace`

Przekierowanie zmienia też historię przeglądarki, a sposób wybiera drugi argument `redirect`. Wartość **`push`** dopisuje nowy wpis na stos historii, więc przycisk „Wstecz” wraca na poprzednią stronę. Wartość **`replace`** podmienia bieżący wpis, więc strona sprzed przekierowania znika z historii:

```js
import { redirect, RedirectType } from "next/navigation";

redirect("/", RedirectType.push);    // domyślne w Server Action: „Wstecz” wraca na /new
redirect("/", RedirectType.replace); // domyślne poza akcjami: /new znika z historii
```

Dokumentacja podaje domyślne wartości wprost: `push` w Server Actions i `replace` wszędzie indziej. W akcji `createArticle` działa więc `push`. Przycisk „Wstecz” po zapisie wraca do pustego formularza na `/new`, bez ponownego wysłania. Ta sama dokumentacja zastrzega, że w komponencie serwerowym parametr nie ma skutku. Wywołanie w trakcie renderu strony kończy render i zwraca odpowiedź z przekierowaniem, więc po stronie przeglądarki nie ma czego dopisywać do historii.

## Rozszerzenie: ten sam `redirect` poza akcją

Poza akcjami `redirect` odpowiada kodem 307, który zachowuje metodę i treść żądania. Kod 303 zmienia metodę na `GET`, a treść żądania przepada. W akcji ta różnica jest ukryta, bo Next.js sam wybiera 303. W **Route Handlerze** wybór należy do autora. Dwa pliki spoza projektu pokazują różnicę:

```js
// Rozszerzenie spoza demo: app/api/go307/route.js
import { redirect } from "next/navigation";
export async function POST() {
  redirect("/api/articles"); // 307: klient powtarza POST pod nowym adresem
}

// Rozszerzenie spoza demo: app/api/go303/route.js
import { NextResponse } from "next/server";
export async function POST(request) {
  return NextResponse.redirect(new URL("/api/articles", request.url), 303); // 303: dalej GET
}
```

Wywołanie `fetch` z metodą `POST` i artykułem w treści daje dwa różne wyniki. Pod `/api/go307` przekierowanie powtarza `POST` pod `/api/articles` i odpowiedź ma kod 201. Na liście przybywa artykuł, choć `go307` niczego nie zapisuje. Pod `/api/go303` `fetch` idzie dalej metodą `GET` i dostaje listę z kodem 200. <u>Przekierowanie po zapisie w Route Handlerze potrzebuje jawnego kodu 303.</u> Bez drugiego argumentu `NextResponse.redirect` też odpowiada kodem 307.

Przekierowanie niezależne od danych strony, na przykład ze starego adresu po zmianie struktury witryny, wpisuje się wcześniej. Służy do tego opcja `redirects` w `next.config.js` albo plik `proxy.js`, który wywołuje `NextResponse.redirect`, zanim Next.js zacznie obsługiwać trasę.

## Rozszerzenie: `unstable_rethrow`

Gdy `catch` musi objąć większy fragment, dokumentacja wskazuje funkcję `unstable_rethrow` z `next/navigation`. Wywołuje się ją na początku bloku `catch` z przechwyconym błędem:

```js
import { unstable_rethrow } from "next/navigation";

try {
  addArticle(result.data);
  revalidatePath("/");
  redirect("/");
} catch (e) {
  unstable_rethrow(e); // wyjątki z redirect() i notFound() idą dalej, do frameworka
  return { error: { _form: ["Zapis się nie udał"] } }; // tu docierają tylko zwykłe błędy
}
```

Wyjątki sterujące z `notFound()`, `redirect()` i `permanentRedirect()` funkcja rzuca dalej, a zwykłe błędy przepuszcza do reszty bloku. Strona funkcji zastrzega, że API jest niestabilne i nie jest zalecane w produkcji. Dokumentacja dodaje warunek: funkcja ma sens tylko wtedy, gdy `catch` może złapać jednocześnie błąd aplikacji i wyjątek frameworka.

## Rozszerzenie: komunikat na stronie docelowej

Komunikat da się przenieść na stronę docelową na dwa sposoby. Żadnego z nich nie ma w projekcie.

1. **Parametr w adresie.** Akcja przekierowuje na `/?added=1`, a strona odczytuje `added` z `searchParams`, który w Next.js 16 jest obiektem Promise. Komunikat zniknie przy następnym wejściu bez parametru, ale zostaje w adresie skopiowanym do zakładek.
2. **Ciasteczko jednorazowe** (*flash cookie*). Akcja ustawia ciasteczko przed `redirect`, a strona je odczytuje. Bugl w *Modern Full-Stack React Projects* używa tej samej kolejności w akcji logowania: najpierw ustawia ciasteczko, potem przekierowuje.

```js
// Przykład spoza demo: akcja z ciasteczkiem jednorazowym
export async function createWithFlash(formData) {
  addArticle({ title: formData.get("title"), author: "Alice", body: "Flash cookie example body." });
  revalidatePath("/");
  (await cookies()).set("flash", "Article added", { maxAge: 10 }); // ciasteczko żyje 10 s
  redirect("/flash");
}

// Przykład spoza demo: strona docelowa /flash
const flash = (await cookies()).get("flash")?.value;
// JSX: {flash && <p>{flash}</p>}
// → po przekierowaniu „Article added”, odświeżenie po 3 s „Article added”, po 11 s brak komunikatu
```

Strona, która pokazała komunikat, nie może go usunąć, bo dokumentacja `cookies` pozwala zmieniać ciasteczka tylko w Server Function albo w Route Handlerze. Wywołanie `store.delete("flash")` w komponencie strony kończy się ekranem `error.jsx`. Pod `next dev` ekran pokazuje „Cookies can only be modified in a Server Action or Route Handler.”, a pod `next start` tylko ogólny błąd Reacta.

Wybór między wariantami zależy od formularza. Formularz, w którym dodaje się wiele wpisów pod rząd, zostawia użytkownika na miejscu i pokazuje komunikat sukcesu. Formularz, po którym naturalnym krokiem jest obejrzenie wyniku, przekierowuje. W obu wariantach `revalidatePath` stoi w akcji.
