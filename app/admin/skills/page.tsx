"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, X, Save, Pencil, CheckSquare, Square } from "lucide-react";
import toast from "react-hot-toast";
import { useTransition, useMemo } from "react";
import { useSkills } from "@/lib/hooks/useAdminData";
import { ChevronDown } from "lucide-react";
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

interface Skill {
  _id: string;
  name: string;
  category: string;
  proficiency: number;
  icon?: string;
}

export default function AdminSkillsPage() {
  const { status } = useSession();
  const router = useRouter();
  const { skills, isLoading, refresh } = useSkills();
  const [, startTransition] = useTransition();
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());
  
  // Get unique categories from existing skills
  const existingCategories = useMemo(() => {
    if (!skills || skills.length === 0) return [];
    return Array.from(
      new Set(skills.map((skill: Skill) => skill.category).filter(Boolean))
    ).sort() as string[];
  }, [skills]);

  const [formData, setFormData] = useState<Partial<Skill> & { _id?: string; name: string; category: string; proficiency: number }>({
    name: "",
    category: "",
    proficiency: 50,
  });

  // Filter categories based on search input
  const filteredCategories = useMemo(() => {
    if (!categorySearch) return existingCategories;
    return existingCategories.filter((cat) =>
      cat.toLowerCase().includes(categorySearch.toLowerCase())
    );
  }, [categorySearch, existingCategories]);

  // Check if current category value is a new one (not in existing categories)
  const isNewCategory = useMemo(() => {
    return (
      formData.category &&
      !existingCategories.includes(formData.category) &&
      formData.category.length > 0
    );
  }, [formData.category, existingCategories]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  const resetForm = () => {
    setFormData({ name: "", category: "", proficiency: 50 });
    setCategorySearch("");
    setCategoryDropdownOpen(false);
  };

  const handleCategorySelect = (category: string) => {
    setFormData({ ...formData, category });
    setCategorySearch("");
    setCategoryDropdownOpen(false);
  };

  const handleCategoryInputChange = (value: string) => {
    setFormData({ ...formData, category: value });
    setCategorySearch(value);
    setCategoryDropdownOpen(true);
  };

  const handleEdit = (skill: Skill) => {
    setFormData({
      _id: skill._id,
      name: skill.name,
      category: skill.category,
      proficiency: skill.proficiency,
      ...(skill.icon && { icon: skill.icon }),
    });
    setCategorySearch("");
    setCategoryDropdownOpen(false);
    setShowAddForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const isEdit = !!formData._id;
      const url = "/api/skills";
      const method = isEdit ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(isEdit ? "Skill updated successfully!" : "Skill added successfully!");
        setShowAddForm(false);
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
        startTransition(() => {
          refresh();
        });
      } else {
        toast.error("Failed to delete skill");
      }
    } catch (error) {
      console.error("Error deleting skill:", error);
      toast.error("An error occurred");
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
            <h1 className="text-4xl font-bold">Manage Skills</h1>
            <p className="text-muted-foreground mt-2">Add, edit, or remove your skills</p>
          </div>
          <div className="flex gap-2">
            {selectedSkills.size > 0 && (
              <>
                <span className="flex items-center text-sm text-muted-foreground">
                  {selectedSkills.size} selected
                </span>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="gap-2">
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
              className="gap-2"
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
              className="gap-2"
            >
              {showAddForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {showAddForm ? "Cancel" : "Add Skill"}
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
                    <div className="relative">
                      <Label htmlFor="category">Category</Label>
                      <div className="relative">
                        <Input
                          id="category"
                          value={formData.category}
                          onChange={(e) => handleCategoryInputChange(e.target.value)}
                          onFocus={() => setCategoryDropdownOpen(true)}
                          onBlur={() => {
                            // Delay to allow click event on dropdown item
                            setTimeout(() => setCategoryDropdownOpen(false), 200);
                          }}
                          placeholder="Select or type a category"
                          required
                          list="category-list"
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
                            className={`h-4 w-4 transition-transform ${
                              categoryDropdownOpen ? "transform rotate-180" : ""
                            }`}
                          />
                        </Button>
                      </div>
                      
                      {/* Dropdown menu */}
                      {categoryDropdownOpen && (
                        <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-60 overflow-auto">
                          {filteredCategories.length > 0 && (
                            <div className="p-1">
                              {filteredCategories.map((category) => (
                                <button
                                  key={category}
                                  type="button"
                                  onClick={() => handleCategorySelect(category)}
                                  className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground rounded-sm cursor-pointer"
                                >
                                  {category}
                                </button>
                              ))}
                            </div>
                          )}
                          
                          {/* Show "Create new" option if typing something new */}
                          {categorySearch &&
                            !existingCategories.includes(categorySearch) &&
                            categorySearch.trim().length > 0 && (
                              <div className="border-t p-1">
                                <button
                                  type="button"
                                  onClick={() => handleCategorySelect(categorySearch)}
                                  className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground rounded-sm cursor-pointer font-medium text-primary"
                                >
                                  + Create &quot;{categorySearch}&quot;
                                </button>
                              </div>
                            )}
                          
                          {/* Empty state */}
                          {filteredCategories.length === 0 &&
                            !categorySearch &&
                            existingCategories.length === 0 && (
                              <div className="p-3 text-sm text-muted-foreground text-center">
                                No categories yet. Start typing to create one.
                              </div>
                            )}
                        </div>
                      )}
                      
                      {/* Helper text */}
                      {isNewCategory && (
                        <p className="text-xs text-muted-foreground mt-1">
                          This will create a new category
                        </p>
                      )}
                      
                      {/* Datalist for browser autocomplete */}
                      <datalist id="category-list">
                        {existingCategories.map((category) => (
                          <option key={category} value={category} />
                        ))}
                      </datalist>
                    </div>
                    <div>
                      <Label htmlFor="proficiency">Proficiency (%)</Label>
                      <Input
                        id="proficiency"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.proficiency}
                        onChange={(e) => setFormData({ ...formData, proficiency: Number(e.target.value) })}
                        required
                      />
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {skills.map((skill: Skill) => (
            <motion.div
              key={skill._id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Card className={selectedSkills.has(skill._id) ? "ring-2 ring-primary" : ""}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-2 flex-1">
                      <button
                        type="button"
                        onClick={() => handleToggleSelect(skill._id)}
                        className="mt-1 flex-shrink-0"
                      >
                        {selectedSkills.has(skill._id) ? (
                          <CheckSquare className="h-5 w-5 text-primary" />
                        ) : (
                          <Square className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                        )}
                      </button>
                      <div className="flex-1">
                        <CardTitle>{skill.name}</CardTitle>
                        <CardDescription>{skill.category}</CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEdit(skill)}
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Skill</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete &ldquo;{skill.name}&rdquo;?
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(skill._id)}
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
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Proficiency</span>
                      <span>{skill.proficiency}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2 relative overflow-hidden">
                      {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                      {/* @ts-ignore - Dynamic width needed for progress bar */}
                      <div
                        className="bg-primary h-2 rounded-full transition-all absolute top-0 left-0"
                        style={{ width: `${skill.proficiency}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {skills.length === 0 && !isLoading && (
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

