import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, ArrowRight, AlertCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { type AppView, getDefaultDashboardForUser } from '../../types/navigation';
import { pathForView } from '../../lib/routes';
import { logError } from '../../lib/utils';

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
            logError('Login error:', err);
            setError(err.response?.data?.error || err.message || 'Invalid username/email or password');
        } finally {
            setLoading(false);
        }
    };

    const navigateTo = (view: AppView) => {
        if (onNavigate) {
            onNavigate(view);
        } else {
            window.location.href = pathForView(view);
        }
    };

    const handleSocialLogin = (provider: string) => {
        // Redirect to Django's social auth endpoint
        window.location.href = `/api/auth/${provider}/`;
    };

    return (
        <div className="flex min-h-[calc(100vh-4.5rem)] sm:min-h-[calc(100vh-5rem)] items-center justify-center p-4 sm:p-6 lg:p-10 selection:bg-emerald-500/30 relative overflow-hidden w-full max-w-full transition-colors duration-300"
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
                                    Marketplace Access
                                </span>
                            </div>
                        </div>

                        <h2 className="font-display text-3xl xl:text-4xl font-bold tracking-tight leading-tight mb-4" style={{ color: 'var(--color-text-main)' }}>
                            Rwanda Property & Asset Marketplace
                        </h2>

                        <p className="text-sm leading-relaxed mb-8" style={{ color: 'var(--color-text-muted)' }}>
                            Access listings, offers, visits, messages, and visible document-review states from one account.
                        </p>

                        {/* Concise Highlights */}
                        <div className="space-y-4">
                            {[
                              { icon: ShieldCheck, title: 'Visible Review Status', desc: 'See whether listing documents are submitted, approved, or still pending.' },
                              { icon: Lock, title: 'Account Security', desc: 'Authenticated access keeps private workspace data scoped to your account.' },
                              { icon: Sparkles, title: 'Listing Workflows', desc: 'Review properties, schedule visits, exchange messages, and manage offers.' },
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
                            <span>Secure account access</span>
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
                                <button
                                    type="button"
                                    onClick={() => onNavigate?.('contact')}
                                    className="text-[11px] font-medium text-emerald-500 hover:text-emerald-400 transition-colors"
                                >
                                    Need account help?
                                </button>
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

                    {/* Social Login */}
                    <div className="relative my-5">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-[var(--color-border)]"></div>
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="bg-[var(--color-bg-card)] px-3 text-[var(--color-text-muted)]">Or continue with</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => handleSocialLogin('google')}
                            className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-input-bg)] text-[var(--color-text-main)] text-sm font-semibold hover:bg-[var(--color-bg-elevated)] transition-colors cursor-pointer"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            <span>Google</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => handleSocialLogin('facebook')}
                            className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-input-bg)] text-[var(--color-text-main)] text-sm font-semibold hover:bg-[var(--color-bg-elevated)] transition-colors cursor-pointer"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                            <span>Facebook</span>
                        </button>
                    </div>

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
