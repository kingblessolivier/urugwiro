import type { Listing } from '../types/listing';

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ||
  (import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, '') : '') ||
  (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') : '') ||
  (import.meta.env.DEV ? 'http://localhost:8000' : 'https://urugwiro-api-production-b6d5.up.railway.app');

export function resolveImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  // Already absolute URL
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }

  // Relative path — prefix with backend URL
  if (url.startsWith('/')) {
    return `${BACKEND_URL}${url}` || url;
  }

  // Relative path without leading slash
  return BACKEND_URL ? `${BACKEND_URL}/${url}` : `/${url}`;
}

export function getListingImage(listing: Listing): string | null {
  const primaryImage = listing.media?.find((item) => !item.media_type || item.media_type === 'image');
  const raw = listing.featured_image || primaryImage?.url || primaryImage?.file || listing.image || null;
  return resolveImageUrl(raw);
}
