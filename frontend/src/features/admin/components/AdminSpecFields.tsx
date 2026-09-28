import React from 'react';
import { cn } from '../../../lib/utils';

interface SpecFieldProps {
  label: string;
  value: string | number | boolean;
  name: string;
  isEditing: boolean;
  onChange: (name: string, value: any) => void;
  type?: 'text' | 'number' | 'select' | 'boolean';
  options?: { label: string; value: any }[];
}

export const SpecField: React.FC<SpecFieldProps> = ({
  label, value, name, isEditing, onChange, type = 'text', options
}) => {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] uppercase font-bold text-[var(--color-text-dim)] tracking-tight">{label}</label>
      {isEditing ? (
        type === 'select' ? (
          <select
            value={value !== undefined && value !== null ? String(value) : ''}
            onChange={(e) => onChange(name, e.target.value)}
            className="w-full p-2 rounded-lg bg-[var(--color-input-bg)] border border-[var(--color-border)] text-xs text-[var(--color-text-main)] outline-none focus:border-emerald-500/50 transition-colors"
          >
            {options?.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        ) : type === 'boolean' ? (
          <select
            value={value ? 'true' : 'false'}
            onChange={(e) => onChange(name, e.target.value === 'true')}
            className="w-full p-2 rounded-lg bg-[var(--color-input-bg)] border border-[var(--color-border)] text-xs text-[var(--color-text-main)] outline-none focus:border-emerald-500/50 transition-colors"
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        ) : (
          <input
            type={type}
            value={typeof value === 'boolean' ? (value ? 'true' : 'false') : (value ?? '')}
            onChange={(e) => onChange(name, type === 'number' ? Number(e.target.value) : e.target.value)}
            className="w-full p-2 rounded-lg bg-[var(--color-input-bg)] border border-[var(--color-border)] text-xs text-[var(--color-text-main)] outline-none focus:border-emerald-500/50 transition-colors"
          />
        )
      ) : (
        <div className="text-sm font-mono text-[var(--color-brand-emerald)] font-medium py-1">
          {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : (value || '—')}
        </div>
      )}
    </div>
  );
};

