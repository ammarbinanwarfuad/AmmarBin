"use client";

// ✅ OPTIMIZED: Global SWR Provider with request deduplication

import { SWRConfig } from 'swr';
import { swrConfig } from '@/lib/swr-config';

export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig value={swrConfig}>
      {children}
    </SWRConfig>
  );
}
