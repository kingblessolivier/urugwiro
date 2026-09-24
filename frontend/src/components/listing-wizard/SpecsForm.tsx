import React from 'react';
import { cn } from '../../lib/utils';
import type { WizardCategory } from './CategorySelector';
import InteractiveUnitMatrix from './InteractiveUnitMatrix';
import type { FloorPlan } from './InteractiveUnitMatrix';

/** All possible spec fields unified into one object */
export interface SpecsData {
  // Residential
  bedrooms: string;
  bathrooms: string;
  builtAreaSqm: string;
  compoundSizeSqm: string;
  yearBuilt: string;
  isFurnished: boolean;
  hasSwimmingPool: boolean;
  hasStaffQuarters: boolean;
  hasGarden: boolean;
  hasWaterTank: boolean;
  waterTankLiters: string;
  hasGenerator: boolean;
  generatorKva: string;
  hasSolarWater: boolean;
  hasThreePhase: boolean;
  hasFiber: boolean;
  hasCctv: boolean;
  parkingSpaces: string;
  securityType: string;
  electricityMeter: string;
  roadAccess: string;

  // Apartment
  floorNumber: string;
  unitNumber: string;
  unitOrientation: string;
  balconySqm: string;
  parkingSlot: string;
  hasElevator: boolean;
  serviceCharge: string;
  sellingMode: 'whole_building' | 'per_floor' | 'per_unit';
  totalBuildingFloors: number;
  floorPlan: FloorPlan[];

  // Land
  plotSizeSqm: string;
  zoningCode: string;
  landUse: string;
  tenure: string;
  leaseYears: string;
  far: string;
  bcr: string;
  maxFloors: string;
  terrain: string;
  slopePercent: string;
  landRoadType: string;
  waterOnsite: boolean;
  electricityOnsite: boolean;
  wetlandBuffer: boolean;

  // Vehicle
  make: string;
  model: string;
  year: string;
  mileage: string;
  engineCc: string;
  horsepower: string;
  transmission: string;
  fuelType: string;
  drivetrain: string;
  bodyType: string;
  seats: string;
  condition: string;
  plateNumber: string;
  plateType: string;
  vinChassis: string;
  rraCustoms: string;
  hasAc: boolean;
  hasLeather: boolean;
  hasSunroof: boolean;
  hasReverseCamera: boolean;
  includesHelmet: boolean;
  hasDeliveryRack: boolean;

  // Commercial
  commercialFloors: string;
  grossArea: string;
  commercialZoning: string;
  hasCommercialElevator: boolean;
  hasLoadingBay: boolean;
}

interface SpecsFormProps {
  category: WizardCategory;
  subtype: string;
  specs: SpecsData;
  onChange: (updates: Partial<SpecsData>) => void;
}

