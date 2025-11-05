"use client";

import { useState, useMemo, memo, useCallback } from "react";
import Image from "next/image";
import { LazyMotionDiv } from "@/components/LazyMotion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Github, Play } from "lucide-react";

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

interface ProjectsGridProps {
  projects: Project[];
}

// Memoized project card component to prevent unnecessary re-renders
const ProjectCard = memo(({ project, index }: { project: Project; index: number }) => (
  <LazyMotionDiv
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
  >
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
      {project.image && (
        <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
          <Image
            src={project.image}
            alt={project.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={index < 3}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQEDAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
          />
        </div>
      )}
      <CardHeader>
        <CardTitle>{project.title}</CardTitle>
        <CardDescription>{project.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        {project.topics && project.topics.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {project.topics.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-accent text-accent-foreground rounded text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex gap-2">
        {project.liveUrl && (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="sm" variant="outline" className="gap-2">
              <ExternalLink className="h-4 w-4" /> Live
            </Button>
          </a>
        )}
        {project.githubUrl && (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="sm" variant="outline" className="gap-2">
              <Github className="h-4 w-4" /> Code
            </Button>
          </a>
        )}
        {project.videoUrl && (
          <a
            href={project.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="sm" variant="outline" className="gap-2">
              <Play className="h-4 w-4" /> Video
            </Button>
          </a>
        )}
      </CardFooter>
    </Card>
  </LazyMotionDiv>
));

ProjectCard.displayName = 'ProjectCard';

export const ProjectsGrid = memo(function ProjectsGrid({ projects }: ProjectsGridProps) {
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project, index) => (
            <ProjectCard key={project._id} project={project} index={index} />
          ))}
        </div>
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
});

