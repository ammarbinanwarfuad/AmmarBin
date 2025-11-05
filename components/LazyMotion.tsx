"use client";

import { lazy, Suspense, type ReactNode } from "react";
import type { HTMLMotionProps } from "framer-motion";

// Lazy load Framer Motion to reduce initial bundle size
const MotionDiv = lazy(() =>
  import("framer-motion").then((mod) => ({
    default: mod.motion.div,
  }))
);

const MotionH1 = lazy(() =>
  import("framer-motion").then((mod) => ({
    default: mod.motion.h1,
  }))
);

const MotionP = lazy(() =>
  import("framer-motion").then((mod) => ({
    default: mod.motion.p,
  }))
);

const MotionSpan = lazy(() =>
  import("framer-motion").then((mod) => ({
    default: mod.motion.span,
  }))
);

// Wrapper components with Suspense fallback
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

export function LazyMotionH1({
  children,
  className,
  ...props
}: Omit<HTMLMotionProps<"h1">, "children"> & { children: ReactNode }) {
  return (
    <Suspense fallback={<h1 className={className}>{children}</h1>}>
      <MotionH1 className={className} {...props}>
        {children as ReactNode}
      </MotionH1>
    </Suspense>
  );
}

export function LazyMotionP({
  children,
  className,
  ...props
}: Omit<HTMLMotionProps<"p">, "children"> & { children: ReactNode }) {
  return (
    <Suspense fallback={<p className={className}>{children}</p>}>
      <MotionP className={className} {...props}>
        {children as ReactNode}
      </MotionP>
    </Suspense>
  );
}

export function LazyMotionSpan({
  children,
  className,
  ...props
}: Omit<HTMLMotionProps<"span">, "children"> & { children: ReactNode }) {
  return (
    <Suspense fallback={<span className={className}>{children}</span>}>
      <MotionSpan className={className} {...props}>
        {children as ReactNode}
      </MotionSpan>
    </Suspense>
  );
}

