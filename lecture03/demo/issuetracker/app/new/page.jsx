"use client";
import { useActionState } from "react";
import Link from "next/link";
import { issueSchema } from "../lib/schema";
import { addIssue } from "../lib/store";
import SubmitButton from "../components/SubmitButton";

const INITIAL_STATE = { success: false, errors: null, issue: null };

function submitIssue(prevState, formData) {
  const raw = {
    title: formData.get("title"),
    priority: formData.get("priority") || "medium",
  };

  const result = issueSchema.safeParse(raw);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
      issue: null,
    };
  }

  const issue = addIssue(result.data);
  return { success: true, errors: null, issue };
}

export default function NewIssuePage() {
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
          <label htmlFor="title">Title</label>
          <input id="title" name="title" type="text" />
          {state.errors?.title && <p>{state.errors.title[0]}</p>}
        </div>
        <div>
          <label htmlFor="priority">Priority</label>
          <select id="priority" name="priority" defaultValue="medium">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          {state.errors?.priority && <p>{state.errors.priority[0]}</p>}
        </div>
        <SubmitButton />
      </form>
    </div>
  );
}
