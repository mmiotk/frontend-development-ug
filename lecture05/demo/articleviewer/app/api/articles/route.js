// app/api/articles/route.js
import { getArticles, addArticle } from "@/lib/store";

// nazwa funkcji = nazwa metody HTTP
export async function GET() {
  await new Promise((r) => setTimeout(r, 1000)); // udajemy wolną bazę: odpowiedź po 1 s
  return Response.json(getArticles()); // JSON i domyślny status 200
}

export async function POST(request) {
  const article = addArticle(await request.json()); // ciało żądania jako obiekt
  return Response.json(article, { status: 201 }); // 201 Created
}
