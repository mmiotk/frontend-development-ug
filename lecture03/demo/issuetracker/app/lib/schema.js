// app/lib/schema.js
import { z } from "zod";

export const issueSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters."), // trim przed min
  priority: z.enum(["low", "medium", "high"]),
});
