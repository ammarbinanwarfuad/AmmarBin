import Image from "next/image";
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
  categoryColors?: Record<string, string>;
}

// Server Component - Project Card with CSS animations
function ProjectCard({ project, index, categoryColors }: { project: Project; index: number; categoryColors?: Record<string, string> }) {
  // Default category colors if not provided
  const defaultColors: Record<string, string> = {
    "Frontend": "#3b82f6",
    "Backend": "#22c55e",
    "Full Stack": "#a855f7",
    "Mobile": "#06b6d4",
    "Desktop": "#6366f1",
    "Learning": "#f97316",
    "Other": "#6b7280"
  };
  
  const colors = categoryColors || defaultColors;
  const categoryColor = project.category && colors[project.category] 
    ? colors[project.category]
    : "#3b82f6"; // Default blue

  // Calculate delay for staggered animation
  const delayClass = index === 0 ? '' : index === 1 ? 'delay-100' : index === 2 ? 'delay-200' : 'delay-300';

  return (
    <div className={`animate-fade-in-up ${delayClass}`}>
      <Card className="group h-full flex flex-col overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-gradient-to-br from-card to-card/50">
        {project.image ? (
          <div className="relative w-full h-48 overflow-hidden">
            <Image
              src={
                // ⚡ Apply Cloudinary transformations if using Cloudinary
                project.image.includes('cloudinary.com') && project.image.includes('/upload/')
                  ? project.image.replace('/upload/', '/upload/c_fill,w_640,h_384,f_auto,q_60/')
                  : project.image
              }
              alt={project.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={index < 3}
              loading={index < 3 ? 'eager' : 'lazy'}
              quality={60}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQEDAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Category Badge */}
            {project.category && (
              <div 
                className="absolute top-3 left-3 px-3 py-1 backdrop-blur-sm text-white text-xs font-semibold rounded-full border shadow-lg"
                style={{ 
                  backgroundColor: `${categoryColor}e6`, // 90% opacity
                  borderColor: `${categoryColor}33` // 20% opacity
                }}
              >
                {project.category}
              </div>
            )}
            
            {/* Featured Badge */}
            {project.featured && (
              <div className="absolute top-3 right-3 px-3 py-1 bg-yellow-500/90 backdrop-blur-sm text-yellow-950 text-xs font-semibold rounded-full border border-yellow-600/20 shadow-lg flex items-center gap-1">
                <svg className="h-3 w-3 fill-current" viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
                Featured
              </div>
            )}
          </div>
        ) : (
          <div className="relative w-full h-48 bg-gradient-to-br from-muted via-muted/80 to-muted/60 flex items-center justify-center">
            <div className="text-muted-foreground/30 text-6xl font-bold">
              {project.title.charAt(0).toUpperCase()}
            </div>
            {project.category && (
              <div 
                className="absolute top-3 left-3 px-3 py-1 backdrop-blur-sm text-white text-xs font-semibold rounded-full border shadow-lg"
                style={{ 
                  backgroundColor: `${categoryColor}e6`, // 90% opacity
                  borderColor: `${categoryColor}33` // 20% opacity
                }}
              >
                {project.category}
              </div>
            )}
          </div>
        )}
        
        <CardHeader className="pb-3">
          <CardTitle className="break-words hyphens-auto line-clamp-2 group-hover:text-primary transition-colors">
            {project.title}
          </CardTitle>
          <CardDescription className="break-words line-clamp-3 text-sm">
            {project.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex-1 pb-3">
          {project.topics && project.topics.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {project.topics.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 bg-secondary/80 hover:bg-secondary text-secondary-foreground rounded-md text-xs font-medium break-words transition-colors border border-border/50"
                >
                  {tag}
                </span>
              ))}
              {project.topics.length > 4 && (
                <span className="px-2.5 py-1 bg-muted text-muted-foreground rounded-md text-xs font-medium">
                  +{project.topics.length - 4}
                </span>
              )}
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex gap-2 pt-4 border-t border-border/50">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button size="sm" variant="default" className="w-full gap-2 shadow-sm hover:shadow-md transition-shadow">
                <ExternalLink className="h-4 w-4" /> Live
              </Button>
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button size="sm" variant="outline" className="w-full gap-2 hover:bg-accent transition-colors">
                <Github className="h-4 w-4" /> Code
              </Button>
            </a>
          )}
          {project.videoUrl && (
            <a
              href={project.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button size="sm" variant="outline" className="w-full gap-2 hover:bg-accent transition-colors">
                <Play className="h-4 w-4" /> Video
              </Button>
            </a>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

// SSR ProjectsGrid component (for public pages)
export default function ProjectsGrid({ projects, categoryColors }: ProjectsGridProps) {
  if (projects.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">
          No projects found. Projects will be added soon.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project, index) => (
        <ProjectCard key={project._id} project={project} index={index} categoryColors={categoryColors} />
      ))}
    </div>
  );
}
