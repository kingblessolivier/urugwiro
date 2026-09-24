import React, { useState } from 'react';
import {
  Home,
  Building2,
  Layers,
  Warehouse,
  Car,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Copy,
  Check,
  Phone,
  Mail,
  User,
  MapPin,
  Tag,
  KeyRound,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../../api/endpoints';
import type { AppView } from '../../types/navigation';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';

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

const PROPERTY_TYPES = [
  { id: 'house', label: 'House / Villa', icon: Home, desc: 'Single-family houses, villas, family compounds' },
  { id: 'apartment', label: 'Apartment', icon: Building2, desc: 'Flats, condominiums, serviced units' },
  { id: 'land', label: 'Land / Plot', icon: Layers, desc: 'Residential plots, commercial parcels, titled land' },
  { id: 'commercial', label: 'Commercial Space', icon: Warehouse, desc: 'Offices, retail stores, warehouses, plazas' },
  { id: 'vehicle', label: 'Vehicle / Mobility', icon: Car, desc: 'Cars, executive SUVs, commercial fleet vehicles' },
];

export const AssetProposalPage: React.FC<AssetProposalPageProps> = ({ onNavigate }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [submittedProposal, setSubmittedProposal] = useState<{ proposal_code?: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    // Transaction Mode
    purpose: 'sale' as 'sale' | 'rent',
    asset_type: 'house',
    
    // Property Location
    district: 'Gasabo (Kigali)',
    address: '', // neighborhood / street
    
    // Pricing
    proposed_price: '',
    is_negotiable: true,
    
    // Quick Details
    bedrooms: '3',
    description: '',
    
    // Owner / Contact Info
    full_name: '',
    phone_number: '',
    email: '',
    preferred_contact: 'whatsapp', // whatsapp | phone | email
    preferred_time: 'anytime', // morning | afternoon | anytime
  });

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (step === 1) {
      if (!formData.address.trim()) {
        setError('Please provide the property location or neighborhood (e.g., Kibagabaga, KG 28 Ave).');
        return;
      }
      if (!formData.proposed_price || isNaN(Number(formData.proposed_price)) || Number(formData.proposed_price) <= 0) {
        setError('Please enter your target asking price or expected monthly rent.');
        return;
      }
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.full_name.trim()) {
      setError('Please provide your full name.');
      return;
    }
    if (!formData.phone_number.trim() || formData.phone_number.trim().length < 8) {
      setError('Please provide a valid phone or WhatsApp number so our team can follow up.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    setLoading(true);

    try {
      const typeLabel = PROPERTY_TYPES.find((t) => t.id === formData.asset_type)?.label || 'Property';
      const actionLabel = formData.purpose === 'rent' ? 'For Rent' : 'For Sale';
      const generatedTitle = `${typeLabel} (${actionLabel}) in ${formData.address.trim()}, ${formData.district}`;

      const payload = {
        full_name: formData.full_name.trim(),
        phone_number: formData.phone_number.trim(),
        email: formData.email.trim(),
        title: generatedTitle,
        asset_type: formData.asset_type,
        purpose: formData.purpose,
        district: formData.district,
        address: formData.address.trim(),
        proposed_price: parseFloat(formData.proposed_price),
        currency: 'RWF',
        description: formData.description.trim(),
        bedrooms: ['house', 'apartment'].includes(formData.asset_type) ? parseInt(formData.bedrooms, 10) || null : null,
        preferred_time_slot: formData.preferred_time,
        specifications: {
          intent: formData.purpose,
          is_negotiable: formData.is_negotiable,
          preferred_contact: formData.preferred_contact,
        },
      };

      const response = await api.proposals.create(payload);
      setSubmittedProposal(response.data?.proposal || { proposal_code: 'PROP-' + Math.floor(1000 + Math.random() * 9000) });
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Failed to submit proposal:', err);
      const errMsg =
        err.response?.data?.error ||
        (typeof err.response?.data === 'object' ? Object.values(err.response.data)[0] : null) ||
        err.message ||
        'Failed to submit your property details. Please check your inputs and try again.';
      setError(Array.isArray(errMsg) ? errMsg[0] : String(errMsg));
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    if (submittedProposal?.proposal_code) {
      navigator.clipboard.writeText(submittedProposal.proposal_code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  return (
    <div className="min-h-screen py-10 sm:py-16 px-4 sm:px-6 lg:px-8 transition-colors duration-300" style={{ background: 'var(--color-bg-deep)' }}>
      <div className="mx-auto max-w-3xl">
        {/* Back Link */}
        {step < 3 && (
          <button
            type="button"
            onClick={() => (step === 2 ? setStep(1) : onNavigate?.('home'))}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-zinc-400 hover:text-white mb-6 transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>{step === 2 ? 'Back to Property Details' : 'Back to Home'}</span>
          </button>
        )}

        {/* Header */}
        {step < 3 && (
          <div className="text-center mb-8 sm:mb-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck size={14} />
              <span>Owner & Landlord Direct Portal</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              List Your Property With Us
            </h1>
            <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto leading-relaxed">
              Whether you are <strong className="text-zinc-200">selling</strong> or <strong className="text-zinc-200">renting out</strong>, give us a few details. Our team will verify registry records, inspect the property, and follow up directly with you.
            </p>

            {/* Stepper Pill */}
            <div className="flex items-center justify-center gap-3 pt-3">
              <div className={cn(
                "flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all",
                step === 1 ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25" : "bg-white/[0.05] text-zinc-400"
              )}>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black/30 text-[10px]">1</span>
                <span>Property Details</span>
              </div>
              <div className="h-0.5 w-6 bg-white/10" />
              <div className={cn(
                "flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all",
                step === 2 ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25" : "bg-white/[0.05] text-zinc-400"
              )}>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black/30 text-[10px]">2</span>
                <span>Contact & Follow-Up</span>
              </div>
            </div>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl border border-red-500/30 bg-red-500/10 text-red-200 text-xs sm:text-sm font-medium flex items-center gap-3 animate-in fade-in">
            <span className="h-2 w-2 rounded-full bg-red-400 shrink-0 animate-ping" />
            <span className="flex-1">{error}</span>
          </div>
        )}

        {/* ━━━ STEP 1: PROPERTY DETAILS ━━━ */}
        {step === 1 && (
          <form onSubmit={handleNext} className="space-y-6 rounded-3xl border border-white/10 bg-white/[0.02] p-5 sm:p-8 backdrop-blur-xl shadow-2xl shadow-black/60">
            {/* 01. Transaction Intent (Sale vs Rent) */}
            <div className="space-y-2">
              <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-300">
                What are you looking to do?
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => updateField('purpose', 'sale')}
                  className={cn(
                    "flex items-center justify-center gap-2.5 p-4 rounded-2xl border text-sm sm:text-base font-bold transition-all cursor-pointer",
                    formData.purpose === 'sale'
                      ? "border-emerald-500 bg-emerald-500/15 text-white shadow-lg shadow-emerald-500/20"
                      : "border-white/10 bg-white/[0.02] text-zinc-400 hover:text-white hover:border-white/20"
                  )}
                >
                  <Tag size={18} className={formData.purpose === 'sale' ? 'text-emerald-400' : 'text-zinc-500'} />
                  <span>I want to Sell</span>
                </button>

                <button
                  type="button"
                  onClick={() => updateField('purpose', 'rent')}
                  className={cn(
                    "flex items-center justify-center gap-2.5 p-4 rounded-2xl border text-sm sm:text-base font-bold transition-all cursor-pointer",
                    formData.purpose === 'rent'
                      ? "border-emerald-500 bg-emerald-500/15 text-white shadow-lg shadow-emerald-500/20"
                      : "border-white/10 bg-white/[0.02] text-zinc-400 hover:text-white hover:border-white/20"
                  )}
                >
                  <KeyRound size={18} className={formData.purpose === 'rent' ? 'text-emerald-400' : 'text-zinc-500'} />
                  <span>I want to Rent Out</span>
                </button>
              </div>
            </div>

            {/* 02. Property Type Selector */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-300">
                Property Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {PROPERTY_TYPES.map((pt) => {
                  const Icon = pt.icon;
                  const isSelected = formData.asset_type === pt.id;
                  return (
                    <button
                      key={pt.id}
                      type="button"
                      onClick={() => updateField('asset_type', pt.id)}
                      className={cn(
                        "p-3.5 rounded-2xl border text-left transition-all cursor-pointer group flex flex-col justify-between h-24",
                        isSelected
                          ? "border-emerald-500 bg-emerald-500/15 text-white shadow-md shadow-emerald-500/15"
                          : "border-white/10 bg-white/[0.02] text-zinc-400 hover:text-white hover:border-white/20"
                      )}
                    >
                      <Icon size={20} className={isSelected ? 'text-emerald-400' : 'text-zinc-500 group-hover:text-zinc-300'} />
                      <div>
                        <div className="text-xs sm:text-sm font-bold leading-tight text-white">{pt.label}</div>
                        <div className="text-[10px] text-zinc-500 line-clamp-1 mt-0.5">{pt.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 03. Location Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-300">
                  District <span className="text-emerald-400">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.district}
                    onChange={(e) => updateField('district', e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#080c14] py-3 pl-3.5 pr-8 text-sm text-white outline-none focus:border-emerald-500 transition-colors"
                  >
                    {RWANDA_DISTRICTS.map((d) => (
                      <option key={d} value={d} className="bg-[#080c14] text-white">
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-300">
                  Neighborhood / Street Address <span className="text-emerald-400">*</span>
                </label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3.5 top-3.5 text-zinc-500" />
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => updateField('address', e.target.value)}
                    placeholder="e.g. Kibagabaga near KG 28 Ave"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* 04. Asking Price / Rent Amount */}
            <div className="space-y-1.5 pt-2">
              <label className="block text-xs font-semibold text-zinc-300">
                {formData.purpose === 'rent' ? 'Expected Monthly Rent (RWF)' : 'Target Asking Price (RWF)'} <span className="text-emerald-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="10000"
                  required
                  value={formData.proposed_price}
                  onChange={(e) => updateField('proposed_price', e.target.value)}
                  placeholder={formData.purpose === 'rent' ? 'e.g. 850000' : 'e.g. 140000000'}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2.5 px-3.5 text-sm text-white font-mono placeholder:text-zinc-500 outline-none focus:border-emerald-500 transition-colors"
                />
                <span className="absolute right-3.5 top-3 text-xs font-mono font-bold text-emerald-400">
                  RWF {formData.purpose === 'rent' ? '/ Month' : ''}
                </span>
              </div>
              {formData.proposed_price && Number(formData.proposed_price) > 0 && (
                <div className="text-[11px] text-emerald-400 font-mono pl-1">
                  Preview: {Number(formData.proposed_price).toLocaleString()} RWF {formData.purpose === 'rent' ? 'per month' : ''}
                </div>
              )}
            </div>

            {/* 05. Bedrooms if House/Apartment */}
            {['house', 'apartment'].includes(formData.asset_type) && (
              <div className="space-y-1.5 pt-2">
                <label className="block text-xs font-semibold text-zinc-300">
                  Number of Bedrooms
                </label>
                <div className="flex gap-2">
                  {['1', '2', '3', '4', '5+'].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => updateField('bedrooms', n.replace('+', ''))}
                      className={cn(
                        "flex-1 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer",
                        formData.bedrooms === n.replace('+', '')
                          ? "border-emerald-500 bg-emerald-500/20 text-emerald-300"
                          : "border-white/10 bg-white/[0.03] text-zinc-400 hover:text-white"
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 06. Short Explanation / Little Description */}
            <div className="space-y-1.5 pt-2">
              <label className="block text-xs font-semibold text-zinc-300">
                Short Description / Key Features
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="e.g. 4 bedrooms with private compound, paved road access, recently renovated, solar water heater, garden."
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-emerald-500 transition-colors leading-relaxed"
              />
            </div>

            {/* Submit Step 1 */}
            <div className="pt-4">
              <Button
                type="submit"
                variant="primary"
                className="w-full py-3.5 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-600 text-white text-base shadow-xl shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continue to Contact Info</span>
                <ArrowRight size={18} />
              </Button>
            </div>
          </form>
        )}

        {/* ━━━ STEP 2: CONTACT INFORMATION FOR FOLLOW-UP ━━━ */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-white/10 bg-white/[0.02] p-5 sm:p-8 backdrop-blur-xl shadow-2xl shadow-black/60">
            <div className="border-b border-white/10 pb-4 mb-2">
              <h2 className="text-lg font-bold text-white">Your Contact Details</h2>
              <p className="text-xs text-zinc-400 mt-1">
                Our verification and inspection team will use this to contact you and schedule the physical visit.
              </p>
            </div>

            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-300">
                Full Name <span className="text-emerald-400">*</span>
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-3.5 text-zinc-500" />
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => updateField('full_name', e.target.value)}
                  placeholder="e.g. Patrick Mugabo"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            {/* Phone / WhatsApp */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-300">
                Phone / WhatsApp Number <span className="text-emerald-400">*</span>
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-3.5 text-zinc-500" />
                <input
                  type="tel"
                  required
                  value={formData.phone_number}
                  onChange={(e) => updateField('phone_number', e.target.value)}
                  placeholder="+250 788 000 000"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-emerald-500 transition-colors font-mono"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-300">
                Email Address <span className="text-emerald-400">*</span>
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-3.5 text-zinc-500" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="patrick@example.com"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            {/* Preferred Contact Mode */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-semibold text-zinc-300">
                How should we follow up with you?
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'whatsapp', label: 'WhatsApp' },
                  { id: 'phone', label: 'Phone Call' },
                  { id: 'email', label: 'Email' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => updateField('preferred_contact', m.id)}
                    className={cn(
                      "py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center",
                      formData.preferred_contact === m.id
                        ? "border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-sm"
                        : "border-white/10 bg-white/[0.02] text-zinc-400 hover:text-white"
                    )}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Preferred Time to reach */}
            <div className="space-y-2 pt-1">
              <label className="block text-xs font-semibold text-zinc-300">
                Best time for us to call or message
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'morning', label: 'Morning (9am - 12pm)' },
                  { id: 'afternoon', label: 'Afternoon (2pm - 5pm)' },
                  { id: 'anytime', label: 'Anytime' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => updateField('preferred_time', t.id)}
                    className={cn(
                      "py-2.5 px-2 rounded-xl border text-[11px] font-bold transition-all cursor-pointer text-center leading-tight",
                      formData.preferred_time === t.id
                        ? "border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-sm"
                        : "border-white/10 bg-white/[0.02] text-zinc-400 hover:text-white"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep(1)}
                className="py-3 px-5 rounded-xl text-zinc-400 hover:text-white border border-white/10 cursor-pointer"
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="flex-1 py-3.5 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-600 text-white text-base shadow-xl shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span>Submitting Details...</span>
                ) : (
                  <>
                    <span>Submit Property for Follow-Up</span>
                    <CheckCircle2 size={18} />
                  </>
                )}
              </Button>
            </div>
          </form>
        )}

        {/* ━━━ STEP 3: SUBMISSION SUCCESS ━━━ */}
        {step === 3 && (
          <div className="space-y-6 rounded-3xl border border-emerald-500/30 bg-emerald-950/20 p-6 sm:p-10 backdrop-blur-xl shadow-2xl text-center animate-in zoom-in-95 duration-200">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-lg shadow-emerald-500/30">
              <CheckCircle2 size={32} />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Property Received!
              </h2>
              <p className="text-sm sm:text-base text-zinc-300 max-w-lg mx-auto leading-relaxed">
                Thank you, <strong className="text-white">{formData.full_name}</strong>. We have registered your property proposal for follow-up.
              </p>
            </div>

            {/* Proposal Code Badge */}
            {submittedProposal?.proposal_code && (
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-black/60 border border-emerald-500/40 text-emerald-300 font-mono text-xs sm:text-sm shadow-inner">
                <span>Reference:</span>
                <span className="font-bold text-white">{submittedProposal.proposal_code}</span>
                <button
                  type="button"
                  onClick={copyCode}
                  className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  title="Copy reference code"
                >
                  {copiedCode ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                </button>
              </div>
            )}

            {/* What to expect next */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left space-y-3.5 max-w-xl mx-auto">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                What happens next:
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-zinc-300">
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs">
                    1
                  </div>
                  <div>
                    <strong className="text-white">Direct Follow-Up Call:</strong> Our onboarding team will call or WhatsApp you at <span className="font-mono text-emerald-400">{formData.phone_number}</span> to review details.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs">
                    2
                  </div>
                  <div>
                    <strong className="text-white">Inspection & Cadastre Check:</strong> We schedule a convenient physical site visit to inspect the property and confirm registry titles.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs">
                    3
                  </div>
                  <div>
                    <strong className="text-white">Live Listing:</strong> Your property goes live to verified buyers and tenants with full escrow protection.
                  </div>
                </div>
              </div>
            </div>

            {/* Back Actions */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                variant="primary"
                onClick={() => onNavigate?.('home')}
                className="w-full sm:w-auto px-8 py-3 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-600 text-white text-sm shadow-lg shadow-emerald-500/25 cursor-pointer"
              >
                Back to Home
              </Button>
              <Button
                variant="ghost"
                onClick={() => onNavigate?.('discovery')}
                className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-zinc-300 hover:text-white border border-white/10 cursor-pointer"
              >
                Browse Marketplace
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetProposalPage;