export const ResidentialSpecsForm = ({ data, isEditing, onChange }: { data: any; isEditing: boolean; onChange: (n: string, v: any) => void }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
    <SpecField label="Sub-Type" value={data.sub_type} name="sub_type" isEditing={isEditing} onChange={onChange} type="text" />
    <SpecField label="Bedrooms" value={data.bedrooms} name="bedrooms" isEditing={isEditing} onChange={onChange} type="number" />
    <SpecField label="Bathrooms" value={data.bathrooms} name="bathrooms" isEditing={isEditing} onChange={onChange} type="number" />
    <SpecField label="Built-up Area (m²)" value={data.built_up_area_sqm} name="built_up_area_sqm" isEditing={isEditing} onChange={onChange} type="number" />
    <SpecField label="Compound Size (m²)" value={data.compound_size_sqm} name="compound_size_sqm" isEditing={isEditing} onChange={onChange} type="number" />
    <SpecField label="Kitchen Type" value={data.kitchen_type} name="kitchen_type" isEditing={isEditing} onChange={onChange} type="select" options={[{label: 'Open', value: 'Open'}, {label: 'Closed', value: 'Closed'}, {label: 'American', value: 'American'}]} />
    <SpecField label="Balcony" value={data.balcony} name="balcony" isEditing={isEditing} onChange={onChange} type="boolean" />
    <SpecField label="Furnished" value={data.is_furnished} name="is_furnished" isEditing={isEditing} onChange={onChange} type="boolean" />
    <SpecField label="Year Built" value={data.year_built} name="year_built" isEditing={isEditing} onChange={onChange} type="number" />
    <SpecField label="Swimming Pool" value={data.has_swimming_pool} name="has_swimming_pool" isEditing={isEditing} onChange={onChange} type="boolean" />
    <SpecField label="Staff Quarters" value={data.has_staff_quarters} name="has_staff_quarters" isEditing={isEditing} onChange={onChange} type="boolean" />
    <SpecField label="Garden" value={data.has_garden} name="has_garden" isEditing={isEditing} onChange={onChange} type="boolean" />
    <SpecField label="Water Tank" value={data.has_water_tank} name="has_water_tank" isEditing={isEditing} onChange={onChange} type="boolean" />
    <SpecField label="Tank Capacity (L)" value={data.water_tank_capacity_liters} name="water_tank_capacity_liters" isEditing={isEditing} onChange={onChange} type="number" />
    <SpecField label="Solar Water Heater" value={data.has_solar_water_heater} name="has_solar_water_heater" isEditing={isEditing} onChange={onChange} type="boolean" />
    <SpecField label="Backup Generator" value={data.has_backup_generator} name="has_backup_generator" isEditing={isEditing} onChange={onChange} type="boolean" />
    <SpecField label="Generator KVA" value={data.backup_generator_kva} name="backup_generator_kva" isEditing={isEditing} onChange={onChange} type="number" />
    <SpecField label="3-Phase Power" value={data.has_three_phase_power} name="has_three_phase_power" isEditing={isEditing} onChange={onChange} type="boolean" />
    <SpecField label="Fiber Internet" value={data.has_fiber_internet} name="has_fiber_internet" isEditing={isEditing} onChange={onChange} type="boolean" />
    <SpecField label="CCTV" value={data.has_cctv} name="has_cctv" isEditing={isEditing} onChange={onChange} type="boolean" />
    <SpecField label="Parking Spaces" value={data.parking_spaces} name="parking_spaces" isEditing={isEditing} onChange={onChange} type="number" />
    <SpecField label="Zoning" value={data.master_plan_zoning} name="master_plan_zoning" isEditing={isEditing} onChange={onChange} type="text" />
    <SpecField label="Security Type" value={data.security_type} name="security_type" isEditing={isEditing} onChange={onChange} type="text" />
    <SpecField label="Electricity Meter" value={data.electricity_meter} name="electricity_meter" isEditing={isEditing} onChange={onChange} type="text" />
    <SpecField label="Road Access Type" value={data.road_access_type} name="road_access_type" isEditing={isEditing} onChange={onChange} type="text" />
    <SpecField label="Floor Number" value={data.floor_number} name="floor_number" isEditing={isEditing} onChange={onChange} type="number" />
    <SpecField label="Has Elevator" value={data.has_elevator} name="has_elevator" isEditing={isEditing} onChange={onChange} type="boolean" />
    <SpecField label="Service Charge" value={data.monthly_service_charge} name="monthly_service_charge" isEditing={isEditing} onChange={onChange} type="number" />
    <SpecField label="Selling Mode" value={data.apartment_selling_mode} name="apartment_selling_mode" isEditing={isEditing} onChange={onChange} type="select" options={[{label: 'Entire Building', value: 'whole_building'}, {label: 'Per Floor', value: 'per_floor'}, {label: 'Per Unit', value: 'per_unit'}]} />
    <SpecField label="Total Floors" value={data.total_building_floors} name="total_building_floors" isEditing={isEditing} onChange={onChange} type="number" />
    <SpecField label="Unit Number" value={data.unit_number} name="unit_number" isEditing={isEditing} onChange={onChange} type="text" />
    <SpecField label="Orientation" value={data.unit_orientation} name="unit_orientation" isEditing={isEditing} onChange={onChange} type="text" />
    <SpecField label="Balcony Area (m²)" value={data.balcony_area_sqm} name="balcony_area_sqm" isEditing={isEditing} onChange={onChange} type="number" />
    <SpecField label="Parking Slot" value={data.parking_slot_number} name="parking_slot_number" isEditing={isEditing} onChange={onChange} type="text" />
  </div>
);

