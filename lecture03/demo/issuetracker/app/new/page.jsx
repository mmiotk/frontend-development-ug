// Formularz nowego zgłoszenia: wynik akcji przechowuje useActionState.
// "use client": hook i akcja działają w przeglądarce,
// a addIssue zapisuje do kopii magazynu w przeglądarce.
"use client";
import { useActionState } from "react"; // React 19
import Link from "next/link";
import { issueSchema } from "../lib/schema";
import { addIssue } from "../lib/store";
import SubmitButton from "../components/SubmitButton";

// errors zamiast error: komunikatów może być kilka, po zestawie na pole
const INITIAL_STATE = { success: false, errors: null, issue: null };

// Sygnatura: (prevState, formData), prevState wstawia useActionState.
// prevState = wynik poprzedniego wywołania (albo INITIAL_STATE przy pierwszym).
// Bez async i opóźnienia: sprawdzanie schematem jest synchroniczne.
function submitIssue(prevState, formData) {
  // FormData powstaje automatycznie ze wszystkich pól z atrybutem name.
  const raw = {
    title: formData.get("title"),
    priority: formData.get("priority") || "medium", // brak pola: get() daje null, || podstawia "medium"
  };

  const result = issueSchema.safeParse(raw);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors, // { title: [...], priority: [...] }
      issue: null,
    };
  }

  const issue = addIssue(result.data); // zapis danych sprawdzonych, nie surowych
  return { success: true, errors: null, issue };
}

export default function NewIssuePage() {
  // useActionState zwraca [state, formAction, isPending]; flaga isPending jest teraz w SubmitButton
  const [state, formAction] = useActionState(submitIssue, INITIAL_STATE);

  return (
    <div>
      <h1>New Issue</h1>

      {state.success && (
        <p>
          Issue #{state.issue.id} added!{" "}
          <Link href="/">View all issues</Link>
        </p>
      )}

      <form action={formAction}>
        <div>
          {/* htmlFor łączy etykietę z polem o id="title" */}
          <label htmlFor="title">Title</label>
          <input id="title" name="title" type="text" />
          {/* pod polem tytułu; ?. daje undefined, gdy errors jest null */}
          {state.errors?.title && <p>{state.errors.title[0]}</p>}
        </div>
        <div>
          <label htmlFor="priority">Priority</label>
          <select id="priority" name="priority" defaultValue="medium">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          {/* pod listą priorytetu */}
          {state.errors?.priority && <p>{state.errors.priority[0]}</p>}
        </div>
        <SubmitButton /> {/* sam czyta stan oczekiwania, bez propsów */}
      </form>
    </div>
  );
}
