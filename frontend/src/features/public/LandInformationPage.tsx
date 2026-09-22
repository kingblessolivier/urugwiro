import React from 'react';
import { FileCheck2, MapPinned, ShieldCheck, AlertTriangle, ArrowRight, BookOpen, Layers, CheckCircle2 } from 'lucide-react';
import { PageHero } from '../../components/layout/PageHero';
import type { AppView } from '../../types/navigation';
import { Button } from '../../components/ui/Button';

const legalSteps = [
  {
    step: '01',
    title: 'Unique Parcel Identifier (UPI) Validation',
    desc: 'Verify the parcel number against the Rwanda Land Management and Use Authority (RLMUA) cadastre database to ensure clean title, correct zoning, and true boundary coordinates.',
    keyDoc: 'Cadastral Extract & Master UPI'
  },
  {
    step: '02',
    title: 'Statutory Encumbrance & Caveat Audit',
    desc: 'Confirm zero mortgages, active court liens, estate expropriation notices, or family succession caveats registered against the title document.',
    keyDoc: 'Certificate of Clean Title (e-Title)'
  },
  {
    step: '03',
    title: 'Zoning & Master Plan Conformance',
    desc: 'Cross-check master plan zoning codes (e.g. R1A, C3, Industrial) to ensure your planned development or agricultural use is legally sanctioned by city authorities.',
    keyDoc: 'City Master Plan Zoning Card'
  },
  {
    step: '04',
    title: 'IremboGov Digital Notarization & Conveyance',
    desc: 'Execute formal bilateral transfer contracts before an authorized public notary via IremboGov, ensuring statutory duties (2.5% mutation/transfer) are accurately settled.',
    keyDoc: 'Authenticated Notarial Deed'
  },
];

interface LandInformationPageProps {
  onNavigate?: (view: AppView) => void;
}

const LandInformationPage: React.FC<LandInformationPageProps> = ({ onNavigate }) => (
  <div style={{ background: 'var(--color-bg-deep)', color: 'var(--color-text-main)' }} className="min-h-screen transition-colors duration-300">
    <PageHero
      eyebrow="Cadastral Knowledge"
      title="Sovereign Land Title & Cadastre Guide."
      description="Essential legal, regulatory, and cadastral guidance for safely acquiring and developing land parcels across Rwanda. Clear procedural clarity before capital deployment."
    />

    <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
      {/* Regulatory Notice */}
      <div
        className="mb-14 flex items-start gap-4 rounded-2xl border p-6 text-sm backdrop-blur-xl"
        style={{
          borderColor: 'rgba(245, 158, 11, 0.3)',
          background: 'rgba(245, 158, 11, 0.06)',
          color: 'var(--color-text-main)',
        }}
      >
        <AlertTriangle className="mt-0.5 shrink-0 text-amber-500" size={20} />
        <div>
          <p className="font-semibold text-amber-600 dark:text-amber-400">Regulatory Advisory & Compliance</p>
          <p className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
            All cadastral intelligence presented on Urugwiro is curated for educational and due diligence preparation. Official transfer of freehold or emphyteutic leasehold titles must be finalized before a certified public notary through official government channels (IremboGov / RLMUA).
          </p>
        </div>
      </div>

      {/* Cadastral Blueprint Steps */}
      <div className="mb-16">
        <div className="mb-8">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-500">Due Diligence Protocol</span>
          <h2 className="mt-2 text-2xl font-bold md:text-3xl" style={{ color: 'var(--color-text-main)' }}>The 4-Pillar Verification Roadmap</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {legalSteps.map((item) => (
            <article
              key={item.step}
              className="group rounded-2xl border p-8 transition-all duration-300 hover:border-emerald-500/40 oneui-card"
              style={{
                borderColor: 'var(--color-border)',
                background: 'var(--color-bg-card)',
                boxShadow: 'var(--shadow-depth-1)',
              }}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-bold text-emerald-500">{item.step}</span>
                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-300">
                  {item.keyDoc}
                </span>
              </div>
              <h3 className="mt-4 text-xl font-bold transition-colors group-hover:text-emerald-500" style={{ color: 'var(--color-text-main)' }}>
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                {item.desc}
              </p>
            </article>
          ))}
        </div>
      </div>

      {/* Actionable Safeguards */}
      <div
        className="grid gap-6 rounded-3xl border p-8 md:grid-cols-3 md:p-12 transition-colors duration-300"
        style={{
          borderColor: 'var(--color-border)',
          background: 'var(--color-bg-card)',
          boxShadow: 'var(--shadow-depth-2)',
        }}
      >
        <div className="space-y-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
            <MapPinned size={24} />
          </div>
          <h3 className="text-lg font-bold" style={{ color: 'var(--color-text-main)' }}>Coordinate Beacon Audit</h3>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
            Never purchase land solely based on verbal landmarks. Engage a licensed surveyor with RTK GPS equipment to confirm the physical survey beacons align with the RLMUA shapefile.
          </p>
        </div>

        <div className="space-y-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
            <FileCheck2 size={24} />
          </div>
          <h3 className="text-lg font-bold" style={{ color: 'var(--color-text-main)' }}>Titleholder Identity Matching</h3>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
            Ensure National ID details of the seller perfectly correspond to the owner name on the e-Title deed. If married under community of property, both spouses must provide formal consent.
          </p>
        </div>

        <div className="space-y-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
            <ShieldCheck size={24} />
          </div>
          <h3 className="text-lg font-bold" style={{ color: 'var(--color-text-main)' }}>Escrow-Shielded Settlement</h3>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
            Utilize Urugwiro's built-in escrow pipeline. Your deposit remains protected in trust until RLMUA title deed transfer confirmation is delivered.
          </p>
        </div>
      </div>

      {/* Bottom CTA */}
      <div
        className="mt-14 flex flex-col items-center justify-between gap-6 rounded-2xl border p-8 text-center sm:flex-row sm:text-left transition-colors duration-300"
        style={{
          borderColor: 'var(--color-border)',
          background: 'var(--color-bg-card)',
          boxShadow: 'var(--shadow-depth-1)',
        }}
      >
        <div>
          <h3 className="text-lg font-bold" style={{ color: 'var(--color-text-main)' }}>Ready to inspect verified land parcels?</h3>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-text-muted)' }}>Explore cataloged land listings with authentic UPI codes, GIS boundaries, and title status.</p>
        </div>
        <div className="flex gap-3">
          <Button
            className="rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20"
            onClick={() => onNavigate?.('discovery')}
          >
            Explore Land Listings <ArrowRight size={16} className="ml-2 inline" />
          </Button>
          <button
            onClick={() => onNavigate?.('services')}
            className="rounded-xl border px-5 py-3 text-sm font-semibold transition-colors hover:border-emerald-500/40"
            style={{
              borderColor: 'var(--color-border)',
              background: 'var(--color-input-bg)',
              color: 'var(--color-text-main)',
            }}
          >
            Find Surveyors
          </button>
        </div>
      </div>
    </section>
  </div>
);

export default LandInformationPage;
