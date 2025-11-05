"use client";

import { useMemo, useState } from "react";
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
import { useCertifications } from "@/lib/hooks/useAdminData";
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

export default function AdminCertificationsPage() {
  const { certificates, isLoading, refresh, mutate } = useCertifications();
  // Use useMemo to compute categories from certificates to prevent infinite loops
  const existingCategories = useMemo(() => {
    if (!certificates || certificates.length === 0) return [];
    return Array.from(
      new Set(certificates.map((cert: Certificate) => cert.category).filter(Boolean))
    ).sort() as string[];
  }, [certificates]);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showCategoryTooltip, setShowCategoryTooltip] = useState(false);
  const [selectedCertificates, setSelectedCertificates] = useState<Set<string>>(new Set());
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
    mutate((currentData: { certificates?: Certificate[] } | undefined) => {
      if (currentData?.certificates) {
        return {
          ...currentData,
          certificates: currentData.certificates.map((c: Certificate) =>
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
        mutate((currentData: { certificates?: Certificate[] } | undefined) => {
          if (currentData?.certificates) {
            return {
              ...currentData,
              certificates: currentData.certificates.map((c: Certificate) =>
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
      mutate((currentData: { certificates?: Certificate[] } | undefined) => {
        if (currentData?.certificates) {
          return {
            ...currentData,
            certificates: currentData.certificates.map((c: Certificate) =>
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
    if (selectedCertificates.size === certificates.length) {
      setSelectedCertificates(new Set());
    } else {
      setSelectedCertificates(new Set(certificates.map((c: Certificate) => c._id!)));
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
        toast.error("Failed to delete certificates");
      }
    } catch (error) {
      console.error("Error bulk deleting certificates:", error);
      toast.error("An error occurred");
    }
  };

  const handleEdit = (cert: Certificate) => {
    setFormData({
      ...cert,
      issueDate: cert.issueDate
        ? format(new Date(cert.issueDate), "yyyy-MM-dd")
        : "",
      expiryDate: cert.expiryDate
        ? format(new Date(cert.expiryDate), "yyyy-MM-dd")
        : "",
    });
    setShowForm(true);
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

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">Certifications</h1>
            <p className="text-muted-foreground mt-2">
              Manage your professional certifications and credentials
            </p>
          </div>
          <div className="flex items-center gap-3">
            {selectedCertificates.size > 0 && (
              <>
                <span className="flex items-center text-sm text-muted-foreground">
                  {selectedCertificates.size} selected
                </span>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="gap-2">
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
              className="gap-2"
            >
              {selectedCertificates.size === certificates.length && certificates.length > 0 ? (
                <>
                  <Square className="h-4 w-4" /> Deselect All
                </>
              ) : (
                <>
                  <CheckSquare className="h-4 w-4" /> Select All
                </>
              )}
            </Button>
            <Button onClick={() => setShowForm(!showForm)} className="gap-2">
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

        {/* Form */}
        {showForm && (
          <Card className="mb-8">
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
                  Upload any file type (images, PDFs, videos - crop optional)
                </p>
                <ImageUpload
                  value={formData.certificateImage}
                  onChange={(value) =>
                    setFormData({ ...formData, certificateImage: value as string })
                  }
                  folder="certifications"
                  accept="*"
                  enableCrop={true}
                  cropAspect={3 / 2}
                  maxSize={50}
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
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[calc(100vh-300px)]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : certificates.length === 0 ? (
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
            {certificates.map((cert: Certificate) => {
              const isSelected = selectedCertificates.has(cert._id!);
              return (
              <Card key={cert._id} className={`${!cert.published ? "opacity-60 border-dashed" : ""} ${isSelected ? "ring-2 ring-primary" : ""}`}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
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
                      <div className="relative w-32 h-24">
                        <Image
                          src={cert.certificateImage}
                          alt={cert.title}
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-lg text-foreground">
                              {cert.title}
                            </h3>
                            {!cert.published && (
                              <span className="text-xs bg-muted px-2 py-1 rounded">Unpublished</span>
                            )}
                            {cert.featured && (
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {cert.issuer}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => cert._id && handleTogglePublish(cert._id, cert.published)}
                            title={cert.published ? "Unpublish" : "Publish"}
                          >
                            {cert.published ? (
                              <Eye className="h-4 w-4" />
                            ) : (
                              <EyeOff className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(cert)}
                          >
                            Edit
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

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-2">
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded">
                        {cert.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(cert.issueDate), "MMM yyyy")}
                        {cert.expiryDate &&
                          ` - ${format(new Date(cert.expiryDate), "MMM yyyy")}`}
                      </span>
                      {cert.credentialId && (
                        <span>ID: {cert.credentialId}</span>
                      )}
                    </div>

                    {cert.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {cert.description}
                      </p>
                    )}

                    {cert.skills && cert.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {cert.skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs"
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
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
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

