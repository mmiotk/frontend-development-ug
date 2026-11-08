// app/new/page.jsx
"use client";
import { useActionState } from "react";
import { issueSchema } from "../lib/schema";
import { addIssue } from "../lib/store";

// akcja dostaje poprzedni stan i dane formularza, a zwraca nowy stan
async function submitIssue(prevState, formData) {
  await new Promise((r) => setTimeout(r, 600)); // udajemy zapis na serwerze: 0,6 s
  const result = issueSchema.safeParse({
    title: formData.get("title"),
    priority: formData.get("priority"),
  });
  if (!result.success) return { errors: result.error.flatten().fieldErrors };

  const issue = addIssue(result.data); // zapis danych po walidacji
  return { issue };
}

export default function NewIssuePage() {
  const [state, formAction, isPending] = useActionState(submitIssue, null);

  return (
    <main>
      <h1>New issue</h1>
      {state?.issue && <p>Issue #{state.issue.id} added.</p>}
      <form action={formAction}>
        <p>Title: <input name="title" /> {state?.errors?.title}</p>
        <p>
          Priority:{" "}
          <select name="priority" defaultValue="medium">
            <option value="low">low</option>
            <option value="medium">medium</option>
            <option value="high">high</option>
          </select>
        </p>
        <button disabled={isPending}>Add issue</button>
      </form>
    </main>
  );
}
