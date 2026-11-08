// app/new-rhf/page.jsx
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { issueSchema } from "../lib/schema";
import { addIssue } from "../lib/store";

export default function NewIssueRhfPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(issueSchema), // ten sam schemat co w akcji
    defaultValues: { priority: "medium" },
  });

  function onSubmit(data) {
    addIssue(data); // data przeszło już przez schemat
    router.push("/");
  }

  return (
    <main>
      <h1>New issue (RHF)</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <p>Title: <input {...register("title")} /> {errors.title?.message}</p>
        <p>
          Priority:{" "}
          <select {...register("priority")}>
            <option value="low">low</option>
            <option value="medium">medium</option>
            <option value="high">high</option>
          </select>
        </p>
        <button>Add issue</button>
      </form>
    </main>
  );
}
