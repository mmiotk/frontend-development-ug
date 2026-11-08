// app/new/page.jsx
"use client";
import { useActionState } from "react";
import { createArticle } from "@/lib/actions";

export default function NewArticlePage() {
  // pending: true, dopóki akcja trwa na serwerze
  const [state, action, pending] = useActionState(createArticle, null);

  return (
    <main>
      <h1>New article</h1>
      <form action={action}>
        <p>Title: <input name="title" /> {state?.error?.title}</p>
        <p>Body: <textarea name="body" /> {state?.error?.body}</p>
        <button disabled={pending}>Add article</button>
      </form>
    </main>
  );
}
