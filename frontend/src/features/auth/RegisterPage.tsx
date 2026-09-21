import React, { useState } from 'react';
import { Lock, User, Mail, Eye, EyeOff, ArrowRight, AlertCircle, Building2, KeyRound, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { AppView } from '../../types/navigation';

interface RegisterPageProps {
    onNavigate?: (view: AppView) => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
    const { register } = useAuth();
    const [selectedRole, setSelectedRole] = useState<'Buyer' | 'Tenant'>('Buyer');
    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(true);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (!termsAccepted) {
            setError('Please accept terms of service');
            return;
        }

        setLoading(true);

        try {
            const user = await register({
                username: username.trim(),
                email: email.trim(),
                password,
                role: selectedRole,
                full_name: fullName.trim(),
            });

            if (onNavigate) {
                if (user.role === 'Tenant') {
                    onNavigate('tenant-dashboard');
                } else {
                    onNavigate('home');
                }
            } else {
                window.location.href = '/';
            }
        } catch (err: any) {
            console.error('Registration error:', err);
            setError(err.response?.data?.error || err.message || 'Registration failed');
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
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 sm:p-6 lg:p-10 bg-[#05070b] text-white selection:bg-emerald-500/30 relative overflow-hidden w-full max-w-full">
            {/* Ambient Background Glows */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute top-1/2 right-1/4 -translate-y-1/2 h-[350px] w-[350px] sm:h-[500px] sm:w-[500px] rounded-full bg-emerald-500/[0.06] blur-[140px]" />
                <div className="absolute bottom-10 left-1/4 h-[280px] w-[280px] sm:h-[400px] sm:w-[400px] rounded-full bg-[#f98604]/[0.05] blur-[140px]" />
            </div>

            {/* Split Luxury Container (80% Width on Desktop) */}
            <div className="w-full lg:w-[80%] max-w-6xl relative z-10 rounded-3xl border border-white/10 bg-[#080c14]/90 shadow-2xl backdrop-blur-2xl overflow-hidden flex flex-col lg:flex-row">
                {/* Left Side Explanation Panel (Visible on Desktop / Computer) */}
                <div className="hidden lg:flex lg:w-[45%] flex-col justify-between p-10 lg:p-14 border-r border-white/10 bg-gradient-to-br from-emerald-950/25 via-[#080c14]/50 to-transparent">
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <img src="/urugwiro_logo_fav.png" alt="Urugwiro" className="h-10 w-10 rounded-xl object-contain drop-shadow-md" />
                            <div>
                                <span className="font-extrabold text-base tracking-[0.2em] text-white font-display block">
                                    URUGWIRO
                                </span>
                                <span className="text-[10px] uppercase tracking-[0.2em] text-emerald-400 font-bold block">
                                    Sovereign Ecosystem
                                </span>
                            </div>
                        </div>

                        <h2 className="font-display text-3xl xl:text-4xl font-bold tracking-tight text-white leading-tight mb-4">
                            Join as a Buyer or Resident
                        </h2>

                        <p className="text-zinc-400 text-sm leading-relaxed mb-8">
                            Create your personalized account to discover sovereign listings, schedule visits, and complete secure transactions.
                        </p>

                        {/* Account Types Breakdown */}
                        <div className="space-y-4">
                            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-1">
                                    <Building2 size={16} /> Private Client / Buyer
                                </div>
                                <div className="text-xs text-zinc-400 leading-relaxed">
                                    Purchase land parcels, villas, and commercial assets with bank-grade escrow protection.
                                </div>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                                <div className="flex items-center gap-2 text-xs font-bold text-sky-400 mb-1">
                                    <KeyRound size={16} /> Resident / Tenant
                                </div>
                                <div className="text-xs text-zinc-400 leading-relaxed">
                                    Lease verified residential residences, track tenancy agreements, and manage requests.
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Elevated Roles Note */}
                    <div className="pt-8 border-t border-white/[0.08] text-xs text-zinc-500 leading-relaxed">
                        <span className="text-zinc-400 font-medium">Role Policy:</span> Admin, Seller, and Broker permissions are assigned exclusively by Platform Administration.
                    </div>
                </div>

                {/* Right Side Form Panel */}
                <div className="flex-1 p-5 sm:p-10 lg:p-14 flex flex-col justify-center">
                    <div className="max-w-md w-full mx-auto">
                    <div className="mb-5">
                        <img
                            src="/urugwiro_logo_fav.png"
                            alt="Urugwiro"
                            className="h-11 w-11 rounded-2xl object-contain mb-3 drop-shadow-md"
                        />
                        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white mb-1">
                            Create Account
                        </h1>
                        <p className="text-zinc-400 text-xs sm:text-sm">
                            Select your account type and fill in your details.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in duration-200">
                            <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                            <span className="flex-1 leading-snug">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="space-y-3.5">
                        {/* Role Segmented Picker */}
                        <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                                Account Type
                            </label>
                            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl border border-white/10 bg-white/[0.03]">
                                <button
                                    type="button"
                                    onClick={() => setSelectedRole('Buyer')}
                                    className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                        selectedRole === 'Buyer'
                                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                                             : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                                    }`}
                                >
                                    <Building2 size={13} />
                                    <span>Buyer</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setSelectedRole('Tenant')}
                                    className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                        selectedRole === 'Tenant'
                                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                                            : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                                    }`}
                                >
                                    <KeyRound size={13} />
                                    <span>Tenant</span>
                                </button>
                            </div>
                        </div>

                        {/* Full Name & Username */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                                        <User size={14} />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="Your Name"
                                        className="w-full rounded-xl border border-white/10 bg-white/[0.04] pl-9 pr-3 py-2 text-base sm:text-sm text-white placeholder:text-zinc-600 outline-none focus:border-emerald-500/50 focus:bg-white/[0.06] transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                                    placeholder="Username"
                                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-base sm:text-sm text-white placeholder:text-zinc-600 outline-none focus:border-emerald-500/50 focus:bg-white/[0.06] transition-all"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                                    <Mail size={14} />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@domain.com"
                                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] pl-9 pr-3 py-2 text-base sm:text-sm text-white placeholder:text-zinc-600 outline-none focus:border-emerald-500/50 focus:bg-white/[0.06] transition-all"
                                />
                            </div>
                        </div>

                        {/* Password & Confirm */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                                        <Lock size={14} />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Min 6 chars"
                                        className="w-full rounded-xl border border-white/10 bg-white/[0.04] pl-9 pr-9 py-2 text-base sm:text-sm text-white placeholder:text-zinc-600 outline-none focus:border-emerald-500/50 focus:bg-white/[0.06] transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                                    Confirm
                                </label>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm"
                                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-base sm:text-sm text-white placeholder:text-zinc-600 outline-none focus:border-emerald-500/50 focus:bg-white/[0.06] transition-all"
                                />
                            </div>
                        </div>

                        {/* Terms */}
                        <div className="flex items-center gap-2 pt-0.5">
                            <input
                                type="checkbox"
                                id="reg-terms"
                                checked={termsAccepted}
                                onChange={(e) => setTermsAccepted(e.target.checked)}
                                className="h-3.5 w-3.5 rounded border-white/20 bg-white/[0.05] text-emerald-500 focus:ring-emerald-500/20 focus:ring-offset-0 transition"
                            />
                            <label htmlFor="reg-terms" className="text-[11px] text-zinc-400 cursor-pointer select-none">
                                I agree to the Terms of Service and Privacy Policy
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-1"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                    <span>Creating Account...</span>
                                </div>
                            ) : (
                                <>
                                    <span>Create {selectedRole} Account</span>
                                    <ArrowRight size={15} />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Switch to Login */}
                    <div className="mt-5 pt-4 border-t border-white/[0.08] text-center text-xs text-zinc-400">
                        Already have an account?{' '}
                        <button
                            type="button"
                            onClick={() => navigateTo('login')}
                            className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                        >
                            Sign In
                        </button>
                    </div>
                </div>
            </div>
        </div>
        </div>
    );
};

export default RegisterPage;
