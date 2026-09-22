import React, { useState } from 'react';
import { CheckCircle2, Mail, MapPin, Phone, Clock, Send } from 'lucide-react';
import { PageHero } from '../../components/layout/PageHero';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus(null);
    setLoading(true);
    try {
      const response = await fetch('/api/public/contact/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error('Could not send the message. Please try again.');
      setStatus({ type: 'success', text: 'Your message has been sent. We\'ll get back to you within 24 hours.' });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      setStatus({
        type: 'error',
        text: error instanceof Error ? error.message : 'Could not send the message. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "mt-2 w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all";

  return (
    <div style={{ background: 'var(--color-bg-deep)', color: 'var(--color-text-main)' }} className="transition-colors duration-300">
      <PageHero
        eyebrow="Contact"
        title="Get in touch with our team."
        description="Questions about a listing, selling your property, or using Urugwiro? We're here to help."
      />

      {/* Contact Cards */}
      <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon: Mail, title: 'Email', detail: 'support@urugwiro.com', href: 'mailto:support@urugwiro.com' },
            { icon: Phone, title: 'Phone', detail: '+250 788 123 456', href: 'tel:+250788123456' },
            { icon: MapPin, title: 'Office', detail: 'KG 123 St, Kigali Heights, Rwanda', href: undefined },
          ].map(({ icon: Icon, title, detail, href }) => (
            <a
              key={title}
              href={href}
              className="rounded-2xl border p-6 transition-all hover:border-emerald-500/30 group block oneui-card"
              style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)', boxShadow: 'var(--shadow-depth-1)' }}
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                <Icon size={18} />
              </div>
              <h2 className="font-bold" style={{ color: 'var(--color-text-main)' }}>{title}</h2>
              <p className="mt-1 text-sm" style={{ color: 'var(--color-text-muted)' }}>{detail}</p>
            </a>
          ))}
        </div>

        {/* Form + Sidebar */}
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          <form onSubmit={handleSubmit} className="rounded-2xl border p-7 md:p-9"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)', boxShadow: 'var(--shadow-depth-2)' }}>
            <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--color-text-main)' }}>Send a message</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>We typically respond within 24 hours on business days.</p>

            {status && (
              <div
                className={cn(
                  'mb-6 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm',
                  status.type === 'success'
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500'
                    : 'border-red-500/30 bg-red-500/10 text-red-400'
                )}
              >
                <CheckCircle2 size={16} />
                {status.text}
              </div>
            )}

            <div className="grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Full Name</span>
                <input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={inputClass}
                  style={{ background: 'var(--color-input-bg)', borderColor: 'var(--color-input-border)', color: 'var(--color-text-main)' }}
                  onFocus={e => e.currentTarget.style.borderColor = 'rgba(16,185,129,0.5)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--color-input-border)'}
                  placeholder="Your name"
                />
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Email</span>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={inputClass}
                  style={{ background: 'var(--color-input-bg)', borderColor: 'var(--color-input-border)', color: 'var(--color-text-main)' }}
                  onFocus={e => e.currentTarget.style.borderColor = 'rgba(16,185,129,0.5)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--color-input-border)'}
                  placeholder="you@email.com"
                />
              </label>
            </div>

            <label className="mt-5 block">
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Subject</span>
              <input
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className={inputClass}
                style={{ background: 'var(--color-input-bg)', borderColor: 'var(--color-input-border)', color: 'var(--color-text-main)' }}
                onFocus={e => e.currentTarget.style.borderColor = 'rgba(16,185,129,0.5)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--color-input-border)'}
                placeholder="What's this about?"
              />
            </label>

            <label className="mt-5 block">
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Message</span>
              <textarea
                required
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className={inputClass + " resize-none"}
                style={{ background: 'var(--color-input-bg)', borderColor: 'var(--color-input-border)', color: 'var(--color-text-main)' }}
                onFocus={e => e.currentTarget.style.borderColor = 'rgba(16,185,129,0.5)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--color-input-border)'}
                placeholder="Tell us more..."
              />
            </label>

            <Button
              type="submit"
              className="mt-6 rounded-xl px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-all shadow-lg shadow-emerald-500/20"
              disabled={loading}
              isLoading={loading}
            >
              <Send size={15} className="mr-2 inline" /> Send Message
            </Button>
          </form>

          <aside className="rounded-2xl border p-7 h-fit"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)', boxShadow: 'var(--shadow-depth-1)' }}>
            <div className="flex items-center gap-2 mb-5">
              <Clock size={16} className="text-emerald-500" />
              <h2 className="font-bold" style={{ color: 'var(--color-text-main)' }}>Support Hours</h2>
            </div>
            <ul className="space-y-3 text-sm" style={{ color: 'var(--color-text-muted)' }}>
              <li className="flex justify-between pb-3" style={{ borderBottom: '1px solid var(--color-border)' }}><span>Monday – Friday</span><span className="font-medium" style={{ color: 'var(--color-text-main)' }}>9:00 – 18:00</span></li>
              <li className="flex justify-between pb-3" style={{ borderBottom: '1px solid var(--color-border)' }}><span>Saturday</span><span className="font-medium" style={{ color: 'var(--color-text-main)' }}>10:00 – 14:00</span></li>
              <li className="flex justify-between"><span>Sunday</span><span style={{ color: 'var(--color-text-dim)' }}>Closed</span></li>
            </ul>

            <div className="mt-8 pt-6" style={{ borderTop: '1px solid var(--color-border)' }}>
              <h3 className="font-bold mb-2" style={{ color: 'var(--color-text-main)' }}>Urgent Issues</h3>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>For urgent property matters outside business hours:</p>
              <a href="tel:+250788999999" className="mt-2 inline-block text-sm font-semibold text-emerald-500 hover:text-emerald-400 transition-colors">
                +250 788 999 999
              </a>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
