export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  detail?: string;
}

export interface ListingsListParams {
  search?: string;
  category?: string;
  purpose?: string;
  type?: string;
  province?: string;
  district?: string;
  sector?: string;
  min_price?: string;
  max_price?: string;
  bedrooms?: string;
  bathrooms?: string;
  verification_level?: string;
  furnished?: string;
  sort?: string;
  page?: number;
  page_size?: number;
}

export interface Offer {
  id: number;
  listing: number;
  listing_title?: string;
  listing_price?: number;
  customer?: number | null;
  customer_name?: string;
  seller?: number | null;
  seller_name?: string;
  conversation?: number | null;
  asking_price?: number;
  offered_amount: number;
  currency?: string;
  message?: string;
  status: 'new' | 'reviewing' | 'negotiating' | 'accepted' | 'declined' | 'withdrawn';
  created_at: string;
  updated_at?: string;
}

export interface AIAnalysisResult {
  analysis: string;
  ai_analysis?: string;
  discount_percent: number;
  recommended_counter: number;
  recommendation?: string;
}
