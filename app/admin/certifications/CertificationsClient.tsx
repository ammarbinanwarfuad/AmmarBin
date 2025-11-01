"use client";

import { useMemo, useState, useRef } from "react";
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Award,
  Plus,
  X,
  Save,
  Loader2,
  ExternalLink,
  Calendar,
  Trash2,
  Star,
  HelpCircle,
  Eye,
  EyeOff,
  CheckSquare,
  Square,
} from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { ImageUpload } from "@/components/ImageUpload";
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

interface Certificate {
  _id?: string;
  title: string;
  issuer: string;
  category: string;
  issueDate: string;
  expiryDate: string;
  credentialId: string;
  verificationUrl: string;
  certificateImage: string;
  skills: string[];
  description: string;
  featured: boolean;
  published: boolean;
  order: number;
}

export function CertificationsClient({ initialCertifications }: { initialCertifications: Certificate[] }) {
  const formRef = useRef<HTMLDivElement>(null);
  const { data, isLoading, mutate } = useSWR('/api/certifications', fetcher, {
    fallbackData: { certifications: initialCertifications },
    revalidateOnMount: false,
    refreshInterval: 0,
  });
  const certifications = useMemo(() => data?.certifications || initialCertifications, [data?.certifications, initialCertifications]);
  const refresh = () => mutate();
  // Use useMemo to compute categories from certifications to prevent infinite loops
  const existingCategories = useMemo(() => {
    if (!certifications || certifications.length === 0) return [];
    return Array.from(
      new Set(certifications.map((cert: Certificate) => cert.category).filter(Boolean))
    ).sort() as string[];
  }, [certifications]);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showCategoryTooltip, setShowCategoryTooltip] = useState(false);
  const [selectedCertificates, setSelectedCertificates] = useState<Set<string>>(new Set());
  const [editingCertificate, setEditingCertificate] = useState<Certificate | null>(null);
  const [formData, setFormData] = useState<Certificate>({
    title: "",
    issuer: "",
    category: "",
    issueDate: "",
    expiryDate: "",
    credentialId: "",
    verificationUrl: "",
    certificateImage: "",
    skills: [],
    description: "",
    featured: false,
    published: true,
    order: 0,
  });
  const [skillInput, setSkillInput] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = "/api/certifications";
      const method = formData._id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to save certification");

      toast.success(
        formData._id
          ? "Certification updated successfully"
          : "Certification added successfully"
      );
      setShowForm(false);
      setEditingCertificate(null);
      resetForm();
      refresh();
    } catch (error) {
      console.error("Error saving certification:", error);
      toast.error("Failed to save certification");
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    const newPublishedStatus = !currentStatus;
    
    // Optimistically update the cache immediately (before API call)
    mutate((currentData: { certifications?: Certificate[] } | undefined) => {
      if (currentData?.certifications) {
        return {
          ...currentData,
          certifications: currentData.certifications.map((c: Certificate) =>
            c._id === id ? { ...c, published: newPublishedStatus } : c
          ),
        };
      }
      return currentData;
    }, { revalidate: false });
    
    toast.success(`Certification ${newPublishedStatus ? "published" : "unpublished"} successfully!`);
    
    try {
      const response = await fetch(`/api/certifications/${id}/publish`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: newPublishedStatus }),
      });

      if (response.ok) {
        // Refresh in background without blocking
        setTimeout(() => {
          refresh();
        }, 100);
      } else {
        // Revert on error
        mutate((currentData: { certifications?: Certificate[] } | undefined) => {
          if (currentData?.certifications) {
            return {
              ...currentData,
              certifications: currentData.certifications.map((c: Certificate) =>
                c._id === id ? { ...c, published: currentStatus } : c
              ),
            };
          }
          return currentData;
        }, { revalidate: false });
        
        const errorData = await response.json().catch(() => ({ error: "Failed to update certificate status" }));
        toast.error(errorData.error || "Failed to update certificate status");
      }
    } catch (error) {
      // Revert on error
      mutate((currentData: { certifications?: Certificate[] } | undefined) => {
        if (currentData?.certifications) {
          return {
            ...currentData,
            certifications: currentData.certifications.map((c: Certificate) =>
              c._id === id ? { ...c, published: currentStatus } : c
            ),
          };
        }
        return currentData;
      }, { revalidate: false });
      
      console.error("Error toggling publish status:", error);
      toast.error("An error occurred");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/certifications/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete certification");

      toast.success("Certification deleted successfully");
      setSelectedCertificates((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      refresh();
    } catch (error) {
      console.error("Error deleting certification:", error);
      toast.error("Failed to delete certification");
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedCertificates((prev) => {
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
    if (selectedCertificates.size === certifications.length) {
      setSelectedCertificates(new Set());
    } else {
      setSelectedCertificates(new Set(certifications.map((c: Certificate) => c._id!)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedCertificates.size === 0) return;
    try {
      const response = await fetch("/api/certifications/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedCertificates) }),
      });
      if (response.ok) {
        const data = await response.json();
        toast.success(`${data.deletedCount} certificate(s) deleted successfully!`);
        setSelectedCertificates(new Set());
        refresh();
      } else {
        toast.error("Failed to delete certifications");
      }
    } catch (error) {
      console.error("Error bulk deleting certifications:", error);
      toast.error("An error occurred");
    }
  };

  const handleEdit = (cert: Certificate) => {
    setEditingCertificate(cert);
    setFormData({
      ...cert,
      issueDate: cert.issueDate
        ? format(new Date(cert.issueDate), "yyyy-MM-dd")
        : "",
      expiryDate: cert.expiryDate
        ? format(new Date(cert.expiryDate), "yyyy-MM-dd")
        : "",
    });
  };

  const resetForm = () => {
    setFormData({
      title: "",
      issuer: "",
      category: "",
      issueDate: "",
      expiryDate: "",
      credentialId: "",
      verificationUrl: "",
      certificateImage: "",
      skills: [],
      description: "",
      featured: false,
      published: true,
      order: 0,
    });
    setSkillInput("");
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skillInput.trim()],
      });
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skill),
    });
  };

  // Show skeleton while loading
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
            <h1 className="text-4xl font-bold">Certifications</h1>
            <p className="text-muted-foreground mt-2">
              Manage your professional certifications and credentials
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {selectedCertificates.size > 0 && (
              <>
                <span className="flex items-center text-sm text-muted-foreground whitespace-nowrap">
                  {selectedCertificates.size} selected
                </span>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="gap-2 text-sm">
                      <Trash2 className="h-4 w-4" />
                      Delete Selected ({selectedCertificates.size})
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Selected Certifications</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete {selectedCertificates.size} certificate(s)? This action cannot be undone.
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
              {selectedCertificates.size === certifications.length && certifications.length > 0 ? (
                <>
                  <Square className="h-4 w-4" /> Deselect All
                </>
              ) : (
                <>
                  <CheckSquare className="h-4 w-4" /> Select All
                </>
              )}
            </Button>
            <Button onClick={() => setShowForm(!showForm)} className="gap-2 text-sm">
              {showForm ? (
                <>
                  <X className="h-4 w-4" /> Cancel
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" /> Add Certification
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Edit Dialog */}
        <Dialog open={!!editingCertificate} onOpenChange={(open) => { if (!open) { setEditingCertificate(null); } }}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Certification</DialogTitle>
              <DialogDescription>Update certification details below</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-title">Certificate Title *</Label>
                  <Input
                    id="edit-title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., AWS Certified Solutions Architect"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-issuer">Issuer/Organization *</Label>
                  <Input
                    id="edit-issuer"
                    value={formData.issuer}
                    onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                    placeholder="e.g., Amazon Web Services"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-category">Category *</Label>
                  <Input
                    id="edit-category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Frontend, Backend, Cloud"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-issueDate">Issue Date *</Label>
                  <Input
                    id="edit-issueDate"
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-expiryDate">Expiry Date (Optional)</Label>
                  <Input
                    id="edit-expiryDate"
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-credentialId">Credential ID</Label>
                  <Input
                    id="edit-credentialId"
                    value={formData.credentialId}
                    onChange={(e) => setFormData({ ...formData, credentialId: e.target.value })}
                    placeholder="Certificate ID"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="edit-verificationUrl">Verification URL</Label>
                  <Input
                    id="edit-verificationUrl"
                    type="url"
                    value={formData.verificationUrl}
                    onChange={(e) => setFormData({ ...formData, verificationUrl: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="edit-certificateImage">Certificate Image URL</Label>
                  <Input
                    id="edit-certificateImage"
                    type="url"
                    value={formData.certificateImage}
                    onChange={(e) => setFormData({ ...formData, certificateImage: e.target.value })}
                    placeholder="https://..."
                  />
                  <div className="mt-2">
                    <ImageUpload
                      value={formData.certificateImage}
                      onChange={(value) => setFormData({ ...formData, certificateImage: value as string })}
                      folder="certifications"
                      accept="*"
                      enableCrop={false}
                      maxSize={50}
                    />
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description"
                  rows={3}
                />
              </div>
              <div>
                <Label>Related Skills</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    placeholder="e.g., React, AWS, Docker"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
                          setFormData({ ...formData, skills: [...formData.skills, skillInput.trim()] });
                          setSkillInput("");
                        }
                      }
                    }}
                  />
                  <Button 
                    type="button" 
                    onClick={() => {
                      if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
                        setFormData({ ...formData, skills: [...formData.skills, skillInput.trim()] });
                        setSkillInput("");
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm flex items-center gap-1"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) })}
                        className="hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
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
                  <span className="text-sm">Featured</span>
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
                  onClick={() => setEditingCertificate(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  <Save className="mr-2 h-4 w-4" />
                  {submitting ? "Saving..." : "Update Certification"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Form */}
        {showForm && (
          <Card ref={formRef} className="mb-8">
            <CardHeader>
              <CardTitle>
                {formData._id ? "Edit Certification" : "Add New Certification"}
              </CardTitle>
            </CardHeader>
            <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Certificate Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="e.g., AWS Certified Solutions Architect"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="issuer">Issuer/Organization *</Label>
                  <Input
                    id="issuer"
                    value={formData.issuer}
                    onChange={(e) =>
                      setFormData({ ...formData, issuer: e.target.value })
                    }
                    placeholder="e.g., Amazon Web Services"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label htmlFor="category">Category *</Label>
                    <div className="relative">
                      <HelpCircle
                        className="h-4 w-4 text-muted-foreground cursor-help"
                        onMouseEnter={() => setShowCategoryTooltip(true)}
                        onMouseLeave={() => setShowCategoryTooltip(false)}
                      />
                      {showCategoryTooltip && existingCategories.length > 0 && (
                        <div className="absolute left-0 top-6 z-50 w-64 p-3 bg-popover border border-border rounded-md shadow-lg">
                          <p className="text-xs font-semibold mb-2">Existing Categories:</p>
                          <div className="flex flex-wrap gap-1">
                            {existingCategories.map((cat) => (
                              <span
                                key={cat}
                                className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full cursor-pointer hover:bg-primary/20"
                                onClick={() => setFormData({ ...formData, category: cat })}
                              >
                                {cat}
                              </span>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            Click to use or type your own
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    placeholder="e.g., Frontend, Backend, Cloud, Design, etc."
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter any category - filters will update dynamically
                  </p>
                </div>

                <div>
                  <Label htmlFor="issueDate">Issue Date *</Label>
                  <Input
                    id="issueDate"
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) =>
                      setFormData({ ...formData, issueDate: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) =>
                      setFormData({ ...formData, expiryDate: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="credentialId">Credential ID (Optional)</Label>
                  <Input
                    id="credentialId"
                    value={formData.credentialId}
                    onChange={(e) =>
                      setFormData({ ...formData, credentialId: e.target.value })
                    }
                    placeholder="e.g., AWS-1234567890"
                  />
                </div>

                <div>
                  <Label htmlFor="verificationUrl">
                    Verification URL (Optional)
                  </Label>
                  <Input
                    id="verificationUrl"
                    type="url"
                    value={formData.verificationUrl}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        verificationUrl: e.target.value,
                      })
                    }
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <Label htmlFor="order">Display Order</Label>
                  <Input
                    id="order"
                    type="number"
                    value={formData.order}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        order: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <Label>Certificate Image / Media</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Upload certificate image (no cropping - original size preserved)
                </p>
                <ImageUpload
                  value={formData.certificateImage}
                  onChange={(value) =>
                    setFormData({ ...formData, certificateImage: value as string })
                  }
                  folder="certifications"
                  accept="*"
                  enableCrop={false}
                  maxSize={50}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Or paste URL directly:
                </p>
                <Input
                  value={formData.certificateImage}
                  onChange={(e) =>
                    setFormData({ ...formData, certificateImage: e.target.value })
                  }
                  placeholder="https://..."
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Brief description of the certification..."
                  rows={3}
                />
              </div>

              <div>
                <Label>Related Skills</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    placeholder="e.g., React, AWS, Docker"
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                  />
                  <Button type="button" onClick={addSkill}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm flex items-center gap-1"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="hover:text-destructive"
                        aria-label={`Remove ${skill} skill`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) =>
                      setFormData({ ...formData, featured: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-gray-300"
                    aria-label="Mark as featured"
                  />
                  <Label htmlFor="featured" className="cursor-pointer">
                    Mark as Featured
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="published"
                    checked={formData.published}
                    onChange={(e) =>
                      setFormData({ ...formData, published: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-gray-300"
                    aria-label="Publish Certificate"
                  />
                  <Label htmlFor="published" className="cursor-pointer">
                    Publish Certificate
                  </Label>
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
                      {formData._id ? "Update" : "Save"} Certification
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

        {/* Certificates List */}
        {certifications.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No certifications added yet. Click &ldquo;Add Certification&rdquo; to
                get started!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {certifications.map((cert: Certificate) => {
              const isSelected = selectedCertificates.has(cert._id!);
              return (
              <Card key={cert._id} className={`${!cert.published ? "opacity-60 border-dashed" : ""} ${isSelected ? "ring-2 ring-primary" : ""}`}>
                <CardContent className="p-3 sm:p-6">
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <div className="flex gap-3 sm:gap-4 items-start">
                      <button
                        type="button"
                        onClick={() => cert._id && handleToggleSelect(cert._id)}
                        className="mt-1 flex-shrink-0"
                      >
                        {isSelected ? (
                          <CheckSquare className="h-5 w-5 text-primary" />
                        ) : (
                          <Square className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                        )}
                      </button>
                      {cert.certificateImage && (
                        <div className="relative w-24 h-18 sm:w-32 sm:h-24 flex-shrink-0">
                          <Image
                            src={cert.certificateImage}
                            alt={cert.title}
                            fill
                            className="object-cover rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-0 mb-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-base sm:text-lg text-foreground break-words">
                              {cert.title}
                            </h3>
                            {!cert.published && (
                              <span className="text-xs bg-muted px-2 py-1 rounded flex-shrink-0">Unpublished</span>
                            )}
                            {cert.featured && (
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground break-words">
                            {cert.issuer}
                          </p>
                        </div>
                        <div className="flex gap-1.5 sm:gap-2 flex-shrink-0">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => cert._id && handleTogglePublish(cert._id, cert.published)}
                            title={cert.published ? "Unpublish" : "Publish"}
                            className="h-8 w-8 sm:h-10 sm:w-10"
                          >
                            {cert.published ? (
                              <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            ) : (
                              <EyeOff className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(cert)}
                            className="text-xs sm:text-sm h-8 sm:h-9"
                          >
                            Edit
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 sm:h-10 sm:w-10"
                              >
                                <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Certification</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete &ldquo;{cert.title}&rdquo;?
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => cert._id && handleDelete(cert._id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-2">
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded flex-shrink-0">
                        {cert.category}
                      </span>
                      <span className="flex items-center gap-1 flex-shrink-0">
                        <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span className="break-all">
                          {format(new Date(cert.issueDate), "MMM yyyy")}
                          {cert.expiryDate &&
                            ` - ${format(new Date(cert.expiryDate), "MMM yyyy")}`}
                        </span>
                      </span>
                      {cert.credentialId && (
                        <span className="flex-shrink-0 break-all">ID: {cert.credentialId}</span>
                      )}
                    </div>

                    {cert.description && (
                      <p className="text-xs sm:text-sm text-muted-foreground mb-2 break-words">
                        {cert.description}
                      </p>
                    )}

                    {cert.skills && cert.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2">
                        {cert.skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs break-words"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    {cert.verificationUrl && (
                      <a
                        href={cert.verificationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs sm:text-sm text-primary hover:underline break-all"
                        aria-label="Verify certificate"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Verify Certificate
                      </a>
                    )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

