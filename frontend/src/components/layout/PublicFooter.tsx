import React, { useState } from 'react';
import type { AppView } from '../../types/navigation';

interface PublicFooterProps {
  onNavigate: (view: AppView) => void;
}

export const PublicFooter: React.FC<PublicFooterProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  return (
    <footer
      className="mt-auto transition-colors duration-300"
      style={{
        background: 'var(--color-bg-surface)',
        borderTop: '1px solid var(--color-border)',
        color: 'var(--color-text-main)',
      }}
    >
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <button type="button" onClick={() => onNavigate('home')} className="flex items-center gap-2.5 group cursor-pointer">
              <img src="/urugwiro_logo_fav.png" alt="Urugwiro Logo" className="h-8 w-8 rounded-xl object-contain drop-shadow-md group-hover:scale-105 transition-transform" />
              <span className="text-xl font-bold font-display tracking-tight" style={{ color: 'var(--color-text-main)' }}>Urugwiro</span>
            </button>
            <p className="mt-4 max-w-xs text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
              Rwanda's premier marketplace for property, land, and vehicles.
              Built on trust, verification, and transparent transactions.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {['Twitter', 'LinkedIn', 'Instagram'].map((name) => (
                <button
                  key={name}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border text-xs font-bold transition-all oneui-press cursor-pointer hover:border-emerald-500/40 hover:text-emerald-500"
                  style={{
                    borderColor: 'var(--color-border)',
                    background: 'var(--color-bg-card)',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  {name[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Marketplace Links */}
          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--color-text-dim)' }}>Marketplace</h2>
            <ul className="mt-5 space-y-3">
              {[
                { label: 'Explore Properties', view: 'discovery' as AppView },
                { label: 'Sell or Rent With Us', view: 'submit-proposal' as AppView },
              ].map((item) => (
                <li key={item.label}>
                  <button
                    type="button"
                    onClick={() => onNavigate(item.view)}
                    className="text-sm transition-colors hover:text-emerald-500 cursor-pointer text-left"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--color-text-dim)' }}>Company</h2>
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
                    className="text-sm transition-colors hover:text-emerald-500 cursor-pointer text-left"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
              <li><span className="text-sm" style={{ color: 'var(--color-text-dim)' }}>Privacy Policy</span></li>
              <li><span className="text-sm" style={{ color: 'var(--color-text-dim)' }}>Terms of Service</span></li>
            </ul>
          </div>

          {/* Newsletter & Contact */}
          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--color-text-dim)' }}>Stay Updated</h2>
            <p className="mt-5 text-sm" style={{ color: 'var(--color-text-muted)' }}>Get market insights and new listings delivered to your inbox.</p>
            <form
              className="mt-4 flex overflow-hidden rounded-xl border focus-within:border-emerald-500/40 transition-colors"
              style={{
                borderColor: 'var(--color-border)',
                background: 'var(--color-input-bg)',
              }}
              onSubmit={(e) => { e.preventDefault(); if (email.trim()) setSubscribed(true); }}
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="min-w-0 flex-1 bg-transparent px-4 py-2.5 text-sm outline-none"
                style={{ color: 'var(--color-text-main)' }}
              />
              <button type="submit" className="bg-emerald-500 px-4 text-sm font-semibold text-white hover:bg-emerald-600 transition-colors cursor-pointer">
                {subscribed ? '✓' : 'Join'}
              </button>
            </form>
            <div className="mt-6 space-y-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
              <p>support@urugwiro.com</p>
              <p>+250 788 123 456</p>
              <p>Kigali Heights, Kigali, Rwanda</p>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 pt-7 text-xs sm:flex-row sm:items-center sm:justify-between" style={{ borderTop: '1px solid var(--color-border)', color: 'var(--color-text-dim)' }}>
          <p>© 2026 Urugwiro Ltd. All rights reserved.</p>
          <p>Privacy · Terms · Cookie Policy</p>
        </div>
      </div>
    </footer>
  );
};
