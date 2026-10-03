import React, { useMemo, useState } from 'react';
import {
  ArrowLeft, BookOpen, Building2, CircleDollarSign, ExternalLink,
  FileCheck2, Landmark, Map, Scale, Search, ShieldCheck,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface Guide {
  id: string;
  title: string;
  category: string;
  summary: string;
  checks: string[];
  source: string;
  sourceUrl: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const GUIDES: Guide[] = [
  {
    id: 'verify-parcel-records',
    title: 'Verify the parcel and registered owner',
    category: 'Title & Records',
    summary: 'Start with the official land record and the parcel UPI before relying on a listing, copy of a title, or verbal representation.',
    checks: [
      'Confirm the parcel UPI through an official land service.',
      'Check that the registered owner matches the seller or authorized representative.',
      'Resolve caveats, mortgages, boundary issues, and identity mismatches before payment.',
    ],
    source: 'National Land Authority land information portal',
    sourceUrl: 'https://landinformation.lands.rw/',
    icon: FileCheck2,
  },
  {
    id: 'title-transfer',
    title: 'Use the official title-transfer process',
    category: 'Transfer',
    summary: 'Voluntary-sale title transfers are submitted through IremboGov and handled by the National Land Authority.',
    checks: [
      'Review the current Irembo requirements before the parties sign or pay.',
      'Ensure the land has no outstanding tax obligations blocking transfer.',
      'Use the sector land manager or a qualified private notary offered in the official process.',
    ],
    source: 'IremboGov voluntary-sale title transfer guide',
    sourceUrl: 'https://support.irembo.gov.rw/en/support/solutions/articles/47001210595-how-to-apply-for-title-transfer-voluntary-sale-update',
    icon: Landmark,
  },
  {
    id: 'land-use',
    title: 'Confirm permitted land use',
    category: 'Land Use',
    summary: 'A parcel title does not by itself confirm that a planned home, business, subdivision, or development is permitted.',
    checks: [
      'Check the intended use against the current national and local land-use plans.',
      'Confirm access, infrastructure constraints, and required development approvals.',
      'Obtain professional planning advice for a project before committing funds.',
    ],
    source: 'National Land Authority land transactions guidance',
    sourceUrl: 'https://www.lands.rw/land-transactions',
    icon: Map,
  },
  {
    id: 'property-tax',
    title: 'Check tax status and current rates',
    category: 'Taxes',
    summary: 'Immovable-property tax depends on the property type, use, value, location, and applicable exemptions; a single percentage does not describe every property.',
    checks: [
      'Confirm outstanding obligations before starting a transfer.',
      'Use the current RRA guidance and applicable district or City of Kigali rate.',
      'Ask a qualified tax professional to review unusual ownership or use cases.',
    ],
    source: 'Rwanda Revenue Authority immovable-property tax guidance',
    sourceUrl: 'https://www.rra.gov.rw/en/domestic-tax-services/local-government-taxes/default-title',
    icon: CircleDollarSign,
  },
  {
    id: 'boundaries',
    title: 'Inspect boundaries and site conditions',
    category: 'Title & Records',
    summary: 'The physical site, occupied boundaries, access, and registered parcel information should agree before a transaction proceeds.',
    checks: [
      'Visit the parcel and compare visible boundaries with official records.',
      'Use a qualified surveyor when boundaries or measurements are uncertain.',
      'Document access, neighboring claims, structures, and material discrepancies.',
    ],
    source: 'National Land Authority',
    sourceUrl: 'https://www.lands.rw/',
    icon: Building2,
  },
  {
    id: 'disputes',
    title: 'Escalate disputes through official channels',
    category: 'Disputes',
    summary: 'Do not try to solve ownership, inheritance, caveat, or boundary disputes only through informal assurances from transaction parties.',
    checks: [
      'Preserve title records, contracts, payment evidence, and communications.',
      'Use official land-dispute services and obtain independent legal advice.',
      'Pause payment or transfer activity until the relevant issue is resolved.',
    ],
    source: 'National Land Authority land information portal',
    sourceUrl: 'https://landinformation.lands.rw/',
    icon: Scale,
  },
];

const CATEGORIES = ['All', 'Title & Records', 'Transfer', 'Land Use', 'Taxes', 'Disputes'];

const LandInfoPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);

  const filteredGuides = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return GUIDES.filter((guide) => {
      const matchesCategory = selectedCategory === 'All' || guide.category === selectedCategory;
      const matchesSearch = !query || [guide.title, guide.summary, ...guide.checks]
        .some((value) => value.toLowerCase().includes(query));
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  if (selectedGuide) {
    const Icon = selectedGuide.icon;
    return (
      <div className="min-h-screen bg-[var(--color-bg-deep)] text-[var(--color-text-main)]">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
          <button type="button" onClick={() => setSelectedGuide(null)} className="mb-8 flex items-center gap-2 text-sm font-medium text-[var(--color-text-muted)] transition hover:text-[var(--color-text-main)]">
            <ArrowLeft size={16} /> Back to land guidance
          </button>
          <article>
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg border border-emerald-500/25 bg-emerald-500/10 text-[var(--color-brand-emerald)]">
              <Icon size={21} />
            </div>
            <p className="text-xs font-bold uppercase text-[var(--color-brand-emerald)]">{selectedGuide.category}</p>
            <h1 className="mt-2 text-3xl font-bold">{selectedGuide.title}</h1>
            <p className="mt-4 text-base leading-7 text-[var(--color-text-muted)]">{selectedGuide.summary}</p>
            <h2 className="mt-8 text-lg font-bold">Due-diligence checklist</h2>
            <ul className="mt-4 space-y-3">
              {selectedGuide.checks.map((check) => (
                <li key={check} className="flex items-start gap-3 text-sm leading-6 text-[var(--color-text-muted)]">
                  <ShieldCheck size={17} className="mt-1 shrink-0 text-[var(--color-brand-emerald)]" />
                  <span>{check}</span>
                </li>
              ))}
            </ul>
            <a href={selectedGuide.sourceUrl} target="_blank" rel="noreferrer" className="mt-8 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700">
              Open official source <ExternalLink size={15} />
            </a>
            <p className="mt-3 text-xs text-[var(--color-text-dim)]">Source: {selectedGuide.source}</p>
          </article>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-deep)] text-[var(--color-text-main)]">
      <section className="border-b border-[var(--color-border)]">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="max-w-3xl">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg border border-emerald-500/25 bg-emerald-500/10 text-[var(--color-brand-emerald)]">
              <BookOpen size={22} />
            </div>
            <h1 className="text-3xl font-bold sm:text-4xl">Rwanda Land Due Diligence</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--color-text-muted)]">
              Practical checks for land records, transfer, permitted use, tax, boundaries, and disputes, with links to the responsible public authorities.
            </p>
            <p className="mt-3 text-xs text-[var(--color-text-dim)]">Official sources reviewed 3 October 2026. This is general information, not legal or tax advice.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="relative mb-5 max-w-2xl">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-dim)]" />
          <input type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search land guidance" className="h-11 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] pl-10 pr-3 text-sm text-[var(--color-text-main)] outline-none focus:border-emerald-500" />
        </div>

        <div className="mb-8 flex flex-wrap gap-2" aria-label="Guide categories">
          {CATEGORIES.map((category) => (
            <button key={category} type="button" onClick={() => setSelectedCategory(category)} className={cn(
              'rounded-lg border px-3 py-2 text-xs font-semibold transition',
              selectedCategory === category
                ? 'border-emerald-600 bg-emerald-600 text-white'
                : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-emerald-500/50 hover:text-[var(--color-text-main)]',
            )}>{category}</button>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredGuides.map((guide) => {
            const Icon = guide.icon;
            return (
              <button key={guide.id} type="button" onClick={() => setSelectedGuide(guide)} className="group min-h-56 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5 text-left transition hover:border-emerald-500/40">
                <div className="flex items-start justify-between gap-4">
                  <Icon size={20} className="text-[var(--color-brand-emerald)]" />
                  <span className="text-xs font-semibold text-[var(--color-text-dim)]">{guide.category}</span>
                </div>
                <h2 className="mt-5 text-lg font-bold">{guide.title}</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">{guide.summary}</p>
                <span className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-brand-emerald)]">Review checklist <ExternalLink size={13} className="transition group-hover:translate-x-0.5" /></span>
              </button>
            );
          })}
        </div>

        {filteredGuides.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-sm text-[var(--color-text-muted)]">No guidance matches this search.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default LandInfoPage;
