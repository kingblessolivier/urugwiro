import React from 'react';
import { Camera, CarFront, Gavel, HardHat, SearchCheck, Wrench, ArrowRight, ShieldCheck, CheckCircle2, Sparkles } from 'lucide-react';
import { PageHero } from '../../components/layout/PageHero';
import { Button } from '../../components/ui/Button';
import type { AppView } from '../../types/navigation';

const services = [
  {
    title: 'Certified Real Estate Brokers',
    description: 'Vetted real estate professionals specializing in prime commercial, residential estates, and land transactions across Kigali and secondary cities.',
    icon: HardHat,
    tag: 'Advisory & Brokerage',
    features: ['Price Negotiation', 'Buyer Representation', 'Portfolio Management']
  },
  {
    title: 'Chartered Land Surveyors',
    description: 'Licensed professionals for boundary verification, beacon replacement, topographic surveys, and official RLMUA cadastral parcel validation.',
    icon: SearchCheck,
    tag: 'Cadastral & Land',
    features: ['UPI Boundary Audit', 'Contour Mapping', 'Deed Certification']
  },
  {
    title: 'Certified Property Valuers',
    description: 'Accredited valuation reports required for bank collateral, mortgage approvals, capital gains assessment, and pre-purchase equity analysis.',
    icon: Gavel,
    tag: 'Valuation & Finance',
    features: ['Bank-Ready Reports', 'Market Comparables', 'Asset Appraisal']
  },
  {
    title: 'Automotive & Fleet Inspectors',
    description: 'Comprehensive mechanical, chassis, electrical, and electronic diagnostic inspections before purchasing high-value motor vehicles.',
    icon: CarFront,
    tag: 'Vehicle Due Diligence',
    features: ['Engine Diagnostics', 'Chassis Integrity', 'Title / Plate Audit']
  },
  {
    title: 'Architectural Photographers & 3D Scanning',
    description: 'High-definition HDR imagery, drone aerial cinematography, Matterport 3D digital twins, and virtual walkthrough production.',
    icon: Camera,
    tag: 'Media & Spatial Tech',
    features: ['4K Aerial Drone', '3D Digital Twin', 'Staging Production']
  },
  {
    title: 'Master Technicians & Maintenance',
    description: 'Licensed electrical engineers, HVAC contractors, master plumbers, and certified master mechanics for premium upkeep.',
    icon: Wrench,
    tag: 'Maintenance & Works',
    features: ['Emergency Repair', 'Preventative Care', 'Facility Audits']
  },
];

interface ServicesPageProps {
  onNavigate?: (view: AppView) => void;
}

const ServicesPage: React.FC<ServicesPageProps> = ({ onNavigate }) => (
  <div style={{ background: 'var(--color-bg-deep)', color: 'var(--color-text-main)' }} className="min-h-screen transition-colors duration-300">
    <PageHero
      eyebrow="Specialist Network"
      title="Elite Professional Services for High-Value Assets."
      description="Connect with accredited surveyors, valuers, legal professionals, inspectors, and media producers. Every partner is verified for licensing, indemnity insurance, and track record."
    />

    <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
      {/* Trust Strip */}
      <div className="mb-14 grid gap-4 rounded-2xl border p-6 sm:grid-cols-3"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)', boxShadow: 'var(--shadow-depth-1)' }}>
        {[
          { icon: ShieldCheck, title: 'License Verified', desc: 'All providers verified against Rwandan regulatory boards' },
          { icon: CheckCircle2, title: 'Escrow-Backed Quality', desc: 'Service fees safeguarded until client milestone sign-off' },
          { icon: Sparkles, title: 'Fast-Track Delivery', desc: 'Guaranteed turnaround SLAs on urgent property and title audits' },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <Icon size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text-main)' }}>{title}</p>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Services Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {services.map(({ title, description, icon: Icon, tag, features }) => (
          <article
            key={title}
            className="group flex flex-col justify-between rounded-2xl border p-7 transition-all duration-300 hover:border-emerald-500/40 oneui-card"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)', boxShadow: 'var(--shadow-depth-1)' }}
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 transition-all group-hover:bg-emerald-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-emerald-500/30">
                  <Icon size={22} />
                </div>
                <span className="rounded-full border px-3 py-1 text-[11px] font-medium"
                  style={{ borderColor: 'var(--color-border)', background: 'var(--color-input-bg)', color: 'var(--color-text-muted)' }}>
                  {tag}
                </span>
              </div>

              <h2 className="mt-6 text-xl font-bold group-hover:text-emerald-500 transition-colors" style={{ color: 'var(--color-text-main)' }}>
                {title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                {description}
              </p>

              <div className="mt-6 space-y-2 pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
                {features.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-main)' }}>
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-4">
              <button
                type="button"
                onClick={() => onNavigate?.('contact')}
                className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-500 hover:text-emerald-400 transition-colors"
              >
                Inquire For Provider <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* Concierge Callout */}
      <div className="mt-16 overflow-hidden rounded-3xl border p-8 md:p-12"
        style={{
          borderColor: 'var(--color-border)',
          background: 'linear-gradient(135deg, rgba(8,126,57,0.08) 0%, var(--color-bg-card) 100%)',
          boxShadow: 'var(--shadow-depth-2)',
        }}>
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-500">Concierge Desk</span>
            <h2 className="mt-2 text-2xl font-bold md:text-3xl" style={{ color: 'var(--color-text-main)' }}>Need custom due diligence or multi-asset inspection?</h2>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
              Our institutional advisory team coordinates comprehensive technical, legal, and environmental audits for high-value acquisitions across the Great Lakes region.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Button
              className="rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20"
              onClick={() => onNavigate?.('contact')}
            >
              Contact Advisory Desk
            </Button>
            <button
              onClick={() => onNavigate?.('discovery')}
              className="rounded-xl border px-6 py-3 text-sm font-semibold transition-colors hover:border-emerald-500/40"
              style={{ borderColor: 'var(--color-border)', background: 'var(--color-input-bg)', color: 'var(--color-text-main)' }}
            >
              Browse Listings
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
);

export default ServicesPage;
