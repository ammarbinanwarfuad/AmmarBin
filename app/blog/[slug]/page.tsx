import { notFound } from "next/navigation";
import dynamicImport from "next/dynamic";
import Image from "next/image";
import { LazyMotionDiv } from "@/components/LazyMotion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Calendar, Clock, User, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { getBlogBySlug } from "@/lib/server/data";
import { BlogBackButton } from "@/components/BlogBackButton";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

// ⚡ Performance: Dynamic import React Markdown - Only loads on blog detail pages
const ReactMarkdown = dynamicImport(() => import("react-markdown"), {
  ssr: true, // Enable SSR for better SEO
  loading: () => (
    <div className="flex items-center justify-center p-12">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  ),
});

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 300; // 5 minutes (faster updates for blog content)

// Generate static params for popular blog posts at build time
export async function generateStaticParams() {
  try {
    const { getBlogs } = await import("@/lib/server/data");
    const blogs = await getBlogs();
    // Pre-render first 20 blog posts (most popular/recent)
    return blogs.slice(0, 20).map((blog: Record<string, unknown>) => ({
      slug: blog.slug as string,
    }));
  } catch (error) {
    console.error("Error generating static params for blog posts:", error);
    return [];
  }
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Cover Image with Container Spacing */}
        {blog.featuredImage && (
          <div className="px-6 py-8 sm:py-12 pt-24 sm:pt-28">
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
                  unoptimized={!['res.cloudinary.com', 'avatars.githubusercontent.com', 'raw.githubusercontent.com', 'github.com'].some(h => { try { return new URL(blog.featuredImage).hostname === h; } catch { return false; } })}
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQEDAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1280px"
                  style={{ maxWidth: "100%", height: "auto" }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className={`px-6 pb-12 sm:pb-16 ${!blog.featuredImage ? 'pt-24 sm:pt-28' : ''}`}>
          <div className="mx-auto max-w-4xl">
            <LazyMotionDiv
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Back Button */}
              <div className="mb-6">
                <BlogBackButton />
              </div>

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
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                >{blog.content}</ReactMarkdown>
              </article>

              {/* Back Button (Bottom) */}
              <div className="mt-12 pt-8 border-t border-border">
                <BlogBackButton variant="outline" fullWidth />
              </div>
            </LazyMotionDiv>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
