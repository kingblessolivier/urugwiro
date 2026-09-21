import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MessageSquare, Send, Search, User, Clock,
  CheckCheck, UserPlus, Shield, Sparkles, Filter
} from 'lucide-react';
import { api } from '../../api/endpoints';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';

interface Contact {
  user_id: number;
  name: string;
  initial: string;
  role: string;
  room_id: string;
  last_message: string;
  last_time: string;
  unread: number;
}

interface ChatMessage {
  id: number;
  sender_id: number;
  content: string;
  time: string;
  date: string;
}

const AdminInbox: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [activeContactId, setActiveContactId] = useState<number | null>(null);
  const [messageText, setMessageText] = useState('');
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // 1. Fetch Conversations / Contacts List (with live polling)
  const { data: contactsData, isLoading: contactsLoading } = useQuery({
    queryKey: ['chat-contacts'],
    queryFn: async () => {
      const res = await api.chat.contacts();
      return res.data;
    },
    refetchInterval: 5000,
  });

  const contacts: Contact[] = contactsData?.contacts || [];
  const totalUnread: number = contactsData?.total_unread || 0;

  // Auto-select first contact if none selected
  useEffect(() => {
    if (!activeContactId && contacts.length > 0) {
      setActiveContactId(contacts[0].user_id);
    }
  }, [contacts, activeContactId]);

  // 2. Fetch Active Chat History (with live polling)
  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ['chat-history', activeContactId],
    queryFn: async () => {
      if (!activeContactId) return null;
      const res = await api.chat.history(activeContactId);
      return res.data;
    },
    enabled: !!activeContactId,
    refetchInterval: 3000,
  });

  const messages: ChatMessage[] = historyData?.messages || [];
  const currentContact = historyData?.contact || contacts.find(c => c.user_id === activeContactId);
  const meId = historyData?.me_id;

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 3. Send Message Mutation
  const sendMutation = useMutation({
    mutationFn: async ({ toId, content }: { toId: number; content: string }) => {
      return api.chat.send(toId, content);
    },
    onSuccess: () => {
      setMessageText('');
      queryClient.invalidateQueries({ queryKey: ['chat-history', activeContactId] });
      queryClient.invalidateQueries({ queryKey: ['chat-contacts'] });
    },
  });

  // 4. Query New Users for Starting Chat
  const { data: newUsersData } = useQuery({
    queryKey: ['chat-new-users', userSearch],
    queryFn: async () => {
      const res = await api.chat.newUsers(userSearch);
      return res.data?.users || [];
    },
    enabled: isNewChatOpen,
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeContactId || !messageText.trim()) return;
    sendMutation.mutate({ toId: activeContactId, content: messageText.trim() });
  };

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#05070b] p-6 lg:p-12 text-zinc-100">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-400 mb-2">
              Sovereign Negotiation & Communications
            </p>
            <h1 className="text-4xl font-extrabold tracking-tight text-white">
              Command <span className="text-emerald-400">Inbox</span>
            </h1>
            <p className="text-zinc-400 text-sm mt-1">
              Real-time sovereign correspondence between buyers, sellers, escrow officers, and field agents.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-xs font-semibold text-zinc-300 flex items-center gap-2">
              <MessageSquare size={14} className="text-emerald-400" />
              <span>{contacts.length} Active Dialogues</span>
            </div>
            {totalUnread > 0 && (
              <div className="px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-xs font-bold text-red-400">
                {totalUnread} Unread
              </div>
            )}
          </div>
        </div>

        {/* Chat Interface Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[720px] rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/60">

          {/* Left Column: Dialogues & Contacts (4 cols) */}
          <div className="lg:col-span-4 border-r border-white/10 flex flex-col h-full bg-white/[0.02]">
            {/* Search & New Chat Bar */}
            <div className="p-4 border-b border-white/10 space-y-3">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search correspondence..."
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-zinc-400 outline-none focus:border-emerald-500/50"
                  />
                </div>
                <button
                  onClick={() => setIsNewChatOpen(!isNewChatOpen)}
                  className="p-2 rounded-xl border border-white/10 bg-white/[0.04] text-zinc-300 hover:text-white hover:border-emerald-500/50 transition-all"
                  title="New Conversation"
                >
                  <UserPlus size={16} />
                </button>
              </div>

              {/* New User Selector Dropdown */}
              {isNewChatOpen && (
                <div className="p-3 rounded-xl bg-white/[0.04] border border-emerald-500/30 space-y-2 shadow-xl">
                  <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Start Dialogue With User</p>
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Filter by name or username..."
                    className="w-full bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-emerald-500/50"
                  />
                  <div className="max-h-36 overflow-y-auto divide-y divide-white/[0.08] pr-1">
                    {newUsersData?.map((u: any) => (
                      <button
                        key={u.user_id}
                        onClick={() => {
                          setActiveContactId(u.user_id);
                          setIsNewChatOpen(false);
                        }}
                        className="w-full p-2 text-left hover:bg-white/[0.08] rounded-lg text-xs flex items-center justify-between"
                      >
                        <span className="font-semibold text-white">{u.name}</span>
                        <span className="text-[10px] text-zinc-400 capitalize">{u.role || 'User'}</span>
                      </button>
                    ))}
                    {newUsersData?.length === 0 && (
                      <p className="text-[11px] text-zinc-400 p-2 text-center">No matching users</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Contacts Roster */}
            <div className="flex-1 overflow-y-auto divide-y divide-white/[0.08]">
              {contactsLoading && (
                <div className="p-8 text-center text-xs text-zinc-300 font-medium">Loading dialogues...</div>
              )}

              {!contactsLoading && filteredContacts.length === 0 && (
                <div className="p-8 text-center text-xs text-zinc-400">
                  No active correspondence found.
                </div>
              )}

              {!contactsLoading && filteredContacts.map((c) => {
                const isSelected = c.user_id === activeContactId;

                return (
                  <div
                    key={c.user_id}
                    onClick={() => setActiveContactId(c.user_id)}
                    className={cn(
                      "p-4 cursor-pointer transition-all flex items-start gap-3",
                      isSelected
                        ? "bg-emerald-500/15 border-l-4 border-emerald-500"
                        : "hover:bg-white/[0.05]"
                    )}
                  >
                    <div className="h-10 w-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center font-bold text-sm text-emerald-400 shrink-0">
                      {c.initial}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <p className={cn("text-xs font-bold truncate", isSelected ? "text-white" : "text-zinc-200")}>
                          {c.name}
                        </p>
                        <span className="text-[10px] text-zinc-400 font-mono">{c.last_time}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <p className="text-[11px] text-zinc-300 truncate max-w-[180px]">
                          {c.last_message || 'Draft open'}
                        </p>
                        <div className="flex items-center gap-1.5 ml-2">
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.08] text-zinc-300 font-semibold uppercase tracking-wider">
                            {c.role}
                          </span>
                          {c.unread > 0 && (
                            <span className="h-4 min-w-4 px-1 rounded-full bg-emerald-400 text-black text-[9px] font-black flex items-center justify-center">
                              {c.unread}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Active Dialogue Thread (8 cols) */}
          {/* Right Column: Active Dialogue Thread (8 cols) */}
          <div className="lg:col-span-8 flex flex-col h-full bg-white/[0.03] backdrop-blur-xl">
            {activeContactId && currentContact ? (
              <>
                {/* Active Chat Top Bar */}
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/[0.02]/90 backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center font-bold">
                      {currentContact.initial || currentContact.name?.[0] || 'U'}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{currentContact.name}</h3>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-300">
                        <span className="capitalize font-medium">{currentContact.role || 'Platform Participant'}</span>
                        <span className="text-zinc-500">Ã‚Â·</span>
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <Shield size={11} /> Sovereign Verified Channel
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right text-[11px] text-zinc-300 font-mono font-medium">
                    Room: {currentContact.room_id || `${activeContactId}`}
                  </div>
                </div>

                {/* Messages Stream */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {historyLoading && (
                    <div className="text-center text-xs text-zinc-300 font-medium py-12">Loading secure history...</div>
                  )}

                  {!historyLoading && messages.length === 0 && (
                    <div className="text-center text-zinc-400 py-24 space-y-2">
                      <MessageSquare size={32} className="mx-auto text-zinc-500" />
                      <p className="text-xs font-medium text-zinc-300">No prior messages with {currentContact.name}.</p>
                      <p className="text-[11px] text-zinc-400">Send a note below to begin negotiation or coordination.</p>
                    </div>
                  )}

                  {!historyLoading && messages.map((m) => {
                    const isMe = m.sender_id === meId;

                    return (
                      <div
                        key={m.id}
                        className={cn("flex flex-col", isMe ? "items-end" : "items-start")}
                      >
                        <div
                          className={cn(
                            "max-w-md rounded-2xl px-4 py-3 text-xs leading-relaxed transition-all shadow-md",
                            isMe
                              ? "bg-emerald-500 text-white font-medium rounded-br-none shadow-black/40"
                              : "bg-white/[0.04] text-zinc-100 border border-white/10 rounded-bl-none"
                          )}
                        >
                          <p>{m.content}</p>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-zinc-400 mt-1 px-1 font-mono font-medium">
                          <span>{m.time}</span>
                          {isMe && <CheckCheck size={12} className="text-emerald-400" />}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Composer Bar */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10 bg-white/[0.02] flex items-center gap-3">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder={`Compose dispatch to ${currentContact.name}...`}
                    className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl py-3 px-4 text-xs text-white placeholder-zinc-400 outline-none focus:border-emerald-500/50 transition-all"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={sendMutation.isPending || !messageText.trim()}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-3 rounded-xl font-bold text-xs flex items-center gap-2 shrink-0 shadow-md shadow-black/30"
                  >
                    <span>Send</span>
                    <Send size={14} />
                  </Button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 p-8 space-y-3">
                <MessageSquare size={40} className="text-zinc-500" />
                <h3 className="text-base font-bold text-zinc-200">Select a Dialogue</h3>
                <p className="text-xs text-zinc-400 max-w-sm text-center">
                  Select a correspondence from the left or initialize a new conversation with a platform participant.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default AdminInbox;



