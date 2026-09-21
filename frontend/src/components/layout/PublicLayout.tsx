import React from 'react';
import { PublicHeader } from './PublicHeader';
import { PublicFooter } from './PublicFooter';
import { MobileTabBar } from './MobileTabBar';
import type { AppView } from '../../types/navigation';

interface PublicLayoutProps {
  view: AppView;
  onNavigate: (view: AppView) => void;
  onSearch?: (query: string) => void;
  children: React.ReactNode;
  showFooter?: boolean;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({
  view,
  onNavigate,
  onSearch,
  children,
  showFooter = true,
}) => (
  <div className="flex min-h-screen flex-col bg-[#f9fafb] text-slate-900">
    <PublicHeader view={view} onNavigate={onNavigate} onSearch={onSearch} />
    <main className="flex-1 pb-20 md:pb-0">{children}</main>
    {showFooter ? <PublicFooter onNavigate={onNavigate} /> : null}
    <MobileTabBar view={view} onNavigate={onNavigate} />
  </div>
);
