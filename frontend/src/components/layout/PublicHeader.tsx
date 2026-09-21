import React, { useState } from 'react';
import { Menu, Search, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import type { AppView } from '../../types/navigation';

interface PublicHeaderProps {
  view: AppView;
  onNavigate: (view: AppView) => void;
  onSearch?: (query: string) => void;
}

const links: { label: string; view: AppView }[] = [
  { label: 'Explore', view: 'discovery' },
  { label: 'Services', view: 'services' },
  { label: 'Land information', view: 'land-information' },
  { label: 'About', view: 'about' },
  { label: 'Updates', view: 'updates' },
];

export const PublicHeader: React.FC<PublicHeaderProps> = ({ view, onNavigate, onSearch }) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    onSearch?.(query);
    onNavigate('discovery');
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 lg:px-8">
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="flex shrink-0 items-center gap-2"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-700 text-sm font-bold text-white">
            U
          </span>
          <span className="text-lg font-semibold tracking-tight text-slate-900">Urugwiro</span>
        </button>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <button
              key={link.view}
              type="button"
              onClick={() => onNavigate(link.view)}
              className={cn(
                'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                view === link.view
                  ? 'bg-emerald-50 text-emerald-800'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              {link.label}
            </button>
          ))}
        </nav>

        <form onSubmit={submitSearch} className="hidden min-w-0 flex-1 md:flex">
          <label className="flex w-full max-w-md items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 focus-within:border-emerald-600 focus-within:bg-white">
            <Search size={16} className="text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search Urugwiro..."
              className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
          </label>
        </form>

        <div className="ml-auto hidden items-center gap-2 md:flex">
          <Button variant="primary" onClick={() => onNavigate('seller-wizard')}>
            Sell / List
          </Button>
          <Button variant="secondary" onClick={() => onNavigate('login')}>
            Sign in
          </Button>
        </div>

        <button
          type="button"
          className="ml-auto rounded-lg p-2 text-slate-700 md:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          <form onSubmit={submitSearch} className="mb-4">
            <label className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2">
              <Search size={16} className="text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search Urugwiro..."
                className="w-full bg-transparent text-sm outline-none"
              />
            </label>
          </form>
          <div className="grid gap-1">
            {links.map((link) => (
              <button
                key={link.view}
                type="button"
                onClick={() => {
                  onNavigate(link.view);
                  setOpen(false);
                }}
                className="rounded-lg px-3 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {link.label}
              </button>
            ))}
          </div>
          <div className="mt-4 grid gap-2">
            <Button variant="primary" onClick={() => onNavigate('seller-wizard')}>
              Sell / List
            </Button>
            <Button variant="secondary" onClick={() => onNavigate('login')}>
              Sign in
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};
