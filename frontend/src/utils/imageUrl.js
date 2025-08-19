// Utility to get full image URL
export function getImageUrl(path) {
  if (!path) return '';
  // If already a full URL, return as is
  if (/^https?:\/\//i.test(path)) return path;
  // Use base URL from env
  const baseUrl = import.meta.env.VITE_API_URL_BASE || '';
  // Ensure no double slashes
  return `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

// Helper function to handle both blob URLs and server paths
export function getImageUrlSafe(imagePath) {
  if (!imagePath) return '';
  // If it's a blob URL, use it directly
  if (imagePath.startsWith('blob:')) return imagePath;
  // Otherwise, process through getImageUrl
  return getImageUrl(imagePath);
}
