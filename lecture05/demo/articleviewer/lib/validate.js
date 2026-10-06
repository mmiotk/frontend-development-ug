// lib/validate.js
import { z } from "zod";

export const articleSchema = z.object({
  title: z.string().min(3, "Tytuł: minimum 3 znaki"),
  author: z.string().min(2, "Autor: minimum 2 znaki"),
  body: z.string().min(10, "Treść: minimum 10 znaków"),
});
