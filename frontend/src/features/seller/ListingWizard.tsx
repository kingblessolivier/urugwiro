import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '../../api/endpoints';
import apiClient from '../../api/client';

interface ListingFormData {
    title: string;
    propertyType: string;
    description: string;
    listingType: string;
    price: string;
    isNegotiable: boolean;
    address: string;
    city: string;
    district: string;
    sector: string;
    sizeSqm: string;
    bedrooms: string;
    bathrooms: string;
    yearBuilt: string;
    hasTitleDeed: boolean;
    hasParking: boolean;
    hasGarden: boolean;
    isFurnished: boolean;
    mainImage: File | null;
    gallery: File[];
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
    propertyType: 'Residential',
    description: '',
    listingType: 'Sale',
    price: '',
    isNegotiable: false,
    address: '',
    city: '',
    district: '',
    sector: '',
    sizeSqm: '',
    bedrooms: '',
    bathrooms: '',
    yearBuilt: '',
    hasTitleDeed: false,
    hasParking: false,
    hasGarden: false,
    isFurnished: false,
    mainImage: null,
    gallery: [],
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
                propertyType: formData.propertyType,
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
                property_type: formData.propertyType,
                city: formData.city,
                district: formData.district,
                sector: formData.sector,
                size: formData.sizeSqm,
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
                    value.forEach((file, index) => formDataInstance.append(`gallery_${index}`, file));
                } else if (key === 'verificationDocs') {
                    value.forEach((doc, index) => {
                        formDataInstance.append(`doc_name_${index}`, doc.name);
                        formDataInstance.append(`doc_file_${index}`, doc.file);
                    });
                } else if (value instanceof File) {
                    formDataInstance.append(key, value);
                } else {
                    formDataInstance.append(key, String(value));
                }
            });

            return apiClient.post('/seller/listings/create/', formDataInstance, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        },
        onSuccess: () => {
            alert('Property listed successfully! It is now in the verification queue.');
            window.location.href = '/seller-dashboard';
        },
        onError: (error: any) => {
            alert(`Submission failed: ${error.response?.data?.detail || 'Unknown error'}`);
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
                            <span className="text-green-500">01.</span> Basic Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Listing Title</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-2xl text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                    placeholder="e.g. Luxury Villa in Nyarutarama"
                                    value={formData.title}
                                    onChange={(e) => updateField('title', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Property Type</label>
                                <select
                                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-2xl text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                    value={formData.propertyType}
                                    onChange={(e) => updateField('propertyType', e.target.value)}
                                >
                                    <option value="Residential">Residential</option>
                                    <option value="Commercial">Commercial</option>
                                    <option value="Land">Land</option>
                                    <option value="Hotel">Hotel</option>
                                    <option value="Vehicle">Vehicle</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Description</label>
                                <button
                                    onClick={generateAiDescription}
                                    disabled={isGeneratingAi}
                                    className="text-[10px] font-bold text-green-400 hover:text-green-300 flex items-center gap-1 transition-all disabled:opacity-50"
                                >
                                    {isGeneratingAi ? '✨ Generating...' : '✨ Generate AI Luxury Narrative'}
                                </button>
                            </div>
                            <textarea
                                rows={4}
                                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-2xl text-white focus:ring-2 focus:ring-green-500 outline-none transition-all resize-none"
                                placeholder="Describe the unique features of this property..."
                                value={formData.description}
                                onChange={(e) => updateField('description', e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Listing Type</label>
                                <select
                                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-2xl text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                    value={formData.listingType}
                                    onChange={(e) => updateField('listingType', e.target.value)}
                                >
                                    <option value="Sale">For Sale</option>
                                    <option value="Rent">For Rent</option>
                                </select>
                            </div>
                            <div className="space-y-2 relative">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Price (RWF)</label>
                                    <button
                                        type="button"
                                        onClick={fetchValuation}
                                        disabled={isValuating || !formData.city || !formData.sizeSqm}
                                        className="text-[10px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-all disabled:opacity-50"
                                    >
                                        {isValuating ? '⌛ Calculating...' : '📊 Suggest Price'}
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
                                    <div className="absolute top-full left-0 right-0 z-20 mt-2 p-4 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Suggested Fair Market Value</p>
                                                <p className="text-lg font-bold text-white">
                                                    {valuation.fmv_min.toLocaleString()} - {valuation.fmv_max.toLocaleString()} {valuation.currency}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    updateField('price', valuation.fmv_average.toString());
                                                    setValuation(null);
                                                }}
                                                className="px-3 py-1 bg-green-600 text-white text-[10px] font-bold rounded-lg hover:bg-green-500 transition-all"
                                            >
                                                Apply Avg
                                            </button>
                                        </div>
                                        <p className="text-xs text-zinc-400 italic">{valuation.message}</p>
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
                                    <span className="ml-3 text-sm font-medium text-zinc-400">Price Negotiable</span>
                                </label>
                            </div>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <span className="text-green-500">02.</span> Location Intelligence
                        </h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Full Address / Plot Number</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-2xl text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                    placeholder="e.g. KG 123 St, House 45"
                                    value={formData.address}
                                    onChange={(e) => updateField('address', e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">City</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-2xl text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                        placeholder="Kigali"
                                        value={formData.city}
                                        onChange={(e) => updateField('city', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">District</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-2xl text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                        placeholder="Gasabo"
                                        value={formData.district}
                                        onChange={(e) => updateField('district', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Sector</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-2xl text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                        placeholder="Nyarutarama"
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Size (sqm)</label>
                                        <input
                                            type="number"
                                            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-2xl text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                            value={formData.sizeSqm}
                                            onChange={(e) => updateField('sizeSqm', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Year Built</label>
                                        <input
                                            type="number"
                                            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-2xl text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                            value={formData.yearBuilt}
                                            onChange={(e) => updateField('yearBuilt', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Bedrooms</label>
                                        <input
                                            type="number"
                                            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-2xl text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                            value={formData.bedrooms}
                                            onChange={(e) => updateField('bedrooms', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Bathrooms</label>
                                        <input
                                            type="number"
                                            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-2xl text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                            value={formData.bathrooms}
                                            onChange={(e) => updateField('bathrooms', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-zinc-800/50 border border-zinc-700 p-6 rounded-3xl space-y-4">
                                <h4 className="text-sm font-bold text-white mb-4">Premium Features</h4>
                                {[
                                    { id: 'hasTitleDeed', label: 'Registered Title Deed', icon: '📜' },
                                    { id: 'hasParking', label: 'Private Parking', icon: '🚗' },
                                    { id: 'hasGarden', label: 'Landscaped Garden', icon: '🌳' },
                                    { id: 'isFurnished', label: 'Fully Furnished', icon: '🛋️' },
                                ].map(feature => (
                                    <label key={feature.id} className="flex items-center justify-between p-3 bg-zinc-900 border border-zinc-700 rounded-2xl cursor-pointer hover:border-zinc-600 transition-all">
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg">{feature.icon}</span>
                                            <span className="text-sm text-zinc-300">{feature.label}</span>
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5 accent-green-500"
                                            checked={(formData as any)[feature.id]}
                                            onChange={(e) => updateField(feature.id as any, e.target.checked)}
                                        />
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <span className="text-green-500">04.</span> Visual Media
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Main Cover Photo</label>
                                <div className="relative h-64 w-full bg-zinc-800 border-2 border-dashed border-zinc-700 rounded-3xl flex flex-col items-center justify-center group cursor-pointer hover:border-green-500 transition-all overflow-hidden">
                                    {formData.mainImage ? (
                                        <img src={URL.createObjectURL(formData.mainImage)} className="absolute inset-0 w-full h-full object-cover" alt="Main" />
                                    ) : (
                                        <>
                                            <span className="text-4xl mb-2">🖼️</span>
                                            <span className="text-sm text-zinc-500">Click to upload cover image</span>
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={(e) => updateField('mainImage', e.target.files?.[0] || null)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Gallery & Video</label>
                                <div className="grid grid-cols-3 gap-3 mb-4">
                                    {[1,2,3,4,5].map(i => (
                                        <div key={i} className="aspect-square bg-zinc-800 border border-zinc-700 rounded-xl flex items-center justify-center text-zinc-600 relative group">
                                            <span>+</span>
                                            <input
                                                type="file"
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) updateField('gallery', [...formData.gallery, file]);
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Virtual Tour / Video URL</label>
                                    <input
                                        type="url"
                                        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-2xl text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                        placeholder="https://youtube.com/..."
                                        value={formData.videoUrl}
                                        onChange={(e) => updateField('videoUrl', e.target.value)}
                                    />
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
                                    <span className="text-zinc-500">Price</span>
                                    <span className="text-green-400 font-bold">{formData.price ? `${Number(formData.price).toLocaleString()} RWF` : 'Not provided'}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-zinc-700">
                                    <span className="text-zinc-500">Type</span>
                                    <span className="text-white font-medium">{formData.propertyType}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-zinc-700">
                                    <span className="text-zinc-500">Location</span>
                                    <span className="text-white font-medium">{formData.city}, {formData.district}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-zinc-700">
                                    <span className="text-zinc-500">Bedrooms/Baths</span>
                                    <span className="text-white font-medium">{formData.bedrooms} / {formData.bathrooms}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-zinc-700">
                                    <span className="text-zinc-500">Size</span>
                                    <span className="text-white font-medium">{formData.sizeSqm} sqm</span>
                                </div>
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
                            <h1 className="text-3xl font-bold text-white">List New Property</h1>
                        </div>
                        <div className="flex gap-2">
                            {[1,2,3,4,5].map(i => (
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
