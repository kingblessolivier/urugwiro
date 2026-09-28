const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export function resolveImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  // Already absolute URL
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }

  // Relative path — prefix with backend URL
  if (url.startsWith('/')) {
    return `${BACKEND_URL}${url}`;
  }

  // Relative path without leading slash
  return `${BACKEND_URL}/${url}`;
}

export function getListingImage(listing: any): string | null {
  const raw = listing.featured_image || listing.media?.[0]?.url || listing.media?.[0]?.file || listing.image || null;
  return resolveImageUrl(raw);
}
