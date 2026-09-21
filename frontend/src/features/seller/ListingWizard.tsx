import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '../../api/endpoints';
import apiClient from '../../api/client';

interface ListingFormData {
    title: string;
    category: 'house' | 'land' | 'car' | 'motorbike' | 'hotel';
    purpose: 'sale' | 'rent';
    rentalFrequency: 'per_day' | 'per_month' | 'per_year';
    securityDeposit: string;
    description: string;
    price: string;
    isNegotiable: boolean;
    address: string;
    city: string;
    district: string;
    sector: string;

    // House / Residential Specs
    houseSubType: string;
    sizeSqm: string;
    compoundSizeSqm: string;
    bedrooms: string;
    bathrooms: string;
    yearBuilt: string;
    isFurnished: boolean;
    hasSwimmingPool: boolean;
    hasStaffQuarters: boolean;
    hasGarden: boolean;
    hasWaterTank: boolean;
    hasSolarWaterHeater: boolean;
    hasBackupGenerator: boolean;
    securityType: string;
    electricityMeter: string;
    roadAccessType: string;

    // Land Specs
    upiNumber: string;
    zoningCode: string;
    terrain: string;
    roadType: string;
    waterOnsite: boolean;
    electricityOnsite: boolean;
    drainageSystem: string;

    // Vehicle Specs (Car & Motorbike)
    vehicleType: 'Car' | 'Motorcycle';
    make: string;
    model: string;
    year: string;
    mileage: string;
    fuelType: string;
    transmission: string;
    engineCapacity: string;
    condition: string;
    bodyType: string;
    seatingCapacity: string;
    plateType: string;
    includesDriver: boolean;
    includesHelmet: boolean;
    hasDeliveryRack: boolean;

    // Media & 3D
    mainImage: File | null;
    gallery: File[];
    panorama360: File | null;
    model3d: File | null;
    videoUrl: string;
    verificationDocs: {
        name: string;
        file: File;
    }[];
}

interface ValuationResult {
    fmv_average: number;
    fmv_min: number;
    fmv_max: number;
    comparables_count: number;
    price_per_sqm_avg: number;
    currency: string;
    message: string;
}

const INITIAL_STATE: ListingFormData = {
    title: '',
    category: 'house',
    purpose: 'sale',
    rentalFrequency: 'per_month',
    securityDeposit: '',
    description: '',
    price: '',
    isNegotiable: false,
    address: '',
    city: 'Kigali',
    district: '',
    sector: '',

    // House
    houseSubType: 'SingleFamily',
    sizeSqm: '',
    compoundSizeSqm: '',
    bedrooms: '',
    bathrooms: '',
    yearBuilt: '',
    isFurnished: false,
    hasSwimmingPool: false,
    hasStaffQuarters: false,
    hasGarden: false,
    hasWaterTank: false,
    hasSolarWaterHeater: false,
    hasBackupGenerator: false,
    securityType: 'Perimeter Wall',
    electricityMeter: 'Cash Power Dedicated',
    roadAccessType: 'Tarmac',

    // Land
    upiNumber: '',
    zoningCode: 'R1',
    terrain: 'Flat',
    roadType: 'Tarmac',
    waterOnsite: true,
    electricityOnsite: true,
    drainageSystem: 'Covered',

    // Vehicle
    vehicleType: 'Car',
    make: '',
    model: '',
    year: '2020',
    mileage: '',
    fuelType: 'Petrol',
    transmission: 'Automatic',
    engineCapacity: '',
    condition: 'Used Foreign (Import)',
    bodyType: 'SUV',
    seatingCapacity: '5',
    plateType: 'Private (RAx)',
    includesDriver: false,
    includesHelmet: false,
    hasDeliveryRack: false,

    // Media
    mainImage: null,
    gallery: [],
    panorama360: null,
    model3d: null,
    videoUrl: '',
    verificationDocs: [],
};

