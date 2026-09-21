import React, { useState } from 'react';
import type { AppView } from '../../types/navigation';

interface PublicFooterProps {
  onNavigate: (view: AppView) => void;
}

export const PublicFooter: React.FC<PublicFooterProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  return (
    <footer className="mt-auto border-t border-white/[0.06] bg-[#030508]">
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <button type="button" onClick={() => onNavigate('home')} className="flex items-center gap-2.5 group cursor-pointer">
              <img src="/urugwiro_logo_fav.png" alt="Urugwiro Logo" className="h-8 w-8 rounded-xl object-contain drop-shadow-md group-hover:scale-105 transition-transform" />
              <span className="text-xl font-bold font-display tracking-tight text-white">Urugwiro</span>
            </button>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-zinc-500">
              Rwanda's premier marketplace for property, land, and vehicles.
              Built on trust, verification, and transparent transactions.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {['Twitter', 'LinkedIn', 'Instagram'].map((name) => (
                <button
                  key={name}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-zinc-500 hover:text-white hover:border-white/20 transition-all text-xs font-bold"
                >
                  {name[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Marketplace Links */}
          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">Marketplace</h2>
            <ul className="mt-5 space-y-3">
              {[
                { label: 'Explore Properties', view: 'discovery' as AppView },
                { label: 'Professional Services', view: 'services' as AppView },
                { label: 'Sell With Us (Proposals)', view: 'submit-proposal' as AppView },
                { label: 'Land Information', view: 'land-information' as AppView },
              ].map((item) => (
                <li key={item.label}>
                  <button
                    type="button"
                    onClick={() => onNavigate(item.view)}
                    className="text-sm text-zinc-500 hover:text-emerald-400 transition-colors"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">Company</h2>
            <ul className="mt-5 space-y-3">
              {[
                { label: 'About Urugwiro', view: 'about' as AppView },
                { label: 'Updates & News', view: 'updates' as AppView },
                { label: 'Contact Us', view: 'contact' as AppView },
              ].map((item) => (
                <li key={item.label}>
                  <button
                    type="button"
                    onClick={() => onNavigate(item.view)}
                    className="text-sm text-zinc-500 hover:text-emerald-400 transition-colors"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
              <li><span className="text-sm text-zinc-600">Privacy Policy</span></li>
              <li><span className="text-sm text-zinc-600">Terms of Service</span></li>
            </ul>
          </div>

          {/* Newsletter & Contact */}
          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">Stay Updated</h2>
            <p className="mt-5 text-sm text-zinc-500">Get market insights and new listings delivered to your inbox.</p>
            <form
              className="mt-4 flex overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] focus-within:border-emerald-500/40 transition-colors"
              onSubmit={(e) => { e.preventDefault(); if (email.trim()) setSubscribed(true); }}
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="min-w-0 flex-1 bg-transparent px-4 py-2.5 text-sm text-white outline-none placeholder:text-zinc-600"
              />
              <button type="submit" className="bg-emerald-500 px-4 text-sm font-semibold text-white hover:bg-emerald-600 transition-colors">
                {subscribed ? '✓' : 'Join'}
              </button>
            </form>
            <div className="mt-6 space-y-2 text-sm text-zinc-500">
              <p>support@urugwiro.com</p>
              <p>+250 788 123 456</p>
              <p>Kigali Heights, Kigali, Rwanda</p>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-white/[0.06] pt-7 text-xs text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Urugwiro Ltd. All rights reserved.</p>
          <p>Privacy · Terms · Cookie Policy</p>
        </div>
      </div>
    </footer>
  );
};
