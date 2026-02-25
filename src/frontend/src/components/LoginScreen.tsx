import React, { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Loader2, LogIn, Shield, TrendingUp, Gift, Play, KeyRound, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Store admin token in sessionStorage so it persists during the session
const ADMIN_TOKEN_KEY = 'caffeineAdminToken';

function setAdminTokenInSession(token: string) {
  if (token) {
    sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
    // Also update URL param so useActor picks it up
    const url = new URL(window.location.href);
    url.searchParams.set('caffeineAdminToken', token);
    window.history.replaceState({}, '', url.toString());
  }
}

export default function LoginScreen() {
  const { login, loginStatus } = useInternetIdentity();
  const isLoggingIn = loginStatus === 'logging-in';
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [adminToken, setAdminToken] = useState('');
  const [showToken, setShowToken] = useState(false);

  const handleLogin = async (asAdmin = false) => {
    if (asAdmin && adminToken.trim()) {
      setAdminTokenInSession(adminToken.trim());
    }
    try {
      await login();
    } catch (error: unknown) {
      const err = error as Error;
      if (err?.message === 'User is already authenticated') {
        // Already authenticated, ignore
      }
    }
  };

  return (
    <div className="min-h-screen hero-gradient flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="mb-8 text-center animate-fade-in">
        <img
          src="/assets/generated/logo-bdincomer802.dim_400x120.png"
          alt="BD INCOM 802"
          className="h-16 mx-auto mb-4 object-contain"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        <h1 className="text-4xl font-black text-gold tracking-tight">BD INCOM 802</h1>
        <p className="text-muted-foreground mt-1 text-sm">আয় করুন, প্রতিদিন</p>
      </div>

      {/* Feature highlights */}
      <div className="grid grid-cols-2 gap-3 mb-8 w-full max-w-sm animate-fade-in">
        {[
          { icon: Gift, label: 'রেফারেল বোনাস', value: '৳১৫' },
          { icon: TrendingUp, label: 'অ্যাক্টিভেশন বোনাস', value: '৳৫০' },
          { icon: Shield, label: 'দৈনিক স্পিন', value: '৫টি' },
          { icon: Play, label: 'ভিডিও রিওয়ার্ড', value: '৳২/ভিডিও' },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-3 card-glow text-center">
            <Icon className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-sm font-bold text-gold">{value}</p>
          </div>
        ))}
      </div>

      {/* Login card */}
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl p-6 card-glow animate-fade-in">
        <h2 className="text-xl font-bold text-center mb-2">লগইন করুন</h2>
        <p className="text-muted-foreground text-sm text-center mb-6">
          আপনার অ্যাকাউন্টে প্রবেশ করতে লগইন করুন
        </p>
        <Button
          onClick={() => handleLogin(false)}
          disabled={isLoggingIn}
          className="w-full h-12 text-base font-bold green-gradient text-white border-0 rounded-xl"
        >
          {isLoggingIn ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              লগইন হচ্ছে...
            </>
          ) : (
            <>
              <LogIn className="w-5 h-5 mr-2" />
              লগইন করুন
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground text-center mt-4">
          Internet Identity দিয়ে নিরাপদ লগইন
        </p>

        {/* Admin login toggle */}
        <div className="mt-5 pt-4 border-t border-border">
          <button
            type="button"
            onClick={() => setShowAdminForm((v) => !v)}
            className="w-full flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-secondary transition-colors"
          >
            <Shield className="w-3.5 h-3.5" />
            {showAdminForm ? 'অ্যাডমিন লগইন বন্ধ করুন' : 'অ্যাডমিন লগইন'}
          </button>

          {showAdminForm && (
            <div className="mt-4 space-y-3 animate-fade-in">
              <div>
                <Label htmlFor="admin-token" className="text-xs font-medium text-secondary mb-1.5 flex items-center gap-1">
                  <KeyRound className="w-3 h-3" />
                  অ্যাডমিন সিক্রেট কোড
                </Label>
                <div className="relative">
                  <Input
                    id="admin-token"
                    type={showToken ? 'text' : 'password'}
                    value={adminToken}
                    onChange={(e) => setAdminToken(e.target.value)}
                    placeholder="সিক্রেট কোড লিখুন..."
                    className="bg-input border-secondary/40 rounded-xl h-11 pr-10 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button
                onClick={() => handleLogin(true)}
                disabled={isLoggingIn || !adminToken.trim()}
                className="w-full h-11 text-sm font-bold bg-secondary/20 border border-secondary/40 text-secondary hover:bg-secondary/30 rounded-xl"
                variant="outline"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    লগইন হচ্ছে...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    অ্যাডমিন হিসেবে লগইন
                  </>
                )}
              </Button>
              <p className="text-[10px] text-muted-foreground text-center">
                শুধুমাত্র অ্যাডমিনের জন্য — অ্যাডমিন কোড না জানলে ব্যবহার করবেন না
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <p className="mt-8 text-xs text-muted-foreground text-center">
        © {new Date().getFullYear()} BD INCOM 802 · Built with ❤️ using{' '}
        <a
          href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'bd-incom-802')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          caffeine.ai
        </a>
      </p>
    </div>
  );
}
