import React, { useState } from 'react';
import { Search, ChevronDown, ChevronRight, BookOpen, MessageCircle, CreditCard, Home, Shield, HelpCircle, ExternalLink } from 'lucide-react';
import { cn } from '../lib/utils';

interface FAQItem {
    question: string;
    answer: string;
    category: string;
}

interface HelpCategory {
    id: string;
    title: string;
    icon: React.ElementType;
    description: string;
    articles: { title: string; url: string }[];
}

const HELP_CATEGORIES: HelpCategory[] = [
    {
        id: 'getting-started',
        title: 'Getting Started',
        icon: BookOpen,
        description: 'Learn the basics of using Urugwiro',
        articles: [
            { title: 'How to create an account', url: '#' },
            { title: 'Navigating the dashboard', url: '#' },
            { title: 'Setting up your profile', url: '#' },
        ],
    },
    {
        id: 'listings',
        title: 'Managing Listings',
        icon: Home,
        description: 'Create and manage property listings',
        articles: [
            { title: 'Creating a new listing', url: '#' },
            { title: 'Uploading photos and media', url: '#' },
            { title: 'Setting pricing and terms', url: '#' },
        ],
    },
    {
        id: 'payments',
        title: 'Payments & Escrow',
        icon: CreditCard,
        description: 'Understanding payments and escrow protection',
        articles: [
            { title: 'How escrow protection works', url: '#' },
            { title: 'Payment methods accepted', url: '#' },
            { title: 'Refund policy', url: '#' },
        ],
    },
    {
        id: 'verification',
        title: 'Verification & Trust',
        icon: Shield,
        description: 'Verification process and trust badges',
        articles: [
            { title: 'Property verification process', url: '#' },
            { title: 'Title deed verification', url: '#' },
            { title: 'Agent verification', url: '#' },
        ],
    },
];

const FAQ_ITEMS: FAQItem[] = [
    {
        question: 'How do I list my property for sale or rent?',
        answer: 'Navigate to your dashboard, click "List New Asset", and follow the 6-step wizard. You will need to provide property details, upload photos, set pricing, and submit verification documents.',
        category: 'listings',
    },
    {
        question: 'What is escrow protection?',
        answer: 'Escrow protection ensures that buyer deposits (typically 10%) are held securely until all transaction conditions are met. Funds are only released to the seller after title conveyance is notarized.',
        category: 'payments',
    },
    {
        question: 'How does property verification work?',
        answer: 'Submit the requested ownership and identity documents with the listing. A verification badge is issued only after platform staff approve every required document; rejected or outstanding documents keep the listing unverified.',
        category: 'verification',
    },
    {
        question: 'What payment methods are accepted?',
        answer: 'We accept MTN MoMo, Airtel Money, credit/debit cards, and bank transfers. All payments are processed through secure, PCI-compliant channels.',
        category: 'payments',
    },
    {
        question: 'How do I schedule a property viewing?',
        answer: 'On any listing page, click "Schedule Showing". Choose your preferred date and time slot, and the agent will confirm your appointment via SMS and email.',
        category: 'getting-started',
    },
    {
        question: 'What is a UPI number?',
        answer: 'UPI (Unique Parcel Identifier) is the official cadastral identification number for land parcels in Rwanda. It follows the format P/DD/SS/CC/NNNN and is essential for land transactions.',
        category: 'verification',
    },
];

