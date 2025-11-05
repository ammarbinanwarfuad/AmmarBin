import { Suspense } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getExperiences, getParticipations } from "@/lib/server/data";
import { ExperienceTabs } from "@/components/ExperienceTabs";

export const dynamic = 'force-dynamic'; // No caching

export default async function ExperiencePage() {
  const [experiences, participations] = await Promise.all([
    getExperiences(),
    getParticipations(),
  ]);

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

          <Suspense fallback={<div className="h-96" />}>
            <ExperienceTabs 
              experiences={experiences} 
              participations={participations}
            />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}
