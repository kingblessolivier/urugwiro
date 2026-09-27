import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MessageSquare, Send, Search, Clock,
  CheckCheck, UserPlus, Shield, Sparkles,
  Building2, X
} from 'lucide-react';
import { api } from '../../api/endpoints';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';

export interface ChatContact {
  user_id: number;
  name: string;
  initial: string;
  role: string;
  room_id: string;
  last_message: string;
  last_time: string;
  unread: number;
}

export interface ChatMessage {
  id: number;
  sender_id: number;
  content: string;
  time: string;
  date: string;
}

interface ChatWindowProps {
  currentRole?: 'seller' | 'admin' | 'agent' | 'user';
  initialContactId?: number | null;
  propertyContext?: {
    id?: string | number;
    title: string;
    price: string | number;
    location?: string;
  } | null;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  currentRole = 'seller',
  initialContactId = null,
  propertyContext = null,
}) => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [activeContactId, setActiveContactId] = useState<number | null>(initialContactId);
  const [messageText, setMessageText] = useState('');
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // 1. Fetch Conversations / Contacts List (live polling every 4s)
  const { data: contactsData, isLoading: contactsLoading } = useQuery({
    queryKey: ['chat-contacts'],
    queryFn: async () => {
      const res = await api.chat.contacts();
      return res.data;
    },
    refetchInterval: 4000,
  });

  const contacts: ChatContact[] = contactsData?.contacts || [];
  const totalUnread: number = contactsData?.total_unread || 0;

  // Auto-select first contact if none selected
  useEffect(() => {
    if (!activeContactId && contacts.length > 0) {
      setActiveContactId(contacts[0].user_id);
    }
  }, [contacts, activeContactId]);

  // 2. Fetch Active Chat History (polling every 3s)
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
    if (!messageText.trim() || !activeContactId || sendMutation.isPending) return;
    sendMutation.mutate({ toId: activeContactId, content: messageText.trim() });
  };

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.role.toLowerCase().includes(search.toLowerCase()) ||
    c.last_message.toLowerCase().includes(search.toLowerCase())
  );

  // Suggested quick AI replies for seller
  const sellerQuickReplies = [
    "Yes, this property is available for private viewing.",
    "The title deed is 100% clean and verified with RLMUA.",
    "Would you like to schedule an official site visit this week?",
    "We accept offers processed securely through Urugwiro escrow."
  ];

  return (
    <div className="h-[calc(100vh-12rem)] min-h-[580px] flex flex-col md:flex-row rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] backdrop-blur-2xl shadow-[var(--shadow-depth-2)] overflow-hidden relative">

      {/* ── LEFT PANEL: CONVERSATIONS ROSTER ── */}
      <div className="w-full md:w-80 lg:w-96 border-b md:border-b-0 md:border-r border-[var(--color-border)] flex flex-col bg-[var(--color-bg-elevated)]">
        {/* Roster Header */}
        <div className="p-4 sm:p-5 border-b border-[var(--color-border)] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-[var(--color-brand-emerald)] dark:border-emerald-500/30">
                <MessageSquare size={16} />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[var(--color-text-main)] tracking-tight">Conversations</h2>
            </div>
            <div className="flex items-center gap-2">
              {totalUnread > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 dark:bg-emerald-500 text-[#fff] dark:text-emerald-950">
                  {totalUnread} new
                </span>
              )}
              <Button
                variant="ghost"
                onClick={() => setIsNewChatOpen(true)}
                className="h-8 w-8 p-0 rounded-xl bg-[var(--color-bg-elevated)] hover:bg-emerald-600 hover:text-[#fff] dark:hover:bg-emerald-500 dark:hover:text-emerald-950 border border-[var(--color-border)] text-[var(--color-text-muted)] transition-all cursor-pointer"
                title="Start New Conversation"
              >
                <UserPlus size={15} />
              </Button>
            </div>
          </div>

          {/* Contact Search input */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-dim)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="w-full rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] pl-9 pr-3 py-2 text-xs text-[var(--color-text-main)] placeholder:text-[var(--color-text-dim)] outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[var(--color-border)] scrollbar-thin">
          {contactsLoading ? (
            <div className="p-8 text-center text-xs text-[var(--color-text-dim)]">Loading conversations...</div>
          ) : filteredContacts.length === 0 ? (
            <div className="p-8 text-center text-xs text-[var(--color-text-dim)] space-y-2">
              <MessageSquare size={24} className="mx-auto text-[var(--color-text-dim)] mb-2 opacity-50" />
              <p>No active conversations yet.</p>
              <Button
                variant="ghost"
                onClick={() => setIsNewChatOpen(true)}
                className="text-[var(--color-brand-emerald)] hover:underline text-xs p-0"
              >
                Start a new conversation
              </Button>
            </div>
          ) : (
            filteredContacts.map((contact) => {
              const isActive = activeContactId === contact.user_id;
              return (
                <button
                  key={contact.user_id}
                  onClick={() => setActiveContactId(contact.user_id)}
                  className={cn(
                    "w-full text-left p-3.5 sm:p-4 flex items-start gap-3 transition-all cursor-pointer relative",
                    isActive
                      ? "bg-[var(--color-accent-soft-bg)] border-l-2 border-emerald-500"
                      : "hover:bg-[var(--color-bg-elevated)]"
                  )}
                >
                  <div className="relative shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--color-accent-soft-bg)] border border-emerald-500/30 text-[var(--color-brand-emerald)] font-bold text-sm">
                      {contact.initial || '?'}
                    </div>
                    {contact.unread > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 dark:bg-emerald-500 text-[9px] font-extrabold text-[#fff] dark:text-emerald-950 ring-2 ring-[var(--color-bg-surface)]">
                        {contact.unread}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs sm:text-sm font-semibold text-[var(--color-text-main)] truncate">{contact.name}</p>
                      <span className="text-[10px] text-[var(--color-text-dim)] font-mono shrink-0">{contact.last_time}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] border border-[var(--color-border)]">
                        {contact.role}
                      </span>
                      <p className="text-xs text-[var(--color-text-muted)] truncate flex-1">
                        {contact.last_message || 'Started conversation'}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── RIGHT PANEL: ACTIVE CHAT THREAD ── */}
      <div className="flex-1 flex flex-col bg-[var(--color-bg-deep)] min-w-0">
        {activeContactId && currentContact ? (
          <>
            {/* Chat Thread Header */}
            <div className="p-4 sm:p-5 border-b border-[var(--color-border)] flex items-center justify-between gap-3 bg-[var(--color-bg-elevated)]">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--color-accent-soft-bg)] border border-emerald-500/30 text-[var(--color-brand-emerald)] font-bold">
                    {currentContact.initial || currentContact.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-[#070a10] animate-pulse" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-[var(--color-text-main)] truncate">{currentContact.name}</h3>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/15 dark:text-[var(--color-brand-emerald)] dark:border-emerald-500/25">
                      {currentContact.role}
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--color-text-dim)] flex items-center gap-1">
                    <Shield size={11} className="text-[var(--color-brand-emerald)]" />
                    <span>Direct encrypted channel</span>
                  </p>
                </div>
              </div>

              {/* Status Action */}
              <div className="flex items-center gap-2 text-xs">
                <span className="hidden sm:inline-flex items-center gap-1.5 text-[var(--color-text-muted)] bg-[var(--color-bg-elevated)] px-3 py-1 rounded-full border border-[var(--color-border)] text-[11px]">
                  <Clock size={12} className="text-[var(--color-brand-emerald)]" />
                  <span>Avg reply: &lt; 5m</span>
                </span>
              </div>
            </div>

            {/* Property Inquiry Context Banner (if tied to a listing) */}
            {propertyContext && (
              <div className="mx-4 sm:mx-6 mt-3 p-3 rounded-2xl bg-[var(--color-accent-soft-bg)] border border-emerald-500/25 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/15 dark:text-[var(--color-brand-emerald)] dark:border-emerald-500/30 flex items-center justify-center shrink-0">
                    <Building2 size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[var(--color-text-main)] font-semibold truncate">{propertyContext.title}</p>
                    <div className="flex items-center gap-2 text-[11px] text-[var(--color-text-muted)]">
                      <span className="text-[var(--color-brand-emerald)] font-mono font-bold">{propertyContext.price}</span>
                      {propertyContext.location && (
                        <>
                          <span>•</span>
                          <span className="truncate">{propertyContext.location}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-brand-emerald)] shrink-0 bg-emerald-50 border border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 px-2 py-1 rounded-lg">
                  Inquiry Topic
                </span>
              </div>
            )}

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {historyLoading && messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-[var(--color-text-dim)]">
                  Decrypting message stream...
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[var(--color-text-dim)] space-y-2">
                  <div className="h-12 w-12 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] mb-1">
                    <MessageSquare size={20} />
                  </div>
                  <p className="text-sm font-semibold text-[var(--color-text-main)]">No messages exchanged yet.</p>
                  <p className="text-xs max-w-xs text-[var(--color-text-muted)]">
                    Send a direct greeting or answer inquiries about your listed assets in Rwanda.
                  </p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isMe = msg.sender_id === meId;
                  const showDate = idx === 0 || messages[idx - 1].date !== msg.date;

                  return (
                    <div key={msg.id || idx} className="space-y-3">
                      {showDate && (
                        <div className="flex items-center justify-center my-3">
                          <span className="text-[10px] font-mono text-[var(--color-text-dim)] bg-[var(--color-bg-elevated)] border border-[var(--color-border)] px-2.5 py-0.5 rounded-full">
                            {msg.date}
                          </span>
                        </div>
                      )}

                      <div className={cn("flex flex-col", isMe ? "items-end" : "items-start")}>
                        <div
                          className={cn(
                            "max-w-[85%] sm:max-w-[70%] rounded-2xl p-3 sm:p-3.5 text-xs sm:text-sm leading-relaxed shadow-lg",
                            isMe
                              ? "bg-gradient-to-br from-emerald-600 to-teal-600 text-[#fff] rounded-tr-sm shadow-emerald-500/10"
                              : "bg-[var(--color-bg-elevated)] text-[var(--color-text-main)] border border-[var(--color-border)] rounded-tl-sm backdrop-blur-md"
                          )}
                        >
                          <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 px-1 text-[10px] text-[var(--color-text-dim)] font-mono">
                          <span>{msg.time}</span>
                          {isMe && <CheckCheck size={12} className="text-[var(--color-brand-emerald)]" />}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick AI Replies (for Seller) */}
            {currentRole === 'seller' && (
              <div className="px-4 py-2 border-t border-[var(--color-border)] bg-[var(--color-bg-elevated)] flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-brand-emerald)] flex items-center gap-1 shrink-0 mr-1">
                  <Sparkles size={11} className="animate-pulse" />
                  Quick Replies:
                </span>
                {sellerQuickReplies.map((reply, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setMessageText(reply)}
                    className="shrink-0 px-2.5 py-1 rounded-full bg-[var(--color-bg-elevated)] hover:bg-[var(--color-bg-card-hover)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] text-[11px] transition-all cursor-pointer"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 sm:p-4 border-t border-[var(--color-border)] bg-[var(--color-bg-surface)]">
              <div className="flex items-center gap-2 rounded-2xl border border-[var(--color-border-hover)] bg-[var(--color-bg-elevated)] p-1.5 focus-within:border-emerald-500/50 transition-colors">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder={`Reply to ${currentContact.name}...`}
                  className="w-full bg-transparent px-3 py-2 text-xs sm:text-sm text-[var(--color-text-main)] placeholder:text-[var(--color-text-dim)] outline-none"
                />
                <Button
                  type="submit"
                  variant="primary"
                  disabled={!messageText.trim() || sendMutation.isPending}
                  className="shrink-0 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 disabled:opacity-40 text-[#fff] dark:text-emerald-950 flex items-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <span>Send</span>
                  <Send size={14} />
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-[var(--color-text-dim)] space-y-3">
            <div className="h-16 w-16 rounded-2xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)]">
              <MessageSquare size={28} />
            </div>
            <h3 className="text-lg font-bold text-[var(--color-text-main)]">Select a Conversation</h3>
            <p className="text-xs max-w-sm text-[var(--color-text-muted)]">
              Choose a contact from the roster to start exchanging real-time messages with buyers, agents, or admin auditors.
            </p>
            <Button
              variant="secondary"
              onClick={() => setIsNewChatOpen(true)}
              className="mt-2 text-xs"
            >
              Start New Conversation
            </Button>
          </div>
        )}
      </div>

      {/* ── NEW CHAT MODAL ── */}
      {isNewChatOpen && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-[var(--color-border-hover)] bg-[var(--color-bg-surface)] p-6 shadow-[var(--shadow-depth-2)] space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
              <div className="flex items-center gap-2">
                <UserPlus size={18} className="text-[var(--color-brand-emerald)]" />
                <h3 className="font-bold text-[var(--color-text-main)] text-base">New Conversation</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewChatOpen(false)}
                className="text-[var(--color-text-dim)] hover:text-[var(--color-text-main)] p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-dim)]" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search by name, role or username..."
                className="w-full rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] pl-9 pr-4 py-2.5 text-xs text-[var(--color-text-main)] placeholder:text-[var(--color-text-dim)] outline-none focus:border-emerald-500/50"
              />
            </div>

            <div className="max-h-60 overflow-y-auto divide-y divide-[var(--color-border)] scrollbar-thin">
              {newUsersData?.length === 0 ? (
                <div className="p-6 text-center text-xs text-[var(--color-text-dim)]">No users found.</div>
              ) : (
                newUsersData?.map((u: any) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      setActiveContactId(u.id);
                      setIsNewChatOpen(false);
                    }}
                    className="w-full p-3 flex items-center gap-3 hover:bg-[var(--color-bg-elevated)] transition-colors text-left"
                  >
                    <div className="h-9 w-9 rounded-xl bg-[var(--color-accent-soft-bg)] text-[var(--color-brand-emerald)] font-bold flex items-center justify-center text-xs border border-emerald-500/30">
                      {u.name?.[0]?.toUpperCase() || u.username?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[var(--color-text-main)] truncate">{u.name || u.username}</p>
                      <p className="text-[10px] text-[var(--color-text-dim)] uppercase font-mono">{u.role || 'Member'}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ChatWindow;
