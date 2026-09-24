import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Zap,
  Waves,
  Shield,
  Building2,
  Sun,
  Compass,
  Heart,
  Key,
  Wifi,
  Coffee,
  Trees,
  Plus,
  Trash2,
  CheckCircle2,
  Layers,
  type LucideIcon,
} from 'lucide-react';

export interface DiscoverySectionItem {
  id: string;
  title: string;
  category: string;
  description: string;
  highlights: string[];
  icon: string;
}

export const DISCOVERY_ICONS: Record<string, LucideIcon> = {
  Sparkles,
  Zap,
  Waves,
  Shield,
  Building2,
  Sun,
  Compass,
  Heart,
  Key,
  Wifi,
  Coffee,
  Trees,
  Layers,
};

interface AddDiscoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (section: DiscoverySectionItem) => void;
  initialData?: DiscoverySectionItem | null;
}

export const AddDiscoveryModal: React.FC<AddDiscoveryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [category, setCategory] = useState(initialData?.category || 'Luxury Lifestyle');
  const [description, setDescription] = useState(initialData?.description || '');
  const [selectedIcon, setSelectedIcon] = useState(initialData?.icon || 'Sparkles');
  const [highlights, setHighlights] = useState<string[]>(
    initialData?.highlights?.length ? initialData.highlights : ['']
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state if initialData changes
  React.useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setCategory(initialData.category || 'Luxury Lifestyle');
      setDescription(initialData.description || '');
      setSelectedIcon(initialData.icon || 'Sparkles');
      setHighlights(initialData.highlights?.length ? initialData.highlights : ['']);
    } else {
      setTitle('');
      setCategory('Luxury Lifestyle');
      setDescription('');
      setSelectedIcon('Sparkles');
      setHighlights(['']);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const quickCategories = [
    'Luxury Lifestyle',
    'Energy & Resilience',
    'Smart Automation',
    'Architecture & Design',
    'Wellness & Leisure',
    'Security & Privacy',
    'Investment & ROI',
  ];

  const handleAddHighlight = () => {
    setHighlights((prev) => [...prev, '']);
  };

  const handleUpdateHighlight = (index: number, val: string) => {
    setHighlights((prev) => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };

  const handleRemoveHighlight = (index: number) => {
    setHighlights((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    const validHighlights = highlights.map((h) => h.trim()).filter(Boolean);

    const section: DiscoverySectionItem = {
      id: initialData?.id || `discovery-${Date.now()}`,
      title: title.trim(),
      category: category.trim(),
      description: description.trim(),
      highlights: validHighlights,
      icon: selectedIcon,
    };

    onSave(section);
    setIsSubmitting(false);
    onClose();
  };

  const ActiveIconComponent = DISCOVERY_ICONS[selectedIcon] || Sparkles;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0b101b] p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ActiveIconComponent size={20} />
            </div>
            <div>
              <span className="font-mono text-emerald-400 font-bold text-xs uppercase tracking-wider block">
                {initialData ? 'Edit Discovery Section' : 'Create New Discovery'}
              </span>
              <h3 className="text-xl font-bold text-white mt-0.5">
                {initialData ? 'Update Property Highlight' : 'Add Bespoke Feature & Discovery'}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white bg-white/[0.04] hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
              Section Title <span className="text-emerald-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Rooftop Sky Lounge & Cocktail Terrace"
              className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Category / Theme */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
              Theme / Category
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {quickCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                    category === cat
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-sm shadow-emerald-500/20'
                      : 'bg-white/[0.02] border-white/10 text-zinc-400 hover:text-zinc-200 hover:border-white/20'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Or enter custom category tag..."
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Icon Selector */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
              Discovery Icon
            </label>
            <div className="grid grid-cols-6 sm:grid-cols-12 gap-2">
              {Object.keys(DISCOVERY_ICONS).map((iconKey) => {
                const IconComp = DISCOVERY_ICONS[iconKey];
                const isSelected = selectedIcon === iconKey;
                return (
                  <button
                    key={iconKey}
                    type="button"
                    onClick={() => setSelectedIcon(iconKey)}
                    className={`p-2.5 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 ring-2 ring-emerald-500/20 shadow-md'
                        : 'bg-white/[0.02] border-white/10 text-zinc-400 hover:text-white hover:border-white/20'
                    }`}
                    title={iconKey}
                  >
                    <IconComp size={16} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
              Narrative Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this feature in detail to captivate prospective buyers and tenants..."
              className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-emerald-500 transition-colors resize-none leading-relaxed"
            />
          </div>

          {/* Bulleted Highlights */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
                Key Points & Specs ({highlights.filter((h) => h.trim()).length})
              </label>
              <button
                type="button"
                onClick={handleAddHighlight}
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 cursor-pointer"
              >
                <Plus size={13} /> Add Point
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {highlights.map((highlight, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={12} />
                  </div>
                  <input
                    type="text"
                    value={highlight}
                    onChange={(e) => handleUpdateHighlight(idx, e.target.value)}
                    placeholder={`e.g. 15 kVA MultiPlus-II Inverter with 30 kWh Lithium Battery`}
                    className="flex-1 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                  {highlights.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveHighlight(idx)}
                      className="p-2 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-zinc-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles size={14} />
              <span>{initialData ? 'Save Discovery Section' : 'Publish Discovery Section'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
