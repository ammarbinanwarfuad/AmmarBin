"use client";

import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { LazyMotionDiv } from "@/components/LazyMotion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, ArrowLeft, User } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useBlog } from "@/lib/hooks/usePublicData";

// Dynamic import React Markdown to reduce initial bundle size (~25KB)
const ReactMarkdown = dynamic(() => import("react-markdown"), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse space-y-4">
      <div className="h-4 bg-muted rounded w-3/4"></div>
      <div className="h-4 bg-muted rounded"></div>
      <div className="h-4 bg-muted rounded w-5/6"></div>
    </div>
  ),
});

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  // Use SWR for data fetching - automatic caching, revalidation, and error handling
  const { blog, isLoading: loading, error: fetchError } = useBlog(slug);
  const error = fetchError || !blog;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          {/* Cover Image Skeleton */}
          <div className="px-6 py-8 sm:py-12">
            <div className="mx-auto max-w-7xl">
              <Skeleton className="w-full h-64 md:h-96 rounded-lg" />
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="px-6 pb-12 sm:pb-16">
            <div className="mx-auto max-w-4xl">
              {/* Back Button Skeleton */}
              <Skeleton className="h-10 w-32 mb-6" />

              {/* Title Skeleton */}
              <Skeleton className="h-12 w-full mb-4" />
              <Skeleton className="h-12 w-3/4 mb-6" />

              {/* Meta Information Skeleton */}
              <div className="flex flex-wrap items-center gap-4 mb-6 pb-6 border-b border-border">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20" />
              </div>

              {/* Tags Skeleton */}
              <div className="flex flex-wrap gap-2 mb-8">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-18 rounded-full" />
              </div>

              {/* Content Skeleton */}
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-full mt-6" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/6" />
                <Skeleton className="h-4 w-full mt-6" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>

              {/* Bottom Button Skeleton */}
              <div className="mt-12 pt-8 border-t border-border">
                <Skeleton className="h-10 w-48" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-6">
          <Card className="max-w-md w-full">
            <CardContent className="text-center py-12">
              <h1 className="text-2xl font-bold mb-4">Blog Post Not Found</h1>
              <p className="text-muted-foreground mb-6">
                The blog post you&apos;re looking for doesn&apos;t exist or has been removed.
              </p>
              <Button onClick={() => router.push("/blog")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Blog
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Cover Image with Container Spacing */}
        {blog.featuredImage && (
          <div className="px-6 py-8 sm:py-12">
            <div className="mx-auto max-w-7xl">
              <div className="relative w-full rounded-lg overflow-hidden bg-muted shadow-lg">
                <Image
                  src={blog.featuredImage}
                  alt={blog.title}
                  width={1920}
                  height={1080}
                  className="w-full h-auto"
                  priority
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQEDAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1280px"
                  style={{ maxWidth: "100%", height: "auto" }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="px-6 pb-12 sm:pb-16">
          <div className="mx-auto max-w-4xl">
            <LazyMotionDiv
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Back Button */}
              <Button
                variant="ghost"
                onClick={() => router.push("/blog")}
                className="mb-6"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Blog
              </Button>

              {/* Title */}
              <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
                {blog.title}
              </h1>

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-6 pb-6 border-b border-border">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{blog.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(blog.publishedDate || blog.createdAt)}</span>
                </div>
                {blog.readTime > 0 && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{blog.readTime} min read</span>
                  </div>
                )}
              </div>

              {/* Tags */}
                  {blog.tags && blog.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-8">
                      {blog.tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Content */}
              <article className="prose prose-lg dark:prose-invert max-w-none">
                <ReactMarkdown>{blog.content}</ReactMarkdown>
              </article>

              {/* Back Button (Bottom) */}
              <div className="mt-12 pt-8 border-t border-border">
                <Button
                  variant="outline"
                  onClick={() => router.push("/blog")}
                  className="w-full sm:w-auto"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to All Posts
                </Button>
              </div>
            </LazyMotionDiv>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

