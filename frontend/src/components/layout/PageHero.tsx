import React from 'react';

interface PageHeroProps {
  eyebrow: string;
  title: string;
  description: string;
}

export const PageHero: React.FC<PageHeroProps> = ({ eyebrow, title, description }) => (
  <section className="relative overflow-hidden border-b border-white/[0.06]">
    {/* Ambient glow */}
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute top-0 left-1/3 h-80 w-80 rounded-full bg-emerald-500/[0.04] blur-[100px]" />
      <div className="absolute bottom-0 right-1/4 h-60 w-60 rounded-full bg-emerald-500/[0.03] blur-[80px]" />
    </div>

    <div className="mx-auto max-w-7xl px-5 pt-32 pb-16 lg:px-8 lg:pt-40 lg:pb-20">
      <p className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/[0.06] px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">
        {eyebrow}
      </p>
      <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl leading-[1.1]">
        {title}
      </h1>
      <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-400 md:text-lg">
        {description}
      </p>
    </div>
  </section>
);
