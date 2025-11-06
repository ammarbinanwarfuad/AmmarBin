import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { getSkills } from "@/lib/server/data";
import { SkillsGrid } from "@/components/SkillsGrid";

// ISR: Revalidate every 2 hours (skills change less frequently)
export const revalidate = 7200; // 2 hours

export default async function SkillsPage() {
  // Always fetch fresh data from MongoDB (cache bypassed in getSkills)
  const skills = await getSkills();
  const allCategories = Array.from(new Set(skills.map((s: { category: string }) => s.category))) as string[];
  
  // Define the desired order of categories
  const categoryOrder = [
    "Programming Languages",
    "Frontend Development",
    "Backend Development",
    "CMS",
    "Tools & Technologies",
    "Other Skills"
  ];
  
  // Sort categories according to the specified order
  const categories = categoryOrder.filter(category => 
    allCategories.some(cat => cat.toLowerCase() === category.toLowerCase())
  ).concat(
    // Add any categories not in the predefined list at the end
    allCategories.filter(cat => 
      !categoryOrder.some(ordered => ordered.toLowerCase() === cat.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Skills & Technologies
            </h1>
            <p className="text-lg text-muted-foreground">
              A comprehensive overview of my technical skills and technologies
            </p>
          </div>

          {categories.length > 0 ? (
            <SkillsGrid skills={skills} categories={categories} />
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">
                No skills data available. Skills will be added soon.
              </p>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
