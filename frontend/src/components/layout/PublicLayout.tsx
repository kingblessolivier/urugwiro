import React from 'react';
import { PublicHeader } from './PublicHeader';
import { PublicFooter } from './PublicFooter';
import { MobileTabBar } from './MobileTabBar';
import { AiChatWidget } from '../ai/AiChatWidget';
import { isAuthView, type AppView } from '../../types/navigation';
import { cn } from '../../lib/utils';

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
}) => {
  const isAuth = isAuthView(view);

  return (
    <div
      className="flex min-h-screen flex-col text-[var(--color-text-main)] font-sans antialiased selection:bg-emerald-500/30 w-full max-w-full overflow-x-hidden transition-colors duration-300"
      style={{ background: 'var(--color-bg-deep)' }}
    >
      <PublicHeader view={view} onNavigate={onNavigate} onSearch={onSearch} />
      <main className={cn("flex-1 w-full max-w-full overflow-x-hidden", !isAuth && "pb-20 md:pb-0")}>{children}</main>
      {showFooter && !isAuth ? <PublicFooter onNavigate={onNavigate} /> : null}
      {!isAuth && <MobileTabBar view={view} onNavigate={onNavigate} />}
      {!isAuth && <AiChatWidget />}
    </div>
  );
};
