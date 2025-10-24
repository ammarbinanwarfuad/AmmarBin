"use client";

import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { BlogGrid } from "./BlogGrid";

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

interface BlogGridWithFilterProps {
  blogs: Blog[];
}

// Client wrapper for filtering functionality
export function BlogGridWithFilter({ blogs }: BlogGridWithFilterProps) {
  const [filter, setFilter] = useState<string>("all");

  // Memoize filtered blogs
  const filteredBlogs = useMemo(() => 
    filter === "all"
      ? blogs
      : blogs.filter((blog) => blog.source === filter),
    [blogs, filter]
  );

  // Memoize filter handler
  const handleFilterChange = useCallback((newFilter: string) => {
    setFilter(newFilter);
  }, []);

  return (
    <>
      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-12">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => handleFilterChange("all")}
        >
          All Posts
        </Button>
        <Button
          variant={filter === "internal" ? "default" : "outline"}
          onClick={() => handleFilterChange("internal")}
        >
          Personal
        </Button>
        <Button
          variant={filter === "gucc" ? "default" : "outline"}
          onClick={() => handleFilterChange("gucc")}
        >
          GUCC
        </Button>
        <Button
          variant={filter === "hashnode" ? "default" : "outline"}
          onClick={() => handleFilterChange("hashnode")}
        >
          Hashnode
        </Button>
      </div>

      {/* Blog Grid */}
      <BlogGrid blogs={filteredBlogs} />
    </>
  );
}

