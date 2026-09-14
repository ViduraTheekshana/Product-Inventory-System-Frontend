import { useEffect, useState } from "react";

// Returns a version of `value` that only updates once `value` has
// stopped changing for `delayMs`. Every new change resets the timer -
// like an elevator door that only closes once nobody's pressed the
// button for a few seconds.
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}