const SpecsForm: React.FC<SpecsFormProps> = ({ category, subtype, specs, onChange }) => {
  const inputClass = 'w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-all focus:border-emerald-500/50';
  const inputStyle = {
    background: 'var(--color-input-bg)',
    borderColor: 'var(--color-input-border)',
    color: 'var(--color-text-main)',
  };

  const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <label className="text-[11px] font-bold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
      {children}
    </label>
  );

  const Toggle: React.FC<{ label: string; checked: boolean; onChange: (v: boolean) => void }> = ({ label, checked, onChange: onToggle }) => (
    <label className="flex items-center gap-3 cursor-pointer py-2">
      <div className="relative">
        <input type="checkbox" className="sr-only peer" checked={checked} onChange={(e) => onToggle(e.target.checked)} />
        <div className="w-9 h-5 rounded-full peer peer-checked:bg-emerald-500 transition-colors" style={{ background: checked ? undefined : 'var(--color-input-bg)' }} />
        <div className={cn('absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform', checked && 'translate-x-4')} />
      </div>
      <span className="text-xs font-medium" style={{ color: 'var(--color-text-main)' }}>{label}</span>
    </label>
  );

  const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h3 className="text-sm font-bold pt-3 pb-1" style={{ color: 'var(--color-text-main)' }}>{children}</h3>
  );

  // ─── HOUSE ───
  if (category === 'house') {
    const isVilla = subtype === 'Villa';
    const isModest = subtype === 'ModestHouse';
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div><Label>Bedrooms</Label><input type="number" className={inputClass} style={inputStyle} value={specs.bedrooms} onChange={(e) => onChange({ bedrooms: e.target.value })} /></div>
          <div><Label>Bathrooms</Label><input type="number" className={inputClass} style={inputStyle} value={specs.bathrooms} onChange={(e) => onChange({ bathrooms: e.target.value })} /></div>
          <div><Label>Built Area (m²)</Label><input type="number" className={inputClass} style={inputStyle} value={specs.builtAreaSqm} onChange={(e) => onChange({ builtAreaSqm: e.target.value })} /></div>
          <div><Label>Compound (m²)</Label><input type="number" className={inputClass} style={inputStyle} value={specs.compoundSizeSqm} onChange={(e) => onChange({ compoundSizeSqm: e.target.value })} /></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div><Label>Year Built</Label><input type="number" className={inputClass} style={inputStyle} value={specs.yearBuilt} onChange={(e) => onChange({ yearBuilt: e.target.value })} /></div>
          <div><Label>Parking Spaces</Label><input type="number" className={inputClass} style={inputStyle} value={specs.parkingSpaces} onChange={(e) => onChange({ parkingSpaces: e.target.value })} /></div>
          <div>
            <Label>Road Access</Label>
            <select className={cn(inputClass, 'cursor-pointer')} style={inputStyle} value={specs.roadAccess} onChange={(e) => onChange({ roadAccess: e.target.value })}>
              <option value="Tarmac">Tarmac</option><option value="Cobblestone">Cobblestone</option><option value="Murram">Murram/Dirt</option><option value="Footpath">Footpath</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div>
            <Label>Electricity</Label>
            <select className={cn(inputClass, 'cursor-pointer')} style={inputStyle} value={specs.electricityMeter} onChange={(e) => onChange({ electricityMeter: e.target.value })}>
              <option value="Cash Power Prepaid">Cashpower Prepaid</option><option value="Postpaid Meter">Postpaid Meter</option><option value="Shared Meter">Shared Meter</option>
            </select>
          </div>
          <div>
            <Label>Security</Label>
            <select className={cn(inputClass, 'cursor-pointer')} style={inputStyle} value={specs.securityType} onChange={(e) => onChange({ securityType: e.target.value })}>
              <option value="Perimeter Wall">Perimeter Wall</option><option value="Electric Fence">Electric Fence</option><option value="Gated Community">Gated Community</option><option value="None">None</option>
            </select>
          </div>
        </div>

        <SectionTitle>Amenities & Utilities</SectionTitle>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-0">
          <Toggle label="Furnished" checked={specs.isFurnished} onChange={(v) => onChange({ isFurnished: v })} />
          <Toggle label="Garden" checked={specs.hasGarden} onChange={(v) => onChange({ hasGarden: v })} />
          <Toggle label="Water Tank" checked={specs.hasWaterTank} onChange={(v) => onChange({ hasWaterTank: v })} />
          {specs.hasWaterTank && (
            <div className="col-span-2 sm:col-span-1"><Label>Tank (Liters)</Label><input type="number" className={inputClass} style={inputStyle} value={specs.waterTankLiters} onChange={(e) => onChange({ waterTankLiters: e.target.value })} /></div>
          )}
          <Toggle label="Fiber Internet" checked={specs.hasFiber} onChange={(v) => onChange({ hasFiber: v })} />
          {(isVilla || !isModest) && (
            <>
              <Toggle label="Swimming Pool" checked={specs.hasSwimmingPool} onChange={(v) => onChange({ hasSwimmingPool: v })} />
              <Toggle label="Backup Generator" checked={specs.hasGenerator} onChange={(v) => onChange({ hasGenerator: v })} />
              {specs.hasGenerator && (
                <div><Label>Generator (KVA)</Label><input type="number" className={inputClass} style={inputStyle} value={specs.generatorKva} onChange={(e) => onChange({ generatorKva: e.target.value })} /></div>
              )}
              <Toggle label="Solar Water Heater" checked={specs.hasSolarWater} onChange={(v) => onChange({ hasSolarWater: v })} />
              <Toggle label="CCTV" checked={specs.hasCctv} onChange={(v) => onChange({ hasCctv: v })} />
            </>
          )}
          {isVilla && (
            <>
              <Toggle label="Staff Quarters" checked={specs.hasStaffQuarters} onChange={(v) => onChange({ hasStaffQuarters: v })} />
              <Toggle label="3-Phase Power" checked={specs.hasThreePhase} onChange={(v) => onChange({ hasThreePhase: v })} />
            </>
          )}
        </div>
      </div>
    );
  }

  // ─── APARTMENT ───
  if (category === 'apartment') {
    return (
      <div className="space-y-5">
        <InteractiveUnitMatrix
          sellingMode={specs.sellingMode}
          onSellingModeChange={(m) => onChange({ sellingMode: m })}
          totalFloors={specs.totalBuildingFloors}
          onTotalFloorsChange={(n) => onChange({ totalBuildingFloors: n })}
          floorPlan={specs.floorPlan}
          onFloorPlanChange={(plan) => onChange({ floorPlan: plan })}
        />

        {specs.sellingMode === 'per_unit' && (
          <>
            <SectionTitle>Unit Details (if listing a single unit)</SectionTitle>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div><Label>Floor №</Label><input type="number" className={inputClass} style={inputStyle} value={specs.floorNumber} onChange={(e) => onChange({ floorNumber: e.target.value })} /></div>
              <div><Label>Unit №</Label><input type="text" className={inputClass} style={inputStyle} value={specs.unitNumber} onChange={(e) => onChange({ unitNumber: e.target.value })} placeholder="e.g. 302" /></div>
              <div><Label>Bedrooms</Label><input type="number" className={inputClass} style={inputStyle} value={specs.bedrooms} onChange={(e) => onChange({ bedrooms: e.target.value })} /></div>
              <div><Label>Bathrooms</Label><input type="number" className={inputClass} style={inputStyle} value={specs.bathrooms} onChange={(e) => onChange({ bathrooms: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div><Label>Built Area (m²)</Label><input type="number" className={inputClass} style={inputStyle} value={specs.builtAreaSqm} onChange={(e) => onChange({ builtAreaSqm: e.target.value })} /></div>
              <div><Label>Balcony (m²)</Label><input type="number" className={inputClass} style={inputStyle} value={specs.balconySqm} onChange={(e) => onChange({ balconySqm: e.target.value })} /></div>
              <div>
                <Label>View / Orientation</Label>
                <select className={cn(inputClass, 'cursor-pointer')} style={inputStyle} value={specs.unitOrientation} onChange={(e) => onChange({ unitOrientation: e.target.value })}>
                  <option value="">Select view</option>
                  <option value="City Skyline">City Skyline</option><option value="Garden / Courtyard">Garden / Courtyard</option>
                  <option value="Mountain View">Mountain View</option><option value="Lake View">Lake View</option>
                  <option value="Street View">Street View</option><option value="Pool Side">Pool Side</option>
                </select>
              </div>
            </div>
          </>
        )}

        <SectionTitle>Building Amenities</SectionTitle>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div><Label>Parking Slot</Label><input type="text" className={inputClass} style={inputStyle} value={specs.parkingSlot} onChange={(e) => onChange({ parkingSlot: e.target.value })} placeholder="e.g. B1-14" /></div>
          <div><Label>Service Charge (RWF/mo)</Label><input type="number" className={inputClass} style={inputStyle} value={specs.serviceCharge} onChange={(e) => onChange({ serviceCharge: e.target.value })} /></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-0">
          <Toggle label="Elevator" checked={specs.hasElevator} onChange={(v) => onChange({ hasElevator: v })} />
          <Toggle label="Furnished" checked={specs.isFurnished} onChange={(v) => onChange({ isFurnished: v })} />
          <Toggle label="Backup Generator" checked={specs.hasGenerator} onChange={(v) => onChange({ hasGenerator: v })} />
          <Toggle label="Fiber Internet" checked={specs.hasFiber} onChange={(v) => onChange({ hasFiber: v })} />
          <Toggle label="CCTV" checked={specs.hasCctv} onChange={(v) => onChange({ hasCctv: v })} />
          <Toggle label="Swimming Pool" checked={specs.hasSwimmingPool} onChange={(v) => onChange({ hasSwimmingPool: v })} />
        </div>
      </div>
    );
  }

  // ─── LAND ───
  if (category === 'land') {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div><Label>Plot Size (m²)</Label><input type="number" className={inputClass} style={inputStyle} value={specs.plotSizeSqm} onChange={(e) => onChange({ plotSizeSqm: e.target.value })} /></div>
          <div>
            <Label>Master Plan Zoning</Label>
            <select className={cn(inputClass, 'cursor-pointer')} style={inputStyle} value={specs.zoningCode} onChange={(e) => onChange({ zoningCode: e.target.value })}>
              <option value="R1">R1 — Low Density Residential</option><option value="R2">R2 — Medium Density</option><option value="R3">R3 — High Density</option>
              <option value="C1">C1 — Commercial</option><option value="C2">C2 — Mixed Use</option><option value="A1">A1 — Agricultural</option><option value="M1">M1 — Industrial</option>
            </select>
          </div>
          <div>
            <Label>Land Use</Label>
            <select className={cn(inputClass, 'cursor-pointer')} style={inputStyle} value={specs.landUse} onChange={(e) => onChange({ landUse: e.target.value })}>
              <option value="Residential">Residential Building</option><option value="Commercial">Commercial</option><option value="Agricultural">Agricultural</option><option value="Industrial">Industrial</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div>
            <Label>Tenure</Label>
            <select className={cn(inputClass, 'cursor-pointer')} style={inputStyle} value={specs.tenure} onChange={(e) => onChange({ tenure: e.target.value })}>
              <option value="EmphyteuticLease">Emphyteutic Lease (99-yr)</option><option value="Freehold">Freehold</option>
            </select>
          </div>
          <div><Label>Lease Years Left</Label><input type="number" className={inputClass} style={inputStyle} value={specs.leaseYears} onChange={(e) => onChange({ leaseYears: e.target.value })} /></div>
          <div>
            <Label>Terrain</Label>
            <select className={cn(inputClass, 'cursor-pointer')} style={inputStyle} value={specs.terrain} onChange={(e) => onChange({ terrain: e.target.value })}>
              <option value="Flat">Flat</option><option value="Gentle Slope">Gentle Slope</option><option value="Sloped">Sloped</option><option value="Hilly">Hilly</option><option value="Rocky">Rocky</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div><Label>FAR</Label><input type="text" className={inputClass} style={inputStyle} value={specs.far} onChange={(e) => onChange({ far: e.target.value })} placeholder="1.5" /></div>
          <div><Label>BCR (%)</Label><input type="text" className={inputClass} style={inputStyle} value={specs.bcr} onChange={(e) => onChange({ bcr: e.target.value })} placeholder="50" /></div>
          <div><Label>Max Floors</Label><input type="text" className={inputClass} style={inputStyle} value={specs.maxFloors} onChange={(e) => onChange({ maxFloors: e.target.value })} placeholder="G+2" /></div>
          <div><Label>Slope (%)</Label><input type="text" className={inputClass} style={inputStyle} value={specs.slopePercent} onChange={(e) => onChange({ slopePercent: e.target.value })} placeholder="5" /></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-0">
          <Toggle label="WASAC Water On-site" checked={specs.waterOnsite} onChange={(v) => onChange({ waterOnsite: v })} />
          <Toggle label="EUCL Electricity On-site" checked={specs.electricityOnsite} onChange={(v) => onChange({ electricityOnsite: v })} />
          <Toggle label="In Wetland Buffer Zone" checked={specs.wetlandBuffer} onChange={(v) => onChange({ wetlandBuffer: v })} />
        </div>
      </div>
    );
  }

  // ─── CAR ───
  if (category === 'car') {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div><Label>Make / Brand</Label><input type="text" className={inputClass} style={inputStyle} value={specs.make} onChange={(e) => onChange({ make: e.target.value })} placeholder="Toyota" /></div>
          <div><Label>Model</Label><input type="text" className={inputClass} style={inputStyle} value={specs.model} onChange={(e) => onChange({ model: e.target.value })} placeholder="RAV4" /></div>
          <div><Label>Year</Label><input type="number" className={inputClass} style={inputStyle} value={specs.year} onChange={(e) => onChange({ year: e.target.value })} /></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div><Label>Mileage (km)</Label><input type="number" className={inputClass} style={inputStyle} value={specs.mileage} onChange={(e) => onChange({ mileage: e.target.value })} /></div>
          <div><Label>Engine (cc)</Label><input type="text" className={inputClass} style={inputStyle} value={specs.engineCc} onChange={(e) => onChange({ engineCc: e.target.value })} placeholder="2000cc" /></div>
          <div><Label>Horsepower</Label><input type="number" className={inputClass} style={inputStyle} value={specs.horsepower} onChange={(e) => onChange({ horsepower: e.target.value })} /></div>
          <div><Label>Seats</Label><input type="number" className={inputClass} style={inputStyle} value={specs.seats} onChange={(e) => onChange({ seats: e.target.value })} /></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <Label>Transmission</Label>
            <select className={cn(inputClass, 'cursor-pointer')} style={inputStyle} value={specs.transmission} onChange={(e) => onChange({ transmission: e.target.value })}>
              <option value="Automatic">Automatic</option><option value="Manual">Manual</option><option value="CVT">CVT</option>
            </select>
          </div>
          <div>
            <Label>Fuel</Label>
            <select className={cn(inputClass, 'cursor-pointer')} style={inputStyle} value={specs.fuelType} onChange={(e) => onChange({ fuelType: e.target.value })}>
              <option value="Petrol">Petrol</option><option value="Diesel">Diesel</option><option value="Hybrid">Hybrid</option><option value="Electric">Electric</option>
            </select>
          </div>
          <div>
            <Label>Drivetrain</Label>
            <select className={cn(inputClass, 'cursor-pointer')} style={inputStyle} value={specs.drivetrain} onChange={(e) => onChange({ drivetrain: e.target.value })}>
              <option value="4WD">4WD</option><option value="AWD">AWD</option><option value="FWD">FWD</option><option value="RWD">RWD</option>
            </select>
          </div>
          <div>
            <Label>Condition</Label>
            <select className={cn(inputClass, 'cursor-pointer')} style={inputStyle} value={specs.condition} onChange={(e) => onChange({ condition: e.target.value })}>
              <option value="Brand New">Brand New</option><option value="Foreign Used (Clean)">Foreign Used (Clean)</option><option value="Locally Used">Locally Used</option><option value="Salvage">Salvage / Rebuilt</option>
            </select>
          </div>
        </div>

        <SectionTitle>Registration & Customs</SectionTitle>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div><Label>Plate Number</Label><input type="text" className={cn(inputClass, 'font-mono')} style={inputStyle} value={specs.plateNumber} onChange={(e) => onChange({ plateNumber: e.target.value })} placeholder="RAD 780 K" /></div>
          <div>
            <Label>Plate Type</Label>
            <select className={cn(inputClass, 'cursor-pointer')} style={inputStyle} value={specs.plateType} onChange={(e) => onChange({ plateType: e.target.value })}>
              <option value="Private">Private (RAx)</option><option value="Government">Government (GR)</option><option value="Diplomatic">Diplomatic (CD)</option><option value="Commercial">Commercial (RC)</option>
            </select>
          </div>
          <div><Label>VIN / Chassis</Label><input type="text" className={cn(inputClass, 'font-mono')} style={inputStyle} value={specs.vinChassis} onChange={(e) => onChange({ vinChassis: e.target.value })} /></div>
        </div>
        <div>
          <Label>RRA Customs Status</Label>
          <select className={cn(inputClass, 'cursor-pointer')} style={inputStyle} value={specs.rraCustoms} onChange={(e) => onChange({ rraCustoms: e.target.value })}>
            <option value="DutyPaid">Duty Paid — Cleared in Rwanda</option><option value="InBond">In Bond — Transit/Warehouse</option><option value="Exempt">Exempt (Diplomatic / NGO)</option>
          </select>
        </div>

        <SectionTitle>Features</SectionTitle>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-0">
          <Toggle label="Air Conditioning" checked={specs.hasAc} onChange={(v) => onChange({ hasAc: v })} />
          <Toggle label="Leather Seats" checked={specs.hasLeather} onChange={(v) => onChange({ hasLeather: v })} />
          <Toggle label="Sunroof" checked={specs.hasSunroof} onChange={(v) => onChange({ hasSunroof: v })} />
          <Toggle label="Reverse Camera" checked={specs.hasReverseCamera} onChange={(v) => onChange({ hasReverseCamera: v })} />
        </div>
      </div>
    );
  }

  // ─── MOTORBIKE ───
  if (category === 'motorbike') {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div><Label>Make</Label><input type="text" className={inputClass} style={inputStyle} value={specs.make} onChange={(e) => onChange({ make: e.target.value })} placeholder="TVS / Boxer" /></div>
          <div><Label>Model</Label><input type="text" className={inputClass} style={inputStyle} value={specs.model} onChange={(e) => onChange({ model: e.target.value })} placeholder="HLX 125" /></div>
          <div><Label>Year</Label><input type="number" className={inputClass} style={inputStyle} value={specs.year} onChange={(e) => onChange({ year: e.target.value })} /></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div><Label>Mileage (km)</Label><input type="number" className={inputClass} style={inputStyle} value={specs.mileage} onChange={(e) => onChange({ mileage: e.target.value })} /></div>
          <div><Label>Engine (cc)</Label><input type="text" className={inputClass} style={inputStyle} value={specs.engineCc} onChange={(e) => onChange({ engineCc: e.target.value })} placeholder="125cc" /></div>
          <div>
            <Label>Condition</Label>
            <select className={cn(inputClass, 'cursor-pointer')} style={inputStyle} value={specs.condition} onChange={(e) => onChange({ condition: e.target.value })}>
              <option value="Brand New">Brand New</option><option value="Foreign Used (Clean)">Foreign Used</option><option value="Locally Used">Locally Used</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Plate Number</Label><input type="text" className={cn(inputClass, 'font-mono')} style={inputStyle} value={specs.plateNumber} onChange={(e) => onChange({ plateNumber: e.target.value })} /></div>
          <div>
            <Label>RRA Customs</Label>
            <select className={cn(inputClass, 'cursor-pointer')} style={inputStyle} value={specs.rraCustoms} onChange={(e) => onChange({ rraCustoms: e.target.value })}>
              <option value="DutyPaid">Duty Paid</option><option value="InBond">In Bond</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-0">
          <Toggle label="Helmet Included" checked={specs.includesHelmet} onChange={(v) => onChange({ includesHelmet: v })} />
          <Toggle label="Delivery Rack" checked={specs.hasDeliveryRack} onChange={(v) => onChange({ hasDeliveryRack: v })} />
        </div>
      </div>
    );
  }

  // ─── COMMERCIAL ───
  if (category === 'commercial') {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div><Label>Total Floors</Label><input type="number" className={inputClass} style={inputStyle} value={specs.commercialFloors} onChange={(e) => onChange({ commercialFloors: e.target.value })} /></div>
          <div><Label>Gross Area (m²)</Label><input type="number" className={inputClass} style={inputStyle} value={specs.grossArea} onChange={(e) => onChange({ grossArea: e.target.value })} /></div>
          <div><Label>Zoning</Label><input type="text" className={inputClass} style={inputStyle} value={specs.commercialZoning} onChange={(e) => onChange({ commercialZoning: e.target.value })} placeholder="Commercial C1" /></div>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-0">
          <Toggle label="Elevator" checked={specs.hasCommercialElevator} onChange={(v) => onChange({ hasCommercialElevator: v })} />
          <Toggle label="Loading Bay" checked={specs.hasLoadingBay} onChange={(v) => onChange({ hasLoadingBay: v })} />
        </div>
      </div>
    );
  }

  return null;
};

export default SpecsForm;
