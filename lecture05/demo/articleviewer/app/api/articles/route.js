// app/api/articles/route.js
import { revalidatePath } from "next/cache";
import { getArticles, addArticle } from "@/lib/store";
import { articleSchema } from "@/lib/validate";

// nazwa funkcji = nazwa metody HTTP
export async function GET() {
  await new Promise((r) => setTimeout(r, 1000)); // udajemy wolną bazę: odpowiedź po 1 s
  return Response.json(getArticles()); // JSON i domyślny status 200
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 }); // ciało nie jest JSON-em
  }

  const result = articleSchema.safeParse(body);
  if (!result.success) {
    // 400: przyczyna leży w wysłanych danych; kształt błędów jak w formularzu
    return Response.json({ error: result.error.flatten().fieldErrors }, { status: 400 });
  }
  const article = addArticle(result.data);
  revalidatePath("/"); // lista na / pokaże nowy artykuł od razu
  return Response.json(article, { status: 201 }); // 201 Created
}
