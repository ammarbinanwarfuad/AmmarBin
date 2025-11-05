import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { getEducation } from "@/lib/server/data";
import { EducationList } from "@/components/EducationList";

export const dynamic = 'force-dynamic'; // No caching

export default async function EducationPage() {
  const education = await getEducation();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Education
            </h1>
            <p className="text-lg text-muted-foreground">
              My academic background and achievements
            </p>
          </div>

          {education.length > 0 ? (
            <EducationList education={education} />
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">
                No education data available yet.
              </p>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
