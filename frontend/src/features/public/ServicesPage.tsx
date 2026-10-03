import React from 'react';
import { ArrowRight, ClipboardCheck, Map, Ruler, Scale, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const SERVICE_GUIDES = [
  {
    title: 'Land Surveying',
    description: 'Confirm parcel boundaries, measurements, access, and any discrepancy before committing funds.',
    icon: Ruler,
    checks: ['Request a written scope and fee', 'Confirm professional credentials', 'Keep signed survey outputs'],
  },
  {
    title: 'Property Valuation',
    description: 'Use a qualified independent valuer when a formal opinion is needed for lending, tax, or negotiation.',
    icon: ClipboardCheck,
    checks: ['State the valuation purpose', 'Ask which comparables were used', 'Confirm the report date and assumptions'],
  },
  {
    title: 'Legal Review',
    description: 'Have ownership, encumbrances, contracts, and transfer requirements reviewed before signing.',
    icon: Scale,
    checks: ['Verify the professional independently', 'Review every contract clause', 'Keep payment and filing records'],
  },
];

const ServicesPage: React.FC = () => (
  <div className="min-h-screen bg-[var(--color-bg-deep)] text-[var(--color-text-main)]">
    <section className="border-b border-[var(--color-border)]">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--color-brand-emerald)]">
            <Map size={15} /> Transaction Support
          </div>
          <h1 className="text-3xl font-bold sm:text-4xl">Professional Services Guide</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--color-text-muted)]">
            Prepare for surveying, valuation, and legal review with a clear checklist. Provider credentials and work should always be verified independently before engagement.
          </p>
        </div>
      </div>
    </section>

    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {SERVICE_GUIDES.map(({ title, description, icon: Icon, checks }) => (
          <article key={title} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6">
            <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-500/25 bg-emerald-500/10 text-[var(--color-brand-emerald)]">
              <Icon size={20} />
            </div>
            <h2 className="text-lg font-bold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">{description}</p>
            <ul className="mt-5 space-y-3">
              {checks.map((check) => (
                <li key={check} className="flex items-start gap-2 text-sm text-[var(--color-text-muted)]">
                  <ShieldCheck size={15} className="mt-0.5 shrink-0 text-[var(--color-brand-emerald)]" />
                  <span>{check}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <div className="mt-8 flex flex-col items-start justify-between gap-5 border-t border-[var(--color-border)] py-8 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-bold">Need help defining the next step?</h2>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">Send the property type, location, and service you need to the Urugwiro team.</p>
        </div>
        <Link
          to="/contact?subject=Professional%20service%20request"
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-700"
        >
          Request Assistance <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  </div>
);

export default ServicesPage;
