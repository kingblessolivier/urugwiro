import React, { useState } from 'react';
import { Building2, Check, Clock, AlertCircle } from 'lucide-react';
import { Button } from './ui/Button';

interface SellerSelfRegistrationProps {
    onNavigate?: (view: string) => void;
}

export const SellerSelfRegistration: React.FC<SellerSelfRegistrationProps> = ({ onNavigate }) => {
    const [step, setStep] = useState<'info' | 'pending' | 'approved'>('info');
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        companyName: '',
        propertyType: 'house',
        message: '',
    });

    const handleSubmit = () => {
        // In production, this would call an API endpoint
        console.log('Seller registration submitted:', formData);
        setStep('pending');
    };

    if (step === 'pending') {
        return (
            <div className="max-w-lg mx-auto text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
                    <Clock size={32} className="text-amber-500" />
                </div>
                <h2 className="text-xl font-bold text-[var(--color-text-main)] mb-2">Application Submitted</h2>
                <p className="text-sm text-[var(--color-text-muted)] mb-6">
                    Your seller account application has been submitted for review. You'll receive an email once approved.
                </p>
                <Button variant="outline" onClick={() => setStep('info')}>Submit Another</Button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                    <Building2 size={32} className="text-emerald-500" />
                </div>
                <h1 className="text-2xl font-bold text-[var(--color-text-main)]">Become a Seller</h1>
                <p className="text-sm text-[var(--color-text-muted)] mt-2">
                    List your properties on Rwanda's premier real estate platform
                </p>
            </div>

            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Full Name</label>
                            <input
                                type="text"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                placeholder="Your full name"
                                className="w-full rounded-xl border border-[var(--color-input-border)] bg-[var(--color-input-bg)] px-3 py-2.5 text-sm text-[var(--color-text-main)] outline-none focus:border-[var(--color-brand-emerald)]"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="your@email.com"
                                className="w-full rounded-xl border border-[var(--color-input-border)] bg-[var(--color-input-bg)] px-3 py-2.5 text-sm text-[var(--color-text-main)] outline-none focus:border-[var(--color-brand-emerald)]"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Phone Number</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="078XXXXXXXX"
                                className="w-full rounded-xl border border-[var(--color-input-border)] bg-[var(--color-input-bg)] px-3 py-2.5 text-sm text-[var(--color-text-main)] outline-none focus:border-[var(--color-brand-emerald)]"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Company Name (optional)</label>
                            <input
                                type="text"
                                value={formData.companyName}
                                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                placeholder="Your company"
                                className="w-full rounded-xl border border-[var(--color-input-border)] bg-[var(--color-input-bg)] px-3 py-2.5 text-sm text-[var(--color-text-main)] outline-none focus:border-[var(--color-brand-emerald)]"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Property Type</label>
                        <select
                            value={formData.propertyType}
                            onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                            className="w-full rounded-xl border border-[var(--color-input-border)] bg-[var(--color-input-bg)] px-3 py-2.5 text-sm text-[var(--color-text-main)] outline-none focus:border-[var(--color-brand-emerald)]"
                        >
                            <option value="house">House / Villa</option>
                            <option value="apartment">Apartment</option>
                            <option value="land">Land</option>
                            <option value="commercial">Commercial</option>
                            <option value="vehicle">Vehicle</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Message (optional)</label>
                        <textarea
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            rows={3}
                            placeholder="Tell us about your properties..."
                            className="w-full rounded-xl border border-[var(--color-input-border)] bg-[var(--color-input-bg)] px-3 py-2.5 text-sm text-[var(--color-text-main)] outline-none focus:border-[var(--color-brand-emerald)] resize-none"
                        />
                    </div>

                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 flex items-start gap-2">
                        <AlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-600">
                            Seller accounts require admin approval. You'll be notified once your application is reviewed.
                        </p>
                    </div>

                    <Button variant="primary" onClick={handleSubmit} className="w-full" disabled={!formData.fullName || !formData.email || !formData.phone}>
                        <Check size={14} />
                        <span>Submit Application</span>
                    </Button>
                </div>
            </div>
        </div>
    );
};
