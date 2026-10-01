import React, { useState, useCallback } from 'react';
import { ArrowLeft, ArrowRight, Rocket, ShieldCheck, Sparkles, Check, Upload, FileText, Eye, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { api } from '../../api/endpoints';
import apiClient from '../../api/client';
import type { AppView } from '../../types/navigation';

import StageProgressBar from './StageProgressBar';
import CategorySelector from './CategorySelector';
import type { WizardCategory } from './CategorySelector';
import SubtypeSelector from './SubtypeSelector';
import LocationPicker from './LocationPicker';
import type { LocationData } from './LocationPicker';
import SpecsForm from './SpecsForm';
import type { SpecsData } from './SpecsForm';
import type { FloorPlan } from './InteractiveUnitMatrix';

// ─── Types ───
interface UnifiedListingWizardProps {
  listedByRole: 'admin' | 'seller' | 'agent';
  onSuccess?: () => void;
  onNavigate?: (view: AppView) => void;
}

const STAGE_LABELS = ['Category', 'Specs', 'Media', 'Trust', 'Preview'];
const TOTAL_STAGES = 5;

// ─── Initial State ───
const initialLocation: LocationData = {
  province: 'Kigali City',
  district: 'Gasabo',
  sector: 'Kimihurura',
  cell: '',
  village: '',
  address: '',
  latitude: -1.9441,
  longitude: 30.0619,
  upiNumber: '',
};

const initialSpecs: SpecsData = {
  bedrooms: '3', bathrooms: '2', builtAreaSqm: '', compoundSizeSqm: '', yearBuilt: '',
  isFurnished: false, hasSwimmingPool: false, hasStaffQuarters: false, hasGarden: true,
  hasWaterTank: true, waterTankLiters: '5000', hasGenerator: false, generatorKva: '15',
  hasSolarWater: false, hasThreePhase: false, hasFiber: true, hasCctv: false,
  parkingSpaces: '2', securityType: 'Perimeter Wall', electricityMeter: 'Cash Power Prepaid', roadAccess: 'Tarmac',
  floorNumber: '', unitNumber: '', unitOrientation: '', balconySqm: '', parkingSlot: '',
  hasElevator: false, serviceCharge: '',
  sellingMode: 'per_unit', totalBuildingFloors: 3, floorPlan: [] as FloorPlan[],
  plotSizeSqm: '', zoningCode: 'R1', landUse: 'Residential', tenure: 'EmphyteuticLease',
  leaseYears: '49', far: '1.5', bcr: '50', maxFloors: 'G+2', terrain: 'Gentle Slope',
  slopePercent: '5', landRoadType: 'Tarmac', waterOnsite: true, electricityOnsite: true, wetlandBuffer: false,
  make: '', model: '', year: '2022', mileage: '', engineCc: '', horsepower: '',
  transmission: 'Automatic', fuelType: 'Petrol', drivetrain: '4WD', bodyType: 'SUV',
  seats: '5', condition: 'Foreign Used (Clean)', plateNumber: '', plateType: 'Private',
  vinChassis: '', rraCustoms: 'DutyPaid', hasAc: true, hasLeather: true, hasSunroof: false,
  hasReverseCamera: true, includesHelmet: false, hasDeliveryRack: false,
  commercialFloors: '4', grossArea: '', commercialZoning: 'Commercial C1',
  hasCommercialElevator: true, hasLoadingBay: false,
  starRating: 0, totalRooms: 0, conferenceHallsCount: 0,
  hasRestaurantBar: false, commercialLicenseNumber: '', managementType: 'Independent',
};

// ─── Component ───
export const UnifiedListingWizard: React.FC<UnifiedListingWizardProps> = ({
  listedByRole,
  onSuccess,
  onNavigate,
}) => {
  const [stage, setStage] = useState(1);
  const [category, setCategory] = useState<WizardCategory | null>(null);
  const [subtype, setSubtype] = useState<string | null>(null);
  const [location, setLocation] = useState<LocationData>(initialLocation);
  const [specs, setSpecs] = useState<SpecsData>(initialSpecs);

  // Stage 2: Pricing (merged into Specs)
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [purpose, setPurpose] = useState<'sale' | 'rent'>('sale');
  const [rentalFrequency, setRentalFrequency] = useState('per_month');
  const [securityDeposit, setSecurityDeposit] = useState('');
  const [isNegotiable, setIsNegotiable] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiMessage, setAiMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Stage 3: Media
  const [heroImage, setHeroImage] = useState<File | null>(null);
  const [heroPreview, setHeroPreview] = useState<string | null>(null);
  const [gallery, setGallery] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState('');

  // Stage 4: Trust Submission
  const [trustFiles, setTrustFiles] = useState<{ titleDeed: File | null; idDocument: File | null; proofOfOwnership: File | null }>({
    titleDeed: null,
    idDocument: null,
    proofOfOwnership: null,
  });
  const [trustSkipped, setTrustSkipped] = useState(false);

  // Stage 5: Preview
  const [confirmed, setConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // ─── Validation ───
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateStage = useCallback((s: number): boolean => {
    const errors: Record<string, string> = {};

    switch (s) {
      case 1:
        if (!category) errors.category = 'Please select a category';
        if (!subtype) errors.subtype = 'Please select a type';
        break;
      case 2: {
        if (!title.trim()) errors.title = 'Title is required';
        else if (title.trim().length < 10) errors.title = 'Title must be at least 10 characters';
        else if (title.trim().length > 100) errors.title = 'Title must be under 100 characters';

        if (!price || Number(price) <= 0) errors.price = 'Price must be greater than 0';

        if (description && description.length < 50) errors.description = 'Description must be at least 50 characters';

        if (!location.province || !location.district) errors.location = 'Province and district are required';

        if (category === 'car' || category === 'motorbike') {
          if (!specs.make) errors.make = 'Make is required';
          if (!specs.model) errors.model = 'Model is required';
        }
        if (category === 'land') {
          if (!specs.plotSizeSqm) errors.plotSize = 'Plot size is required';
        }
        if (category === 'house') {
          if (!specs.bedrooms) errors.bedrooms = 'Bedrooms is required';
        }
        break;
      }
      case 3:
        if (!heroImage) errors.heroImage = 'At least one photo is required';
        if (gallery.length > 10) errors.gallery = 'Maximum 10 gallery images allowed';
        break;
      case 4:
        // Trust submission is optional (can skip)
        break;
      case 5:
        if (!confirmed) errors.confirmed = 'Please confirm all details are accurate';
        break;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [category, subtype, title, price, description, location, specs, heroImage, gallery, confirmed]);

  const isStageValid = useCallback((s: number): boolean => {
    switch (s) {
      case 1: return category !== null && subtype !== null;
      case 2: {
        if (!title.trim() || !price || Number(price) <= 0) return false;
        if (!location.province || !location.district) return false;
        if (category === 'car' || category === 'motorbike') return !!specs.make && !!specs.model;
        if (category === 'land') return !!specs.plotSizeSqm;
        if (category === 'house') return !!specs.bedrooms;
        return true;
      }
      case 3: return heroImage !== null && gallery.length <= 10;
      case 4: return true; // Trust is optional
      case 5: return confirmed;
      default: return false;
    }
  }, [category, subtype, title, price, location, specs, heroImage, gallery, confirmed]);

  const handleNext = () => {
    if (isStageValid(stage) && stage < TOTAL_STAGES) {
      setStage((s) => s + 1);
    }
  };
  const handlePrev = () => stage > 1 && setStage((s) => s - 1);

  // Location updater
  const updateLocation = (updates: Partial<LocationData>) => {
    setLocation((prev) => ({ ...prev, ...updates }));
  };

  // Specs updater
  const updateSpecs = (updates: Partial<SpecsData>) => {
    setSpecs((prev) => ({ ...prev, ...updates }));
  };

  // Hero image handler
  const handleHeroUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setHeroImage(file);
    const reader = new FileReader();
    reader.onload = (ev) => setHeroPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  // Gallery handler
  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const fileArr = Array.from(files);
    setGallery((prev) => [...prev, ...fileArr]);
    fileArr.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => setGalleryPreviews((prev) => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(file);
    });
  };

  // Trust file handlers
  const handleTrustFileUpload = (field: keyof typeof trustFiles) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setTrustFiles((prev) => ({ ...prev, [field]: file }));
  };

  // AI title/description generator
  const handleGenerateAi = async () => {
    if (!category) return;
    setIsGeneratingAi(true);
    setAiMessage(null);
    try {
      const res = await api.seller.generateNarrative({
        title,
        category: category === 'apartment' ? 'house' : category,
        subType: subtype || '',
        city: location.province,
        district: location.district,
        price,
      });
      if (res.data?.title) setTitle(res.data.title);
      if (res.data?.narrative) setDescription(res.data.narrative);
      setAiMessage({ type: 'success', text: res.data?.provider === 'nvidia' ? 'AI copy generated.' : 'Draft copy prepared from your property details.' });
    } catch (error: any) {
      setAiMessage({ type: 'error', text: error.response?.data?.error || 'AI copy could not be generated. Check your AI configuration or write the copy manually.' });
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Submit
  const handleSubmit = async () => {
    if (!category || !subtype) return;
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const fd = new FormData();
      fd.append('title', title);
      fd.append('description', description);
      fd.append('purpose', purpose);
      fd.append('listed_by_role', listedByRole);
      fd.append('price', price);
      fd.append('negotiable', String(isNegotiable));
      if (purpose === 'rent') {
        fd.append('rental_frequency', rentalFrequency);
        if (securityDeposit) fd.append('security_deposit', securityDeposit);
      }

      // Map wizard category to backend category
      const backendCategory = category === 'apartment' ? 'house' : category;
      fd.append('category', backendCategory);
      fd.append('sub_type', subtype);

      // Location
      fd.append('province', location.province);
      fd.append('district', location.district);
      fd.append('sector', location.sector);
      fd.append('cell', location.cell);
      fd.append('village', location.village);
      fd.append('address', location.address);
      fd.append('latitude', String(location.latitude));
      fd.append('longitude', String(location.longitude));
      if (location.upiNumber) fd.append('upi_number', location.upiNumber);

      // Specs — append all relevant fields
      const specEntries = Object.entries(specs);
      for (const [key, value] of specEntries) {
        if (key === 'floorPlan') {
          fd.append('apartment_floor_plan', JSON.stringify(value));
        } else if (typeof value === 'boolean') {
          fd.append(key, String(value));
        } else if (value !== '' && value !== null && value !== undefined) {
          fd.append(key, String(value));
        }
      }

      // Media
      if (heroImage) fd.append('mainImage', heroImage);
      gallery.forEach((file, i) => fd.append(`gallery_${i}`, file));
      if (videoUrl) fd.append('videoUrl', videoUrl);

      // Trust documents
      if (trustFiles.titleDeed) fd.append('title_deed', trustFiles.titleDeed);
      if (trustFiles.idDocument) fd.append('id_document', trustFiles.idDocument);
      if (trustFiles.proofOfOwnership) fd.append('proof_of_ownership', trustFiles.proofOfOwnership);

      const createRequest = listedByRole === 'admin'
        ? api.admin.createProperty(fd)
        : apiClient.post('/seller/listings/create/', fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
      const createResponse = await createRequest;
      const createdListingId = createResponse.data?.id;
      if (createdListingId && (heroImage || gallery.length > 0)) {
        const uploadMedia = listedByRole === 'admin' ? api.admin.uploadMedia : api.seller.uploadMedia;
        const files = [heroImage, ...gallery].filter(Boolean) as File[];
        for (const file of files) {
          const mediaForm = new FormData();
          mediaForm.append('file', file);
          mediaForm.append('media_type', 'image');
          await uploadMedia(createdListingId, mediaForm);
        }
      }

      setSubmitSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        else if (onNavigate) onNavigate('discovery');
      }, 2000);
    } catch (err: any) {
      const responseData = err.response?.data;
      const fieldErrors = responseData && typeof responseData === 'object'
        ? Object.entries(responseData)
          .map(([field, value]) => `${field}: ${Array.isArray(value) ? value.join(', ') : String(value)}`)
          .join(' | ')
        : '';
      setSubmitError(responseData?.error || responseData?.detail || fieldErrors || err.message || 'We could not add this property. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Input styles shared
  const inputClass = 'w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-all focus:border-emerald-500/50';
  const inputStyle = {
    background: 'var(--color-input-bg)',
    borderColor: 'var(--color-input-border)',
    color: 'var(--color-text-main)',
  };

  const errorClass = 'text-red-400 text-[10px] font-semibold mt-1';

  // ─── Render Stage ───
  const renderStage = () => {
    switch (stage) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text-main)' }}>What are you listing?</h2>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Select the asset type and category</p>
            </div>

            <div>
              {validationErrors.category && <p className={errorClass}>{validationErrors.category}</p>}
              <CategorySelector selected={category} onSelect={(c) => { setCategory(c); setSubtype(null); }} />
            </div>

            {category && (
              <div>
                {validationErrors.subtype && <p className={errorClass}>{validationErrors.subtype}</p>}
                <SubtypeSelector category={category} selected={subtype} onSelect={setSubtype} />
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-5">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text-main)' }}>Specifications & Pricing</h2>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Technical details and listing terms</p>
            </div>

            {/* Location */}
            <div>
              {validationErrors.location && <p className={errorClass}>{validationErrors.location}</p>}
              <LocationPicker category={category || 'house'} location={location} onChange={updateLocation} />
            </div>

            {/* Specs */}
            {category && subtype && (
              <SpecsForm category={category} subtype={subtype} specs={specs} onChange={updateSpecs} />
            )}

            {/* Title */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Listing Title</label>
                <button type="button" onClick={handleGenerateAi} disabled={isGeneratingAi}
                  className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer disabled:opacity-50">
                  <Sparkles size={11} /> {isGeneratingAi ? 'Generating...' : 'AI Generate'}
                </button>
                {aiMessage && (
                  <p role="status" className={cn('text-[10px] font-semibold', aiMessage.type === 'success' ? 'text-emerald-500' : 'text-red-400')}>
                    {aiMessage.text}
                  </p>
                )}
              </div>
              {validationErrors.title && <p className={errorClass}>{validationErrors.title}</p>}
              <input type="text" className={inputClass} style={inputStyle} value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  category === 'car' ? 'e.g. 2022 Toyota RAV4 AWD' :
                  category === 'land' ? 'e.g. 450 sqm Plot in Gahanga' :
                  category === 'apartment' ? 'e.g. Modern 2-Bed Apartment, Nyarutarama' :
                  'e.g. 4-Bedroom Family Home with Garden'
                }
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Description</label>
              {validationErrors.description && <p className={errorClass}>{validationErrors.description}</p>}
              <textarea rows={4} className={cn(inputClass, 'resize-none')} style={inputStyle} value={description}
                onChange={(e) => setDescription(e.target.value)} placeholder="Describe the key features..." />
            </div>

            {/* Purpose */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Transaction Type</label>
              <div className="grid grid-cols-2 gap-2">
                {(['sale', 'rent'] as const).map((p) => (
                  <button key={p} type="button" onClick={() => setPurpose(p)}
                    className={cn('py-3 rounded-xl border-2 text-sm font-bold transition-all cursor-pointer',
                      purpose === p ? 'border-emerald-500 text-emerald-400' : 'border-transparent hover:border-white/10'
                    )}
                    style={{ background: purpose === p ? 'rgba(16,185,129,0.08)' : 'var(--color-input-bg)' }}>
                    {p === 'sale' ? 'For Sale' : 'For Rent'}
                  </button>
                ))}
              </div>
            </div>

            {purpose === 'rent' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Frequency</label>
                  <select className={cn(inputClass, 'cursor-pointer')} style={inputStyle} value={rentalFrequency} onChange={(e) => setRentalFrequency(e.target.value)}>
                    <option value="per_day">Per Day</option><option value="per_month">Per Month</option><option value="per_year">Per Year</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Security Deposit (RWF)</label>
                  <input type="number" className={inputClass} style={inputStyle} value={securityDeposit} onChange={(e) => setSecurityDeposit(e.target.value)} placeholder="Optional" />
                </div>
              </div>
            )}

            {/* Price */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Price (RWF)</label>
              {validationErrors.price && <p className={errorClass}>{validationErrors.price}</p>}
              <input type="number" className={cn(inputClass, 'text-lg font-mono font-bold')} style={inputStyle} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" />
              {Number(price) > 0 && (
                <p className="text-[10px] mt-1 font-mono" style={{ color: 'var(--color-text-dim)' }}>
                  ≈ ${Math.round(Number(price) / 1350).toLocaleString()} USD
                </p>
              )}
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={isNegotiable} onChange={(e) => setIsNegotiable(e.target.checked)} className="sr-only peer" />
              <div className="relative w-9 h-5 rounded-full peer peer-checked:bg-emerald-500 transition-colors" style={{ background: isNegotiable ? undefined : 'var(--color-input-bg)' }}>
                <div className={cn('absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform', isNegotiable && 'translate-x-4')} />
              </div>
              <span className="text-xs font-medium" style={{ color: 'var(--color-text-main)' }}>Price is negotiable</span>
            </label>
          </div>
        );

      case 3:
        return (
          <div className="space-y-5">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text-main)' }}>Photos & Media</h2>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Upload images to showcase your listing</p>
            </div>

            {/* Hero Image */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider block mb-2" style={{ color: 'var(--color-text-muted)' }}>
                Main Photo <span className="text-red-400">*</span>
              </label>
              {validationErrors.heroImage && <p className={errorClass}>{validationErrors.heroImage}</p>}
              <label
                className="block w-full aspect-video rounded-2xl border-2 border-dashed overflow-hidden cursor-pointer transition-colors hover:border-emerald-500/30"
                style={{ borderColor: heroPreview ? 'var(--color-border)' : 'rgba(255,255,255,0.1)', background: 'var(--color-input-bg)' }}
              >
                {heroPreview ? (
                  <img src={heroPreview} alt="Hero" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2" style={{ color: 'var(--color-text-dim)' }}>
                    <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 16v-8m-4 4l4-4 4 4M4 20h16" /></svg>
                    <span className="text-xs font-semibold">Click to upload hero photo</span>
                  </div>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleHeroUpload} />
              </label>
            </div>

            {/* Gallery */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider block mb-2" style={{ color: 'var(--color-text-muted)' }}>Gallery (up to 10)</label>
              {validationErrors.gallery && <p className={errorClass}>{validationErrors.gallery}</p>}
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {galleryPreviews.map((src, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden border" style={{ borderColor: 'var(--color-border)' }}>
                    <img src={src} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => {
                      setGallery((g) => g.filter((_, idx) => idx !== i));
                      setGalleryPreviews((p) => p.filter((_, idx) => idx !== i));
                    }} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] cursor-pointer">X</button>
                  </div>
                ))}
                {gallery.length < 10 && (
                  <label className="aspect-square rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer transition-colors hover:border-emerald-500/30"
                    style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'var(--color-input-bg)' }}>
                    <span className="text-xl" style={{ color: 'var(--color-text-dim)' }}>+</span>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryUpload} />
                  </label>
                )}
              </div>
            </div>

            {/* Video URL */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Video Tour URL (optional)</label>
              <input type="url" className={inputClass} style={inputStyle} value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://youtube.com/..." />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-5">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text-main)' }}>Trust & Verification</h2>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Upload documents to get verified (optional — you can skip and publish as &quot;Seller-Claimed&quot;)</p>
            </div>

            <div className="rounded-2xl border p-5 space-y-4" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-surface)' }}>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold" style={{ color: 'var(--color-text-main)' }}>Why verify?</h3>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Verified listings get 3x more inquiries and appear first in search results.</p>
                </div>
              </div>

              {/* Title Deed */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
                  <FileText size={12} className="inline mr-1" /> Title Deed
                </label>
                <label className="flex items-center gap-3 rounded-xl border border-dashed p-3 cursor-pointer transition-colors hover:border-emerald-500/30"
                  style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'var(--color-input-bg)' }}>
                  <Upload size={16} style={{ color: 'var(--color-text-dim)' }} />
                  <span className="text-xs" style={{ color: trustFiles.titleDeed ? 'var(--color-text-main)' : 'var(--color-text-dim)' }}>
                    {trustFiles.titleDeed ? trustFiles.titleDeed.name : 'Click to upload title deed'}
                  </span>
                  <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleTrustFileUpload('titleDeed')} />
                </label>
              </div>

              {/* ID Document */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
                  <FileText size={12} className="inline mr-1" /> National ID / Passport
                </label>
                <label className="flex items-center gap-3 rounded-xl border border-dashed p-3 cursor-pointer transition-colors hover:border-emerald-500/30"
                  style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'var(--color-input-bg)' }}>
                  <Upload size={16} style={{ color: 'var(--color-text-dim)' }} />
                  <span className="text-xs" style={{ color: trustFiles.idDocument ? 'var(--color-text-main)' : 'var(--color-text-dim)' }}>
                    {trustFiles.idDocument ? trustFiles.idDocument.name : 'Click to upload ID document'}
                  </span>
                  <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleTrustFileUpload('idDocument')} />
                </label>
              </div>

              {/* Proof of Ownership */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
                  <FileText size={12} className="inline mr-1" /> Proof of Ownership
                </label>
                <label className="flex items-center gap-3 rounded-xl border border-dashed p-3 cursor-pointer transition-colors hover:border-emerald-500/30"
                  style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'var(--color-input-bg)' }}>
                  <Upload size={16} style={{ color: 'var(--color-text-dim)' }} />
                  <span className="text-xs" style={{ color: trustFiles.proofOfOwnership ? 'var(--color-text-main)' : 'var(--color-text-dim)' }}>
                    {trustFiles.proofOfOwnership ? trustFiles.proofOfOwnership.name : 'Click to upload proof of ownership'}
                  </span>
                  <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleTrustFileUpload('proofOfOwnership')} />
                </label>
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={trustSkipped} onChange={(e) => setTrustSkipped(e.target.checked)}
                className="w-4 h-4 rounded border accent-emerald-500" />
              <span className="text-xs font-medium" style={{ color: 'var(--color-text-main)' }}>
                Skip for now — I&apos;ll verify later (listing will be &quot;Seller-Claimed&quot;)
              </span>
            </label>
          </div>
        );

      case 5:
        if (submitSuccess) {
          return (
            <div className="py-16 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Check size={32} className="text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-main)' }}>
                {listedByRole === 'admin' ? 'Property added successfully' : 'Listing published successfully'}
              </h2>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                {listedByRole === 'admin' ? 'The property is now in your admin inventory.' : 'Your listing is now live on Urugwiro.'}
              </p>
            </div>
          );
        }
        return (
          <div className="space-y-5">
            {submitError && (
              <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-300">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text-main)' }}>Live Preview</h2>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>This is how buyers will see your listing</p>
            </div>

            {/* Visual Preview Card */}
            <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-surface)' }}>
              {/* Preview Image */}
              <div className="aspect-video relative">
                {heroPreview ? (
                  <img src={heroPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--color-bg-elevated)' }}>
                    <span className="text-sm" style={{ color: 'var(--color-text-dim)' }}>No image</span>
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500 text-white">
                    {purpose === 'sale' ? 'For Sale' : 'For Rent'}
                  </span>
                </div>
                {trustFiles.titleDeed && (
                  <div className="absolute top-3 right-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Verified
                    </span>
                  </div>
                )}
              </div>

              {/* Preview Content */}
              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold" style={{ color: 'var(--color-text-main)' }}>{title || 'Untitled Listing'}</h3>
                    <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                      {location.province}, {location.district}, {location.sector}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-emerald-500">{Number(price).toLocaleString()} RWF</p>
                    {purpose === 'rent' && <p className="text-[10px]" style={{ color: 'var(--color-text-dim)' }}>{rentalFrequency.replace('per_', 'per ')}</p>}
                  </div>
                </div>

                {/* Preview Specs */}
                <div className="flex flex-wrap gap-2">
                  {category === 'house' && specs.bedrooms && (
                    <span className="px-2.5 py-1 rounded-lg text-xs" style={{ background: 'var(--color-bg-elevated)', color: 'var(--color-text-muted)' }}>
                      {specs.bedrooms} beds
                    </span>
                  )}
                  {category === 'house' && specs.bathrooms && (
                    <span className="px-2.5 py-1 rounded-lg text-xs" style={{ background: 'var(--color-bg-elevated)', color: 'var(--color-text-muted)' }}>
                      {specs.bathrooms} baths
                    </span>
                  )}
                  {category === 'land' && specs.plotSizeSqm && (
                    <span className="px-2.5 py-1 rounded-lg text-xs" style={{ background: 'var(--color-bg-elevated)', color: 'var(--color-text-muted)' }}>
                      {specs.plotSizeSqm} m²
                    </span>
                  )}
                  {category === 'car' && specs.make && (
                    <span className="px-2.5 py-1 rounded-lg text-xs" style={{ background: 'var(--color-bg-elevated)', color: 'var(--color-text-muted)' }}>
                      {specs.year} {specs.make} {specs.model}
                    </span>
                  )}
                </div>

                {/* Preview Description */}
                {description && (
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                    {description.slice(0, 150)}{description.length > 150 ? '...' : ''}
                  </p>
                )}

                {/* Preview Details */}
                <div className="flex items-center gap-4 text-[10px]" style={{ color: 'var(--color-text-dim)' }}>
                  <span className="flex items-center gap-1"><Eye size={11} /> 0 views</span>
                  <span className="flex items-center gap-1"><Check size={11} /> {listedByRole}</span>
                  {isNegotiable && <span className="text-emerald-400">Negotiable</span>}
                </div>
              </div>
            </div>

            {/* Edit stage links */}
            <div className="flex flex-wrap gap-1.5">
              {STAGE_LABELS.slice(0, 4).map((label, i) => (
                <button key={i} type="button" onClick={() => setStage(i + 1)}
                  className="text-[10px] font-bold px-2.5 py-1 rounded-full border cursor-pointer transition-colors hover:border-emerald-500/30"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-dim)' }}>
                  Edit {label}
                </button>
              ))}
            </div>

            {/* Confirm */}
            {validationErrors.confirmed && <p className={errorClass}>{validationErrors.confirmed}</p>}
            <label className="flex items-center gap-3 cursor-pointer pt-2">
              <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)}
                className="w-4 h-4 rounded border accent-emerald-500" />
              <span className="text-xs font-medium" style={{ color: 'var(--color-text-main)' }}>
                I confirm all details are accurate and ready to publish
              </span>
            </label>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="max-w-3xl mx-auto p-6 sm:p-8 space-y-8"
      style={{ color: 'var(--color-text-main)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-main)' }}>
            List New Asset
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-dim)' }}>
            {listedByRole === 'admin' ? 'Admin Registry' : 'Seller Portal'} · Urugwiro
          </p>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
          {listedByRole}
        </span>
      </div>

      {/* Progress */}
      <StageProgressBar currentStage={stage} totalStages={TOTAL_STAGES} stageLabels={STAGE_LABELS} />

      {/* Stage Content */}
      <div
        className="rounded-3xl border p-6 sm:p-8 backdrop-blur-xl transition-colors duration-300"
        style={{
          borderColor: 'var(--color-border)',
          background: 'var(--color-bg-card)',
          boxShadow: 'var(--shadow-depth-1)',
        }}
      >
        {renderStage()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={handlePrev}
          disabled={stage === 1}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl transition-all cursor-pointer disabled:opacity-0"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <ArrowLeft size={16} /> Back
        </button>

        {stage < TOTAL_STAGES ? (
          <button
            type="button"
            onClick={handleNext}
            disabled={!isStageValid(stage)}
            className={cn(
              'flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-xl transition-all',
              isStageValid(stage)
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 cursor-pointer'
                : 'bg-white/[0.06] text-zinc-600 cursor-not-allowed',
            )}
          >
            Continue <ArrowRight size={16} />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!confirmed || isSubmitting}
            className={cn(
              'flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-xl transition-all',
              confirmed && !isSubmitting
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 cursor-pointer'
                : 'bg-white/[0.06] text-zinc-600 cursor-not-allowed',
            )}
          >
            {isSubmitting ? 'Publishing...' : <><Rocket size={16} /> Publish Listing</>}
          </button>
        )}
      </div>
    </div>
  );
};

export default UnifiedListingWizard;
