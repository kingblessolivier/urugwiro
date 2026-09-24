import React from 'react';
import {
  Home, Building2, Landmark, Car, Bike, Hotel,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export type WizardCategory = 'house' | 'apartment' | 'land' | 'car' | 'motorbike' | 'commercial';

interface CategoryOption {
  id: WizardCategory;
  label: string;
  desc: string;
  icon: React.ElementType;
}

const CATEGORIES: CategoryOption[] = [
  { id: 'house', label: 'House', desc: 'Standalone home with compound', icon: Home },
  { id: 'apartment', label: 'Apartment', desc: 'Units, floors, or entire building', icon: Building2 },
  { id: 'land', label: 'Land', desc: 'Plots with UPI cadastre', icon: Landmark },
  { id: 'car', label: 'Car', desc: 'Vehicles & fleet', icon: Car },
  { id: 'motorbike', label: 'Motorbike', desc: 'Motorcycles & scooters', icon: Bike },
  { id: 'commercial', label: 'Commercial', desc: 'Offices, hotels, retail', icon: Hotel },
];

interface CategorySelectorProps {
  selected: WizardCategory | null;
  onSelect: (cat: WizardCategory) => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({ selected, onSelect }) => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2
          className="text-2xl font-bold tracking-tight"
          style={{ color: 'var(--color-text-main)' }}
        >
          What are you listing?
        </h2>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Select the type of asset you want to list on Urugwiro
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {CATEGORIES.map((cat) => {
          const isSelected = selected === cat.id;
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelect(cat.id)}
              className={cn(
                'relative group flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all duration-200 cursor-pointer text-center',
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
                  'w-14 h-14 rounded-2xl flex items-center justify-center transition-colors',
                  isSelected
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-white/[0.04] text-zinc-500 group-hover:text-zinc-300',
                )}
              >
                <Icon size={26} />
              </div>
              <div>
                <p
                  className={cn(
                    'text-sm font-bold',
                    isSelected ? 'text-emerald-400' : '',
                  )}
                  style={!isSelected ? { color: 'var(--color-text-main)' } : undefined}
                >
                  {cat.label}
                </p>
                <p
                  className="text-[11px] mt-0.5"
                  style={{ color: 'var(--color-text-dim)' }}
                >
                  {cat.desc}
                </p>
              </div>
              {isSelected && (
                <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
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

export default CategorySelector;
