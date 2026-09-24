import React from 'react';
import { Home, Compass, PlusCircle, Bell, User } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { AppView } from '../../types/navigation';

import { useAuth } from '../../context/AuthContext';

interface MobileTabBarProps {
  view: AppView;
  onNavigate: (view: AppView) => void;
}

export const MobileTabBar: React.FC<MobileTabBarProps> = ({ view, onNavigate }) => {
  const { user, isAuthenticated } = useAuth();

  const getAccountDestination = (): AppView => {
    if (!isAuthenticated || !user) return 'login';
    switch (user.role?.toLowerCase()) {
      case 'admin':
        return 'admin';
      case 'tenant':
        return 'tenant-dashboard';
      case 'buyer':
      case 'consumer':
      case 'client':
        return 'buyer-dashboard';
      case 'seller':
        return 'seller-dashboard';
      case 'agent':
        return 'agent-dashboard';
      case 'owner':
        return 'owner-dashboard';
      default:
        return 'buyer-dashboard';
    }
  };

  const accountDest = getAccountDestination();
  const accountLabel = isAuthenticated && user ? user.role : 'Account';

  const tabs: { label: string; view: AppView; icon: React.ReactNode }[] = [
    { label: 'Home', view: 'home', icon: <Home size={20} /> },
    { label: 'Explore', view: 'discovery', icon: <Compass size={20} /> },
    { label: 'Sell', view: 'submit-proposal', icon: <PlusCircle size={20} /> },
    { label: 'Updates', view: 'updates', icon: <Bell size={20} /> },
    { label: accountLabel, view: accountDest, icon: <User size={20} /> },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t backdrop-blur-2xl px-2 py-2 md:hidden transition-colors duration-300"
      style={{
        background: 'var(--color-header-bg)',
        borderTop: '1px solid var(--color-header-border)',
        boxShadow: 'var(--shadow-depth-2)',
      }}
    >
      <div className="grid grid-cols-5">
        {tabs.map((tab) => {
          const active = view === tab.view || (tab.view === 'login' && view === 'register');
          return (
            <button
              key={tab.label}
              type="button"
              onClick={() => onNavigate(tab.view)}
              className={cn(
                'flex flex-col items-center gap-1 rounded-xl py-1 text-[11px] font-medium transition-all cursor-pointer oneui-press',
                active ? 'text-emerald-500 font-bold scale-[1.03]' : 'hover:text-emerald-500'
              )}
              style={!active ? { color: 'var(--color-text-dim)' } : undefined}
            >
              {tab.icon}
              <span className="truncate max-w-[56px]">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
