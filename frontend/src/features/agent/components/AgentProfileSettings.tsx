import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, User, Award, Phone, Mail, FileText, CheckCircle2, Star, Copy, ExternalLink } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { api } from '../../../api/endpoints';

export const AgentProfileSettings: React.FC = () => {
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['agent-profile'],
    queryFn: async () => {
      const res = await api.agent.profile();
      return res.data;
    },
  });

  const [licenseNumber, setLicenseNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    if (profile) {
      setLicenseNumber(profile.license_number || '');
      setPhone(profile.phone || '');
      setSpecialization(profile.specialization || '');
      setBio(profile.bio || '');
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      return api.agent.updateProfile({
        license_number: licenseNumber,
        phone_number: phone,
        specialization,
        bio,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-profile'] });
      queryClient.invalidateQueries({ queryKey: ['agent-dashboard'] });
    },
  });

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/agent/${profile?.id || 'certified'}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return <div className="p-8 text-center text-zinc-400">Loading broker credentials...</div>;
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <Award size={22} className="text-emerald-500" /> Broker Accreditation & Public Profile
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Manage regulatory licensing, geographic expertise, and public sovereign broker portfolio.
        </p>
      </div>

      {/* Credential Status Card */}
      <div className="rounded-3xl border border-zinc-200 dark:border-white/10 bg-gradient-to-br from-emerald-500/10 via-zinc-50 dark:via-white/[0.02] to-transparent p-6 shadow-sm">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-emerald-950/20">
              {profile?.name?.charAt(0) || 'A'}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">{profile?.name || 'Field Broker'}</h2>
                {profile?.is_verified ? (
                  <Badge className="bg-emerald-500 text-white text-[10px] font-bold">
                    <ShieldCheck size={12} className="mr-1" /> Certified Broker
                  </Badge>
                ) : (
                  <Badge className="bg-zinc-700 text-zinc-300 text-[10px] font-bold">
                    Pending Verification
                  </Badge>
                )}
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                License: {profile?.license_number || 'Pending Registration'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-center px-4 py-2 rounded-2xl bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10">
              <span className="text-xs font-bold text-zinc-400 uppercase block">Rating</span>
              <span className="text-base font-bold text-amber-500 flex items-center gap-1 justify-center">
                <Star size={14} fill="currentColor" /> {profile?.rating !== undefined && profile?.rating !== null ? Number(profile.rating).toFixed(1) : '0.0'}
              </span>
            </div>
            <div className="text-center px-4 py-2 rounded-2xl bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10">
              <span className="text-xs font-bold text-zinc-400 uppercase block">Deals Closed</span>
              <span className="text-base font-bold font-mono text-emerald-500">
                {profile?.total_deals || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="rounded-3xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/[0.02] p-6 space-y-4">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <FileText size={16} className="text-emerald-500" /> Regulatory & Profile Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              RERA License Registry ID
            </label>
            <input
              type="text"
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
              className="w-full p-3 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 text-xs font-mono font-bold text-zinc-900 dark:text-white outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Official WhatsApp / Mobile
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-3 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 text-xs font-mono text-zinc-900 dark:text-white outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Market Specialization & Focus Areas
          </label>
          <input
            type="text"
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            placeholder="e.g. Prime Residential Villas in Nyarutarama & Kiyovu, Titled Land Parcels in Gasabo"
            className="w-full p-3 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 text-xs text-zinc-900 dark:text-white outline-none focus:border-emerald-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Broker Professional Biography
          </label>
          <textarea
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Highlight your conveyance experience, client advisory record, and transactional expertise in Rwanda..."
            className="w-full p-3 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 text-xs text-zinc-900 dark:text-white outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex justify-between items-center pt-2">
          <button
            type="button"
            onClick={handleCopyLink}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 hover:underline"
          >
            <Copy size={13} /> {copied ? 'Link Copied!' : 'Copy Public Broker Portfolio Link'}
          </button>
          <Button
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending}
            className="rounded-2xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5"
          >
            {updateMutation.isPending ? 'Saving...' : 'Save Profile Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
};
