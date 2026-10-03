const GUEST_SAVED_LISTINGS_KEY = 'urugwiro_guest_saved_listings';
const LEGACY_SHARED_SAVED_LISTINGS_KEY = 'urugwiro_saved_listings';

export function readGuestSavedListingIds(): Set<string> {
  try {
    localStorage.removeItem(LEGACY_SHARED_SAVED_LISTINGS_KEY);
    const stored = JSON.parse(localStorage.getItem(GUEST_SAVED_LISTINGS_KEY) || '[]');
    if (!Array.isArray(stored)) return new Set();
    return new Set(stored.map(String).filter(Boolean));
  } catch {
    return new Set();
  }
}

export function writeGuestSavedListingIds(ids: Iterable<string>): void {
  try {
    localStorage.setItem(GUEST_SAVED_LISTINGS_KEY, JSON.stringify([...ids]));
  } catch {
    // Browsers can deny storage access; saving still works for the current view.
  }
}

export function toggleGuestSavedListing(id: string): Set<string> {
  const next = readGuestSavedListingIds();
  if (next.has(id)) next.delete(id);
  else next.add(id);
  writeGuestSavedListingIds(next);
  return next;
}
