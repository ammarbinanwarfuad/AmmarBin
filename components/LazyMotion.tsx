"use client";

import { lazy, Suspense, type ReactNode } from "react";
import type { HTMLMotionProps } from "framer-motion";

// Lazy load Framer Motion to reduce initial bundle size
const MotionDiv = lazy(() =>
  import("framer-motion").then((mod) => ({
    default: mod.motion.div,
  }))
);

// Wrapper component with Suspense fallback
export function LazyMotionDiv({
  children,
  className,
  ...props
}: Omit<HTMLMotionProps<"div">, "children"> & { children: ReactNode }) {
  return (
    <Suspense fallback={<div className={className}>{children}</div>}>
      <MotionDiv className={className} {...props}>
        {children as ReactNode}
      </MotionDiv>
    </Suspense>
  );
}

