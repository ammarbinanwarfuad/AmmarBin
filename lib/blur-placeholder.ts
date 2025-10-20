/**
 * Generate a blur placeholder data URL for images
 * This improves perceived performance and CLS score
 */

// Simple base64 encoded 1x1 transparent pixel (fallback)
const TRANSPARENT_PIXEL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

/**
 * Generate a blur placeholder for an image URL
 * For production, use sharp or plaiceholder to generate real blur data
 * This is a simple fallback that returns a minimal placeholder
 */
export async function generateBlurDataURL(): Promise<string> {
  try {
    // In production, you can use sharp or fetch the image to generate a real blur
    // For now, return a minimal placeholder
    // To implement properly:
    // 1. Install: npm install plaiceholder
    // 2. Use: const { base64 } = await getPlaiceholder(src)
    // 3. Return: `data:image/jpeg;base64,${base64}`
    
    return TRANSPARENT_PIXEL;
  } catch (error) {
    console.warn("Failed to generate blur placeholder:", error);
    return TRANSPARENT_PIXEL;
  }
}

/**
 * Predefined blur placeholders for known images
 * Add your most critical images here with pre-generated blur data URLs
 * 
 * To generate proper blur placeholders:
 * 1. Install: npm install plaiceholder
 * 2. Run: node scripts/generate-blur-placeholders.js
 * 3. Copy the generated base64 strings here
 */
export const BLUR_PLACEHOLDERS: Record<string, string> = {
  // Hero profile image blur placeholder (tiny 20x20 JPEG, base64 encoded)
  // This is a minimal placeholder - replace with actual generated blur for best results
  "profile": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQEDAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==",
};

/**
 * Get blur placeholder for an image
 */
export function getBlurPlaceholder(src: string): string {
  return BLUR_PLACEHOLDERS[src] || TRANSPARENT_PIXEL;
}

