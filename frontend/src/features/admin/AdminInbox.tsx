import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, User, Search, RefreshCw, CheckCheck } from 'lucide-react';
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

  const filteredContacts = contacts.filter((c) =>
    (c.name || c.username).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
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
        <button
          type="button"
          onClick={fetchContacts}
          className="p-2 rounded-lg text-[var(--color-text-dim)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-elevated)] transition-colors"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
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
  );
};

export default AdminInbox;
