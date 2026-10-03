import React from 'react';
import type { AppView } from '../../types/navigation';

interface PublicFooterProps {
  onNavigate: (view: AppView) => void;
}

export const PublicFooter: React.FC<PublicFooterProps> = ({ onNavigate }) => {
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
              A marketplace for property, land, vehicles, and structured transaction support in Rwanda.
            </p>
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
            </ul>
          </div>

          {/* Support */}
          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--color-text-dim)' }}>Support</h2>
            <p className="mt-5 text-sm leading-6" style={{ color: 'var(--color-text-muted)' }}>Send listing questions, service requests, or account issues through the contact form.</p>
            <button
              type="button"
              onClick={() => onNavigate('contact')}
              className="mt-4 rounded-lg border border-[var(--color-border)] px-4 py-2.5 text-sm font-semibold text-[var(--color-text-main)] transition-colors hover:border-emerald-500/40 hover:text-emerald-500"
            >
              Contact the team
            </button>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 pt-7 text-xs sm:flex-row sm:items-center sm:justify-between" style={{ borderTop: '1px solid var(--color-border)', color: 'var(--color-text-dim)' }}>
          <p>© 2026 Urugwiro.</p>
          <button type="button" onClick={() => onNavigate('contact')} className="hover:text-emerald-500">Contact</button>
        </div>
      </div>
    </footer>
  );
};
