"use client";

import { useState } from "react";
import ProjectsGrid from "./ProjectsGrid";

interface Project {
  _id: string;
  title: string;
  slug: string;
  description: string;
  image: string;
  techStack: string[];
  topics?: string[];
  category: string;
  liveUrl?: string;
  githubUrl?: string;
  videoUrl?: string;
  featured: boolean;
}

interface ProjectsGridWrapperProps {
  projects: Project[];
}

export default function ProjectsGridWrapper({ projects }: ProjectsGridWrapperProps) {
  const [categoryColors] = useState<Record<string, string>>(() => {
    // Load custom colors from localStorage with lazy initialization
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem("projectCategoryColors");
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (error) {
          console.error("Failed to load category colors:", error);
        }
      }
    }
    // Return default colors
    return {
      "Frontend": "#3b82f6",
      "Backend": "#22c55e",
      "Full Stack": "#a855f7",
      "Mobile": "#06b6d4",
      "Desktop": "#6366f1",
      "Learning": "#f97316",
      "Other": "#6b7280"
    };
  });

  return <ProjectsGrid projects={projects} categoryColors={categoryColors} />;
}
