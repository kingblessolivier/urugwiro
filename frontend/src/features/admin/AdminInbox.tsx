import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, User, Search, RefreshCw, CheckCheck, Plus, X } from 'lucide-react';
import { api } from '../../api/endpoints';

interface Contact {
  id: number;
  username: string;
  name: string;
  last_message: string;
  last_message_date: string;
  unread_count: number;
}

interface MessageItem {
  id: number;
  sender_id: number;
  recipient_id: number;
  content: string;
  sent_date: string;
  is_read: boolean;
  is_mine: boolean;
}

const AdminInbox: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputContent, setInputContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [composeOpen, setComposeOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<Array<{ id: number; username: string; name: string; role: string }>>([]);
  const [composeRecipient, setComposeRecipient] = useState<number | ''>('');
  const [composeContent, setComposeContent] = useState('');
  const [composeStatus, setComposeStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const res = await api.chat.contacts();
      const data = res.data || [];
      setContacts(data);
      if (data.length > 0 && !selectedContact) {
        setSelectedContact(data[0]);
      }
    } catch (err) {
      console.error('Failed to fetch chat contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (contactId: number) => {
    try {
      const res = await api.chat.history(contactId);
      setMessages(res.data || []);
    } catch (err) {
      console.error('Failed to fetch message history:', err);
    }
  };

  useEffect(() => {
    fetchContacts();
    const interval = setInterval(fetchContacts, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedContact) {
      fetchHistory(selectedContact.id);
      const interval = setInterval(() => fetchHistory(selectedContact.id), 5000);
      return () => clearInterval(interval);
    }
  }, [selectedContact]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContact || !inputContent.trim() || sending) return;

    try {
      setSending(true);
      await api.chat.send({
        recipient_id: selectedContact.id,
        content: inputContent.trim(),
      });
      setInputContent('');
      await fetchHistory(selectedContact.id);
      fetchContacts();
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  const openCompose = async () => {
    setComposeOpen(true);
    setComposeStatus(null);
    setComposeRecipient('');
    setComposeContent('');
    try {
      const res = await api.chat.newUsers();
      setAvailableUsers(res.data || []);
    } catch {
      setComposeStatus({ type: 'error', message: 'Could not load available users.' });
    }
  };

  const handleComposeSend = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!composeRecipient || !composeContent.trim()) return;
    try {
      await api.chat.send({ recipient_id: composeRecipient, content: composeContent.trim() });
      const recipient = availableUsers.find((user) => user.id === composeRecipient);
      setComposeStatus({ type: 'success', message: `Message sent to ${recipient?.name || 'user'}.` });
      setComposeContent('');
      fetchContacts();
    } catch {
      setComposeStatus({ type: 'error', message: 'Message could not be sent. Please try again.' });
    }
  };

  const filteredContacts = contacts.filter((c) =>
    (c.name || c.username).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-sm">
      {/* Top Header */}
      <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-[var(--color-brand-emerald)] flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[var(--color-text-main)]">Admin Inbox</h1>
            <p className="text-xs text-[var(--color-text-dim)]">Internal communication and buyer/seller direct chats</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={openCompose} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-700">
            <Plus size={14} /> New message
          </button>
          <button type="button" onClick={fetchContacts} className="rounded-lg p-2 text-[var(--color-text-dim)] transition-colors hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-main)]" title="Refresh">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Contact List */}
        <div className="w-80 border-r border-[var(--color-border)] flex flex-col bg-[var(--color-bg-deep)]">
          <div className="p-3 border-b border-[var(--color-border)]">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-dim)]" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-main)] placeholder:text-[var(--color-text-dim)] outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[var(--color-border)]">
            {filteredContacts.length === 0 ? (
              <div className="p-6 text-center text-xs text-[var(--color-text-dim)]">
                {loading ? 'Loading conversations...' : 'No conversations found'}
              </div>
            ) : (
              filteredContacts.map((contact) => {
                const isSelected = selectedContact?.id === contact.id;
                return (
                  <button
                    key={contact.id}
                    type="button"
                    onClick={() => setSelectedContact(contact)}
                    className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 border-l-2 border-emerald-600'
                        : 'hover:bg-[var(--color-bg-elevated)]'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                      {(contact.name?.[0] || contact.username?.[0] || 'U').toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-xs font-semibold text-[var(--color-text-main)] truncate">
                          {contact.name || contact.username}
                        </span>
                        {contact.unread_count > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-bold">
                            {contact.unread_count}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[var(--color-text-dim)] truncate">
                        {contact.last_message || 'No messages yet'}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Message Window */}
        <div className="flex-1 flex flex-col bg-[var(--color-bg-surface)]">
          {selectedContact ? (
            <>
              {/* Chat Header */}
              <div className="px-6 py-3.5 border-b border-[var(--color-border)] flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-xs">
                  {(selectedContact.name?.[0] || selectedContact.username?.[0] || 'U').toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[var(--color-text-main)] leading-none">
                    {selectedContact.name || selectedContact.username}
                  </h3>
                  <span className="text-[10px] text-[var(--color-text-dim)]">
                    @{selectedContact.username}
                  </span>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-[var(--color-text-dim)] text-xs">
                    <User className="w-8 h-8 mb-2 opacity-30" />
                    <span>No messages exchanged yet. Send a message below.</span>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.is_mine ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-md px-4 py-2.5 rounded-2xl text-xs ${
                          msg.is_mine
                            ? 'bg-emerald-600 text-white rounded-br-xs'
                            : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-main)] border border-[var(--color-border)] rounded-bl-xs'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-[9px] text-[var(--color-text-dim)] px-1">
                        <span>
                          {new Date(msg.sent_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {msg.is_mine && (
                          <CheckCheck className={`w-3 h-3 ${msg.is_read ? 'text-emerald-500' : 'text-current opacity-60'}`} />
                        )}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSend} className="p-3 border-t border-[var(--color-border)] flex items-center gap-2">
                <input
                  type="text"
                  placeholder={`Reply to ${selectedContact.name || selectedContact.username}...`}
                  value={inputContent}
                  onChange={(e) => setInputContent(e.target.value)}
                  className="flex-1 px-4 py-2.5 text-xs bg-[var(--color-bg-deep)] border border-[var(--color-border)] rounded-xl text-[var(--color-text-main)] placeholder:text-[var(--color-text-dim)] outline-none focus:border-emerald-500 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!inputContent.trim() || sending}
                  className="p-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-[var(--color-text-dim)] text-xs">
              <MessageSquare className="w-10 h-10 mb-2 opacity-20" />
              <span>Select a contact to view conversation</span>
            </div>
          )}
        </div>
      </div>
    </div>
    {composeOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) setComposeOpen(false); }}>
        <div className="w-full max-w-md overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] shadow-2xl">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
            <div>
              <h2 className="text-base font-bold text-[var(--color-text-main)]">New message</h2>
              <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">Choose an active user to start a conversation.</p>
            </div>
            <button type="button" onClick={() => setComposeOpen(false)} className="rounded-lg p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-elevated)]" aria-label="Close compose dialog"><X size={17} /></button>
          </div>
          <form onSubmit={handleComposeSend} className="space-y-4 p-5">
            {composeStatus && <div role="status" className={`rounded-xl border px-3 py-2 text-xs ${composeStatus.type === 'success' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500' : 'border-red-500/30 bg-red-500/10 text-red-400'}`}>{composeStatus.message}</div>}
            <label className="block space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Recipient</span>
              <select value={composeRecipient} onChange={(event) => setComposeRecipient(event.target.value ? Number(event.target.value) : '')} required className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-input-bg)] px-3 py-2.5 text-sm text-[var(--color-text-main)] outline-none focus:border-emerald-500/50">
                <option value="">Select an available user</option>
                {availableUsers.map((user) => <option key={user.id} value={user.id}>{user.name || user.username} · {user.role}</option>)}
              </select>
            </label>
            <label className="block space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Message</span>
              <textarea value={composeContent} onChange={(event) => setComposeContent(event.target.value)} rows={5} required placeholder="Write your message..." className="w-full resize-none rounded-xl border border-[var(--color-border)] bg-[var(--color-input-bg)] px-3 py-2.5 text-sm text-[var(--color-text-main)] outline-none focus:border-emerald-500/50" />
            </label>
            <button type="submit" disabled={!composeRecipient || !composeContent.trim()} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"><Send size={15} /> Send message</button>
          </form>
        </div>
      </div>
    )}
    </>
  );
};

export default AdminInbox;
