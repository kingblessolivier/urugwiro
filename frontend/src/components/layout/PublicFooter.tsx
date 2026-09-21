import React, { useState } from 'react';
import type { AppView } from '../../types/navigation';

interface PublicFooterProps {
  onNavigate: (view: AppView) => void;
}

export const PublicFooter: React.FC<PublicFooterProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  return (
    <footer className="mt-auto bg-[#091a0f] text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <button type="button" onClick={() => onNavigate('home')} className="text-lg font-semibold">
              Urugwiro
            </button>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/60">
              A marketplace for property, land, vehicles and related services in Rwanda — built to help people understand what they are considering.
            </p>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-white/40">Marketplace</h2>
            <ul className="mt-4 space-y-2 text-sm text-white/70">
              <li><button type="button" onClick={() => onNavigate('discovery')}>Explore listings</button></li>
              <li><button type="button" onClick={() => onNavigate('services')}>Services</button></li>
              <li><button type="button" onClick={() => onNavigate('seller-wizard')}>List on Urugwiro</button></li>
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-white/40">Company</h2>
            <ul className="mt-4 space-y-2 text-sm text-white/70">
              <li><button type="button" onClick={() => onNavigate('about')}>About</button></li>
              <li><button type="button" onClick={() => onNavigate('updates')}>Updates</button></li>
              <li><button type="button" onClick={() => onNavigate('land-information')}>Land information</button></li>
              <li><button type="button" onClick={() => onNavigate('contact')}>Contact</button></li>
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-white/40">Contact</h2>
            <ul className="mt-4 space-y-2 text-sm text-white/70">
              <li><a href="mailto:support@urugwiro.com">support@urugwiro.com</a></li>
              <li><a href="tel:+250788123456">+250 788 123 456</a></li>
              <li>KG 123 St, Kigali Heights<br />Kigali, Rwanda</li>
              <li>Mon–Fri 9:00–18:00 · Sat 10:00–14:00</li>
            </ul>
            <form
              className="mt-4 flex overflow-hidden rounded-full border border-white/15"
              onSubmit={(event) => {
                event.preventDefault();
                if (email.trim()) setSubscribed(true);
              }}
            >
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Your email"
                className="min-w-0 flex-1 bg-transparent px-4 py-2 text-sm text-white outline-none placeholder:text-white/35"
              />
              <button type="submit" className="bg-emerald-700 px-4 text-sm font-semibold">
                {subscribed ? 'Saved' : 'Subscribe'}
              </button>
            </form>
            <p className="mt-2 text-xs text-white/35">Newsletter signup is stored locally until a backend endpoint is connected.</p>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Urugwiro Ltd. All rights reserved.</p>
          <p>Privacy · Terms · Cookie policy</p>
        </div>
      </div>
    </footer>
  );
};
