// Helper to extract Cloudinary public ID from a full URL
export function getCloudinaryPublicId(url?: string): string {
  if (!url) return "";
  const cleanUrl = url.split("?")[0];
  const lastPart = cleanUrl.split("/").pop() || "";
  return lastPart.split(".")[0];
}

// Utility: get natural image size by preloading an Image
export function loadImageDimensions(src: string): Promise<{ w: number; h: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ w: img.naturalWidth, h: img.naturalHeight });
    };
    img.onerror = () => {
      reject(new Error(`Failed to load image: ${src}`));
    };
    img.src = src;
  });
}
