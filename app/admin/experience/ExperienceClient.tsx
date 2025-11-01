"use client";

import { Suspense, useState, useRef } from "react";
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Briefcase, Users, X, Save, Loader2, Pencil, CheckSquare, Square } from "lucide-react";
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

interface Experience {
  _id?: string;
  company: string;
  role: string;
  description: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  location: string;
  responsibilities: string[];
  skills: string[];
}

interface Participation {
  _id?: string;
  title: string;
  organization: string;
  role: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  location: string;
  description: string;
  impact: string;
}

export default function AdminExperiencePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <ExperienceContent />
    </Suspense>
  );
}

function ExperienceContent() {
  const formRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get("tab");
  
  // Initialize activeTab from URL or default to experience
  const [activeTab, setActiveTab] = useState<"experience" | "participation">(
    tabParam === "participation" ? "participation" : "experience"
  );
  
  // SWR Hooks
  const { data: expData, isLoading: expLoading, mutate: mutateExp } = useSWR('/api/experience', fetcher, {
    refreshInterval: 0,
  });
  const { data: partData, isLoading: partLoading, mutate: mutatePart } = useSWR('/api/participation', fetcher, {
    refreshInterval: 0,
  });
  const experiences = expData?.experiences || [];
  const participations = partData?.participations || [];
  const refreshExp = () => mutateExp();
  const refreshPart = () => mutatePart();
  
  // Update URL when tab changes
  const handleTabChange = (tab: "experience" | "participation") => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.push(`?${params.toString()}`, { scroll: false });
  };
  
  // Experience State
  const [showExpForm, setShowExpForm] = useState(false);
  const [expFormData, setExpFormData] = useState<Experience>({
    company: "",
    role: "",
    description: "",
    startDate: "",
    endDate: "",
    current: false,
    location: "",
    responsibilities: [],
    skills: [],
  });
  const [expInput, setExpInput] = useState({ responsibility: "", skill: "" });

  // Participation State
  const [showPartForm, setShowPartForm] = useState(false);
  const [partFormData, setPartFormData] = useState<Participation>({
    title: "",
    organization: "",
    role: "",
    startDate: "",
    endDate: "",
    current: false,
    location: "",
    description: "",
    impact: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [deletingExp, setDeletingExp] = useState<string | null>(null);
  const [deletingPart, setDeletingPart] = useState<string | null>(null);
  const [selectedExperiences, setSelectedExperiences] = useState<Set<string>>(new Set());
  const [selectedParticipations, setSelectedParticipations] = useState<Set<string>>(new Set());
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [editingParticipation, setEditingParticipation] = useState<Participation | null>(null);
  const loading = expLoading || partLoading;

  // Experience Handlers
  const handleExpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = expFormData._id ? "/api/experience" : "/api/experience";
      const method = expFormData._id ? "PUT" : "POST";
      
      // Prepare data - convert empty strings to undefined for optional fields
      const submitData = {
        ...expFormData,
        endDate: expFormData.endDate && expFormData.endDate.trim() ? expFormData.endDate : undefined,
        location: expFormData.location && expFormData.location.trim() ? expFormData.location : undefined,
        description: expFormData.description && expFormData.description.trim() ? expFormData.description : undefined,
      };
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        toast.success(expFormData._id ? "Experience updated!" : "Experience added!");
        setShowExpForm(false);
        setEditingExperience(null);
        resetExpForm();
        // Force revalidation by clearing cache and refetching
        await refreshExp();
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.error || "Failed to save experience");
      }
    } catch (error) {
      console.error("Error saving experience:", error);
      toast.error("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExp = async (id: string) => {
    setDeletingExp(id);
    try {
      const response = await fetch(`/api/experience/${id}`, { method: "DELETE" });
      if (response.ok) {
        toast.success("Experience deleted!");
        setSelectedExperiences((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        await refreshExp();
      } else {
        toast.error("Failed to delete experience");
      }
    } catch (error) {
      console.error("Error deleting experience:", error);
      toast.error("An error occurred");
    } finally {
      setDeletingExp(null);
    }
  };

  const handleEditExp = (exp: Experience) => {
    // Format dates for date inputs (YYYY-MM-DD format)
    const formatDateForInput = (date: string | Date | undefined): string => {
      if (!date) return "";
      try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return "";
        // Get local date in YYYY-MM-DD format
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      } catch {
        return "";
      }
    };

    setEditingExperience(exp);
    setExpFormData({
      ...exp,
      startDate: formatDateForInput(exp.startDate),
      endDate: formatDateForInput(exp.endDate),
    });
  };

  const resetExpForm = () => {
    setExpFormData({
      company: "",
      role: "",
      description: "",
      startDate: "",
      endDate: "",
      current: false,
      location: "",
      responsibilities: [],
      skills: [],
    });
    setExpInput({ responsibility: "", skill: "" });
  };

  const addResponsibility = () => {
    if (expInput.responsibility.trim()) {
      setExpFormData({
        ...expFormData,
        responsibilities: [...expFormData.responsibilities, expInput.responsibility.trim()],
      });
      setExpInput({ ...expInput, responsibility: "" });
    }
  };

  const removeResponsibility = (index: number) => {
    setExpFormData({
      ...expFormData,
      responsibilities: expFormData.responsibilities.filter((_, i) => i !== index),
    });
  };

  const addSkill = () => {
    if (expInput.skill.trim()) {
      setExpFormData({
        ...expFormData,
        skills: [...expFormData.skills, expInput.skill.trim()],
      });
      setExpInput({ ...expInput, skill: "" });
    }
  };

  const removeSkill = (index: number) => {
    setExpFormData({
      ...expFormData,
      skills: expFormData.skills.filter((_, i) => i !== index),
    });
  };

  // Participation Handlers
  const handlePartSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = partFormData._id ? "/api/participation" : "/api/participation";
      const method = partFormData._id ? "PUT" : "POST";
      
      // Prepare data - convert empty strings to undefined for optional fields
      const submitData = {
        ...partFormData,
        endDate: partFormData.endDate && partFormData.endDate.trim() ? partFormData.endDate : undefined,
        location: partFormData.location && partFormData.location.trim() ? partFormData.location : undefined,
        description: partFormData.description && partFormData.description.trim() ? partFormData.description : undefined,
        impact: partFormData.impact && partFormData.impact.trim() ? partFormData.impact : undefined,
      };
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        toast.success(partFormData._id ? "Activity updated!" : "Activity added!");
        setShowPartForm(false);
        setEditingParticipation(null);
        resetPartForm();
        // Force revalidation by clearing cache and refetching
        await refreshPart();
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.error || "Failed to save activity");
      }
    } catch (error) {
      console.error("Error saving activity:", error);
      toast.error("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePart = async (id: string) => {
    setDeletingPart(id);
    try {
      const response = await fetch(`/api/participation/${id}`, { method: "DELETE" });
      if (response.ok) {
        toast.success("Activity deleted!");
        setSelectedParticipations((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        await refreshPart();
      } else {
        toast.error("Failed to delete activity");
      }
    } catch (error) {
      console.error("Error deleting activity:", error);
      toast.error("An error occurred");
    } finally {
      setDeletingPart(null);
    }
  };

  const handleEditPart = (part: Participation) => {
    // Format dates for date inputs (YYYY-MM-DD format)
    const formatDateForInput = (date: string | Date | undefined): string => {
      if (!date) return "";
      try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return "";
        // Get local date in YYYY-MM-DD format
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      } catch {
        return "";
      }
    };

    setEditingParticipation(part);
    setPartFormData({
      ...part,
      startDate: formatDateForInput(part.startDate),
      endDate: formatDateForInput(part.endDate),
    });
  };

  const resetPartForm = () => {
    setPartFormData({
      title: "",
      organization: "",
      role: "",
      startDate: "",
      endDate: "",
      current: false,
      location: "",
      description: "",
      impact: "",
    });
  };

  // Experience Selection Handlers
  const handleToggleSelectExp = (id: string) => {
    setSelectedExperiences((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAllExp = () => {
    if (selectedExperiences.size === experiences.length) {
      setSelectedExperiences(new Set());
    } else {
      setSelectedExperiences(new Set(experiences.map((e: Experience) => e._id!)));
    }
  };

  const handleBulkDeleteExp = async () => {
    if (selectedExperiences.size === 0) return;
    try {
      const response = await fetch("/api/experience/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedExperiences) }),
      });
      if (response.ok) {
        const data = await response.json();
        toast.success(`${data.deletedCount} experience(s) deleted successfully!`);
        setSelectedExperiences(new Set());
        await refreshExp();
      } else {
        toast.error("Failed to delete experiences");
      }
    } catch (error) {
      console.error("Error bulk deleting experiences:", error);
      toast.error("An error occurred");
    }
  };

  // Participation Selection Handlers
  const handleToggleSelectPart = (id: string) => {
    setSelectedParticipations((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAllPart = () => {
    if (selectedParticipations.size === participations.length) {
      setSelectedParticipations(new Set());
    } else {
      setSelectedParticipations(new Set(participations.map((p: Participation) => p._id!)));
    }
  };

  const handleBulkDeletePart = async () => {
    if (selectedParticipations.size === 0) return;
    try {
      const response = await fetch("/api/participation/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedParticipations) }),
      });
      if (response.ok) {
        const data = await response.json();
        toast.success(`${data.deletedCount} participation(s) deleted successfully!`);
        setSelectedParticipations(new Set());
        await refreshPart();
      } else {
        toast.error("Failed to delete participations");
      }
    } catch (error) {
      console.error("Error bulk deleting participations:", error);
      toast.error("An error occurred");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-3 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold">Experience & Activities</h1>
            <p className="text-muted-foreground mt-2 text-sm md:text-base">
              Manage work experience and participation activities
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-col md:flex-row gap-2 border-b border-border mb-6 md:mb-8">
          <Button
            variant="ghost"
            className={`rounded-none border-b-2 md:border-b-2 justify-start md:justify-center text-sm md:text-base ${
              activeTab === "experience"
                ? "border-primary text-primary"
                : "border-transparent"
            }`}
            onClick={() => handleTabChange("experience")}
          >
            <Briefcase className="h-4 w-4 mr-2" />
            Work Experience ({experiences.length})
          </Button>
          <Button
            variant="ghost"
            className={`rounded-none border-b-2 md:border-b-2 justify-start md:justify-center text-sm md:text-base ${
              activeTab === "participation"
                ? "border-primary text-primary"
                : "border-transparent"
            }`}
            onClick={() => handleTabChange("participation")}
          >
            <Users className="h-4 w-4 mr-2" />
            Participation ({participations.length})
          </Button>
        </div>

        {/* Experience Tab */}
        {activeTab === "experience" && (
          <div>
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6 md:mb-8">
              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                {selectedExperiences.size > 0 && (
                  <>
                    <span className="flex items-center text-xs md:text-sm text-muted-foreground">
                      {selectedExperiences.size} selected
                    </span>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="gap-2 text-xs md:text-sm">
                          <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                          Delete ({selectedExperiences.size})
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Selected Experiences</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete {selectedExperiences.size} experience(s)? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleBulkDeleteExp}
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
                  onClick={handleSelectAllExp}
                  className="gap-2 text-xs md:text-sm"
                >
                  {selectedExperiences.size === experiences.length && experiences.length > 0 ? (
                    <>
                      <Square className="h-3 w-3 md:h-4 md:w-4" /> Deselect All
                    </>
                  ) : (
                    <>
                      <CheckSquare className="h-3 w-3 md:h-4 md:w-4" /> Select All
                    </>
                  )}
                </Button>
              </div>
              <Button 
                onClick={() => {
                  if (showExpForm) {
                    resetExpForm();
                  }
                  setShowExpForm(!showExpForm);
                }} 
                className="gap-2 text-xs md:text-sm w-full md:w-auto"
              >
                {showExpForm ? (
                  <>
                    <X className="h-3 w-3 md:h-4 md:w-4" /> Cancel
                  </>
                ) : (
                  <>
                    <Plus className="h-3 w-3 md:h-4 md:w-4" /> Add Experience
                  </>
                )}
              </Button>
            </div>

          {/* Edit Experience Dialog */}
          <Dialog open={!!editingExperience} onOpenChange={(open) => { if (!open) { setEditingExperience(null); } }}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Work Experience</DialogTitle>
                <DialogDescription>Update experience details below</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleExpSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-exp-company">Company *</Label>
                    <Input
                      id="edit-exp-company"
                      value={expFormData.company}
                      onChange={(e) => setExpFormData({ ...expFormData, company: e.target.value })}
                      placeholder="Company Name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-exp-role">Role *</Label>
                    <Input
                      id="edit-exp-role"
                      value={expFormData.role}
                      onChange={(e) => setExpFormData({ ...expFormData, role: e.target.value })}
                      placeholder="Job Title"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-exp-location">Location</Label>
                    <Input
                      id="edit-exp-location"
                      value={expFormData.location}
                      onChange={(e) => setExpFormData({ ...expFormData, location: e.target.value })}
                      placeholder="City, Country"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-exp-startDate">Start Date *</Label>
                    <Input
                      id="edit-exp-startDate"
                      type="date"
                      value={expFormData.startDate}
                      onChange={(e) => setExpFormData({ ...expFormData, startDate: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-exp-endDate">End Date</Label>
                    <Input
                      id="edit-exp-endDate"
                      type="date"
                      value={expFormData.endDate}
                      onChange={(e) => setExpFormData({ ...expFormData, endDate: e.target.value })}
                      disabled={expFormData.current}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="edit-exp-current"
                    checked={expFormData.current}
                    onChange={(e) => setExpFormData({ ...expFormData, current: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="edit-exp-current" className="cursor-pointer">Currently Working Here</Label>
                </div>
                <div>
                  <Label htmlFor="edit-exp-description">Description</Label>
                  <Textarea
                    id="edit-exp-description"
                    value={expFormData.description}
                    onChange={(e) => setExpFormData({ ...expFormData, description: e.target.value })}
                    placeholder="Brief description"
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Responsibilities</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={expInput.responsibility}
                      onChange={(e) => setExpInput({ ...expInput, responsibility: e.target.value })}
                      placeholder="Add responsibility..."
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (expInput.responsibility.trim()) {
                            setExpFormData({
                              ...expFormData,
                              responsibilities: [...expFormData.responsibilities, expInput.responsibility.trim()],
                            });
                            setExpInput({ ...expInput, responsibility: "" });
                          }
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      onClick={() => {
                        if (expInput.responsibility.trim()) {
                          setExpFormData({
                            ...expFormData,
                            responsibilities: [...expFormData.responsibilities, expInput.responsibility.trim()],
                          });
                          setExpInput({ ...expInput, responsibility: "" });
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {expFormData.responsibilities.map((resp, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-secondary p-2 rounded"
                      >
                        <span className="flex-1 text-sm">{resp}</span>
                        <button
                          type="button"
                          onClick={() => setExpFormData({
                            ...expFormData,
                            responsibilities: expFormData.responsibilities.filter((_, i) => i !== index),
                          })}
                          className="text-destructive hover:text-destructive/80"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Skills</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={expInput.skill}
                      onChange={(e) => setExpInput({ ...expInput, skill: e.target.value })}
                      placeholder="Add skill..."
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (expInput.skill.trim()) {
                            setExpFormData({
                              ...expFormData,
                              skills: [...expFormData.skills, expInput.skill.trim()],
                            });
                            setExpInput({ ...expInput, skill: "" });
                          }
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      onClick={() => {
                        if (expInput.skill.trim()) {
                          setExpFormData({
                            ...expFormData,
                            skills: [...expFormData.skills, expInput.skill.trim()],
                          });
                          setExpInput({ ...expInput, skill: "" });
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {expFormData.skills.map((skill, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-secondary p-2 rounded"
                      >
                        <span className="flex-1 text-sm">{skill}</span>
                        <button
                          type="button"
                          onClick={() => setExpFormData({
                            ...expFormData,
                            skills: expFormData.skills.filter((_, i) => i !== index),
                          })}
                          className="text-destructive hover:text-destructive/80"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 justify-end pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingExperience(null)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    <Save className="mr-2 h-4 w-4" />
                    {submitting ? "Saving..." : "Update Experience"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {showExpForm && (
            <Card ref={formRef}>
              <CardHeader>
                <CardTitle>{expFormData._id ? "Edit" : "Add"} Work Experience</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleExpSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="company">Company *</Label>
                      <Input
                        id="company"
                        value={expFormData.company}
                        onChange={(e) =>
                          setExpFormData({ ...expFormData, company: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="role">Role/Position *</Label>
                      <Input
                        id="role"
                        value={expFormData.role}
                        onChange={(e) =>
                          setExpFormData({ ...expFormData, role: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="startDate">Start Date *</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={expFormData.startDate}
                        onChange={(e) =>
                          setExpFormData({ ...expFormData, startDate: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={expFormData.endDate}
                        onChange={(e) =>
                          setExpFormData({ ...expFormData, endDate: e.target.value })
                        }
                        disabled={expFormData.current}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={expFormData.location}
                        onChange={(e) =>
                          setExpFormData({ ...expFormData, location: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="current"
                      checked={expFormData.current}
                      onChange={(e) =>
                        setExpFormData({ ...expFormData, current: e.target.checked })
                      }
                      className="h-4 w-4 rounded border-gray-300"
                      aria-label="Currently working here"
                    />
                    <Label htmlFor="current" className="cursor-pointer">
                      I currently work here
                    </Label>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={expFormData.description}
                      onChange={(e) =>
                        setExpFormData({ ...expFormData, description: e.target.value })
                      }
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label>Responsibilities</Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={expInput.responsibility}
                        onChange={(e) =>
                          setExpInput({ ...expInput, responsibility: e.target.value })
                        }
                        placeholder="Add responsibility..."
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addResponsibility())}
                      />
                      <Button type="button" onClick={addResponsibility}>
                        Add
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {expFormData.responsibilities.map((resp, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 bg-secondary p-2 rounded"
                        >
                          <span className="flex-1 text-sm">{resp}</span>
                          <button
                            type="button"
                            onClick={() => removeResponsibility(index)}
                            className="text-destructive hover:text-destructive/80"
                            aria-label={`Remove ${resp}`}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Skills</Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={expInput.skill}
                        onChange={(e) =>
                          setExpInput({ ...expInput, skill: e.target.value })
                        }
                        placeholder="Add skill..."
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                      />
                      <Button type="button" onClick={addSkill}>
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {expFormData.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-secondary rounded-full text-sm flex items-center gap-1"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(index)}
                            className="hover:text-destructive"
                            aria-label={`Remove ${skill}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={submitting}>
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Experience
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowExpForm(false);
                        resetExpForm();
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

            {/* Experience List */}
            <div className="space-y-4">
              {experiences.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      No experience added yet. Click &ldquo;Add Experience&rdquo; to get started!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                experiences.map((exp: Experience) => (
                  <Card key={exp._id} className={selectedExperiences.has(exp._id!) ? "ring-2 ring-primary" : ""}>
                    <CardHeader className="p-4 md:p-6">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3 md:gap-2">
                        <div className="flex items-start gap-2 md:gap-4 min-w-0 flex-1">
                          <button
                            type="button"
                            onClick={() => exp._id && handleToggleSelectExp(exp._id)}
                            className="mt-0.5 md:mt-1 flex-shrink-0"
                          >
                            {selectedExperiences.has(exp._id!) ? (
                              <CheckSquare className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                            ) : (
                              <Square className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground hover:text-foreground" />
                            )}
                          </button>
                          <div className="bg-primary/10 p-2 md:p-3 rounded-lg flex-shrink-0">
                            <Briefcase className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <CardTitle className="text-base md:text-lg break-words">{exp.role}</CardTitle>
                            <CardDescription className="mt-1 text-xs md:text-sm break-words">
                              {exp.company}
                            </CardDescription>
                            <p className="text-xs md:text-sm text-muted-foreground mt-1 break-words">
                              {format(new Date(exp.startDate), "MMM yyyy")} -{" "}
                              {exp.current ? "Present" : exp.endDate ? format(new Date(exp.endDate), "MMM yyyy") : "N/A"}
                              {exp.location && ` • ${exp.location}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1 md:gap-2 flex-shrink-0 self-start">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEditExp(exp)}
                            title="Edit"
                            className="h-8 w-8 md:h-10 md:w-10"
                          >
                            <Pencil className="h-3 w-3 md:h-4 md:w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                title="Delete"
                                disabled={deletingExp === exp._id}
                                className="h-8 w-8 md:h-10 md:w-10"
                              >
                                {deletingExp === exp._id ? (
                                  <Loader2 className="h-3 w-3 md:h-4 md:w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Experience</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete &ldquo;{exp.role} at {exp.company}&rdquo;?
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => exp._id && handleDeleteExp(exp._id)}
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
                    {(exp.description || (exp.responsibilities && exp.responsibilities.length > 0) || (exp.skills && exp.skills.length > 0)) && (
                      <CardContent className="p-4 md:p-6">
                        {exp.description && (
                          <p className="text-xs md:text-sm text-muted-foreground whitespace-pre-line mb-3 break-words">
                            {exp.description}
                          </p>
                        )}
                        {exp.responsibilities && exp.responsibilities.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs md:text-sm font-semibold text-foreground mb-2">
                              Key Responsibilities:
                            </p>
                            <ul className="list-disc list-inside space-y-1">
                              {exp.responsibilities.map((resp, idx) => (
                                <li key={idx} className="text-xs md:text-sm text-muted-foreground break-words">
                                  {resp}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {exp.skills && exp.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 md:gap-2">
                            {exp.skills.map((skill, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 md:py-1 bg-primary/10 text-primary rounded text-[10px] md:text-xs break-words"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {/* Participation Tab */}
        {activeTab === "participation" && (
          <div>
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6 md:mb-8">
              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                {selectedParticipations.size > 0 && (
                  <>
                    <span className="flex items-center text-xs md:text-sm text-muted-foreground">
                      {selectedParticipations.size} selected
                    </span>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="gap-2 text-xs md:text-sm">
                          <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                          Delete ({selectedParticipations.size})
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Selected Participations</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete {selectedParticipations.size} participation(s)? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleBulkDeletePart}
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
                  onClick={handleSelectAllPart}
                  className="gap-2 text-xs md:text-sm"
                >
                  {selectedParticipations.size === participations.length && participations.length > 0 ? (
                    <>
                      <Square className="h-3 w-3 md:h-4 md:w-4" /> Deselect All
                    </>
                  ) : (
                    <>
                      <CheckSquare className="h-3 w-3 md:h-4 md:w-4" /> Select All
                    </>
                  )}
                </Button>
              </div>
              <Button 
                onClick={() => {
                  if (showPartForm) {
                    resetPartForm();
                  }
                  setShowPartForm(!showPartForm);
                }} 
                className="gap-2 text-xs md:text-sm w-full md:w-auto"
              >
                {showPartForm ? (
                  <>
                    <X className="h-3 w-3 md:h-4 md:w-4" /> Cancel
                  </>
                ) : (
                  <>
                    <Plus className="h-3 w-3 md:h-4 md:w-4" /> Add Activity
                  </>
                )}
              </Button>
            </div>

          {/* Edit Participation Dialog */}
          <Dialog open={!!editingParticipation} onOpenChange={(open) => { if (!open) { setEditingParticipation(null); } }}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Participation Activity</DialogTitle>
                <DialogDescription>Update activity details below</DialogDescription>
              </DialogHeader>
              <form onSubmit={handlePartSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-part-title">Activity Title *</Label>
                    <Input
                      id="edit-part-title"
                      value={partFormData.title}
                      onChange={(e) => setPartFormData({ ...partFormData, title: e.target.value })}
                      placeholder="Activity Name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-part-organization">Organization *</Label>
                    <Input
                      id="edit-part-organization"
                      value={partFormData.organization}
                      onChange={(e) => setPartFormData({ ...partFormData, organization: e.target.value })}
                      placeholder="Organization Name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-part-role">Role *</Label>
                    <Input
                      id="edit-part-role"
                      value={partFormData.role}
                      onChange={(e) => setPartFormData({ ...partFormData, role: e.target.value })}
                      placeholder="Your Role"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-part-location">Location</Label>
                    <Input
                      id="edit-part-location"
                      value={partFormData.location}
                      onChange={(e) => setPartFormData({ ...partFormData, location: e.target.value })}
                      placeholder="City, Country"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-part-startDate">Start Date *</Label>
                    <Input
                      id="edit-part-startDate"
                      type="date"
                      value={partFormData.startDate}
                      onChange={(e) => setPartFormData({ ...partFormData, startDate: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-part-endDate">End Date</Label>
                    <Input
                      id="edit-part-endDate"
                      type="date"
                      value={partFormData.endDate}
                      onChange={(e) => setPartFormData({ ...partFormData, endDate: e.target.value })}
                      disabled={partFormData.current}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="edit-part-current"
                    checked={partFormData.current}
                    onChange={(e) => setPartFormData({ ...partFormData, current: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="edit-part-current" className="cursor-pointer">Currently Active</Label>
                </div>
                <div>
                  <Label htmlFor="edit-part-description">Description *</Label>
                  <Textarea
                    id="edit-part-description"
                    value={partFormData.description}
                    onChange={(e) => setPartFormData({ ...partFormData, description: e.target.value })}
                    placeholder="Describe the activity"
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-part-impact">Impact</Label>
                  <Textarea
                    id="edit-part-impact"
                    value={partFormData.impact}
                    onChange={(e) => setPartFormData({ ...partFormData, impact: e.target.value })}
                    placeholder="Impact and achievements"
                    rows={2}
                  />
                </div>
                <div className="flex gap-2 justify-end pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingParticipation(null)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    <Save className="mr-2 h-4 w-4" />
                    {submitting ? "Saving..." : "Update Activity"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {showPartForm && (
            <Card ref={formRef}>
              <CardHeader>
                <CardTitle>{partFormData._id ? "Edit" : "Add"} Participation Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePartSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Activity Title *</Label>
                      <Input
                        id="title"
                        value={partFormData.title}
                        onChange={(e) =>
                          setPartFormData({ ...partFormData, title: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="organization">Organization *</Label>
                      <Input
                        id="organization"
                        value={partFormData.organization}
                        onChange={(e) =>
                          setPartFormData({
                            ...partFormData,
                            organization: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="partRole">Your Role *</Label>
                      <Input
                        id="partRole"
                        value={partFormData.role}
                        onChange={(e) =>
                          setPartFormData({ ...partFormData, role: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="partLocation">Location</Label>
                      <Input
                        id="partLocation"
                        value={partFormData.location}
                        onChange={(e) =>
                          setPartFormData({ ...partFormData, location: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="partStartDate">Start Date *</Label>
                      <Input
                        id="partStartDate"
                        type="date"
                        value={partFormData.startDate}
                        onChange={(e) =>
                          setPartFormData({ ...partFormData, startDate: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="partEndDate">End Date</Label>
                      <Input
                        id="partEndDate"
                        type="date"
                        value={partFormData.endDate}
                        onChange={(e) =>
                          setPartFormData({ ...partFormData, endDate: e.target.value })
                        }
                        disabled={partFormData.current}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="partCurrent"
                      checked={partFormData.current}
                      onChange={(e) =>
                        setPartFormData({ ...partFormData, current: e.target.checked })
                      }
                      className="h-4 w-4 rounded border-gray-300"
                      aria-label="Currently participating"
                    />
                    <Label htmlFor="partCurrent" className="cursor-pointer">
                      Currently participating
                    </Label>
                  </div>

                  <div>
                    <Label htmlFor="partDescription">Description</Label>
                    <Textarea
                      id="partDescription"
                      value={partFormData.description}
                      onChange={(e) =>
                        setPartFormData({ ...partFormData, description: e.target.value })
                      }
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="impact">Impact/Achievement</Label>
                    <Textarea
                      id="impact"
                      value={partFormData.impact}
                      onChange={(e) =>
                        setPartFormData({ ...partFormData, impact: e.target.value })
                      }
                      rows={2}
                      placeholder="Describe the impact of your participation..."
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={submitting}>
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Activity
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowPartForm(false);
                        resetPartForm();
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

            {/* Participation List */}
            <div className="space-y-4">
              {participations.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      No activities added yet. Click &ldquo;Add Activity&rdquo; to get started!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                participations.map((part: Participation) => (
                  <Card key={part._id} className={selectedParticipations.has(part._id!) ? "ring-2 ring-primary" : ""}>
                    <CardHeader className="p-4 md:p-6">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3 md:gap-2">
                        <div className="flex items-start gap-2 md:gap-4 min-w-0 flex-1">
                          <button
                            type="button"
                            onClick={() => part._id && handleToggleSelectPart(part._id)}
                            className="mt-0.5 md:mt-1 flex-shrink-0"
                          >
                            {selectedParticipations.has(part._id!) ? (
                              <CheckSquare className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                            ) : (
                              <Square className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground hover:text-foreground" />
                            )}
                          </button>
                          <div className="bg-primary/10 p-2 md:p-3 rounded-lg flex-shrink-0">
                            <Users className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <CardTitle className="text-base md:text-lg break-words">{part.title}</CardTitle>
                            <CardDescription className="mt-1 text-xs md:text-sm break-words">
                              {part.organization} • {part.role}
                            </CardDescription>
                            <p className="text-xs md:text-sm text-muted-foreground mt-1 break-words">
                              {format(new Date(part.startDate), "MMM yyyy")} -{" "}
                              {part.current ? "Present" : part.endDate ? format(new Date(part.endDate), "MMM yyyy") : "N/A"}
                              {part.location && ` • ${part.location}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1 md:gap-2 flex-shrink-0 self-start">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEditPart(part)}
                            title="Edit"
                            className="h-8 w-8 md:h-10 md:w-10"
                          >
                            <Pencil className="h-3 w-3 md:h-4 md:w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                title="Delete"
                                disabled={deletingPart === part._id}
                                className="h-8 w-8 md:h-10 md:w-10"
                              >
                                {deletingPart === part._id ? (
                                  <Loader2 className="h-3 w-3 md:h-4 md:w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Activity</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete &ldquo;{part.title}&rdquo;?
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => part._id && handleDeletePart(part._id)}
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
                    {(part.description || part.impact) && (
                      <CardContent className="p-4 md:p-6">
                        {part.description && (
                          <p className="text-xs md:text-sm text-muted-foreground whitespace-pre-line mb-3 break-words">
                            {part.description}
                          </p>
                        )}
                        {part.impact && (
                          <div className="pt-3 border-t border-border">
                            <p className="text-xs md:text-sm font-semibold text-foreground mb-2">Impact:</p>
                            <span className="inline-block px-2 md:px-3 py-0.5 md:py-1 bg-primary/10 text-primary rounded-md text-xs md:text-sm font-medium break-words">
                              {part.impact}
                            </span>
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Card>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
