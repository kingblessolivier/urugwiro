import React, { useState } from 'react';
import { Search, MapPin, ShieldCheck, Phone, Mail, Star, Filter } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ServiceProvider {
  id: string;
  name: string;
  type: 'surveyor' | 'valuer' | 'legal';
  location: string;
  rating: number;
  reviewCount: number;
  phone: string;
  email: string;
  verified: boolean;
  description: string;
  specialties: string[];
}

const PROVIDERS: ServiceProvider[] = [
  {
    id: '1',
    name: 'Kigali Land Surveyors Ltd',
    type: 'surveyor',
    location: 'Kigali, Gasabo',
    rating: 4.8,
    reviewCount: 127,
    phone: '+250 788 123 456',
    email: 'info@klsurveyors.rw',
    verified: true,
    description: 'Professional land surveying and boundary demarcation services with 15+ years of experience.',
    specialties: ['Boundary Survey', 'Topographic Survey', 'Subdivision'],
  },
  {
    id: '2',
    name: 'Rwanda Valuation Experts',
    type: 'valuer',
    location: 'Kigali, Nyarugenge',
    rating: 4.9,
    reviewCount: 89,
    phone: '+250 788 234 567',
    email: 'contact@rwandavaluers.com',
    verified: true,
    description: 'Certified property valuers providing accurate market valuations for all asset types.',
    specialties: ['Residential Valuation', 'Commercial Valuation', 'Land Appraisal'],
  },
  {
    id: '3',
    name: 'Ubwiyunge Legal Consult',
    type: 'legal',
    location: 'Kigali, Kicukiro',
    rating: 4.7,
    reviewCount: 64,
    phone: '+250 788 345 678',
    email: 'legal@ubwiyunge.rw',
    verified: true,
    description: 'Specialized real estate legal services including title verification and contract review.',
    specialties: ['Title Verification', 'Contract Drafting', 'Dispute Resolution'],
  },
  {
    id: '4',
    name: 'East Africa Survey Group',
    type: 'surveyor',
    location: 'Musanze',
    rating: 4.6,
    reviewCount: 45,
    phone: '+250 788 456 789',
    email: 'info@eastafricasurvey.com',
    verified: true,
    description: 'Regional surveying services covering Northern Province and beyond.',
    specialties: ['Cadastral Survey', 'Engineering Survey', 'GIS Mapping'],
  },
  {
    id: '5',
    name: 'Prime Property Valuers',
    type: 'valuer',
    location: 'Kigali, Gasabo',
    rating: 4.5,
    reviewCount: 38,
    phone: '+250 788 567 890',
    email: 'valuations@primeproperty.rw',
    verified: false,
    description: 'Fast and reliable property valuations for residential and commercial properties.',
    specialties: ['Market Valuation', 'Insurance Valuation', 'Tax Assessment'],
  },
  {
    id: '6',
    name: 'Ihuriro Law Partners',
    type: 'legal',
    location: 'Kigali, Nyarugenge',
    rating: 4.8,
    reviewCount: 52,
    phone: '+250 788 678 901',
    email: 'info@ihurirolaw.rw',
    verified: true,
    description: 'Full-service law firm with dedicated real estate and land law practice.',
    specialties: ['Real Estate Law', 'Land Registration', 'Due Diligence'],
  },
];

const TYPE_LABELS: Record<string, string> = {
  surveyor: 'Surveyor',
  valuer: 'Valuer',
  legal: 'Legal Expert',
};

const ServicesPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);

  const filteredProviders = PROVIDERS.filter((p) => {
    const matchesType = typeFilter === 'all' || p.type === typeFilter;
    const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.location.toLowerCase().includes(search.toLowerCase()) || p.specialties.some((s) => s.toLowerCase().includes(search.toLowerCase()));
    return matchesType && matchesSearch;
  });

  if (selectedProvider) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-deep)] text-[var(--color-text-main)]">
        <div className="mx-auto max-w-3xl px-4 py-8">
          <button
            onClick={() => setSelectedProvider(null)}
            className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition mb-6 cursor-pointer"
          >
            Back to directory
          </button>
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-xl font-bold">{selectedProvider.name}</h1>
                <p className="text-sm text-[var(--color-text-muted)] mt-1">{TYPE_LABELS[selectedProvider.type]}</p>
              </div>
              {selectedProvider.verified && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  <ShieldCheck size={12} /> Verified
                </span>
              )}
            </div>
            <p className="text-sm text-[var(--color-text-muted)] mb-4">{selectedProvider.description}</p>
            <div className="flex items-center gap-2 mb-4">
              <Star size={14} className="fill-amber-400 text-amber-400" />
              <span className="text-sm font-semibold">{selectedProvider.rating}</span>
              <span className="text-xs text-[var(--color-text-dim)]">({selectedProvider.reviewCount} reviews)</span>
            </div>
            <div className="space-y-2 mb-4">
              <p className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                <MapPin size={14} /> {selectedProvider.location}
              </p>
              <p className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                <Phone size={14} /> {selectedProvider.phone}
              </p>
              <p className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                <Mail size={14} /> {selectedProvider.email}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedProvider.specialties.map((s) => (
                <span key={s} className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] border border-[var(--color-border)]">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-deep)] text-[var(--color-text-main)]">
      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight">Professional Services</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-2 max-w-xl mx-auto">
            Verified surveyors, valuers, and legal experts to help with your property journey.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-dim)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, location, or specialty..."
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] text-sm text-[var(--color-text-main)] outline-none focus:border-emerald-500/50"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-[var(--color-text-dim)]" />
            {['all', 'surveyor', 'valuer', 'legal'].map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={cn(
                  'px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                  typeFilter === type
                    ? 'bg-emerald-500 text-white'
                    : 'border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-emerald-500/30'
                )}
              >
                {type === 'all' ? 'All' : TYPE_LABELS[type]}
              </button>
            ))}
          </div>
        </div>

        {/* Providers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProviders.map((provider) => (
            <button
              key={provider.id}
              onClick={() => setSelectedProvider(provider)}
              className="text-left rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5 transition-all hover:border-emerald-500/30 hover:shadow-lg cursor-pointer"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <h3 className="text-sm font-bold">{provider.name}</h3>
                  <p className="text-[10px] text-[var(--color-text-dim)] mt-0.5">{TYPE_LABELS[provider.type]}</p>
                </div>
                {provider.verified && (
                  <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
                )}
              </div>
              <p className="text-xs text-[var(--color-text-muted)] line-clamp-2 mb-3">{provider.description}</p>
              <div className="flex items-center gap-2 mb-3">
                <Star size={12} className="fill-amber-400 text-amber-400" />
                <span className="text-xs font-semibold">{provider.rating}</span>
                <span className="text-[10px] text-[var(--color-text-dim)]">({provider.reviewCount})</span>
              </div>
              <p className="flex items-center gap-1.5 text-[10px] text-[var(--color-text-dim)]">
                <MapPin size={10} /> {provider.location}
              </p>
            </button>
          ))}
        </div>

        {filteredProviders.length === 0 && (
          <div className="text-center py-16">
            <p className="text-sm text-[var(--color-text-muted)]">No service providers found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicesPage;
