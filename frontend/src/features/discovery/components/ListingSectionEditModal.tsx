import React, { useState } from 'react';
import {
  X,
  Save,
  CheckCircle2,
  Trash2,
  Plus,
  Home,
  FileText,
  Camera,
  Layers,
  Zap,
  MapPin,
  ShieldCheck,
  Building2,
  Car,
} from 'lucide-react';
import { api } from '../../../api/endpoints';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getMediaUrl, getMediaCaption } from './PhotoZoomLightbox';

export type EditableSectionKey =
  | 'header'
  | 'overview'
  | 'photos'
  | 'specs'
  | 'utilities'
  | 'spatial'
  | 'cadastre';

interface ListingSectionEditModalProps {
  isOpen: boolean;
  sectionKey: EditableSectionKey;
  listing: any;
  isAdmin: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ListingSectionEditModal: React.FC<ListingSectionEditModalProps> = ({
  isOpen,
  sectionKey,
  listing,
  isAdmin,
  onClose,
  onSuccess,
}) => {
  const queryClient = useQueryClient();

  const asset = listing?.asset || {};
  const resSpec = asset.residential_spec || {};
  const landSpec = asset.land_spec || {};
  const vehSpec = asset.vehicle_spec || {};
  const isHouse = listing?.category === 'house';
  const isLand = listing?.category === 'land';
  const isVehicle = listing?.category === 'car' || listing?.category === 'motorbike';

  // --- Form State initialized from listing ---
  // Header
  const [title, setTitle] = useState(listing?.title || '');
  const [price, setPrice] = useState(listing?.price || 0);
  const [currency, setCurrency] = useState(listing?.currency || 'RWF');
  const [purpose, setPurpose] = useState(listing?.purpose || 'sale');
  const [category, setCategory] = useState(listing?.category || 'house');
  const [status, setStatus] = useState(listing?.status || 'listed');
  const [rentalFrequency, setRentalFrequency] = useState(listing?.rental_frequency || 'per_month');
  const [address, setAddress] = useState(listing?.address || '');
  const [district, setDistrict] = useState(asset.district || 'Gasabo');
  const [sector, setSector] = useState(asset.sector || 'Nyarutarama');

  // Overview
  const [description, setDescription] = useState(listing?.description || '');

  // Media
  const [existingMedia, setExistingMedia] = useState<any[]>(listing?.media || []);
  const [deletedMediaIds, setDeletedMediaIds] = useState<number[]>([]);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoCaption, setNewPhotoCaption] = useState('');
  const [newPhotoCategory, setNewPhotoCategory] = useState('Exterior');
  const [stagedNewPhotos, setStagedNewPhotos] = useState<
    Array<{ url: string; caption: string; category: string }>
  >([]);

  // Residential Specs
  const [bedrooms, setBedrooms] = useState(resSpec.bedrooms || 3);
  const [bathrooms, setBathrooms] = useState(resSpec.bathrooms || 2);
  const [builtUpArea, setBuiltUpArea] = useState(resSpec.built_up_area_sqm || asset.total_area || 220);
  const [compoundSize, setCompoundSize] = useState(resSpec.compound_size_sqm || 450);
  const [yearBuilt, setYearBuilt] = useState(resSpec.year_built || 2023);
  const [isFurnished, setIsFurnished] = useState(Boolean(resSpec.is_furnished));
  const [hasSwimmingPool, setHasSwimmingPool] = useState(Boolean(resSpec.has_swimming_pool));
  const [hasGarden, setHasGarden] = useState(Boolean(resSpec.has_garden));
  const [balcony, setBalcony] = useState(Boolean(resSpec.balcony));
  const [apartmentSellingMode, setApartmentSellingMode] = useState(
    resSpec.apartment_selling_mode || 'per_unit'
  );
  const [totalBuildingFloors, setTotalBuildingFloors] = useState(
    resSpec.total_building_floors || 3
  );
  const [monthlyServiceCharge, setMonthlyServiceCharge] = useState(
    resSpec.monthly_service_charge || 0
  );
  const [unitOrientation, setUnitOrientation] = useState(
    resSpec.unit_orientation || 'City Skyline & Hills'
  );

