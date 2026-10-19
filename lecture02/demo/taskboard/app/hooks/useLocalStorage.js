// Custom hook: synchronizes a state value with localStorage.
// Returns [value, setValue] — same API as useState.
// Convention: hook name starts with "use" — this is how React identifies hooks.
import { useState, useEffect } from "react";

export function useLocalStorage(key, fallback) {
  // Server render and hydration both start from fallback, so their HTML matches.
  const [value, setValue] = useState(fallback);
  const [loaded, setLoaded] = useState(false); // true once localStorage has been read

  // Second pass: read the stored value in the browser, after hydration.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) setValue(JSON.parse(stored));
    } catch {
      // corrupted entry: keep fallback
    }
    setLoaded(true);
  }, [key]);

  // Write only after the read — otherwise fallback would overwrite the stored list.
  useEffect(() => {
    if (loaded) localStorage.setItem(key, JSON.stringify(value));
  }, [key, value, loaded]);

  return [value, setValue];
}
