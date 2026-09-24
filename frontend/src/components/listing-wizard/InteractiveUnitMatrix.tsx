import React, { useState } from 'react';
import { Building2, Plus, Trash2, Eye, DoorOpen, ChevronUp, ChevronDown, Info, Maximize2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ApartmentUnit {
  unitId: string;
  bedrooms: number;
  bathrooms: number;
  areaSqm: number;
  view: string;
  price: number;
  status: 'available' | 'sold' | 'reserved' | 'rented';
}

export interface FloorPlan {
  floor: number;
  units: ApartmentUnit[];
}

type SellingMode = 'whole_building' | 'per_floor' | 'per_unit';

interface InteractiveUnitMatrixProps {
  sellingMode: SellingMode;
  onSellingModeChange: (mode: SellingMode) => void;
  totalFloors: number;
  onTotalFloorsChange: (n: number) => void;
  floorPlan: FloorPlan[];
  onFloorPlanChange: (plan: FloorPlan[]) => void;
  /** Read-only mode for listing detail view */
  readOnly?: boolean;
  /** Selected unit (for highlighting) */
  selectedUnit?: string;
  onSelectUnit?: (unit: ApartmentUnit, floor: number) => void;
}

const VIEW_OPTIONS = [
  'City Skyline', 'Garden / Courtyard', 'Street View', 'Mountain View',
  'Lake View', 'Golf Course', 'Pool Side', 'Parking Side',
];

const InteractiveUnitMatrix: React.FC<InteractiveUnitMatrixProps> = ({
  sellingMode,
  onSellingModeChange,
  totalFloors,
  onTotalFloorsChange,
  floorPlan,
  onFloorPlanChange,
  readOnly = false,
  selectedUnit,
  onSelectUnit,
}) => {
  const [expandedFloor, setExpandedFloor] = useState<number | null>(null);

  const inputClass = 'w-full rounded-lg border px-2.5 py-1.5 text-xs outline-none transition-all focus:border-emerald-500/50';
  const inputStyle = {
    background: 'var(--color-input-bg)',
    borderColor: 'var(--color-input-border)',
    color: 'var(--color-text-main)',
  };

  const initializeFloors = (numFloors: number) => {
    onTotalFloorsChange(numFloors);
    const plan: FloorPlan[] = [];
    for (let f = 1; f <= numFloors; f++) {
      const existing = floorPlan.find((fp) => fp.floor === f);
      plan.push(existing || { floor: f, units: [] });
    }
    onFloorPlanChange(plan);
  };

  const addUnit = (floorIndex: number) => {
    const updated = [...floorPlan];
    const floor = updated[floorIndex];
    const unitNum = `${floor.floor}0${floor.units.length + 1}`;
    floor.units.push({
      unitId: unitNum,
      bedrooms: 2,
      bathrooms: 1,
      areaSqm: 80,
      view: 'City Skyline',
      price: 0,
      status: 'available',
    });
    onFloorPlanChange(updated);
  };

  const removeUnit = (floorIndex: number, unitIndex: number) => {
    const updated = [...floorPlan];
    updated[floorIndex].units.splice(unitIndex, 1);
    onFloorPlanChange(updated);
  };

  const updateUnit = (floorIndex: number, unitIndex: number, field: keyof ApartmentUnit, value: any) => {
    const updated = [...floorPlan];
    (updated[floorIndex].units[unitIndex] as any)[field] = value;
    onFloorPlanChange(updated);
  };

  const totalUnits = floorPlan.reduce((sum, f) => sum + f.units.length, 0);

  return (
    <div className="space-y-5">
      {!readOnly && (
        <div className="space-y-3">
          <label className="text-[11px] font-bold uppercase tracking-wider block" style={{ color: 'var(--color-text-muted)' }}>
            How is this apartment being sold/rented?
          </label>
          <div className="grid grid-cols-3 gap-2">
            {([
              { mode: 'whole_building' as SellingMode, label: 'Entire Building', desc: 'Sell the whole building' },
              { mode: 'per_floor' as SellingMode, label: 'Per Floor', desc: 'Price per floor level' },
              { mode: 'per_unit' as SellingMode, label: 'Per Unit / Room', desc: 'Individual units' },
            ]).map(({ mode, label, desc }) => (
              <button
                key={mode}
                type="button"
                onClick={() => onSellingModeChange(mode)}
                className={cn(
                  'p-3 rounded-xl border-2 text-center transition-all cursor-pointer',
                  sellingMode === mode
                    ? 'border-emerald-500 shadow-sm shadow-emerald-500/10'
                    : 'border-transparent hover:border-white/10',
                )}
                style={{
                  background: sellingMode === mode
                    ? 'rgba(16, 185, 129, 0.08)'
                    : 'var(--color-input-bg, rgba(255,255,255,0.03))',
                }}
              >
                <p className={cn('text-xs font-bold', sellingMode === mode ? 'text-emerald-400' : '')}
                  style={sellingMode !== mode ? { color: 'var(--color-text-main)' } : undefined}>
                  {label}
                </p>
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-dim)' }}>{desc}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {!readOnly && (
        <div className="flex items-center gap-4">
          <label className="text-[11px] font-bold uppercase tracking-wider shrink-0" style={{ color: 'var(--color-text-muted)' }}>
            Total Floors
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => totalFloors > 1 && initializeFloors(totalFloors - 1)}
              className="w-8 h-8 rounded-lg flex items-center justify-center border cursor-pointer transition-colors hover:border-emerald-500/30"
              style={{ ...inputStyle }}
            >
              <ChevronDown size={14} />
            </button>
            <span className="text-lg font-bold font-mono w-8 text-center" style={{ color: 'var(--color-text-main)' }}>
              {totalFloors}
            </span>
            <button
              type="button"
              onClick={() => initializeFloors(totalFloors + 1)}
              className="w-8 h-8 rounded-lg flex items-center justify-center border cursor-pointer transition-colors hover:border-emerald-500/30"
              style={{ ...inputStyle }}
            >
              <ChevronUp size={14} />
            </button>
          </div>
          <span className="text-[10px]" style={{ color: 'var(--color-text-dim)' }}>
            {totalUnits} unit{totalUnits !== 1 ? 's' : ''} total
          </span>
        </div>
      )}

      <div className="space-y-3 relative">
        {[...floorPlan].reverse().map((floor, reversedIdx) => {
          const floorIndex = floorPlan.length - 1 - reversedIdx;
          const isExpanded = expandedFloor === floor.floor;
          const isTopFloor = floor.floor === totalFloors;

          return (
            <div key={floor.floor} className="group">
              <button
                type="button"
                onClick={() => setExpandedFloor(isExpanded ? null : floor.floor)}
                className={cn(
                  'w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all cursor-pointer',
                  isExpanded ? 'border-emerald-500/40 bg-emerald-500/[0.06]' : 'border-white/10 hover:border-white/20 bg-white/[0.02]',
                  isTopFloor && 'rounded-t-2xl',
                  floor.floor === 1 && 'rounded-b-2xl',
                )}
              >
                <div className="flex items-center gap-3">
                  <Building2 size={16} className={cn(isExpanded ? 'text-emerald-400' : 'text-zinc-500')} />
                  <span className="text-sm font-bold" style={{ color: 'var(--color-text-main)' }}>
                    {isTopFloor && floor.floor > 2 ? 'Rooftop / Penthouse' : `Floor ${floor.floor}`}
                    {floor.floor === 1 && ' (Ground)'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-semibold text-zinc-500">
                    {floor.units.length} unit{floor.units.length !== 1 ? 's' : ''}
                  </span>
                  {isExpanded ? <ChevronUp size={14} className="text-emerald-400" /> : <ChevronDown size={14} className="text-zinc-500" />}
                </div>
              </button>

              {isExpanded && (
                <div className="mt-2 ml-2 p-4 rounded-2xl border border-emerald-500/10 bg-emerald-500/[0.02] animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pb-3">
                    {floor.units.map((unit, unitIdx) => {
                      const isUnitSelected = selectedUnit === unit.unitId;
                      return (
                        <div
                          key={unit.unitId}
                          onClick={() => onSelectUnit?.(unit, floor.floor)}
                          className={cn(
                            'relative aspect-square rounded-xl border p-3 transition-all cursor-pointer flex flex-col items-center justify-center text-center group/unit overflow-hidden',
                            isUnitSelected
                              ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-500/[0.1] scale-105 z-10'
                              : 'border-white/10 bg-white/[0.02] hover:border-emerald-500/50 hover:bg-emerald-500/[0.05]',
                          )}
                        >
                          {readOnly ? (
                            <div className="flex flex-col items-center gap-1">
                              <div className={cn(
                                "w-2 h-2 rounded-full mb-1",
                                unit.status === 'available' ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]' :
                                unit.status === 'reserved' ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]' : 'bg-zinc-600'
                              )} />
                              <span className="text-xs font-bold text-white">{unit.unitId}</span>
                              <span className="text-[9px] text-zinc-500">{unit.bedrooms}BR · {unit.areaSqm}m²</span>
                            </div>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                               <span className="text-xs font-bold text-white">{unit.unitId}</span>
                            </div>
                          )}
                          <div className="absolute inset-0 opacity-0 group-hover/unit:opacity-100 transition-opacity flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                            <Maximize2 size={14} className="text-emerald-400" />
                          </div>
                        </div>
                      );
                    })}
                    {!readOnly && (
                      <button
                        type="button"
                        onClick={() => addUnit(floorIndex)}
                        className="aspect-square rounded-xl border border-dashed border-white/10 flex flex-col items-center justify-center text-zinc-500 hover:text-emerald-400 hover:border-emerald-500/30 transition-all cursor-pointer group/add"
                      >
                        <Plus size={16} className="group-hover/add:scale-110 transition-transform" />
                        <span className="text-[9px] font-bold uppercase mt-1">Add Unit</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!readOnly && floorPlan.length === 0 && (
        <button
          type="button"
          onClick={() => initializeFloors(3)}
          className="w-full py-4 rounded-2xl border-2 border-dashed border-emerald-500/30 text-emerald-400 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer hover:border-emerald-500/50 transition-colors"
        >
          <Building2 size={18} /> Start with 3 floors
        </button>
      )}
    </div>
  );
};

export default InteractiveUnitMatrix;