  // Land Specs
  const [totalArea, setTotalArea] = useState(asset.total_area || 650);
  const [zoningCode, setZoningCode] = useState(landSpec.zoning_code || 'R1');
  const [maxPermittedFloors, setMaxPermittedFloors] = useState(
    landSpec.max_permitted_floors || 'G+2 Floors'
  );
  const [slopeGradient, setSlopeGradient] = useState(landSpec.slope_gradient_percent || 4);
  const [terrain, setTerrain] = useState(landSpec.terrain || 'Gentle Slope');
  const [floorAreaRatio, setFloorAreaRatio] = useState(landSpec.floor_area_ratio || 1.5);
  const [buildingCoverageRatio, setBuildingCoverageRatio] = useState(
    landSpec.building_coverage_ratio || 50
  );
  const [tenureType, setTenureType] = useState(landSpec.tenure_type || 'Emphyteutic Lease (49y)');

  // Vehicle Specs
  const [make, setMake] = useState(vehSpec.make || 'Toyota');
  const [model, setModel] = useState(vehSpec.model || 'Land Cruiser Prado');
  const [vehYear, setVehYear] = useState(vehSpec.year || 2022);
  const [mileage, setMileage] = useState(vehSpec.mileage || 32000);
  const [transmission, setTransmission] = useState(vehSpec.transmission || 'Automatic');
  const [fuelType, setFuelType] = useState(vehSpec.fuel_type || 'Diesel');
  const [plateNumber, setPlateNumber] = useState(vehSpec.plate_number || 'RAD 780 K');

  // Utilities & Resilience
  const [waterTankCapacity, setWaterTankCapacity] = useState(
    resSpec.water_tank_capacity_liters || 5000
  );
  const [hasBackupGenerator, setHasBackupGenerator] = useState(
    Boolean(resSpec.has_backup_generator)
  );
  const [generatorKva, setGeneratorKva] = useState(resSpec.backup_generator_kva || 15);
  const [roadAccessType, setRoadAccessType] = useState(
    resSpec.road_access_type || 'Paved Tarmac Arterial'
  );
  const [hasFiberInternet, setHasFiberInternet] = useState(
    Boolean(resSpec.has_fiber_internet)
  );
  const [hasThreePhasePower, setHasThreePhasePower] = useState(
    Boolean(resSpec.has_three_phase_power)
  );

  // Spatial & Cadastre
  const [latitude, setLatitude] = useState(asset.latitude ? String(asset.latitude) : '-1.9441');
  const [longitude, setLongitude] = useState(asset.longitude ? String(asset.longitude) : '30.0619');
  const [upiNumber, setUpiNumber] = useState(landSpec.upi_number || '1/02/11/04/1820');
  const [verificationLevel, setVerificationLevel] = useState(
    listing?.verification_level || 'pending'
  );

