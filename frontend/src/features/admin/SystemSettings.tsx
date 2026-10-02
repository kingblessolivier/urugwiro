import React, { useState, useEffect, useCallback } from 'react';
import { Cpu, Key, CheckCircle2, AlertCircle, Eye, EyeOff, Sparkles, RefreshCw, Zap } from 'lucide-react';
import { api } from '../../api/endpoints';

interface SystemSetting {
    id: number;
    key: string;
    value: string;
    description: string;
    is_secret: boolean;
    updated_at: string;
}

const SystemSettings: React.FC = () => {
    const [settings, setSettings] = useState<SystemSetting[]>([]);
    const [loading, setLoading] = useState(true);
    const [newSetting, setNewSetting] = useState({ key: '', value: '', description: '' });
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // NVIDIA AI State
    const [nvidiaKey, setNvidiaKey] = useState('');
    const [selectedModel, setSelectedModel] = useState('meta/llama-3.2-11b-vision-instruct');
    const [showKey, setShowKey] = useState(false);
    const [nvidiaConfigured, setNvidiaConfigured] = useState(false);
    const [isTestingNvidia, setIsTestingNvidia] = useState(false);
    const [nvidiaStatus, setNvidiaStatus] = useState<{ success: boolean; message: string; model?: string } | null>(null);

    const fetchSettings = useCallback(async () => {
        try {
            const response = await api.settings.get();
            const data: SystemSetting[] = Array.isArray(response.data) ? response.data : [];
            setSettings(data);

            // Look for existing NVIDIA API Key and Model
            const existingNvidia = data.find(s => s.key.toUpperCase() === 'NVIDIA_AI_API_KEY' || s.key.toUpperCase() === 'NVIDIA_API_KEY');
            setNvidiaConfigured(Boolean(existingNvidia));
            const existingModel = data.find(s => s.key.toUpperCase() === 'NVIDIA_AI_MODEL' || s.key.toUpperCase() === 'NVIDIA_MODEL');
            if (existingModel?.value) {
                setSelectedModel(existingModel.value);
            }
        } catch (error: any) {
            const errText = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to fetch settings';
            setMessage({ type: 'error', text: errText });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchSettings();
        }, 0);
        return () => clearTimeout(timer);
    }, [fetchSettings]);

    const handleSaveNvidiaKey = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        if (!nvidiaKey.trim()) return;

        try {
            await api.settings.update({
                key: 'NVIDIA_AI_API_KEY',
                value: nvidiaKey.trim(),
                description: `NVIDIA NIM API Key for ${selectedModel} (Auto-Valuation, Document OCR, AI Concierge)`
            });

            await api.settings.update({
                key: 'NVIDIA_AI_MODEL',
                value: selectedModel,
                description: 'Active NVIDIA NIM model architecture'
            });

            setMessage({ type: 'success', text: 'NVIDIA NIM API Key and Model saved successfully!' });
            setNvidiaConfigured(true);
            setNvidiaKey('');
            fetchSettings();
        } catch (err: any) {
            const errText = err.response?.data?.error || err.response?.data?.detail || err.response?.data?.message || err.message || 'Failed to save NVIDIA API Key';
            setMessage({ type: 'error', text: typeof errText === 'object' ? JSON.stringify(errText) : String(errText) });
        }
    };

    const handleTestNvidia = async () => {
        setIsTestingNvidia(true);
        setNvidiaStatus(null);
        try {
            const response = await api.settings.testAI(selectedModel);
            setNvidiaStatus(response.data);
        } catch (err: any) {
            const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message;
            setNvidiaStatus({
                success: false,
                message: `Connection test failed: ${errorMsg}`
            });
        } finally {
            setIsTestingNvidia(false);
        }
    };


    const handleSaveSetting = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        try {
            await api.settings.update(newSetting);

            setMessage({ type: 'success', text: 'Setting saved successfully!' });
            setNewSetting({ key: '', value: '', description: '' });
            fetchSettings();
        } catch (error: any) {
            const errText = error.response?.data?.error || error.response?.data?.detail || error.response?.data?.message || error.message || 'Failed to save setting';
            setMessage({ type: 'error', text: typeof errText === 'object' ? JSON.stringify(errText) : String(errText) });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full text-[var(--color-text-dim)] py-20">
                Loading system configurations...
            </div>
        );
    }

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-10 selection:bg-emerald-500/30 selection:text-[#fff]">
            <div className="border-b border-[var(--color-border)] pb-6">
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-[var(--color-brand-emerald)] mb-1">
                    <Cpu size={14} /> System Parameters & AI Configurations
                </div>
                <h1 className="text-3xl lg:text-4xl font-sans font-bold text-[var(--color-text-main)] tracking-tight">System Configurations</h1>
            </div>

            {message && (
                <div className={`p-4 rounded-lg border ${
                    message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-[var(--color-brand-emerald)]' : 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/30 dark:text-rose-400'
                } flex items-center gap-2.5 text-sm font-medium`}>
                    {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    {message.text}
                </div>
            )}

            {/* 1. DEDICATED NVIDIA NIM AI CONSOLE */}
            <div className="rounded-lg border border-emerald-500/30 bg-[var(--color-bg-surface)] p-8 space-y-6 shadow-[var(--shadow-depth-1)] relative overflow-hidden">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[var(--color-border)] pb-6">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg bg-emerald-600 dark:bg-emerald-500 flex items-center justify-center text-[#fff] font-bold shadow-[var(--shadow-emerald-soft)]">
                            <Zap size={24} strokeWidth={2} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-bold text-[var(--color-text-main)]">NVIDIA NIM AI Accelerator</h2>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {nvidiaConfigured ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-accent-soft-bg)] text-[var(--color-brand-emerald)] border border-emerald-500/40 text-xs font-bold">
                                    <span className="h-2 w-2 rounded-full bg-emerald-400" /> Key Configured
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40 text-xs font-bold">
                                Missing Key
                            </span>
                        )}
                    </div>
                </div>

                <form onSubmit={handleSaveNvidiaKey} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {/* API Key Input */}
                        <div className="md:col-span-2 space-y-2">
                            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                                NVIDIA NIM API Key (build.nvidia.com)
                            </label>
                            <div className="relative">
                                <Key size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                                <input
                                    type={showKey ? "text" : "password"}
                                    value={nvidiaKey}
                                    onChange={(e) => setNvidiaKey(e.target.value)}
                                    placeholder="nvapi-..."
                                    autoComplete="new-password"
                                    className="w-full bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-lg py-2.5 pl-10 pr-12 text-sm text-[var(--color-text-main)] placeholder:text-[var(--color-text-dim)] outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 font-mono transition-all"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowKey(!showKey)}
                                    aria-label={showKey ? 'Hide API key' : 'Show API key'}
                                    title={showKey ? 'Hide API key' : 'Show API key'}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition-colors"
                                >
                                    {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Preferred Model */}
                        <div className="space-y-2">
                            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                                Inference Model
                            </label>
                            <select
                                value={selectedModel}
                                onChange={(e) => setSelectedModel(e.target.value)}
                                className="w-full bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-lg py-2.5 px-3 text-sm text-[var(--color-text-main)] outline-none focus:border-emerald-500/50 transition-all"
                            >
                                <option value="meta/llama-3.2-11b-vision-instruct">Meta Llama 3.2 11B Vision Instruct</option>
                                <option value="nvidia/nemotron-3.5-lightning-30b-a3b">NVIDIA Nemotron 3.5 Lightning 30B</option>
                                <option value="nvidia/nemotron-3-ultra-550b-a55b">NVIDIA Nemotron 3 Ultra 550B</option>
                                <option value="google/diffusiongemma-26b-a4b-it">Google DiffusionGemma 26B</option>
                            </select>
                        </div>
                    </div>

                    {/* Test Results Banner */}
                    {nvidiaStatus && (
                        <div className={`p-4 rounded-lg border ${
                            nvidiaStatus.success ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/15 dark:border-emerald-500/40 dark:text-[var(--color-brand-emerald)]' : 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-500/15 dark:border-rose-500/40 dark:text-rose-300'
                        } flex items-center justify-between text-xs font-medium`}>
                            <span className="flex items-center gap-2">
                                {nvidiaStatus.success ? <CheckCircle2 size={16} className="text-emerald-600 dark:text-[var(--color-brand-emerald)]" /> : <AlertCircle size={16} className="text-rose-600 dark:text-rose-400" />}
                                {nvidiaStatus.message}
                            </span>
                            {nvidiaStatus.model && (
                                <span className="font-mono text-[var(--color-text-muted)] font-bold">Model: {nvidiaStatus.model}</span>
                            )}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={handleTestNvidia}
                            disabled={isTestingNvidia || !nvidiaConfigured}
                            className="px-5 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-card-hover)] text-xs font-bold flex items-center gap-2 transition-all disabled:opacity-50"
                        >
                            {isTestingNvidia ? (
                                <>
                                    <RefreshCw size={14} className="animate-spin text-[var(--color-brand-emerald)]" />
                                    <span>Pinging NVIDIA NIM...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles size={14} className="text-[var(--color-brand-emerald)]" />
                                    <span>Test Connection</span>
                                </>
                            )}
                        </button>

                        <button
                            type="submit"
                            className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-[#fff] font-extrabold text-xs shadow-[var(--shadow-emerald-soft)] transition-all active:scale-95"
                        >
                            Save NVIDIA API Key
                        </button>
                    </div>
                </form>
            </div>

            {/* 2. GENERAL CONFIGURATION MANAGER */}
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-8 space-y-6 shadow-[var(--shadow-depth-1)]">
                <div>
                    <h2 className="text-xl font-bold text-[var(--color-text-main)]">Add General Environment Variable</h2>
                </div>

                <form onSubmit={handleSaveSetting} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Key Name</label>
                        <input
                            type="text"
                            className="w-full bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-lg p-2.5 text-sm text-[var(--color-text-main)] font-mono outline-none focus:border-emerald-500/50 transition-all"
                            placeholder="e.g. IREMBO_API_KEY"
                            value={newSetting.key}
                            onChange={(e) => setNewSetting({...newSetting, key: e.target.value})}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Value</label>
                        <input
                            type="text"
                            className="w-full bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-lg p-2.5 text-sm text-[var(--color-text-main)] font-mono outline-none focus:border-emerald-500/50 transition-all"
                            placeholder="Value..."
                            value={newSetting.value}
                            onChange={(e) => setNewSetting({...newSetting, value: e.target.value})}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Description</label>
                        <input
                            type="text"
                            className="w-full bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-lg p-2.5 text-sm text-[var(--color-text-main)] outline-none focus:border-emerald-500/50 transition-all"
                            placeholder="Purpose of configuration"
                            value={newSetting.description}
                            onChange={(e) => setNewSetting({...newSetting, description: e.target.value})}
                        />
                    </div>
                    <div className="md:col-span-3 flex justify-end pt-2">
                        <button
                            type="submit"
                            className="px-6 py-2.5 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-card-hover)] font-bold text-xs rounded-lg transition-all"
                        >
                            Add Configuration
                        </button>
                    </div>
                </form>
            </div>

            {/* 3. ACTIVE CONFIGURATIONS LEDGER */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-[var(--color-text-main)]">Active System Parameters</h2>
                <div className="grid grid-cols-1 gap-3">
                    {settings.length === 0 ? (
                        <div className="text-center p-12 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] text-[var(--color-text-muted)] text-sm">
                            No custom configurations stored.
                        </div>
                    ) : (
                        settings.map(setting => (
                            <div key={setting.id} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4 flex justify-between items-center group hover:border-emerald-500/40 transition-all shadow-[var(--shadow-depth-1)]">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono font-bold text-sm text-[var(--color-brand-emerald)]">{setting.key}</span>
                                        {setting.description && <span className="text-xs text-[var(--color-text-muted)] italic">- {setting.description}</span>}
                                    </div>
                                    <div className="text-xs font-mono text-[var(--color-text-muted)] bg-[var(--color-bg-elevated)] px-2.5 py-1 rounded-md border border-[var(--color-border)] inline-block">
                                        {setting.is_secret ? 'Stored securely' : setting.value}
                                        <span className="text-[var(--color-text-muted)] ml-3 text-[10px]">Updated: {new Date(setting.updated_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setNewSetting({ key: setting.key, value: setting.value, description: setting.description })}
                                    className="opacity-0 group-hover:opacity-100 px-3 py-1.5 text-xs border border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] rounded-lg hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-card-hover)] transition-all font-bold"
                                >
                                    Edit
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default SystemSettings;



