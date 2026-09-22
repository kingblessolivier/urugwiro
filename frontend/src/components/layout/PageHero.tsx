import React from 'react';

interface PageHeroProps {
  eyebrow: string;
  title: string;
  description: string;
}

export const PageHero: React.FC<PageHeroProps> = ({ eyebrow, title, description }) => (
  <section className="relative overflow-hidden transition-colors duration-300"
    style={{ borderBottom: '1px solid var(--color-border)' }}>
    {/* Ambient glow */}
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute top-0 left-1/3 h-80 w-80 rounded-full bg-emerald-500/[0.06] blur-[110px]" />
      <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-[#f98604]/[0.05] blur-[100px]" />
    </div>

    <div className="mx-auto max-w-7xl px-5 pt-32 pb-16 lg:px-8 lg:pt-40 lg:pb-20">
      <p className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/[0.07] px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500">
        {eyebrow}
      </p>
      <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl leading-[1.1]"
        style={{ color: 'var(--color-text-main)' }}>
        {title}
      </h1>
      <p className="mt-5 max-w-2xl text-base leading-relaxed md:text-lg"
        style={{ color: 'var(--color-text-muted)' }}>
        {description}
      </p>
    </div>
  </section>
);
