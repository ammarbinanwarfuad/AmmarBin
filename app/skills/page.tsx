import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getSkills } from "@/lib/server/data";
import { SkillsShowcase } from "@/components/SkillsShowcase";

export const revalidate = 86400; // 1 day - skills rarely change

export default async function SkillsPage() {
  const skills = await getSkills();
  const allCategories = Array.from(
    new Set(skills.map((s: { category: string }) => s.category))
  ) as string[];

  // Desired category order
  const categoryOrder = [
    "Programming Languages",
    "Frontend Development",
    "Backend Development",
    "CMS",
    "Tools & Technologies",
    "Other Skills",
  ];

  const categories = categoryOrder
    .filter((c) => allCategories.some((a) => a.toLowerCase() === c.toLowerCase()))
    .concat(
      allCategories.filter(
        (a) => !categoryOrder.some((c) => c.toLowerCase() === a.toLowerCase())
      )
    );

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden bg-background">
      <Header />
      <main className="flex-1 min-h-0 overflow-hidden">
        <SkillsShowcase skills={skills} categories={categories} />
      </main>
      <Footer />
    </div>
  );
}