export const HelpCenter: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
    const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

    const filteredFAQs = FAQ_ITEMS.filter(
        (faq) =>
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredCategories = HELP_CATEGORIES.filter((cat) =>
        cat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="text-center mb-10">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-4">
                    <HelpCircle size={32} className="text-emerald-500" />
                </div>
                <h1 className="text-3xl font-bold text-[var(--color-text-main)] mb-2">Help Center</h1>
                <p className="text-sm text-[var(--color-text-muted)] max-w-md mx-auto">
                    Find answers to common questions and learn how to use Urugwiro effectively.
                </p>
            </div>

            {/* Search */}
            <div className="relative mb-8">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-dim)]" />
                <input
                    type="text"
                    placeholder="Search for help..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-[var(--color-input-border)] bg-[var(--color-input-bg)] pl-11 pr-4 py-3 text-sm text-[var(--color-text-main)] outline-none focus:border-[var(--color-brand-emerald)] transition-colors"
                    aria-label="Search help articles"
                />
            </div>

            {/* Categories */}
            {!searchQuery && (
                <section className="mb-10">
                    <h2 className="text-lg font-bold text-[var(--color-text-main)] mb-4">Browse by Topic</h2>
                    <div className="grid gap-3 sm:grid-cols-2">
                        {HELP_CATEGORIES.map((category) => {
                            const Icon = category.icon;
                            const isExpanded = expandedCategory === category.id;
                            return (
                                <div
                                    key={category.id}
                                    className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] overflow-hidden ld-card-hover"
                                >
                                    <button
                                        type="button"
                                        onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                                        className="w-full flex items-center gap-3 p-4 text-left cursor-pointer"
                                        aria-expanded={isExpanded}
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                                            <Icon size={18} className="text-[var(--color-brand-emerald)]" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-semibold text-[var(--color-text-main)]">{category.title}</h3>
                                            <p className="text-[11px] text-[var(--color-text-muted)]">{category.description}</p>
                                        </div>
                                        {isExpanded ? (
                                            <ChevronDown size={16} className="text-[var(--color-text-dim)] shrink-0" />
                                        ) : (
                                            <ChevronRight size={16} className="text-[var(--color-text-dim)] shrink-0" />
                                        )}
                                    </button>
                                    {isExpanded && (
                                        <div className="px-4 pb-4 space-y-1 border-t border-[var(--color-border)] pt-3">
                                            {category.articles.map((article, idx) => (
                                                <a
                                                    key={idx}
                                                    href={article.url}
                                                    className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-xs text-[var(--color-text-muted)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-main)] transition-colors"
                                                >
                                                    <span>{article.title}</span>
                                                    <ExternalLink size={12} className="shrink-0 opacity-50" />
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* FAQ */}
            <section>
                <h2 className="text-lg font-bold text-[var(--color-text-main)] mb-4">
                    {searchQuery ? `Search Results (${filteredFAQs.length})` : 'Frequently Asked Questions'}
                </h2>
                {filteredFAQs.length === 0 ? (
                    <div className="text-center py-12 rounded-2xl border border-dashed border-[var(--color-border)]">
                        <MessageCircle size={32} className="mx-auto text-[var(--color-text-dim)] mb-3" />
                        <p className="text-sm text-[var(--color-text-muted)]">No results found for "{searchQuery}"</p>
                        <p className="text-xs text-[var(--color-text-dim)] mt-1">Try different keywords or browse topics above.</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filteredFAQs.map((faq, idx) => {
                            const isExpanded = expandedFAQ === idx;
                            return (
                                <div
                                    key={idx}
                                    className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] overflow-hidden ld-card-hover"
                                >
                                    <button
                                        type="button"
                                        onClick={() => setExpandedFAQ(isExpanded ? null : idx)}
                                        className="w-full flex items-center justify-between gap-3 p-4 text-left cursor-pointer"
                                        aria-expanded={isExpanded}
                                    >
                                        <span className="text-sm font-semibold text-[var(--color-text-main)]">{faq.question}</span>
                                        {isExpanded ? (
                                            <ChevronDown size={16} className="text-[var(--color-text-dim)] shrink-0" />
                                        ) : (
                                            <ChevronRight size={16} className="text-[var(--color-text-dim)] shrink-0" />
                                        )}
                                    </button>
                                    {isExpanded && (
                                        <div className="px-4 pb-4 border-t border-[var(--color-border)] pt-3">
                                            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">{faq.answer}</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Contact Support */}
            <section className="mt-10 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 text-center">
                <h3 className="text-sm font-bold text-[var(--color-text-main)] mb-2">Still need help?</h3>
                <p className="text-xs text-[var(--color-text-muted)] mb-4">
                    Our support team is available 24/7 to assist you.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                    <a
                        href="https://wa.me/250788123456"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-brand-emerald)] text-white text-xs font-bold hover:opacity-90 transition-opacity"
                    >
                        <MessageCircle size={14} />
                        <span>WhatsApp Support</span>
                    </a>
                    <a
                        href="/contact"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-main)] text-xs font-bold hover:bg-[var(--color-bg-elevated)] transition-colors"
                    >
                        <HelpCircle size={14} />
                        <span>Contact Form</span>
                    </a>
                </div>
            </section>
        </div>
    );
};
