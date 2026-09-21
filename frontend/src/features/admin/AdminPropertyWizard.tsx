import React, { useState } from 'react';
import {
  Home, MapPin, DollarSign, Building2,
  Image as ImageIcon, Plus, Trash2,
  Save, ArrowLeft, CheckCircle2, Camera,
  Layers, ChevronRight
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';

interface Unit {
  id: string;
  unitNumber: string;
  bedrooms: number;
  bathrooms: number;
  rent: number;
  isAvailable: boolean;
}

interface PropertyBase {
  name: string;
  address: string;
  price: number;
  type: string;
  description: string;
  ownerId: string;
  coverImage: string | null;
}

const AdminPropertyWizard: React.FC = () => {
  const [step, setStep] = useState(1);
  const [property, setProperty] = useState<PropertyBase>({
    name: '',
    address: '',
    price: 0,
    type: '',
    description: '',
    ownerId: '',
    coverImage: null,
  });
  const [units, setUnits] = useState<Unit[]>([]);
  const [gallery, setGallery] = useState<string[]>([]);

  const addUnit = () => {
    const newUnit: Unit = {
      id: Math.random().toString(36).substr(2, 9),
      unitNumber: '',
      bedrooms: 0,
      bathrooms: 0,
      rent: 0,
      isAvailable: true,
    };
    setUnits([...units, newUnit]);
  };

  const removeUnit = (id: string) => {
    setUnits(units.filter(u => u.id !== id));
  };

  const updateUnit = (id: string, field: keyof Unit, value: any) => {
    setUnits(units.map(u => u.id === id ? { ...u, [field]: value } : u));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (step === 1) {
      const reader = new FileReader();
      reader.onload = (ev) => setProperty({ ...property, coverImage: ev.target?.result as string });
      reader.readAsDataURL(files[0]);
    } else {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (ev) => setGallery([...gallery, ev.target?.result as string]);
        reader.readAsDataURL(file);
      });
    }
  };

  return (
    <div className="p-8 lg:p-12 bg-[#05070b] min-h-screen text-zinc-100">
      <div className="max-w-5xl mx-auto">
        {/* Progress Stepper */}
        <div className="flex items-center justify-center gap-4 mb-12">
          {[
            { s: 1, l: 'Base Info' },
            { s: 2, l: 'Units Config' },
            { s: 3, l: 'Media Gallery' },
          ].map((item) => (
            <React.Fragment key={item.s}>
              <div className={cn(
                "flex items-center gap-3 px-6 py-2 rounded-full border transition-all",
                step === item.s ? "bg-emerald-500 border-emerald-500 text-black font-bold" : "bg-white/5 border-white/10 text-zinc-500"
              )}>
                <span className="text-xs">{item.s}</span>
                <span className="text-sm">{item.l}</span>
              </div>
              {item.s < 3 && <div className="h-px w-12 bg-white/10" />}
            </React.Fragment>
          ))}
        </div>

        <div className="rounded-[2.5rem] border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden shadow-2xl">
          <div className="p-8 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500 text-black">
                <Building2 size={24} />
              </div>
              <h2 className="text-2xl font-bold text-white">Property Asset Wizard</h2>
            </div>
            <div className="text-xs font-mono text-zinc-500">STEP {step} / 3</div>
          </div>

          <div className="p-12">
            {step === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Property Name</label>
                    <div className="relative">
                      <Home size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input
                        type="text"
                        className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 pl-10 pr-4 text-white outline-none focus:ring-2 focus:ring-emerald-500/50"
                        placeholder="e.g., Emerald Heights"
                        value={property.name}
                        onChange={(e) => setProperty({...property, name: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Full Address</label>
                    <div className="relative">
                      <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input
                        type="text"
                        className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 pl-10 pr-4 text-white outline-none focus:ring-2 focus:ring-emerald-500/50"
                        placeholder="Kigali, Rwanda"
                        value={property.address}
                        onChange={(e) => setProperty({...property, address: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Listing Price</label>
                    <div className="relative">
                      <DollarSign size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input
                        type="number"
                        className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 pl-10 pr-4 text-white outline-none focus:ring-2 focus:ring-emerald-500/50"
                        placeholder="0"
                        value={property.price}
                        onChange={(e) => setProperty({...property, price: Number(e.target.value)})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Property Type</label>
                    <select
                      className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 px-4 text-white outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none"
                      value={property.type}
                      onChange={(e) => setProperty({...property, type: e.target.value})}
                    >
                      <option value="">Select Type</option>
                      <option value="Apartment">Apartment</option>
                      <option value="House">House</option>
                      <option value="Commercial">Commercial</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Detailed Description</label>
                  <textarea
                    rows={4}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white outline-none focus:ring-2 focus:ring-emerald-500/50"
                    placeholder="Describe the asset features, amenities, and unique selling points..."
                    value={property.description}
                    onChange={(e) => setProperty({...property, description: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Cover Image</label>
                  <div className="relative group h-48 w-full rounded-3xl border-2 border-dashed border-white/10 bg-white/[0.02] flex flex-col items-center justify-center overflow-hidden transition-all hover:border-emerald-500/40">
                    {property.coverImage ? (
                      <>
                        <img src={property.coverImage} className="absolute inset-0 w-full h-full object-cover" alt="Preview" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button variant="ghost" className="bg-white/10 backdrop-blur-md text-white" onClick={() => setProperty({...property, coverImage: null})}>
                            Change Image
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <Camera size={40} className="text-zinc-600 mb-3" />
                        <span className="text-sm text-zinc-500">Upload Primary Asset Photo</span>
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} accept="image/*" />
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold text-white">Unit Configuration</h3>
                    <p className="text-zinc-400 text-sm">Define individual units within this property container.</p>
                  </div>
                  <Button onClick={addUnit} variant="primary" className="bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2">
                    <Plus size={18} /> Add Unit
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {units.length === 0 && (
                    <div className="p-20 text-center rounded-3xl border border-dashed border-white/10 bg-white/[0.01]">
                      <Layers size={48} className="mx-auto text-zinc-700 mb-4" />
                      <p className="text-zinc-500">No units defined yet. Add your first unit to start.</p>
                    </div>
                  )}
                  {units.map((unit, index) => (
                    <div key={unit.id} className="p-6 rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl grid grid-cols-1 md:grid-cols-5 gap-6 items-end animate-in zoom-in-95 duration-200">
                      <div className="md:col-span-1 space-y-2">
                        <label className="text-[10px] font-bold uppercase text-zinc-500">Unit #{index + 1}</label>
                        <input
                          type="text"
                          className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-emerald-500/50"
                          placeholder="e.g. A1"
                          value={unit.unitNumber}
                          onChange={(e) => updateUnit(unit.id, 'unitNumber', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase text-zinc-500">Bedrooms</label>
                        <input
                          type="number"
                          className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-emerald-500/50"
                          value={unit.bedrooms}
                          onChange={(e) => updateUnit(unit.id, 'bedrooms', Number(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase text-zinc-500">Bathrooms</label>
                        <input
                          type="number"
                          className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-emerald-500/50"
                          value={unit.bathrooms}
                          onChange={(e) => updateUnit(unit.id, 'bathrooms', Number(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase text-zinc-500">Monthly Rent</label>
                        <input
                          type="number"
                          className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-emerald-500/50"
                          value={unit.rent}
                          onChange={(e) => updateUnit(unit.id, 'rent', Number(e.target.value))}
                        />
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded bg-black border-white/10 text-emerald-500 focus:ring-emerald-500"
                            checked={unit.isAvailable}
                            onChange={(e) => updateUnit(unit.id, 'isAvailable', e.target.checked)}
                          />
                          <span className="text-xs text-zinc-400">Available</span>
                        </div>
                        <Button variant="ghost" onClick={() => removeUnit(unit.id)} className="p-2 text-zinc-500 hover:text-red-400">
                          <Trash2 size={18} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold text-white">Media Gallery</h3>
                    <p className="text-zinc-400 text-sm">Upload high-resolution assets to create the digital showroom.</p>
                  </div>
                  <div className="relative group h-12 w-48">
                    <input
                      type="file"
                      multiple
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      onChange={handleImageUpload}
                      accept="image/*"
                    />
                    <div className="absolute inset-0 flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 text-zinc-300 group-hover:bg-white/10 transition-all">
                      <ImageIcon size={18} />
                      <span className="text-sm font-bold">Add Photos</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {gallery.length === 0 && (
                    <div className="col-span-full p-20 text-center rounded-3xl border border-dashed border-white/10 bg-white/[0.01]">
                      <ImageIcon size={48} className="mx-auto text-zinc-700 mb-4" />
                      <p className="text-zinc-500">No gallery images uploaded yet.</p>
                    </div>
                  )}
                  {gallery.map((img, idx) => (
                    <div key={idx} className="group relative aspect-square rounded-2xl overflow-hidden border border-white/10 bg-zinc-900">
                      <img src={img} className="w-full h-full object-cover" alt={`Gallery ${idx}`} />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button variant="ghost" className="bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white p-2 rounded-full" onClick={() => setGallery(gallery.filter((_, i) => i !== idx))}>
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="p-8 border-t border-white/10 bg-white/[0.02] flex justify-between">
            <Button
              variant="ghost"
              onClick={() => setStep(s => Math.max(1, s - 1))}
              disabled={step === 1}
              className={cn("flex items-center gap-2 px-6 py-3 rounded-2xl font-bold", step === 1 ? "opacity-0 pointer-events-none" : "text-zinc-400 hover:text-white")}
            >
              <ArrowLeft size={18} /> Previous
            </Button>

            {step < 3 ? (
              <Button
                onClick={() => setStep(s => s + 1)}
                variant="primary"
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2"
              >
                Continue <ChevronRight size={18} />
              </Button>
            ) : (
              <Button
                onClick={() => alert('Property and Units Saved!')}
                variant="primary"
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2"
              >
                <Save size={18} /> Publish Property
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPropertyWizard;
