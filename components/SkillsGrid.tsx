"use client";

import { motion } from "framer-motion";
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

export function SkillsGrid({ skills, categories }: SkillsGridProps) {
  const getSkillsByCategory = (category: string) => {
    return skills.filter((skill) => skill.category === category);
  };

  const getCategoryColor = (category: string) => {
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
  };

  return (
    <div className="space-y-12">
      {categories.map((category, index) => (
        <motion.div
          key={category}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <h2 className="text-2xl font-bold text-foreground mb-6">
            {category}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {getSkillsByCategory(category).map((skill) => (
              <Card key={skill._id} className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-foreground">
                    {skill.name}
                  </h3>
                  <span className="text-sm font-bold text-muted-foreground">
                    {skill.proficiency}%
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2.5">
                  <div
                    className="h-2.5 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${skill.proficiency}%`,
                      backgroundColor: getCategoryColor(category)
                    }}
                  />
                </div>
              </Card>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