  const updateMutation = useMutation({
    mutationFn: async (payload: any) => {
      return api.seller.updateListing(listing.id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listing-detail', String(listing.id)] });
      queryClient.invalidateQueries({ queryKey: ['seller-database-listings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-listings'] });
      onSuccess?.();
      onClose();
    },
  });

  if (!isOpen) return null;

  const handleAddStagedPhoto = () => {
    if (!newPhotoUrl.trim()) return;
    setStagedNewPhotos((prev) => [
      ...prev,
      {
        url: newPhotoUrl.trim(),
        caption: newPhotoCaption.trim() || 'Property View',
        category: newPhotoCategory,
      },
    ]);
    setNewPhotoUrl('');
    setNewPhotoCaption('');
  };

  const handleRemoveExistingPhoto = (id: number) => {
    setExistingMedia((prev) => prev.filter((m) => m.id !== id));
    setDeletedMediaIds((prev) => [...prev, id]);
  };

  const handleRemoveStagedPhoto = (index: number) => {
    setStagedNewPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: any = {};

    if (sectionKey === 'header') {
      payload.title = title;
      payload.price = Number(price);
      payload.currency = currency;
      payload.purpose = purpose;
      payload.category = category;
      payload.status = status;
      payload.rental_frequency = rentalFrequency;
      payload.address = address;
      payload.district = district;
      payload.sector = sector;
      if (isAdmin) {
        payload.verification_level = verificationLevel;
      }
    } else if (sectionKey === 'overview') {
      payload.description = description;
    } else if (sectionKey === 'photos') {
      if (stagedNewPhotos.length > 0) {
        payload.add_media = stagedNewPhotos;
      }
      if (deletedMediaIds.length > 0) {
        // We delete one by one or send array
        deletedMediaIds.forEach((id) => {
          payload.delete_media_id = id;
        });
      }
    } else if (sectionKey === 'specs') {
      if (isHouse) {
        payload.bedrooms = Number(bedrooms);
        payload.bathrooms = Number(bathrooms);
        payload.built_up_area_sqm = Number(builtUpArea);
        payload.compound_size_sqm = Number(compoundSize);
        payload.year_built = Number(yearBuilt);
        payload.is_furnished = isFurnished;
        payload.has_swimming_pool = hasSwimmingPool;
        payload.has_garden = hasGarden;
        payload.balcony = balcony;
        payload.apartment_selling_mode = apartmentSellingMode;
        payload.total_building_floors = Number(totalBuildingFloors);
        payload.monthly_service_charge = Number(monthlyServiceCharge);
        payload.unit_orientation = unitOrientation;
      } else if (isLand) {
        payload.total_area = Number(totalArea);
        payload.zoning_code = zoningCode;
        payload.max_permitted_floors = maxPermittedFloors;
        payload.slope_gradient_percent = Number(slopeGradient);
        payload.terrain = terrain;
        payload.floor_area_ratio = Number(floorAreaRatio);
        payload.building_coverage_ratio = Number(buildingCoverageRatio);
        payload.tenure_type = tenureType;
      } else if (isVehicle) {
        payload.make = make;
        payload.model = model;
        payload.year = Number(vehYear);
        payload.mileage = Number(mileage);
        payload.transmission = transmission;
        payload.fuel_type = fuelType;
        payload.plate_number = plateNumber;
      }
    } else if (sectionKey === 'utilities') {
      payload.water_tank_capacity_liters = Number(waterTankCapacity);
      payload.has_backup_generator = hasBackupGenerator;
      payload.backup_generator_kva = Number(generatorKva);
      payload.road_access_type = roadAccessType;
      payload.has_fiber_internet = hasFiberInternet;
      payload.has_three_phase_power = hasThreePhasePower;
    } else if (sectionKey === 'spatial') {
      payload.latitude = parseFloat(latitude);
      payload.longitude = parseFloat(longitude);
      payload.district = district;
      payload.sector = sector;
    } else if (sectionKey === 'cadastre') {
      payload.upi_number = upiNumber;
      if (isAdmin) {
        payload.verification_level = verificationLevel;
      }
    }

    updateMutation.mutate(payload);
  };

  // Section titles & icons
  const sectionMeta: Record<EditableSectionKey, { title: string; subtitle: string; icon: any }> = {
    header: {
      title: 'Header, Pricing & General Details',
      subtitle: 'Modify title, price, currency, purpose, status, and municipal address',
      icon: Home,
    },
    overview: {
      title: 'Property Overview & Story',
      subtitle: 'Edit public narrative description and architectural highlights',
      icon: FileText,
    },
    photos: {
      title: 'Property Photos & Media Gallery',
      subtitle: 'Add high-res photos by URL, manage captions, or remove images',
      icon: Camera,
    },
    specs: {
      title: 'Architectural & Physical Specifications',
      subtitle: 'Adjust room dimensions, plot areas, building floors, and finishes',
      icon: Layers,
    },
    utilities: {
      title: 'Utilities Resilience & Infrastructure',
      subtitle: 'Update water storage tanks, backup power, security, and fiber',
      icon: Zap,
    },
    spatial: {
      title: 'Spatial Coordinates & OpenStreetMap Geolocation',
      subtitle: 'Pinpoint precise GPS latitude and longitude coordinates',
      icon: MapPin,
    },
    cadastre: {
      title: 'RLMUA Cadastre & Sovereign Trust Evidence',
      subtitle: 'Update national Land UPI number and verification level',
      icon: ShieldCheck,
    },
  };

  const currentMeta = sectionMeta[sectionKey] || sectionMeta.header;
  const SectionIcon = currentMeta.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0b101b] p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <SectionIcon size={20} />
            </div>
            <div>
              <span className="font-mono text-emerald-400 font-bold text-xs uppercase tracking-wider block">
                Listing Section Editor
              </span>
              <h3 className="text-xl font-bold text-white mt-0.5">{currentMeta.title}</h3>
              <p className="text-xs text-zinc-400">{currentMeta.subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white bg-white/[0.04] hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* SECTION: HEADER & GENERAL */}
          {sectionKey === 'header' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Property Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Price ({currency})
                  </label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500"
                  >
                    <option value="RWF">RWF (Rwandan Franc)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Purpose
                  </label>
                  <select
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500"
                  >
                    <option value="sale">For Sale</option>
                    <option value="rent">For Rent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500"
                  >
                    <option value="listed">Active / Listed</option>
                    <option value="under_negotiation">Under Offer</option>
                    <option value="sold">Sold / Completed</option>
                    <option value="withdrawn">Draft / Withdrawn</option>
                  </select>
                </div>

                {purpose === 'rent' && (
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                      Rental Cycle
                    </label>
                    <select
                      value={rentalFrequency}
                      onChange={(e) => setRentalFrequency(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500"
                    >
                      <option value="per_month">Per Month</option>
                      <option value="per_year">Per Year</option>
                      <option value="per_day">Per Day</option>
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Physical Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. KG 9 Ave, Nyarutarama, Kigali"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                    District
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Sector
                  </label>
                  <input
                    type="text"
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {isAdmin && (
                <div>
                  <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1.5">
                    Verification Level (Admin Authority)
                  </label>
                  <select
                    value={verificationLevel}
                    onChange={(e) => setVerificationLevel(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-emerald-500/30 text-white text-sm focus:outline-none focus:border-emerald-500"
                  >
                    <option value="verified">Verified Sovereign Trust</option>
                    <option value="pending">Pending Document Audit</option>
                    <option value="rejected">Rejected</option>
                    <option value="none">Not Submitted</option>
                  </select>
                </div>
              )}
            </div>
          )}

          {/* SECTION: OVERVIEW */}
          {sectionKey === 'overview' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Property Overview & Narrative
                </label>
                <textarea
                  rows={8}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail the architectural design, security, finishes, compound layout, and location highlights..."
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500 resize-none leading-relaxed"
                />
                <p className="text-xs text-zinc-500 mt-1">
                  Supports multi-paragraph text. This will appear under Property Overview & Intelligence.
                </p>
              </div>
            </div>
          )}

          {/* SECTION: PHOTOS & MEDIA */}
          {sectionKey === 'photos' && (
            <div className="space-y-5">
              {/* Existing Photos */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                  Existing Photos ({existingMedia.length})
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-56 overflow-y-auto pr-1">
                  {existingMedia.map((m: any, idx: number) => {
                    const url = getMediaUrl(m);
                    const caption = getMediaCaption(m);
                    return (
                      <div
                        key={m.id || idx}
                        className="relative group rounded-xl overflow-hidden border border-white/10 aspect-[4/3]"
                      >
                        <img src={url} alt={caption} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                          <span className="text-[10px] text-white truncate">{caption || `Photo ${idx + 1}`}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveExistingPhoto(m.id)}
                            className="self-end p-1.5 rounded-lg bg-red-500/80 hover:bg-red-600 text-white text-xs cursor-pointer"
                            title="Remove Photo"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Staged New Photos */}
              {stagedNewPhotos.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
                    New Photos to Upload ({stagedNewPhotos.length})
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {stagedNewPhotos.map((photo, idx) => (
                      <div
                        key={idx}
                        className="relative group rounded-xl overflow-hidden border border-emerald-500/30 aspect-[4/3]"
                      >
                        <img src={photo.url} alt={photo.caption} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                          <span className="text-[10px] text-white truncate">{photo.caption}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveStagedPhoto(idx)}
                            className="self-end p-1.5 rounded-lg bg-red-500/80 hover:bg-red-600 text-white text-xs cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add New Photo Form */}
              <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] space-y-3">
                <span className="text-xs font-bold text-white block">Add New High-Res Photo</span>
                <div>
                  <input
                    type="url"
                    value={newPhotoUrl}
                    onChange={(e) => setNewPhotoUrl(e.target.value)}
                    placeholder="Paste image URL (https://...)"
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={newPhotoCaption}
                    onChange={(e) => setNewPhotoCaption(e.target.value)}
                    placeholder="Caption (e.g. Master Bedroom)"
                    className="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                  <select
                    value={newPhotoCategory}
                    onChange={(e) => setNewPhotoCategory(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Exterior">Exterior</option>
                    <option value="Interior">Interior</option>
                    <option value="Living Room">Living Room</option>
                    <option value="Master Bedroom">Master Bedroom</option>
                    <option value="Kitchen">Kitchen</option>
                    <option value="Bathroom">Bathroom</option>
                    <option value="Compound">Compound</option>
                    <option value="Aerial">Aerial</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={handleAddStagedPhoto}
                  disabled={!newPhotoUrl.trim()}
                  className="w-full py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40"
                >
                  <Plus size={14} /> Stage Photo for Upload
                </button>
              </div>
            </div>
          )}

          {/* SECTION: SPECS */}
          {sectionKey === 'specs' && (
            <div className="space-y-4">
              {isHouse && (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                        Bedrooms
                      </label>
                      <input
                        type="number"
                        value={bedrooms}
                        onChange={(e) => setBedrooms(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                        Bathrooms
                      </label>
                      <input
                        type="number"
                        value={bathrooms}
                        onChange={(e) => setBathrooms(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                        Built Area (m²)
                      </label>
                      <input
                        type="number"
                        value={builtUpArea}
                        onChange={(e) => setBuiltUpArea(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                        Plot Size (m²)
                      </label>
                      <input
                        type="number"
                        value={compoundSize}
                        onChange={(e) => setCompoundSize(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                        Year Built
                      </label>
                      <input
                        type="number"
                        value={yearBuilt}
                        onChange={(e) => setYearBuilt(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                        Apartment Selling Mode
                      </label>
                      <select
                        value={apartmentSellingMode}
                        onChange={(e) => setApartmentSellingMode(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm"
                      >
                        <option value="per_unit">Per Unit</option>
                        <option value="per_floor">Per Floor</option>
                        <option value="whole_building">Entire Building</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 pt-2">
                    <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isFurnished}
                        onChange={(e) => setIsFurnished(e.target.checked)}
                        className="rounded border-white/20 text-emerald-500 focus:ring-0"
                      />
                      Furnished
                    </label>
                    <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasSwimmingPool}
                        onChange={(e) => setHasSwimmingPool(e.target.checked)}
                        className="rounded border-white/20 text-emerald-500 focus:ring-0"
                      />
                      Swimming Pool
                    </label>
                    <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasGarden}
                        onChange={(e) => setHasGarden(e.target.checked)}
                        className="rounded border-white/20 text-emerald-500 focus:ring-0"
                      />
                      Landscaped Garden
                    </label>
                    <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={balcony}
                        onChange={(e) => setBalcony(e.target.checked)}
                        className="rounded border-white/20 text-emerald-500 focus:ring-0"
                      />
                      Balcony / Terrace
                    </label>
                  </div>
                </>
              )}

              {isLand && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                        Cadastral Area (m²)
                      </label>
                      <input
                        type="number"
                        value={totalArea}
                        onChange={(e) => setTotalArea(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                        Master Plan Zoning Code
                      </label>
                      <input
                        type="text"
                        value={zoningCode}
                        onChange={(e) => setZoningCode(e.target.value)}
                        placeholder="e.g. R1, R2, C1"
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                        Permitted Height
                      </label>
                      <input
                        type="text"
                        value={maxPermittedFloors}
                        onChange={(e) => setMaxPermittedFloors(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                        Terrain / Topography
                      </label>
                      <input
                        type="text"
                        value={terrain}
                        onChange={(e) => setTerrain(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {isVehicle && (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                        Make
                      </label>
                      <input
                        type="text"
                        value={make}
                        onChange={(e) => setMake(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                        Model
                      </label>
                      <input
                        type="text"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                        Year
                      </label>
                      <input
                        type="number"
                        value={vehYear}
                        onChange={(e) => setVehYear(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                        Mileage (km)
                      </label>
                      <input
                        type="number"
                        value={mileage}
                        onChange={(e) => setMileage(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                        Plate Number
                      </label>
                      <input
                        type="text"
                        value={plateNumber}
                        onChange={(e) => setPlateNumber(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SECTION: UTILITIES */}
          {sectionKey === 'utilities' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Water Tank Capacity (Liters)
                  </label>
                  <input
                    type="number"
                    value={waterTankCapacity}
                    onChange={(e) => setWaterTankCapacity(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Road Access Type
                  </label>
                  <input
                    type="text"
                    value={roadAccessType}
                    onChange={(e) => setRoadAccessType(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Backup Generator Capacity (kVA)
                  </label>
                  <input
                    type="number"
                    value={generatorKva}
                    onChange={(e) => setGeneratorKva(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm"
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasBackupGenerator}
                      onChange={(e) => setHasBackupGenerator(e.target.checked)}
                      className="rounded border-white/20 text-emerald-500 focus:ring-0"
                    />
                    Generator Installed
                  </label>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasFiberInternet}
                    onChange={(e) => setHasFiberInternet(e.target.checked)}
                    className="rounded border-white/20 text-emerald-500 focus:ring-0"
                  />
                  Optical Fiber Ready
                </label>
                <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasThreePhasePower}
                    onChange={(e) => setHasThreePhasePower(e.target.checked)}
                    className="rounded border-white/20 text-emerald-500 focus:ring-0"
                  />
                  3-Phase Power
                </label>
              </div>
            </div>
          )}

          {/* SECTION: SPATIAL COORDINATES */}
          {sectionKey === 'spatial' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Latitude
                  </label>
                  <input
                    type="text"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="-1.9441"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Longitude
                  </label>
                  <input
                    type="text"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="30.0619"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white font-mono text-sm"
                  />
                </div>
              </div>
              <p className="text-xs text-zinc-500">
                Updating coordinates will dynamically relocate the OpenStreetMap interactive marker on the live showroom page.
              </p>
            </div>
          )}

          {/* SECTION: CADASTRE & TRUST */}
          {sectionKey === 'cadastre' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Rwandan Land UPI Number
                </label>
                <input
                  type="text"
                  value={upiNumber}
                  onChange={(e) => setUpiNumber(e.target.value)}
                  placeholder="e.g. 1/02/11/04/1820"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white font-mono text-sm"
                />
              </div>

              {isAdmin && (
                <div>
                  <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1.5">
                    Trust Evidence Status (Admin Authority)
                  </label>
                  <select
                    value={verificationLevel}
                    onChange={(e) => setVerificationLevel(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-emerald-500/30 text-white text-sm"
                  >
                    <option value="verified">Verified (RLMUA Audited & Registered)</option>
                    <option value="pending">Pending Audit</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Submit Actions */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-zinc-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Save size={14} />
              <span>{updateMutation.isPending ? 'Saving Section...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
