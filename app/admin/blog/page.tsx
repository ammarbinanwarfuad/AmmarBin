"use client";

import { useEffect, useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, FileText, X, Save, Eye, CheckCircle, RefreshCw, CheckSquare, Square } from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { ImageUpload } from "@/components/ImageUpload";
import { useBlogs } from "@/lib/hooks/useAdminData";
import { mutate } from "swr";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  tags: string[];
  featuredImage?: string;
  published: boolean;
  publishedDate?: string;
  createdAt: string;
  source?: "internal" | "hashnode" | "gucc" | "external";
}

export default function AdminBlogPage() {
  const { status } = useSession();
  const router = useRouter();
  const { blogs, isLoading, refresh } = useBlogs();
  const [, startTransition] = useTransition();
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedBlogs, setSelectedBlogs] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    author: "",
    tags: "",
    featuredImage: "",
    published: false,
    publishedDate: "",
    scheduleForFuture: false,
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  const syncBlogs = async () => {
    toast.loading("Syncing external blogs...");
    try {
      const response = await fetch("/api/blog/sync", {
        method: "POST",
      });
      toast.dismiss();
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to sync blogs" }));
        const errorMsg = errorData.details || errorData.error || `Failed to sync blogs: ${response.statusText}`;
        toast.error(errorMsg);
        console.error("Blog sync error:", errorData);
        return;
      }
      
      const data = await response.json();
      
      // Show debug info in console if count is 0
      if (data.count === 0) {
        console.warn("No blogs synced. Debug info:", data.debug);
        toast.success("No blog post found");
      } else {
        toast.success(`Synced ${data.count} blog posts! (Hashnode: ${data.sources?.hashnode || 0}, GUCC: ${data.sources?.gucc || 0})`);
      }
      // Refresh SWR caches so the blog list updates immediately
      startTransition(() => {
        refresh();
        mutate('/api/blog');
        mutate('/api/admin/recent');
      });
    } catch (error) {
      toast.dismiss();
      console.error("Error syncing blogs:", error);
      toast.error(error instanceof Error ? error.message : "An error occurred while syncing blogs");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Prepare data for submission
      const submitData: Record<string, unknown> = {
        ...formData,
        tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
      };

      // Handle scheduling
      if (formData.scheduleForFuture && formData.publishedDate) {
        const scheduledDate = new Date(formData.publishedDate);
        const now = new Date();
        
        // If scheduling for future, set publishedDate but keep published=false
        if (scheduledDate > now) {
          submitData.publishedDate = scheduledDate.toISOString();
          submitData.published = false;
        } else {
          // If date is today or past, publish immediately
          submitData.publishedDate = scheduledDate.toISOString();
          submitData.published = formData.published;
        }
      } else if (formData.published) {
        // If publishing immediately, set publishedDate to now
        submitData.publishedDate = new Date().toISOString();
      }

      // Remove scheduleForFuture from submit data
      delete submitData.scheduleForFuture;

      const response = await fetch("/api/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        const isScheduled = formData.scheduleForFuture && formData.publishedDate && new Date(formData.publishedDate) > new Date();
        toast.success(
          isScheduled 
            ? `Blog post scheduled for ${format(new Date(formData.publishedDate), "MMM dd, yyyy")}!`
            : "Blog post added successfully!"
        );
        setShowAddForm(false);
        setFormData({
          title: "",
          slug: "",
          excerpt: "",
          content: "",
          author: "",
          tags: "",
          featuredImage: "",
          published: false,
          publishedDate: "",
          scheduleForFuture: false,
        });
        startTransition(() => {
          refresh();
        });
      } else {
        toast.error("Failed to add blog post");
      }
    } catch (error) {
      console.error("Error adding blog:", error);
      toast.error("An error occurred");
    }
  };

  const handleDelete = async (blog: Blog) => {
    try {
      const response = await fetch(`/api/blog/${blog._id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: blog.source }),
      });

      if (response.ok) {
        toast.success("Blog post deleted successfully!");
        setSelectedBlogs((prev) => {
          const next = new Set(prev);
          next.delete(blog._id);
          return next;
        });
        startTransition(() => {
          refresh(); // ⚡ SWR cache refresh
        });
      } else {
        toast.error("Failed to delete blog post");
      }
    } catch (error) {
      console.error("Error deleting blog:", error);
      toast.error("An error occurred");
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedBlogs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedBlogs.size === blogs.length) {
      setSelectedBlogs(new Set());
    } else {
      setSelectedBlogs(new Set(blogs.map((b: Blog) => b._id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedBlogs.size === 0) return;
    try {
      const response = await fetch("/api/blog/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedBlogs) }),
      });
      if (response.ok) {
        const data = await response.json();
        toast.success(`${data.deletedCount} blog(s) deleted successfully!`);
        setSelectedBlogs(new Set());
        startTransition(() => {
          refresh();
        });
      } else {
        toast.error("Failed to delete blogs");
      }
    } catch (error) {
      console.error("Error bulk deleting blogs:", error);
      toast.error("An error occurred");
    }
  };

  const handlePublish = async (id: string) => {
    try {
      const response = await fetch(`/api/blog/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: true }),
      });

      if (response.ok) {
        toast.success("Blog post published successfully!");
        startTransition(() => {
          refresh(); // ⚡ SWR cache refresh
        });
      } else {
        toast.error("Failed to publish blog post");
      }
    } catch (error) {
      console.error("Error publishing blog:", error);
      toast.error("An error occurred");
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">Manage Blog Posts</h1>
            <p className="text-muted-foreground mt-2">Write and publish blog posts</p>
          </div>
          <div className="flex items-center gap-3">
            {selectedBlogs.size > 0 && (
              <>
                <span className="flex items-center text-sm text-muted-foreground">
                  {selectedBlogs.size} selected
                </span>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="gap-2">
                      <Trash2 className="h-4 w-4" />
                      Delete Selected ({selectedBlogs.size})
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Selected Blogs</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete {selectedBlogs.size} blog post(s)? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleBulkDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
            <Button
              variant="outline"
              onClick={handleSelectAll}
              className="gap-2"
            >
              {selectedBlogs.size === blogs.length && blogs.length > 0 ? (
                <>
                  <Square className="h-4 w-4" /> Deselect All
                </>
              ) : (
                <>
                  <CheckSquare className="h-4 w-4" /> Select All
                </>
              )}
            </Button>
            <Button onClick={syncBlogs} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" /> Sync Blogs
            </Button>
            <Button onClick={() => setShowAddForm(!showAddForm)} className="gap-2">
              {showAddForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {showAddForm ? "Cancel" : "New Post"}
            </Button>
          </div>
        </div>

        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card>
              <CardHeader>
                <CardTitle>Create New Blog Post</CardTitle>
                <CardDescription>Write your blog post</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => {
                        const title = e.target.value;
                        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
                        setFormData({ ...formData, title, slug });
                      }}
                      placeholder="Your Blog Post Title"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="slug">Slug</Label>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        placeholder="blog-post-slug"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="author">Author</Label>
                      <Input
                        id="author"
                        value={formData.author}
                        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                        placeholder="Your Name"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Cover Photo</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Upload a cover image for your blog post (crop optional)
                    </p>
                    <ImageUpload
                      value={formData.featuredImage}
                      onChange={(value) => setFormData({ ...formData, featuredImage: value as string })}
                      folder="blog"
                      accept="*"
                      enableCrop={true}
                      cropAspect={16 / 9}
                      maxSize={10}
                    />
                  </div>

                  <div>
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="javascript, react, tutorial"
                    />
                  </div>
                  <div>
                    <Label htmlFor="excerpt">Excerpt</Label>
                    <Textarea
                      id="excerpt"
                      value={formData.excerpt}
                      onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                      placeholder="Brief description of the post..."
                      rows={2}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="content">Content (Markdown supported)</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Write your blog post content..."
                      rows={12}
                      required
                    />
                  </div>
                  <div className="space-y-4 border-t pt-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="scheduleForFuture"
                        checked={formData.scheduleForFuture}
                        onChange={(e) => setFormData({ ...formData, scheduleForFuture: e.target.checked })}
                        className="rounded"
                        aria-label="Schedule for Future"
                      />
                      <Label htmlFor="scheduleForFuture" className="cursor-pointer">
                        Schedule for Future Publication
                      </Label>
                    </div>

                    {formData.scheduleForFuture ? (
                      <div>
                        <Label htmlFor="publishedDate">Schedule Publication Date & Time</Label>
                        <Input
                          id="publishedDate"
                          type="datetime-local"
                          value={formData.publishedDate}
                          onChange={(e) => setFormData({ ...formData, publishedDate: e.target.value })}
                          min={new Date().toISOString().slice(0, 16)}
                          required={formData.scheduleForFuture}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          The post will be automatically published on this date and time
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="published"
                          checked={formData.published}
                          onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                          className="rounded"
                          aria-label="Publish Immediately"
                        />
                        <Label htmlFor="published" className="cursor-pointer">
                          Publish Immediately
                        </Label>
                      </div>
                    )}
                  </div>
                  <Button type="submit" className="gap-2">
                    <Save className="h-4 w-4" />
                    Create Post
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="grid grid-cols-1 gap-4">
          {blogs.map((blog: Blog) => (
            <motion.div
              key={blog._id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Card className={`${!blog.published ? "opacity-60 border-dashed" : ""} ${selectedBlogs.has(blog._id) ? "ring-2 ring-primary" : ""}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-4 flex-1">
                      <button
                        type="button"
                        onClick={() => handleToggleSelect(blog._id)}
                        className="mt-1 flex-shrink-0"
                      >
                        {selectedBlogs.has(blog._id) ? (
                          <CheckSquare className="h-5 w-5 text-primary" />
                        ) : (
                          <Square className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                        )}
                      </button>
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CardTitle>{blog.title}</CardTitle>
                          {(() => {
                            const isScheduled = blog.publishedDate && new Date(blog.publishedDate) > new Date() && !blog.published;
                            if (isScheduled) {
                              return (
                                <span className="text-xs bg-blue-500/20 text-blue-500 px-2 py-1 rounded">
                                  Scheduled
                                </span>
                              );
                            }
                            return blog.published ? (
                              <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded">
                                Published
                              </span>
                            ) : (
                              <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded">
                                Draft
                              </span>
                            );
                          })()}
                        </div>
                        <CardDescription className="mt-1">
                          By {blog.author} • {format(new Date(blog.createdAt), "MMM dd, yyyy")}
                          {(blog as Blog & { publishedDate?: string }).publishedDate && (
                            <> • Scheduled: {format(new Date((blog as Blog & { publishedDate: string }).publishedDate!), "MMM dd, yyyy 'at' HH:mm")}</>
                          )}
                        </CardDescription>
                        <p className="text-sm text-muted-foreground mt-2">
                          {blog.excerpt}
                        </p>
                        {blog.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {blog.tags.map((tag, i) => (
                              <span
                                key={i}
                                className="text-xs bg-secondary px-2 py-1 rounded"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!blog.published && (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handlePublish(blog._id)}
                          className="gap-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Publish
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        asChild
                      >
                        <a href={`/blog/${blog.slug}`} target="_blank" rel="noopener noreferrer" aria-label="View blog post">
                          <Eye className="h-4 w-4" />
                        </a>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Blog Post</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete &ldquo;{blog.title}&rdquo;?
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(blog)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>

        {blogs.length === 0 && !isLoading && (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">No blog posts yet. Click &ldquo;New Post&rdquo; to get started!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

