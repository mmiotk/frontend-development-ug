// app/api/articles/[id]/route.js
import { NextResponse } from "next/server";
import { getArticle } from "@/lib/store";

export async function GET(request, { params }) {
  const { id } = await params; // Next.js 16: params is async
  const article = getArticle(id);
  if (!article) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(article);
}
