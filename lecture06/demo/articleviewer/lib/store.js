// Obiekt z artykułami stoi na globalThis, bo moduł ładuje się w kilku
// paczkach serwera, a wszystkie mają widzieć jedną tablicę. ??= tworzy go
// tylko raz, więc nowe dane startowe wymagają restartu serwera.
const store = (globalThis.articleStore ??= {
  nextId: 3, // numery 1 i 2 są zajęte przez artykuły startowe
  articles: [
    { id: 1, title: "Server Components", body: "They run only on the server." },
    { id: 2, title: "Server Actions", body: "They save data on the server." },
  ],
});

// Trzy funkcje to cały kontakt reszty aplikacji z danymi: po przejściu
// na bazę zmienia się ich wnętrze, a nazwy i argumenty zostają.
export function getArticles() {
  // płytka kopia: nowa tablica, ale te same obiekty artykułów
  return [...store.articles];
}

export function getArticle(id) {
  // id przychodzi z adresu jako napis, w magazynie jest liczbą
  return store.articles.find((a) => a.id === Number(id)) ?? null;
}

export function addArticle({ title, body }) {
  // odczyt i zwiększenie licznika w jednym ciągu, bez await pomiędzy,
  // więc dwa równoległe zapisy nie dostaną tego samego numeru
  const article = { id: store.nextId++, title, body };
  store.articles.push(article);
  return article;
}
