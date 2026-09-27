import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '../../lib/utils';

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
}

interface ToastContextType {
    addToast: (type: ToastType, message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within ToastProvider');
    return context;
};

const toastStyles: Record<ToastType, { bg: string; icon: React.ElementType }> = {
    success: { bg: 'bg-emerald-50 border-emerald-200', icon: CheckCircle2 },
    error: { bg: 'bg-red-50 border-red-200', icon: AlertCircle },
    info: { bg: 'bg-blue-50 border-blue-200', icon: Info },
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const addToast = useCallback((type: ToastType, message: string, duration = 4000) => {
        const id = Date.now().toString(36) + Math.random().toString(36).slice(2);
        setToasts((prev) => [...prev, { id, type, message, duration }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full" role="alert" aria-live="polite">
                {toasts.map((toast) => {
                    const style = toastStyles[toast.type];
                    const Icon = style.icon;
                    return (
                        <div
                            key={toast.id}
                            className={cn(
                                'flex items-start gap-3 p-4 rounded-xl border shadow-lg animate-in slide-in-from-right-4 duration-300',
                                style.bg
                            )}
                        >
                            <Icon size={18} className="text-[var(--color-text-muted)] shrink-0 mt-0.5" aria-hidden="true" />
                            <p className="flex-1 text-sm text-[var(--color-text-main)]">{toast.message}</p>
                            <button
                                onClick={() => removeToast(toast.id)}
                                className="text-[var(--color-text-dim)] hover:text-[var(--color-text-main)] transition-colors cursor-pointer"
                                aria-label="Dismiss notification"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
};
