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
import { Plus, Trash2, ExternalLink, Github, X, Save, RefreshCw, Eye, EyeOff, Pencil, Check, ChevronsUpDown, Tag, CheckSquare, Square } from "lucide-react";
import toast from "react-hot-toast";
import { ImageUpload } from "@/components/ImageUpload";
import { useProjects } from "@/lib/hooks/useAdminData";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

interface Project {
  _id: string;
  title: string;
  description: string;
  techStack: string[];
  topics?: string[];
  category?: string;
  liveUrl?: string;
  githubUrl?: string;
  image?: string;
  featured: boolean;
  published: boolean;
}

export default function AdminProjectsPage() {
  const { status } = useSession();
  const router = useRouter();
  const { projects, isLoading, refresh, mutate } = useProjects();
  const [isPending, startTransition] = useTransition();
  const [showAddForm, setShowAddForm] = useState(false);
  const [, setEditingProject] = useState<Project | null>(null);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    _id: "",
    title: "",
    description: "",
    techStack: "",
    category: "",
    liveUrl: "",
    githubUrl: "",
    image: "",
    featured: false,
    published: true,
  });

  const categories = ["Front End", "Backend", "Full Stack", "Learning"];

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isEdit = !!formData._id;
      const url = isEdit ? `/api/projects/${formData._id}` : "/api/projects";
      const method = isEdit ? "PUT" : "POST";

      // Prepare data - category can be empty string (no default)
      const submitData: Record<string, unknown> = {
        title: formData.title,
        category: formData.category || "", // Explicitly allow empty category
        description: formData.description,
        techStack: formData.techStack ? formData.techStack.split(",").map((t) => t.trim()).filter(Boolean) : [],
        liveUrl: formData.liveUrl || undefined,
        githubUrl: formData.githubUrl || undefined,
        image: formData.image || undefined,
        featured: formData.featured,
        published: formData.published,
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        toast.success(isEdit ? "Project updated successfully!" : "Project added successfully!");
        setShowAddForm(false);
        setEditingProject(null);
        resetForm();
        startTransition(() => {
          refresh(); // ⚡ SWR cache refresh with smooth transition
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.error || `Failed to ${isEdit ? 'update' : 'add'} project`);
      }
    } catch (error) {
      console.error("Error saving project:", error);
      toast.error("An error occurred");
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    const category = project.category || "";
    setFormData({
      _id: project._id || "",
      title: project.title || "",
      description: project.description || "",
      techStack: (project.techStack && project.techStack.length > 0) ? project.techStack.join(", ") : "",
      category: category,
      liveUrl: project.liveUrl || "",
      githubUrl: project.githubUrl || "",
      image: project.image || "",
      featured: project.featured || false,
      published: project.published !== undefined ? project.published : true,
    });
    setCategorySearch("");
    setCategoryOpen(false);
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setFormData({
      _id: "",
      title: "",
      description: "",
      techStack: "",
      category: "",
      liveUrl: "",
      githubUrl: "",
      image: "",
      featured: false,
      published: true,
    });
    setCategorySearch("");
    setCategoryOpen(false);
  };

  const syncGitHub = async () => {
    toast.loading("Syncing GitHub projects...");
    try {
      const response = await fetch("/api/projects/sync-github", {
        method: "POST",
      });
      toast.dismiss();
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to sync GitHub projects" }));
        toast.error(errorData.error || `Failed to sync GitHub projects: ${response.statusText}`);
        return;
      }
      
      const data = await response.json();
      const message = data.topicsFetched > 0
        ? `Synced ${data.count} projects with ${data.topicsFetched} repositories having topics!`
        : `Synced ${data.count} projects. ${data.note || "Note: No topics found. Make sure your GitHub token has 'repo' scope and repositories have topics set on GitHub."}`;
      toast.success(message, { duration: 5000 });
      // Refresh SWR cache
      startTransition(() => {
        refresh();
        mutate('/api/projects');
      });
    } catch (error) {
      toast.dismiss();
      console.error("Error syncing GitHub projects:", error);
      toast.error(error instanceof Error ? error.message : "An error occurred while syncing GitHub projects");
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    const newPublishedStatus = !currentStatus;
    try {
      const response = await fetch(`/api/projects/${id}/publish`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: newPublishedStatus }),
      });

      if (response.ok) {
        toast.success(`Project ${newPublishedStatus ? "published" : "unpublished"} successfully!`);
        
        // Optimistically update the cache immediately
        mutate((currentData: { projects?: Project[] } | undefined) => {
          if (currentData?.projects) {
            return {
              ...currentData,
              projects: currentData.projects.map((p: Project) =>
                p._id === id ? { ...p, published: newPublishedStatus } : p
              ),
            };
          }
          return currentData;
        }, { revalidate: false });
        
        // Then refresh to ensure server data consistency
        startTransition(() => {
          refresh();
        });
      } else {
        const errorData = await response.json().catch(() => ({ error: "Failed to update project status" }));
        toast.error(errorData.error || "Failed to update project status");
      }
    } catch (error) {
      console.error("Error toggling publish status:", error);
      toast.error("An error occurred");
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedProjects((prev) => {
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
    if (selectedProjects.size === filteredProjects.length) {
      setSelectedProjects(new Set());
    } else {
      setSelectedProjects(new Set(filteredProjects.map((p: Project) => p._id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProjects.size === 0) return;

    try {
      const response = await fetch("/api/projects/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedProjects) }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`${data.deletedCount} project(s) deleted successfully!`);
        setSelectedProjects(new Set());
        startTransition(() => {
          refresh();
          mutate('/api/projects');
        });
      } else {
        const errorData = await response.json().catch(() => ({ error: "Failed to delete projects" }));
        toast.error(errorData.error || "Failed to delete projects");
      }
    } catch (error) {
      console.error("Error bulk deleting projects:", error);
      toast.error("An error occurred");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Project deleted successfully!");
        setSelectedProjects((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        startTransition(() => {
          refresh(); // ⚡ SWR cache refresh with smooth transition
        });
      } else {
        toast.error("Failed to delete project");
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("An error occurred");
    }
  };

  // Get all unique topics from published projects for filtering
  const publishedProjects = projects.filter((p: Project) => p.published);
  const allTopics: string[] = Array.from(
    new Set(
      publishedProjects.flatMap((p: Project) => 
        (p.topics || []).map((t: string) => t.toLowerCase())
      )
    )
  ).sort() as string[];

  const toggleTopic = (topic: string) => {
    const t = topic.toLowerCase();
    setSelectedTopics((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };

  // Filter projects based on selected topics (only for published projects)
  const filteredProjects = selectedTopics.length === 0
    ? projects
    : projects.filter((p: Project) => {
        if (!p.published) return true; // Always show unpublished projects
        const pt = (p.topics || []).map((t) => t.toLowerCase());
        return selectedTopics.every((t) => pt.includes(t));
      });

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
            <h1 className="text-4xl font-bold">Manage Projects</h1>
            <p className="text-muted-foreground mt-2">
              Add, edit, or remove your projects
              {isPending && <span className="ml-2 text-primary">• Updating...</span>}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {selectedProjects.size > 0 && (
              <>
                <span className="flex items-center text-sm text-muted-foreground">
                  {selectedProjects.size} selected
                </span>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="gap-2">
                      <Trash2 className="h-4 w-4" />
                      Delete Selected ({selectedProjects.size})
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Selected Projects</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete {selectedProjects.size} project(s)? This action cannot be undone.
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
              {selectedProjects.size === filteredProjects.length && filteredProjects.length > 0 ? (
                <>
                  <Square className="h-4 w-4" /> Deselect All
                </>
              ) : (
                <>
                  <CheckSquare className="h-4 w-4" /> Select All
                </>
              )}
            </Button>
            <Button onClick={syncGitHub} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Sync GitHub Projects
            </Button>
            <Button onClick={() => {
              if (showAddForm) {
                setShowAddForm(false);
                setEditingProject(null);
                resetForm();
              } else {
                setShowAddForm(true);
              }
            }} className="gap-2">
              {showAddForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {showAddForm ? "Cancel" : "Add Project"}
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
                <CardTitle>{formData._id ? "Edit Project" : "Add New Project"}</CardTitle>
                <CardDescription>Enter project details below</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Project Title</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="My Awesome Project"
                        required={!formData._id}
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={categoryOpen}
                            className="w-full justify-between font-normal"
                            type="button"
                          >
                            <span className={cn("truncate", !formData.category && "text-muted-foreground")}>
                              {formData.category || "Select category..."}
                            </span>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                          <Command>
                            <CommandInput 
                              placeholder="Search or type new category..." 
                              value={categorySearch}
                              onValueChange={(value) => {
                                setCategorySearch(value);
                                // Update category as user types (for creating new categories)
                                setFormData({ ...formData, category: value });
                              }}
                            />
                            <CommandList>
                              <CommandEmpty>
                                {categorySearch && !categories.includes(categorySearch) && (
                                  <CommandItem
                                    onSelect={() => {
                                      setFormData({ ...formData, category: categorySearch });
                                      setCategorySearch("");
                                      setCategoryOpen(false);
                                    }}
                                  >
                                    <Check className="mr-2 h-4 w-4" />
                                    Use &ldquo;{categorySearch}&rdquo;
                                  </CommandItem>
                                )}
                                {!categorySearch && "Start typing to create a new category or select from list."}
                              </CommandEmpty>
                              <CommandGroup>
                                {categories
                                  .filter((category) => 
                                    categorySearch === "" || 
                                    category.toLowerCase().includes(categorySearch.toLowerCase())
                                  )
                                  .map((category) => (
                                    <CommandItem
                                      key={category}
                                      value={category}
                                      onSelect={(currentValue) => {
                                        setFormData({ ...formData, category: currentValue });
                                        setCategorySearch("");
                                        setCategoryOpen(false);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          formData.category === category ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      {category}
                                    </CommandItem>
                                  ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <p className="text-xs text-muted-foreground mt-1">
                        Select from dropdown or type to create a new category
                      </p>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe your project..."
                      rows={4}
                      required={!formData._id}
                    />
                  </div>
                  <div>
                    <Label htmlFor="techStack">Tech Stack (comma-separated)</Label>
                    <Input
                      id="techStack"
                      value={formData.techStack}
                      onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
                      placeholder="React, Node.js, MongoDB"
                      required={!formData._id}
                    />
                  </div>

                  <div>
                    <Label>Project Image / Video</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Upload any media (images, videos, GIFs - crop optional)
                    </p>
                    <ImageUpload
                      value={formData.image}
                      onChange={(value) => setFormData({ ...formData, image: value as string })}
                      folder="projects"
                      accept="*"
                      enableCrop={true}
                      cropAspect={16 / 9}
                      maxSize={50}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="liveUrl">Live URL</Label>
                      <Input
                        id="liveUrl"
                        value={formData.liveUrl}
                        onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                        placeholder="https://project-demo.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="githubUrl">GitHub URL</Label>
                      <Input
                        id="githubUrl"
                        value={formData.githubUrl}
                        onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                        placeholder="https://github.com/..."
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="featured"
                        checked={formData.featured}
                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                        className="rounded"
                        aria-label="Mark as Featured"
                      />
                      <Label htmlFor="featured" className="cursor-pointer">Mark as Featured</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="published"
                        checked={formData.published}
                        onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                        className="rounded"
                        aria-label="Publish Project"
                      />
                      <Label htmlFor="published" className="cursor-pointer">Publish Project</Label>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="gap-2">
                      <Save className="h-4 w-4" />
                      {formData._id ? "Update Project" : "Add Project"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingProject(null);
                        resetForm();
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Topic Filters for Published Repos */}
        {allTopics.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-3 items-center">
              <span className="text-sm text-muted-foreground font-medium">Filter by tags:</span>
              <Button
                variant={selectedTopics.length === 0 ? "default" : "outline"}
                onClick={() => setSelectedTopics([])}
                size="sm"
                className="min-w-[80px]"
              >
                All
              </Button>
              {allTopics.map((topic) => (
                <Button
                  key={topic}
                  variant={selectedTopics.includes(topic) ? "default" : "outline"}
                  onClick={() => toggleTopic(topic)}
                  size="sm"
                  className="min-w-[80px]"
                >
                  {topic}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project: Project) => (
            <motion.div
              key={project._id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Card className={`${!project.published ? "opacity-60 border-dashed" : ""} ${selectedProjects.has(project._id) ? "ring-2 ring-primary" : ""} h-full flex flex-col`}>
                <CardHeader className="flex-shrink-0">
                  {/* Category Badge - Prominently displayed at the top */}
                  {project.category && project.category.trim() && (
                    <div className="mb-3 flex items-center gap-1">
                      <Tag className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-semibold bg-primary/10 text-primary px-2.5 py-1 rounded-md border border-primary/20">
                        {project.category}
                      </span>
                    </div>
                  )}
                  {!project.category && (
                    <div className="mb-3">
                      <span className="text-xs text-muted-foreground italic">No category</span>
                    </div>
                  )}
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-start gap-2 flex-1 min-w-0 pr-2">
                      <button
                        type="button"
                        onClick={() => handleToggleSelect(project._id)}
                        className="mt-1 flex-shrink-0"
                      >
                        {selectedProjects.has(project._id) ? (
                          <CheckSquare className="h-5 w-5 text-primary" />
                        ) : (
                          <Square className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <CardTitle className="break-all" style={{ wordBreak: 'break-all', overflowWrap: 'anywhere' }}>
                            {project.title}
                          </CardTitle>
                          {!project.published && (
                            <span className="text-xs bg-muted px-2 py-1 rounded flex-shrink-0 whitespace-nowrap">Unpublished</span>
                          )}
                        </div>
                        <CardDescription className="break-words text-sm" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                          {project.description}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEdit(project)}
                        title="Edit Project"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleTogglePublish(project._id, project.published)}
                        title={project.published ? "Unpublish" : "Publish"}
                      >
                        {project.published ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
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
                          <AlertDialogTitle>Delete Project</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete &ldquo;{project.title}&rdquo;?
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(project._id)}
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
                <CardContent className="flex-1 flex flex-col">
                  <div className="space-y-3 flex-1">
                    {/* GitHub Topics/Tags */}
                    {project.topics && project.topics.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {project.topics.map((tag, i) => (
                          <span
                            key={i}
                            className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded break-words"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    {/* Tech Stack */}
                    {project.techStack && project.techStack.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {project.techStack.map((tech, i) => (
                          <span
                            key={i}
                            className="text-xs bg-secondary px-2 py-1 rounded break-words"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {project.liveUrl && (
                        <Button size="sm" variant="outline" asChild className="flex-shrink-0">
                          <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Live
                          </a>
                        </Button>
                      )}
                      {project.githubUrl && (
                        <Button size="sm" variant="outline" asChild className="flex-shrink-0">
                          <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                            <Github className="h-3 w-3 mr-1" />
                            Code
                          </a>
                        </Button>
                      )}
                    </div>
                    {project.featured && (
                      <span className="text-xs text-primary font-medium">⭐ Featured</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredProjects.length === 0 && !isLoading && (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">
                {selectedTopics.length > 0 
                  ? `No published projects found with selected tags. Clear filters to see all projects.`
                  : "No projects added yet. Click &ldquo;Add Project&rdquo; to get started!"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

