import { v2 as cloudinary } from "cloudinary";

// Validate Cloudinary environment variables
const cloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
};

// Only configure if all required env vars are present
if (cloudinaryConfig.cloud_name && cloudinaryConfig.api_key && cloudinaryConfig.api_secret) {
  cloudinary.config(cloudinaryConfig);
} else if (process.env.NODE_ENV !== "development") {
  // Only warn in production, allow development without Cloudinary
  console.warn(
    "Cloudinary environment variables are missing. Image upload functionality will not work."
  );
}

export default cloudinary;

/**
 * Upload image to Cloudinary
 * @param file - Base64 encoded image or file path
 * @param folder - Cloudinary folder name
 * @returns Upload result with URL
 */
export async function uploadImage(
  file: string,
  folder: string = "portfolio"
): Promise<{ url: string; publicId: string }> {
  try {
    const isPdf = typeof file === 'string' && file.startsWith('data:application/pdf');

    const uploadOptions: Record<string, unknown> = {
      folder,
      resource_type: isPdf ? "raw" : "auto",
    };

    if (!isPdf) {
      uploadOptions.transformation = [
        { quality: "auto", fetch_format: "auto" },
      ];
    }

    const result = await cloudinary.uploader.upload(file, uploadOptions);

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw new Error("Failed to upload image");
  }
}

/**
 * Delete image from Cloudinary
 * @param publicId - Cloudinary public ID
 */
export async function deleteImage(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    throw new Error("Failed to delete image");
  }
}

/**
 * Upload multiple images
 * @param files - Array of base64 encoded images
 * @param folder - Cloudinary folder name
 */
export async function uploadMultipleImages(
  files: string[],
  folder: string = "portfolio"
): Promise<{ url: string; publicId: string }[]> {
  try {
    const uploadPromises = files.map((file) => uploadImage(file, folder));
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error("Error uploading multiple images:", error);
    throw new Error("Failed to upload images");
  }
}

/**
 * Get optimized image URL with transformations
 * @param publicId - Cloudinary public ID
 * @param width - Image width
 * @param height - Image height
 */
export function getOptimizedImageUrl(
  publicId: string,
  width?: number,
  height?: number
): string {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  
  if (!cloudName) {
    console.warn("CLOUDINARY_CLOUD_NAME is not set. Returning placeholder URL.");
    return publicId; // Return the publicId as fallback
  }

  const transformations = [];

  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);

  transformations.push("f_auto", "q_auto"); // Auto format & quality

  const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`;
  const transformString = transformations.join(",");

  return `${baseUrl}/${transformString}/${publicId}`;
}

/**
 * Extract public ID from Cloudinary URL
 * @param url - Full Cloudinary URL
 */
export function extractPublicId(url: string): string | null {
  try {
    const match = url.match(/\/v\d+\/(.+)\.[^.]+$/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

