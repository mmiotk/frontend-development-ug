// Schemat walidacji nowego zgłoszenia.
// Leży poza katalogiem trasy, więc może go zaimportować każdy moduł aplikacji.
import { z } from "zod";

export const issueSchema = z.object({
  title: z
    .string() // wymaga napisu: null, liczba ani undefined nie przejdą
    .trim() // obcina spacje z brzegów, zanim zadziałają reguły długości
    .min(3, "Title must be at least 3 characters.") // drugi argument: komunikat dla użytkownika
    .max(100, "Title is too long (max 100 characters)."),
  priority: z.enum(["low", "medium", "high"], {
    // tylko jedna z trzech wartości; errorMap to zapis z Zod 3
    errorMap: () => ({ message: "Priority must be low, medium, or high." }),
  }),
});
