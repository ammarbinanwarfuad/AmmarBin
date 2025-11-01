"use client";

import { useState, useRef, useTransition } from "react";
import { motion } from "framer-motion";
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, ExternalLink, Github, X, Save, RefreshCw, Eye, EyeOff, Pencil, Check, ChevronsUpDown, Tag, CheckSquare, Square, Star, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";
import { ImageUpload } from "@/components/ImageUpload";
import Image from "next/image";
import { logger } from "@/lib/logger";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  slug?: string;
  description: string;
  longDescription?: string;
  techStack?: string[];
  technologies?: string[];
  topics?: string[];
  category?: string;
  liveUrl?: string;
  githubUrl?: string;
  image?: string;
  featured: boolean;
  published: boolean;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export function ProjectsClient({ initialProjects }: { initialProjects: Project[] }) {
  const { data, isLoading, mutate } = useSWR('/api/projects', fetcher, {
    fallbackData: { projects: initialProjects },
    refreshInterval: 0,
    revalidateOnMount: false, // Prevent hydration mismatch - use fallback on initial render
  });
  const projects = data?.projects || [];
  const refresh = () => mutate();
  const [isPending, startTransition] = useTransition();
  const [showAddForm, setShowAddForm] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [publishFilter, setPublishFilter] = useState<'all' | 'published' | 'unpublished'>('all');
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [categoryColors, setCategoryColors] = useState<Record<string, string>>(() => {
    // Load colors from localStorage with lazy initialization
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('projectCategoryColors');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // Ignore parse errors
        }
      }
    }
    // Return default colors
    return {
      "Frontend": "#3b82f6", // blue
      "Backend": "#22c55e", // green
      "Full Stack": "#a855f7", // purple
      "Mobile": "#06b6d4", // cyan
      "Desktop": "#6366f1", // indigo
      "Learning": "#f97316", // orange
      "Other": "#6b7280", // gray
    };
  });

  // Save colors to localStorage whenever they change
  const updateCategoryColor = (category: string, color: string) => {
    const newColors = { ...categoryColors, [category]: color };
    setCategoryColors(newColors);
    if (typeof window !== 'undefined') {
      localStorage.setItem('projectCategoryColors', JSON.stringify(newColors));
    }
    toast.success(`${category} color updated!`);
  };

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

  // Session redirect handled by server component

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!formData.description.trim()) {
      toast.error("Description is required");
      return;
    }
    
    try {
      const isEdit = !!formData._id;
      const url = isEdit ? `/api/projects/${formData._id}` : "/api/projects";
      const method = isEdit ? "PUT" : "POST";

      // Prepare data - allow empty strings for clearable fields
      const submitData: Record<string, unknown> = {
        title: formData.title,
        category: formData.category || "", // Allow empty category
        description: formData.description,
        techStack: formData.techStack ? formData.techStack.split(",").map((t) => t.trim()).filter(Boolean) : [],
        liveUrl: formData.liveUrl || "", // Allow empty to clear
        githubUrl: formData.githubUrl || "", // Allow empty to clear
        image: formData.image || "", // Allow empty to clear image
        featured: formData.featured,
        published: formData.published,
      };

      logger.info(`${isEdit ? 'Updating' : 'Creating'} project`, { submitData });

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        const result = await response.json();
        logger.info(`Project ${isEdit ? 'updated' : 'created'} successfully`, { result });
        toast.success(isEdit ? "Project updated successfully!" : "Project added successfully!");
        setShowAddForm(false);
        setEditingProject(null);
        resetForm();
        startTransition(() => {
          refresh(); // ⚡ SWR cache refresh with smooth transition
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        logger.error(`Failed to ${isEdit ? 'update' : 'add'} project`, { errorData, status: response.status });
        toast.error(errorData.error || errorData.message || `Failed to ${isEdit ? 'update' : 'add'} project`);
      }
    } catch (error) {
      logger.error("Error saving project", { error });
      toast.error(error instanceof Error ? error.message : "An error occurred");
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
    const toastId = toast.loading("Syncing GitHub projects...", {
      duration: Infinity, // Keep toast visible until we explicitly update it
    });
    try {
      const response = await fetch("/api/projects/sync-github", {
        method: "POST",
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to sync GitHub projects" }));
        const errorMsg = errorData.error || `Failed to sync GitHub projects: ${response.statusText}`;
        const helpMsg = errorData.help;
        
        toast.error(
          <div>
            <div className="font-semibold">{errorMsg}</div>
            {helpMsg && <div className="text-xs mt-1 opacity-90">{helpMsg}</div>}
          </div>,
          { id: toastId, duration: 10000 }
        );
        return;
      }
      
      const data = await response.json();
      const message = data.topicsFetched > 0
        ? `Synced ${data.count} projects with ${data.topicsFetched} repositories having topics!`
        : `Synced ${data.count} projects. ${data.note || "Note: No topics found. Make sure your GitHub token has 'repo' scope and repositories have topics set on GitHub."}`;
      toast.success(message, { duration: 5000, id: toastId });
      // Refresh SWR cache
      startTransition(() => {
        refresh();
        mutate('/api/projects');
      });
    } catch (error) {
      logger.error("Error syncing GitHub projects", { error });
      toast.error(error instanceof Error ? error.message : "An error occurred while syncing GitHub projects", { id: toastId });
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    const newPublishedStatus = !currentStatus;
    logger.info("Toggling publish status", { id, currentStatus, newPublishedStatus });
    
    try {
      const response = await fetch(`/api/projects/${id}/publish`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: newPublishedStatus }),
      });

      if (response.ok) {
        const result = await response.json();
        logger.info("Publish status updated successfully", { result });
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
        logger.error("Failed to update publish status", { errorData, status: response.status });
        toast.error(errorData.error || errorData.message || "Failed to update project status");
      }
    } catch (error) {
      logger.error("Error toggling publish status", { error });
      toast.error(error instanceof Error ? error.message : "An error occurred");
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
      logger.error("Error bulk deleting projects", { error });
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
      logger.error("Error deleting project", { error });
      toast.error("An error occurred");
    }
  };

  // Filter projects based on publish status
  const filteredProjects = publishFilter === 'all'
    ? projects
    : projects.filter((p: Project) => {
        if (publishFilter === 'published') return p.published === true;
        if (publishFilter === 'unpublished') return p.published === false;
        return true;
      });

  if (isLoading) {
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
    <div className="min-h-screen bg-background p-3 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold">Manage Projects</h1>
            <p className="text-muted-foreground mt-2">
              Add, edit, or remove your projects
              {isPending && <span className="ml-2 text-primary">• Updating...</span>}
            </p>
            {/* Quick Stats */}
            <div className="flex flex-wrap gap-3 mt-3 text-sm">
              <span className="text-muted-foreground">
                Total: <strong className="text-foreground">{projects.length}</strong>
              </span>
              <span className="text-muted-foreground">
                Published: <strong className="text-green-600 dark:text-green-500">{projects.filter((p: Project) => p.published).length}</strong>
              </span>
              <span className="text-muted-foreground">
                No Image: <strong className="text-yellow-600 dark:text-yellow-500">{projects.filter((p: Project) => !p.image).length}</strong>
              </span>
              <span className="text-muted-foreground">
                No Category: <strong className="text-orange-600 dark:text-orange-500">{projects.filter((p: Project) => !p.category || !p.category.trim()).length}</strong>
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {selectedProjects.size > 0 && (
              <>
                <span className="flex items-center text-sm text-muted-foreground whitespace-nowrap">
                  {selectedProjects.size} selected
                </span>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="gap-2 text-sm">
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
              className="gap-2 text-sm"
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
            <Button onClick={syncGitHub} variant="outline" className="gap-2 text-sm">
              <RefreshCw className="h-4 w-4" />
              Sync GitHub
            </Button>
            <Button onClick={() => {
              if (showAddForm) {
                setShowAddForm(false);
                setEditingProject(null);
                resetForm();
              } else {
                setShowAddForm(true);
              }
            }} className="gap-2 text-sm">
              {showAddForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {showAddForm ? "Cancel" : "Add Project"}
            </Button>
          </div>
        </div>

        {/* Edit Dialog */}
        <Dialog open={!!editingProject} onOpenChange={(open) => { if (!open) { setEditingProject(null); } }}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Project</DialogTitle>
              <DialogDescription>Update project details below</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-title">Project Title</Label>
                  <Input
                    id="edit-title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="My Awesome Project"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-category">Category</Label>
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
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandInput
                          placeholder="Search or type new..."
                          value={categorySearch}
                          onValueChange={setCategorySearch}
                        />
                        <CommandList>
                          <CommandEmpty>
                            <button
                              type="button"
                              onClick={() => {
                                setFormData({ ...formData, category: categorySearch });
                                setCategoryOpen(false);
                                setCategorySearch("");
                              }}
                              className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm"
                            >
                              Create &quot;{categorySearch}&quot;
                            </button>
                          </CommandEmpty>
                          <CommandGroup>
                            {["Frontend", "Backend", "Full Stack", "Mobile", "Desktop", "Learning", "Other"].map((category) => (
                              <CommandItem
                                key={category}
                                value={category}
                                onSelect={() => {
                                  setFormData({ ...formData, category });
                                  setCategoryOpen(false);
                                  setCategorySearch("");
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
                </div>
              </div>
              <div>
                <Label htmlFor="edit-description">Short Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief project description"
                  rows={3}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-techStack">Tech Stack (comma-separated)</Label>
                <Input
                  id="edit-techStack"
                  value={formData.techStack}
                  onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
                  placeholder="React, Node.js, MongoDB"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-liveUrl">Live URL</Label>
                  <Input
                    id="edit-liveUrl"
                    type="url"
                    value={formData.liveUrl}
                    onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-githubUrl">GitHub URL</Label>
                  <Input
                    id="edit-githubUrl"
                    type="url"
                    value={formData.githubUrl}
                    onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                    placeholder="https://github.com/username/repo"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-image">Image URL</Label>
                <Input
                  id="edit-image"
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://example.com/image.jpg or upload below"
                />
                <div className="mt-2">
                  <ImageUpload
                    value={formData.image}
                    onChange={(value) => setFormData({ ...formData, image: value as string })}
                    folder="projects"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Featured Project</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Published</span>
                </label>
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingProject(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  <Save className="mr-2 h-4 w-4" />
                  {isPending ? "Saving..." : "Update Project"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {showAddForm && (
          <motion.div
            ref={formRef}
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
                    <p className="text-xs text-muted-foreground mt-2">
                      Or paste image URL directly:
                    </p>
                    <Input
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                      className="mt-1"
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

        {/* Publish Status Filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 md:gap-3 items-center">
            <span className="text-xs md:text-sm text-muted-foreground font-medium">Filter by status:</span>
            <Button
              variant={publishFilter === 'all' ? "default" : "outline"}
              onClick={() => setPublishFilter('all')}
              size="sm"
              className="min-w-[80px] md:min-w-[100px] text-xs md:text-sm"
            >
              All ({projects.length})
            </Button>
            <Button
              variant={publishFilter === 'published' ? "default" : "outline"}
              onClick={() => setPublishFilter('published')}
              size="sm"
              className="min-w-[80px] md:min-w-[100px] text-xs md:text-sm"
            >
              Published ({projects.filter((p: Project) => p.published).length})
            </Button>
            <Button
              variant={publishFilter === 'unpublished' ? "default" : "outline"}
              onClick={() => setPublishFilter('unpublished')}
              size="sm"
              className="min-w-[80px] md:min-w-[100px] text-xs md:text-sm"
            >
              Unpublished ({projects.filter((p: Project) => !p.published).length})
            </Button>
          </div>
        </div>

        {/* Category Color Picker */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => setShowColorPicker(!showColorPicker)}
            size="sm"
            className="gap-2 mb-3"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z" />
            </svg>
            {showColorPicker ? "Hide" : "Customize"} Category Colors
          </Button>
          
          {showColorPicker && (
            <Card className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Object.entries(categoryColors).map(([category, color]) => (
                  <div key={category} className="space-y-2">
                    <Label htmlFor={`color-${category}`} className="text-sm font-medium">
                      {category}
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="text"
                        id={`color-${category}`}
                        value={color}
                        onChange={(e) => updateCategoryColor(category, e.target.value)}
                        placeholder="#3b82f6"
                        className="flex-1 font-mono text-sm"
                      />
                      <div
                        className="h-10 w-10 rounded border border-input flex-shrink-0"
                        style={{ backgroundColor: color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const defaults = {
                      "Frontend": "#3b82f6",
                      "Backend": "#22c55e",
                      "Full Stack": "#a855f7",
                      "Mobile": "#06b6d4",
                      "Desktop": "#6366f1",
                      "Learning": "#f97316",
                      "Other": "#6b7280"
                    };
                    Object.entries(defaults).forEach(([cat, col]) => {
                      updateCategoryColor(cat, col);
                    });
                    toast.success("Category colors reset to defaults!");
                  }}
                  className="gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                  Reset to Defaults
                </Button>
              </div>
            </Card>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          {filteredProjects.map((project: Project) => (
            <motion.div
              key={project._id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Card className={`${!project.published ? "opacity-60 border-dashed" : ""} ${selectedProjects.has(project._id) ? "ring-2 ring-primary" : ""} h-full flex flex-col`}>
                {/* Project Image Preview */}
                {project.image ? (
                  <div className="relative w-full h-40 md:h-48 bg-muted overflow-hidden rounded-t-lg">
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    {project.featured && (
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1">
                        <Star className="h-3 w-3 fill-current" />
                        Featured
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative w-full h-40 md:h-48 bg-muted/50 flex items-center justify-center rounded-t-lg border-b border-border">
                    <div className="text-center text-muted-foreground">
                      <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="text-xs font-medium">No image</p>
                    </div>
                    {project.featured && (
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1">
                        <Star className="h-3 w-3 fill-current" />
                        Featured
                      </div>
                    )}
                  </div>
                )}
                
                <CardHeader className="flex-shrink-0 p-4 md:p-6">
                  {/* Category Badge - Prominently displayed at the top */}
                  {project.category && project.category.trim() && (
                    <div className="mb-2 md:mb-3 flex items-center gap-1">
                      <Tag className="h-3 w-3 md:h-3.5 md:w-3.5 text-primary" />
                      <span className="text-xs font-semibold bg-primary/10 text-primary px-2 md:px-2.5 py-0.5 md:py-1 rounded-md border border-primary/20">
                        {project.category}
                      </span>
                    </div>
                  )}
                  {!project.category && (
                    <div className="mb-2 md:mb-3">
                      <span className="text-xs text-muted-foreground italic">No category</span>
                    </div>
                  )}
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3 md:gap-2">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={() => handleToggleSelect(project._id)}
                        className="mt-0.5 md:mt-1 flex-shrink-0"
                      >
                        {selectedProjects.has(project._id) ? (
                          <CheckSquare className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                        ) : (
                          <Square className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground hover:text-foreground" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1 md:mb-2">
                          <CardTitle className="text-base md:text-lg break-all" style={{ wordBreak: 'break-all', overflowWrap: 'anywhere' }}>
                            {project.title}
                          </CardTitle>
                          {!project.published && (
                            <span className="text-[10px] md:text-xs bg-muted px-1.5 md:px-2 py-0.5 md:py-1 rounded flex-shrink-0 whitespace-nowrap">Unpublished</span>
                          )}
                        </div>
                        <CardDescription className="break-words text-xs md:text-sm" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                          {project.description}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0 self-start">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEdit(project)}
                        title="Edit Project"
                        className="h-8 w-8 md:h-10 md:w-10"
                      >
                        <Pencil className="h-3 w-3 md:h-4 md:w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleTogglePublish(project._id, project.published)}
                        title={project.published ? "Unpublish" : "Publish"}
                        className="h-8 w-8 md:h-10 md:w-10"
                      >
                        {project.published ? (
                          <Eye className="h-3 w-3 md:h-4 md:w-4" />
                        ) : (
                          <EyeOff className="h-3 w-3 md:h-4 md:w-4" />
                        )}
                      </Button>
                      <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 md:h-10 md:w-10"
                        >
                          <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
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
                <CardContent className="flex-1 flex flex-col p-4 md:p-6">
                  <div className="space-y-2 md:space-y-3 flex-1">
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
                    
                    {/* Status Indicators - What's Missing */}
                    <div className="pt-2 mt-auto border-t border-border">
                      <div className="flex flex-wrap gap-2 text-xs">
                        {!project.image && (
                          <span className="text-yellow-600 dark:text-yellow-500 flex items-center gap-1">
                            <ImageIcon className="h-3 w-3" />
                            No image
                          </span>
                        )}
                        {(!project.category || !project.category.trim()) && (
                          <span className="text-orange-600 dark:text-orange-500 flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            No category
                          </span>
                        )}
                        {(!project.techStack || project.techStack.length === 0) && (
                          <span className="text-blue-600 dark:text-blue-500 flex items-center gap-1">
                            No tech stack
                          </span>
                        )}
                        {project.image && project.category && project.techStack && project.techStack.length > 0 && (
                          <span className="text-green-600 dark:text-green-500 flex items-center gap-1">
                            <Check className="h-3 w-3" />
                            Complete
                          </span>
                        )}
                      </div>
                    </div>
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
                {publishFilter === 'published' 
                  ? 'No published projects found.'
                  : publishFilter === 'unpublished'
                  ? 'No unpublished projects found.'
                  : 'No projects added yet. Click "Add Project" to get started!'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

