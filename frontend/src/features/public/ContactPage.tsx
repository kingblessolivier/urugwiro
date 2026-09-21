import React, { useState } from 'react';
import { CheckCircle2, Mail, MapPin, Phone } from 'lucide-react';
import { PageHero } from '../../components/layout/PageHero';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
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
      setStatus({ type: 'success', text: 'Your message has been sent. We will get back to you soon.' });
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      setStatus({
        type: 'error',
        text: error instanceof Error ? error.message : 'Could not send the message. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHero
        eyebrow="Support"
        title="Get in touch"
        description="Questions about a listing, selling, or using Urugwiro? Send a message or use the contact details below."
      />

      <section className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          <a href="mailto:support@urugwiro.com" className="rounded-2xl border border-slate-200 bg-white p-6">
            <Mail className="text-emerald-700" size={20} />
            <h2 className="mt-4 font-semibold">Email</h2>
            <p className="mt-1 text-sm text-slate-600">support@urugwiro.com</p>
          </a>
          <a href="tel:+250788123456" className="rounded-2xl border border-slate-200 bg-white p-6">
            <Phone className="text-emerald-700" size={20} />
            <h2 className="mt-4 font-semibold">Phone</h2>
            <p className="mt-1 text-sm text-slate-600">+250 788 123 456</p>
          </a>
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <MapPin className="text-emerald-700" size={20} />
            <h2 className="mt-4 font-semibold">Office</h2>
            <p className="mt-1 text-sm text-slate-600">KG 123 St, Kigali Heights, Kigali, Rwanda</p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
            <h2 className="text-xl font-semibold">Send a message</h2>
            {status ? (
              <div
                className={cn(
                  'mt-4 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm',
                  status.type === 'success'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'border-red-200 bg-red-50 text-red-700'
                )}
              >
                <CheckCircle2 size={16} />
                {status.text}
              </div>
            ) : null}
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">
                Full name
                <input
                  required
                  value={formData.name}
                  onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-emerald-600"
                />
              </label>
              <label className="text-sm font-medium text-slate-700">
                Email
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-emerald-600"
                />
              </label>
            </div>
            <label className="mt-4 block text-sm font-medium text-slate-700">
              Message
              <textarea
                required
                rows={6}
                value={formData.message}
                onChange={(event) => setFormData({ ...formData, message: event.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-emerald-600"
              />
            </label>
            <Button type="submit" className="mt-6" disabled={loading} isLoading={loading}>
              Send message
            </Button>
          </form>

          <aside className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold">Support hours</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li className="flex justify-between border-b border-slate-100 py-2"><span>Monday – Friday</span><span>9:00 – 18:00</span></li>
              <li className="flex justify-between border-b border-slate-100 py-2"><span>Saturday</span><span>10:00 – 14:00</span></li>
              <li className="flex justify-between py-2"><span>Sunday</span><span>Closed</span></li>
            </ul>
            <h3 className="mt-8 text-lg font-semibold">Urgent issues</h3>
            <p className="mt-2 text-sm text-slate-600">For urgent property issues outside business hours, the template listed an emergency line:</p>
            <a href="tel:+250788999999" className="mt-3 inline-block text-sm font-medium text-emerald-700">+250 788 999 999</a>
          </aside>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white px-4 py-12 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-2xl font-semibold">Find us</h2>
          <p className="mt-2 text-slate-600">KG 123 St, Kigali Heights, Kigali, Rwanda</p>
          <a
            className="mt-4 inline-flex text-sm font-medium text-emerald-700"
            href="https://maps.google.com?q=KG+123+St,+Kigali+Heights,+Kigali,+Rwanda"
            target="_blank"
            rel="noreferrer"
          >
            Open in Google Maps
          </a>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
