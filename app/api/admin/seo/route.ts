import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";

// ⚡ Performance: Cache SEO analysis for 5 minutes


export async function GET() {
  try {
    await connectDB();
    const Blog = (await import("@/models/Blog")).default;
    // ⚡ Performance: Only select needed fields
    const blogs = await Blog.find({}).select('title slug content featuredImage seo').lean();

    // ⚡ Performance: Process in single pass
    const issues = blogs.map((b: unknown) => {
      const blog = b as { title?: string; slug?: string; content?: string; featuredImage?: string; seo?: { metaDescription?: string } };
      const words = (blog.content || '').split(/\s+/).filter(Boolean).length;
      return {
        title: blog.title || 'Untitled',
        slug: blog.slug || 'unknown',
        missingMeta: !blog.seo?.metaDescription,
        missingImage: !blog.featuredImage,
        shortContent: words < 300,
      };
    }).filter(i => i.missingMeta || i.missingImage || i.shortContent);

    return NextResponse.json(
      { issues, total: blogs.length },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch {
    return NextResponse.json({ error: 'Failed to compute SEO' }, { status: 500 });
  }
}


