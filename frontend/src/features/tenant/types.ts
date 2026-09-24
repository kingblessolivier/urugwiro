export type ConsumerPersona = 'buyer' | 'tenant';

export type ConsumerTab =
  | 'overview'
  | 'offers'
  | 'showings'
  | 'assets'
  | 'trends'
  | 'matchmaker'
  | 'saved'
  | 'messages';

export interface NextRentDue {
  days_left: number;
  due_date: string;
  amount_rwf: number;
  is_urgent: boolean;
}

export interface UrgentCounter {
  offer_id: number;
  listing_title: string;
  original_amount: number;
  counter_amount: number;
  message: string;
}

export interface ConsumerMetrics {
  active_offers: number;
  countered_offers: number;
  upcoming_visits: number;
  active_leases: number;
  purchased_assets: number;
  saved_properties: number;
  total_volume_rwf: number;
  next_rent_due: NextRentDue;
}

export interface ConsumerDashboardData {
  metrics: ConsumerMetrics;
  urgent_counter: UrgentCounter | null;
  next_visit: {
    id: number;
    property_title: string;
    scheduled_date: string;
    agent_name: string;
    agent_phone: string;
  } | null;
}

export interface ConsumerOffer {
  id: number;
  listing_id: number | null;
  deal_id?: string | null;
  contracts?: any[];
  property_title: string;
  property_category: string;
  property_purpose: string;
  property_location: string;
  property_image: string;
  asking_price: number;
  offer_amount: number;
  counter_amount: number | null;
  variance_pct: number;
  status: 'pending' | 'countered' | 'accepted' | 'rejected' | 'expired';
  financing_type: string;
  proposed_closing_date: string | null;
  message: string;
  created_at: string;
  agent: {
    name: string;
    phone: string;
    email: string;
  } | null;
}

export interface ConsumerVisit {
  id: number;
  pass_code: string;
  qr_payload: string;
  listing_id: number | null;
  property_title: string;
  property_location: string;
  property_price: number;
  property_image: string;
  scheduled_date: string;
  scheduled_time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  notes: string;
  agent: {
    name: string;
    phone: string;
    email: string;
    license_number: string;
    avatar: string;
    whatsapp_url: string;
  } | null;
  maps_url: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface DealDoc {
  id: string;
  title: string;
  document_type: string;
  type_label: string;
  file_url: string | null;
  is_verified: boolean;
  uploaded_at: string | null;
}

export interface PurchasedAsset {
  deal_id: string;
  property_id: number | null;
  property_title: string;
  property_location: string;
  property_image: string;
  agreed_price: number;
  currency: string;
  stage: string;
  stage_label: string;
  land_upi: string;
  irembo_bill_id: string;
  notary_office: string;
  progress_percentage: number;
  closing_date: string;
  documents: DealDoc[];
}

export interface ConsumerLease {
  id: number;
  listing_id: number | null;
  property_title: string;
  location: string;
  image: string;
  rent_amount: number;
  currency: string;
  start_date: string | null;
  end_date: string | null;
  days_remaining: number;
  contract_signed: boolean;
  contract_accepted: boolean;
  contract_details: string;
}

export interface RentPayment {
  id: number;
  listing_id: number | null;
  property_title: string;
  amount: number;
  currency: string;
  payment_method: 'momo' | 'airtel' | 'card' | 'bank';
  payment_type: string;
  status: string;
  transaction_reference: string;
  date_paid: string;
}

export interface MaintenanceTicket {
  id: number;
  listing_id: number | null;
  property_title: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'completed';
  request_date: string | null;
  completion_date: string | null;
}

export interface MarketDistrict {
  name: string;
  avg_sqm_rwf: number;
  yoy_growth_pct: number;
  rental_yield_pct: number;
  avg_days_on_market: number;
  hotspots: string[];
  demand_level: string;
  trend: 'up' | 'down' | 'neutral';
}

export interface InvestmentCorridor {
  title: string;
  district: string;
  growth_rate: string;
  category: string;
  description: string;
  signal: string;
}

export interface MarketTrendsData {
  districts: MarketDistrict[];
  investment_corridors: InvestmentCorridor[];
  price_history: {
    months: string[];
    gasabo: number[];
    kicukiro: number[];
    nyarugenge: number[];
  };
  benchmark_currency: string;
  updated_at: string;
}

export interface AiRecommendation {
  id: number;
  title: string;
  category: string;
  purpose: string;
  price: number;
  currency: string;
  location: string;
  district: string;
  image: string;
  match_score: number;
  ai_rationale: string;
  key_highlights: string[];
}