export const LandSpecsForm = ({ data, isEditing, onChange }: { data: any; isEditing: boolean; onChange: (n: string, v: any) => void }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
    <SpecField label="Land Use" value={data.land_use_category} name="land_use_category" isEditing={isEditing} onChange={onChange} type="select" options={[{label: 'Residential', value: 'Residential'}, {label: 'Commercial', value: 'Commercial'}, {label: 'Agricultural', value: 'Agricultural'}]} />
    <SpecField label="Tenure Type" value={data.tenure_type} name="tenure_type" isEditing={isEditing} onChange={onChange} type="select" options={[{label: 'Emphyteutic Lease', value: 'EmphyteuticLease'}, {label: 'Freehold', value: 'Freehold'}]} />
    <SpecField label="Lease Years Left" value={data.lease_years_remaining} name="lease_years_remaining" isEditing={isEditing} onChange={onChange} type="number" />
    <SpecField label="UPI Number" value={data.upi_number} name="upi_number" isEditing={isEditing} onChange={onChange} />
    <SpecField label="Zoning Code" value={data.zoning_code} name="zoning_code" isEditing={isEditing} onChange={onChange} />
    <SpecField label="Max Floors" value={data.max_permitted_floors} name="max_permitted_floors" isEditing={isEditing} onChange={onChange} />
    <SpecField label="FAR" value={data.floor_area_ratio} name="floor_area_ratio" isEditing={isEditing} onChange={onChange} type="number" />
    <SpecField label="BCR" value={data.building_coverage_ratio} name="building_coverage_ratio" isEditing={isEditing} onChange={onChange} type="number" />
    <SpecField label="Terrain" value={data.terrain} name="terrain" isEditing={isEditing} onChange={onChange} type="select" options={[{label: 'Flat', value: 'Flat'}, {label: 'Gentle Slope', value: 'Gentle Slope'}, {label: 'Sloped', value: 'Sloped'}, {label: 'Hilly', value: 'Hilly'}, {label: 'Rocky', value: 'Rocky'}, {label: 'Valley', value: 'Valley'}]} />
    <SpecField label="Slope Gradient (%)" value={data.slope_gradient_percent} name="slope_gradient_percent" isEditing={isEditing} onChange={onChange} type="number" />
    <SpecField label="Road Access" value={data.road_access} name="road_access" isEditing={isEditing} onChange={onChange} type="boolean" />
    <SpecField label="Road Type" value={data.road_type} name="road_type" isEditing={isEditing} onChange={onChange} />
    <SpecField label="Soil Type" value={data.soil_type} name="soil_type" isEditing={isEditing} onChange={onChange} />
    <SpecField label="Topography" value={data.topography} name="topography" isEditing={isEditing} onChange={onChange} />
    <SpecField label="Title Deed #" value={data.title_deed_number} name="title_deed_number" isEditing={isEditing} onChange={onChange} />
    <SpecField label="Encumbrance Free" value={data.is_encumbrance_free} name="is_encumbrance_free" isEditing={isEditing} onChange={onChange} type="boolean" />
    <SpecField label="Water Onsite" value={data.water_onsite} name="water_onsite" isEditing={isEditing} onChange={onChange} type="boolean" />
    <SpecField label="Water Dist (m)" value={data.water_line_distance_meters} name="water_line_distance_meters" isEditing={isEditing} onChange={onChange} type="number" />
    <SpecField label="Electricity Onsite" value={data.electricity_onsite} name="electricity_onsite" isEditing={isEditing} onChange={onChange} type="boolean" />
    <SpecField label="Power Dist (m)" value={data.power_pole_distance_meters} name="power_pole_distance_meters" isEditing={isEditing} onChange={onChange} type="number" />
    <SpecField label="Fiber Conduit" value={data.has_fiber_conduit} name="has_fiber_conduit" isEditing={isEditing} onChange={onChange} type="boolean" />
    <SpecField label="Drainage System" value={data.drainage_system} name="drainage_system" isEditing={isEditing} onChange={onChange} />
    <SpecField label="Wetland Buffer" value={data.is_in_wetland_buffer_zone} name="is_in_wetland_buffer_zone" isEditing={isEditing} onChange={onChange} type="boolean" />
  </div>
);

