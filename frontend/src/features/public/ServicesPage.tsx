import React from 'react';
import { Camera, CarFront, Gavel, HardHat, SearchCheck, Wrench } from 'lucide-react';
import { PageHero } from '../../components/layout/PageHero';
import { Button } from '../../components/ui/Button';
import type { AppView } from '../../types/navigation';

const services = [
  { title: 'Real estate agents', description: 'Help finding, presenting and negotiating property listings.', icon: HardHat },
  { title: 'Land surveyors', description: 'Professionals for land measurement and boundary-related work.', icon: SearchCheck },
  { title: 'Property valuers', description: 'Valuation support before buying, selling or financing an asset.', icon: Gavel },
  { title: 'Vehicle inspectors', description: 'Inspection workflows for a more informed vehicle decision.', icon: CarFront },
  { title: 'Property photographers', description: 'Clear, useful media for homes, land and vehicles.', icon: Camera },
  { title: 'Mechanics', description: 'Maintenance and support providers for vehicles.', icon: Wrench },
];

interface ServicesPageProps {
  onNavigate?: (view: AppView) => void;
}

const ServicesPage: React.FC<ServicesPageProps> = ({ onNavigate }) => (
  <div>
    <PageHero
      eyebrow="Services"
      title="The right expertise for the next step."
      description="Connect with providers who can help inspect, value, survey, photograph or manage an asset. Qualifications are shown only when they have been supplied."
    />

    <section className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {services.map(({ title, description, icon: Icon }) => (
          <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6">
            <Icon className="text-emerald-700" size={22} />
            <h2 className="mt-5 text-xl font-semibold">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
            <button
              type="button"
              onClick={() => onNavigate?.('discovery')}
              className="mt-6 text-sm font-medium text-emerald-700"
            >
              Explore listings
            </button>
          </article>
        ))}
      </div>

      <div className="mt-12 rounded-2xl bg-[#091a0f] px-6 py-10 text-white md:flex md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Need a specific service?</h2>
          <p className="mt-2 max-w-xl text-white/70">Describe the requirement and location. Provider matching will use real marketplace data as it becomes available.</p>
        </div>
        <Button className="mt-6 bg-white text-slate-900 hover:bg-slate-100 md:mt-0" onClick={() => onNavigate?.('contact')}>
          Request help
        </Button>
      </div>
    </section>
  </div>
);

export default ServicesPage;
