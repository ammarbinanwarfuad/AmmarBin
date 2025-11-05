/**
 * Preload LCP Image for Faster Largest Contentful Paint
 * This component adds a <link rel="preload"> tag for the profile image
 */

export function LCPImagePreload({ imageUrl }: { imageUrl?: string }) {
  if (!imageUrl) return null;

  // Extract image URL from Cloudinary or other CDN
  const optimizedUrl = imageUrl.replace(
    /\/upload\/(.*?)\//,
    '/upload/c_scale,f_auto,q_auto,w_384/$1/'
  );

  return (
    <link
      rel="preload"
      as="image"
      href={optimizedUrl}
      fetchPriority="high"
      imageSrcSet={`${optimizedUrl}?w=384 384w, ${optimizedUrl}?w=768 768w`}
      imageSizes="192px"
    />
  );
}

