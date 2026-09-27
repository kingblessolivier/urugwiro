import React, { useState } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ChatMessage {
    id: string;
    sender: 'user' | 'agent';
    message: string;
    timestamp: Date;
}

const INITIAL_MESSAGES: ChatMessage[] = [
    {
        id: '1',
        sender: 'agent',
        message: 'Hello! Welcome to Urugwiro support. How can I help you today?',
        timestamp: new Date(),
    },
];

const QUICK_REPLIES = [
    'How do I list my property?',
    'What are the fees?',
    'How does escrow work?',
    'Contact a human agent',
];

export const LiveChatSupport: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    const handleSend = (text?: string) => {
        const messageText = (text || input).trim();
        if (!messageText) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            sender: 'user',
            message: messageText,
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        // Simulate agent response
        setTimeout(() => {
            const agentMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                sender: 'agent',
                message: getAutoReply(messageText),
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, agentMessage]);
            setIsTyping(false);
        }, 1500);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {/* Chat Window */}
            {isOpen && (
                <div
                    className="fixed bottom-24 md:bottom-24 right-4 sm:right-6 z-[9999] w-[calc(100vw-2rem)] sm:w-[380px] h-[500px] max-h-[70vh] rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-card)] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300"
                    role="dialog"
                    aria-label="Live chat support"
                >
                    {/* Header */}
                    <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--color-border)] bg-[var(--color-bg-surface)]">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/15 flex items-center justify-center">
                            <MessageSquare size={18} className="text-[var(--color-brand-emerald)]" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-bold text-[var(--color-text-main)]">Urugwiro Support</h3>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-semibold text-[var(--color-text-muted)]">Online now</span>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="p-2 rounded-xl text-[var(--color-text-dim)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-elevated)] transition-colors cursor-pointer"
                            aria-label="Close chat"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 ld-scrollbar">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={cn('flex', msg.sender === 'user' ? 'justify-end' : 'justify-start')}
                            >
                                <div
                                    className={cn(
                                        'max-w-[80%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed',
                                        msg.sender === 'user'
                                            ? 'bg-[var(--color-brand-emerald)] text-white rounded-tr-sm'
                                            : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-main)] rounded-tl-sm'
                                    )}
                                >
                                    {msg.message}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-[var(--color-bg-elevated)] rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-text-dim)] animate-bounce" />
                                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-text-dim)] animate-bounce [animation-delay:0.2s]" />
                                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-text-dim)] animate-bounce [animation-delay:0.4s]" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Quick Replies */}
                    <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
                        {QUICK_REPLIES.map((reply) => (
                            <button
                                key={reply}
                                type="button"
                                onClick={() => handleSend(reply)}
                                className="shrink-0 px-3 py-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-input-bg)] text-[10px] font-semibold text-[var(--color-text-muted)] hover:border-[var(--color-brand-emerald)]/40 hover:text-[var(--color-brand-emerald)] transition-colors cursor-pointer"
                            >
                                {reply}
                            </button>
                        ))}
                    </div>

                    {/* Input */}
                    <div className="p-4 pt-2 border-t border-[var(--color-border)]">
                        <div className="flex items-center gap-2 rounded-xl border border-[var(--color-input-border)] bg-[var(--color-input-bg)] p-1.5 focus-within:border-[var(--color-brand-emerald)] transition-colors">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Type a message..."
                                className="flex-1 bg-transparent px-2 py-1.5 text-xs text-[var(--color-text-main)] outline-none placeholder:text-[var(--color-text-dim)]"
                                aria-label="Chat message input"
                            />
                            <button
                                type="button"
                                onClick={() => handleSend()}
                                disabled={!input.trim() || isTyping}
                                className="p-2 rounded-lg bg-[var(--color-brand-emerald)] text-white disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-all cursor-pointer"
                                aria-label="Send message"
                            >
                                <Send size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            {!isOpen && (
                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-24 md:bottom-8 right-4 sm:right-6 z-40 flex items-center gap-2.5 rounded-full px-4 py-3 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-white font-bold text-sm shadow-[0_4px_20px_rgba(16,185,129,0.4)] hover:shadow-[0_8px_30px_rgba(16,185,129,0.5)] hover:scale-105 active:scale-95 transition-all cursor-pointer group"
                    aria-label="Open live chat support"
                >
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                        <MessageSquare size={14} />
                    </div>
                    <span className="tracking-tight">Live Chat</span>
                    <span className="flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-white opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
                    </span>
                </button>
            )}
        </>
    );
};

function getAutoReply(message: string): string {
    const lower = message.toLowerCase();
    if (lower.includes('list') || lower.includes('property')) {
        return 'To list your property, go to your dashboard and click "List New Asset". You will need to provide property details, photos, and verification documents. Would you like me to guide you through the process?';
    }
    if (lower.includes('fee') || lower.includes('cost') || lower.includes('price')) {
        return 'Our listing fees vary by property type and listing tier. Basic listings are free, while featured listings start at 50,000 RWF/month. Would you like a detailed breakdown?';
    }
    if (lower.includes('escrow')) {
        return 'Escrow protection works by holding the buyer\'s deposit (typically 10%) in a regulated account until all transaction conditions are met. Funds are only released to the seller after title conveyance is notarized.';
    }
    if (lower.includes('human') || lower.includes('agent') || lower.includes('person')) {
        return 'I will connect you with a human agent. Please leave your phone number and email, and our team will reach out within 30 minutes during business hours (Mon-Sat, 8AM-6PM).';
    }
    return 'Thank you for your message. A support agent will review it shortly. Is there anything specific I can help you with in the meantime?';
}
