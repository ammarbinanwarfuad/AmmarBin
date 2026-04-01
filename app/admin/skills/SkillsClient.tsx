"use client";

import { useState, useRef, useEffect, useTransition, useMemo } from "react";
import type { CSSProperties } from "react";
import useSWR from 'swr';
import { getIconUrl } from "@/components/SkillsShowcase";
import { fetcher } from '@/lib/fetcher';
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, X, Save, Pencil, CheckSquare, Square, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
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

interface Skill {
  _id: string;
  name: string;
  category: string;
  proficiency: number;
  icon?: string;
}

// Helper function to convert various color formats to HEX
function normalizeColorToHex(color: string): string | null {
  if (!color || typeof color !== 'string') return null;

  const trimmed = color.trim();

  // Already HEX format
  if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3}|[A-Fa-f0-9]{8})$/.test(trimmed)) {
    // Convert 3-digit HEX to 6-digit
    if (trimmed.length === 4) {
      return `#${trimmed[1]}${trimmed[1]}${trimmed[2]}${trimmed[2]}${trimmed[3]}${trimmed[3]}`;
    }
    return trimmed;
  }

  // RGB/RGBA format: rgb(255, 0, 0) or rgba(255, 0, 0, 0.5)
  const rgbMatch = trimmed.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)$/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]);
    const g = parseInt(rgbMatch[2]);
    const b = parseInt(rgbMatch[3]);
    return `#${[r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('')}`;
  }

  // HSL/HSLA format: hsl(0, 100%, 50%) or hsla(0, 100%, 50%, 0.5)
  const hslMatch = trimmed.match(/^hsla?\((\d+),\s*(\d+)%,\s*(\d+)%(?:,\s*[\d.]+)?\)$/);
  if (hslMatch) {
    const h = parseInt(hslMatch[1]) / 360;
    const s = parseInt(hslMatch[2]) / 100;
    const l = parseInt(hslMatch[3]) / 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h * 6) % 2 - 1));
    const m = l - c / 2;

    let r = 0, g = 0, b = 0;

    if (h < 1 / 6) { r = c; g = x; b = 0; }
    else if (h < 2 / 6) { r = x; g = c; b = 0; }
    else if (h < 3 / 6) { r = 0; g = c; b = x; }
    else if (h < 4 / 6) { r = 0; g = x; b = c; }
    else if (h < 5 / 6) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return `#${[r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('')}`;
  }

  // Try CSS named colors by creating a temporary element (only in browser)
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    try {
      const tempDiv = document.createElement('div');
      tempDiv.style.color = trimmed;
      document.body.appendChild(tempDiv);
      const computedColor = window.getComputedStyle(tempDiv).color;
      tempDiv.remove();

      if (computedColor && computedColor !== 'rgba(0, 0, 0, 0)') {
        const rgbMatch2 = computedColor.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (rgbMatch2) {
          const r = parseInt(rgbMatch2[1]);
          const g = parseInt(rgbMatch2[2]);
          const b = parseInt(rgbMatch2[3]);
          return `#${[r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
          }).join('')}`;
        }
      }
    } catch {
      // Fall through to return null
    }
  }

  return null;
}

// Helper function to get category color
function getCategoryColor(category: string, customColors?: Record<string, string>): string {
  // Check custom colors first
  if (customColors && customColors[category]) {
    const normalized = normalizeColorToHex(customColors[category]);
    if (normalized) return normalized;
  }

  const lowerCategory = category.toLowerCase();

  // Define color mapping
  if (lowerCategory.includes("tools") && lowerCategory.includes("technologies")) {
    return "#F59E0B"; // Amber - Tools & Technologies
  }
  if (lowerCategory.includes("frontend")) {
    return "#3B82F6"; // Blue - Frontend Development
  }
  if (lowerCategory.includes("backend")) {
    return "#10B981"; // Green - Backend Development
  }
  if (lowerCategory.includes("cms")) {
    return "#8B5CF6"; // Purple - CMS
  }
  if (lowerCategory.includes("design")) {
    return "#EC4899"; // Pink - Design Tools
  }
  if (lowerCategory.includes("programming")) {
    return "#EF4444"; // Red - Programming Languages
  }
  if (lowerCategory.includes("other")) {
    return "#6366F1"; // Indigo - Other Skills
  }

  // Default color
  return "#3B82F6";
}

