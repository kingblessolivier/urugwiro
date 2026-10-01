export type ListingCategory = string;
export type ListingPurpose = string;
export type VerificationLevel = 'seller_claimed' | 'pending' | 'verified' | 'rejected';
export type ListingStatus = 'draft' | 'submitted' | 'under_review' | 'published' | 'under_offer' | 'sold' | 'rented' | 'archived' | 'listed' | string;

export interface ListingMedia {
  id?: number | string;
  url?: string;
  file?: string;
  media_type?: 'image' | 'video' | '360' | '3d';
  caption?: string;
  is_hero?: boolean;
}

export interface ResidentialSpec {
  bedrooms?: number;
  bathrooms?: number;
  built_up_area_sqm?: number;
  compound_size_sqm?: number;
  year_built?: number;
  is_furnished?: boolean;
  has_swimming_pool?: boolean;
  has_staff_quarters?: boolean;
  has_garden?: boolean;
  has_water_tank?: boolean;
  water_tank_liters?: number;
  has_generator?: boolean;
  generator_kva?: number;
  has_solar_water?: boolean;
  has_three_phase?: boolean;
  has_fiber?: boolean;
  has_cctv?: boolean;
  parking_spaces?: number;
  security_type?: string;
  electricity_meter?: string;
  road_access?: string;
  floor_number?: string;
  unit_number?: string;
  unit_orientation?: string;
  balcony_sqm?: number;
  parking_slot?: string;
  has_elevator?: boolean;
  service_charge?: string;
  selling_mode?: 'whole_building' | 'per_floor' | 'per_unit';
  total_building_floors?: number;
  floor_plan?: FloorPlan[];
}

export interface FloorPlan {
  floor: number;
  units: { unit_number: string; status: 'available' | 'sold' | 'reserved' }[];
}

export interface LandSpec {
  plot_size_sqm?: number;
  zoning_code?: string;
  land_use?: string;
  tenure?: string;
  lease_years?: string;
  far?: string;
  bcr?: string;
  max_floors?: string;
  terrain?: string;
  slope_percent?: string;
  land_road_type?: string;
  water_onsite?: boolean;
  electricity_onsite?: boolean;
  wetland_buffer?: boolean;
  upi_number?: string;
  land_use_category?: string;
}

export interface VehicleSpec {
  make?: string;
  model?: string;
  year?: string;
  mileage?: number;
  engine_cc?: string;
  horsepower?: string;
  transmission?: string;
  fuel_type?: string;
  drivetrain?: string;
  body_type?: string;
  seats?: number;
  condition?: string;
  plate_number?: string;
  plate_type?: string;
  vin_chassis?: string;
  rra_customs?: string;
  has_ac?: boolean;
  has_leather?: boolean;
  has_sunroof?: boolean;
  has_reverse_camera?: boolean;
  includes_helmet?: boolean;
  has_delivery_rack?: boolean;
}

export interface CommercialSpec {
  commercial_floors?: string;
  gross_area?: string;
  commercial_zoning?: string;
  has_commercial_elevator?: boolean;
  has_loading_bay?: boolean;
  star_rating?: number;
  total_rooms?: number;
  conference_halls_count?: number;
  has_restaurant_bar?: boolean;
  commercial_license_number?: string;
  management_type?: string;
}

export interface ListingAsset {
  name?: string;
  province?: string;
  district?: string;
  sector?: string;
  cell?: string;
  village?: string;
  address?: string;
  latitude?: number | string | null;
  longitude?: number | string | null;
  total_area?: number;
  contact_phone?: string;
  residential_spec?: ResidentialSpec;
  land_spec?: LandSpec;
  vehicle_spec?: VehicleSpec;
  commercial_spec?: CommercialSpec;
  upi_number?: string;
  title_deed_number?: string;
}

export interface ListingOwner {
  full_name?: string;
  name?: string;
  phone?: string;
  rating?: number;
}

export interface Listing {
  id: number | string;
  title: string;
  description?: string;
  price: number;
  currency?: string;
  purpose?: ListingPurpose;
  rental_frequency?: string;
  category?: ListingCategory;
  listing_type?: string;
  sub_type?: string;
  status?: ListingStatus;
  verification_level?: VerificationLevel;
  is_negotiable?: boolean;
  is_liked?: boolean;
  likes_count?: number;
  views_count?: number;
  inquiries_count?: number;
  visits_count?: number;
  owner_phone?: string;
  owner_name?: string;
  listed_by_role?: string;
  asset?: ListingAsset;
  media?: ListingMedia[];
  featured_image?: string;
  image?: string;
  location?: string;
  address?: string;
  created_at?: string;
  updated_at?: string;
  slug?: string;
  owner?: ListingOwner;
  assigned_agent?: ListingOwner;
  inquiries?: unknown[];
  offers?: unknown[];
  visits?: unknown[];
  verification_documents?: unknown[];
  verification_history?: Array<{ status?: string; date?: string }>;
  upi_number?: string;
}

export interface Review {
  id: number | string;
  rating: number;
  comment?: string;
  reviewer_name?: string;
  created_at?: string;
}

export interface ReviewSummary {
  results: Review[];
  average: number;
  count: number;
}
