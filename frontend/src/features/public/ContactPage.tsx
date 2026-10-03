import React, { useState } from 'react';
import { CheckCircle2, Send } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { PageHero } from '../../components/layout/PageHero';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';
import { api } from '../../api/endpoints';

const ContactPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: searchParams.get('subject') || '',
    message: '',
  });
  const [status, setStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus(null);
    setLoading(true);
    try {
      await api.public.contactSubmit(formData);
      setStatus({ type: 'success', text: 'Your message has been sent to the Urugwiro team.' });
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

      <section className="mx-auto max-w-4xl px-5 py-14 lg:px-8">
        <div>
          <form onSubmit={handleSubmit} className="rounded-lg border p-7 md:p-9"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)', boxShadow: 'var(--shadow-depth-2)' }}>
            <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--color-text-main)' }}>Send a message</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>Share enough detail for the team to route your request correctly.</p>

            {status && (
              <div
                className={cn(
                'mb-6 flex items-center gap-2 rounded-lg border px-4 py-3 text-sm',
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
              className="mt-6 rounded-lg px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-all shadow-lg shadow-emerald-500/20"
              disabled={loading}
              isLoading={loading}
            >
              <Send size={15} className="mr-2 inline" /> Send Message
            </Button>
          </form>

        </div>
      </section>
    </div>
  );
};

export default ContactPage;
