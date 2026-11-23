// Route Handler: katalog app/api/articles daje adres /api/articles,
// a każda wyeksportowana funkcja obsługuje metodę HTTP o tej samej nazwie.
import { revalidatePath } from "next/cache";
import { getArticles, addArticle } from "@/lib/store";
import { articleSchema } from "@/lib/validate"; // ten sam schemat co w akcji

export async function GET() {
  // udajemy wolną bazę: odpowiedź po 1 s
  await new Promise((r) => setTimeout(r, 1000));
  return Response.json(getArticles()); // JSON i domyślny status 200
}

// To wejście do magazynu omija formularz, więc samo sprawdza dane.
// Za zły format i złe pola odpowiada klient: kod 400, nie 500.
export async function POST(request) {
  let body;
  try {
    body = await request.json(); // ucięty JSON rzuca tu SyntaxError
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = articleSchema.safeParse(body);
  if (!result.success) {
    // kształt błędów jak w formularzu: { title: [...], body: [...] }
    return Response.json(
      { error: result.error.flatten().fieldErrors },
      { status: 400 },
    );
  }
  const article = addArticle(result.data);
  revalidatePath("/"); // to wejście też zmienia listę na /
  return Response.json(article, { status: 201 }); // 201 Created
}
