import type { Listing, ListingAsset } from '../../types/listing';

export type ListingKind =
  | 'house'
  | 'apartment'
  | 'land'
  | 'car'
  | 'motorbike'
  | 'hotel'
  | 'commercial'
  | 'service';

export interface SpecRow {
  label: string;
  value?: string | number;
}

export interface AmenityChip {
  label: string;
  tone?: 'default' | 'warn';
}

export interface HighlightFact {
  label: string;
  value: string;
}

const TENURE_LABELS: Record<string, string> = {
  EmphyteuticLease: '99-year leasehold',
  Freehold: 'Freehold',
};

const LAND_USE_LABELS: Record<string, string> = {
  Residential: 'Residential building land',
  Commercial: 'Commercial / mixed-use land',
  Agricultural: 'Agricultural / farming land',
  Industrial: 'Industrial / logistics land',
  Forestry: 'Forestry / conservation',
  WetlandBuffer: 'Wetland buffer / protected',
};

const CUSTOMS_LABELS: Record<string, string> = {
  DutyPaid: 'Customs duty paid',
  InBond: 'In-bond / transit',
  Exempt: 'Duty-free exemption',
};

const PURPOSE_LABELS: Record<string, string> = {
  sale: 'For sale',
  rent: 'For rent',
};

const FREQUENCY_LABELS: Record<string, string> = {
  per_day: 'per day',
  per_month: 'per month',
  per_year: 'per year',
};

const SELLING_MODE_LABELS: Record<string, string> = {
  whole_building: 'Entire building',
  per_floor: 'Per floor',
  per_unit: 'Per unit',
};

const KIND_LABELS: Record<ListingKind, string> = {
  house: 'House',
  apartment: 'Apartment',
  land: 'Land',
  car: 'Car',
  motorbike: 'Motorbike',
  hotel: 'Hotel',
  commercial: 'Commercial',
  service: 'Service',
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function pick(obj: Record<string, unknown> | undefined | null, ...keys: string[]): unknown {
  if (!obj) return undefined;
  for (const key of keys) {
    const value = obj[key];
    if (value === undefined || value === null || value === '') continue;
    return value;
  }
  return undefined;
}

function isPresent(value: unknown): boolean {
  return value !== undefined && value !== null && value !== '' && value !== false;
}

function asText(value: unknown): string | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
}

function asNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function formatArea(value: unknown, unit = 'm²'): string | undefined {
  const n = asNumber(value);
  if (n === undefined) return undefined;
  return `${n.toLocaleString()} ${unit}`;
}

function formatKm(value: unknown): string | undefined {
  const n = asNumber(value);
  if (n === undefined) return undefined;
  return `${n.toLocaleString()} km`;
}

function labelMap(value: unknown, map: Record<string, string>): string | undefined {
  const raw = asText(value);
  if (!raw) return undefined;
  return map[raw] || raw.replace(/([A-Z])/g, ' $1').trim();
}

function yesIfTrue(value: unknown, label: string): AmenityChip | null {
  return value === true ? { label } : null;
}

export function detectListingKind(listing: Listing): ListingKind {
  const category = String(listing.category || listing.listing_type || '').toLowerCase();
  const asset = listing.asset || {};
  const assetType = String(asset.asset_type || '').toUpperCase();
  const res = asRecord(asset.residential_spec);
  const subType = String(pick(res, 'sub_type') || listing.sub_type || '').toLowerCase();

  if (category.includes('motor') || category.includes('bike')) return 'motorbike';
  if (category.includes('car') || category.includes('vehic') || assetType === 'VEHICLE') {
    const veh = asRecord(asset.vehicle_spec);
    const vType = String(pick(veh, 'vehicle_type') || '').toLowerCase();
    if (vType.includes('motor')) return 'motorbike';
    return 'car';
  }
  if (category.includes('land') || category.includes('plot') || assetType === 'LAND') return 'land';
  if (category.includes('hotel') || asset.hotel_spec) return 'hotel';
  if (category.includes('service') || assetType === 'SERVICE') return 'service';
  if (category.includes('commercial') || (asset.commercial_spec && !asset.residential_spec)) return 'commercial';
  if (
    assetType === 'UNIT' ||
    subType.includes('apartment') ||
    subType.includes('studio') ||
    subType.includes('penthouse')
  ) {
    return 'apartment';
  }
  return 'house';
}

export function kindLabel(kind: ListingKind): string {
  return KIND_LABELS[kind];
}

export function purposeLabel(listing: Listing): string {
  const purpose = String(listing.purpose || '').toLowerCase();
  return PURPOSE_LABELS[purpose] || (listing.listing_type as string) || 'Listed';
}

