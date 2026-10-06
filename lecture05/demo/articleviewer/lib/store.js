// lib/store.js
// In-memory articles store — resets on server restart, persists across requests.
// Next.js bundles Route Handlers separately from pages and Server Actions, so this
// module is loaded twice. Keeping the data on globalThis gives both one shared array.
const store = (globalThis.articleStore ??= {
  nextId: 4,
  articles: [
    {
      id: 1,
      title: "Intro to Server Components",
      author: "Alice",
      body: "Server Components run only on the server. They can fetch data directly without useEffect.",
      createdAt: "2025-01-01",
    },
    {
      id: 2,
      title: "Why use Server Actions?",
      author: "Bob",
      body: "Server Actions allow mutations to happen entirely on the server, with automatic CSRF protection.",
      createdAt: "2025-01-02",
    },
    {
      id: 3,
      title: "SWR vs TanStack Query",
      author: "Carol",
      body: "Both libraries provide client-side data fetching. SWR is simpler; TanStack Query has more features.",
      createdAt: "2025-01-03",
    },
  ],
});

export function getArticles() {
  return [...store.articles]; // return copy — prevent external mutation
}

export function getArticle(id) {
  return store.articles.find((a) => a.id === Number(id)) ?? null;
}

export function addArticle({ title, author, body }) {
  const article = {
    id: store.nextId++,
    title,
    author,
    body,
    createdAt: new Date().toISOString().slice(0, 10),
  };
  store.articles.push(article);
  return article;
}
