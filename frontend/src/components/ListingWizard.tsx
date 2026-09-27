import React, { useState } from 'react';
import { Save, Upload, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { Button } from './ui/Button';

interface WizardStep {
    id: string;
    title: string;
    description: string;
}

interface ListingWizardProps {
    onComplete?: (data: any) => void;
    onSaveDraft?: (data: any) => void;
}

const WIZARD_STEPS: WizardStep[] = [
    { id: 'basic', title: 'Basic Info', description: 'Title, description, category' },
    { id: 'location', title: 'Location', description: 'Address, district, sector' },
    { id: 'details', title: 'Details', description: 'Bedrooms, bathrooms, area' },
    { id: 'media', title: 'Photos & Media', description: 'Upload images and videos' },
    { id: 'pricing', title: 'Pricing', description: 'Price, currency, terms' },
    { id: 'review', title: 'Review', description: 'Confirm and publish' },
];

export const ListingWizard: React.FC<ListingWizardProps> = ({ onComplete, onSaveDraft }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [isSaving, setIsSaving] = useState(false);

    const updateField = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const nextStep = () => {
        if (currentStep < WIZARD_STEPS.length - 1) {
            setCurrentStep((prev) => prev + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep((prev) => prev - 1);
        }
    };

    const saveDraft = async () => {
        setIsSaving(true);
        try {
            // Save to localStorage
            localStorage.setItem('urugwiro_listing_draft', JSON.stringify(formData));
            onSaveDraft?.(formData);
        } finally {
            setIsSaving(false);
        }
    };

    const publish = async () => {
        setIsSaving(true);
        try {
            onComplete?.(formData);
        } finally {
            setIsSaving(false);
        }
    };

    const renderStep = () => {
        switch (WIZARD_STEPS[currentStep].id) {
            case 'basic':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Title</label>
                            <input
                                type="text"
                                value={formData.title || ''}
                                onChange={(e) => updateField('title', e.target.value)}
                                placeholder="e.g. Modern 4-Bedroom Villa in Nyarutarama"
                                className="w-full rounded-xl border border-[var(--color-input-border)] bg-[var(--color-input-bg)] px-3 py-2.5 text-sm text-[var(--color-text-main)] outline-none focus:border-[var(--color-brand-emerald)]"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Description</label>
                            <textarea
                                value={formData.description || ''}
                                onChange={(e) => updateField('description', e.target.value)}
                                rows={4}
                                placeholder="Describe your property..."
                                className="w-full rounded-xl border border-[var(--color-input-border)] bg-[var(--color-input-bg)] px-3 py-2.5 text-sm text-[var(--color-text-main)] outline-none focus:border-[var(--color-brand-emerald)] resize-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Category</label>
                            <select
                                value={formData.category || ''}
                                onChange={(e) => updateField('category', e.target.value)}
                                className="w-full rounded-xl border border-[var(--color-input-border)] bg-[var(--color-input-bg)] px-3 py-2.5 text-sm text-[var(--color-text-main)] outline-none focus:border-[var(--color-brand-emerald)]"
                            >
                                <option value="">Select category</option>
                                <option value="house">House</option>
                                <option value="apartment">Apartment</option>
                                <option value="land">Land</option>
                                <option value="car">Car</option>
                                <option value="motorbike">Motorbike</option>
                                <option value="commercial">Commercial</option>
                            </select>
                        </div>
                    </div>
                );
            case 'location':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Address</label>
                            <input
                                type="text"
                                value={formData.address || ''}
                                onChange={(e) => updateField('address', e.target.value)}
                                placeholder="Street address"
                                className="w-full rounded-xl border border-[var(--color-input-border)] bg-[var(--color-input-bg)] px-3 py-2.5 text-sm text-[var(--color-text-main)] outline-none focus:border-[var(--color-brand-emerald)]"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">District</label>
                                <input
                                    type="text"
                                    value={formData.district || ''}
                                    onChange={(e) => updateField('district', e.target.value)}
                                    placeholder="e.g. Gasabo"
                                    className="w-full rounded-xl border border-[var(--color-input-border)] bg-[var(--color-input-bg)] px-3 py-2.5 text-sm text-[var(--color-text-main)] outline-none focus:border-[var(--color-brand-emerald)]"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Sector</label>
                                <input
                                    type="text"
                                    value={formData.sector || ''}
                                    onChange={(e) => updateField('sector', e.target.value)}
                                    placeholder="e.g. Nyarutarama"
                                    className="w-full rounded-xl border border-[var(--color-input-border)] bg-[var(--color-input-bg)] px-3 py-2.5 text-sm text-[var(--color-text-main)] outline-none focus:border-[var(--color-brand-emerald)]"
                                />
                            </div>
                        </div>
                    </div>
                );
            case 'details':
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Bedrooms</label>
                                <input
                                    type="number"
                                    value={formData.bedrooms || ''}
                                    onChange={(e) => updateField('bedrooms', e.target.value)}
                                    placeholder="0"
                                    className="w-full rounded-xl border border-[var(--color-input-border)] bg-[var(--color-input-bg)] px-3 py-2.5 text-sm text-[var(--color-text-main)] outline-none focus:border-[var(--color-brand-emerald)]"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Bathrooms</label>
                                <input
                                    type="number"
                                    value={formData.bathrooms || ''}
                                    onChange={(e) => updateField('bathrooms', e.target.value)}
                                    placeholder="0"
                                    className="w-full rounded-xl border border-[var(--color-input-border)] bg-[var(--color-input-bg)] px-3 py-2.5 text-sm text-[var(--color-text-main)] outline-none focus:border-[var(--color-brand-emerald)]"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Area (sqm)</label>
                            <input
                                type="number"
                                value={formData.area || ''}
                                onChange={(e) => updateField('area', e.target.value)}
                                placeholder="e.g. 450"
                                className="w-full rounded-xl border border-[var(--color-input-border)] bg-[var(--color-input-bg)] px-3 py-2.5 text-sm text-[var(--color-text-main)] outline-none focus:border-[var(--color-brand-emerald)]"
                            />
                        </div>
                    </div>
                );
            case 'media':
                return (
                    <div className="space-y-4">
                        <div className="border-2 border-dashed border-[var(--color-border)] rounded-2xl p-8 text-center">
                            <Upload size={32} className="mx-auto text-[var(--color-text-dim)] mb-3" />
                            <p className="text-sm font-semibold text-[var(--color-text-main)]">Upload Photos</p>
                            <p className="text-xs text-[var(--color-text-muted)] mt-1">Drag and drop or click to browse</p>
                            <p className="text-[10px] text-[var(--color-text-dim)] mt-2">JPG, PNG up to 10MB each</p>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="aspect-square rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)]" />
                            ))}
                        </div>
                    </div>
                );
            case 'pricing':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Price</label>
                            <input
                                type="number"
                                value={formData.price || ''}
                                onChange={(e) => updateField('price', e.target.value)}
                                placeholder="e.g. 45000000"
                                className="w-full rounded-xl border border-[var(--color-input-border)] bg-[var(--color-input-bg)] px-3 py-2.5 text-sm text-[var(--color-text-main)] outline-none focus:border-[var(--color-brand-emerald)]"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Currency</label>
                            <select
                                value={formData.currency || 'RWF'}
                                onChange={(e) => updateField('currency', e.target.value)}
                                className="w-full rounded-xl border border-[var(--color-input-border)] bg-[var(--color-input-bg)] px-3 py-2.5 text-sm text-[var(--color-text-main)] outline-none focus:border-[var(--color-brand-emerald)]"
                            >
                                <option value="RWF">RWF</option>
                                <option value="USD">USD</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Purpose</label>
                            <select
                                value={formData.purpose || 'sale'}
                                onChange={(e) => updateField('purpose', e.target.value)}
                                className="w-full rounded-xl border border-[var(--color-input-border)] bg-[var(--color-input-bg)] px-3 py-2.5 text-sm text-[var(--color-text-main)] outline-none focus:border-[var(--color-brand-emerald)]"
                            >
                                <option value="sale">For Sale</option>
                                <option value="rent">For Rent</option>
                            </select>
                        </div>
                    </div>
                );
            case 'review':
                return (
                    <div className="space-y-4">
                        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-input-bg)] p-4">
                            <h4 className="text-sm font-bold text-[var(--color-text-main)] mb-3">Review Your Listing</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-xs text-[var(--color-text-muted)]">Title</span>
                                    <span className="text-xs font-semibold text-[var(--color-text-main)]">{formData.title || '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-xs text-[var(--color-text-muted)]">Category</span>
                                    <span className="text-xs font-semibold text-[var(--color-text-main)]">{formData.category || '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-xs text-[var(--color-text-muted)]">Price</span>
                                    <span className="text-xs font-semibold text-[var(--color-text-main)]">{formData.price ? `${Number(formData.price).toLocaleString()} ${formData.currency || 'RWF'}` : '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-xs text-[var(--color-text-muted)]">Location</span>
                                    <span className="text-xs font-semibold text-[var(--color-text-main)]">{[formData.district, formData.sector].filter(Boolean).join(', ') || '-'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            {/* Progress steps */}
            <div className="flex items-center justify-between mb-8">
                {WIZARD_STEPS.map((step, idx) => (
                    <React.Fragment key={step.id}>
                        <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                idx < currentStep ? 'bg-emerald-500 text-white' :
                                idx === currentStep ? 'bg-emerald-500/15 text-emerald-500 border-2 border-emerald-500' :
                                'bg-[var(--color-bg-elevated)] text-[var(--color-text-dim)]'
                            }`}>
                                {idx < currentStep ? <Check size={14} /> : idx + 1}
                            </div>
                            <span className="text-[10px] text-[var(--color-text-muted)] mt-1 hidden sm:block">{step.title}</span>
                        </div>
                        {idx < WIZARD_STEPS.length - 1 && (
                            <div className={`flex-1 h-0.5 mx-2 ${idx < currentStep ? 'bg-emerald-500' : 'bg-[var(--color-bg-elevated)]'}`} />
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* Step content */}
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 mb-6">
                <h2 className="text-lg font-bold text-[var(--color-text-main)] mb-1">{WIZARD_STEPS[currentStep].title}</h2>
                <p className="text-xs text-[var(--color-text-muted)] mb-6">{WIZARD_STEPS[currentStep].description}</p>
                {renderStep()}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
                <div>
                    {currentStep > 0 && (
                        <Button variant="ghost" onClick={prevStep}>
                            <ChevronLeft size={14} />
                            <span>Previous</span>
                        </Button>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={saveDraft} disabled={isSaving}>
                        <Save size={14} />
                        <span>Save Draft</span>
                    </Button>
                    {currentStep < WIZARD_STEPS.length - 1 ? (
                        <Button variant="primary" onClick={nextStep}>
                            <span>Next</span>
                            <ChevronRight size={14} />
                        </Button>
                    ) : (
                        <Button variant="primary" onClick={publish} disabled={isSaving}>
                            <Check size={14} />
                            <span>Publish Listing</span>
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};
