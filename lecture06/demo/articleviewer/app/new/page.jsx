// Komponent kliencki, bo używa hooka. Import akcji daje odnośnik do funkcji
// serwerowej: formularz wywołuje ją bez adresu i bez JSON-u.
"use client";
import { useActionState } from "react";
import { createArticle } from "@/lib/actions";

export default function NewArticlePage() {
  // state: wynik akcji, action: do <form>, pending: true, gdy akcja trwa
  const [state, action, pending] = useActionState(createArticle, null);

  return (
    <main>
      <h1>New article</h1>
      <form action={action}>
        {/* name pola to klucz, który akcja czyta przez formData.get() */}
        <p>Title: <input name="title" /> {state?.error?.title}</p>
        <p>Body: <textarea name="body" /> {state?.error?.body}</p>
        {/* wyłączony, dopóki akcja trwa: nikt nie kliknie dwa razy */}
        <button disabled={pending}>Add article</button>
      </form>
    </main>
  );
}
