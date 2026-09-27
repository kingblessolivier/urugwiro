// Type definitions for UI components

export interface ListingCardData {
  id: string;
  title: string;
  price: number;
  currency: string;
  location: string;
  listing_type: string;
  verification_level?: 'none' | 'submitted' | 'verified' | 'professional';
  media?: { url?: string; file?: string; category?: string }[];
  specs?: Record<string, string | number>;
  description?: string;
  views?: number;
  status?: string;
  isFeatured?: boolean;
  isDemo?: boolean;
  is_liked?: boolean;
}

export interface ListingCardProps {
  listing: ListingCardData;
  onClick?: (id: string) => void;
  viewMode?: 'grid' | 'list';
  saved?: boolean;
  compared?: boolean;
  onToggleSave?: (id: string) => void;
  onToggleCompare?: (id: string) => void;
}