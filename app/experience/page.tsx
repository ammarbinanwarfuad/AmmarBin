import { Suspense } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getExperiences, getParticipations } from "@/lib/server/data";
import { ExperienceTabsClient } from "@/components/ExperienceTabsClient";

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

          <Suspense fallback={<p className="text-muted-foreground">Loading experience...</p>}>
            <ExperienceContent />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}
