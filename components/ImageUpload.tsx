"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import toast from "react-hot-toast";
import Image from "next/image";

// Dynamic import for ImageCropModal to reduce initial bundle size
const ImageCropModal = dynamic(
  () => import("./ImageCropModal").then((mod) => ({ default: mod.ImageCropModal })),
  { ssr: false, loading: () => <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div> }
);

interface ImageUploadProps {
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
  folder?: string;
  maxFiles?: number;
  disabled?: boolean;
  accept?: string; // Custom file types (e.g., "image/*", ".pdf", etc.)
  maxSize?: number; // Max file size in MB (default: 10)
  enableCrop?: boolean; // Enable image cropping (default: true for images)
  cropAspect?: number; // Aspect ratio for crop (default: 1 for square)
}

export function ImageUpload({
  value,
  onChange,
  multiple = false,
  folder = "portfolio",
  maxFiles = 5,
  disabled = false,
  accept = "image/*",
  maxSize = 10,
  enableCrop = true,
  cropAspect = 1,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [cropImage, setCropImage] = useState<string | null>(null);

  // Convert value to array for consistent handling
  const images = Array.isArray(value) ? value : value ? [value] : [];

  const handleUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    // Check file limit
    if (multiple && images.length + files.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const file = files[0]; // Handle first file for now

    // More lenient file type validation - only check if accept is not "*"
    if (accept !== "*" && accept !== "image/*,video/*,application/pdf") {
      if (accept === "image/*" && !file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image`);
        return;
      } else if (accept.includes(".pdf") && file.type !== "application/pdf") {
        toast.error(`${file.name} is not a PDF file`);
        return;
      }
    }

    // Validate file size (configurable max size)
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`${file.name} is too large (max ${maxSize}MB)`);
      return;
    }

    // If it's an image and crop is enabled, show crop modal (optional)
    if (enableCrop && file.type.startsWith("image/")) {
      const base64 = await convertToBase64(file);
      setCropImage(base64);
      return;
    }

    // Otherwise upload directly
    uploadFiles(files);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [multiple, images, maxFiles, accept, maxSize, enableCrop]);

  const uploadFiles = async (files: FileList) => {
    setUploading(true);

    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Convert to base64
        const base64 = await convertToBase64(file);

        // Upload to Cloudinary via API
        const response = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ file: base64, folder }),
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        const data = await response.json();
        uploadedUrls.push(data.url);
      }

      if (uploadedUrls.length > 0) {
        if (multiple) {
          onChange([...images, ...uploadedUrls]);
        } else {
          onChange(uploadedUrls[0]);
        }
        toast.success(`${uploadedUrls.length} file(s) uploaded successfully!`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const handleCropComplete = async (croppedImage: string) => {
    setCropImage(null);
    setUploading(true);

    try {
      // Upload cropped image to Cloudinary
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: croppedImage, folder }),
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();

      if (multiple) {
        onChange([...images, data.url]);
      } else {
        onChange(data.url);
      }

      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(multiple ? newImages : "");
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleUpload(e.dataTransfer.files);
      }
    },
    [handleUpload, setDragActive]
  );

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {(multiple || images.length === 0) && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-lg p-8
            transition-colors duration-200
            ${
              dragActive
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }
            ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          `}
        >
          <input
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={(e) => handleUpload(e.target.files)}
            disabled={disabled || uploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            aria-label={accept.includes("pdf") ? "Upload PDF" : "Upload image"}
            title={accept.includes("pdf") ? "Upload PDF" : "Upload image"}
          />

          <div className="flex flex-col items-center justify-center gap-4">
            {uploading ? (
              <>
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">
                  Uploading to Cloudinary...
                </p>
              </>
            ) : (
              <>
                <div className="p-4 bg-primary/10 rounded-full">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {accept === "*" || accept === "image/*,video/*,application/pdf"
                      ? `Images, Videos, PDFs up to ${maxSize}MB`
                      : accept.includes("pdf") 
                      ? `PDF files up to ${maxSize}MB`
                      : `Images (PNG, JPG, HEIC, etc.) up to ${maxSize}MB`
                    }
                  </p>
                  {multiple && (
                    <p className="text-xs text-muted-foreground">
                      Maximum {maxFiles} files
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((url, index) => {
            const isPDFExt = /\.pdf($|\?)/i.test(url);
            const isCloudinaryRaw = /res\.cloudinary\.com\/.+\/raw\/upload\//i.test(url);
            const isPDF = isPDFExt || isCloudinaryRaw;
            const isVideo = url.match(/\.(mp4|mov|avi|webm)$/i);
            const containerClass = isPDF ? "aspect-[3/4] min-h-[320px]" : "aspect-square";
            const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;

            return (
              <Card key={index} className="relative group overflow-hidden">
                <div className={`${containerClass} relative bg-muted flex items-center justify-center`}>
                  {isPDF ? (
                    <iframe
                      src={viewerUrl}
                      className="absolute inset-0 w-full h-full border-0"
                      title={`PDF preview ${index + 1}`}
                    />
                  ) : isVideo ? (
                    <div className="w-full h-full">
                      <video
                        src={url}
                        className="w-full h-full object-cover"
                        controls={false}
                        muted
                      />
                    </div>
                  ) : (
                    <Image
                      src={url}
                      alt={`Upload ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 33vw"
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQEDAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                    />
                  )}
                  {!disabled && (
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemove(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Image Count */}
      {multiple && images.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {images.length} / {maxFiles} images
        </p>
      )}

      {/* Crop Modal */}
      {cropImage && (
        <ImageCropModal
          image={cropImage}
          onCropComplete={handleCropComplete}
          onClose={() => {
            setCropImage(null);
          }}
          aspect={cropAspect}
        />
      )}
    </div>
  );
}

// Helper function to convert file to base64
function convertToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

