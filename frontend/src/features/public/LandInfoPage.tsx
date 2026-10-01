import React, { useState } from 'react';
import { BookOpen, ChevronRight, Search, ArrowLeft } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Article {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  readTime: string;
}

const ARTICLES: Article[] = [
  {
    id: 'land-registration-basics',
    title: 'Land Registration in Rwanda: A Complete Guide',
    category: 'Registration',
    excerpt: 'Learn how to register your land with the Rwanda Land Management and Use Authority (RLMUA).',
    content: 'Land registration in Rwanda is managed by the Rwanda Land Management and Use Authority (RLMUA). The process involves submitting your title deed, proof of identity, and payment of registration fees. Once registered, your land receives a Unique Parcel Identifier (UPI) number that serves as its official government ID.',
    readTime: '5 min read',
  },
  {
    id: 'ownership-types',
    title: 'Understanding Land Ownership Types',
    category: 'Ownership',
    excerpt: 'Freehold vs Leasehold: What you need to know about land tenure in Rwanda.',
    content: 'Rwanda recognizes several land tenure types: Freehold (permanent ownership), Leasehold (long-term lease, typically 49-99 years), and Customary (traditional land rights). Each type has different rights and restrictions. Freehold is the most common for residential and commercial properties.',
    readTime: '4 min read',
  },
  {
    id: 'land-use-zoning',
    title: 'Land Use and Zoning Regulations',
    category: 'Land Use',
    excerpt: 'What you can and cannot build on your land according to Rwandan zoning laws.',
    content: 'Rwanda zoning laws classify land into Residential (R1, R2, R3), Commercial (C1, C2), Industrial (I1, I2), and Agricultural zones. Each zone has specific building restrictions including maximum floor area ratio (FAR), building coverage ratio (BCR), and maximum height. Always check zoning before purchasing land.',
    readTime: '6 min read',
  },
  {
    id: 'land-disputes',
    title: 'Resolving Land Disputes',
    category: 'Disputes',
    excerpt: 'How to handle boundary disputes, inheritance conflicts, and ownership claims.',
    content: 'Land disputes in Rwanda can be resolved through mediation, the Land Commission, or the court system. Common disputes include boundary disagreements, inheritance conflicts, and overlapping claims. Always conduct a thorough land search before purchasing to avoid disputes.',
    readTime: '5 min read',
  },
  {
    id: 'land-taxes',
    title: 'Land Taxes and Fees',
    category: 'Taxes',
    excerpt: 'Property tax rates, transfer fees, and other costs associated with land ownership.',
    content: 'Landowners in Rwanda are subject to annual property tax (typically 0.1% of land value), transfer tax (2% of sale value), and notary fees. First-time buyers may qualify for tax exemptions. Always budget for these additional costs when purchasing land.',
    readTime: '4 min read',
  },
  {
    id: 'buying-land-safely',
    title: 'How to Buy Land Safely in Rwanda',
    category: 'Ownership',
    excerpt: 'Due diligence steps to ensure you are buying legitimate, dispute-free land.',
    content: 'Before buying land: 1) Conduct a land search at RLMUA, 2) Verify the title deed authenticity, 3) Check for any encumbrances or mortgages, 4) Visit the land with a surveyor, 5) Use a licensed notary for the transaction. Never buy land without completing these steps.',
    readTime: '7 min read',
  },
];

const CATEGORIES = ['All', 'Registration', 'Ownership', 'Land Use', 'Disputes', 'Taxes'];

const LandInfoPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const filteredArticles = ARTICLES.filter((article) => {
    const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
    const matchesSearch = !searchQuery || article.title.toLowerCase().includes(searchQuery.toLowerCase()) || article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (selectedArticle) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-deep)] text-[var(--color-text-main)]">
        <div className="mx-auto max-w-3xl px-4 py-8">
          <button
            onClick={() => setSelectedArticle(null)}
            className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition mb-6 cursor-pointer"
          >
            <ArrowLeft size={16} /> Back to articles
          </button>
          <article>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">{selectedArticle.category}</span>
            <h1 className="text-2xl font-bold mt-2 mb-4">{selectedArticle.title}</h1>
            <p className="text-xs text-[var(--color-text-dim)] mb-6">{selectedArticle.readTime}</p>
            <div className="prose prose-sm max-w-none">
              <p className="text-sm leading-relaxed text-[var(--color-text-muted)]">{selectedArticle.content}</p>
            </div>
          </article>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-deep)] text-[var(--color-text-main)]">
      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4">
            <BookOpen size={32} className="text-emerald-500" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Land Information Center</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-2 max-w-xl mx-auto">
            Educational resources about land registration, ownership, zoning, and legal processes in Rwanda.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-dim)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles..."
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] text-sm text-[var(--color-text-main)] outline-none focus:border-emerald-500/50"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                'px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer',
                selectedCategory === cat
                  ? 'bg-emerald-500 text-white'
                  : 'border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-emerald-500/30'
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredArticles.map((article) => (
            <button
              key={article.id}
              onClick={() => setSelectedArticle(article)}
              className="text-left rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5 transition-all hover:border-emerald-500/30 hover:shadow-lg cursor-pointer"
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">{article.category}</span>
              <h3 className="text-sm font-bold mt-2 mb-2 line-clamp-2">{article.title}</h3>
              <p className="text-xs text-[var(--color-text-muted)] line-clamp-2 mb-3">{article.excerpt}</p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[var(--color-text-dim)]">{article.readTime}</span>
                <ChevronRight size={14} className="text-[var(--color-text-dim)]" />
              </div>
            </button>
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <div className="text-center py-16">
            <p className="text-sm text-[var(--color-text-muted)]">No articles found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LandInfoPage;
