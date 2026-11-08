// lib/store.js
// Dane leżą na globalThis, bo moduł ładuje się w kilku paczkach serwera,
// a wszystkie mają widzieć jedną tablicę.
const store = (globalThis.articleStore ??= {
  nextId: 3, // numery 1 i 2 są zajęte przez artykuły startowe
  articles: [
    { id: 1, title: "Server Components", body: "They run only on the server." },
    { id: 2, title: "Server Actions", body: "They save data on the server." },
  ],
});

export function getArticles() {
  return [...store.articles]; // kopia tablicy: dopisanie do niej nie zmieni magazynu
}

export function getArticle(id) {
  // id przychodzi z adresu jako napis, w magazynie jest liczbą
  return store.articles.find((a) => a.id === Number(id)) ?? null;
}

export function addArticle({ title, body }) {
  const article = { id: store.nextId++, title, body }; // numer i od razu zwiększenie licznika
  store.articles.push(article);
  return article;
}
