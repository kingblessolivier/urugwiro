import React from 'react';
import { MessageSquare, Shield, Sparkles } from 'lucide-react';
import { ChatWindow } from '../chat/ChatWindow';

const AdminInbox: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#05070b] p-4 sm:p-6 lg:p-12 text-zinc-100">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-400 mb-2">
              Sovereign Negotiation & Communications
            </p>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-display">
              Command <span className="text-emerald-400">Inbox</span>
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm mt-1">
              Real-time sovereign correspondence between buyers, sellers, escrow officers, and field agents with AI Co-Pilot Assistance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400 flex items-center gap-2">
              <Sparkles size={14} />
              <span>AI Reply Co-Pilot Active</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs font-semibold text-zinc-300 flex items-center gap-2">
              <Shield size={14} className="text-emerald-400" />
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
