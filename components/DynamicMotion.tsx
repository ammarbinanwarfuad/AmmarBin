"use client";

import dynamic from "next/dynamic";
import { Suspense, type ReactNode } from "react";
import type { HTMLMotionProps } from "framer-motion";

// Dynamically import framer-motion to reduce initial bundle size
const MotionDiv = dynamic(
  () => import("framer-motion").then((mod) => mod.motion.div),
  { ssr: false }
);

interface DynamicMotionProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
}

export function DynamicMotion({ 
  children, 
  className,
  initial,
  animate,
  transition,
  ...props 
}: DynamicMotionProps) {
  return (
    <Suspense fallback={<div className={className}>{children}</div>}>
      <MotionDiv
        className={className}
        initial={initial}
        animate={animate}
        transition={transition}
        {...props}
      >
        {children}
      </MotionDiv>
    </Suspense>
  );
}

