// Formularz nowego zgłoszenia: wariant React Hook Form + Zod.
// Do porównania z app/new/page.jsx (wariant z akcjami React 19).
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { issueSchema } from "../lib/schema";
import { addIssue } from "../lib/store";

export default function NewIssueRHFPage() {
  const router = useRouter();
  const {
    register, // podpina pole: name, ref, onChange, onBlur
    handleSubmit, // owija funkcję wysyłki walidacją
    formState: { errors, isSubmitting }, // błędy pól i flaga wysyłania
  } = useForm({
    resolver: zodResolver(issueSchema), // schemat Zod jako walidator
    defaultValues: { priority: "medium" }, // wartość początkowa listy wyboru
  });

  function onSubmit(data) {
    // data przeszło już przez Zod, więc można je zapisać wprost
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
