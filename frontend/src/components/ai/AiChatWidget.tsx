import React, { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Sparkles, MessageSquare, Send, X, Bot,
  Minimize2, Maximize2, Trash2, ArrowRight, ShieldCheck, MapPin
} from 'lucide-react';
import { api } from '../../api/endpoints';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const STARTER_PROMPTS = [
  "How does UPI cadastre verification work in Rwanda?",
  "Compare Nyarutarama vs Gacuriro for villa investments.",
  "How does Urugwiro milestone escrow protect buyers?",
  "What documents are required to transfer land on Irembo?"
];

export const AiChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I am the **Urugwiro AI Concierge**.\n\nI can help you explore verified homes, titled land parcels with RLMUA cadastre boundaries, executive vehicles, and explain our escrow transaction process.\n\nHow can I assist your search in Rwanda today?"
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const chatMutation = useMutation({
    mutationFn: async (updatedMessages: Message[]) => {
      const res = await api.ai.chat(updatedMessages, 'public');
      return res.data;
    },
    onSuccess: (data) => {
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "I'm temporarily experiencing connectivity issues with the NVIDIA network. You can ask me about Rwandan land UPI, Kigali districts, or verified titles, and I will guide you!"
        }
      ]);
    }
  });

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || chatMutation.isPending) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    chatMutation.mutate(newMessages);
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: "Chat cleared. What else would you like to know about properties or land titles in Rwanda?"
      }
    ]);
  };

  return (
    <>
      {/* ── FLOATING TRIGGER BUTTON ── */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 flex items-center gap-2.5 rounded-full px-4 py-3 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-white font-bold text-xs sm:text-sm shadow-[0_8px_30px_rgba(16,185,129,0.4)] hover:shadow-[0_12px_40px_rgba(16,185,129,0.6)] border border-white/20 transition-all hover:scale-105 active:scale-95 cursor-pointer group"
          aria-label="Open AI Concierge"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
            <Sparkles size={14} className="animate-pulse" />
          </div>
          <span className="tracking-tight">AI Concierge</span>
          <span className="flex h-2 w-2 rounded-full bg-white animate-ping" />
        </button>
      )}

      {/* ── CHAT MODAL / DRAWER ── */}
      {isOpen && (
        <div
          className={cn(
            "fixed z-50 transition-all duration-300 flex flex-col rounded-3xl border border-white/15 bg-[#070a10]/95 backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden",
            isExpanded
              ? "inset-4 sm:inset-10"
              : "bottom-20 md:bottom-6 right-3 sm:right-6 w-[calc(100vw-1.5rem)] sm:w-[420px] h-[580px] max-h-[85vh]"
          )}
        >
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/30 to-teal-500/20 border border-emerald-500/40 text-emerald-400">
                <Sparkles size={16} className="animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-white leading-none">Urugwiro AI Concierge</h3>
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Live
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">Spatial Intelligence & Cadastre Guide</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={clearChat}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                title="Clear conversation"
              >
                <Trash2 size={14} />
              </button>
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="hidden sm:block p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                title={isExpanded ? "Restore" : "Maximize"}
              >
                {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                title="Close"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin">
            {messages.map((msg, i) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={i}
                  className={cn(
                    "flex gap-2.5",
                    isUser ? "justify-end" : "justify-start"
                  )}
                >
                  {!isUser && (
                    <div className="h-7 w-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30 mt-0.5">
                      <Bot size={14} />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl p-3 sm:p-3.5 text-xs sm:text-sm leading-relaxed shadow-lg",
                      isUser
                        ? "bg-gradient-to-br from-emerald-600 to-teal-600 text-white rounded-tr-sm"
                        : "bg-white/[0.05] text-zinc-200 border border-white/10 rounded-tl-sm backdrop-blur-md"
                    )}
                  >
                    <div className="prose prose-invert prose-xs max-w-none whitespace-pre-wrap break-words">
                      {msg.content}
                    </div>
                  </div>
                </div>
              );
            })}

            {chatMutation.isPending && (
              <div className="flex gap-2.5 items-center text-xs text-zinc-400">
                <div className="h-7 w-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                  <Bot size={14} />
                </div>
                <div className="flex items-center gap-1 bg-white/[0.04] border border-white/10 px-3 py-2 rounded-2xl">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-bounce" />
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[11px] text-zinc-400 ml-1">Analyzing Rwanda property database...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Starter Prompts (shown when messages length <= 2) */}
          {messages.length <= 2 && (
            <div className="px-4 py-2 border-t border-white/5 bg-white/[0.01]">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-1.5">Suggested Questions:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {STARTER_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(prompt)}
                    className="text-left px-2.5 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-[11px] text-zinc-300 hover:text-white transition-all cursor-pointer truncate"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 border-t border-white/10 bg-[#070a10]"
          >
            <div className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/[0.03] p-1.5 focus-within:border-emerald-400/50 transition-colors">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about titles, Kigali districts, escrow..."
                className="w-full bg-transparent px-3 py-2 text-xs sm:text-sm text-white placeholder:text-zinc-500 outline-none"
              />
              <Button
                type="submit"
                variant="primary"
                disabled={!input.trim() || chatMutation.isPending}
                className="shrink-0 rounded-xl px-4 py-2 text-xs font-bold bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <span>Send</span>
                <Send size={13} />
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};
export default AiChatWidget;
