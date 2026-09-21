import React from 'react';

interface PageHeroProps {
  eyebrow: string;
  title: string;
  description: string;
}

export const PageHero: React.FC<PageHeroProps> = ({ eyebrow, title, description }) => (
  <section className="border-b border-slate-200 bg-white">
    <div className="mx-auto max-w-7xl px-4 py-14 lg:px-8 lg:py-20">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">{eyebrow}</p>
      <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">{title}</h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg">{description}</p>
    </div>
  </section>
);
