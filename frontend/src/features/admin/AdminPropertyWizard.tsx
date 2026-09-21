import React, { useState, useMemo } from 'react';
import {
  Building2,
  Compass,
  Car,
  Landmark,
  MapPin,
  DollarSign,
  ShieldCheck,
  Camera,
  Layers,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Trash2,
  Sparkles,
  FileCheck,
  Eye,
  Plus,
  HelpCircle,
  FileText,
  UploadCloud,
  Check,
  RefreshCw,
  Award,
  Wand2
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';
import apiClient from '../../api/client';
import { api } from '../../api/endpoints';
import type { AppView } from '../../types/navigation';

interface AdminPropertyWizardProps {
  onNavigate?: (view: AppView) => void;
}

type CategoryType = 'land' | 'residential' | 'vehicle' | 'commercial';
type PurposeType = 'sale' | 'rent';

export const SUBTYPES_BY_CATEGORY: Record<CategoryType, { id: string; label: string }[]> = {
  residential: [
    { id: 'Luxury Villa', label: 'Luxury Villa' },
    { id: 'Penthouse', label: 'Penthouse' },
    { id: 'Duplex / Townhouse', label: 'Duplex / Townhouse' },
    { id: 'Modern Apartment', label: 'Modern Apartment' },
    { id: 'Gated Compound Estate', label: 'Gated Compound Estate' },
  ],
  land: [
    { id: 'Residential Plot (R1/R2)', label: 'Residential Plot (R1/R2)' },
    { id: 'Commercial Land (C1/C2)', label: 'Commercial Land (C1/C2)' },
    { id: 'Mixed-Use Parcel', label: 'Mixed-Use Parcel' },
    { id: 'Agricultural / Farm Estate', label: 'Agricultural / Farm Estate' },
    { id: 'Industrial Zone (M1)', label: 'Industrial Zone (M1)' },
  ],
  commercial: [
    { id: 'Grade-A Office Tower', label: 'Grade-A Office Tower' },
    { id: 'Retail Mall & Plaza', label: 'Retail Mall & Plaza' },
    { id: 'Mixed-Use Commercial Complex', label: 'Mixed-Use Commercial Complex' },
    { id: 'Boutique Hotel & Hospitality', label: 'Boutique Hotel & Hospitality' },
    { id: 'Logistics & Warehousing', label: 'Logistics & Warehousing' },
  ],
  vehicle: [
    { id: 'Armored Diplomatic SUV', label: 'Armored Diplomatic SUV' },
    { id: 'Executive Luxury Sedan', label: 'Executive Luxury Sedan' },
    { id: 'VIP Shuttle / Sprinter', label: 'VIP Shuttle / Sprinter' },
    { id: 'High-Performance Coupe', label: 'High-Performance Coupe' },
  ],
};

export const AdminPropertyWizard: React.FC<AdminPropertyWizardProps> = ({ onNavigate }) => {
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [createdSlug, setCreatedSlug] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // AI Generation & Copilot State
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [aiSuccessMessage, setAiSuccessMessage] = useState<string | null>(null);

  // Stage 1: Classification & Sub-Type
  const [purpose, setPurpose] = useState<PurposeType>('sale');
  const [category, setCategory] = useState<CategoryType>('residential');
  const [subType, setSubType] = useState<string>('Luxury Villa');
  const [title, setTitle] = useState<string>('');
  const [ownerName, setOwnerName] = useState<string>('Sovereign Treasury / Verified Owner');
  const [ownerPhone, setOwnerPhone] = useState<string>('+250788000000');
  const [ownerEmail, setOwnerEmail] = useState<string>('registry@urugwiro.rw');
  const [description, setDescription] = useState<string>('');

  // Stage 2: Location & Cadastre
  const [upiNumber, setUpiNumber] = useState<string>('');
  const [province, setProvince] = useState<string>('Kigali City');
  const [district, setDistrict] = useState<string>('Gasabo');
  const [sector, setSector] = useState<string>('Kimihurura');
  const [cell, setCell] = useState<string>('Rugando');
  const [village, setVillage] = useState<string>('Gasave');
  const [address, setAddress] = useState<string>('');
  const [latitude, setLatitude] = useState<string>('-1.9441');
  const [longitude, setLongitude] = useState<string>('30.0619');

  // Stage 3: Class-Specific Technical Specifications
  // 3A: Land Specs
  const [landZoning, setLandZoning] = useState<string>('R1');
  const [landSizeSqm, setLandSizeSqm] = useState<string>('850');
  const [landTerrain, setLandTerrain] = useState<string>('Gentle Slope');
  const [landRoadType, setLandRoadType] = useState<string>('Paved Tarmac');
  const [landWaterOnsite, setLandWaterOnsite] = useState<boolean>(true);
  const [landElectricityOnsite, setLandElectricityOnsite] = useState<boolean>(true);
  const [landDrainage, setLandDrainage] = useState<string>('Engineered Storm Drain');

  // 3B: Residential Specs
  const [houseSubType, setHouseSubType] = useState<string>('Luxury Villa');
  const [bedrooms, setBedrooms] = useState<string>('5');
  const [bathrooms, setBathrooms] = useState<string>('6');
  const [builtAreaSqm, setBuiltAreaSqm] = useState<string>('420');
  const [compoundAreaSqm, setCompoundAreaSqm] = useState<string>('750');
  const [yearBuilt, setYearBuilt] = useState<string>('2024');
  const [isFurnished, setIsFurnished] = useState<boolean>(true);
  const [hasSwimmingPool, setHasSwimmingPool] = useState<boolean>(true);
  const [hasStaffQuarters, setHasStaffQuarters] = useState<boolean>(true);
  const [hasGarden, setHasGarden] = useState<boolean>(true);
  const [hasBackupGenerator, setHasBackupGenerator] = useState<boolean>(true);
  const [hasSolarWaterHeater, setHasSolarWaterHeater] = useState<boolean>(true);
  const [securityType, setSecurityType] = useState<string>('24/7 Armed Guard & Biometric Gated');

  // 3C: Vehicle Specs
  const [vehicleMake, setVehicleMake] = useState<string>('Toyota');
  const [vehicleModel, setVehicleModel] = useState<string>('Land Cruiser VXR 300');
  const [vehicleYear, setVehicleYear] = useState<string>('2024');
  const [vehicleMileage, setVehicleMileage] = useState<string>('4500');
  const [vehicleTransmission, setVehicleTransmission] = useState<string>('Automatic');
  const [vehicleFuel, setVehicleFuel] = useState<string>('Diesel V6 Twin Turbo');
  const [armoredRating, setArmoredRating] = useState<string>('VR7 / B6 Certified Ballistic');
  const [plateType, setPlateType] = useState<string>('Private Citizen');
  const [seatingCapacity, setSeatingCapacity] = useState<string>('7');

  // 3D: Commercial Specs
  const [commercialFloors, setCommercialFloors] = useState<string>('8');
  const [commercialGrossArea, setCommercialGrossArea] = useState<string>('3600');
  const [commercialZoning, setCommercialZoning] = useState<string>('Mixed Commercial C1');
  const [hasElevator, setHasElevator] = useState<boolean>(true);
  const [hasLoadingBay, setHasLoadingBay] = useState<boolean>(true);

  // Stage 4: Financials & Escrow
  const [priceRWF, setPriceRWF] = useState<string>('280000000');
  const [escrowPercent, setEscrowPercent] = useState<string>('10');
  const [rentalFrequency, setRentalFrequency] = useState<string>('Monthly');
  const [securityDepositRWF, setSecurityDepositRWF] = useState<string>('0');
  const [verificationLevel, setVerificationLevel] = useState<string>('verified');
  const [titleDeedFile, setTitleDeedFile] = useState<File | null>(null);

  // Stage 5: Media & Digital Twin
  const [heroImage, setHeroImage] = useState<File | null>(null);
  const [heroImagePreview, setHeroImagePreview] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [digitalTwinUrl, setDigitalTwinUrl] = useState<string>('');
  const [videoTourUrl, setVideoTourUrl] = useState<string>('');

  // USD Conversion
  const priceUSD = useMemo(() => {
    const val = Number(priceRWF) || 0;
    return Math.round(val / 1350);
  }, [priceRWF]);

  // Handle Hero Image Upload
  const handleHeroUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setHeroImage(file);
    const reader = new FileReader();
    reader.onload = (ev) => setHeroImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  // Handle Gallery Uploads
  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const fileArr = Array.from(files);
    setGalleryImages((prev) => [...prev, ...fileArr]);

    fileArr.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setGalleryPreviews((prev) => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove Gallery Item
  const removeGalleryImage = (index: number) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle Category Select
  const handleCategorySelect = (newCat: CategoryType) => {
    setCategory(newCat);
    const firstSub = SUBTYPES_BY_CATEGORY[newCat][0].id;
    setSubType(firstSub);
    if (newCat === 'residential') setHouseSubType(firstSub);
  };

  // AI Narrative & Title Generator
  const handleGenerateAiNarrative = async () => {
    setIsGeneratingAi(true);
    setAiSuccessMessage(null);
    try {
      const specsSummary =
        category === 'residential'
          ? `${bedrooms} Beds, ${bathrooms} Baths, ${builtAreaSqm} sqm built, Pool: ${hasSwimmingPool ? 'Yes' : 'No'}`
          : category === 'land'
          ? `${landSizeSqm} sqm, Zoning: ${landZoning}, Road: ${landRoadType}`
          : category === 'commercial'
          ? `${commercialFloors} Floors, ${commercialGrossArea} sqm GLA`
          : `${vehicleYear} ${vehicleMake} ${vehicleModel}, Armor: ${armoredRating}`;

      const res = await api.seller.generateNarrative({
        title,
        category,
        subType,
        city: province,
        district,
        specs: specsSummary,
        price: priceRWF,
      });

      if (res.data?.title) {
        setTitle(res.data.title);
      }
      if (res.data?.narrative) {
        setDescription(res.data.narrative);
      }
      setAiSuccessMessage('NVIDIA AI generated luxury title and description!');
      setTimeout(() => setAiSuccessMessage(null), 5000);
    } catch (err: any) {
      console.error('AI generation error', err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // AI Autofill Recommended Specs
  const handleAutofillAiSpecs = () => {
    if (category === 'residential') {
      if (subType === 'Penthouse') {
        setBedrooms('4');
        setBathrooms('5');
        setBuiltAreaSqm('480');
        setCompoundAreaSqm('0');
        setHasSwimmingPool(true);
        setHasBackupGenerator(true);
        setHasSolarWaterHeater(true);
        setHasGarden(false);
      } else if (subType === 'Luxury Villa') {
        setBedrooms('5');
        setBathrooms('6');
        setBuiltAreaSqm('520');
        setCompoundAreaSqm('900');
        setHasSwimmingPool(true);
        setHasStaffQuarters(true);
        setHasGarden(true);
        setHasBackupGenerator(true);
        setHasSolarWaterHeater(true);
      } else if (subType === 'Modern Apartment') {
        setBedrooms('3');
        setBathrooms('3');
        setBuiltAreaSqm('185');
        setCompoundAreaSqm('0');
        setHasSwimmingPool(true);
        setHasGarden(false);
      } else {
        setBedrooms('4');
        setBathrooms('4');
        setBuiltAreaSqm('320');
        setCompoundAreaSqm('500');
        setHasGarden(true);
      }
    } else if (category === 'land') {
      if (subType.includes('Commercial')) {
        setLandSizeSqm('1800');
        setLandZoning('C1');
        setLandRoadType('Paved Tarmac');
        setLandWaterOnsite(true);
        setLandElectricityOnsite(true);
      } else if (subType.includes('Agricultural')) {
        setLandSizeSqm('15000');
        setLandZoning('Agri');
        setLandRoadType('Murram');
        setLandWaterOnsite(true);
        setLandElectricityOnsite(false);
      } else {
        setLandSizeSqm('850');
        setLandZoning('R1');
        setLandRoadType('Paved Tarmac');
        setLandWaterOnsite(true);
        setLandElectricityOnsite(true);
      }
    } else if (category === 'commercial') {
      setCommercialFloors('8');
      setCommercialGrossArea('3800');
      setCommercialZoning('Commercial C1');
      setHasElevator(true);
      setHasLoadingBay(true);
    } else if (category === 'vehicle') {
      setVehicleMake('Toyota');
      setVehicleModel('Land Cruiser VXR 300');
      setVehicleYear('2024');
      setVehicleMileage('3200');
      setArmoredRating('VR7 / B6 Certified Ballistic');
      setPlateType('Private Citizen');
      setSeatingCapacity('7');
    }
    setAiSuccessMessage('Recommended specs autofilled for ' + subType);
    setTimeout(() => setAiSuccessMessage(null), 4000);
  };

  // Submit to Backend
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('title', title || `Sovereign ${category.toUpperCase()} - ${district}`);
      formData.append('purpose', purpose);
      formData.append('propertyType', category === 'residential' ? 'house' : category);
      formData.append('category', category);
      formData.append('subType', subType);
      formData.append('price', priceRWF);
      formData.append('currency', 'RWF');
      formData.append('description', description || `Certified sovereign asset registered in ${district}, ${province}.`);
      formData.append('address', address || `${sector}, ${district}`);
      formData.append('city', province);
      formData.append('district', district);
      formData.append('sector', sector);
      formData.append('verificationLevel', verificationLevel);

      // Category Specific Data
      if (category === 'land') {
        formData.append('upiNumber', upiNumber);
        formData.append('titleDeedNumber', upiNumber);
        formData.append('zoningCode', landZoning);
        formData.append('sizeSqm', landSizeSqm);
        formData.append('terrain', landTerrain);
        formData.append('roadType', landRoadType);
        formData.append('waterOnsite', landWaterOnsite ? 'true' : 'false');
        formData.append('electricityOnsite', landElectricityOnsite ? 'true' : 'false');
        formData.append('drainageSystem', landDrainage);
      } else if (category === 'residential') {
        formData.append('houseSubType', houseSubType);
        formData.append('bedrooms', bedrooms);
        formData.append('bathrooms', bathrooms);
        formData.append('sizeSqm', builtAreaSqm);
        formData.append('compoundSizeSqm', compoundAreaSqm);
        formData.append('yearBuilt', yearBuilt);
        formData.append('isFurnished', isFurnished ? 'true' : 'false');
        formData.append('hasSwimmingPool', hasSwimmingPool ? 'true' : 'false');
        formData.append('hasStaffQuarters', hasStaffQuarters ? 'true' : 'false');
        formData.append('hasGarden', hasGarden ? 'true' : 'false');
        formData.append('hasBackupGenerator', hasBackupGenerator ? 'true' : 'false');
        formData.append('hasSolarWaterHeater', hasSolarWaterHeater ? 'true' : 'false');
        formData.append('securityType', securityType);
      } else if (category === 'vehicle') {
        formData.append('vehicleType', 'Car');
        formData.append('make', vehicleMake);
        formData.append('model', vehicleModel);
        formData.append('year', vehicleYear);
        formData.append('mileage', vehicleMileage);
        formData.append('transmission', vehicleTransmission);
        formData.append('fuelType', vehicleFuel);
        formData.append('engineCapacity', armoredRating);
        formData.append('plateType', plateType);
        formData.append('seatingCapacity', seatingCapacity);
      } else if (category === 'commercial') {
        formData.append('totalFloors', commercialFloors);
        formData.append('sizeSqm', commercialGrossArea);
        formData.append('zoningType', commercialZoning);
      }

      // Media
      if (heroImage) {
        formData.append('mainImage', heroImage);
      }
      galleryImages.forEach((img) => {
        formData.append('galleryImages', img);
      });
      if (titleDeedFile) {
        formData.append('titleDeedDocument', titleDeedFile);
      }
      if (digitalTwinUrl) {
        formData.append('virtualTourUrl', digitalTwinUrl);
      }

      const res = await apiClient.post('/seller/listings/create/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setCreatedSlug(res.data?.slug || '');
      setIsSuccess(true);
    } catch (err: any) {
      const errText =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Failed to register asset. Please check all required fields.';
      setErrorMessage(typeof errText === 'object' ? JSON.stringify(errText) : String(errText));
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { num: 1, label: 'Identity & Class' },
    { num: 2, label: 'Location & UPI' },
    { num: 3, label: 'Technical Specs' },
    { num: 4, label: 'Financials & Escrow' },
    { num: 5, label: 'Media & 3D Twins' },
  ];

  // Success Celebration View
  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-6 text-center oneui-enter">
        <div className="h-20 w-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/40 flex items-center justify-center mx-auto mb-6 text-emerald-400 oneui-pulse-encouraging">
          <CheckCircle2 size={40} strokeWidth={2} />
        </div>
        <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 font-bold block mb-2">
          Registration Certified
        </span>
        <h2 className="text-3xl font-serif font-bold text-white mb-3">
          Asset Successfully Published to Master Ledger
        </h2>
        <p className="text-sm text-zinc-400 max-w-md mx-auto mb-8 font-mono">
          Title and spatial boundaries recorded with statutory validation.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {onNavigate && (
            <>
              <Button
                variant="primary"
                onClick={() => onNavigate('admin-listings')}
                className="w-full sm:w-auto bg-[#c5a880] hover:bg-[#d4b993] text-black font-semibold text-xs py-3 px-6 rounded-xl oneui-press"
              >
                View in Asset Catalog
              </Button>
              <Button
                variant="secondary"
                onClick={() => onNavigate('admin')}
                className="w-full sm:w-auto border-white/10 bg-white/[0.04] text-zinc-200 hover:text-white text-xs py-3 px-6 rounded-xl oneui-press"
              >
                Return to Dashboard
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            onClick={() => {
              setIsSuccess(false);
              setStep(1);
              setTitle('');
              setUpiNumber('');
              setHeroImage(null);
              setHeroImagePreview(null);
              setGalleryPreviews([]);
            }}
            className="w-full sm:w-auto text-zinc-400 hover:text-white text-xs py-3 px-5"
          >
            Register Another Asset
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 xl:p-10 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ CLEAN EXECUTIVE PROGRESS HEADER Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 shadow-lg shadow-black/20 oneui-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-serif font-bold text-white tracking-tight">
              New Asset Registration
            </h1>
            <p className="text-xs text-zinc-300 font-mono mt-0.5 font-medium">
              Step {step} of 5 Ã¢â‚¬â€ <span className="text-emerald-400 font-bold">{steps[step - 1].label}</span>
            </p>
          </div>
        </div>

        {/* Minimal Progress Bar */}
        <div className="w-full bg-white/[0.1] h-1.5 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(16,185,129,0.6)]"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>

        {/* Step Navigation Pills */}
        <div className="grid grid-cols-5 gap-2">
          {steps.map((st) => {
            const isDone = st.num < step;
            const isCurrent = st.num === step;
            return (
              <button
                key={st.num}
                type="button"
                onClick={() => setStep(st.num)}
                className={cn(
                  'py-2 px-2 text-center rounded-xl border transition-all oneui-press text-xs font-semibold',
                  isCurrent
                    ? 'bg-emerald-500 text-white border-emerald-500 font-extrabold shadow-sm'
                    : isDone
                    ? 'bg-white/[0.04] text-zinc-200 border-white/[0.12]'
                    : 'bg-white/[0.02] text-zinc-400 border-white/10 hover:text-zinc-200'
                )}
              >
                <span className="truncate block">{st.num}. {st.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl border border-red-500/35 bg-red-500/15 text-red-200 text-xs font-semibold flex items-center gap-2">
          <HelpCircle size={16} className="text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ FORM CONTAINER Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 lg:p-8 space-y-6 shadow-lg shadow-black/20">
        {/* Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ STAGE 1: CLASSIFICATION, SUB-TYPE & DETAILS Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */}
        {step === 1 && (
          <div className="space-y-6 oneui-enter">
            {/* 1. Property Class */}
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold block mb-3">
                Property Class
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'residential', label: 'Residential', icon: Building2 },
                  { id: 'land', label: 'Land Parcel', icon: Compass },
                  { id: 'commercial', label: 'Commercial', icon: Landmark },
                  { id: 'vehicle', label: 'Mobility Fleet', icon: Car },
                ].map((cat) => {
                  const Icon = cat.icon;
                  const isSel = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategorySelect(cat.id as CategoryType)}
                      className={cn(
                        'p-4 rounded-xl border text-center flex flex-col items-center justify-center gap-2 transition-all oneui-press',
                        isSel
                          ? 'border-emerald-500 bg-emerald-500/15 text-white shadow-sm font-bold'
                          : 'border-white/10 bg-white/[0.04] text-zinc-200 hover:text-white hover:border-white/[0.15]'
                      )}
                    >
                      <Icon size={22} className={cn('transition-colors', isSel ? 'text-emerald-400' : 'text-zinc-300')} />
                      <span className="text-xs font-semibold">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Sub-Type */}
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold block mb-3">
                Sub-Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                {SUBTYPES_BY_CATEGORY[category]?.map((sub) => {
                  const isSel = subType === sub.id;
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => {
                        setSubType(sub.id);
                        if (category === 'residential') setHouseSubType(sub.id);
                      }}
                      className={cn(
                        'py-3 px-3 rounded-xl border text-center transition-all oneui-press text-xs font-medium',
                        isSel
                          ? 'border-emerald-500 bg-emerald-500/20 text-white shadow-sm font-bold'
                          : 'border-white/10 bg-white/[0.04] text-zinc-200 hover:text-white hover:border-white/[0.15]'
                      )}
                    >
                      <span className="truncate block">{sub.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Transaction Type */}
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold block mb-2.5">
                Transaction Type
              </label>
              <div className="grid grid-cols-2 gap-3 max-w-xs">
                <button
                  type="button"
                  onClick={() => setPurpose('sale')}
                  className={cn(
                    'py-2.5 rounded-xl font-bold text-xs border transition-all oneui-press flex items-center justify-center gap-2',
                    purpose === 'sale'
                      ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                      : 'border-white/10 text-zinc-200 hover:text-white bg-white/[0.04]'
                  )}
                >
                  <Award size={14} /> For Sale
                </button>
                <button
                  type="button"
                  onClick={() => setPurpose('rent')}
                  className={cn(
                    'py-2.5 rounded-xl font-bold text-xs border transition-all oneui-press flex items-center justify-center gap-2',
                    purpose === 'rent'
                      ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                      : 'border-white/10 text-zinc-200 hover:text-white bg-white/[0.04]'
                  )}
                >
                  <RefreshCw size={14} /> For Lease
                </button>
              </div>
            </div>

            {/* 4. Asset Details & Inline AI Assistant */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold">
                  Asset Details
                </label>
                <button
                  type="button"
                  onClick={handleGenerateAiNarrative}
                  disabled={isGeneratingAi}
                  className="px-3.5 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 text-xs font-bold flex items-center gap-1.5 oneui-press disabled:opacity-50 transition-all shadow-sm"
                >
                  <Sparkles size={13} className={cn(isGeneratingAi && 'animate-spin')} />
                  <span>{isGeneratingAi ? 'Drafting...' : 'AI Auto-Draft'}</span>
                </button>
              </div>

              {aiSuccessMessage && (
                <div className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.08] text-zinc-300 text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                  <span>{aiSuccessMessage}</span>
                </div>
              )}

              <div>
                <label className="text-[11px] font-mono text-zinc-400 block mb-1.5">
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={`e.g. Paramount ${subType} in ${district || 'Kimihurura'}`}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all font-semibold"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-zinc-400 block mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Architectural, legal, and spatial summary..."
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all leading-relaxed"
                />
              </div>
            </div>

            {/* 5. Ownership Entity */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-white/[0.06]">
              <div>
                <label className="text-[11px] font-mono text-zinc-400 block mb-1.5">
                  Owner / Entity Name
                </label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
                />
              </div>
              <div>
                <label className="text-[11px] font-mono text-zinc-400 block mb-1.5">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={ownerPhone}
                  onChange={(e) => setOwnerPhone(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2 text-xs text-white font-mono outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
                />
              </div>
              <div>
                <label className="text-[11px] font-mono text-zinc-400 block mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2 text-xs text-white font-mono outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
                />
              </div>
            </div>
          </div>
        )}

        {/* Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ STAGE 2: LOCATION & CADASTRE Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */}
        {step === 2 && (
          <div className="space-y-6 oneui-enter">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold">
                  Rwanda Land UPI (Unique Parcel Identifier)
                </label>
                <span className="text-[10px] font-mono text-zinc-500">Optional for vehicles</span>
              </div>
              <input
                type="text"
                value={upiNumber}
                onChange={(e) => setUpiNumber(e.target.value)}
                placeholder="1/02/03/04/5678"
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-mono outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all font-semibold"
              />
            </div>

            {/* Administrative Cascade */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-2">
                  Province
                </label>
                <select
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
                >
                  <option value="Kigali City">Kigali City</option>
                  <option value="Northern Province">Northern Province</option>
                  <option value="Southern Province">Southern Province</option>
                  <option value="Eastern Province">Eastern Province</option>
                  <option value="Western Province">Western Province</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-2">
                  District
                </label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
                />
              </div>

              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-2">
                  Sector
                </label>
                <input
                  type="text"
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
                />
              </div>

              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-2">
                  Cell
                </label>
                <input
                  type="text"
                  value={cell}
                  onChange={(e) => setCell(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
                />
              </div>

              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-2">
                  Village
                </label>
                <input
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
                />
              </div>

              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-2">
                  Physical Street Landmark
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. KG 14 Ave, Plot 18"
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
                />
              </div>
            </div>

            {/* GPS Spatial Coordinates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-2">
                  Latitude
                </label>
                <input
                  type="text"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
                />
              </div>
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-2">
                  Longitude
                </label>
                <input
                  type="text"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
                />
              </div>
            </div>
          </div>
        )}

        {/* Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ STAGE 3: TECHNICAL SPECIFICATIONS Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */}
        {step === 3 && (
          <div className="space-y-6 oneui-enter">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-sm font-serif font-bold text-white tracking-wide">
                {subType} Specifications
              </h3>

              <button
                type="button"
                onClick={handleAutofillAiSpecs}
                className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.04] text-zinc-300 hover:text-white hover:border-[#c5a880]/40 text-xs font-medium flex items-center gap-1.5 oneui-press transition-all"
              >
                <Wand2 size={13} className="text-emerald-400" />
                <span>Autofill Defaults</span>
              </button>
            </div>

            {aiSuccessMessage && (
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-zinc-300 text-xs font-medium flex items-center gap-2 animate-in fade-in duration-200">
                <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                <span>{aiSuccessMessage}</span>
              </div>
            )}

            {/* 3A: LAND SPECS */}
            {category === 'land' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-2">
                      Total Plot Size (sqm) *
                    </label>
                    <input
                      type="number"
                      value={landSizeSqm}
                      onChange={(e) => setLandSizeSqm(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-2">
                      Master Plan Zoning
                    </label>
                    <select
                      value={landZoning}
                      onChange={(e) => setLandZoning(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
                    >
                      <option value="R1">R1 - Low Density Residential</option>
                      <option value="R2">R2 - Medium Density Residential</option>
                      <option value="R3">R3 - High Density / Apartments</option>
                      <option value="C1">C1 - Commercial Mixed-Use</option>
                      <option value="I">I - Light Industrial & Logistics</option>
                      <option value="A">A - Agricultural & Forestry</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-2">
                      Topography
                    </label>
                    <input
                      type="text"
                      value={landTerrain}
                      onChange={(e) => setLandTerrain(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-2">
                      Road Access
                    </label>
                    <input
                      type="text"
                      value={landRoadType}
                      onChange={(e) => setLandRoadType(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-2">
                      Drainage Infrastructure
                    </label>
                    <input
                      type="text"
                      value={landDrainage}
                      onChange={(e) => setLandDrainage(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
                    />
                  </div>
                </div>

                <div className="flex gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
                    <input
                      type="checkbox"
                      checked={landWaterOnsite}
                      onChange={(e) => setLandWaterOnsite(e.target.checked)}
                      className="rounded accent-emerald-500"
                    />
                    WASAC Water Connected
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
                    <input
                      type="checkbox"
                      checked={landElectricityOnsite}
                      onChange={(e) => setLandElectricityOnsite(e.target.checked)}
                      className="rounded accent-emerald-500"
                    />
                    EUCL Electricity On-Site
                  </label>
                </div>
              </div>
            )}

            {/* 3B: RESIDENTIAL SPECS */}
            {category === 'residential' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-2">
                      Sub-Type
                    </label>
                    <input
                      type="text"
                      value={houseSubType}
                      onChange={(e) => setHouseSubType(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-2">
                      Bedrooms
                    </label>
                    <input
                      type="number"
                      value={bedrooms}
                      onChange={(e) => setBedrooms(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-2">
                      Bathrooms
                    </label>
                    <input
                      type="number"
                      value={bathrooms}
                      onChange={(e) => setBathrooms(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-2">
                      Year Built
                    </label>
                    <input
                      type="number"
                      value={yearBuilt}
                      onChange={(e) => setYearBuilt(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-2">
                      Built-Up Area (sqm)
                    </label>
                    <input
                      type="number"
                      value={builtAreaSqm}
                      onChange={(e) => setBuiltAreaSqm(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-2">
                      Compound Area (sqm)
                    </label>
                    <input
                      type="number"
                      value={compoundAreaSqm}
                      onChange={(e) => setCompoundAreaSqm(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
                    />
                  </div>
                </div>

                {/* Checkbox Amenities */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
                    <input
                      type="checkbox"
                      checked={isFurnished}
                      onChange={(e) => setIsFurnished(e.target.checked)}
                      className="rounded accent-emerald-500"
                    />
                    Fully Furnished
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
                    <input
                      type="checkbox"
                      checked={hasSwimmingPool}
                      onChange={(e) => setHasSwimmingPool(e.target.checked)}
                      className="rounded accent-emerald-500"
                    />
                    Private Swimming Pool
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
                    <input
                      type="checkbox"
                      checked={hasStaffQuarters}
                      onChange={(e) => setHasStaffQuarters(e.target.checked)}
                      className="rounded accent-emerald-500"
                    />
                    Staff Quarters
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
                    <input
                      type="checkbox"
                      checked={hasGarden}
                      onChange={(e) => setHasGarden(e.target.checked)}
                      className="rounded accent-emerald-500"
                    />
                    Landscaped Garden
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
                    <input
                      type="checkbox"
                      checked={hasBackupGenerator}
                      onChange={(e) => setHasBackupGenerator(e.target.checked)}
                      className="rounded accent-emerald-500"
                    />
                    Silent Backup Generator
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
                    <input
                      type="checkbox"
                      checked={hasSolarWaterHeater}
                      onChange={(e) => setHasSolarWaterHeater(e.target.checked)}
                      className="rounded accent-emerald-500"
                    />
                    Solar Water Heating
                  </label>
                </div>
              </div>
            )}

            {/* 3C: VEHICLE SPECS */}
            {category === 'vehicle' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-2">
                      Make
                    </label>
                    <input
                      type="text"
                      value={vehicleMake}
                      onChange={(e) => setVehicleMake(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-2">
                      Model
                    </label>
                    <input
                      type="text"
                      value={vehicleModel}
                      onChange={(e) => setVehicleModel(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-2">
                      Year
                    </label>
                    <input
                      type="number"
                      value={vehicleYear}
                      onChange={(e) => setVehicleYear(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-2">
                      Mileage (km)
                    </label>
                    <input
                      type="number"
                      value={vehicleMileage}
                      onChange={(e) => setVehicleMileage(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-2">
                      Transmission
                    </label>
                    <select
                      value={vehicleTransmission}
                      onChange={(e) => setVehicleTransmission(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
                    >
                      <option value="Automatic">Automatic</option>
                      <option value="Manual">Manual</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-2">
                      Fuel Engine
                    </label>
                    <input
                      type="text"
                      value={vehicleFuel}
                      onChange={(e) => setVehicleFuel(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-2">
                      Armored Protection
                    </label>
                    <input
                      type="text"
                      value={armoredRating}
                      onChange={(e) => setArmoredRating(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 3D: COMMERCIAL SPECS */}
            {category === 'commercial' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-2">
                      Total Floors
                    </label>
                    <input
                      type="number"
                      value={commercialFloors}
                      onChange={(e) => setCommercialFloors(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-2">
                      Gross Leasable Area (sqm)
                    </label>
                    <input
                      type="number"
                      value={commercialGrossArea}
                      onChange={(e) => setCommercialGrossArea(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-2">
                      Zoning Classification
                    </label>
                    <input
                      type="text"
                      value={commercialZoning}
                      onChange={(e) => setCommercialZoning(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
                    />
                  </div>
                </div>

                <div className="flex gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
                    <input
                      type="checkbox"
                      checked={hasElevator}
                      onChange={(e) => setHasElevator(e.target.checked)}
                      className="rounded accent-emerald-500"
                    />
                    High-Speed Passenger Elevators
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
                    <input
                      type="checkbox"
                      checked={hasLoadingBay}
                      onChange={(e) => setHasLoadingBay(e.target.checked)}
                      className="rounded accent-emerald-500"
                    />
                    Heavy Freight Loading Bay
                  </label>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ STAGE 4: FINANCIALS, ESCROW & STATUTORY COMPLIANCE Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */}
        {step === 4 && (
          <div className="space-y-6 oneui-enter">
            <div className="p-6 rounded-xl border border-white/[0.08] bg-white/[0.04] space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold block mb-1.5">
                    Asking Price (RWF) *
                  </label>
                  <input
                    type="number"
                    value={priceRWF}
                    onChange={(e) => setPriceRWF(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-base font-mono font-bold text-white outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
                    required
                  />
                  <span className="text-xs font-mono text-emerald-400 mt-1 block">
                    Ã¢â€°Ë† ${priceUSD.toLocaleString()} USD
                  </span>
                </div>

                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold block mb-1.5">
                    Earnest Escrow Deposit (%)
                  </label>
                  <input
                    type="number"
                    value={escrowPercent}
                    onChange={(e) => setEscrowPercent(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-base font-mono font-bold text-white outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
                  />
                  <span className="text-xs font-mono text-zinc-300 font-medium mt-1 block">
                    {Number(priceRWF) && Number(escrowPercent) ? `${((Number(priceRWF) * Number(escrowPercent)) / 100).toLocaleString()} RWF deposit` : '10% standard'}
                  </span>
                </div>
              </div>

              {purpose === 'rent' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/[0.08]">
                  <div>
                    <label className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold block mb-2">
                      Rental Frequency
                    </label>
                    <select
                      value={rentalFrequency}
                      onChange={(e) => setRentalFrequency(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-emerald-500/50"
                    >
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Annually">Annually</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold block mb-2">
                      Security Deposit (RWF)
                    </label>
                    <input
                      type="number"
                      value={securityDepositRWF}
                      onChange={(e) => setSecurityDepositRWF(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono outline-none focus:border-emerald-500/50"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Admin Statutory Certification Level */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold block mb-1.5">
                  Certification Tier
                </label>
                <select
                  value={verificationLevel}
                  onChange={(e) => setVerificationLevel(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
                >
                  <option value="verified">Verified Sovereign (Full Title & Cadastre)</option>
                  <option value="professional">Professional Partner Verified</option>
                  <option value="listed">Standard Catalog Listing</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold block mb-1.5">
                  Title Deed / Logbook (PDF or Image)
                </label>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => setTitleDeedFile(e.target.files?.[0] || null)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2 text-xs text-zinc-400 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#c5a880] file:text-black hover:file:bg-[#d4b993]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ STAGE 5: MEDIA & 3D SPATIAL TWINS Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */}
        {step === 5 && (
          <div className="space-y-6 oneui-enter">
            {/* Primary Cover Image */}
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold block mb-2">
                Primary Showcase Photo *
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <label className="flex-1 w-full flex flex-col items-center justify-center p-6 border border-dashed border-white/[0.15] hover:border-[#c5a880]/50 rounded-xl cursor-pointer bg-white/[0.04] transition-colors group">
                  <UploadCloud size={24} className="text-emerald-400 mb-1.5 group-hover:scale-105 transition-transform" />
                  <span className="text-xs font-semibold text-white">Upload Primary Photo</span>
                  <input type="file" accept="image/*" onChange={handleHeroUpload} className="hidden" />
                </label>
                {heroImagePreview && (
                  <div className="w-40 h-28 rounded-xl overflow-hidden border border-white/10 shrink-0 relative group">
                    <img src={heroImagePreview} alt="Hero Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setHeroImage(null);
                        setHeroImagePreview(null);
                      }}
                      className="absolute top-1 right-1 p-1 rounded-full bg-red-500/80 text-white hover:bg-red-600 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Gallery Multi-Upload */}
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold block mb-2">
                Gallery Photos ({galleryImages.length})
              </label>
              <label className="flex flex-col items-center justify-center p-5 border border-dashed border-white/10 hover:border-white/[0.2] rounded-xl cursor-pointer bg-white/[0.04] transition-colors mb-3">
                <Plus size={18} className="text-zinc-400 mb-1" />
                <span className="text-xs text-zinc-300 font-medium">Add Gallery Images</span>
                <input type="file" multiple accept="image/*" onChange={handleGalleryUpload} className="hidden" />
              </label>

              {galleryPreviews.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 max-h-48 overflow-y-auto pr-1">
                  {galleryPreviews.map((prev, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-white/[0.08] group">
                      <img src={prev} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(idx)}
                        className="absolute top-1 right-1 p-1 rounded bg-black/70 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Digital Twin & Video Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-2">
                  3D Spatial Twin / Matterport URL
                </label>
                <input
                  type="url"
                  value={digitalTwinUrl}
                  onChange={(e) => setDigitalTwinUrl(e.target.value)}
                  placeholder="https://my.matterport.com/show/?m=..."
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
                />
              </div>

              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-2">
                  Video Walkthrough URL
                </label>
                <input
                  type="url"
                  value={videoTourUrl}
                  onChange={(e) => setVideoTourUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
                />
              </div>
            </div>
          </div>
        )}

        {/* Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ ENCOURAGING STEP NAVIGATION ACTIONS Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */}
        <div className="pt-6 border-t border-white/[0.06] flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1 || isSubmitting}
            className={cn(
              'px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white flex items-center gap-2 oneui-press',
              step === 1 && 'opacity-0 pointer-events-none'
            )}
          >
            <ArrowLeft size={14} /> Previous Stage
          </Button>

          {step < 5 ? (
            <Button
              type="button"
              variant="primary"
              onClick={() => setStep((s) => s + 1)}
              className="bg-[#c5a880] hover:bg-[#d4b993] text-black font-semibold text-xs py-2.5 px-6 rounded-xl flex items-center gap-2 shadow-[0_0_15px_rgba(197,168,128,0.2)] oneui-press"
            >
              Continue to {steps[step].label} <ArrowRight size={14} />
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 px-8 rounded-xl flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] oneui-press disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={15} className="animate-spin" />
                  <span>Publishing to Master Ledger...</span>
                </>
              ) : (
                <>
                  <Check size={16} strokeWidth={2.5} />
                  <span>Certify & Publish Asset</span>
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPropertyWizard;


