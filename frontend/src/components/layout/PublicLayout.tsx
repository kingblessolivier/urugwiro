import React from 'react';
import { PublicHeader } from './PublicHeader';
import { PublicFooter } from './PublicFooter';
import { MobileTabBar } from './MobileTabBar';
import { AiChatWidget } from '../ai/AiChatWidget';
import { PwaInstallPrompt } from '../PwaInstallPrompt';
import { WhatsAppButton } from '../whatsapp/WhatsAppButton';
import { LiveChatSupport } from '../livechat/LiveChatSupport';
import { BannerNotifications } from '../notifications/BannerNotifications';
import { OnboardingTour } from '../onboarding/OnboardingTour';
import { isAuthView, type AppView } from '../../types/navigation';
import { cn } from '../../lib/utils';

/* ────────────────────────────────────────────────────────────────
   CRASH BARRIER — on any child error, silently renders null.
   React class ErrorBoundary required (no hook equivalent exists).
   Prevents any tour/layout subcomponent crash from a full white-screen.
   ──────────────────────────────────────────────────────────────── */
interface ErrorSwallowState { hasError: boolean; }
class OnboardingTourErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorSwallowState> {
  declare state: ErrorSwallowState;
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(): ErrorSwallowState {
    return { hasError: true };
  }
  componentDidCatch(error: unknown, info: unknown): void {
    try {
      // eslint-disable-next-line no-console
      console.warn('[OnboardingTourErrorBoundary] suppressed non-fatal error to prevent white-screen —', error, info);
    } catch { /* noop */ }
  }
  render(): React.ReactNode {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

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
      className="flex min-h-screen flex-col text-[var(--color-text-main)] font-sans antialiased selection:bg-emerald-500/30 w-full max-w-full overflow-x-clip transition-colors duration-300"
      style={{ background: 'var(--color-bg-deep)' }}
    >
      {/* Skip Navigation — accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[9999] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-[var(--color-brand-emerald)] focus:text-white focus:text-sm focus:font-bold"
      >
        Skip to main content
      </a>
      <PublicHeader view={view} onNavigate={onNavigate} onSearch={onSearch} />
      {/* Fixed Header Spacer to prevent content jump and overlap */}
      <div className="h-16 sm:h-18 w-full shrink-0" aria-hidden="true" />
      <BannerNotifications />
      <main id="main-content" className={cn("flex-1 w-full max-w-full overflow-x-clip", !isAuth && "pb-20 md:pb-0")} tabIndex={-1}>{children}</main>
      {showFooter && !isAuth ? <PublicFooter onNavigate={onNavigate} /> : null}
      {!isAuth && <MobileTabBar view={view} onNavigate={onNavigate} />}
      {!isAuth && <AiChatWidget />}
      {!isAuth && <PwaInstallPrompt />}
      {!isAuth && <WhatsAppButton />}
      {!isAuth && <LiveChatSupport />}
      {!isAuth && (
        <OnboardingTourErrorBoundary>
          <OnboardingTour onNavigate={onNavigate} />
        </OnboardingTourErrorBoundary>
      )}
    </div>
  );
};
