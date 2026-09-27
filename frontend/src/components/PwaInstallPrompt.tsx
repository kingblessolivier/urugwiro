import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from './ui/Button';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PwaInstallPrompt: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [dismissed, setDismissed] = useState(() => {
        try { return localStorage.getItem('urugwiro_pwa_dismissed') === 'true'; } catch { return false; }
    });

    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            if (!dismissed) {
                // Show after 30 seconds
                setTimeout(() => setShowPrompt(true), 30000);
            }
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, [dismissed]);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setShowPrompt(false);
            setDeferredPrompt(null);
        }
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        setDismissed(true);
        try { localStorage.setItem('urugwiro_pwa_dismissed', 'true'); } catch {}
    };

    if (!showPrompt || !deferredPrompt) return null;

    return (
        <div className="fixed bottom-24 md:bottom-8 left-4 right-4 sm:left-auto sm:right-8 sm:w-[400px] z-50 animate-in slide-in-from-bottom-4 duration-300">
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5 shadow-[var(--shadow-depth-3)]">
                <button
                    onClick={handleDismiss}
                    className="absolute top-3 right-3 text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition-colors"
                    aria-label="Dismiss install prompt"
                >
                    <X size={16} />
                </button>
                <div className="flex items-start gap-3.5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/30">
                        <Download size={22} className="text-emerald-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-bold text-[var(--color-text-main)]">Install Urugwiro</h3>
                        <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-muted)]">
                            Add to your home screen for instant access to verified properties across Rwanda.
                        </p>
                        <div className="mt-3 flex items-center gap-2">
                            <Button size="sm" variant="primary" onClick={handleInstall}>
                                Install App
                            </Button>
                            <Button size="sm" variant="ghost" onClick={handleDismiss}>
                                Not Now
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
