import Link from "next/link";
import { Suspense } from "react";
import { Download, ArrowRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { getProfile } from "@/lib/server/data";
import { HeroContent } from "@/components/HeroContent";
import { HeroSkeleton } from "@/components/HeroSkeleton";
export const dynamic = 'force-dynamic'; // No caching - always fetch fresh data
export const dynamicParams = false; // Don't generate dynamic routes
// Note: Can't use Edge Runtime here because we need MongoDB connection
// Edge Runtime is faster but doesn't support MongoDB, so we use force-static instead

// Async component for hero content with streaming
async function HeroSection() {
  const profile = await getProfile();
  return <HeroContent profile={profile} />;
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-6 py-24 sm:py-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* Stream hero content for faster perceived performance */}
            <Suspense fallback={<HeroSkeleton />}>
              <HeroSection />
            </Suspense>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Link href="/contact" prefetch={true}>
              <Button size="lg" className="gap-2">
                Get in Touch <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/projects" prefetch={true}>
              <Button size="lg" variant="outline" className="gap-2">
                View Projects
              </Button>
            </Link>
            <Link href="/resume" prefetch={true}>
              <Button size="lg" variant="outline" className="gap-2">
                <Download className="h-4 w-4" /> Resume
              </Button>
            </Link>
          </div>
          </div>
        </main>
        <Footer />
      </div>
  );
}