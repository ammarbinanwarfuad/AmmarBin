import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";

export default function AboutLoading() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12">
            <Skeleton className="h-12 w-48 mb-8" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-1">
                <Skeleton className="w-full aspect-square rounded-lg" />
              </div>

              <div className="md:col-span-2 space-y-6">
                <div>
                  <Skeleton className="h-8 w-64 mb-2" />
                  <Skeleton className="h-6 w-48 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </div>

                <Skeleton className="h-5 w-48" />

                <div>
                  <Skeleton className="h-5 w-32 mb-2" />
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </div>

                <div>
                  <Skeleton className="h-5 w-40 mb-2" />
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 w-28" />
                    <Skeleton className="h-8 w-32" />
                  </div>
                </div>

                <Skeleton className="h-10 w-48 mt-4" />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

