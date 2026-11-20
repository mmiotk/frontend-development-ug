// Opis poprawnego artykułu w osobnym pliku: korzysta z niego każde wejście,
// które zapisuje artykuł. Plik nie importuje niczego z serwera.
import { z } from "zod";

export const articleSchema = z.object({
  // drugi argument min() to komunikat, który zobaczy użytkownik
  title: z.string().min(3, "Title: at least 3 characters"),
  body: z.string().min(10, "Body: at least 10 characters"),
});
