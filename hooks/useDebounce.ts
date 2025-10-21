// ✅ OPTIMIZED: Debounce hook to reduce API calls during typing

import { useState, useEffect } from 'react';

/**
 * Debounce hook - delays updating value until user stops typing
 * Reduces API calls and improves performance
 * 
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 300ms)
 * @returns Debounced value
 * 
 * @example
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearch = useDebounce(searchTerm, 300);
 * 
 * useEffect(() => {
 *   // This only runs 300ms after user stops typing
 *   fetchResults(debouncedSearch);
 * }, [debouncedSearch]);
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up timeout to update debounced value
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up timeout if value changes before delay
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Debounced callback hook - delays executing callback until user stops typing
 * 
 * @param callback - Function to call after delay
 * @param delay - Delay in milliseconds (default: 300ms)
 * @returns Debounced callback function
 * 
 * @example
 * const debouncedSearch = useDebouncedCallback((term: string) => {
 *   fetchResults(term);
 * }, 300);
 * 
 * <input onChange={(e) => debouncedSearch(e.target.value)} />
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  return (...args: Parameters<T>) => {
    // Clear existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Set new timeout
    const newTimeoutId = setTimeout(() => {
      callback(...args);
    }, delay);

    setTimeoutId(newTimeoutId);
  };
}
