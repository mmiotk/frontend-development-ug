// lib/actions.js
"use server"; // każdy eksport tego pliku wykonuje się na serwerze

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { addArticle } from "./store";
import { articleSchema } from "./validate";

export async function createArticle(prevState, formData) {
  // walidacja na serwerze: danym z przeglądarki się nie ufa
  const result = articleSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
  });
  if (!result.success) return { error: result.error.flatten().fieldErrors };

  addArticle(result.data);
  revalidatePath("/"); // lista na / pokaże nowy artykuł od razu
  redirect("/"); // rzuca wyjątek sterujący: kod niżej się nie wykona
}
