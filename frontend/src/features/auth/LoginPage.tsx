import React, { useState } from 'react';
import { api } from '../../api/endpoints';

const LoginPage: React.FC = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const response = await api.auth.login(formData);
            const data = response.data;

            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);
            localStorage.setItem('user_role', data.user.role);

            window.location.href = '/';
        } catch (err: any) {
            setError(err.response?.data?.error || err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-black overflow-hidden">
            {/* Left Brand Panel */}
            <div className="hidden lg:flex flex-1 relative bg-[#091a0f] items-center justify-center p-12 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#2D5A27] to-transparent" />

                {/* Ambient Orbs */}
                <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-[#2EA745]/20 blur-[80px] animate-pulse" />
                <div className="absolute -bottom-40 -right-40 w-[350px] h-[350px] rounded-full bg-[#81C784]/10 blur-[80px] animate-pulse" />

                <div className="relative z-10 text-center max-w-lg text-white space-y-8">
                    <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center mx-auto mb-8 shadow-lg shadow-green-900/20">
                        <span className="text-4xl text-[#a5d6a7]">🏢</span>
                    </div>

                    <h2 className="text-4xl font-bold tracking-tight">Welcome Back!</h2>
                    <p className="text-white/60 text-lg leading-relaxed">
                        Access your Urugwiro dashboard to manage properties, track leases, and stay connected with your portfolio.
                    </p>

                    <div className="flex gap-4 justify-center flex-wrap">
                        {[
                            { v: '1,500+', l: 'Properties' },
                            { v: '500+', l: 'Happy Clients' },
                            { v: '4.8★', l: 'Rating' },
                        ].map((stat, i) => (
                            <div key={i} className="bg-white/10 border border-white/20 backdrop-blur-md rounded-2xl px-6 py-3 text-center transition-transform hover:-translate-y-1">
                                <span className="block text-xl font-bold">{stat.v}</span>
                                <span className="block text-[10px] uppercase tracking-wider text-white/50">{stat.l}</span>
                            </div>
                        ))}
                    </div>

                    {/* illustration Placeholder (Original SVG simplified) */}
                    <div className="pt-8 opacity-80">
                        <svg viewBox="0 0 380 200" className="w-full max-w-md mx-auto drop-shadow-2xl" xmlns="http://www.w3.org/2000/svg">
                            <rect width="380" height="200" rx="16" fill="rgba(255,255,255,.04)"/>
                            <circle cx="330" cy="38" r="22" fill="rgba(255,220,100,.18)"/>
                            <circle cx="342" cy="32" r="18" fill="#091a0f" opacity=".85"/>
                            <rect x="0" y="155" width="380" height="45" rx="0" fill="rgba(46,125,50,.25)"/>
                            <rect x="0" y="165" width="380" height="35" fill="rgba(27,94,32,.35)"/>
                            <rect x="80" y="80" width="150" height="90" rx="5" fill="rgba(255,255,255,.08)" stroke="rgba(165,214,167,.3)" strokeWidth="1.5"/>
                            <polygon points="65,83 155,30 245,83" fill="rgba(165,214,167,.2)"/>
                            <rect x="137" y="133" width="32" height="37" rx="4" fill="rgba(165,214,167,.25)"/>
                        </svg>
                    </div>
                </div>
            </div>

            {/* Right Form Panel */}
            <div className="flex-1 bg-white flex items-center justify-center p-6 md:p-12 relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-green-100 rounded-full blur-3xl opacity-50" />
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-green-100 rounded-full blur-3xl opacity-50" />

                <div className="w-full max-w-md relative z-10">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center gap-3 mb-8">
                        <span className="text-3xl">🏢</span>
                        <span className="text-2xl font-bold text-zinc-900">Urugwiro</span>
                    </div>

                    <h1 className="text-4xl font-bold text-zinc-900 mb-2 tracking-tight">Sign In</h1>
                    <p className="text-zinc-500 mb-8">Welcome back! Enter your credentials to continue.</p>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl flex items-center gap-3">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="relative group">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-green-600 transition-colors">👤</span>
                            <input
                                type="text"
                                className="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-zinc-900 focus:ring-4 focus:ring-green-100 focus:border-green-600 outline-none transition-all"
                                placeholder="Username"
                                value={formData.username}
                                onChange={(e) => setFormData({...formData, username: e.target.value})}
                                required
                            />
                        </div>

                        <div className="relative group">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-green-600 transition-colors">🔒</span>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="w-full pl-12 pr-12 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-zinc-900 focus:ring-4 focus:ring-green-100 focus:border-green-600 outline-none transition-all"
                                placeholder="Password"
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                            >
                                {showPassword ? '👁️‍🗨️' : '👁️'}
                            </button>
                        </div>

                        <div className="flex justify-between items-center text-sm">
                            <label className="flex items-center gap-2 text-zinc-500 cursor-pointer">
                                <input type="checkbox" className="rounded border-zinc-300 text-green-600 focus:ring-green-500" />
                                Remember me
                            </label>
                            <a href="#" className="text-green-600 font-semibold hover:underline">Forgot Password?</a>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-br from-green-700 to-green-600 text-white font-bold rounded-full shadow-lg shadow-green-200 hover:shadow-green-300 hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? 'Authenticating...' : <><span className="text-xl">➔</span> Sign In</>}
                        </button>
                    </form>

                    <div className="flex items-center gap-4 my-8 text-zinc-400 text-sm">
                        <div className="h-px bg-zinc-200 flex-1" />
                        <span>or</span>
                        <div className="h-px bg-zinc-200 flex-1" />
                    </div>

                    <p className="text-center text-zinc-500 text-sm">
                        Don't have an account? <a href="/register" className="text-green-600 font-bold hover:underline">Create one free</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
