import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton loader for HeroContent component
 * Used as Suspense fallback for better perceived performance
 */
export function HeroSkeleton() {
  return (
    <div className="text-center max-w-4xl mx-auto">
      {/* Profile Image Skeleton */}
      <div className="flex justify-center mb-8">
        <Skeleton className="w-48 h-48 rounded-full" />
      </div>

      {/* Name Skeleton */}
      <Skeleton className="h-14 w-64 mx-auto mb-4" />

      {/* Title Skeleton */}
      <Skeleton className="h-8 w-80 mx-auto mb-6" />

      {/* Description Skeleton */}
      <div className="space-y-2 mb-8">
        <Skeleton className="h-5 w-full max-w-2xl mx-auto" />
        <Skeleton className="h-5 w-3/4 max-w-2xl mx-auto" />
      </div>
    </div>
  );
}

