import React, { useState, useEffect, useCallback } from 'react';

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

    const fetchSettings = useCallback(async () => {
        try {
            const response = await fetch('/api/system/settings/');
            if (!response.ok) throw new Error('Failed to fetch settings');
            const data = await response.json();
            setSettings(data);
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Use a small timeout to push the state update to the next tick,
        // avoiding the "synchronous" warning.
        const timer = setTimeout(() => {
            fetchSettings();
        }, 0);
        return () => clearTimeout(timer);
    }, [fetchSettings]);

    const handleSaveSetting = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        try {
            const response = await fetch('/api/system/settings/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSetting),
            });
            if (!response.ok) throw new Error('Failed to save setting');

            setMessage({ type: 'success', text: 'Setting saved successfully!' });
            setNewSetting({ key: '', value: '', description: '' });
            fetchSettings();
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full text-zinc-500">
                Loading system configurations...
            </div>
        );
    }

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-10">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">System Configurations</h1>
                <p className="text-zinc-400">Manage API keys and global system environment variables.</p>
            </div>

            {message && (
                <div className={`p-4 rounded-lg border ${
                    message.type === 'success' ? 'bg-green-500/10 border-green-500/50 text-green-400' : 'bg-red-500/10 border-red-500/50 text-red-400'
                }`}>
                    {message.text}
                </div>
            )}

            {/* Add New Setting Form */}
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-6">
                <h2 className="text-xl font-semibold text-zinc-100">Add/Update Configuration</h2>
                <form onSubmit={handleSaveSetting} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <label className="block text-xs font-medium text-zinc-500 uppercase">Key</label>
                        <input
                            type="text"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white focus:ring-2 focus:ring-gold-500 outline-none"
                            placeholder="e.g. NVIDIA_API_KEY"
                            value={newSetting.key}
                            onChange={(e) => setNewSetting({...newSetting, key: e.target.value})}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-xs font-medium text-zinc-500 uppercase">Value</label>
                        <input
                            type="text"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white focus:ring-2 focus:ring-gold-500 outline-none"
                            placeholder="Enter key/value..."
                            value={newSetting.value}
                            onChange={(e) => setNewSetting({...newSetting, value: e.target.value})}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-xs font-medium text-zinc-500 uppercase">Description</label>
                        <input
                            type="text"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white focus:ring-2 focus:ring-gold-500 outline-none"
                            placeholder="What is this for?"
                            value={newSetting.description}
                            onChange={(e) => setNewSetting({...newSetting, description: e.target.value})}
                        />
                    </div>
                    <div className="md:col-span-3 flex justify-end">
                        <button
                            type="submit"
                            className="px-6 py-2 bg-zinc-100 text-black font-bold rounded-lg hover:bg-white transition-colors"
                        >
                            Save Configuration
                        </button>
                    </div>
                </form>
            </div>

            {/* Settings List */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-zinc-100">Active Configurations</h2>
                <div className="grid grid-cols-1 gap-4">
                    {settings.length === 0 ? (
                        <div className="text-center p-10 bg-zinc-900 border border-zinc-800 rounded-2xl text-zinc-500">
                            No configurations found. Add your first API key above.
                        </div>
                    ) : (
                        settings.map(setting => (
                            <div key={setting.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex justify-between items-center group hover:border-zinc-600 transition-all">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono font-bold text-gold-400">{setting.key}</span>
                                        {setting.description && <span className="text-xs text-zinc-500 italic">— {setting.description}</span>}
                                    </div>
                                    <div className="text-sm font-mono text-zinc-400 bg-black/30 p-1 rounded">
                                        {setting.value.replace(/./g, '•').slice(0, 15)}...
                                        <span className="text-zinc-600 ml-2 text-xs">Updated: {new Date(setting.updated_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setNewSetting({ key: setting.key, value: '', description: setting.description })}
                                    className="opacity-0 group-hover:opacity-100 px-3 py-1 text-xs bg-zinc-800 text-zinc-300 rounded hover:bg-zinc-700 transition-all"
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
