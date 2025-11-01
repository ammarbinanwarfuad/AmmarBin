"use client";

import { useState, useRef, useTransition } from "react";
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, GraduationCap, X, Save, Pencil, Loader2, CheckSquare, Square } from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";
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

interface Education {
  _id?: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  grade?: string;
  location?: string;
  description?: string;
  achievements?: string[];
}

export function EducationClient({ initialEducation }: { initialEducation: Education[] }) {
  const { data, isLoading, mutate } = useSWR('/api/education', fetcher, {
    fallbackData: { education: initialEducation },
    refreshInterval: 0,
  });
  const education = data?.education || [];
  const refresh = () => mutate();
  const [, startTransition] = useTransition();
  const [showAddForm, setShowAddForm] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedEducation, setSelectedEducation] = useState<Set<string>>(new Set());
  const [editingEducation, setEditingEducation] = useState<Education | null>(null);
  const [formData, setFormData] = useState<Education>({
    institution: "",
    degree: "",
    field: "",
    startDate: "",
    endDate: "",
    current: false,
    grade: "",
    location: "",
    description: "",
    achievements: [],
  });
  const [newAchievement, setNewAchievement] = useState("");

  // Session redirect handled by server component

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const isEdit = !!formData._id;
      const url = "/api/education";
      const method = isEdit ? "PUT" : "POST";
      
      // Prepare data - for edits, send all fields (user can leave unchanged)
      let submitData: Record<string, unknown> = { ...formData };
      
      if (isEdit) {
        // For edits, send all fields so user can update only what they want
        // Empty strings for optional fields will be set to null
        submitData = {
          _id: formData._id,
          institution: formData.institution,
          degree: formData.degree,
          field: formData.field,
          startDate: formData.startDate,
          endDate: formData.endDate || null,
          current: formData.current,
          grade: formData.grade || null,
          location: formData.location || null,
          description: formData.description || null,
          achievements: formData.achievements || [],
        };
      }
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        toast.success(isEdit ? "Education updated successfully!" : "Education added successfully!");
        setShowAddForm(false);
        setEditingEducation(null);
        resetForm();
        // Force cache refresh
        startTransition(() => {
          refresh();
        });
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || `Failed to ${isEdit ? 'update' : 'add'} education`);
      }
    } catch (error) {
      console.error("Error saving education:", error);
      toast.error("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const response = await fetch(`/api/education/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Education deleted successfully!");
        setSelectedEducation((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        startTransition(() => {
          refresh();
        });
      } else {
        toast.error("Failed to delete education");
      }
    } catch (error) {
      console.error("Error deleting education:", error);
      toast.error("An error occurred");
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedEducation((prev) => {
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
    if (selectedEducation.size === education.length) {
      setSelectedEducation(new Set());
    } else {
      setSelectedEducation(new Set(education.map((e: Education) => e._id!)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedEducation.size === 0) return;
    try {
      const response = await fetch("/api/education/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedEducation) }),
      });
      if (response.ok) {
        const data = await response.json();
        toast.success(`${data.deletedCount} education record(s) deleted successfully!`);
        setSelectedEducation(new Set());
        startTransition(() => {
          refresh();
        });
      } else {
        toast.error("Failed to delete education records");
      }
    } catch (error) {
      console.error("Error bulk deleting education:", error);
      toast.error("An error occurred");
    }
  };

  const handleEdit = (edu: Education) => {
    // Format dates properly for date inputs (YYYY-MM-DD)
    const formatDateForInput = (date: string | Date | undefined) => {
      if (!date) return "";
      const d = new Date(date);
      if (isNaN(d.getTime())) return "";
      return d.toISOString().split('T')[0];
    };

    setEditingEducation(edu);
    setFormData({
      _id: edu._id,
      institution: edu.institution || "",
      degree: edu.degree || "",
      field: edu.field || "",
      startDate: formatDateForInput(edu.startDate),
      endDate: formatDateForInput(edu.endDate),
      current: edu.current || false,
      grade: edu.grade || "",
      location: edu.location || "",
      description: edu.description || "",
      achievements: edu.achievements || [],
    });
    setNewAchievement("");
  };

  const resetForm = () => {
    setFormData({
      institution: "",
      degree: "",
      field: "",
      startDate: "",
      endDate: "",
      current: false,
      grade: "",
      location: "",
      description: "",
      achievements: [],
    });
    setNewAchievement("");
  };

  const addAchievement = () => {
    if (newAchievement.trim()) {
      setFormData({
        ...formData,
        achievements: [...(formData.achievements || []), newAchievement.trim()],
      });
      setNewAchievement("");
    }
  };

  const removeAchievement = (index: number) => {
    setFormData({
      ...formData,
      achievements: formData.achievements?.filter((_, i) => i !== index) || [],
    });
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
            <h1 className="text-4xl font-bold">Manage Education</h1>
            <p className="text-muted-foreground mt-2">Add, edit, or remove education records</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {selectedEducation.size > 0 && (
              <>
                <span className="flex items-center text-sm text-muted-foreground whitespace-nowrap">
                  {selectedEducation.size} selected
                </span>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="gap-2 text-sm">
                      <Trash2 className="h-4 w-4" />
                      Delete Selected ({selectedEducation.size})
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Selected Education</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete {selectedEducation.size} education record(s)? This action cannot be undone.
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
              {selectedEducation.size === education.length && education.length > 0 ? (
                <>
                  <Square className="h-4 w-4" /> Deselect All
                </>
              ) : (
                <>
                  <CheckSquare className="h-4 w-4" /> Select All
                </>
              )}
            </Button>
            <Button onClick={() => {
              setShowAddForm(!showAddForm);
              if (showAddForm) {
                resetForm();
              }
            }} className="gap-2 text-sm">
              {showAddForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {showAddForm ? "Cancel" : "Add Education"}
            </Button>
          </div>
        </div>

        {/* Edit Dialog */}
        <Dialog open={!!editingEducation} onOpenChange={(open) => { if (!open) { setEditingEducation(null); } }}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Education</DialogTitle>
              <DialogDescription>Update education details below</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-institution">Institution *</Label>
                  <Input
                    id="edit-institution"
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    placeholder="University Name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-degree">Degree *</Label>
                  <Input
                    id="edit-degree"
                    value={formData.degree}
                    onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                    placeholder="Bachelor's, Master's, etc."
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-field">Field of Study *</Label>
                  <Input
                    id="edit-field"
                    value={formData.field}
                    onChange={(e) => setFormData({ ...formData, field: e.target.value })}
                    placeholder="Computer Science, etc."
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-grade">Grade/GPA (optional)</Label>
                  <Input
                    id="edit-grade"
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    placeholder="3.8/4.0"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-location">Location (optional)</Label>
                  <Input
                    id="edit-location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="City, Country"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-startDate">Start Date *</Label>
                  <Input
                    id="edit-startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-endDate">End Date (optional)</Label>
                  <Input
                    id="edit-endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    disabled={formData.current}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="edit-current"
                  checked={formData.current}
                  onChange={(e) => setFormData({ ...formData, current: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="edit-current" className="cursor-pointer">Currently Studying</Label>
              </div>
              <div>
                <Label htmlFor="edit-description">Description (optional)</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description"
                  rows={3}
                />
              </div>
              <div>
                <Label>Achievements (optional)</Label>
                <div className="space-y-2 mt-2">
                  <div className="flex gap-2">
                    <Input
                      value={newAchievement}
                      onChange={(e) => setNewAchievement(e.target.value)}
                      placeholder="Enter an achievement"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (newAchievement.trim()) {
                            setFormData({
                              ...formData,
                              achievements: [...(formData.achievements || []), newAchievement.trim()],
                            });
                            setNewAchievement("");
                          }
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        if (newAchievement.trim()) {
                          setFormData({
                            ...formData,
                            achievements: [...(formData.achievements || []), newAchievement.trim()],
                          });
                          setNewAchievement("");
                        }
                      }}
                      disabled={!newAchievement.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {formData.achievements && formData.achievements.length > 0 && (
                    <ul className="space-y-2">
                      {formData.achievements.map((achievement, index) => (
                        <li key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                          <span className="text-sm">{achievement}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setFormData({
                              ...formData,
                              achievements: formData.achievements?.filter((_, i) => i !== index) || [],
                            })}
                            className="h-6 w-6"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingEducation(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  <Save className="mr-2 h-4 w-4" />
                  {submitting ? "Saving..." : "Update Education"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {showAddForm && (
          <div
            ref={formRef}
            className="mb-8 animate-in fade-in slide-in-from-top-4 duration-200"
          >
            <Card>
              <CardHeader>
                <CardTitle>{formData._id ? "Edit" : "Add"} Education</CardTitle>
                <CardDescription>Enter education details</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="institution">Institution {!formData._id && "*"}</Label>
                      <Input
                        id="institution"
                        value={formData.institution}
                        onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                        placeholder="University Name"
                        required={!formData._id}
                      />
                    </div>
                    <div>
                      <Label htmlFor="degree">Degree {!formData._id && "*"}</Label>
                      <Input
                        id="degree"
                        value={formData.degree}
                        onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                        placeholder="Bachelor's, Master's, etc."
                        required={!formData._id}
                      />
                    </div>
                    <div>
                      <Label htmlFor="field">Field of Study {!formData._id && "*"}</Label>
                      <Input
                        id="field"
                        value={formData.field}
                        onChange={(e) => setFormData({ ...formData, field: e.target.value })}
                        placeholder="Computer Science, etc."
                        required={!formData._id}
                      />
                    </div>
                    <div>
                      <Label htmlFor="grade">Grade/GPA (optional)</Label>
                      <Input
                        id="grade"
                        value={formData.grade}
                        onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                        placeholder="3.8/4.0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">Location (optional)</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="City, Country"
                      />
                    </div>
                    <div>
                      <Label htmlFor="startDate">Start Date {!formData._id && "*"}</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        required={!formData._id}
                      />
                    </div>
                    <div>
                      <Label htmlFor="endDate">End Date (optional)</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        disabled={formData.current}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="current"
                      checked={formData.current}
                      onChange={(e) => setFormData({ ...formData, current: e.target.checked })}
                      className="rounded"
                      aria-label="Currently Studying"
                    />
                    <Label htmlFor="current" className="cursor-pointer">Currently Studying</Label>
                  </div>
                  <div>
                    <Label htmlFor="description">Description (optional)</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Additional details about your education"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>Achievements (optional)</Label>
                    <div className="space-y-2 mt-2">
                      <div className="flex gap-2">
                        <Input
                          value={newAchievement}
                          onChange={(e) => setNewAchievement(e.target.value)}
                          placeholder="Enter an achievement"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addAchievement();
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={addAchievement}
                          disabled={!newAchievement.trim()}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {formData.achievements && formData.achievements.length > 0 && (
                        <ul className="space-y-2">
                          {formData.achievements.map((achievement, index) => (
                            <li key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                              <span className="text-sm">{achievement}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeAchievement(index)}
                                className="h-6 w-6"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={submitting} className="gap-2">
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          {formData._id ? "Update" : "Add"} Education
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowAddForm(false);
                        resetForm();
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="space-y-4">
          {education.map((edu: Education) => (
            <div
              key={edu._id}
              className="animate-in fade-in duration-200"
            >
              <Card className={`group hover:shadow-lg transition-all duration-300 border-l-4 ${
                selectedEducation.has(edu._id!) 
                  ? "ring-2 ring-primary border-l-primary shadow-md" 
                  : "border-l-transparent hover:border-l-primary/50"
              }`}>
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-0">
                    <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={() => edu._id && handleToggleSelect(edu._id)}
                        className="mt-1 flex-shrink-0 transition-transform hover:scale-110"
                      >
                        {selectedEducation.has(edu._id!) ? (
                          <CheckSquare className="h-5 w-5 text-primary" />
                        ) : (
                          <Square className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                        )}
                      </button>
                      <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 p-2.5 sm:p-3 rounded-xl flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                        <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <CardTitle className="text-base sm:text-lg break-words font-semibold">
                          {edu.degree}
                        </CardTitle>
                        <p className="text-sm sm:text-base text-primary/80 font-medium break-words">
                          {edu.field}
                        </p>
                        <CardDescription className="flex items-center gap-1.5 break-words">
                          <span className="font-medium">{edu.institution}</span>
                        </CardDescription>
                        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground pt-0.5">
                          <span className="inline-flex items-center gap-1 bg-muted px-2 py-0.5 rounded-md">
                            {format(new Date(edu.startDate), "MMM yyyy")} - {edu.current ? "Present" : format(new Date(edu.endDate!), "MMM yyyy")}
                          </span>
                          {edu.grade && (
                            <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded-md font-medium">
                              {edu.grade}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0 self-start sm:self-auto">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEdit(edu)}
                        title="Edit"
                        className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            title="Delete"
                            disabled={deletingId === edu._id}
                            className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-destructive/10 hover:text-destructive transition-colors"
                          >
                            {deletingId === edu._id ? (
                              <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Education</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete &ldquo;{edu.degree} in {edu.field}&rdquo;?
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => edu._id && handleDelete(edu._id)}
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
                {edu.description && (
                  <CardContent>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      {edu.description}
                    </p>
                  </CardContent>
                )}
              </Card>
            </div>
          ))}
        </div>

        {education.length === 0 && !isLoading && (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">No education records yet. Click &ldquo;Add Education&rdquo; to get started!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

