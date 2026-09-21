import React, { useState } from 'react';
import {
  ShieldCheck,
  Building2,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  FileCheck2,
  AlertCircle,
  Home,
  Layers,
  Car,
  Check,
  Copy,
  Fuel,
  Gauge,
  Zap,
  Droplets,
  Warehouse,
  Compass,
  CheckSquare,
  Square
} from 'lucide-react';
import { api } from '../../api/endpoints';
import type { AppView } from '../../types/navigation';
import { Button } from '../../components/ui/Button';

interface AssetProposalPageProps {
  onNavigate?: (view: AppView) => void;
}

const RWANDA_DISTRICTS = [
  'Gasabo (Kigali)',
  'Kicukiro (Kigali)',
  'Nyarugenge (Kigali)',
  'Bugesera (Eastern)',
  'Rwamagana (Eastern)',
  'Kayonza (Eastern)',
  'Musanze (Northern)',
  'Gicumbi (Northern)',
  'Rubavu (Western)',
  'Karongi (Western)',
  'Huye (Southern)',
  'Muhanga (Southern)',
];

const ASSET_TYPES = [
  { id: 'house', label: 'Residential Villa / House', icon: Home, desc: 'Single-family homes, luxury villas, estates' },
  { id: 'apartment', label: 'Apartment / Condominium', icon: Building2, desc: 'Penthouses, residential units, blocks' },
  { id: 'land', label: 'Land Parcel', icon: Layers, desc: 'Titled land, commercial plots, agricultural' },
  { id: 'commercial', label: 'Commercial Complex', icon: Warehouse, desc: 'Retail plazas, warehouses, office spaces' },
  { id: 'vehicle', label: 'Mobility / Vehicle', icon: Car, desc: 'Executive SUVs, luxury sedans, commercial fleet' },
];

const VEHICLE_MAKES = [
  'Toyota',
  'Mercedes-Benz',
  'Land Rover',
  'BMW',
  'Audi',
  'Hyundai',
  'Nissan',
  'Lexus',
  'Ford',
  'Volkswagen',
  'Kia',
  'Mitsubishi',
  'Suzuki',
  'Other'
];

