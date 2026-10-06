// app/new/page.jsx
"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createArticle } from "@/lib/actions";

// SubmitButton must be a separate component — useFormStatus reads from the parent <form>
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? "Zapisywanie..." : "Dodaj artykuł"}
    </button>
  );
}

export default function NewArticlePage() {
  const [state, action] = useActionState(createArticle, null);

  return (
    <div>
      <h1>Nowy artykuł</h1>

      {state?.success && <p>Artykuł dodany pomyślnie!</p>}

      <form action={action}>
        <div>
          <label>
            Tytuł: <input name="title" />
          </label>
          {state?.error?.title && <p>{state.error.title[0]}</p>}
        </div>

        <div>
          <label>
            Autor: <input name="author" />
          </label>
          {state?.error?.author && <p>{state.error.author[0]}</p>}
        </div>

        <div>
          <label>
            Treść: <textarea name="body" rows={4} />
          </label>
          {state?.error?.body && <p>{state.error.body[0]}</p>}
        </div>

        <SubmitButton />
      </form>
    </div>
  );
}