export function formatMoney(amount: number, currency = 'RWF'): string {
  try {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString()} ${currency}`;
  }
}

export function priceSuffix(listing: Listing): string {
  if (listing.purpose !== 'rent' || !listing.rental_frequency) return '';
  return FREQUENCY_LABELS[listing.rental_frequency] || listing.rental_frequency.replace('_', ' ');
}

export function locationParts(listing: Listing): string[] {
  const asset = listing.asset || {};
  return [asset.village, asset.cell, asset.sector, asset.district, asset.province]
    .map((part) => (part ? String(part) : ''))
    .filter(Boolean);
}

export function locationText(listing: Listing): string {
  return listing.address || locationParts(listing).join(', ') || 'Rwanda';
}

export function verificationCopy(level?: string): { label: string; tone: 'emerald' | 'amber' | 'neutral' } | null {
  const value = String(level || '').toLowerCase();
  if (value === 'professional') return { label: 'Professionally inspected', tone: 'emerald' };
  if (value === 'verified') return { label: 'Urugwiro verified', tone: 'emerald' };
  if (value === 'submitted') return { label: 'Documents submitted', tone: 'amber' };
  return { label: 'Seller listed', tone: 'neutral' };
}

export function highlightFacts(listing: Listing, kind: ListingKind): HighlightFact[] {
  const asset = listing.asset || {};
  const res = asRecord(asset.residential_spec);
  const land = asRecord(asset.land_spec);
  const veh = asRecord(asset.vehicle_spec);
  const hotel = asRecord(asset.hotel_spec);
  const commercial = asRecord(asset.commercial_spec);
  const facts: HighlightFact[] = [];

  if (kind === 'house' || kind === 'apartment') {
    const beds = asText(pick(res, 'bedrooms'));
    const baths = asText(pick(res, 'bathrooms'));
    const area = formatArea(pick(res, 'built_up_area_sqm') || asset.total_area);
    const parking = asText(pick(res, 'parking_spaces'));
    if (beds) facts.push({ label: 'Bedrooms', value: beds });
    if (baths) facts.push({ label: 'Bathrooms', value: baths });
    if (area) facts.push({ label: 'Living area', value: area });
    if (parking) facts.push({ label: 'Parking', value: parking });
  } else if (kind === 'land') {
    const size = formatArea(pick(land, 'plot_size_sqm') || asset.total_area);
    const use = labelMap(pick(land, 'land_use_category', 'land_use'), LAND_USE_LABELS);
    const tenure = labelMap(pick(land, 'tenure_type', 'tenure'), TENURE_LABELS);
    const terrain = asText(pick(land, 'terrain'));
    if (size) facts.push({ label: 'Plot size', value: size });
    if (use) facts.push({ label: 'Land use', value: use });
    if (tenure) facts.push({ label: 'Tenure', value: tenure });
    if (terrain) facts.push({ label: 'Terrain', value: terrain });
  } else if (kind === 'car' || kind === 'motorbike') {
    const year = asText(pick(veh, 'year'));
    const mileage = formatKm(pick(veh, 'mileage'));
    const fuel = asText(pick(veh, 'fuel_type'));
    const trans = asText(pick(veh, 'transmission'));
    const engine = asText(pick(veh, 'engine_capacity', 'engine_cc'));
    if (year) facts.push({ label: 'Year', value: year });
    if (mileage) facts.push({ label: 'Mileage', value: mileage });
    if (engine) facts.push({ label: 'Engine', value: engine });
    if (kind === 'car' && trans) facts.push({ label: 'Gearbox', value: trans });
    if (fuel) facts.push({ label: 'Fuel', value: fuel });
  } else if (kind === 'hotel') {
    const stars = asText(pick(hotel, 'star_rating'));
    const rooms = asText(pick(hotel, 'total_rooms'));
    const halls = asText(pick(hotel, 'conference_halls', 'conference_halls_count'));
    if (stars) facts.push({ label: 'Star rating', value: `${stars}★` });
    if (rooms) facts.push({ label: 'Rooms', value: rooms });
    if (halls) facts.push({ label: 'Conference halls', value: halls });
  } else if (kind === 'commercial') {
    const floors = asText(pick(commercial, 'total_floors', 'commercial_floors'));
    const area = formatArea(pick(commercial, 'gross_area') || asset.total_area);
    const zoning = asText(pick(commercial, 'zoning_type', 'commercial_zoning'));
    if (floors) facts.push({ label: 'Floors', value: floors });
    if (area) facts.push({ label: 'Gross area', value: area });
    if (zoning) facts.push({ label: 'Zoning', value: zoning });
  }

  return facts.slice(0, 5);
}

export function specGroups(listing: Listing, kind: ListingKind): { title: string; rows: SpecRow[] }[] {
  const asset = listing.asset || {};
  const res = asRecord(asset.residential_spec);
  const land = asRecord(asset.land_spec);
  const veh = asRecord(asset.vehicle_spec);
  const hotel = asRecord(asset.hotel_spec);
  const commercial = asRecord(asset.commercial_spec);
  const groups: { title: string; rows: SpecRow[] }[] = [];

  const row = (label: string, value: unknown): SpecRow => ({ label, value: asText(value) });

  if (kind === 'house' || kind === 'apartment') {
    groups.push({
      title: kind === 'apartment' ? 'Residence' : 'Home',
      rows: [
        row('Property type', pick(res, 'sub_type') || kindLabel(kind)),
        row('Bedrooms', pick(res, 'bedrooms')),
        row('Bathrooms', pick(res, 'bathrooms')),
        row('Kitchen', pick(res, 'kitchen_type')),
        row('Year built', pick(res, 'year_built')),
        row('Living area', formatArea(pick(res, 'built_up_area_sqm'))),
        row('Compound', formatArea(pick(res, 'compound_size_sqm'))),
        row('Parking spaces', pick(res, 'parking_spaces')),
        row('Road access', pick(res, 'road_access_type', 'road_access')),
        row('Electricity meter', pick(res, 'electricity_meter')),
        row('Security', pick(res, 'security_type')),
        row('Zoning', pick(res, 'master_plan_zoning')),
      ],
    });
    if (kind === 'apartment') {
      groups.push({
        title: 'Building & unit',
        rows: [
          row('Selling mode', labelMap(pick(res, 'apartment_selling_mode', 'selling_mode'), SELLING_MODE_LABELS)),
          row('Building floors', pick(res, 'total_building_floors')),
          row('Floor number', pick(res, 'floor_number')),
          row('Unit number', pick(res, 'unit_number')),
          row('Orientation / view', pick(res, 'unit_orientation')),
          row('Balcony', formatArea(pick(res, 'balcony_area_sqm', 'balcony_sqm')) || (res.balcony ? 'Yes' : undefined)),
          row('Parking slot', pick(res, 'parking_slot_number', 'parking_slot')),
          row('Service charge', pick(res, 'monthly_service_charge', 'service_charge')),
        ],
      });
    }
  }

  if (kind === 'land') {
    groups.push({
      title: 'Plot',
      rows: [
        row('Plot size', formatArea(pick(land, 'plot_size_sqm') || asset.total_area)),
        row('Land use', labelMap(pick(land, 'land_use_category', 'land_use'), LAND_USE_LABELS)),
        row('Zoning code', pick(land, 'zoning_code')),
        row('Tenure', labelMap(pick(land, 'tenure_type', 'tenure'), TENURE_LABELS)),
        row('Lease years remaining', pick(land, 'lease_years_remaining', 'lease_years')),
        row('Max floors', pick(land, 'max_permitted_floors', 'max_floors')),
        row('Floor area ratio', pick(land, 'floor_area_ratio', 'far')),
        row('Building coverage', pick(land, 'building_coverage_ratio', 'bcr')),
      ],
    });
    groups.push({
      title: 'Site conditions',
      rows: [
        row('Terrain', pick(land, 'terrain')),
        row('Slope', pick(land, 'slope_gradient_percent', 'slope_percent') ? `${pick(land, 'slope_gradient_percent', 'slope_percent')}%` : undefined),
        row('Soil', pick(land, 'soil_type')),
        row('Road type', pick(land, 'road_type', 'land_road_type')),
        row('Road access', land.road_access === true ? 'Yes' : land.road_access === false ? 'No' : undefined),
        row('Drainage', pick(land, 'drainage_system')),
        row('Water line', pick(land, 'water_line_distance_meters') ? `${pick(land, 'water_line_distance_meters')} m` : undefined),
        row('Power pole', pick(land, 'power_pole_distance_meters') ? `${pick(land, 'power_pole_distance_meters')} m` : undefined),
        row('Topography', pick(land, 'topography')),
      ],
    });
    groups.push({
      title: 'Title & registry',
      rows: [
        row('UPI number', pick(land, 'upi_number') || listing.upi_number || asset.upi_number),
        row('Title deed', pick(land, 'title_deed_number') || asset.title_deed_number),
        row('Encumbrance free', land.is_encumbrance_free === true ? 'Yes' : land.is_encumbrance_free === false ? 'No' : undefined),
      ],
    });
  }

  if (kind === 'car' || kind === 'motorbike') {
    groups.push({
      title: kind === 'motorbike' ? 'Motorcycle' : 'Vehicle',
      rows: [
        row('Make', pick(veh, 'make')),
        row('Model', pick(veh, 'model')),
        row('Year', pick(veh, 'year')),
        row('Body type', pick(veh, 'body_type')),
        row('Condition', pick(veh, 'condition')),
        row('Mileage', formatKm(pick(veh, 'mileage'))),
        row('Engine', pick(veh, 'engine_capacity', 'engine_cc')),
        row('Horsepower', pick(veh, 'horsepower')),
        row('Transmission', pick(veh, 'transmission')),
        row('Fuel', pick(veh, 'fuel_type')),
        row('Drivetrain', pick(veh, 'drivetrain')),
        row('Seats', pick(veh, 'seating_capacity', 'seats')),
      ],
    });
    groups.push({
      title: 'Registration',
      rows: [
        row('Plate number', pick(veh, 'plate_number')),
        row('Plate type', pick(veh, 'plate_type')),
        row('VIN / chassis', pick(veh, 'vin_chassis_number', 'vin_chassis')),
        row('RRA customs', labelMap(pick(veh, 'rra_customs_status', 'rra_customs'), CUSTOMS_LABELS)),
        row('Contrôle technique', pick(veh, 'controle_technique_expiry')),
        row('Insurance expiry', pick(veh, 'insurance_expiry')),
      ],
    });
  }

  if (kind === 'hotel') {
    groups.push({
      title: 'Hotel',
      rows: [
        row('Star rating', pick(hotel, 'star_rating') ? `${pick(hotel, 'star_rating')} star` : undefined),
        row('Total rooms', pick(hotel, 'total_rooms')),
        row('Conference halls', pick(hotel, 'conference_halls', 'conference_halls_count')),
        row('Management', pick(hotel, 'management_type')),
        row('Occupancy', pick(hotel, 'occupancy_rate') ? `${pick(hotel, 'occupancy_rate')}%` : undefined),
        row('License number', pick(hotel, 'commercial_license_number')),
      ],
    });
  }

  if (kind === 'commercial') {
    groups.push({
      title: 'Commercial space',
      rows: [
        row('Zoning', pick(commercial, 'zoning_type', 'commercial_zoning')),
        row('Total floors', pick(commercial, 'total_floors', 'commercial_floors')),
        row('Gross area', formatArea(pick(commercial, 'gross_area') || asset.total_area)),
        row('Power capacity', pick(commercial, 'power_capacity') ? `${pick(commercial, 'power_capacity')} kVA` : undefined),
        row('Loading bays', pick(commercial, 'loading_bays')),
        row('Parking spaces', pick(commercial, 'parking_spaces')),
        row('Foot traffic', pick(commercial, 'foot_traffic_score') ? `${pick(commercial, 'foot_traffic_score')} / 10` : undefined),
      ],
    });
  }

  if (kind === 'service') {
    groups.push({
      title: 'Service',
      rows: [
        row('Category', listing.category),
        row('Coverage', locationText(listing)),
      ],
    });
  }

  return groups
    .map((group) => ({
      ...group,
      rows: group.rows.filter((item) => isPresent(item.value)),
    }))
    .filter((group) => group.rows.length > 0);
}

export function amenities(listing: Listing, kind: ListingKind): AmenityChip[] {
  const asset = listing.asset || {};
  const res = asRecord(asset.residential_spec);
  const land = asRecord(asset.land_spec);
  const veh = asRecord(asset.vehicle_spec);
  const hotel = asRecord(asset.hotel_spec);
  const commercial = asRecord(asset.commercial_spec);
  const chips: (AmenityChip | null)[] = [];

  if (kind === 'house' || kind === 'apartment') {
    chips.push(
      yesIfTrue(res.is_furnished, 'Furnished'),
      yesIfTrue(res.has_garden, 'Garden'),
      yesIfTrue(res.has_swimming_pool, 'Swimming pool'),
      yesIfTrue(res.has_staff_quarters, 'Staff quarters'),
      yesIfTrue(res.has_water_tank, res.water_tank_capacity_liters || res.water_tank_liters ? `Water tank (${res.water_tank_capacity_liters || res.water_tank_liters} L)` : 'Water tank'),
      yesIfTrue(res.has_solar_water_heater || res.has_solar_water, 'Solar water heater'),
      yesIfTrue(res.has_backup_generator || res.has_generator, res.backup_generator_kva || res.generator_kva ? `Backup generator (${res.backup_generator_kva || res.generator_kva} kVA)` : 'Backup generator'),
      yesIfTrue(res.has_three_phase_power || res.has_three_phase, 'Three-phase power'),
      yesIfTrue(res.has_fiber_internet || res.has_fiber, 'Fiber internet'),
      yesIfTrue(res.has_cctv, 'CCTV'),
      yesIfTrue(res.has_elevator, 'Elevator'),
      yesIfTrue(res.balcony, 'Balcony'),
    );
  }

  if (kind === 'land') {
    chips.push(
      yesIfTrue(land.water_onsite, 'Water on site'),
      yesIfTrue(land.electricity_onsite, 'Electricity on site'),
      yesIfTrue(land.has_fiber_conduit, 'Fiber conduit'),
      yesIfTrue(land.road_access, 'Road access'),
      yesIfTrue(land.is_encumbrance_free, 'Clear title'),
    );
    if (land.is_in_wetland_buffer_zone || land.wetland_buffer) {
      chips.push({ label: 'Wetland buffer zone', tone: 'warn' });
    }
  }

  if (kind === 'car' || kind === 'motorbike') {
    chips.push(
      yesIfTrue(veh.has_air_conditioning || veh.has_ac, 'Air conditioning'),
      yesIfTrue(veh.has_leather_seats || veh.has_leather, 'Leather seats'),
      yesIfTrue(veh.has_sunroof, 'Sunroof'),
      yesIfTrue(veh.has_reverse_camera, 'Reverse camera'),
      yesIfTrue(veh.has_service_history, 'Service history'),
      yesIfTrue(veh.includes_driver, 'Driver included'),
      yesIfTrue(veh.includes_helmet, 'Helmet included'),
      yesIfTrue(veh.has_delivery_rack, 'Delivery rack'),
    );
  }

  if (kind === 'hotel') {
    chips.push(yesIfTrue(hotel.has_restaurant_bar, 'Restaurant / bar'));
    chips.push(yesIfTrue(hotel.has_commercial_license, 'Licensed'));
    const extra = hotel.amenities;
    if (Array.isArray(extra)) {
      extra.forEach((item) => {
        if (item) chips.push({ label: String(item) });
      });
    } else if (extra && typeof extra === 'object') {
      Object.entries(extra as Record<string, unknown>).forEach(([key, value]) => {
        if (value === true || value === 'true' || value === 'yes') {
          chips.push({ label: key.replace(/_/g, ' ') });
        }
      });
    }
  }

  if (kind === 'commercial') {
    chips.push(
      yesIfTrue(commercial.has_backup_generator, 'Backup generator'),
      yesIfTrue(commercial.has_commercial_elevator, 'Elevator'),
      yesIfTrue(Number(commercial.loading_bays) > 0 || commercial.has_loading_bay, 'Loading bay'),
    );
  }

  return chips.filter((chip): chip is AmenityChip => Boolean(chip));
}

export function floorPlanData(listing: Listing) {
  const res = asRecord(listing.asset?.residential_spec);
  const plan = res.apartment_floor_plan || res.floor_plan;
  return Array.isArray(plan) ? plan : [];
}

export function cadastralUrl(listing: Listing): string | undefined {
  const land = asRecord(listing.asset?.land_spec);
  return asText(land.cadastral_sketch);
}

export function sellerDisplay(listing: Listing): { name: string; phone: string } {
  return {
    name: listing.seller_name || listing.owner_name || listing.owner?.full_name || listing.owner?.name || 'Private seller',
    phone: listing.seller_phone || listing.owner_phone || listing.asset?.contact_phone || '',
  };
}

export function aboutHeading(kind: ListingKind): string {
  if (kind === 'land') return 'About this land';
  if (kind === 'car' || kind === 'motorbike') return 'About this vehicle';
  if (kind === 'hotel') return 'About this hotel';
  if (kind === 'commercial') return 'About this space';
  if (kind === 'service') return 'About this service';
  return 'About this home';
}

export function jsonLd(listing: Listing, kind: ListingKind, images: string[]) {
  const price = Number(listing.price || 0);
  return {
    '@context': 'https://schema.org',
    '@type': kind === 'car' || kind === 'motorbike' ? 'Vehicle' : kind === 'hotel' ? 'Hotel' : 'RealEstateListing',
    name: listing.title,
    description: listing.description,
    image: images.slice(0, 8),
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: listing.address,
      addressLocality: listing.asset?.district,
      addressRegion: listing.asset?.province,
      addressCountry: 'RW',
    },
    offers: {
      '@type': 'Offer',
      price,
      priceCurrency: listing.currency || 'RWF',
      availability: 'https://schema.org/InStock',
    },
  };
}

export function assetForMap(listing: Listing): ListingAsset | undefined {
  return listing.asset;
}
