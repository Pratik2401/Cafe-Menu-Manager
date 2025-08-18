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
