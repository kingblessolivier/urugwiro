import React from 'react';
import { PageHero } from '../../components/layout/PageHero';
import { Button } from '../../components/ui/Button';
import type { AppView } from '../../types/navigation';
import { Target, Eye, ShieldCheck, CheckCircle2, Lightbulb, Users, HeartHandshake, ArrowRight } from 'lucide-react';

interface AboutPageProps {
  onNavigate?: (view: AppView) => void;
}

const values = [
  { title: 'Integrity', text: 'Every listing, every transaction, and every interaction built on honesty and transparency.', icon: ShieldCheck },
  { title: 'Innovation', text: 'Pushing boundaries with AI-powered verification, valuation, and market intelligence tools.', icon: Lightbulb },
  { title: 'Customer Focus', text: 'We measure success by whether people can make better, more informed decisions.', icon: Target },
  { title: 'Collaboration', text: 'Working with owners, buyers, agents, and professionals as one unified marketplace.', icon: Users },
  { title: 'Excellence', text: 'Listing quality, media standards, and support held to the highest professional bar.', icon: CheckCircle2 },
  { title: 'Community', text: 'Built for Rwanda first, with the vision to expand across the African continent.', icon: HeartHandshake },
];

const milestones = [
  { year: '2020', title: 'Founded in Kigali', text: 'Urugwiro started from a need to bring clarity and trust to property management and discovery in Rwanda.' },
  { year: '2021', title: 'Platform Launch', text: 'First-generation listing tools and tenant management system went live on the digital platform.' },
  { year: '2022', title: 'Marketplace Expansion', text: 'Expanded beyond property management into a full marketplace covering land, vehicles, and services.' },
  { year: '2023', title: 'AI & Intelligence', text: 'Integrated NVIDIA-powered AI for valuations, document verification, and intelligent property matching.' },
  { year: '2024', title: 'Trust Infrastructure', text: 'Launched RLMUA cadastre verification, escrow protection, and the 6-stage legal conveyance pipeline.' },
];

const team = [
  { name: 'Elbost UZWINAYO', role: 'CEO & Founder', initials: 'EU' },
  { name: 'NSENGIMANA Olivier', role: 'CTO', initials: 'NO' },
  { name: 'GIHOZO Ismail', role: 'Head of Operations', initials: 'GI' },
];

const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => (
  <div style={{ background: 'var(--color-bg-deep)', color: 'var(--color-text-main)' }} className="transition-colors duration-300">
    <PageHero
      eyebrow="About"
      title="Building Rwanda's most trusted property marketplace."
      description="Urugwiro is where trust meets technology — a premium platform for discovering property, land, and vehicles with full transparency and verification."
    />

    {/* Mission & Vision */}
    <section className="mx-auto grid max-w-7xl gap-5 px-5 py-20 md:grid-cols-2 lg:px-8">
      {[
        { icon: Target, title: 'Our Mission', text: "To simplify property discovery and management across Rwanda, creating a high-trust experience for buyers, sellers, tenants, and professionals. We replace uncertainty with structured information and verified data." },
        { icon: Eye, title: 'Our Vision', text: "To become Africa's gold standard for verified asset transactions — where every property, land parcel, and vehicle listing is backed by authentic documentation and intelligent market insight." },
      ].map(({ icon: Icon, title, text }) => (
        <article key={title}
          className="rounded-2xl border p-8 transition-all hover:border-emerald-500/30 oneui-card"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)', boxShadow: 'var(--shadow-depth-2)' }}>
          <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
            <Icon size={24} />
          </div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-main)' }}>{title}</h2>
          <p className="mt-4 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{text}</p>
        </article>
      ))}
    </section>

    {/* Timeline */}
    <section className="transition-colors duration-300"
      style={{ background: 'var(--color-section-alt)', borderTop: '1px solid var(--color-section-alt-border)', borderBottom: '1px solid var(--color-section-alt-border)' }}>
      <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight mb-12" style={{ color: 'var(--color-text-main)' }}>Our Journey</h2>
        <div className="space-y-0">
          {milestones.map((item, i) => (
            <div key={item.year} className="relative flex gap-6">
              <div className="flex flex-col items-center">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-xs font-bold text-emerald-500">
                  {item.year.slice(2)}
                </div>
                {i < milestones.length - 1 && <div className="w-px flex-1 my-1" style={{ background: 'var(--color-border)' }} />}
              </div>
              <div className="pb-10">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-500">{item.year}</p>
                <h3 className="mt-1 text-lg font-bold" style={{ color: 'var(--color-text-main)' }}>{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed max-w-lg" style={{ color: 'var(--color-text-muted)' }}>{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Values */}
    <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
      <h2 className="text-3xl font-bold tracking-tight mb-12" style={{ color: 'var(--color-text-main)' }}>What We Stand For</h2>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {values.map((value) => (
          <article key={value.title}
            className="rounded-2xl border p-7 transition-all hover:border-emerald-500/25 group oneui-card"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)', boxShadow: 'var(--shadow-depth-1)' }}>
            <value.icon size={22} className="text-emerald-500 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold" style={{ color: 'var(--color-text-main)' }}>{value.title}</h3>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{value.text}</p>
          </article>
        ))}
      </div>
    </section>

    {/* Leadership */}
    <section style={{ borderTop: '1px solid var(--color-border)' }}>
      <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--color-text-main)' }}>Leadership</h2>
        <p className="mt-2" style={{ color: 'var(--color-text-muted)' }}>The team building Rwanda's property future.</p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {team.map((person) => (
            <article key={person.name}
              className="rounded-2xl border p-8 text-center transition-all hover:border-emerald-500/25 oneui-card"
              style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)', boxShadow: 'var(--shadow-depth-1)' }}>
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-lg font-bold text-emerald-500 border border-emerald-500/20">
                {person.initials}
              </div>
              <h3 className="mt-5 font-bold" style={{ color: 'var(--color-text-main)' }}>{person.name}</h3>
              <p className="mt-1 text-sm text-emerald-500">{person.role}</p>
            </article>
          ))}
        </div>

        {/* Join CTA */}
        <div className="mt-16 rounded-2xl border px-8 py-12 text-center transition-colors duration-300"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)', boxShadow: 'var(--shadow-depth-2)' }}>
          <h3 className="text-2xl font-bold" style={{ color: 'var(--color-text-main)' }}>Join us on the journey</h3>
          <p className="mx-auto mt-3 max-w-lg" style={{ color: 'var(--color-text-muted)' }}>
            Whether you want to list, discover, or build with Urugwiro — we'd love to hear from you.
          </p>
          <Button
            className="mt-8 rounded-xl px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-500/20"
            onClick={() => onNavigate?.('contact')}
          >
            Get in Touch <ArrowRight size={16} className="ml-2 inline" />
          </Button>
        </div>
      </div>
    </section>
  </div>
);

export default AboutPage;
