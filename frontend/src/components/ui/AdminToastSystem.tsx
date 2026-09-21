import React, { useEffect, useState } from 'react';
import { Bell, XCircle, Heart, MessageSquare, Repeat, Mail, Info } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ToastNotification {
  id: string;
  type: 'like' | 'comment' | 'repost' | 'message' | 'system';
  message: string;
  link?: string;
}

const iconMap = {
  like: <Heart size={20} />,
  comment: <MessageSquare size={20} />,
  repost: <Repeat size={20} />,
  message: <Mail size={20} />,
  system: <Info size={20} />,
};

const colorMap = {
  like: 'bg-orange-500 text-orange-500',
  comment: 'bg-blue-500 text-blue-500',
  repost: 'bg-purple-500 text-purple-500',
  message: 'bg-emerald-500 text-emerald-500',
  system: 'bg-zinc-500 text-zinc-500',
};

export const AdminToastSystem: React.FC = () => {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  useEffect(() => {
    const handleToast = (e: any) => {
      const notification = e.detail;
      const id = Math.random().toString(36).substr(2, 9);
      setToasts(prev => [...prev, { ...notification, id }]);

      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 5000);
    };

    window.addEventListener('urugwiro-toast', handleToast);
    return () => window.removeEventListener('urugwiro-toast', handleToast);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 w-full max-w-sm">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className="flex items-start gap-4 p-4 rounded-2xl bg-[#0b0d12] border border-white/10 shadow-2xl animate-in slide-in-from-right-full duration-300 backdrop-blur-xl"
        >
          <div className={cn("p-2 rounded-xl", colorMap[toast.type].split(' ')[0])}>
            <div className={colorMap[toast.type].split(' ')[1]}>
              {iconMap[toast.type]}
            </div>
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-white">{toast.message}</div>
            {toast.link && (
              <a href={toast.link} className="text-xs text-emerald-500 hover:underline font-medium">View Detail</a>
            )}
          </div>
          <button
            onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
            className="text-zinc-600 hover:text-white transition-colors"
          >
            <XCircle size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default AdminToastSystem;
