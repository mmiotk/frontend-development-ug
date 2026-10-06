// Custom hook: synchronizes a state value with localStorage.
// Returns [value, setValue] — same API as useState.
// Convention: hook name starts with "use" — this is how React identifies hooks.
import { useState, useEffect } from "react";

export function useLocalStorage(key, fallback) {
  // Lazy initializer: read from localStorage once on mount.
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : fallback;
    } catch {
      return fallback; // SSR safety (no localStorage on server)
    }
  });

  // Sync value to localStorage whenever it changes.
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}
