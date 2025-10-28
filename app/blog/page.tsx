import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getBlogs } from "@/lib/server/data";
import { BlogGrid } from "@/components/BlogGrid";

export const revalidate = 1800; // 30 minutes - faster revalidation for blogs
export const dynamic = 'force-static';

export default async function BlogPage() {
  const blogs = await getBlogs();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 px-6 py-24 sm:py-32 pt-24 sm:pt-32">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Blog
            </h1>
            <p className="text-lg text-muted-foreground">
              Thoughts, tutorials, and insights on technology and development
            </p>
          </div>

          <BlogGrid blogs={blogs} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
