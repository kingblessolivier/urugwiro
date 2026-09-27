import React from 'react';
import { MessageSquare, Shield, Sparkles } from 'lucide-react';
import { ChatWindow } from '../chat/ChatWindow';

const AdminInbox: React.FC = () => {
  return (
    <div className="min-h-screen bg-[var(--color-bg-deep)] p-4 sm:p-6 lg:p-12 text-[var(--color-text-muted)]">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[var(--color-border)] pb-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--color-brand-emerald)] mb-2">
              Negotiations & Communications
            </p>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--color-text-main)] font-display">
              Admin <span className="text-[var(--color-brand-emerald)]">Inbox</span>
            </h1>
            <p className="text-[var(--color-text-muted)] text-xs sm:text-sm mt-1">
              Real-time correspondence between buyers, sellers, escrow officers, and field agents with AI Co-Pilot Assistance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-[var(--color-brand-emerald)] flex items-center gap-2">
              <Sparkles size={14} />
              <span>AI Reply Co-Pilot Active</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-muted)] flex items-center gap-2">
              <Shield size={14} className="text-[var(--color-brand-emerald)]" />
              <span>End-to-End Logged</span>
            </div>
          </div>
        </div>

        {/* Real-time Chat Window with AI assistance */}
        <div className="h-[740px]">
          <ChatWindow currentRole="admin" />
        </div>
      </div>
    </div>
  );
};

export default AdminInbox;
