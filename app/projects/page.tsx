import { Suspense } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getProjects } from "@/lib/server/data";
import { ProjectsGrid } from "@/components/ProjectsGrid";
import { ProjectsSkeleton } from "@/components/ProjectsSkeleton";

export const dynamic = 'force-dynamic'; // No caching

// Async component for projects with streaming
async function ProjectsSection() {
  const projects = await getProjects();
  return <ProjectsGrid projects={projects} />;
}

export default function ProjectsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Projects
            </h1>
            <p className="text-lg text-muted-foreground">
              A collection of my work and side projects
            </p>
          </div>

          {/* Stream projects content for faster perceived performance */}
          <Suspense fallback={<ProjectsSkeleton />}>
            <ProjectsSection />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}
