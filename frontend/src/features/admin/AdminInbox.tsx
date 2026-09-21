import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/endpoints';
import apiClient from '../../api/client';

interface Stat {
    label: string;
    value: number;
    icon: string;
    color: string;
}

const AdminInbox: React.FC = () => {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [newMessage, setNewMessage] = useState({ recipient: '', content: '' });

    const { data: conversations = [], isLoading } = useQuery({
        queryKey: ['admin-inbox'],
        queryFn: async () => {
            const response = await api.admin.inbox();
            return response.data;
        },
    });

    const sendMessageMutation = useMutation({
        mutationFn: async ({ recipientId, content }: { recipientId: string, content: string }) => {
            return apiClient.post('/admin/inbox/send/', { recipient_id: recipientId, content });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-inbox'] });
            setNewMessage({ recipient: '', content: '' });
        },
    });

    const stats: Stat[] = [
        { label: 'Conversations', value: conversations.length, icon: '💬', color: 'text-blue-500' },
        { label: 'Unread', value: conversations.reduce((acc, curr) => acc + curr.unread, 0), icon: '🔴', color: 'text-red-500' },
    ];

    const filteredConversations = conversations.filter(c =>
        c.contact.fullName.toLowerCase().includes(search.toLowerCase()) ||
        c.contact.username.toLowerCase().includes(search.toLowerCase())
    );

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        // Assuming recipient is the ID for now, or we'd need a lookup
        sendMessageMutation.mutate({
            recipientId: newMessage.recipient,
            content: newMessage.content
        });
    };

    if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500">Loading Inbox...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex items-center gap-3">
                <span className="text-3xl">💬</span>
                <h1 className="text-3xl font-bold text-white">Tenant Messages</h1>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-md">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl flex items-center gap-4 hover:border-zinc-600 transition-all">
                        <div className="text-3xl">{stat.icon}</div>
                        <div>
                            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{stat.label}</p>
                            <h3 className={`text-2xl font-bold ${stat.color}`}>{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Conversations List */}
                <div className="lg:col-span-7 space-y-4">
                    <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl relative max-w-md">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">🔍</span>
                        <input
                            type="text"
                            className="w-full pl-12 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                            placeholder="Search contacts..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
                        <div className="p-6 border-b border-zinc-800">
                            <h2 className="text-xl font-bold text-white">Inbox</h2>
                        </div>
                        <div className="divide-y divide-zinc-800">
                            {filteredConversations.map(convo => (
                                <div key={convo.id} className="p-4 hover:bg-zinc-800/50 transition-all cursor-pointer flex items-center gap-4 group">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-700 text-white flex items-center justify-center font-bold text-lg shadow-lg">
                                        {convo.contact.username[0].toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-bold text-white group-hover:text-green-400 transition-colors">{convo.contact.fullName}</span>
                                            <span className="text-[10px] text-zinc-500">{convo.lastMessage.sentDate}</span>
                                        </div>
                                        <div className="flex justify-between items-center mt-1">
                                            <p className="text-xs text-zinc-400 truncate max-w-xs">
                                                {convo.lastMessage.sender === 'me' && <span className="text-green-500 font-medium">You: </span>}
                                                {convo.lastMessage.content}
                                            </p>
                                            <div className="flex items-center gap-2 ml-2">
                                                <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 text-[10px] font-medium border border-zinc-700">
                                                    {convo.contact.role}
                                                </span>
                                                {convo.unread > 0 && (
                                                    <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                                                        {convo.unread}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {filteredConversations.length === 0 && (
                                <div className="p-10 text-center text-zinc-500">No conversations found.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Compose Message */}
                <div className="lg:col-span-5">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sticky top-24">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="text-2xl">✏️</span>
                            <h2 className="text-xl font-bold text-white">New Message</h2>
                        </div>
                        <form onSubmit={handleSendMessage} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Recipient ID</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-2xl text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                    placeholder="User ID..."
                                    value={newMessage.recipient}
                                    onChange={(e) => setNewMessage({ ...newMessage, recipient: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Message</label>
                                <textarea
                                    required
                                    rows={5}
                                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-2xl text-white focus:ring-2 focus:ring-green-500 outline-none transition-all resize-none"
                                    placeholder="Type your message here..."
                                    value={newMessage.content}
                                    onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                                />
                            </div>
                            <button type="submit" className="w-full py-4 bg-white text-black font-bold rounded-2xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-2">
                                <span>Send Message</span>
                                <span className="text-lg">🚀</span>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminInbox;
