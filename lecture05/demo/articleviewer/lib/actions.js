// Server Action: build zostawia ciało funkcji i jej importy na serwerze,
// a przeglądarka dostaje tylko identyfikator, który wysyła w żądaniu POST.
"use server"; // każdy eksport tego pliku wykonuje się na serwerze

import { revalidatePath } from "next/cache"; // unieważnia pamięć ścieżki
import { redirect } from "next/navigation"; // ten sam moduł co notFound
import { addArticle } from "./store";
import { articleSchema } from "./validate";

// prevState: poprzedni wynik akcji, formData: pola wysłanego formularza
export async function createArticle(prevState, formData) {
  // walidacja na serwerze: danym z przeglądarki się nie ufa
  const result = articleSchema.safeParse({
    title: formData.get("title"), // pole wybrane po atrybucie name
    body: formData.get("body"),
  });
  // błędy pól wracają jako wartość, nie wyjątek: trafią pod pola
  if (!result.success) return { error: result.error.flatten().fieldErrors };

  addArticle(result.data);
  revalidatePath("/"); // lista na / pokaże nowy artykuł od razu
  // tylko po sukcesie; błędy walidacji wyżej wracają jako wartość
  redirect("/"); // rzuca wyjątek sterujący: kod niżej się nie wykona
}
