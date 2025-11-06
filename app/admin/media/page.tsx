"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Image as ImageIcon, Search, Trash2, Download, Loader2, CheckSquare, Square, Copy, Video, File } from "lucide-react";
import toast from "react-hot-toast";
import { useMedia } from '@/lib/hooks/useAdminData';
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
import { format } from "date-fns";

interface MediaResource {
  public_id: string;
  secure_url: string;
  format: string;
  bytes: number;
  width?: number;
  height?: number;
  created_at: string;
  resource_type: string;
}

export default function AdminMediaPage() {
  const { status } = useSession();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [resourceType, setResourceType] = useState<string>("all");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  const { resources, total, isLoading, error, refresh } = useMedia(
    resourceType !== "all" ? resourceType : undefined,
    searchTerm || undefined
  );

  const handleDelete = async (publicId: string) => {
    setDeletingId(publicId);
    try {
      // Get the actual resource type from the resource object
      const resource = (resources as MediaResource[]).find(r => r.public_id === publicId);
      const actualResourceType = resource?.resource_type || resourceType || "image";
      const response = await fetch(`/api/admin/media?publicId=${publicId}&resourceType=${actualResourceType}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Media deleted successfully!");
        refresh();
      } else {
        toast.error("Failed to delete media");
      }
    } catch (error) {
      console.error("Error deleting media:", error);
      toast.error("An error occurred");
    } finally {
      setDeletingId(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("URL copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy URL:", error);
      toast.error("Failed to copy URL");
    }
  };

  const toggleSelect = (publicId: string) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(publicId)) {
        newSet.delete(publicId);
      } else {
        newSet.add(publicId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === resources.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(resources.map((r: MediaResource) => r.public_id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return;
    
    setBulkDeleting(true);
    let successCount = 0;
    let failCount = 0;

    try {
      // Delete all selected items
      const deletePromises = Array.from(selectedItems).map(async (publicId) => {
        try {
          // Get the actual resource type from the resource object
          const resource = resources.find((r: MediaResource) => r.public_id === publicId);
          const actualResourceType = resource?.resource_type || resourceType || "image";
          const response = await fetch(`/api/admin/media?publicId=${publicId}&resourceType=${actualResourceType}`, {
            method: "DELETE",
          });
          return response.ok;
        } catch {
          return false;
        }
      });

      const results = await Promise.all(deletePromises);
      successCount = results.filter((r) => r).length;
      failCount = results.length - successCount;

      if (successCount > 0) {
        toast.success(`Deleted ${successCount} item(s) successfully${failCount > 0 ? `, ${failCount} failed` : ""}`);
        setSelectedItems(new Set());
        refresh();
      } else {
        toast.error("Failed to delete items");
      }
    } catch (error) {
      console.error("Error bulk deleting:", error);
      toast.error("An error occurred during bulk deletion");
    } finally {
      setBulkDeleting(false);
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Media Library</h1>
          <p className="text-muted-foreground mt-2">
            Manage your uploaded images, videos, and files
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search media..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={resourceType}
                onChange={(e) => {
                  setResourceType(e.target.value);
                  setSelectedItems(new Set()); // Clear selection when changing type
                }}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="all">All</option>
                <option value="image">Images</option>
                <option value="video">Videos</option>
                <option value="raw">Files</option>
              </select>
            </div>
            
            {/* Bulk Actions */}
            {!error && resources.length > 0 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleSelectAll}
                    className="gap-2"
                  >
                    {selectedItems.size === resources.length ? (
                      <CheckSquare className="h-4 w-4" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                    {selectedItems.size === resources.length ? "Deselect All" : "Select All"}
                  </Button>
                  {selectedItems.size > 0 && (
                    <span className="text-sm text-muted-foreground">
                      {selectedItems.size} item{selectedItems.size !== 1 ? "s" : ""} selected
                    </span>
                  )}
                </div>
                {selectedItems.size > 0 && (
                  <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={bulkDeleting}
                        className="gap-2"
                      >
                        {bulkDeleting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4" />
                            Delete Selected ({selectedItems.size})
                          </>
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Selected Media</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete {selectedItems.size} item{selectedItems.size !== 1 ? "s" : ""}?
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={async () => {
                            setShowBulkDeleteDialog(false);
                            await handleBulkDelete();
                          }}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Media Grid */}
        <div>
          {error && (
            <Card className="mb-4 border-destructive">
              <CardContent className="pt-6">
                <div className="text-destructive">
                  <p className="font-medium">Error loading media</p>
                  <p className="text-sm mt-1">
                    {(error as { details?: string; error?: string })?.details || 
                     (error as { details?: string; error?: string })?.error || 
                     "Failed to fetch media from Cloudinary"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Make sure your Cloudinary credentials (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are configured in your .env.local file.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
          {!error && (
            <div className="mb-4 text-sm text-muted-foreground">
              {total} {resourceType === "all" ? "items" : resourceType + "s"} found
            </div>
          )}
          {!error && (
            <>
              {resources.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No media found</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Upload images through your portfolio admin pages (blog, projects, etc.) to see them here.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {(resources as MediaResource[]).map((resource) => {
                    const isSelected = selectedItems.has(resource.public_id);
                    return (
                      <Card 
                        key={resource.public_id} 
                        className={`overflow-hidden transition-all ${
                          isSelected ? "ring-2 ring-primary border-primary" : ""
                        }`}
                      >
                        {/* Selection checkbox overlay */}
                        <div className="relative">
                          <div className="absolute top-2 left-2 z-10">
                            <button
                              type="button"
                              onClick={() => toggleSelect(resource.public_id)}
                              className={`p-1 rounded bg-background/80 backdrop-blur-sm border transition-all ${
                                isSelected 
                                  ? "border-primary bg-primary/20" 
                                  : "border-border hover:border-primary"
                              }`}
                            >
                              {isSelected ? (
                                <CheckSquare className="h-5 w-5 text-primary" />
                              ) : (
                                <Square className="h-5 w-5 text-muted-foreground" />
                              )}
                            </button>
                          </div>
                          <div className="relative aspect-square bg-muted">
                            {resource.resource_type === "image" ? (
                              <Image
                                src={resource.secure_url}
                                alt={resource.public_id}
                                fill
                                className={`object-cover transition-opacity ${
                                  isSelected ? "opacity-75" : ""
                                }`}
                              />
                            ) : resource.resource_type === "video" ? (
                              <div className="flex flex-col items-center justify-center h-full p-4">
                                <Video className="h-12 w-12 text-muted-foreground mb-2" />
                                <span className="text-xs text-muted-foreground text-center">Video</span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center h-full p-4">
                                <File className="h-12 w-12 text-muted-foreground mb-2" />
                                <span className="text-xs text-muted-foreground text-center">File</span>
                              </div>
                            )}
                            {isSelected && (
                              <div className="absolute inset-0 bg-primary/10 border-2 border-primary" />
                            )}
                          </div>
                        </div>
                        <CardContent className="p-3">
                        <div className="text-xs text-muted-foreground mb-2">
                          {format(new Date(resource.created_at), "MMM dd, yyyy")}
                        </div>
                        <div className="text-xs text-muted-foreground mb-3">
                          {formatFileSize(resource.bytes)}
                          {resource.width && resource.height && ` • ${resource.width}×${resource.height}`}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(resource.secure_url, "_blank")}
                            className="flex-1"
                          >
                            <Download className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCopyUrl(resource.secure_url)}
                            title="Copy URL"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={deletingId === resource.public_id}
                              >
                                {deletingId === resource.public_id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3 w-3" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Media</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this {resource.resource_type}?
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(resource.public_id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </CardContent>
                    </Card>
                  );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

