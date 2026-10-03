export interface MediaItem {
  id?: string | number;
  url?: string;
  file?: string;
  image?: string;
  category?: string;
  caption?: string;
  room_name?: string;
  media_type?: string;
}

export function getMediaUrl(item: MediaItem | string | undefined | null): string {
  if (!item) return '';
  return typeof item === 'string' ? item : (item.url || item.file || item.image || '');
}

export function getMediaCaption(item: MediaItem | string | undefined | null): string {
  if (!item || typeof item === 'string') return '';
  return item.caption || item.category || item.room_name || '';
}
