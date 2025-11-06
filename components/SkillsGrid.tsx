import { LazyMotionDiv } from "@/components/LazyMotion";
import { Card } from "@/components/ui/card";

interface Skill {
  _id: string;
  name: string;
  category: string;
  proficiency: number;
  icon?: string;
}

interface SkillsGridProps {
  skills: Skill[];
  categories: string[];
}

// Helper function to get category color
function getCategoryColor(category: string): string {
  const lowerCategory = category.toLowerCase();
  
  // Define color mapping
  if (lowerCategory.includes("tools") && lowerCategory.includes("technologies")) {
    return "#F59E0B"; // Amber - Tools & Technologies
  }
  if (lowerCategory.includes("frontend")) {
    return "#3B82F6"; // Blue - Frontend Development
  }
  if (lowerCategory.includes("backend")) {
    return "#10B981"; // Green - Backend Development
  }
  if (lowerCategory.includes("cms")) {
    return "#8B5CF6"; // Purple - CMS
  }
  if (lowerCategory.includes("design")) {
    return "#EC4899"; // Pink - Design Tools
  }
  if (lowerCategory.includes("programming")) {
    return "#EF4444"; // Red - Programming Languages
  }
  if (lowerCategory.includes("other")) {
    return "#6366F1"; // Indigo - Other Skills
  }
  
  // Default color
  return "#3B82F6";
}

// Helper function to get skills by category
function getSkillsByCategory(skills: Skill[], category: string): Skill[] {
  return skills.filter((skill) => skill.category === category);
}

// SSR SkillsGrid component (for public pages)
export function SkillsGrid({ skills, categories }: SkillsGridProps) {
  return (
    <div className="space-y-12">
      {categories.map((category, index) => {
        const categorySkills = getSkillsByCategory(skills, category);
        
        if (categorySkills.length === 0) {
          return null;
        }

        return (
          <LazyMotionDiv
            key={category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <h2 className="text-2xl font-bold text-foreground mb-6">
              {category}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {categorySkills.map((skill) => (
                <Card key={skill._id} className="p-6">
                  <div className="mb-3">
                    <h3 className="font-semibold text-foreground">
                      {skill.name}
                    </h3>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2.5">
                    <div
                      className="h-2.5 rounded-full transition-all duration-500"
                      style={{ 
                        width: "100%",
                        backgroundColor: getCategoryColor(category)
                      }}
                    />
                  </div>
                </Card>
              ))}
            </div>
          </LazyMotionDiv>
        );
      })}
    </div>
  );
}