const ListingWizard: React.FC = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<ListingFormData>(INITIAL_STATE);
    const [isGeneratingAi, setIsGeneratingAi] = useState(false);
    const [valuation, setValuation] = useState<ValuationResult | null>(null);
    const [isValuating, setIsValuating] = useState(false);

    const updateField = (field: keyof ListingFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleNext = () => setStep(s => s + 1);
    const handlePrev = () => setStep(s => s - 1);

    const generateAiDescription = async () => {
        setIsGeneratingAi(true);
        try {
            const response = await api.seller.generateNarrative({
                title: formData.title,
                category: formData.category,
                purpose: formData.purpose,
                city: formData.city,
                price: formData.price,
            });
            const narrative = response.data.narrative;
            updateField('description', narrative);
        } catch (error) {
            console.error('AI Narrative generation failed:', error);
            alert('Failed to generate AI narrative. Please try again.');
        } finally {
            setIsGeneratingAi(false);
        }
    };

    const fetchValuation = async () => {
        setIsValuating(true);
        try {
            const response = await api.listings.estimateValuation({
                property_type: formData.category,
                city: formData.city,
                district: formData.district,
                sector: formData.sector,
                size: formData.sizeSqm || '100',
            });
            setValuation(response.data);
        } catch (error: any) {
            console.error('Valuation failed:', error);
            alert(error.response?.data?.message || 'Could not retrieve valuation estimate.');
            setValuation(null);
        } finally {
            setIsValuating(false);
        }
    };

    const submitMutation = useMutation({
        mutationFn: async (data: ListingFormData) => {
            const formDataInstance = new FormData();

            Object.entries(data).forEach(([key, value]) => {
                if (key === 'gallery') {
                    value.forEach((file: File, index: number) => formDataInstance.append(`gallery_${index}`, file));
                } else if (key === 'verificationDocs') {
                    value.forEach((doc: any, index: number) => {
                        formDataInstance.append(`doc_name_${index}`, doc.name);
                        formDataInstance.append(`doc_file_${index}`, doc.file);
                    });
                } else if (value instanceof File) {
                    formDataInstance.append(key, value);
                } else if (value !== null && value !== undefined) {
                    formDataInstance.append(key, String(value));
                }
            });

            return apiClient.post('/seller/listings/create/', formDataInstance, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        },
        onSuccess: () => {
            alert('Listing published successfully! It is now live in the marketplace.');
            window.location.href = '/discovery';
        },
        onError: (error: any) => {
            alert(`Submission failed: ${error.response?.data?.detail || error.message || 'Unknown error'}`);
        }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        submitMutation.mutate(formData);
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <span className="text-green-500">01.</span> Asset & Transaction Details
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Asset Category</label>
                                <select
                                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-2xl text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                    value={formData.category}
                                    onChange={(e) => {
                                        const cat = e.target.value as any;
                                        updateField('category', cat);
                                        if (cat === 'car') updateField('vehicleType', 'Car');
                                        if (cat === 'motorbike') updateField('vehicleType', 'Motorcycle');
                                    }}
                                >
                                    <option value="house">🏡 House / Apartment / Villa</option>
                                    <option value="land">🗺️ Land / Plot (with UPI)</option>
                                    <option value="car">🚗 Car</option>
                                    <option value="motorbike">🏍️ Motorbike</option>
                                    <option value="hotel">🏢 Commercial & Hotel</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Transaction Purpose</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => updateField('purpose', 'sale')}
                                        className={`py-3 px-4 rounded-2xl font-bold text-sm border transition-all ${
                                            formData.purpose === 'sale'
                                                ? 'bg-green-600 border-green-500 text-white shadow-lg shadow-green-900/40'
                                                : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'
                                        }`}
                                    >
                                        🏷️ For Sale
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => updateField('purpose', 'rent')}
                                        className={`py-3 px-4 rounded-2xl font-bold text-sm border transition-all ${
                                            formData.purpose === 'rent'
                                                ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-900/40'
                                                : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'
                                        }`}
                                    >
                                        🔑 For Rent
                                    </button>
                                </div>
                            </div>
                        </div>

                        {formData.purpose === 'rent' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-zinc-800/40 border border-zinc-700/60 rounded-2xl">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Rental Frequency</label>
                                    <select
                                        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-2xl text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                        value={formData.rentalFrequency}
                                        onChange={(e) => updateField('rentalFrequency', e.target.value)}
                                    >
                                        <option value="per_day">Per Day (Daily Rate)</option>
                                        <option value="per_month">Per Month</option>
                                        <option value="per_year">Per Year (Annual Lease)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Security Deposit (RWF)</label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-2xl text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                        placeholder="Optional caution fee"
                                        value={formData.securityDeposit}
                                        onChange={(e) => updateField('securityDeposit', e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Listing Title</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-2xl text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                placeholder={
                                    formData.category === 'car'
                                        ? 'e.g. 2021 Toyota RAV4 AWD Luxury'
                                        : formData.category === 'motorbike'
                                        ? 'e.g. 2022 TVS HLX 125cc Delivery Ready'
                                        : formData.category === 'land'
                                        ? 'e.g. 450 sqm Prime Plot in Gahanga'
                                        : 'e.g. Modern 4-Bedroom Villa with Pool in Nyarutarama'
                                }
                                value={formData.title}
                                onChange={(e) => updateField('title', e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Description</label>
                                <button
                                    type="button"
                                    onClick={generateAiDescription}
                                    disabled={isGeneratingAi}
                                    className="text-[11px] font-bold text-green-400 hover:text-green-300 flex items-center gap-1 transition-all disabled:opacity-50"
                                >
                                    {isGeneratingAi ? '✨ Generating...' : '✨ Generate AI Luxury Narrative'}
                                </button>
                            </div>
                            <textarea
                                rows={4}
                                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-2xl text-white focus:ring-2 focus:ring-green-500 outline-none transition-all resize-none"
                                placeholder="Describe key attributes, condition, location advantages..."
                                value={formData.description}
                                onChange={(e) => updateField('description', e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2 relative">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Price (RWF)</label>
                                    <button
                                        type="button"
                                        onClick={fetchValuation}
                                        disabled={isValuating || !formData.city}
                                        className="text-[10px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-all disabled:opacity-50"
                                    >
                                        {isValuating ? '⌛ Calculating...' : '📊 Suggest Market Price'}
                                    </button>
                                </div>
                                <input
                                    type="number"
                                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-2xl text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                    placeholder="0.00"
                                    value={formData.price}
                                    onChange={(e) => updateField('price', e.target.value)}
                                />
                                {valuation && (
                                    <div className="absolute top-full left-0 right-0 z-20 mt-2 p-4 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Suggested Valuation</p>
                                                <p className="text-lg font-bold text-white">
                                                    {valuation.fmv_min.toLocaleString()} - {valuation.fmv_max.toLocaleString()} {valuation.currency}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    updateField('price', valuation.fmv_average.toString());
                                                    setValuation(null);
                                                }}
                                                className="px-3 py-1 bg-green-600 text-white text-[10px] font-bold rounded-lg hover:bg-green-500"
                                            >
                                                Apply
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center pt-8">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={formData.isNegotiable}
                                        onChange={(e) => updateField('isNegotiable', e.target.checked)}
                                    />
                                    <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                    <span className="ml-3 text-sm font-medium text-zinc-300">Price Negotiable</span>
                                </label>
                            </div>
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <span className="text-green-500">02.</span> Location & Address Intelligence
                        </h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Address / Street / Landmark</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-2xl text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                    placeholder="e.g. KG 123 St, near Green Hills Academy"
                                    value={formData.address}
                                    onChange={(e) => updateField('address', e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Province / City</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-2xl text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                        placeholder="Kigali"
                                        value={formData.city}
                                        onChange={(e) => updateField('city', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">District</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-2xl text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                        placeholder="Gasabo / Kicukiro / Nyarugenge"
                                        value={formData.district}
                                        onChange={(e) => updateField('district', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Sector</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-2xl text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                        placeholder="Nyarutarama / Kimihurura / Gahanga"
                                        value={formData.sector}
                                        onChange={(e) => updateField('sector', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <span className="text-green-500">03.</span> Technical Specifications
                        </h3>

                        {/* CASE A: VEHICLE (CAR OR MOTORBIKE) */}
                        {(formData.category === 'car' || formData.category === 'motorbike') && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Make / Brand</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-2xl text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                            placeholder={formData.category === 'car' ? 'Toyota / BMW / Mercedes' : 'TVS / Boxer / Yamaha'}
                                            value={formData.make}
                                            onChange={(e) => updateField('make', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Model</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-2xl text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                            placeholder={formData.category === 'car' ? 'RAV4 / Land Cruiser / Corolla' : 'HLX 125 / Apache'}
                                            value={formData.model}
                                            onChange={(e) => updateField('model', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Manufacturing Year</label>
                                        <input
                                            type="number"
                                            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-2xl text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                            placeholder="2021"
                                            value={formData.year}
                                            onChange={(e) => updateField('year', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Mileage (km)</label>
                                        <input
                                            type="number"
                                            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-2xl text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                            placeholder="45000"
                                            value={formData.mileage}
                                            onChange={(e) => updateField('mileage', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Engine Capacity (CC)</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-2xl text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                            placeholder={formData.category === 'car' ? '2000cc' : '125cc'}
                                            value={formData.engineCapacity}
                                            onChange={(e) => updateField('engineCapacity', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Transmission</label>
                                        <select
                                            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-2xl text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                            value={formData.transmission}
                                            onChange={(e) => updateField('transmission', e.target.value)}
                                        >
                                            <option value="Automatic">Automatic</option>
                                            <option value="Manual">Manual</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Fuel Type</label>
                                        <select
                                            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-2xl text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                            value={formData.fuelType}
                                            onChange={(e) => updateField('fuelType', e.target.value)}
                                        >
                                            <option value="Petrol">Petrol</option>
                                            <option value="Diesel">Diesel</option>
                                            <option value="Hybrid">Hybrid</option>
                                            <option value="Electric">Electric</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Condition</label>
                                        <select
                                            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-2xl text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                            value={formData.condition}
                                            onChange={(e) => updateField('condition', e.target.value)}
                                        >
                                            <option value="Brand New">Brand New</option>
                                            <option value="Used Foreign (Import)">Used Foreign (Import / Clean)</option>
                                            <option value="Used Local (Rwanda)">Used Local (Rwanda)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Plate Registration</label>
                                        <select
                                            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-2xl text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                            value={formData.plateType}
                                            onChange={(e) => updateField('plateType', e.target.value)}
                                        >
                                            <option value="Private (RAx)">Private Plate (RAx...)</option>
                                            <option value="Commercial Taxi (Yellow)">Commercial Taxi (Yellow Plate)</option>
                                            <option value="Duty Free / Temporary">Duty Free / Temporary</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Seating Capacity</label>
                                        <input
                                            type="number"
                                            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-2xl text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                            value={formData.seatingCapacity}
                                            onChange={(e) => updateField('seatingCapacity', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="p-4 bg-zinc-800/40 border border-zinc-700/60 rounded-2xl flex flex-wrap gap-6">
                                    <label className="flex items-center gap-2 cursor-pointer text-sm text-zinc-300">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 accent-green-500"
                                            checked={formData.includesDriver}
                                            onChange={(e) => updateField('includesDriver', e.target.checked)}
                                        />
                                        Includes Professional Driver (Rentals)
                                    </label>
                                    {formData.category === 'motorbike' && (
                                        <>
                                            <label className="flex items-center gap-2 cursor-pointer text-sm text-zinc-300">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 accent-green-500"
                                                    checked={formData.includesHelmet}
                                                    onChange={(e) => updateField('includesHelmet', e.target.checked)}
                                                />
                                                Includes Helmet(s)
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer text-sm text-zinc-300">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 accent-green-500"
                                                    checked={formData.hasDeliveryRack}
                                                    onChange={(e) => updateField('hasDeliveryRack', e.target.checked)}
                                                />
                                                Equipped with Delivery Box / Rack
                                            </label>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* CASE B: LAND SPECIFICATIONS */}
                        {formData.category === 'land' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">UPI Number (Rwanda Cadastre)</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-2xl text-white focus:ring-2 focus:ring-green-500 outline-none transition-all font-mono"
                                            placeholder="1/03/05/02/1234"
                                            value={formData.upiNumber}
                                            onChange={(e) => updateField('upiNumber', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Plot Size (sqm)</label>
                                        <input
                                            type="number"
                                            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-2xl text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                            placeholder="e.g. 500"
                                            value={formData.sizeSqm}
                                            onChange={(e) => updateField('sizeSqm', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Zoning Code (Master Plan)</label>
                                        <select
                                            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-2xl text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                            value={formData.zoningCode}
                                            onChange={(e) => updateField('zoningCode', e.target.value)}
                                        >
                                            <option value="R1">R1 - Low Density Residential</option>
                                            <option value="R2">R2 - Medium Density Residential</option>
                                            <option value="R3">R3 - High Density Apartments</option>
                                            <option value="C1">C1 - Commercial Mixed Use</option>
                                            <option value="Agricultural">Agricultural</option>
                                            <option value="Industrial">Light Industrial</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Terrain Topography</label>
                                        <select
                                            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-2xl text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                            value={formData.terrain}
                                            onChange={(e) => updateField('terrain', e.target.value)}
                                        >
                                            <option value="Flat">Flat Plot</option>
                                            <option value="Gentle Slope">Gentle Slope (Good Drainage)</option>
                                            <option value="Hilly">Hilly / Viewpoint</option>
                                            <option value="Rocky">Rocky Ground</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Access Road Type</label>
                                        <select
                                            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-2xl text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                            value={formData.roadType}
                                            onChange={(e) => updateField('roadType', e.target.value)}
                                        >
                                            <option value="Tarmac">Asphalt / Tarmac Highway</option>
                                            <option value="Cobblestone">Cobblestone (Amabuye)</option>
                                            <option value="Murram">Murram / Compacted Dirt Road</option>
                                            <option value="Footpath">Pedestrian Path</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Stormwater Drainage</label>
                                        <select
                                            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-2xl text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                            value={formData.drainageSystem}
                                            onChange={(e) => updateField('drainageSystem', e.target.value)}
                                        >
                                            <option value="Covered">Covered Concrete Drainage</option>
                                            <option value="Open">Open Channel Drainage</option>
                                            <option value="Natural">Natural Runoff</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="p-4 bg-zinc-800/40 border border-zinc-700/60 rounded-2xl flex gap-8">
                                    <label className="flex items-center gap-2 cursor-pointer text-sm text-zinc-300">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 accent-green-500"
                                            checked={formData.waterOnsite}
                                            onChange={(e) => updateField('waterOnsite', e.target.checked)}
                                        />
                                        Water Line (WASAC) On-Site or Direct Access
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer text-sm text-zinc-300">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 accent-green-500"
                                            checked={formData.electricityOnsite}
                                            onChange={(e) => updateField('electricityOnsite', e.target.checked)}
                                        />
                                        Electricity (EUCL) Pole On-Site
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* CASE C: HOUSES, VILLAS, APARTMENTS & HOTELS */}
                        {(formData.category === 'house' || formData.category === 'hotel') && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Building Sub-Type</label>
                                        <select
                                            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-2xl text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                            value={formData.houseSubType}
                                            onChange={(e) => updateField('houseSubType', e.target.value)}
                                        >
                                            <option value="Villa">Luxury Villa</option>
                                            <option value="Apartment">Modern Apartment</option>
                                            <option value="SingleFamily">Single Family House</option>
                                            <option value="Townhouse">Townhouse / Gated Community</option>
                                            <option value="ModestHouse">Modest / Small Family House</option>
                                            <option value="Studio">Studio / Single Room</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Bedrooms</label>
                                        <input
                                            type="number"
                                            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-2xl text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                            placeholder="4"
                                            value={formData.bedrooms}
                                            onChange={(e) => updateField('bedrooms', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Bathrooms</label>
                                        <input
                                            type="number"
                                            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-2xl text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                            placeholder="3"
                                            value={formData.bathrooms}
                                            onChange={(e) => updateField('bathrooms', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Built Area (sqm)</label>
                                        <input
                                            type="number"
                                            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-2xl text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                            placeholder="250"
                                            value={formData.sizeSqm}
                                            onChange={(e) => updateField('sizeSqm', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Compound / Plot Size (sqm)</label>
                                        <input
                                            type="number"
                                            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-2xl text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                            placeholder="500"
                                            value={formData.compoundSizeSqm}
                                            onChange={(e) => updateField('compoundSizeSqm', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Year Built</label>
                                        <input
                                            type="number"
                                            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-2xl text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                            placeholder="2022"
                                            value={formData.yearBuilt}
                                            onChange={(e) => updateField('yearBuilt', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="bg-zinc-800/50 border border-zinc-700 p-6 rounded-3xl space-y-4">
                                    <h4 className="text-sm font-bold text-white mb-2">Amenities & Infrastructure Features</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {[
                                            { id: 'hasSwimmingPool', label: 'Swimming Pool', icon: '🏊' },
                                            { id: 'hasGarden', label: 'Private Garden', icon: '🌳' },
                                            { id: 'hasStaffQuarters', label: 'Staff / Boy Quarters', icon: '🏠' },
                                            { id: 'hasWaterTank', label: 'Water Reservoir Tank', icon: '🚰' },
                                            { id: 'hasSolarWaterHeater', label: 'Solar Water Heater', icon: '☀️' },
                                            { id: 'hasBackupGenerator', label: 'Backup Generator', icon: '⚡' },
                                            { id: 'isFurnished', label: 'Fully Furnished', icon: '🛋️' },
                                            { id: 'hasParking', label: 'Private Parking', icon: '🚗' },
                                        ].map(feature => (
                                            <label key={feature.id} className="flex items-center gap-3 p-3 bg-zinc-900 border border-zinc-700 rounded-2xl cursor-pointer hover:border-zinc-500 transition-all">
                                                <span className="text-lg">{feature.icon}</span>
                                                <span className="text-xs text-zinc-300 font-medium">{feature.label}</span>
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 accent-green-500 ml-auto"
                                                    checked={(formData as any)[feature.id]}
                                                    onChange={(e) => updateField(feature.id as any, e.target.checked)}
                                                />
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <span className="text-green-500">04.</span> Visual Media & 3D Navigation
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Main Cover Photo</label>
                                <div className="relative h-64 w-full bg-zinc-800 border-2 border-dashed border-zinc-700 rounded-3xl flex flex-col items-center justify-center group cursor-pointer hover:border-green-500 transition-all overflow-hidden">
                                    {formData.mainImage ? (
                                        <img src={URL.createObjectURL(formData.mainImage)} className="absolute inset-0 w-full h-full object-cover" alt="Main Cover" />
                                    ) : (
                                        <>
                                            <span className="text-4xl mb-2">🖼️</span>
                                            <span className="text-sm text-zinc-400 font-medium">Click to upload cover image</span>
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={(e) => updateField('mainImage', e.target.files?.[0] || null)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Additional Gallery Photos</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {[0, 1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className="aspect-square bg-zinc-800 border border-zinc-700 rounded-2xl flex items-center justify-center text-zinc-500 relative group overflow-hidden">
                                            {formData.gallery[i] ? (
                                                <img src={URL.createObjectURL(formData.gallery[i])} className="w-full h-full object-cover" alt={`Gallery ${i}`} />
                                            ) : (
                                                <span className="text-xl">+</span>
                                            )}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const newGal = [...formData.gallery];
                                                        newGal[i] = file;
                                                        updateField('gallery', newGal.filter(Boolean));
                                                    }
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* 3D MEDIA UPLOADS */}
                        <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-3xl space-y-4">
                            <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                <span className="text-xl">🌐</span> Advanced 3D Virtual Showroom Media
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-4 bg-zinc-800/60 border border-zinc-700/80 rounded-2xl relative">
                                    <p className="text-xs font-bold text-green-400 uppercase tracking-wider mb-1">360° Panorama Tour Image</p>
                                    <p className="text-[11px] text-zinc-400 mb-3">Upload equirectangular 2:1 ratio 360 photo for room navigation.</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-zinc-300 font-mono truncate max-w-[200px]">
                                            {formData.panorama360 ? formData.panorama360.name : 'No 360 photo selected'}
                                        </span>
                                        <label className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-white rounded-xl text-xs font-bold cursor-pointer">
                                            Choose File
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => updateField('panorama360', e.target.files?.[0] || null)}
                                            />
                                        </label>
                                    </div>
                                </div>

                                <div className="p-4 bg-zinc-800/60 border border-zinc-700/80 rounded-2xl relative">
                                    <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">3D Digital Twin (.glb / .gltf)</p>
                                    <p className="text-[11px] text-zinc-400 mb-3">Interactive 3D model for rotating car showroom or 3D floor plan.</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-zinc-300 font-mono truncate max-w-[200px]">
                                            {formData.model3d ? formData.model3d.name : 'No 3D file selected'}
                                        </span>
                                        <label className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-white rounded-xl text-xs font-bold cursor-pointer">
                                            Choose .glb
                                            <input
                                                type="file"
                                                accept=".glb,.gltf"
                                                className="hidden"
                                                onChange={(e) => updateField('model3d', e.target.files?.[0] || null)}
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 5:
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <span className="text-green-500">05.</span> Review & Publish
                        </h3>
                        <div className="bg-zinc-800/50 border border-zinc-700 rounded-3xl p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                                <div className="flex justify-between py-2 border-b border-zinc-700">
                                    <span className="text-zinc-500">Title</span>
                                    <span className="text-white font-medium">{formData.title || 'Not provided'}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-zinc-700">
                                    <span className="text-zinc-500">Category & Purpose</span>
                                    <span className="text-white font-medium uppercase">{formData.category} ({formData.purpose})</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-zinc-700">
                                    <span className="text-zinc-500">Price</span>
                                    <span className="text-green-400 font-bold">
                                        {formData.price ? `${Number(formData.price).toLocaleString()} RWF` : 'Not provided'}
                                        {formData.purpose === 'rent' ? ` / ${formData.rentalFrequency.replace('per_', '')}` : ''}
                                    </span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-zinc-700">
                                    <span className="text-zinc-500">Location</span>
                                    <span className="text-white font-medium">{formData.city}, {formData.district}</span>
                                </div>

                                {formData.category === 'land' ? (
                                    <>
                                        <div className="flex justify-between py-2 border-b border-zinc-700">
                                            <span className="text-zinc-500">UPI Number</span>
                                            <span className="text-white font-mono">{formData.upiNumber || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b border-zinc-700">
                                            <span className="text-zinc-500">Plot Size</span>
                                            <span className="text-white font-medium">{formData.sizeSqm} sqm</span>
                                        </div>
                                    </>
                                ) : formData.category === 'car' || formData.category === 'motorbike' ? (
                                    <>
                                        <div className="flex justify-between py-2 border-b border-zinc-700">
                                            <span className="text-zinc-500">Vehicle</span>
                                            <span className="text-white font-medium">{formData.year} {formData.make} {formData.model}</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b border-zinc-700">
                                            <span className="text-zinc-500">Transmission & Fuel</span>
                                            <span className="text-white font-medium">{formData.transmission}, {formData.fuelType}</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex justify-between py-2 border-b border-zinc-700">
                                            <span className="text-zinc-500">Bedrooms / Baths</span>
                                            <span className="text-white font-medium">{formData.bedrooms} Beds / {formData.bathrooms} Baths</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b border-zinc-700">
                                            <span className="text-zinc-500">Size</span>
                                            <span className="text-white font-medium">{formData.sizeSqm} sqm</span>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="p-4 bg-zinc-900 rounded-2xl border border-zinc-700">
                                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider block mb-2">Description</span>
                                <p className="text-sm text-zinc-300 italic">"{formData.description || 'No description provided.'}"</p>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-8 max-w-4xl mx-auto space-y-8">
            <div className="relative overflow-hidden bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-2xl">
                <div className="relative z-10 flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">✨</span>
                        <div>
                            <h1 className="text-3xl font-bold text-white">List New Asset</h1>
                            <p className="text-xs text-zinc-400 mt-1">Houses, Lands, Cars, and Motorbikes for Sale or Rent</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className={`w-8 h-2 rounded-full transition-all ${step >= i ? 'bg-green-500' : 'bg-zinc-700'}`} />
                        ))}
                    </div>
                </div>

                {renderStep()}

                <div className="mt-12 flex justify-between items-center pt-8 border-t border-zinc-800">
                    <button
                        type="button"
                        onClick={handlePrev}
                        disabled={step === 1}
                        className="px-6 py-3 text-zinc-500 font-bold hover:text-white transition-all disabled:opacity-0"
                    >
                        Back
                    </button>
                    {step < 5 ? (
                        <button
                            type="button"
                            onClick={handleNext}
                            className="px-8 py-3 bg-white text-black font-bold rounded-2xl hover:bg-zinc-200 transition-all flex items-center gap-2"
                        >
                            Next Step <span className="text-lg">→</span>
                        </button>
                    ) : (
                        <button
                            type="submit"
                            disabled={submitMutation.isPending}
                            className="px-8 py-3 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-500 transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            {submitMutation.isPending ? 'Publishing...' : (
                                <>
                                    <span className="text-lg">🚀</span> Publish Listing
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </form>
    );
};

export default ListingWizard;
