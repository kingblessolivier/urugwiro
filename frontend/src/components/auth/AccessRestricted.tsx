import React from 'react';
import { ShieldAlert, Lock, ArrowRight, Home, LogOut, Compass, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  type AppView,
  getRequiredRoleForView,
  getViewFriendlyName,
  getDefaultDashboardForUser,
} from '../../types/navigation';
import { Button } from '../ui/Button';

interface AccessRestrictedProps {
  view: AppView;
  onNavigate: (view: AppView) => void;
}

export const AccessRestricted: React.FC<AccessRestrictedProps> = ({ view, onNavigate }) => {
  const { user, isAuthenticated, logout } = useAuth();

  const requiredRole = getRequiredRoleForView(view);
  const friendlyName = getViewFriendlyName(view);
  const userDashboard = getDefaultDashboardForUser(user);
  const userDashboardName = getViewFriendlyName(userDashboard);

  const handleSwitchAccount = async () => {
    await logout();
    onNavigate('login');
  };

  return (
    <div className="relative min-h-[75vh] flex items-center justify-center px-4 py-16">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-red-500/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 left-1/3 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />

      <div className="relative w-full max-w-xl rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl p-8 md:p-10 shadow-2xl shadow-black/60 text-center">
        {/* Shield / Lock Badge */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-400 shadow-inner shadow-amber-500/20">
          {isAuthenticated ? <ShieldAlert size={42} className="animate-pulse" /> : <Lock size={42} />}
        </div>

        {/* Status Tag */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-semibold tracking-wide uppercase mb-3">
          <Lock size={12} />
          <span>Access Restricted</span>
        </div>

        {/* Headline */}
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          Role Authorization Required
        </h1>

        <p className="mt-3 text-sm md:text-base text-zinc-300 leading-relaxed">
          The requested workspace{' '}
          <span className="font-semibold text-white underline decoration-amber-500/40 underline-offset-4">
            {friendlyName}
          </span>{' '}
          is restricted to accounts with <span className="font-bold text-amber-400">{requiredRole}</span> privileges.
        </p>

        {/* User Identity / Role Status Card */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-left">
          {isAuthenticated && user ? (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold text-sm">
                  {(user.full_name || user.username || 'U').slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-zinc-400">Currently logged in as</div>
                  <div className="text-sm font-bold text-white truncate">
                    {user.full_name || user.username}
                  </div>
                  <div className="text-xs text-zinc-400 truncate">{user.email}</div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold border border-zinc-700 bg-zinc-800/80 text-zinc-200">
                  Role: {user.role || 'Buyer'}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-zinc-300 text-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-zinc-400">
                <Lock size={18} />
              </div>
              <div>
                <div className="font-semibold text-white">Unauthenticated Visitor</div>
                <div className="text-xs text-zinc-400">Sign in with an authorized account to enter this workspace.</div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col gap-3">
          {isAuthenticated && user ? (
            <>
              <Button
                variant="primary"
                onClick={() => onNavigate(userDashboard)}
                className="w-full py-3.5 rounded-xl font-semibold bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 cursor-pointer"
              >
                <span>Go to My Workspace ({userDashboardName})</span>
                <ArrowRight size={16} />
              </Button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate('home')}
                  className="rounded-xl px-4 py-2.5 text-xs font-semibold text-zinc-300 border border-white/10 hover:border-white/20 bg-white/[0.04] hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Home size={14} />
                  <span>Public Marketplace</span>
                </button>
                <button
                  type="button"
                  onClick={handleSwitchAccount}
                  className="rounded-xl px-4 py-2.5 text-xs font-semibold text-red-300 border border-red-500/20 hover:border-red-500/40 bg-red-500/10 hover:bg-red-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut size={14} />
                  <span>Switch Account</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <Button
                variant="primary"
                onClick={() => onNavigate('login')}
                className="w-full py-3.5 rounded-xl font-semibold bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 cursor-pointer"
              >
                <span>Sign In to Continue</span>
                <ArrowRight size={16} />
              </Button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate('register')}
                  className="rounded-xl px-4 py-2.5 text-xs font-semibold text-emerald-400 border border-emerald-500/30 hover:border-emerald-500/50 bg-emerald-500/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles size={14} />
                  <span>Create Account</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('home')}
                  className="rounded-xl px-4 py-2.5 text-xs font-semibold text-zinc-300 border border-white/10 hover:border-white/20 bg-white/[0.04] hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Compass size={14} />
                  <span>Explore Marketplace</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Security Note Footer */}
        <div className="mt-8 border-t border-white/[0.06] pt-4 text-xs text-zinc-500 flex items-center justify-center gap-2">
          <span>Urugwiro Sovereign RBAC</span>
          <span>•</span>
          <span>Rwanda Real Estate Trust Infrastructure</span>
        </div>
      </div>
    </div>
  );
};

export default AccessRestricted;
