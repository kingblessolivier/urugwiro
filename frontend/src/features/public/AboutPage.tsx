import React from 'react';
import { PageHero } from '../../components/layout/PageHero';
import { Button } from '../../components/ui/Button';
import type { AppView } from '../../types/navigation';

interface AboutPageProps {
  onNavigate?: (view: AppView) => void;
}

const values = [
  { title: 'Integrity', text: 'Operate with honesty and transparency in every interaction.' },
  { title: 'Innovation', text: 'Improve the platform with practical tools, not decorative claims.' },
  { title: 'Customer focus', text: 'Measure success by whether people can make a better decision.' },
  { title: 'Collaboration', text: 'Work with owners, buyers, agents and professionals as one marketplace.' },
  { title: 'Excellence', text: 'Keep listing information, media and support to a high standard.' },
  { title: 'Community', text: 'Build for Rwanda first, with room to grow across Africa.' },
];

const milestones = [
  { year: '2020', title: 'Company founded', text: 'Urugwiro started from a need to make property management and discovery clearer in Rwanda.' },
  { year: '2021', title: 'Platform launch', text: 'Launched listing and tenant-management tools on the first digital platform.' },
  { year: '2022', title: 'Marketplace growth', text: 'Expanded beyond management into a wider property marketplace.' },
  { year: '2023', title: 'Richer tools', text: 'Added communication, payments and market-insight features for operators.' },
];

const team = [
  { name: 'Elbost UZWINAYO', role: 'CEO & Founder' },
  { name: 'NSENGIMANA Olivier', role: 'CTO' },
  { name: 'GIHOZO Ismail', role: 'Head of Operations' },
];

const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => (
  <div>
    <PageHero
      eyebrow="About"
      title="Who we are"
      description="Urugwiro is a user-friendly platform for discovering property, land and vehicles, and for managing real-estate operations with more transparency."
    />

    <section className="mx-auto grid max-w-7xl gap-6 px-4 py-16 md:grid-cols-2 lg:px-8">
      <article className="rounded-2xl border border-slate-200 bg-white p-8">
        <h2 className="text-2xl font-semibold">Our mission</h2>
        <p className="mt-4 leading-relaxed text-slate-600">
          To simplify property discovery and management, and create a clearer experience for buyers, sellers, tenants and professionals. We focus on trust, structured information and practical tools.
        </p>
      </article>
      <article className="rounded-2xl border border-slate-200 bg-white p-8">
        <h2 className="text-2xl font-semibold">Our history</h2>
        <p className="mt-4 leading-relaxed text-slate-600">
          Founded in 2020, Urugwiro was created to close the gap between property work and technology. The founding team built the first tools around the real challenges owners and tenants faced.
        </p>
      </article>
    </section>

    <section className="border-y border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <h2 className="text-3xl font-semibold tracking-tight">Key milestones</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {milestones.map((item) => (
            <article key={item.year} className="rounded-2xl border border-slate-200 p-6">
              <p className="text-sm font-semibold text-emerald-700">{item.year}</p>
              <h3 className="mt-2 text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
      <h2 className="text-3xl font-semibold tracking-tight">What we stand for</h2>
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {values.map((value) => (
          <article key={value.title} className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="font-semibold">{value.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{value.text}</p>
          </article>
        ))}
      </div>
    </section>

    <section className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <h2 className="text-3xl font-semibold tracking-tight">Leadership</h2>
        <p className="mt-2 text-slate-600">The people currently listed as leading the company.</p>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {team.map((person) => (
            <article key={person.name} className="rounded-2xl border border-slate-200 p-6 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-lg font-semibold text-emerald-800">
                {person.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}
              </div>
              <h3 className="mt-4 font-semibold">{person.name}</h3>
              <p className="text-sm text-emerald-700">{person.role}</p>
            </article>
          ))}
        </div>
        <div className="mt-12 rounded-2xl bg-slate-50 px-6 py-10 text-center">
          <h3 className="text-2xl font-semibold">Join us on the journey</h3>
          <p className="mx-auto mt-2 max-w-lg text-slate-600">If you want to list, discover or work with Urugwiro, start a conversation.</p>
          <Button className="mt-6" onClick={() => onNavigate?.('contact')}>
            Contact us
          </Button>
        </div>
      </div>
    </section>
  </div>
);

export default AboutPage;
