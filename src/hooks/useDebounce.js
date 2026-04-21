import { useState, useEffect } from 'react';

/**
 * Delays updating the returned value until after `delay` ms
 * have elapsed since the last change to `value`.
 */
export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