// ── Admin Skill Icon Card ─────────────────────────────────────────────────────
function AdminSkillCard({
  skill,
  accentColor,
  selected,
  onSelect,
  onEdit,
  onDelete,
}: {
  skill: Skill;
  accentColor: string;
  selected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [imgError, setImgError] = useState(false);
  const iconUrl = getIconUrl(skill.name, skill.icon);

  return (
    <div
      className={`group relative flex flex-col items-center justify-center gap-2 p-3 rounded-2xl
                  bg-card border transition-all duration-200 aspect-square cursor-default
                  ${selected ? 'ring-2 ring-yellow-400 border-yellow-400/60' : 'border-border hover:border-muted-foreground/40'}`}
    >
      {/* Checkbox — top-left, always visible when selected; on hover otherwise */}
      <button
        type="button"
        onClick={onSelect}
        className={`absolute top-2 left-2 z-10 transition-opacity ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
        aria-label={selected ? 'Deselect skill' : 'Select skill'}
      >
        {selected ? (
          <CheckSquare className="h-4 w-4 text-yellow-400" />
        ) : (
          <Square className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {/* Edit / Delete — top-right, visible on hover */}
      <div className="absolute top-1 right-1 z-10 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={onEdit} title="Edit">
          <Pencil className="h-3 w-3" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="icon" variant="ghost" className="h-6 w-6 hover:text-destructive" title="Delete">
              <Trash2 className="h-3 w-3" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Skill</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete &ldquo;{skill.name}&rdquo;? This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={onDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Icon */}
      <div className="flex items-center justify-center w-[52%] aspect-square shrink-0">
        {!imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={iconUrl}
            alt={skill.name}
            className="w-full h-full object-contain drop-shadow"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div
            className="w-full h-full rounded-xl flex items-center justify-center text-white font-bold text-xl [background-color:var(--accent-color)]"
            style={{ '--accent-color': accentColor } as CSSProperties}
          >
            {skill.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Name */}
      <span className="text-[10px] font-bold text-muted-foreground text-center tracking-wider uppercase leading-tight truncate w-full">
        {skill.name}
      </span>

      {/* Accent bottom line */}
      <div className="absolute bottom-0 left-1/4 right-1/4 h-[2px] rounded-full opacity-60 [background-color:var(--accent-color)]" style={{ '--accent-color': accentColor } as CSSProperties} />
    </div>
  );
}

export function SkillsClient({ initialSkills }: { initialSkills: Skill[] }) {
  const { data, isLoading, mutate } = useSWR('/api/skills', fetcher, {
    fallbackData: { skills: initialSkills },
    refreshInterval: 0,
  });
  const skills = useMemo(() => data?.skills || [], [data?.skills]);
  const refresh = () => mutate();
  const [, startTransition] = useTransition();
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [isCreatingNewCategory, setIsCreatingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("#3B82F6");
  const [categoryColors, setCategoryColors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLDivElement>(null);
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);

  // Initialize formData first before useMemo hooks that depend on it
  const [formData, setFormData] = useState<Partial<Skill> & { _id?: string; name: string; category: string }>({
    name: "",
    category: "",
  });


  // Define the desired order of categories (same as public panel)
  const categoryOrder = useMemo(() => [
    "Programming Languages",
    "Frontend Development",
    "Backend Development",
    "CMS",
    "Tools & Technologies",
    "Other Skills"
  ], []);

  // Sort categories according to the specified order (for dropdown)
  const sortedCategoriesForDropdown = useMemo(() => {
    if (!skills || skills.length === 0) return [];
    const allCategories = Array.from(
      new Set(skills.map((skill: Skill) => skill.category).filter(Boolean))
    ) as string[];

    const sorted = categoryOrder.filter(category =>
      allCategories.some(cat => cat.toLowerCase() === category.toLowerCase())
    ).concat(
      // Add any categories not in the predefined list at the end
      allCategories.filter(cat =>
        !categoryOrder.some(ordered => ordered.toLowerCase() === cat.toLowerCase())
      )
    );

    // If editing and current category is not in the list, add it
    if (formData.category && !sorted.includes(formData.category)) {
      sorted.push(formData.category);
    }

    return sorted;
  }, [skills, formData.category, categoryOrder]);

  // Sort categories according to the specified order (for display)
  const sortedCategories = useMemo(() => {
    if (!skills || skills.length === 0) return [];
    const allCategories = Array.from(
      new Set(skills.map((skill: Skill) => skill.category).filter(Boolean))
    ) as string[];

    return categoryOrder.filter(category =>
      allCategories.some(cat => cat.toLowerCase() === category.toLowerCase())
    ).concat(
      // Add any categories not in the predefined list at the end
      allCategories.filter(cat =>
        !categoryOrder.some(ordered => ordered.toLowerCase() === cat.toLowerCase())
      )
    );
  }, [skills, categoryOrder]);

  // Helper function to get skills by category
  const getSkillsByCategory = (category: string): Skill[] => {
    return skills.filter((skill: Skill) => skill.category === category);
  };


  // Session redirect handled by server component

  // Load category colors from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('skillCategoryColors');
      if (stored) {
        try {
          setCategoryColors(JSON.parse(stored));
        } catch (e) {
          console.error('Failed to parse category colors from localStorage', e);
        }
      }
    }
  }, []);

  // Save category colors to localStorage when they change
  useEffect(() => {
    if (typeof window !== 'undefined' && Object.keys(categoryColors).length > 0) {
      localStorage.setItem('skillCategoryColors', JSON.stringify(categoryColors));
    }
  }, [categoryColors]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (categoryDropdownOpen && !target.closest('.category-dropdown-container')) {
        setCategoryDropdownOpen(false);
      }
    };

    if (categoryDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [categoryDropdownOpen]);

  const resetForm = () => {
    setFormData({ name: "", category: "" });
    setCategoryDropdownOpen(false);
    setIsCreatingNewCategory(false);
    setNewCategoryName("");
    setNewCategoryColor("#3B82F6");
  };

  const handleCategorySelect = (category: string) => {
    setFormData({ ...formData, category });
    setCategoryDropdownOpen(false);
    setIsCreatingNewCategory(false);
    setNewCategoryName("");
  };

  const handleCreateNewCategory = () => {
    setIsCreatingNewCategory(true);
    setNewCategoryName("");
    setNewCategoryColor("#3B82F6");
  };

  const handleSaveNewCategory = () => {
    if (newCategoryName.trim()) {
      const categoryName = newCategoryName.trim();
      setFormData({ ...formData, category: categoryName });

      // Save the color for this category
      const normalizedColor = normalizeColorToHex(newCategoryColor);
      if (normalizedColor) {
        setCategoryColors(prev => ({
          ...prev,
          [categoryName]: normalizedColor
        }));
      }

      setIsCreatingNewCategory(false);
      setNewCategoryName("");
      setNewCategoryColor("#3B82F6");
      setCategoryDropdownOpen(false);
    }
  };

  const handleCancelNewCategory = () => {
    setIsCreatingNewCategory(false);
    setNewCategoryName("");
    setNewCategoryColor("#3B82F6");
  };

  const handleEdit = (skill: Skill) => {
    setEditingSkill(skill);
    setFormData({
      _id: skill._id,
      name: skill.name,
      category: skill.category,
      ...(skill.icon && { icon: skill.icon }),
    });
    setCategoryDropdownOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const isEdit = !!formData._id;
      const url = "/api/skills";
      const method = isEdit ? "PUT" : "POST";

      // Send proficiency as 0 (default) since it's no longer shown in UI
      const submitData = { ...formData, proficiency: 0 };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        toast.success(isEdit ? "Skill updated successfully!" : "Skill added successfully!");
        setShowAddForm(false);
        setEditingSkill(null);
        resetForm();
        startTransition(() => {
          refresh();
        });
      } else {
        toast.error(`Failed to ${isEdit ? 'update' : 'add'} skill`);
      }
    } catch (error) {
      console.error("Error saving skill:", error);
      toast.error("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // Optimistic update: immediately remove from UI
      const currentSkills = skills;
      await mutate(
        { skills: currentSkills.filter((s: Skill) => s._id !== id) },
        { revalidate: false }
      );

      const response = await fetch(`/api/skills/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Skill deleted successfully!");
        setSelectedSkills((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        // Revalidate to ensure consistency
        mutate();
      } else {
        toast.error("Failed to delete skill");
        // Rollback on error
        mutate({ skills: currentSkills }, { revalidate: false });
      }
    } catch (error) {
      console.error("Error deleting skill:", error);
      toast.error("An error occurred");
      // Rollback on error
      mutate();
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedSkills((prev) => {
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
    if (selectedSkills.size === skills.length) {
      setSelectedSkills(new Set());
    } else {
      setSelectedSkills(new Set(skills.map((skill: Skill) => skill._id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedSkills.size === 0) return;

    try {
      const response = await fetch("/api/skills/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedSkills) }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`${data.deletedCount} skill(s) deleted successfully!`);
        setSelectedSkills(new Set());
        startTransition(() => {
          refresh();
        });
      } else {
        toast.error("Failed to delete skills");
      }
    } catch (error) {
      console.error("Error bulk deleting skills:", error);
      toast.error("An error occurred");
    }
  };

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
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold">Manage Skills</h1>
            <p className="text-muted-foreground mt-2">Add, edit, or remove your skills</p>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {selectedSkills.size > 0 && (
              <>
                <span className="flex items-center text-sm text-muted-foreground whitespace-nowrap">
                  {selectedSkills.size} selected
                </span>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="gap-2 text-sm">
                      <Trash2 className="h-4 w-4" /> Delete Selected ({selectedSkills.size})
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Selected Skills</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete {selectedSkills.size} skill(s)? This action cannot be undone.
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
              {selectedSkills.size === skills.length && skills.length > 0 ? (
                <>
                  <Square className="h-4 w-4" /> Deselect All
                </>
              ) : (
                <>
                  <CheckSquare className="h-4 w-4" /> Select All
                </>
              )}
            </Button>
            <Button
              onClick={() => {
                if (showAddForm) {
                  resetForm();
                }
                setShowAddForm(!showAddForm);
              }}
              className="gap-2 text-sm"
            >
              {showAddForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {showAddForm ? "Cancel" : "Add Skill"}
            </Button>
          </div>
        </div>

        {/* Edit Dialog */}
        <Dialog open={!!editingSkill} onOpenChange={(open) => { if (!open) { setEditingSkill(null); } }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Skill</DialogTitle>
              <DialogDescription>Update skill details below</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Skill Name</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., JavaScript"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-category">Category</Label>
                  <div className="relative">
                    <button
                      type="button"
                      id="edit-category"
                      onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                      className="w-full px-3 py-2 text-left border border-input bg-background rounded-md hover:bg-accent hover:text-accent-foreground flex items-center justify-between"
                    >
                      <span className={formData.category ? "" : "text-muted-foreground"}>
                        {formData.category || "Select a category..."}
                      </span>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </button>
                    {categoryDropdownOpen && (
                      <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-md max-h-60 overflow-y-auto">
                        {sortedCategoriesForDropdown.map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, category: cat });
                              setCategoryDropdownOpen(false);
                            }}
                            className="w-full px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground"
                          >
                            {cat}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            setIsCreatingNewCategory(true);
                            setCategoryDropdownOpen(false);
                          }}
                          className="w-full px-3 py-2 text-left text-primary hover:bg-accent border-t border-border"
                        >
                          + Create New Category
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-icon">Icon (optional)</Label>
                  <Input
                    id="edit-icon"
                    value={formData.icon || ""}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="e.g., devicon-javascript-plain"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingSkill(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  <Save className="mr-2 h-4 w-4" />
                  {submitting ? "Saving..." : "Update Skill"}
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
                <CardTitle>{formData._id ? "Edit Skill" : "Add New Skill"}</CardTitle>
                <CardDescription>
                  {formData._id ? "Update skill details below" : "Enter skill details below"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Skill Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., JavaScript"
                        required
                      />
                    </div>
                    <div className="relative category-dropdown-container">
                      <Label htmlFor="category">Category</Label>
                      {isCreatingNewCategory ? (
                        <div className="space-y-3">
                          <div>
                            <Input
                              id="category"
                              value={newCategoryName}
                              onChange={(e) => setNewCategoryName(e.target.value)}
                              placeholder="Enter new category name"
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && e.target === e.currentTarget) {
                                  e.preventDefault();
                                  // Don't submit, just focus on color input
                                } else if (e.key === "Escape") {
                                  handleCancelNewCategory();
                                }
                              }}
                              autoFocus
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="category-color" className="text-sm">
                              Category Color (HEX, RGB, HSL, or named color)
                            </Label>
                            <div className="flex gap-2 mt-1">
                              <div className="relative flex-1">
                                <Input
                                  id="category-color"
                                  value={newCategoryColor}
                                  onChange={(e) => setNewCategoryColor(e.target.value)}
                                  placeholder="#3B82F6, rgb(59, 130, 246), hsl(217, 91%, 60%), or blue"
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      handleSaveNewCategory();
                                    } else if (e.key === "Escape") {
                                      handleCancelNewCategory();
                                    }
                                  }}
                                  className="pr-10"
                                />
                                <div
                                  className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded border border-border [background-color:var(--preview-color)]"
                                  style={{ '--preview-color': normalizeColorToHex(newCategoryColor) || newCategoryColor || '#3B82F6' } as CSSProperties}
                                />
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Examples: #FF5733, rgb(255, 87, 51), hsl(9, 100%, 60%), red
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              size="sm"
                              onClick={handleSaveNewCategory}
                              disabled={!newCategoryName.trim()}
                            >
                              Save
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={handleCancelNewCategory}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="relative">
                          <Input
                            id="category"
                            value={formData.category}
                            readOnly
                            onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                            placeholder="Select a category"
                            required
                            className="cursor-pointer"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                            onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                            tabIndex={-1}
                          >
                            <ChevronDown
                              className={`h-4 w-4 transition-transform ${categoryDropdownOpen ? "transform rotate-180" : ""
                                }`}
                            />
                          </Button>
                        </div>
                      )}

                      {/* Dropdown menu */}
                      {categoryDropdownOpen && !isCreatingNewCategory && (
                        <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-60 overflow-auto">
                          {sortedCategoriesForDropdown.length > 0 ? (
                            <div className="p-1">
                              {sortedCategoriesForDropdown.map((category) => (
                                <button
                                  key={category}
                                  type="button"
                                  onClick={() => handleCategorySelect(category)}
                                  className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground rounded-sm cursor-pointer"
                                >
                                  {category}
                                </button>
                              ))}
                              <div className="border-t mt-1 pt-1">
                                <button
                                  type="button"
                                  onClick={handleCreateNewCategory}
                                  className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground rounded-sm cursor-pointer font-medium text-primary flex items-center gap-2"
                                >
                                  <Plus className="h-4 w-4" />
                                  Create new category
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="p-1">
                              <div className="p-3 text-sm text-muted-foreground text-center mb-1">
                                No categories available.
                              </div>
                              <div className="border-t pt-1">
                                <button
                                  type="button"
                                  onClick={handleCreateNewCategory}
                                  className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground rounded-sm cursor-pointer font-medium text-primary flex items-center gap-2"
                                >
                                  <Plus className="h-4 w-4" />
                                  Create new category
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="icon">Icon (optional)</Label>
                      <Input
                        id="icon"
                        value={formData.icon || ""}
                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                        placeholder="e.g., devicon-javascript-plain"
                      />
                    </div>
                  </div>
                  <Button type="submit" className="gap-2" disabled={submitting}>
                    <Save className="h-4 w-4" />
                    {submitting ? "Saving..." : formData._id ? "Update Skill" : "Add Skill"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="space-y-12">
          {sortedCategories.map((category, categoryIndex) => {
            const categorySkills = getSkillsByCategory(category);
            if (categorySkills.length === 0) return null;
            const accentColor = getCategoryColor(category, categoryColors);

            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
              >
                {/* Category heading with accent bar */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-7 rounded-full [background-color:var(--accent-color)]" style={{ '--accent-color': accentColor } as CSSProperties} />
                  <h2 className="text-2xl font-bold text-foreground">{category}</h2>
                  <span className="text-sm text-muted-foreground ml-1">
                    ({categorySkills.length} skill{categorySkills.length !== 1 ? 's' : ''})
                  </span>
                </div>

                {/* 5-column icon card grid — mirrors the public skills page */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {categorySkills.map((skill: Skill) => (
                    <AdminSkillCard
                      key={skill._id}
                      skill={skill}
                      accentColor={accentColor}
                      selected={selectedSkills.has(skill._id)}
                      onSelect={() => handleToggleSelect(skill._id)}
                      onEdit={() => handleEdit(skill)}
                      onDelete={() => handleDelete(skill._id)}
                    />
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {sortedCategories.length === 0 && !isLoading && (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">No skills added yet. Click &ldquo;Add Skill&rdquo; to get started!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

