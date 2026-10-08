// Zod validation schema for new issues.
// Shared between the Actions variant (new/page.jsx) and RHF variant (new-rhf/page.jsx).
import { z } from "zod";

export const issueSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters.")
    .max(100, "Title is too long (max 100 characters)."),
  priority: z.enum(["low", "medium", "high"], {
    errorMap: () => ({ message: "Priority must be low, medium, or high." }),
  }),
});
