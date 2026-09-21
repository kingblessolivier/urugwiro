import React from 'react';
import { Home, Compass, PlusCircle, Bell, User } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { AppView } from '../../types/navigation';

interface MobileTabBarProps {
  view: AppView;
  onNavigate: (view: AppView) => void;
}

const tabs: { label: string; view: AppView; icon: React.ReactNode }[] = [
  { label: 'Home', view: 'home', icon: <Home size={20} /> },
  { label: 'Explore', view: 'discovery', icon: <Compass size={20} /> },
  { label: 'Sell', view: 'seller-wizard', icon: <PlusCircle size={20} /> },
  { label: 'Updates', view: 'updates', icon: <Bell size={20} /> },
  { label: 'Account', view: 'login', icon: <User size={20} /> },
];

export const MobileTabBar: React.FC<MobileTabBarProps> = ({ view, onNavigate }) => (
  <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white px-2 py-2 md:hidden">
    <div className="grid grid-cols-5">
      {tabs.map((tab) => {
        const active = view === tab.view || (tab.view === 'login' && view === 'register');
        return (
          <button
            key={tab.label}
            type="button"
            onClick={() => onNavigate(tab.view)}
            className={cn(
              'flex flex-col items-center gap-1 rounded-lg py-1 text-[11px] font-medium',
              active ? 'text-emerald-700' : 'text-slate-500'
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        );
      })}
    </div>
  </nav>
);
