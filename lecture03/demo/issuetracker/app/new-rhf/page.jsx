// New issue form — React Hook Form + Zod variant.
// Compare with app/new/page.jsx (React 19 Actions variant).
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { issueSchema } from "../lib/schema";
import { addIssue } from "../lib/store";

export default function NewIssueRHFPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(issueSchema), // Zod schema as validator
    defaultValues: { priority: "medium" },
  });

  function onSubmit(data) {
    // data is already validated by Zod — safe to use directly.
    addIssue(data);
    router.push("/");
  }

  return (
    <div>
      <h1>New Issue (React Hook Form)</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="title">Title</label>
          <input id="title" {...register("title")} />
          {errors.title && <p>{errors.title.message}</p>}
        </div>
        <div>
          <label htmlFor="priority">Priority</label>
          <select id="priority" {...register("priority")}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          {errors.priority && <p>{errors.priority.message}</p>}
        </div>
        <button type="submit" disabled={isSubmitting}>Submit</button>
      </form>
    </div>
  );
}
