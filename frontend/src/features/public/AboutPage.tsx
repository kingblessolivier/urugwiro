import React from 'react';
import { PageHero } from '../../components/layout/PageHero';
import { Button } from '../../components/ui/Button';
import type { AppView } from '../../types/navigation';
import { Target, Eye, ShieldCheck, CheckCircle2, Lightbulb, Users, HeartHandshake, ArrowRight } from 'lucide-react';

interface AboutPageProps {
  onNavigate?: (view: AppView) => void;
}

const values = [
  { title: 'Integrity', text: 'Designing marketplace records and workflows around clear ownership, review, and accountability.', icon: ShieldCheck },
  { title: 'Useful Technology', text: 'Building practical search, document review, comparable pricing, and market reporting tools.', icon: Lightbulb },
  { title: 'Customer Focus', text: 'We measure success by whether people can make better, more informed decisions.', icon: Target },
  { title: 'Collaboration', text: 'Working with owners, buyers, agents, and professionals as one unified marketplace.', icon: Users },
  { title: 'Quality', text: 'Improving listing information, media, and operational support through consistent standards.', icon: CheckCircle2 },
  { title: 'Community', text: 'Built for Rwanda first, with the vision to expand across the African continent.', icon: HeartHandshake },
];

const team = [
  { name: 'Elbost UZWINAYO', role: 'CEO & Founder', initials: 'EU' },
  { name: 'NSENGIMANA Olivier', role: 'CTO', initials: 'NO' },
  { name: 'GIHOZO Ismail', role: 'Head of Operations', initials: 'GI' },
];

const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => (
  <div style={{ background: 'var(--color-bg-deep)', color: 'var(--color-text-main)' }} className="transition-colors duration-300">
    <PageHero
      eyebrow="About the platform"
      title="Urugwiro"
      description="A Rwanda-focused marketplace for discovering property and other assets, supported by structured information and practical transaction workflows."
    />

    {/* Mission & Vision */}
    <section className="mx-auto grid max-w-7xl gap-5 px-5 py-20 md:grid-cols-2 lg:px-8">
      {[
        { icon: Target, title: 'Our Mission', text: 'To make asset discovery and marketplace operations clearer for buyers, sellers, tenants, and professionals across Rwanda.' },
        { icon: Eye, title: 'Our Vision', text: 'To build dependable tools for informed asset decisions, careful document review, and efficient transaction coordination.' },
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
