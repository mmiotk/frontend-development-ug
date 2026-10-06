// lib/actions.js
"use server"; // ten plik eksportuje wyłącznie Server Actions

import { addArticle } from "./store";
import { articleSchema } from "./validate";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createArticle(prevState, formData) {
  // Read raw values from FormData
  const raw = {
    title: formData.get("title"),
    author: formData.get("author"),
    body: formData.get("body"),
  };

  // Server-side Zod validation — never trust the client
  const result = articleSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.flatten().fieldErrors };
  }

  // Save to in-memory store
  addArticle(result.data);

  // Invalidate the list page cache so the new article appears immediately
  revalidatePath("/");

  redirect("/"); // rzuca wyjątek wewnętrznie — kod po tej linii się nie wykona
}
