import Image from "next/image";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getProfile } from "@/lib/server/data";
import { AboutContent } from "@/components/AboutContent";

// ISR: Revalidate every 2 hours (profile changes less frequently)
export const revalidate = 7200; // 2 hours

export default async function AboutPage() {
  const profile = await getProfile();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-8">
              About Me
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-1">
                <div className="relative w-full aspect-square rounded-lg overflow-hidden border-2 border-border">
                  <Image
                    src={profile?.profileImage || "https://res.cloudinary.com/ammarbin/image/upload/v1762075570/profile/fshoacntppx9mgjwvlca.jpg"}
                    alt={profile?.name || "Ammar Bin Anwar Fuad"}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, 33vw"
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQEDAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                  />
                </div>
              </div>

              <AboutContent profile={profile} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
