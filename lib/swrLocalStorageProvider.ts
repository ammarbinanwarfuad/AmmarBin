// ⚡ LocalStorage provider for SWR persistent cache
// Survives page reloads and browser restarts
import type { Cache, State } from 'swr';

type SWRKey = string;
type SWRValue = unknown;
type SWRError = Error;

export function localStorageProvider(): Cache<SWRValue> {
  // When initializing, we restore the data from `localStorage` into a map
  const map = new Map<SWRKey, State<SWRValue, SWRError>>(
    typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('app-cache') || '[]')
      : []
  );

  // Before unloading the app, we write back all the data into `localStorage`
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      const appCache = JSON.stringify(Array.from(map.entries()));
      localStorage.setItem('app-cache', appCache);
    });
  }

  // We still use the map for write & read for performance
  return map;
}