export const AssetProposalPage: React.FC<AssetProposalPageProps> = ({ onNavigate }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Owner Details
    full_name: '',
    phone_number: '',
    email: '',
    id_number: '',
    owner_relationship: 'direct_owner',

    // Step 2: Asset Proposal (General)
    title: '',
    asset_type: 'house',
    sub_type: 'Luxury Villa',
    purpose: 'sale',
    district: 'Gasabo (Kigali)',
    sector: '',
    cell: '',
    address: '',
    proposed_price: '',
    currency: 'RWF',
    description: '',

    // Residential & Apartment Specs
    size_sqm: '',
    compound_size_sqm: '',
    bedrooms: '4',
    bathrooms: '3',
    year_built: '',
    floor_number: '',
    monthly_service_charge: '',
    is_furnished: false,
    has_swimming_pool: false,
    has_staff_quarters: false,
    has_garden: true,
    has_water_tank: true,
    has_backup_generator: false,
    has_elevator: false,
    balcony: false,

    // Land Specifics
    land_upi: '',
    zoning_code: 'R1',
    terrain: 'Flat',
    road_access: true,
    road_type: 'Asphalt / Tarmac',
    water_onsite: false,
    electricity_onsite: false,
    drainage_system: 'Covered Channel',

    // Commercial Specifics
    commercial_type: 'Office',
    total_floors: '3',
    parking_spaces: '10',
    loading_bays: '0',
    power_capacity: '',

    // Vehicle Specifics
    vehicle_type: 'Car',
    make: 'Toyota',
    model: '',
    year: '2022',
    mileage: '',
    fuel_type: 'Petrol',
    transmission: 'Automatic',
    engine_capacity: '2800cc',
    condition: 'Used Local',
    body_type: 'SUV',
    seating_capacity: '5',
    plate_type: 'Private (RAx)',
    controle_technique: true,
    has_insurance: true,

    // Step 3: Visit Scheduling
    preferred_visit_date: '',
    preferred_time_slot: 'morning',
    site_contact_name: '',
    site_contact_phone: '',
    site_access_notes: '',
  });

  // Generated Proposal response
  const [submittedProposal, setSubmittedProposal] = useState<any>(null);

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAssetTypeChange = (typeId: string) => {
    let defaultSubType = '';
    if (typeId === 'house') defaultSubType = 'Luxury Villa';
    else if (typeId === 'apartment') defaultSubType = 'Luxury Apartment';
    else if (typeId === 'land') defaultSubType = 'Residential Plot';
    else if (typeId === 'commercial') defaultSubType = 'Commercial Office';
    else if (typeId === 'vehicle') defaultSubType = 'Executive SUV';

    setFormData((prev) => ({
      ...prev,
      asset_type: typeId,
      sub_type: defaultSubType
    }));
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (step === 1) {
      if (!formData.full_name.trim() || !formData.phone_number.trim() || !formData.email.trim()) {
        setError('Please fill in your full name, phone number, and email.');
        return;
      }
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (step === 2) {
      // Validate per asset category
      if (formData.asset_type === 'vehicle') {
        if (!formData.make.trim() || !formData.model.trim() || !formData.proposed_price || !formData.address.trim()) {
          setError('Please provide Vehicle Make, Model, Asking Price, and Current Inspection Location.');
          return;
        }
        if (!formData.title.trim()) {
          updateField('title', `${formData.year} ${formData.make} ${formData.model} (${formData.body_type})`);
        }
      } else if (formData.asset_type === 'land') {
        if (!formData.title.trim() || !formData.proposed_price || !formData.address.trim()) {
          setError('Please provide a title, land address/location, and proposed asking price.');
          return;
        }
        if (!formData.land_upi.trim()) {
          setError('Rwandan Land UPI Number is required for land onboarding.');
          return;
        }
        if (!formData.size_sqm) {
          setError('Please provide the total land area in square meters (m²).');
          return;
        }
      } else {
        // house, apartment, commercial
        if (!formData.title.trim() || !formData.proposed_price || !formData.address.trim()) {
          setError('Please provide a listing title, address, and proposed asking price.');
          return;
        }
      }
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const specifications: Record<string, any> = {};

      if (formData.asset_type === 'vehicle') {
        specifications.vehicle_type = formData.vehicle_type;
        specifications.make = formData.make;
        specifications.model = formData.model;
        specifications.year = parseInt(formData.year, 10) || 2022;
        specifications.mileage = parseInt(formData.mileage, 10) || 0;
        specifications.fuel_type = formData.fuel_type;
        specifications.transmission = formData.transmission;
        specifications.engine_capacity = formData.engine_capacity;
        specifications.condition = formData.condition;
        specifications.body_type = formData.body_type;
        specifications.seating_capacity = parseInt(formData.seating_capacity, 10) || 5;
        specifications.plate_type = formData.plate_type;
        specifications.controle_technique = formData.controle_technique;
        specifications.has_insurance = formData.has_insurance;
      } else if (formData.asset_type === 'land') {
        specifications.zoning_code = formData.zoning_code;
        specifications.terrain = formData.terrain;
        specifications.road_access = formData.road_access;
        specifications.road_type = formData.road_type;
        specifications.water_onsite = formData.water_onsite;
        specifications.electricity_onsite = formData.electricity_onsite;
        specifications.drainage_system = formData.drainage_system;
      } else if (formData.asset_type === 'commercial') {
        specifications.commercial_type = formData.commercial_type;
        specifications.total_floors = formData.total_floors ? parseInt(formData.total_floors, 10) : null;
        specifications.parking_spaces = formData.parking_spaces ? parseInt(formData.parking_spaces, 10) : 0;
        specifications.loading_bays = formData.loading_bays ? parseInt(formData.loading_bays, 10) : 0;
        specifications.power_capacity = formData.power_capacity;
        specifications.has_backup_generator = formData.has_backup_generator;
      } else {
        // house & apartment
        specifications.sub_type = formData.sub_type;
        specifications.compound_size_sqm = formData.compound_size_sqm ? parseFloat(formData.compound_size_sqm) : null;
        specifications.year_built = formData.year_built ? parseInt(formData.year_built, 10) : null;
        specifications.floor_number = formData.floor_number ? parseInt(formData.floor_number, 10) : null;
        specifications.monthly_service_charge = formData.monthly_service_charge ? parseFloat(formData.monthly_service_charge) : null;
        specifications.is_furnished = formData.is_furnished;
        specifications.has_swimming_pool = formData.has_swimming_pool;
        specifications.has_staff_quarters = formData.has_staff_quarters;
        specifications.has_garden = formData.has_garden;
        specifications.has_water_tank = formData.has_water_tank;
        specifications.has_backup_generator = formData.has_backup_generator;
        specifications.has_elevator = formData.has_elevator;
        specifications.balcony = formData.balcony;
      }

      const effectiveTitle = formData.title.trim() ||
        (formData.asset_type === 'vehicle' ? `${formData.year} ${formData.make} ${formData.model}` : `${formData.sub_type} in ${formData.district}`);

      const payload = {
        ...formData,
        title: effectiveTitle,
        sub_type: formData.sub_type || (formData.asset_type === 'vehicle' ? formData.body_type : formData.asset_type),
        proposed_price: parseFloat(formData.proposed_price) || 0,
        size_sqm: formData.asset_type !== 'vehicle' && formData.size_sqm ? parseFloat(formData.size_sqm) : null,
        bedrooms: ['house', 'apartment'].includes(formData.asset_type) && formData.bedrooms ? parseInt(formData.bedrooms, 10) : null,
        bathrooms: ['house', 'apartment'].includes(formData.asset_type) && formData.bathrooms ? parseInt(formData.bathrooms, 10) : null,
        land_upi: formData.asset_type === 'vehicle' ? '' : formData.land_upi,
        specifications,
      };

      const response = await api.proposals.create(payload);
      setSubmittedProposal(response.data?.proposal);
      setStep(4);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Failed to submit proposal:', err);
      const errMsg = err.response?.data?.error ||
        (typeof err.response?.data === 'object' ? Object.values(err.response.data)[0] : null) ||
        err.message || 'Failed to submit asset proposal. Please review your entries.';
      setError(Array.isArray(errMsg) ? errMsg[0] : String(errMsg));
    } finally {
      setLoading(false);
    }
  };

  const copyProposalCode = () => {
    if (submittedProposal?.proposal_code) {
      navigator.clipboard.writeText(submittedProposal.proposal_code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070b] text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Ambient Lights */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-emerald-500/5 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-[#f98604]/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header Title */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-4 tracking-wider uppercase">
            <ShieldCheck size={14} />
            <span>Official Urugwiro Asset Intake & Verification</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-white mb-3">
            List Your Property on Urugwiro
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base max-w-2xl mx-auto">
            Submit your asset specifications below. Our certified surveyors inspect and verify cadastral data before publication to guarantee buyers maximum authenticity and prestige.
          </p>
        </div>

        {/* Stepper Progress Bar */}
        {step !== 4 && (
          <div className="mb-10">
            <div className="flex items-center justify-between relative max-w-2xl mx-auto">
              {/* Connector line */}
              <div className="absolute top-1/2 left-0 w-full -translate-y-1/2 h-0.5 bg-white/10 z-0" />
              <div
                className="absolute top-1/2 left-0 -translate-y-1/2 h-0.5 bg-emerald-500 transition-all duration-500 z-0"
                style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
              />

              {/* Step 1 Pill */}
              <div className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    step >= 1
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                      : 'bg-[#0f1422] border border-white/20 text-zinc-400'
                  }`}
                >
                  {step > 1 ? <Check size={16} /> : '1'}
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider mt-2 text-zinc-300">Identity & Role</span>
              </div>

              {/* Step 2 Pill */}
              <div className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    step >= 2
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                      : 'bg-[#0f1422] border border-white/20 text-zinc-400'
                  }`}
                >
                  {step > 2 ? <Check size={16} /> : '2'}
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider mt-2 text-zinc-300">Asset Specifications</span>
              </div>

              {/* Step 3 Pill */}
              <div className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    step === 3
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                      : 'bg-[#0f1422] border border-white/20 text-zinc-400'
                  }`}
                >
                  3
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider mt-2 text-zinc-300">Surveyor Visit</span>
              </div>
            </div>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl border border-red-500/30 bg-red-500/10 text-red-300 flex items-start gap-3 text-sm animate-fade-in">
            <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {/* ━━━ STEP 1: OWNER IDENTITY & RELATIONSHIP ━━━ */}
        {step === 1 && (
          <form onSubmit={handleNext} className="space-y-6 rounded-3xl border border-white/10 bg-[#080c14]/90 p-6 sm:p-10 backdrop-blur-2xl shadow-2xl">
            <div className="border-b border-white/[0.08] pb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 flex items-center gap-2.5">
                <User size={20} className="text-emerald-400" />
                <span>1. Submitter Identity & Legal Relationship</span>
              </h2>
              <p className="text-zinc-400 text-xs sm:text-sm">
                We verify ownership and mandate credentials to prevent fraudulent listings and preserve title trust.
              </p>
            </div>

            {/* Relationship to Property */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                Your Relationship to this Asset *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: 'direct_owner', label: 'Direct Property Owner', desc: 'Title deed or registration document is in your personal or company name' },
                  { id: 'representative', label: 'Authorized Representative (POA)', desc: 'You hold legal Power of Attorney or notarized authorization' },
                  { id: 'broker', label: 'Licensed Real Estate Broker', desc: 'Operating with an active mandate or agency listing agreement' },
                  { id: 'developer', label: 'Real Estate Developer', desc: 'Project developer or off-plan commercial builder' },
                ].map((rel) => (
                  <button
                    key={rel.id}
                    type="button"
                    onClick={() => updateField('owner_relationship', rel.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      formData.owner_relationship === rel.id
                        ? 'border-emerald-500 bg-emerald-500/10 text-white shadow-md shadow-emerald-500/10'
                        : 'border-white/10 bg-white/[0.02] text-zinc-400 hover:bg-white/[0.04] hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-bold text-white flex items-center justify-between">
                      <span>{rel.label}</span>
                      {formData.owner_relationship === rel.id && <CheckCircle2 size={15} className="text-emerald-400" />}
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1 leading-snug">{rel.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Contact Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Full Name / Legal Entity *
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => updateField('full_name', e.target.value)}
                    placeholder="e.g. Jean Bosco Habimana"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] pl-10 pr-4 py-2.5 text-base sm:text-sm text-white placeholder:text-zinc-600 outline-none focus:border-emerald-500/50 focus:bg-white/[0.06] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  National ID / Passport Number
                </label>
                <input
                  type="text"
                  value={formData.id_number}
                  onChange={(e) => updateField('id_number', e.target.value)}
                  placeholder="e.g. 1 1988 8 0012345 0 12"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-base sm:text-sm text-white font-mono placeholder:text-zinc-600 outline-none focus:border-emerald-500/50 focus:bg-white/[0.06] transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Phone Number (WhatsApp Preferred) *
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="tel"
                    required
                    value={formData.phone_number}
                    onChange={(e) => updateField('phone_number', e.target.value)}
                    placeholder="+250 788 123 456"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] pl-10 pr-4 py-2.5 text-base sm:text-sm text-white placeholder:text-zinc-600 outline-none focus:border-emerald-500/50 focus:bg-white/[0.06] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Official Email Address *
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="jean.bosco@gmail.com"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] pl-10 pr-4 py-2.5 text-base sm:text-sm text-white placeholder:text-zinc-600 outline-none focus:border-emerald-500/50 focus:bg-white/[0.06] transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Next Button */}
            <div className="pt-4 border-t border-white/[0.08] flex justify-end">
              <Button
                variant="primary"
                type="submit"
                className="w-full sm:w-auto px-8 py-3 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
              >
                <span>Continue to Asset Details</span>
                <ArrowRight size={16} />
              </Button>
            </div>
          </form>
        )}

        {/* ━━━ STEP 2: ASSET SPECIFICATIONS (DYNAMIC ACCORDING TO MODEL) ━━━ */}
        {step === 2 && (
          <form onSubmit={handleNext} className="space-y-6 rounded-3xl border border-white/10 bg-[#080c14]/90 p-6 sm:p-10 backdrop-blur-2xl shadow-2xl">
            <div className="border-b border-white/[0.08] pb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 flex items-center gap-2.5">
                <Building2 size={20} className="text-emerald-400" />
                <span>2. Asset Information & Technical Specifications</span>
              </h2>
              <p className="text-zinc-400 text-xs sm:text-sm">
                Inputs dynamically adjust according to the physical asset model ({formData.asset_type.toUpperCase()}).
              </p>
            </div>

            {/* Asset Category Selector */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                Select Asset Category *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {ASSET_TYPES.map((type) => {
                  const Icon = type.icon;
                  const isSelected = formData.asset_type === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => handleAssetTypeChange(type.id)}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500/15 text-white shadow-md shadow-emerald-500/15 ring-1 ring-emerald-500/40'
                          : 'border-white/10 bg-white/[0.02] text-zinc-400 hover:bg-white/[0.05] hover:text-white'
                      }`}
                    >
                      <Icon size={20} className={isSelected ? 'text-emerald-400' : 'text-zinc-500'} />
                      <div className="text-[11px] font-bold mt-1.5 leading-tight">{type.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ━━━━━━━━━━ COMMON HEADER: PURPOSE & TITLE ━━━━━━━━━━ */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Transaction Purpose *
                </label>
                <select
                  value={formData.purpose}
                  onChange={(e) => updateField('purpose', e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#080c14] px-3.5 py-2.5 text-base sm:text-sm text-white outline-none focus:border-emerald-500/50"
                >
                  <option value="sale">Outright Sale</option>
                  <option value="rent">
                    {formData.asset_type === 'vehicle' ? 'Rental / Chauffeur Hire' : 'Long-Term Lease / Rent'}
                  </option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Listing Proposal Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder={
                    formData.asset_type === 'house'
                      ? 'e.g. Modern 4BR Luxury Villa with Pool in Nyarutarama'
                      : formData.asset_type === 'apartment'
                      ? 'e.g. 3-Bedroom Executive Penthouse in Kacyiru'
                      : formData.asset_type === 'land'
                      ? 'e.g. 1,200 sqm Prime R1 Titled Plot in Gishushu'
                      : formData.asset_type === 'commercial'
                      ? 'e.g. 4-Story Commercial Plaza in Nyarugenge CBD'
                      : 'e.g. 2023 Toyota Land Cruiser Prado TXL'
                  }
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-base sm:text-sm text-white placeholder:text-zinc-600 outline-none focus:border-emerald-500/50 focus:bg-white/[0.06] transition-all"
                />
              </div>
            </div>

            {/* ━━━━━━━━━━ A. RESIDENTIAL VILLA / HOUSE MODEL ━━━━━━━━━━ */}
            {formData.asset_type === 'house' && (
              <div className="space-y-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.02] p-4 sm:p-5">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider border-b border-white/[0.08] pb-2">
                  <Home size={15} /> Residential Villa / House Specifications
                </div>

                {/* Sub-type selector */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                    House Sub-Type
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {['Luxury Villa', 'Single Family Home', 'Townhouse', 'Duplex Villa'].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => updateField('sub_type', st)}
                        className={`py-2 px-3 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                          formData.sub_type === st
                            ? 'border-emerald-500 bg-emerald-500/20 text-white'
                            : 'border-white/10 bg-white/[0.02] text-zinc-400 hover:text-white'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Location & Cadastre */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                      District (Rwanda) *
                    </label>
                    <select
                      value={formData.district}
                      onChange={(e) => updateField('district', e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#080c14] px-3.5 py-2.5 text-base sm:text-sm text-white outline-none focus:border-emerald-500/50"
                    >
                      {RWANDA_DISTRICTS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                        Land UPI Number (RLMUA)
                      </label>
                      <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                        <FileCheck2 size={12} /> Cadastre Verified
                      </span>
                    </div>
                    <input
                      type="text"
                      value={formData.land_upi}
                      onChange={(e) => updateField('land_upi', e.target.value)}
                      placeholder="e.g. 1/02/03/04/5678"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-base sm:text-sm text-white font-mono placeholder:text-zinc-600 outline-none focus:border-emerald-500/50 focus:bg-white/[0.06] transition-all"
                    />
                  </div>
                </div>

                {/* Sector, Cell, Address */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Sector</label>
                    <input
                      type="text"
                      value={formData.sector}
                      onChange={(e) => updateField('sector', e.target.value)}
                      placeholder="e.g. Nyarutarama"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-base sm:text-sm text-white placeholder:text-zinc-600 outline-none focus:border-emerald-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Cell</label>
                    <input
                      type="text"
                      value={formData.cell}
                      onChange={(e) => updateField('cell', e.target.value)}
                      placeholder="e.g. Kangondo"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-base sm:text-sm text-white placeholder:text-zinc-600 outline-none focus:border-emerald-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Street Address / Plot *</label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => updateField('address', e.target.value)}
                      placeholder="e.g. KG 9 Ave 42"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-base sm:text-sm text-white placeholder:text-zinc-600 outline-none focus:border-emerald-500/50"
                    />
                  </div>
                </div>

                {/* Pricing & Dimensions */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Proposed Asking Price (RWF) *
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.proposed_price}
                      onChange={(e) => updateField('proposed_price', e.target.value)}
                      placeholder="e.g. 350000000"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-base sm:text-sm text-white font-mono placeholder:text-zinc-600 outline-none focus:border-emerald-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Built-up Area (m²)</label>
                    <input
                      type="number"
                      value={formData.size_sqm}
                      onChange={(e) => updateField('size_sqm', e.target.value)}
                      placeholder="450"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-base sm:text-sm text-white outline-none focus:border-emerald-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Compound / Plot (m²)</label>
                    <input
                      type="number"
                      value={formData.compound_size_sqm}
                      onChange={(e) => updateField('compound_size_sqm', e.target.value)}
                      placeholder="800"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-base sm:text-sm text-white outline-none focus:border-emerald-500/50"
                    />
                  </div>
                </div>

                {/* Rooms */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Bedrooms</label>
                    <input
                      type="number"
                      value={formData.bedrooms}
                      onChange={(e) => updateField('bedrooms', e.target.value)}
                      placeholder="4"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-base sm:text-sm text-white outline-none focus:border-emerald-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Bathrooms</label>
                    <input
                      type="number"
                      value={formData.bathrooms}
                      onChange={(e) => updateField('bathrooms', e.target.value)}
                      placeholder="3"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-base sm:text-sm text-white outline-none focus:border-emerald-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Year Built</label>
                    <input
                      type="number"
                      value={formData.year_built}
                      onChange={(e) => updateField('year_built', e.target.value)}
                      placeholder="2021"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-base sm:text-sm text-white outline-none focus:border-emerald-500/50"
                    />
                  </div>
                </div>

                {/* Features & Amenities Checkboxes */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                    Features & Compound Amenities
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    {[
                      { field: 'is_furnished', label: 'Fully Furnished' },
                      { field: 'has_swimming_pool', label: 'Swimming Pool' },
                      { field: 'has_staff_quarters', label: 'Staff Quarters (Annex)' },
                      { field: 'has_garden', label: 'Private Garden / Lawn' },
                      { field: 'has_water_tank', label: 'Water Reservoir Tank' },
                      { field: 'has_backup_generator', label: 'Standby Generator' },
                    ].map((item) => {
                      const isChecked = (formData as any)[item.field];
                      return (
                        <button
                          key={item.field}
                          type="button"
                          onClick={() => updateField(item.field, !isChecked)}
                          className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                            isChecked
                              ? 'border-emerald-500 bg-emerald-500/10 text-white'
                              : 'border-white/10 bg-white/[0.02] text-zinc-400 hover:text-white'
                          }`}
                        >
                          {isChecked ? <CheckSquare size={14} className="text-emerald-400" /> : <Square size={14} className="text-zinc-600" />}
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ━━━━━━━━━━ B. APARTMENT / CONDOMINIUM MODEL ━━━━━━━━━━ */}
            {formData.asset_type === 'apartment' && (
              <div className="space-y-4 rounded-2xl border border-sky-500/20 bg-sky-500/[0.02] p-4 sm:p-5">
                <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider border-b border-white/[0.08] pb-2">
                  <Building2 size={15} /> Apartment & Condominium Specifications
                </div>

                {/* Sub-type */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Apartment Unit Style
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {['Luxury Apartment', 'Penthouse', 'Studio / Serviced Unit', 'Duplex Apartment'].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => updateField('sub_type', st)}
                        className={`py-2 px-3 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                          formData.sub_type === st
                            ? 'border-sky-500 bg-sky-500/20 text-white'
                            : 'border-white/10 bg-white/[0.02] text-zinc-400 hover:text-white'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Location & Cadastre */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">District (Rwanda) *</label>
                    <select
                      value={formData.district}
                      onChange={(e) => updateField('district', e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#080c14] px-3.5 py-2.5 text-base sm:text-sm text-white outline-none focus:border-emerald-500/50"
                    >
                      {RWANDA_DISTRICTS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Building Land UPI / Cadastre</label>
                    <input
                      type="text"
                      value={formData.land_upi}
                      onChange={(e) => updateField('land_upi', e.target.value)}
                      placeholder="e.g. 1/02/03/04/5678"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-base sm:text-sm text-white font-mono placeholder:text-zinc-600 outline-none focus:border-emerald-500/50"
                    />
                  </div>
                </div>

                {/* Address & Building */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Sector</label>
                    <input
                      type="text"
                      value={formData.sector}
                      onChange={(e) => updateField('sector', e.target.value)}
                      placeholder="e.g. Kacyiru"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-base sm:text-sm text-white outline-none focus:border-emerald-500/50"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Building Name & Unit / Street Address *</label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => updateField('address', e.target.value)}
                      placeholder="e.g. Vision City Plaza, Block B Unit 402"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-base sm:text-sm text-white outline-none focus:border-emerald-500/50"
                    />
                  </div>
                </div>

                {/* Price & Unit Dimensions */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Proposed Asking Price (RWF) *</label>
                    <input
                      type="number"
                      required
                      value={formData.proposed_price}
                      onChange={(e) => updateField('proposed_price', e.target.value)}
                      placeholder="e.g. 180000000"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-base sm:text-sm text-white font-mono outline-none focus:border-emerald-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Unit Area (m²)</label>
                    <input
                      type="number"
                      value={formData.size_sqm}
                      onChange={(e) => updateField('size_sqm', e.target.value)}
                      placeholder="185"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-base sm:text-sm text-white outline-none focus:border-emerald-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Floor Number</label>
                    <input
                      type="number"
                      value={formData.floor_number}
                      onChange={(e) => updateField('floor_number', e.target.value)}
                      placeholder="4"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-base sm:text-sm text-white outline-none focus:border-emerald-500/50"
                    />
                  </div>
                </div>

                {/* Beds, Baths, Service Charge */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Bedrooms</label>
                    <input
                      type="number"
                      value={formData.bedrooms}
                      onChange={(e) => updateField('bedrooms', e.target.value)}
                      placeholder="3"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-base sm:text-sm text-white outline-none focus:border-emerald-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Bathrooms</label>
                    <input
                      type="number"
                      value={formData.bathrooms}
                      onChange={(e) => updateField('bathrooms', e.target.value)}
                      placeholder="2"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-base sm:text-sm text-white outline-none focus:border-emerald-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Monthly Syndic / Service (RWF)</label>
                    <input
                      type="number"
                      value={formData.monthly_service_charge}
                      onChange={(e) => updateField('monthly_service_charge', e.target.value)}
                      placeholder="120000"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-base sm:text-sm text-white outline-none focus:border-emerald-500/50"
                    />
                  </div>
                </div>

                {/* Apartment Features */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Unit Amenities</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {[
                      { field: 'has_elevator', label: 'Elevator Access' },
                      { field: 'is_furnished', label: 'Fully Furnished' },
                      { field: 'balcony', label: 'Private Balcony' },
                      { field: 'has_backup_generator', label: 'Backup Generator' },
                    ].map((item) => {
                      const isChecked = (formData as any)[item.field];
                      return (
                        <button
                          key={item.field}
                          type="button"
                          onClick={() => updateField(item.field, !isChecked)}
                          className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                            isChecked
                              ? 'border-sky-500 bg-sky-500/10 text-white'
                              : 'border-white/10 bg-white/[0.02] text-zinc-400 hover:text-white'
                          }`}
                        >
                          {isChecked ? <CheckSquare size={14} className="text-sky-400" /> : <Square size={14} className="text-zinc-600" />}
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ━━━━━━━━━━ C. LAND PARCEL MODEL ━━━━━━━━━━ */}
            {formData.asset_type === 'land' && (
              <div className="space-y-4 rounded-2xl border border-amber-500/20 bg-amber-500/[0.02] p-4 sm:p-5">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider border-b border-white/[0.08] pb-2">
                  <Layers size={15} /> Land Parcel Cadastral & Zoning Specifications
                </div>

                {/* Sub-type */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Land Category
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {['Residential Plot', 'Commercial Plot', 'Industrial Land', 'Agricultural Acreage'].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => updateField('sub_type', st)}
                        className={`py-2 px-3 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                          formData.sub_type === st
                            ? 'border-amber-500 bg-amber-500/20 text-white'
                            : 'border-white/10 bg-white/[0.02] text-zinc-400 hover:text-white'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* District & UPI (CRUCIAL FOR LAND) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                      District (Rwanda) *
                    </label>
                    <select
                      value={formData.district}
                      onChange={(e) => updateField('district', e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#080c14] px-3.5 py-2.5 text-base sm:text-sm text-white outline-none focus:border-amber-500/50"
                    >
                      {RWANDA_DISTRICTS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-amber-400">
                        Land UPI Number (RLMUA) *
                      </label>
                      <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                        <FileCheck2 size={12} /> Cadastre Required
                      </span>
                    </div>
                    <input
                      type="text"
                      required
                      value={formData.land_upi}
                      onChange={(e) => updateField('land_upi', e.target.value)}
                      placeholder="e.g. 1/02/03/04/5678"
                      className="w-full rounded-xl border border-amber-500/40 bg-amber-500/5 px-4 py-2.5 text-base sm:text-sm text-white font-mono placeholder:text-zinc-600 outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Sector, Cell, Plot Address */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Sector</label>
                    <input
                      type="text"
                      value={formData.sector}
                      onChange={(e) => updateField('sector', e.target.value)}
                      placeholder="e.g. Gishushu"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-base sm:text-sm text-white outline-none focus:border-amber-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Cell</label>
                    <input
                      type="text"
                      value={formData.cell}
                      onChange={(e) => updateField('cell', e.target.value)}
                      placeholder="e.g. Nyarutarama"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-base sm:text-sm text-white outline-none focus:border-amber-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Plot Location Landmark *</label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => updateField('address', e.target.value)}
                      placeholder="e.g. 200m off KG 15 Ave Near Embassy"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-base sm:text-sm text-white outline-none focus:border-amber-500/50"
                    />
                  </div>
                </div>

                {/* Price & Land Area */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Proposed Asking Price (RWF) *
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.proposed_price}
                      onChange={(e) => updateField('proposed_price', e.target.value)}
                      placeholder="e.g. 150000000"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-base sm:text-sm text-white font-mono outline-none focus:border-amber-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-1.5">
                      Total Land Area (m²) *
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.size_sqm}
                      onChange={(e) => updateField('size_sqm', e.target.value)}
                      placeholder="e.g. 1200"
                      className="w-full rounded-xl border border-amber-500/40 bg-white/[0.04] px-4 py-2.5 text-base sm:text-sm text-white font-mono outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Land Master Plan Zoning, Terrain, Road Access */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Master Plan Zoning Code
                    </label>
                    <select
                      value={formData.zoning_code}
                      onChange={(e) => updateField('zoning_code', e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#080c14] px-3.5 py-2.5 text-base sm:text-sm text-white outline-none focus:border-amber-500/50"
                    >
                      <option value="R1">R1 - Low Density Residential</option>
                      <option value="R2">R2 - Medium Density Residential</option>
                      <option value="R3">R3 - High Density / Apartments</option>
                      <option value="C1">C1 - Commercial / Mixed Use</option>
                      <option value="Industrial">Industrial Zone</option>
                      <option value="Agricultural">Agricultural (A1/A2)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Topography / Terrain
                    </label>
                    <select
                      value={formData.terrain}
                      onChange={(e) => updateField('terrain', e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#080c14] px-3.5 py-2.5 text-base sm:text-sm text-white outline-none focus:border-amber-500/50"
                    >
                      <option value="Flat">Flat Plateau</option>
                      <option value="Gentle Slope">Gentle Slope</option>
                      <option value="Sloped">Sloped / Panoramic Hillside</option>
                      <option value="Hilly">Hilly / Steep</option>
                      <option value="Valley">Valley</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Road Access Type
                    </label>
                    <select
                      value={formData.road_type}
                      onChange={(e) => updateField('road_type', e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#080c14] px-3.5 py-2.5 text-base sm:text-sm text-white outline-none focus:border-amber-500/50"
                    >
                      <option value="Asphalt / Tarmac">Asphalt / Tarmac Paved</option>
                      <option value="Cobblestone">Cobblestone (Paved)</option>
                      <option value="Murram / Dirt">Murram / Dirt Road</option>
                      <option value="Footpath">Footpath / Pedestrian Only</option>
                    </select>
                  </div>
                </div>

                {/* Infrastructure Utilities */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                    Onsite Utilities & Connectivity
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    {[
                      { field: 'water_onsite', label: 'WASAC Water Connected', icon: Droplets },
                      { field: 'electricity_onsite', label: 'REG Electricity Grid Onsite', icon: Zap },
                      { field: 'road_access', label: 'Direct Motor Vehicle Access', icon: Compass },
                    ].map((item) => {
                      const isChecked = (formData as any)[item.field];
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.field}
                          type="button"
                          onClick={() => updateField(item.field, !isChecked)}
                          className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                            isChecked
                              ? 'border-amber-500 bg-amber-500/10 text-white'
                              : 'border-white/10 bg-white/[0.02] text-zinc-400 hover:text-white'
                          }`}
                        >
                          <Icon size={16} className={isChecked ? 'text-amber-400' : 'text-zinc-500'} />
                          <span className="font-semibold">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ━━━━━━━━━━ D. COMMERCIAL COMPLEX MODEL ━━━━━━━━━━ */}
            {formData.asset_type === 'commercial' && (
              <div className="space-y-4 rounded-2xl border border-purple-500/20 bg-purple-500/[0.02] p-4 sm:p-5">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider border-b border-white/[0.08] pb-2">
                  <Warehouse size={15} /> Commercial Complex Specifications
                </div>

                {/* Sub-type */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Commercial Asset Class
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {['Commercial Office', 'Retail Plaza / Mall', 'Industrial Warehouse', 'Mixed-Use Commercial'].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => updateField('sub_type', st)}
                        className={`py-2 px-3 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                          formData.sub_type === st
                            ? 'border-purple-500 bg-purple-500/20 text-white'
                            : 'border-white/10 bg-white/[0.02] text-zinc-400 hover:text-white'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Location & UPI */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">District (Rwanda) *</label>
                    <select
                      value={formData.district}
                      onChange={(e) => updateField('district', e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#080c14] px-3.5 py-2.5 text-base sm:text-sm text-white outline-none focus:border-purple-500/50"
                    >
                      {RWANDA_DISTRICTS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Land UPI Number</label>
                    <input
                      type="text"
                      value={formData.land_upi}
                      onChange={(e) => updateField('land_upi', e.target.value)}
                      placeholder="e.g. 1/02/03/04/5678"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-base sm:text-sm text-white font-mono outline-none focus:border-purple-500/50"
                    />
                  </div>
                </div>

                {/* Street Address */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Street Address / Complex Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => updateField('address', e.target.value)}
                    placeholder="e.g. Boulevard de l'OUA, Nyarugenge Financial District"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-base sm:text-sm text-white outline-none focus:border-purple-500/50"
                  />
                </div>

                {/* Pricing & Commercial Specs */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Proposed Asking Price (RWF) *
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.proposed_price}
                      onChange={(e) => updateField('proposed_price', e.target.value)}
                      placeholder="e.g. 1200000000"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-base sm:text-sm text-white font-mono outline-none focus:border-purple-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Total Floor Area (m²)</label>
                    <input
                      type="number"
                      value={formData.size_sqm}
                      onChange={(e) => updateField('size_sqm', e.target.value)}
                      placeholder="2500"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-base sm:text-sm text-white outline-none focus:border-purple-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Total Floors</label>
                    <input
                      type="number"
                      value={formData.total_floors}
                      onChange={(e) => updateField('total_floors', e.target.value)}
                      placeholder="4"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-base sm:text-sm text-white outline-none focus:border-purple-500/50"
                    />
                  </div>
                </div>

                {/* Capacity & Parking */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Parking Bays</label>
                    <input
                      type="number"
                      value={formData.parking_spaces}
                      onChange={(e) => updateField('parking_spaces', e.target.value)}
                      placeholder="25"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-base sm:text-sm text-white outline-none focus:border-purple-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Loading Bays</label>
                    <input
                      type="number"
                      value={formData.loading_bays}
                      onChange={(e) => updateField('loading_bays', e.target.value)}
                      placeholder="2"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-base sm:text-sm text-white outline-none focus:border-purple-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Power (KVA)</label>
                    <input
                      type="text"
                      value={formData.power_capacity}
                      onChange={(e) => updateField('power_capacity', e.target.value)}
                      placeholder="250 KVA"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-base sm:text-sm text-white outline-none focus:border-purple-500/50"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ━━━━━━━━━━ E. MOBILITY / VEHICLE MODEL ━━━━━━━━━━ */}
            {formData.asset_type === 'vehicle' && (
              <div className="space-y-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.02] p-4 sm:p-5">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider border-b border-white/[0.08] pb-2">
                  <Car size={15} /> Mobility & Vehicle Technical Specifications
                </div>

                {/* Sub-type / Body Type */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Vehicle Category / Body Style
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {['Executive SUV', 'Luxury Sedan', 'Commercial Pickup', 'Minibus / Van', 'Motorbike'].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => updateField('body_type', st)}
                        className={`py-2 px-2.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                          formData.body_type === st
                            ? 'border-emerald-500 bg-emerald-500/20 text-white'
                            : 'border-white/10 bg-white/[0.02] text-zinc-400 hover:text-white'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Make, Model, Year */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Vehicle Make *
                    </label>
                    <select
                      value={formData.make}
                      onChange={(e) => updateField('make', e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#080c14] px-3.5 py-2.5 text-base sm:text-sm text-white outline-none focus:border-emerald-500/50"
                    >
                      {VEHICLE_MAKES.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Model & Trim *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.model}
                      onChange={(e) => updateField('model', e.target.value)}
                      placeholder="e.g. Land Cruiser Prado TXL"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-base sm:text-sm text-white outline-none focus:border-emerald-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Manufacture Year *
                    </label>
                    <select
                      value={formData.year}
                      onChange={(e) => updateField('year', e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#080c14] px-3.5 py-2.5 text-base sm:text-sm text-white outline-none focus:border-emerald-500/50"
                    >
                      {Array.from({ length: 17 }, (_, i) => 2026 - i).map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Mileage, Fuel, Transmission */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Mileage (Km)
                    </label>
                    <div className="relative">
                      <Gauge size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input
                        type="number"
                        value={formData.mileage}
                        onChange={(e) => updateField('mileage', e.target.value)}
                        placeholder="e.g. 45000"
                        className="w-full rounded-xl border border-white/10 bg-white/[0.04] pl-10 pr-4 py-2.5 text-base sm:text-sm text-white outline-none focus:border-emerald-500/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Fuel Type
                    </label>
                    <div className="relative">
                      <Fuel size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <select
                        value={formData.fuel_type}
                        onChange={(e) => updateField('fuel_type', e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#080c14] pl-10 pr-4 py-2.5 text-base sm:text-sm text-white outline-none focus:border-emerald-500/50"
                      >
                        <option value="Petrol">Petrol / Gasoline</option>
                        <option value="Diesel">Diesel</option>
                        <option value="Hybrid">Hybrid</option>
                        <option value="Electric">100% Electric (EV)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Transmission
                    </label>
                    <select
                      value={formData.transmission}
                      onChange={(e) => updateField('transmission', e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#080c14] px-3.5 py-2.5 text-base sm:text-sm text-white outline-none focus:border-emerald-500/50"
                    >
                      <option value="Automatic">Automatic Transmission</option>
                      <option value="Manual">Manual Transmission</option>
                    </select>
                  </div>
                </div>

                {/* Condition, Engine Capacity, Plate */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Vehicle Condition
                    </label>
                    <select
                      value={formData.condition}
                      onChange={(e) => updateField('condition', e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#080c14] px-3.5 py-2.5 text-base sm:text-sm text-white outline-none focus:border-emerald-500/50"
                    >
                      <option value="Brand New">Brand New (0 km)</option>
                      <option value="Used Foreign">Foreign Used (Imported Direct)</option>
                      <option value="Used Local">Locally Used (Rwanda registered)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Engine Capacity
                    </label>
                    <input
                      type="text"
                      value={formData.engine_capacity}
                      onChange={(e) => updateField('engine_capacity', e.target.value)}
                      placeholder="e.g. 2800cc or 3.0L"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-base sm:text-sm text-white outline-none focus:border-emerald-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Plate / Registration Type
                    </label>
                    <select
                      value={formData.plate_type}
                      onChange={(e) => updateField('plate_type', e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#080c14] px-3.5 py-2.5 text-base sm:text-sm text-white outline-none focus:border-emerald-500/50"
                    >
                      <option value="Private (RAx)">Private Plate (RAx...)</option>
                      <option value="Commercial Yellow Plate">Commercial Yellow Plate</option>
                      <option value="Duty Free / Unregistered">Duty Free / Unregistered</option>
                    </select>
                  </div>
                </div>

                {/* Price & Current Inspection Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Proposed Asking Price (RWF) *
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.proposed_price}
                      onChange={(e) => updateField('proposed_price', e.target.value)}
                      placeholder="e.g. 68000000"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-base sm:text-sm text-white font-mono outline-none focus:border-emerald-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Inspection District *
                    </label>
                    <select
                      value={formData.district}
                      onChange={(e) => updateField('district', e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#080c14] px-3.5 py-2.5 text-base sm:text-sm text-white outline-none focus:border-emerald-500/50"
                    >
                      {RWANDA_DISTRICTS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Vehicle Current Garage / Physical Inspection Location *
                  </label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => updateField('address', e.target.value)}
                      placeholder="e.g. KG 9 Ave 15, Nyarutarama (or Dealership Showroom)"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] pl-10 pr-4 py-2.5 text-base sm:text-sm text-white outline-none focus:border-emerald-500/50"
                    />
                  </div>
                </div>

                {/* Automotive Compliance Toggles */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                    Documentation & Compliance
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {[
                      { field: 'controle_technique', label: 'Valid Contrôle Technique Certificate' },
                      { field: 'has_insurance', label: 'Valid Motor Vehicle Insurance' },
                    ].map((item) => {
                      const isChecked = (formData as any)[item.field];
                      return (
                        <button
                          key={item.field}
                          type="button"
                          onClick={() => updateField(item.field, !isChecked)}
                          className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                            isChecked
                              ? 'border-emerald-500 bg-emerald-500/10 text-white'
                              : 'border-white/10 bg-white/[0.02] text-zinc-400 hover:text-white'
                          }`}
                        >
                          {isChecked ? <CheckSquare size={14} className="text-emerald-400" /> : <Square size={14} className="text-zinc-600" />}
                          <span className="font-semibold">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                {formData.asset_type === 'vehicle' ? 'Vehicle Condition & Service History Notes' : 'Asset Highlights & Detailed Description'}
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder={
                  formData.asset_type === 'vehicle'
                    ? 'State full service history, dealer maintained, accidents if any, custom upgrades...'
                    : 'Describe key architectural features, views, security, title details, road access...'
                }
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] p-3.5 text-base sm:text-sm text-white placeholder:text-zinc-600 outline-none focus:border-emerald-500/50 focus:bg-white/[0.06] transition-all"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-2.5 rounded-xl border border-white/10 text-zinc-400 hover:text-white hover:bg-white/[0.04] text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft size={14} /> Back
              </button>

              <Button
                variant="primary"
                type="submit"
                className="w-full sm:w-auto px-8 py-3 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
              >
                <span>
                  {formData.asset_type === 'vehicle' ? 'Schedule Vehicle Inspection' : 'Schedule Physical Surveyor Visit'}
                </span>
                <ArrowRight size={16} />
              </Button>
            </div>
          </form>
        )}

        {/* ━━━ STEP 3: SCHEDULE PHYSICAL INSPECTION VISIT ━━━ */}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-white/10 bg-[#080c14]/90 p-6 sm:p-10 backdrop-blur-2xl shadow-2xl">
            <div className="border-b border-white/[0.08] pb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 flex items-center gap-2.5">
                <Calendar size={20} className="text-emerald-400" />
                <span>
                  {formData.asset_type === 'vehicle'
                    ? '3. Schedule Automotive Mechanical Inspection'
                    : '3. Schedule Physical Surveyor Visit'}
                </span>
              </h2>
              <p className="text-zinc-400 text-xs sm:text-sm">
                {formData.asset_type === 'vehicle'
                  ? 'Choose when our certified automotive technician can visit the garage to perform diagnostic scanning and verify title documentation.'
                  : 'Choose when our certified surveyor and drone photographer can visit the asset for cadastral boundary and quality verification.'}
              </p>
            </div>

            {/* Visit Date & Time Window */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Preferred Inspection Date *
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={formData.preferred_visit_date}
                  onChange={(e) => updateField('preferred_visit_date', e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-base sm:text-sm text-white outline-none focus:border-emerald-500/50 focus:bg-white/[0.06] transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Preferred Time Window *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => updateField('preferred_time_slot', 'morning')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      formData.preferred_time_slot === 'morning'
                        ? 'border-emerald-500 bg-emerald-500/10 text-white shadow-md shadow-emerald-500/10'
                        : 'border-white/10 bg-white/[0.02] text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Clock size={14} className={formData.preferred_time_slot === 'morning' ? 'text-emerald-400' : 'text-zinc-500'} />
                    <span>Morning (9am - 12pm)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateField('preferred_time_slot', 'afternoon')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      formData.preferred_time_slot === 'afternoon'
                        ? 'border-emerald-500 bg-emerald-500/10 text-white shadow-md shadow-emerald-500/10'
                        : 'border-white/10 bg-white/[0.02] text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Clock size={14} className={formData.preferred_time_slot === 'afternoon' ? 'text-emerald-400' : 'text-zinc-500'} />
                    <span>Afternoon (2pm - 5pm)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Caretaker / Site Contact */}
            <div className="p-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                <User size={14} className="text-emerald-400" />
                <span>
                  {formData.asset_type === 'vehicle'
                    ? 'Vehicle Custodian / Garage Contact (If someone else is on-site)'
                    : 'On-Site Caretaker / Keyholder Details (Optional)'}
                </span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    value={formData.site_contact_name}
                    onChange={(e) => updateField('site_contact_name', e.target.value)}
                    placeholder="e.g. Eric Nshimiyimana"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-base sm:text-sm text-white placeholder:text-zinc-600 outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Contact Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.site_contact_phone}
                    onChange={(e) => updateField('site_contact_phone', e.target.value)}
                    placeholder="+250 788 000 111"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-base sm:text-sm text-white placeholder:text-zinc-600 outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Access Notes, Landmarks & Directions
                </label>
                <textarea
                  rows={2}
                  value={formData.site_access_notes}
                  onChange={(e) => updateField('site_access_notes', e.target.value)}
                  placeholder="e.g. Opposite the blue gate, guard on duty 24/7, keys with caretaker Eric..."
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] p-3 text-base sm:text-sm text-white placeholder:text-zinc-600 outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>

            {/* Trust Assurance Card */}
            <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 flex items-center gap-3.5 text-xs text-zinc-300">
              <ShieldCheck size={28} className="text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold text-white block">Urugwiro Trust Seal Certification</span>
                <span>Upon successful on-site survey and cadastral verification, your asset will be awarded the verified badge and distributed across domestic and diaspora investor channels.</span>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2.5 rounded-xl border border-white/10 text-zinc-400 hover:text-white hover:bg-white/[0.04] text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft size={14} /> Back
              </button>

              <Button
                variant="primary"
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-9 py-3.5 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span>Submitting Proposal...</span>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Confirm & Submit Proposal</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        )}

        {/* ━━━ STEP 4: SUCCESS CONFIRMATION & TRACKING CODE ━━━ */}
        {step === 4 && submittedProposal && (
          <div className="rounded-3xl border border-emerald-500/30 bg-[#080c14]/95 p-6 sm:p-12 backdrop-blur-2xl text-center shadow-2xl space-y-6 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle2 size={36} />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
                Asset Proposal Received!
              </h2>
              <p className="text-zinc-400 text-xs sm:text-sm max-w-lg mx-auto">
                Thank you, <span className="text-white font-semibold">{submittedProposal.full_name}</span>. Your {submittedProposal.asset_type_label || submittedProposal.asset_type} proposal has entered our cadastral verification queue.
              </p>
            </div>

            {/* Tracking Code Box */}
            <div className="max-w-md mx-auto p-4 rounded-2xl border border-white/10 bg-white/[0.03] space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
                Your Proposal Tracking Code
              </span>
              <div className="flex items-center justify-center gap-3">
                <span className="font-mono text-2xl sm:text-3xl font-black text-emerald-400 tracking-wider">
                  {submittedProposal.proposal_code}
                </span>
                <button
                  type="button"
                  onClick={copyProposalCode}
                  className="p-2 rounded-xl border border-white/10 hover:border-emerald-500/50 bg-white/[0.04] text-zinc-400 hover:text-emerald-400 transition-colors cursor-pointer"
                  title="Copy Reference Code"
                >
                  {copiedCode ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                </button>
              </div>
              <p className="text-[11px] text-zinc-500">
                Keep this code handy. Our surveying team will cite it when confirming your appointment.
              </p>
            </div>

            {/* Next Steps Timeline */}
            <div className="max-w-xl mx-auto text-left p-5 rounded-2xl border border-white/[0.06] bg-white/[0.01] space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">What Happens Next:</span>
              <div className="space-y-2.5 text-xs text-zinc-300">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">1</div>
                  <p><strong className="text-white">Cadastral & Title Cross-Check:</strong> Our title officers verify your RLMUA Land UPI, ownership registers, or vehicle registration records.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">2</div>
                  <p><strong className="text-white">Surveyor Appointment Confirmation:</strong> You will receive an SMS and WhatsApp confirmation for your scheduled visit on <span className="text-emerald-400 font-semibold">{submittedProposal.preferred_visit_date || 'your preferred date'}</span>.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">3</div>
                  <p><strong className="text-white">Live Marketplace Publication:</strong> Following verified inspection, your listing goes live with the Urugwiro Trust Seal.</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                variant="primary"
                onClick={() => onNavigate ? onNavigate('home') : window.location.href = '/'}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer"
              >
                Return to Homepage
              </Button>
              <button
                type="button"
                onClick={() => {
                  setSubmittedProposal(null);
                  setStep(1);
                }}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-zinc-400 hover:text-white cursor-pointer"
              >
                Submit Another Property
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetProposalPage;
