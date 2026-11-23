# Rozszerzenia do slajdu 04: Czekanie, awaria i strona jednego artykułu

Powrót: [`slide_04_ladowanie-bledy-i-artykul.md`](../slide_04_ladowanie-bledy-i-artykul.md)

## Rozszerzenie: prawdziwy status i roboty

Gdy prawdziwy status jest potrzebny, na przykład dla statystyk albo robotów wyszukiwarek, istnienie zasobu sprawdza się, zanim treść odpowiedzi zacznie płynąć, czyli przed granicą Suspense. W `articleviewer` granicę stawia już `loading.jsx`, więc `/articles/99` odpowiada kodem 200 ze znacznikiem `noindex`. Część robotów oznacza takie strony jako **miękkie 404** (*soft 404s*). Sprawdzenie przed renderem robi plik `proxy.js`:

```js
// Przykład spoza demo: proxy.js w katalogu projektu
import { NextResponse } from "next/server";
import { getArticle } from "@/lib/store";

export function proxy(request) {
  const id = request.nextUrl.pathname.split("/").pop();
  if (!getArticle(id)) return new NextResponse("Article not found", { status: 404 }); // przed strumieniem
}

export const config = { matcher: "/articles/:id" };
// GET /articles/1  → 200
// GET /articles/99 → 404 "Article not found"
```

Strumień zmienia też to, co widzą roboty. Według dokumentacji `loading.js` dla robotów, które czytają wyłącznie statyczny HTML, takich jak Twitterbot, Next.js najpierw kończy `generateMetadata`, a dopiero potem strumieniuje interfejs. Strona z `generateMetadata`, która czeka 300 ms, wysyła przeglądarce pierwszy bajt po 0,08 s z tytułem dopisanym dalej w `<body>`, a Twitterbotowi po 0,31 s z `<title>` w `<head>`. Listę takich robotów ustawia opcja `htmlLimitedBots`. Kumar w *Fluent React* opisuje ten sam podział w Remiksie: dla robota odpowiedź musi zawierać wyrenderowaną treść strony, a przeglądarka dostaje jeszcze JavaScript do hydratacji.