export const VehicleSpecsForm = ({ data, isEditing, onChange }: { data: any; isEditing: boolean; onChange: (n: string, v: any) => void }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
    <SpecField label="Vehicle Type" value={data.vehicle_type} name="vehicle_type" isEditing={isEditing} onChange={onChange} type="select" options={[{label: 'Car', value: 'Car'}, {label: 'Motorcycle', value: 'Motorcycle'}]} />
    <SpecField label="Make" value={data.make} name="make" isEditing={isEditing} onChange={onChange} />
    <SpecField label="Model" value={data.model} name="model" isEditing={isEditing} onChange={onChange} />
    <SpecField label="Year" value={data.year} name="year" isEditing={isEditing} onChange={onChange} type="number" />
    <SpecField label="Mileage (km)" value={data.mileage} name="mileage" isEditing={isEditing} onChange={onChange} type="number" />
    <SpecField label="Fuel Type" value={data.fuel_type} name="fuel_type" isEditing={isEditing} onChange={onChange} />
    <SpecField label="Transmission" value={data.transmission} name="transmission" isEditing={isEditing} onChange={onChange} />
    <SpecField label="Drivetrain" value={data.drivetrain} name="drivetrain" isEditing={isEditing} onChange={onChange} type="select" options={[{label: '4WD', value: '4WD'}, {label: 'AWD', value: 'AWD'}, {label: 'FWD', value: 'FWD'}, {label: 'RWD', value: 'RWD'}]} />
    <SpecField label="Engine Cap" value={data.engine_capacity} name="engine_capacity" isEditing={isEditing} onChange={onChange} />
    <SpecField label="Horsepower" value={data.horsepower} name="horsepower" isEditing={isEditing} onChange={onChange} type="number" />
    <SpecField label="Condition" value={data.condition} name="condition" isEditing={isEditing} onChange={onChange} />
    <SpecField label="Body Type" value={data.body_type} name="body_type" isEditing={isEditing} onChange={onChange} />
    <SpecField label="Seating" value={data.seating_capacity} name="seating_capacity" isEditing={isEditing} onChange={onChange} type="number" />
    <SpecField label="Plate Number" value={data.plate_number} name="plate_number" isEditing={isEditing} onChange={onChange} />
    <SpecField label="Plate Type" value={data.plate_type} name="plate_type" isEditing={isEditing} onChange={onChange} />
    <SpecField label="VIN / Chassis" value={data.vin_chassis_number} name="vin_chassis_number" isEditing={isEditing} onChange={onChange} />
    <SpecField label="Customs Status" value={data.rra_customs_status} name="rra_customs_status" isEditing={isEditing} onChange={onChange} type="select" options={[{label: 'Duty Paid', value: 'DutyPaid'}, {label: 'In-Bond', value: 'InBond'}, {label: 'Exempt', value: 'Exempt'}]} />
    <SpecField label="Technique Expiry" value={data.controle_technique_expiry} name="controle_technique_expiry" isEditing={isEditing} onChange={onChange} type="text" />
    <SpecField label="Insurance Expiry" value={data.insurance_expiry} name="insurance_expiry" isEditing={isEditing} onChange={onChange} type="text" />
    <SpecField label="Air Conditioning" value={data.has_air_conditioning} name="has_air_conditioning" isEditing={isEditing} onChange={onChange} type="boolean" />
    <SpecField label="Leather Seats" value={data.has_leather_seats} name="has_leather_seats" isEditing={isEditing} onChange={onChange} type="boolean" />
    <SpecField label="Sunroof" value={data.has_sunroof} name="has_sunroof" isEditing={isEditing} onChange={onChange} type="boolean" />
    <SpecField label="Reverse Camera" value={data.has_reverse_camera} name="has_reverse_camera" isEditing={isEditing} onChange={onChange} type="boolean" />
    <SpecField label="Service History" value={data.has_service_history} name="has_service_history" isEditing={isEditing} onChange={onChange} type="boolean" />
    <SpecField label="Incl. Driver" value={data.includes_driver} name="includes_driver" isEditing={isEditing} onChange={onChange} type="boolean" />
    <SpecField label="Incl. Helmet" value={data.includes_helmet} name="includes_helmet" isEditing={isEditing} onChange={onChange} type="boolean" />
    <SpecField label="Delivery Rack" value={data.has_delivery_rack} name="has_delivery_rack" isEditing={isEditing} onChange={onChange} type="boolean" />
  </div>
);

export const CommercialSpecsForm = ({ data, isEditing, onChange }: { data: any; isEditing: boolean; onChange: (n: string, v: any) => void }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
    <SpecField label="Zoning Type" value={data.zoning_type} name="zoning_type" isEditing={isEditing} onChange={onChange} />
    <SpecField label="Power Capacity (kVA)" value={data.power_capacity_kva} name="power_capacity_kva" isEditing={isEditing} onChange={onChange} type="number" />
    <SpecField label="Loading Bays" value={data.loading_bays_count} name="loading_bays_count" isEditing={isEditing} onChange={onChange} type="number" />
    <SpecField label="Parking Capacity" value={data.parking_capacity} name="parking_capacity" isEditing={isEditing} onChange={onChange} type="number" />
    <SpecField label="Avg Foot Traffic" value={data.avg_daily_foot_traffic} name="avg_daily_foot_traffic" isEditing={isEditing} onChange={onChange} type="text" />
    <SpecField label="Total Floors" value={data.total_floors} name="total_floors" isEditing={isEditing} onChange={onChange} type="number" />
    <SpecField label="Backup Generator" value={data.has_generator} name="has_generator" isEditing={isEditing} onChange={onChange} type="boolean" />
  </div>
);

export const HotelSpecsForm = ({ data, isEditing, onChange }: { data: any; isEditing: boolean; onChange: (n: string, v: any) => void }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
    <SpecField label="Star Rating" value={data.star_rating} name="star_rating" isEditing={isEditing} onChange={onChange} type="number" />
    <SpecField label="Total Rooms" value={data.total_rooms} name="total_rooms" isEditing={isEditing} onChange={onChange} type="number" />
    <SpecField label="Conference Halls" value={data.conference_halls_count} name="conference_halls_count" isEditing={isEditing} onChange={onChange} type="number" />
    <SpecField label="Restaurant/Bar" value={data.has_restaurant_bar} name="has_restaurant_bar" isEditing={isEditing} onChange={onChange} type="boolean" />
    <SpecField label="Commercial License" value={data.commercial_license_number} name="commercial_license_number" isEditing={isEditing} onChange={onChange} />
    <SpecField label="Management Type" value={data.management_type} name="management_type" isEditing={isEditing} onChange={onChange} type="select" options={[{label: 'Independent', value: 'Independent'}, {label: 'Franchise', value: 'Franchise'}, {label: 'Corporate', value: 'Corporate'}]} />
  </div>
);
