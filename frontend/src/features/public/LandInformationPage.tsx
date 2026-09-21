import React from 'react';
import { FileCheck2, MapPinned, ShieldCheck } from 'lucide-react';
import { PageHero } from '../../components/layout/PageHero';
import type { AppView } from '../../types/navigation';
import { Button } from '../../components/ui/Button';

const topics = [
  ['Buying land', 'Questions to ask about location, access, intended use and documentation before making an offer.'],
  ['Ownership and registration', 'Understand the difference between educational guidance, seller-provided information and official records.'],
  ['Land use and transfer', 'Explore the steps and professionals commonly involved in a land transaction.'],
  ['Professional services', 'Find surveyors, valuers, legal professionals and other providers who can support your decision.'],
];

interface LandInformationPageProps {
  onNavigate?: (view: AppView) => void;
}

const LandInformationPage: React.FC<LandInformationPageProps> = ({ onNavigate }) => (
  <div>
    <PageHero
      eyebrow="Land information"
      title="Understand land before you act."
      description="Educational guidance on ownership, registration, transactions and related services. This is not legal advice or official certification."
    />

    <section className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-950">
        Urugwiro content is educational. For legal or ownership decisions, consult the relevant official authority or a qualified professional.
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {topics.map(([title, description], index) => (
          <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-xs font-semibold text-emerald-700">0{index + 1}</p>
            <h2 className="mt-2 text-xl font-semibold">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
          </article>
        ))}
      </div>

      <section className="mt-12 grid gap-6 rounded-2xl border border-slate-200 bg-white p-6 md:grid-cols-3 md:p-10">
        {[
          { icon: MapPinned, title: 'Confirm the location', desc: 'Review access, nearby landmarks and the approximate location shown on the listing.' },
          { icon: FileCheck2, title: 'Ask about documentation', desc: 'Submitted documents are not the same as official confirmation.' },
          { icon: ShieldCheck, title: 'Use qualified professionals', desc: 'Surveyors, valuers and legal professionals can support a high-stakes decision.' },
        ].map((item) => (
          <article key={item.title}>
            <item.icon className="text-emerald-700" size={22} />
            <h3 className="mt-4 font-semibold">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.desc}</p>
          </article>
        ))}
      </section>

      <div className="mt-10">
        <Button variant="secondary" onClick={() => onNavigate?.('services')}>
          Browse related services
        </Button>
      </div>
    </section>
  </div>
);

export default LandInformationPage;
