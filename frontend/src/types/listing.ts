export type ListingCategory = string;
export type ListingPurpose = string;
export type VerificationLevel = 'seller_claimed' | 'pending' | 'verified' | 'rejected';
export type ListingStatus = 'draft' | 'submitted' | 'under_review' | 'published' | 'under_offer' | 'sold' | 'rented' | 'archived' | 'listed' | string;

export interface ListingMedia {
  id?: number | string;
  url?: string;
  file?: string;
  media_type?: 'image' | 'video' | '360' | '3d' | 'floor_plan';
  category?: string;
  caption?: string;
  room_name?: string;
  is_hero?: boolean;
  order?: number;
}

export interface ResidentialSpec {
  sub_type?: string;
  bedrooms?: number;
  bathrooms?: number;
  built_up_area_sqm?: number;
  compound_size_sqm?: number;
  kitchen_type?: string;
  balcony?: boolean;
  year_built?: number;
  is_furnished?: boolean;
  has_swimming_pool?: boolean;
  has_staff_quarters?: boolean;
  has_garden?: boolean;
  has_water_tank?: boolean;
  water_tank_capacity_liters?: number;
  water_tank_liters?: number;
  has_solar_water_heater?: boolean;
  has_solar_water?: boolean;
  has_backup_generator?: boolean;
  has_generator?: boolean;
  backup_generator_kva?: number;
  generator_kva?: number;
  has_three_phase_power?: boolean;
  has_three_phase?: boolean;
  has_fiber_internet?: boolean;
  has_fiber?: boolean;
  has_cctv?: boolean;
  parking_spaces?: number;
  master_plan_zoning?: string;
  security_type?: string;
  electricity_meter?: string;
  road_access_type?: string;
  road_access?: string;
  floor_number?: number | string;
  has_elevator?: boolean;
  monthly_service_charge?: number | string;
  service_charge?: string;
  apartment_selling_mode?: 'whole_building' | 'per_floor' | 'per_unit';
  selling_mode?: 'whole_building' | 'per_floor' | 'per_unit';
  total_building_floors?: number;
  unit_number?: string;
  unit_orientation?: string;
  balcony_area_sqm?: number;
  balcony_sqm?: number;
  parking_slot_number?: string;
  parking_slot?: string;
  apartment_floor_plan?: FloorPlan[];
  floor_plan?: FloorPlan[];
}

export interface FloorPlan {
  floor: number;
  units: { unit_number: string; status: 'available' | 'sold' | 'reserved' }[];
}

export interface LandSpec {
  plot_size_sqm?: number;
  land_use_category?: string;
  land_use?: string;
  tenure_type?: string;
  tenure?: string;
  lease_years_remaining?: number | string;
  lease_years?: string;
  upi_number?: string;
  zoning_code?: string;
  max_permitted_floors?: string;
  max_floors?: string;
  floor_area_ratio?: number | string;
  far?: string;
  building_coverage_ratio?: number | string;
  bcr?: string;
  terrain?: string;
  slope_gradient_percent?: number | string;
  slope_percent?: string;
  road_access?: boolean;
  road_type?: string;
  land_road_type?: string;
  soil_type?: string;
  topography?: string;
  title_deed_number?: string;
  is_encumbrance_free?: boolean;
  water_onsite?: boolean;
  water_line_distance_meters?: number;
  electricity_onsite?: boolean;
  power_pole_distance_meters?: number;
  has_fiber_conduit?: boolean;
  drainage_system?: string;
  is_in_wetland_buffer_zone?: boolean;
  wetland_buffer?: boolean;
  cadastral_sketch?: string;
}

export interface VehicleSpec {
  vehicle_type?: string;
  make?: string;
  model?: string;
  year?: string | number;
  mileage?: number;
  fuel_type?: string;
  transmission?: string;
  drivetrain?: string;
  engine_capacity?: string;
  engine_cc?: string;
  horsepower?: string | number;
  condition?: string;
  body_type?: string;
  seating_capacity?: number;
  seats?: number;
  plate_number?: string;
  plate_type?: string;
  vin_chassis_number?: string;
  vin_chassis?: string;
  rra_customs_status?: string;
  rra_customs?: string;
  controle_technique_expiry?: string;
  insurance_expiry?: string;
  has_air_conditioning?: boolean;
  has_ac?: boolean;
  has_leather_seats?: boolean;
  has_leather?: boolean;
  has_sunroof?: boolean;
  has_reverse_camera?: boolean;
  has_service_history?: boolean;
  includes_driver?: boolean;
  includes_helmet?: boolean;
  has_delivery_rack?: boolean;
}

export interface CommercialSpec {
  zoning_type?: string;
  commercial_zoning?: string;
  power_capacity?: number | string;
  loading_bays?: number;
  parking_spaces?: number;
  foot_traffic_score?: number;
  total_floors?: number | string;
  commercial_floors?: string;
  gross_area?: string;
  has_backup_generator?: boolean;
  has_commercial_elevator?: boolean;
  has_loading_bay?: boolean;
}

export interface HotelSpec {
  star_rating?: number;
  total_rooms?: number;
  conference_halls?: number;
  conference_halls_count?: number;
  has_restaurant_bar?: boolean;
  has_commercial_license?: boolean;
  amenities?: Record<string, unknown> | string[];
  occupancy_rate?: number | string;
  management_type?: string;
  commercial_license_number?: string;
}

export interface ListingAsset {
  id?: string;
  asset_type?: 'LAND' | 'BUILDING' | 'UNIT' | 'VEHICLE' | 'SERVICE' | string;
  name?: string;
  province?: string;
  district?: string;
  sector?: string;
  cell?: string;
  village?: string;
  address?: string;
  latitude?: number | string | null;
  longitude?: number | string | null;
  boundary_geojson?: string;
  total_area?: number;
  contact_phone?: string;
  residential_spec?: ResidentialSpec;
  land_spec?: LandSpec;
  vehicle_spec?: VehicleSpec;
  commercial_spec?: CommercialSpec;
  hotel_spec?: HotelSpec;
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
  security_deposit?: number | string;
  negotiable?: boolean;
  category?: ListingCategory;
  listing_type?: string;
  sub_type?: string;
  status?: ListingStatus;
  verification_level?: VerificationLevel;
  is_negotiable?: boolean;
  is_featured?: boolean;
  is_liked?: boolean;
  likes_count?: number;
  views_count?: number;
  inquiries_count?: number;
  visits_count?: number;
  owner_phone?: string;
  owner_name?: string;
  seller?: number | string;
  seller_name?: string;
  seller_phone?: string;
  seller_user_id?: number;
  listed_by_role?: string;
  asset?: ListingAsset;
  media?: ListingMedia[];
  featured_image?: string;
  image?: string;
  location?: string;
  address?: string;
  created_at?: string;
  updated_at?: string;
  date_listed?: string;
  date_updated?: string;
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
