"use client";

import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProjectsGrid } from "./ProjectsGrid";

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

interface ProjectsGridWithFilterProps {
  projects: Project[];
}

// Client wrapper for filtering functionality
export function ProjectsGridWithFilter({ projects }: ProjectsGridWithFilterProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Memoize categories calculation
  const allCategories = useMemo(() => 
    Array.from(
      new Set(
        projects.map((p) => p.category).filter(Boolean)
      )
    ).sort(),
    [projects]
  );

  // Memoize filtered projects
  const filteredProjects = useMemo(() => 
    selectedCategory === "All"
      ? projects
      : projects.filter((p) => p.category === selectedCategory),
    [projects, selectedCategory]
  );

  // Memoize category filter handler
  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);

  return (
    <>
      {/* Category Filters */}
      {allCategories.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-6">
          <Button
            variant={selectedCategory === "All" ? "default" : "outline"}
            onClick={() => handleCategoryChange("All")}
            className="min-w-[80px]"
          >
            All
          </Button>
          {allCategories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => handleCategoryChange(category)}
              className="min-w-[80px]"
            >
              {category}
            </Button>
          ))}
        </div>
      )}

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <ProjectsGrid projects={filteredProjects} />
      ) : (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">
            {selectedCategory === "All" 
              ? "No projects found. Projects will be added soon."
              : `No projects found in "${selectedCategory}" category.`}
          </p>
        </Card>
      )}
    </>
  );
}

