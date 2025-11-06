import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getBlogs } from "@/lib/server/data";
import { BlogGridWithFilter } from "@/components/BlogGridWithFilter";

export const dynamic = 'force-dynamic'; // No caching

export default async function BlogPage() {
  const blogs = await getBlogs();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Blog
            </h1>
            <p className="text-lg text-muted-foreground">
              Thoughts, tutorials, and insights on technology and development
            </p>
          </div>

          <BlogGridWithFilter blogs={blogs} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
