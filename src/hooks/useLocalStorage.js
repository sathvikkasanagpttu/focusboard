import { useState, useEffect } from 'react';

/**
 * Custom hook for synchronizing state with localStorage.
 * Handles lazy initialization, validation for array data types,
 * prevents overwriting empty user data with initial fallback,
 * and safeguards against localStorage quota or parsing exceptions.
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        const parsed = JSON.parse(item);
        // Ensure the stored item is a valid array (when initialValue is an array)
        if (Array.isArray(initialValue)) {
          if (Array.isArray(parsed)) {
            return parsed;
          }
        } else if (parsed !== null && parsed !== undefined) {
          return parsed;
        }
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
    }
    return initialValue;
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(`Error saving localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
