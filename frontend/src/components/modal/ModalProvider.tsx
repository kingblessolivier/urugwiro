import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

/* ─── Focus Trap ─── */
function useFocusTrap(containerRef: React.RefObject<HTMLElement | null>, isActive: boolean) {
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    const getFocusableElements = () =>
      Array.from(container.querySelectorAll<HTMLElement>(focusableSelectors)).filter(
        (el) => el.offsetParent !== null
      );

    // Focus first element on open
    const firstElement = getFocusableElements()[0];
    if (firstElement) {
      setTimeout(() => firstElement.focus(), 50);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [containerRef, isActive]);
}

/* ─── Types ─── */

export type ModalType = 'drawer' | 'dialog';

export interface ModalConfig {
  id: string;
  type: ModalType;
  title: string;
  subtitle?: string;
  content: React.ReactNode;
  footer?: React.ReactNode;
  width?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  onClose?: () => void;
  closeOnBackdrop?: boolean;
  closeOnEsc?: boolean;
}

interface ModalContextValue {
  openModal: (config: ModalConfig) => void;
  closeModal: (id?: string) => void;
  closeAll: () => void;
  isOpen: (id: string) => boolean;
}

/* ─── Context ─── */

const ModalContext = createContext<ModalContextValue | null>(null);

export const useModal = () => {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal must be used within ModalProvider');
  return ctx;
};

/* ─── Provider ─── */

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [modals, setModals] = useState<ModalConfig[]>([]);
  const idCounter = useRef(0);

  const openModal = useCallback((config: ModalConfig) => {
    const id = config.id || `modal-${++idCounter.current}`;
    setModals((prev) => {
      // Replace if same id exists
      const filtered = prev.filter((m) => m.id !== id);
      return [...filtered, { ...config, id }];
    });
  }, []);

  const closeModal = useCallback((id?: string) => {
    setModals((prev) => {
      if (!id) return prev.slice(0, -1); // close top
      return prev.filter((m) => m.id !== id);
    });
  }, []);

  const closeAll = useCallback(() => setModals([]), []);

  const isOpen = useCallback((id: string) => modals.some((m) => m.id === id), [modals]);

  // Global keyboard: Esc closes top modal
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && modals.length > 0) {
        const top = modals[modals.length - 1];
        if (top.closeOnEsc !== false) {
          e.preventDefault();
          closeModal(top.id);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [modals, closeModal]);

  // Lock body scroll when any modal is open
  useEffect(() => {
    if (modals.length > 0) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [modals.length]);

  return (
    <ModalContext.Provider value={{ openModal, closeModal, closeAll, isOpen }}>
      {children}
      {createPortal(
        <ModalStack modals={modals} closeModal={closeModal} />,
        document.body
      )}
    </ModalContext.Provider>
  );
};

/* ─── Modal Stack Renderer ─── */

const ModalStack: React.FC<{ modals: ModalConfig[]; closeModal: (id?: string) => void }> = ({
  modals,
  closeModal,
}) => {
  if (modals.length === 0) return null;

  return (
    <>
      {modals.map((modal, index) => {
        const isTop = index === modals.length - 1;
        return (
          <ModalRenderer
            key={modal.id}
            modal={modal}
            zIndex={1000 + index * 10}
            isTop={isTop}
            onClose={() => closeModal(modal.id)}
          />
        );
      })}
    </>
  );
};

/* ─── Individual Modal Renderer ─── */

const ModalRenderer: React.FC<{
  modal: ModalConfig;
  zIndex: number;
  isTop: boolean;
  onClose: () => void;
}> = ({ modal, zIndex, isTop, onClose }) => {
  const { type, title, subtitle, content, footer, width = 'md', closeOnBackdrop = true } = modal;
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(panelRef, true);

  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnBackdrop) {
      onClose();
    }
  };

  const widthClasses: Record<string, string> = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[95vw]',
  };

  if (type === 'drawer') {
    return (
      <div
        className="fixed inset-0 z-[var(--z)]"
        style={{ '--z': zIndex } as React.CSSProperties}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {/* Backdrop */}
        <div
          className={cn(
            'absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200',
            isTop ? 'opacity-100' : 'opacity-0'
          )}
          onClick={handleBackdrop}
        />
        {/* Drawer panel */}
        <div
          ref={panelRef}
          className={cn(
            'absolute right-0 top-0 h-full w-full bg-[var(--color-bg-surface)] shadow-2xl',
            'flex flex-col',
            'animate-slide-in-right'
          )}
          style={{ maxWidth: width === 'full' ? '95vw' : undefined }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] shrink-0">
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-[var(--color-text-main)] truncate">{title}</h2>
              {subtitle && (
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{subtitle}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-elevated)] transition-colors"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
          {/* Content */}
          <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-5">
            {content}
          </div>
          {/* Footer */}
          {footer && (
            <div className="shrink-0 px-6 py-4 border-t border-[var(--color-border)] bg-[var(--color-bg-elevated)]/50">
              {footer}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Dialog (centered)
  return (
    <div
      className="fixed inset-0 z-[var(--z)] flex items-center justify-center p-4"
      style={{ '--z': zIndex } as React.CSSProperties}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Backdrop */}
      <div
        className={cn(
          'absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200',
          isTop ? 'opacity-100' : 'opacity-0'
        )}
        onClick={handleBackdrop}
      />
      {/* Dialog panel */}
      <div
        ref={panelRef}
        className={cn(
          'relative w-full bg-[var(--color-bg-surface)] rounded-xl shadow-2xl',
          'flex flex-col max-h-[90vh]',
          'animate-scale-in',
          widthClasses[width]
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] shrink-0">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-[var(--color-text-main)] truncate">{title}</h2>
            {subtitle && (
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-elevated)] transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
        {/* Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-5">
          {content}
        </div>
        {/* Footer */}
        {footer && (
          <div className="shrink-0 px-6 py-4 border-t border-[var(--color-border)] bg-[var(--color-bg-elevated)]/50 rounded-b-xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
