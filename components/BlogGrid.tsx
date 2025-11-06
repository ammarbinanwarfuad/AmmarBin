import Link from "next/link";
import Image from "next/image";
import { LazyMotionDiv } from "@/components/LazyMotion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage: string;
  publishedDate: Date;
  readTime: number;
  tags: string[];
  source: string;
  url?: string;
}

interface BlogGridProps {
  blogs: Blog[];
}

// Helper function to get source label
function getSourceLabel(source: string): string {
  const labels: Record<string, string> = {
    internal: "Personal Blog",
    gucc: "GUCC Blog",
    hashnode: "Hashnode",
  };
  return labels[source] || source;
}

// SSR Blog Card component
function BlogCard({ blog, index }: { blog: Blog; index: number }) {
  return (
    <LazyMotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
        {blog.featuredImage && (
          <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
            <Image
              src={blog.featuredImage}
              alt={blog.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQEDAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
            />
          </div>
        )}
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs px-2 py-1 bg-accent text-accent-foreground rounded">
              {getSourceLabel(blog.source)}
            </span>
          </div>
          <CardTitle className="line-clamp-2">{blog.title}</CardTitle>
          <CardDescription className="line-clamp-3">
            {blog.excerpt}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-end">
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(blog.publishedDate)}</span>
            </div>
            {blog.readTime > 0 && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{blog.readTime} min read</span>
              </div>
            )}
          </div>
          {blog.source === "internal" ? (
            <Link href={`/blog/${blog.slug}`} prefetch={true}>
              <Button variant="outline" className="w-full">
                Read More
              </Button>
            </Link>
          ) : (
            <a
              href={blog.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="w-full">
                Read on {getSourceLabel(blog.source)}
              </Button>
            </a>
          )}
        </CardContent>
      </Card>
    </LazyMotionDiv>
  );
}

// SSR BlogGrid component (for public pages)
export function BlogGrid({ blogs }: BlogGridProps) {
  if (blogs.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">
          No blog posts found. Check back soon for new content!
        </p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {blogs.map((blog, index) => (
        <BlogCard key={blog._id} blog={blog} index={index} />
      ))}
    </div>
  );
}
