import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, ArrowRight, AlertCircle, ShieldCheck, Sparkles, Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { type AppView, getDefaultDashboardForUser } from '../../types/navigation';

interface LoginPageProps {
    onNavigate?: (view: AppView) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
    const { login } = useAuth();
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const user = await login({
                username: identifier,
                email: identifier,
                password,
            });

            if (onNavigate) {
                onNavigate(getDefaultDashboardForUser(user));
            } else {
                window.location.href = '/';
            }
        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.response?.data?.error || err.message || 'Invalid username/email or password');
        } finally {
            setLoading(false);
        }
    };

    const navigateTo = (view: AppView) => {
        if (onNavigate) {
            onNavigate(view);
        } else {
            window.location.href = `/${view === 'home' ? '' : view}`;
        }
    };

    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 sm:p-6 lg:p-10 selection:bg-emerald-500/30 relative overflow-hidden w-full max-w-full transition-colors duration-300"
          style={{ background: 'var(--color-bg-deep)', color: 'var(--color-text-main)' }}>
            {/* Ambient Background Glows */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute top-1/2 left-1/4 -translate-y-1/2 h-[350px] w-[350px] sm:h-[500px] sm:w-[500px] rounded-full bg-emerald-500/[0.05] blur-[140px]" />
                <div className="absolute bottom-10 right-1/4 h-[280px] w-[280px] sm:h-[400px] sm:w-[400px] rounded-full bg-[#f98604]/[0.04] blur-[140px]" />
            </div>

            {/* Split Luxury Container */}
            <div className="w-full lg:w-[80%] max-w-6xl relative z-10 rounded-3xl border overflow-hidden flex flex-col lg:flex-row shadow-2xl"
              style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)', boxShadow: 'var(--shadow-depth-3)' }}>
                {/* Left Side Panel (Desktop) */}
                <div className="hidden lg:flex lg:w-[45%] flex-col justify-between p-10 lg:p-14 border-r"
                  style={{ borderColor: 'var(--color-border)', background: 'linear-gradient(135deg, rgba(8,126,57,0.06) 0%, var(--color-bg-card) 100%)' }}>
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <img src="/urugwiro_logo_fav.png" alt="Urugwiro" className="h-10 w-10 rounded-xl object-contain drop-shadow-md" />
                            <div>
                                <span className="font-extrabold text-base tracking-[0.2em] font-display block" style={{ color: 'var(--color-text-main)' }}>
                                    URUGWIRO
                                </span>
                                <span className="text-[10px] uppercase tracking-[0.2em] text-emerald-500 font-bold block">
                                    Sovereign Ecosystem
                                </span>
                            </div>
                        </div>

                        <h2 className="font-display text-3xl xl:text-4xl font-bold tracking-tight leading-tight mb-4" style={{ color: 'var(--color-text-main)' }}>
                            Rwanda's Premier Property Network
                        </h2>

                        <p className="text-sm leading-relaxed mb-8" style={{ color: 'var(--color-text-muted)' }}>
                            Access verified residential estates, sovereign land parcels, and commercial investments with end-to-end transparency.
                        </p>

                        {/* Concise Highlights */}
                        <div className="space-y-4">
                            {[
                              { icon: ShieldCheck, title: 'RLMUA Cadastre Verified', desc: '100% verified titles and official land boundary data.' },
                              { icon: Lock, title: 'Bank-Grade Escrow', desc: '10% earnest deposits protected in regulated custody.' },
                              { icon: Sparkles, title: '3D Spatial Digital Twins', desc: 'Interactive virtual showings and LiDAR site scans.' },
                            ].map(({ icon: Icon, title, desc }) => (
                              <div key={title} className="flex items-start gap-3.5 p-3 rounded-2xl border"
                                style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}>
                                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 mt-0.5">
                                      <Icon size={16} />
                                  </div>
                                  <div>
                                      <div className="text-xs font-bold" style={{ color: 'var(--color-text-main)' }}>{title}</div>
                                      <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{desc}</div>
                                  </div>
                              </div>
                            ))}
                        </div>
                    </div>

                    {/* Bottom Status */}
                    <div className="pt-8 border-t flex items-center justify-between text-xs" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-dim)' }}>
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span>Kigali Central Node: Online</span>
                        </div>
                        <span>UTC+2 Kigali</span>
                    </div>
                </div>

                {/* Right Side Form Panel */}
                <div className="flex-1 p-5 sm:p-10 lg:p-14 flex flex-col justify-center">
                    <div className="max-w-md w-full mx-auto">
                    <div className="mb-6">
                        <img
                            src="/urugwiro_logo_fav.png"
                            alt="Urugwiro"
                            className="h-11 w-11 rounded-2xl object-contain mb-3 drop-shadow-md"
                        />
                        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight mb-1" style={{ color: 'var(--color-text-main)' }}>
                            Sign In
                        </h1>
                        <p className="text-xs sm:text-sm" style={{ color: 'var(--color-text-muted)' }}>
                            Enter your credentials to access your account.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in duration-200">
                            <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                            <span className="flex-1 leading-snug">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-4">
                        {/* Username or Email */}
                        <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
                                Username or Email
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none" style={{ color: 'var(--color-text-dim)' }}>
                                    <User size={15} />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    placeholder="Username or email"
                                    className="w-full rounded-xl border pl-10 pr-4 py-2.5 text-base sm:text-sm outline-none transition-all"
                                    style={{
                                      background: 'var(--color-input-bg)',
                                      borderColor: 'var(--color-input-border)',
                                      color: 'var(--color-text-main)',
                                    }}
                                    onFocus={e => e.currentTarget.style.borderColor = 'rgba(16,185,129,0.5)'}
                                    onBlur={e => e.currentTarget.style.borderColor = 'var(--color-input-border)'}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                                    Password
                                </label>
                                <a
                                    href="#"
                                    onClick={(e) => { e.preventDefault(); alert('Please contact support@urugwiro.rw to reset credentials.'); }}
                                    className="text-[11px] font-medium text-emerald-500 hover:text-emerald-400 transition-colors"
                                >
                                    Forgot?
                                </a>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none" style={{ color: 'var(--color-text-dim)' }}>
                                    <Lock size={15} />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter password"
                                    className="w-full rounded-xl border pl-10 pr-10 py-2.5 text-base sm:text-sm outline-none transition-all"
                                    style={{
                                      background: 'var(--color-input-bg)',
                                      borderColor: 'var(--color-input-border)',
                                      color: 'var(--color-text-main)',
                                    }}
                                    onFocus={e => e.currentTarget.style.borderColor = 'rgba(16,185,129,0.5)'}
                                    onBlur={e => e.currentTarget.style.borderColor = 'var(--color-input-border)'}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center transition-colors cursor-pointer hover:text-emerald-500"
                                    style={{ color: 'var(--color-text-dim)' }}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center pt-1">
                            <label className="flex items-center gap-2 text-xs cursor-pointer select-none" style={{ color: 'var(--color-text-muted)' }}>
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="h-3.5 w-3.5 rounded border-white/20 bg-white/[0.05] text-emerald-500 focus:ring-emerald-500/20 focus:ring-offset-0 transition"
                                />
                                <span>Keep me signed in</span>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-2"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                    <span>Signing In...</span>
                                </div>
                            ) : (
                                <>
                                    <span>Sign In to Dashboard</span>
                                    <ArrowRight size={15} />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Switch to Register */}
                    <div className="mt-6 pt-5 border-t text-center text-xs" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
                        Don't have an account?{' '}
                        <button
                            type="button"
                            onClick={() => navigateTo('register')}
                            className="font-bold text-emerald-500 hover:text-emerald-400 transition-colors cursor-pointer"
                        >
                            Create account
                        </button>
                    </div>
                </div>
            </div>
        </div>
        </div>
    );
};

export default LoginPage;
