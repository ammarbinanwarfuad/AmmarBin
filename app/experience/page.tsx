import { Suspense } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getExperiences, getParticipations } from "@/lib/server/data";
import { ExperienceTabsClient } from "@/components/ExperienceTabsClient";
import { Card } from "@/components/ui/card";

export const revalidate = 86400; // 1 day - experience rarely changes

// ⚡ Performance: Separate async component for Suspense
async function ExperienceContent() {
  const [experiences, participations] = await Promise.all([
    getExperiences(),
    getParticipations(),
  ]);

  return (
    <ExperienceTabsClient 
      experiences={experiences} 
      participations={participations}
    />
  );
}

function ExperienceSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <div className="h-10 w-32 bg-muted animate-pulse rounded" />
        <div className="h-10 w-32 bg-muted animate-pulse rounded" />
      </div>
      <Card className="p-6 space-y-4">
        <div className="h-6 bg-muted animate-pulse rounded w-1/3" />
        <div className="h-4 bg-muted animate-pulse rounded w-1/4" />
        <div className="space-y-2">
          <div className="h-4 bg-muted animate-pulse rounded" />
          <div className="h-4 bg-muted animate-pulse rounded w-5/6" />
        </div>
      </Card>
    </div>
  );
}

export default function ExperiencePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Experience & Activities
            </h1>
            <p className="text-lg text-muted-foreground">
              My professional journey and community involvement
            </p>
          </div>

          <Suspense fallback={<ExperienceSkeleton />}>
            <ExperienceContent />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}
