import React, { useState } from 'react';
import { Share2, Download, FileText, Image, MessageSquare, Mail, Copy, Check } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';

interface ShareStudioProps {
  listing?: any;
  agent?: any;
}

const ShareStudio: React.FC<ShareStudioProps> = ({ listing, agent }) => {
  const [copied, setCopied] = useState(false);
  const [shareFormat, setShareFormat] = useState<'whatsapp' | 'email' | 'pdf' | 'link'>('whatsapp');

  const shareText = listing
    ? `${listing.title} — ${Number(listing.price || 0).toLocaleString()} ${listing.currency || 'RWF'}\n${listing.address || 'Rwanda'}\n\nContact: ${agent?.full_name || 'Urugwiro Agent'}${agent?.phone ? ` | ${agent?.phone}` : ''}`
    : 'Check out this property on Urugwiro!';

  const shareUrl = listing
    ? `${window.location.origin}/listing/${listing.slug || listing.id}`
    : window.location.href;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = `${shareText}\n\n${shareUrl}`;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`;
    window.open(url, '_blank');
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(listing?.title || 'Property from Urugwiro');
    const body = encodeURIComponent(`${shareText}\n\n${shareUrl}`);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const handlePDF = () => {
    // Generate a simple printable view
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>${listing?.title || 'Property'}</title>
          <style>
            body { font-family: Inter, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
            h1 { color: #064e3b; font-size: 28px; margin-bottom: 8px; }
            .price { color: #059669; font-size: 24px; font-weight: bold; margin-bottom: 16px; }
            .location { color: #6b7280; margin-bottom: 24px; }
            .section { margin-bottom: 24px; }
            .section h2 { color: #064e3b; font-size: 18px; border-bottom: 2px solid #059669; padding-bottom: 8px; }
            .specs { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
            .spec { background: #f9fafb; padding: 12px; border-radius: 8px; }
            .spec-label { font-size: 12px; color: #6b7280; text-transform: uppercase; }
            .spec-value { font-size: 16px; font-weight: 600; color: #111827; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px; }
            .brand { color: #059669; font-weight: bold; font-size: 14px; }
          </style>
          </head>
          <body>
            <div class="brand">Urugwiro — Verified Real Estate</div>
            <h1>${listing?.title || 'Property'}</h1>
            <div class="price">${Number(listing?.price || 0).toLocaleString()} ${listing?.currency || 'RWF'}</div>
            <div class="location">${listing?.address || 'Rwanda'}</div>
            ${listing?.description ? `<div class="section"><h2>Description</h2><p>${listing.description}</p></div>` : ''}
            <div class="section">
              <h2>Specifications</h2>
              <div class="specs">
                ${Object.entries(listing?.asset || {}).map(([key, value]) => {
                  if (typeof value === 'string' || typeof value === 'number') {
                    return `<div class="spec"><div class="spec-label">${key.replace(/_/g, ' ')}</div><div class="spec-value">${String(value)}</div></div>`;
                  }
                  return '';
                }).join('')}
              </div>
            </div>
            <div class="footer">
              <p>Contact: ${agent?.full_name || 'Urugwiro Agent'}${agent?.phone ? ` | ${agent?.phone}` : ''}</p>
              <p>Generated on ${new Date().toLocaleDateString()} | Urugwiro Ltd</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 shadow-[var(--shadow-depth-1)]">
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-[var(--color-border)]">
        <Share2 size={18} className="text-[var(--color-brand-emerald)]" />
        <h3 className="text-base font-sans font-bold text-[var(--color-text-main)] tracking-tight">
          Quick-Share Studio
        </h3>
      </div>

      {/* Format Selector */}
      <div className="flex items-center gap-2 mb-6">
        {[
          { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
          { id: 'email', label: 'Email', icon: Mail },
          { id: 'pdf', label: 'PDF Brief', icon: FileText },
          { id: 'link', label: 'Copy Link', icon: Copy },
        ].map((fmt) => {
          const Icon = fmt.icon;
          return (
            <button
              key={fmt.id}
              onClick={() => setShareFormat(fmt.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border",
                shareFormat === fmt.id
                  ? "bg-emerald-500 text-white border-emerald-500"
                  : "bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] border-[var(--color-border)] hover:border-emerald-500/30"
              )}
            >
              <Icon size={14} />
              {fmt.label}
            </button>
          );
        })}
      </div>

      {/* Preview */}
      <div className="p-4 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] mb-6">
        <p className="text-[10px] uppercase font-bold text-[var(--color-text-dim)] mb-2">Preview</p>
        <p className="text-sm text-[var(--color-text-muted)] whitespace-pre-line">{shareText}</p>
        <p className="text-xs text-[var(--color-brand-emerald)] mt-2">{shareUrl}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {shareFormat === 'whatsapp' && (
          <Button
            variant="primary"
            className="flex-1 text-xs font-bold rounded-xl cursor-pointer flex items-center justify-center gap-2"
            onClick={handleWhatsApp}
          >
            <MessageSquare size={14} />
            Share via WhatsApp
          </Button>
        )}
        {shareFormat === 'email' && (
          <Button
            variant="primary"
            className="flex-1 text-xs font-bold rounded-xl cursor-pointer flex items-center justify-center gap-2"
            onClick={handleEmail}
          >
            <Mail size={14} />
            Share via Email
          </Button>
        )}
        {shareFormat === 'pdf' && (
          <Button
            variant="primary"
            className="flex-1 text-xs font-bold rounded-xl cursor-pointer flex items-center justify-center gap-2"
            onClick={handlePDF}
          >
            <FileText size={14} />
            Generate PDF Brief
          </Button>
        )}
        {shareFormat === 'link' && (
          <Button
            variant="primary"
            className="flex-1 text-xs font-bold rounded-xl cursor-pointer flex items-center justify-center gap-2"
            onClick={handleCopy}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ShareStudio;
