import React, { useState, useEffect, useCallback } from 'react';
import { Cpu, Key, CheckCircle2, AlertCircle, Eye, EyeOff, Sparkles, RefreshCw, Zap } from 'lucide-react';
import { api } from '../../api/endpoints';

interface SystemSetting {
    id: number;
    key: string;
    value: string;
    description: string;
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
    const [isTestingNvidia, setIsTestingNvidia] = useState(false);
    const [nvidiaStatus, setNvidiaStatus] = useState<{ success: boolean; message: string; model?: string } | null>(null);

    const fetchSettings = useCallback(async () => {
        try {
            const response = await api.settings.get();
            const data: SystemSetting[] = Array.isArray(response.data) ? response.data : [];
            setSettings(data);

            // Look for existing NVIDIA API Key and Model
            const existingNvidia = data.find(s => s.key.toUpperCase() === 'NVIDIA_AI_API_KEY' || s.key.toUpperCase() === 'NVIDIA_API_KEY');
            if (existingNvidia && existingNvidia.value) {
                setNvidiaKey(existingNvidia.value);
            }
            const existingModel = data.find(s => s.key.toUpperCase() === 'NVIDIA_AI_MODEL' || s.key.toUpperCase() === 'NVIDIA_MODEL');
            if (existingModel && existingModel.value && !existingModel.value.includes('3.1-70b') && !existingModel.value.includes('3.3-70b')) {
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
            const response = await api.ai.testConnection(nvidiaKey.trim() || undefined, selectedModel);
            const data = response.data;
            if (data.success) {
                setNvidiaStatus({
                    success: true,
                    message: data.message || 'NVIDIA NIM Connection Active & Operational!',
                    model: data.model || selectedModel
                });
            } else {
                setNvidiaStatus({
                    success: false,
                    message: data.error || 'Connection failed. Please check key validity.'
                });
            }
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
            <div className="flex items-center justify-center h-full text-zinc-500 py-20">
                Loading system configurations...
            </div>
        );
    }

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-10 selection:bg-[#c5a880]/30 selection:text-white">
            <div className="border-b border-white/[0.08] pb-6">
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-[#c5a880] mb-1">
                    <Cpu size={14} /> System Parameters & Autonomous Intelligence
                </div>
                <h1 className="text-3xl lg:text-4xl font-serif font-bold text-white tracking-tight">System Configurations</h1>
            </div>

            {message && (
                <div className={`p-4 rounded-xl border ${
                    message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                } flex items-center gap-2.5 text-sm font-medium`}>
                    {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    {message.text}
                </div>
            )}

            {/* 1. DEDICATED NVIDIA NIM AI CONSOLE */}
            <div className="rounded-2xl border border-emerald-500/30 bg-white/[0.03] backdrop-blur-xl p-8 space-y-6 shadow-xl shadow-black/50 relative overflow-hidden">
                <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-6">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-500/20">
                            <Zap size={24} strokeWidth={2} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-bold text-white">NVIDIA NIM AI Accelerator</h2>
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                                    Autonomous Engine
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {nvidiaKey ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
                                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" /> Key Configured
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold">
                                Missing Key
                            </span>
                        )}
                    </div>
                </div>

                <form onSubmit={handleSaveNvidiaKey} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {/* API Key Input */}
                        <div className="md:col-span-2 space-y-2">
                            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                                NVIDIA NIM API Key (build.nvidia.com)
                            </label>
                            <div className="relative">
                                <Key size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                                <input
                                    type={showKey ? "text" : "password"}
                                    value={nvidiaKey}
                                    onChange={(e) => setNvidiaKey(e.target.value)}
                                    placeholder="nvapi-..."
                                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl py-2.5 pl-10 pr-12 text-sm text-white placeholder:text-zinc-400 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 font-mono transition-all"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowKey(!showKey)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
                                >
                                    {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Preferred Model */}
                        <div className="space-y-2">
                            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                                Inference Model
                            </label>
                            <select
                                value={selectedModel}
                                onChange={(e) => setSelectedModel(e.target.value)}
                                className="w-full bg-white/[0.04] border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white outline-none focus:border-emerald-500/50 transition-all"
                            >
                                <option value="meta/llama-3.2-11b-vision-instruct">Meta Llama 3.2 11B Vision Instruct (Recommended - Verified Active)</option>
                                <option value="nvidia/nemotron-3.5-lightning-30b-a3b">NVIDIA Nemotron 3.5 Lightning 30B (Agentic MoE - Verified Active)</option>
                                <option value="nvidia/nemotron-3-ultra-550b-a55b">NVIDIA Nemotron 3 Ultra 550B (Deep Reasoning - Verified Active)</option>
                                <option value="google/diffusiongemma-26b-a4b-it">Google DiffusionGemma 26B (Verified Active)</option>
                            </select>
                        </div>
                    </div>

                    {/* Test Results Banner */}
                    {nvidiaStatus && (
                        <div className={`p-4 rounded-xl border ${
                            nvidiaStatus.success ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                        } flex items-center justify-between text-xs font-medium`}>
                            <span className="flex items-center gap-2">
                                {nvidiaStatus.success ? <CheckCircle2 size={16} className="text-emerald-400" /> : <AlertCircle size={16} className="text-rose-400" />}
                                {nvidiaStatus.message}
                            </span>
                            {nvidiaStatus.model && (
                                <span className="font-mono text-zinc-300 font-bold">Model: {nvidiaStatus.model}</span>
                            )}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={handleTestNvidia}
                            disabled={isTestingNvidia || !nvidiaKey}
                            className="px-5 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-zinc-200 hover:text-white hover:bg-white/[0.08] text-xs font-bold flex items-center gap-2 transition-all disabled:opacity-50"
                        >
                            {isTestingNvidia ? (
                                <>
                                    <RefreshCw size={14} className="animate-spin text-emerald-400" />
                                    <span>Pinging NVIDIA NIM...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles size={14} className="text-emerald-400" />
                                    <span>Test Connection</span>
                                </>
                            )}
                        </button>

                        <button
                            type="submit"
                            className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                        >
                            Save NVIDIA API Key
                        </button>
                    </div>
                </form>
            </div>

            {/* 2. GENERAL CONFIGURATION MANAGER */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8 space-y-6 shadow-lg shadow-black/20">
                <div>
                    <h2 className="text-xl font-bold text-white">Add General Environment Variable</h2>
                </div>

                <form onSubmit={handleSaveSetting} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">Key Name</label>
                        <input
                            type="text"
                            className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-2.5 text-sm text-white font-mono outline-none focus:border-emerald-500/50 transition-all"
                            placeholder="e.g. IREMBO_API_KEY"
                            value={newSetting.key}
                            onChange={(e) => setNewSetting({...newSetting, key: e.target.value})}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">Value</label>
                        <input
                            type="text"
                            className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-2.5 text-sm text-white font-mono outline-none focus:border-emerald-500/50 transition-all"
                            placeholder="Value..."
                            value={newSetting.value}
                            onChange={(e) => setNewSetting({...newSetting, value: e.target.value})}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">Description</label>
                        <input
                            type="text"
                            className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-2.5 text-sm text-white outline-none focus:border-emerald-500/50 transition-all"
                            placeholder="Purpose of configuration"
                            value={newSetting.description}
                            onChange={(e) => setNewSetting({...newSetting, description: e.target.value})}
                        />
                    </div>
                    <div className="md:col-span-3 flex justify-end pt-2">
                        <button
                            type="submit"
                            className="px-6 py-2.5 bg-white/[0.04] border border-white/10 text-zinc-200 hover:text-white hover:bg-white/[0.1] font-bold text-xs rounded-xl transition-all"
                        >
                            Add Configuration
                        </button>
                    </div>
                </form>
            </div>

            {/* 3. ACTIVE CONFIGURATIONS LEDGER */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-white">Active System Parameters</h2>
                <div className="grid grid-cols-1 gap-3">
                    {settings.length === 0 ? (
                        <div className="text-center p-12 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl text-zinc-400 text-sm">
                            No custom configurations stored.
                        </div>
                    ) : (
                        settings.map(setting => (
                            <div key={setting.id} className="rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-4 flex justify-between items-center group hover:border-emerald-500/50/40 transition-all shadow-md shadow-black/20">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono font-bold text-sm text-emerald-400">{setting.key}</span>
                                        {setting.description && <span className="text-xs text-zinc-400 italic">Ã¢â‚¬â€ {setting.description}</span>}
                                    </div>
                                    <div className="text-xs font-mono text-zinc-300 bg-white/[0.04] px-2.5 py-1 rounded-md border border-white/[0.1] inline-block">
                                        {setting.value.slice(0, 4)}Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢{setting.value.slice(-4)}
                                        <span className="text-zinc-400 ml-3 text-[10px]">Updated: {new Date(setting.updated_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setNewSetting({ key: setting.key, value: setting.value, description: setting.description })}
                                    className="opacity-0 group-hover:opacity-100 px-3 py-1.5 text-xs border border-white/10 bg-white/[0.04] text-zinc-200 rounded-lg hover:text-white hover:bg-white/[0.1] transition-all font-bold"
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



