// app/api/articles/route.js
import { NextResponse } from "next/server";
import { getArticles, addArticle } from "@/lib/store";

export async function GET() {
  const articles = getArticles();
  return NextResponse.json(articles);
}

export async function POST(request) {
  const body = await request.json();
  const article = addArticle(body);
  return NextResponse.json(article, { status: 201 });
}
