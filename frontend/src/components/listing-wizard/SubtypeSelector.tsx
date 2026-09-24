import React from 'react';
import {
  Home, Building, Castle, Warehouse, DoorOpen,
  BedSingle, Crown, Layers,
  TreePine, Factory, Store, MapPin,
  Car, Truck, Bus, Bike,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { WizardCategory } from './CategorySelector';

interface SubtypeOption {
  id: string;
  label: string;
  desc: string;
  icon: React.ElementType;
}

const SUBTYPES: Record<WizardCategory, SubtypeOption[]> = {
  house: [
    { id: 'SingleFamily', label: 'Family Home', desc: '3-4 bed, garden, compound', icon: Home },
    { id: 'ModestHouse', label: 'Starter Home', desc: '2-3 bed, basic utilities', icon: DoorOpen },
    { id: 'Villa', label: 'Luxury Villa', desc: '5+ bed, pool, staff, generator', icon: Castle },
    { id: 'Townhouse', label: 'Townhouse', desc: 'Multi-level attached urban', icon: Building },
  ],
  apartment: [
    { id: 'Studio', label: 'Studio', desc: '~35-50 m², open plan', icon: BedSingle },
    { id: 'Apartment_1Bed', label: '1-Bedroom', desc: '~55-75 m²', icon: DoorOpen },
    { id: 'Apartment_2Bed', label: '2-Bedroom', desc: '~80-110 m²', icon: Home },
    { id: 'Apartment_3Bed', label: '3-Bedroom', desc: '~120-160 m²', icon: Building },
    { id: 'Penthouse', label: 'Penthouse', desc: 'Top floor, premium views', icon: Crown },
    { id: 'Duplex', label: 'Duplex', desc: '2-level apartment unit', icon: Layers },
  ],
  land: [
    { id: 'Residential_Plot', label: 'Residential Plot', desc: 'R1/R2 zoned for homes', icon: MapPin },
    { id: 'Commercial_Land', label: 'Commercial Land', desc: 'C1/C2 offices, retail', icon: Store },
    { id: 'Agricultural', label: 'Agricultural', desc: 'Farming, horticulture', icon: TreePine },
    { id: 'Industrial', label: 'Industrial', desc: 'Warehouse, logistics', icon: Factory },
  ],
  car: [
    { id: 'SUV', label: 'SUV / 4×4', desc: 'High clearance off-road', icon: Car },
    { id: 'Sedan', label: 'Sedan', desc: 'Executive saloon car', icon: Car },
    { id: 'Pickup', label: 'Pickup Truck', desc: 'Utility workhorse', icon: Truck },
    { id: 'Minibus', label: 'Minibus / Van', desc: 'Passenger or cargo', icon: Bus },
    { id: 'Hatchback', label: 'Hatchback', desc: 'Compact city car', icon: Car },
  ],
  motorbike: [
    { id: 'Commuter', label: 'Commuter', desc: '100-150cc daily rider', icon: Bike },
    { id: 'Sport', label: 'Sport Bike', desc: '250cc+ performance', icon: Bike },
    { id: 'Delivery', label: 'Delivery / Cargo', desc: 'With rack, commercial', icon: Bike },
    { id: 'Scooter', label: 'Scooter', desc: 'Step-through urban', icon: Bike },
  ],
  commercial: [
    { id: 'Office', label: 'Office Space', desc: 'Grade-A corporate floor', icon: Building },
    { id: 'Retail', label: 'Retail / Mall', desc: 'Shopping or ground-floor', icon: Store },
    { id: 'Hotel', label: 'Hotel / Lodge', desc: 'Hospitality property', icon: Castle },
    { id: 'Warehouse', label: 'Warehouse', desc: 'Storage or logistics', icon: Warehouse },
  ],
};

interface SubtypeSelectorProps {
  category: WizardCategory;
  selected: string | null;
  onSelect: (subtype: string) => void;
}

const SubtypeSelector: React.FC<SubtypeSelectorProps> = ({ category, selected, onSelect }) => {
  const options = SUBTYPES[category] || [];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2
          className="text-2xl font-bold tracking-tight"
          style={{ color: 'var(--color-text-main)' }}
        >
          Choose the type
        </h2>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Select the specific type that best describes your listing
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {options.map((opt) => {
          const isSelected = selected === opt.id;
          const Icon = opt.icon;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelect(opt.id)}
              className={cn(
                'relative group flex flex-col items-center gap-2.5 p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer text-center',
                isSelected
                  ? 'border-emerald-500 shadow-lg shadow-emerald-500/10'
                  : 'border-transparent hover:border-white/10',
              )}
              style={{
                background: isSelected
                  ? 'rgba(16, 185, 129, 0.08)'
                  : 'var(--color-input-bg, rgba(255,255,255,0.03))',
              }}
            >
              <div
                className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center transition-colors',
                  isSelected
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-white/[0.04] text-zinc-500 group-hover:text-zinc-300',
                )}
              >
                <Icon size={22} />
              </div>
              <div>
                <p
                  className={cn('text-sm font-bold', isSelected ? 'text-emerald-400' : '')}
                  style={!isSelected ? { color: 'var(--color-text-main)' } : undefined}
                >
                  {opt.label}
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-text-dim)' }}>
                  {opt.desc}
                </p>
              </div>
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export { SUBTYPES };
export default SubtypeSelector;
