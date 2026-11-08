// lib/validate.js
import { z } from "zod";

export const articleSchema = z.object({
  title: z.string().min(3, "Title: at least 3 characters"),
  body: z.string().min(10, "Body: at least 10 characters"),
});
