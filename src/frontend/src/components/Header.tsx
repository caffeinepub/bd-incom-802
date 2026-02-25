import React, { useState, useEffect } from 'react';
import { useRouter } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useGetCallerUserProfile, useIsCallerAdmin } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { LogOut, LogIn, Loader2, Shield } from 'lucide-react';

export default function Header() {
  const { identity, login, clear, loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: isAdmin } = useIsCallerAdmin();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';
  const [showRamadan, setShowRamadan] = useState(false);

  // Toggle between logo and Ramadan text every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setShowRamadan((prev) => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: unknown) {
        const err = error as Error;
        if (err?.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-sm">
      <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
        {/* Animated Logo / Ramadan Text */}
        <div className="flex items-center gap-2 relative h-8 min-w-[200px]">
          <div
            className={`absolute inset-0 flex items-center gap-2 transition-opacity duration-700 ${
              showRamadan ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <img
              src="/assets/generated/logo-bdincomer802.dim_400x120.png"
              alt="BD INCOM 802"
              className="h-8 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <span className="font-black text-lg text-gold tracking-tight whitespace-nowrap">BD INCOM 802</span>
          </div>
          <div
            className={`absolute inset-0 flex items-center transition-opacity duration-700 ${
              showRamadan ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <span
              className="font-bold text-base tracking-wide animate-pulse whitespace-nowrap"
              style={{ color: 'oklch(0.88 0.16 75)' }}
            >
              🌙 রমজান মোবারক 🌙
            </span>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {isAdmin && (
            <span className="flex items-center gap-1 text-xs bg-secondary/20 text-secondary px-2 py-1 rounded-full border border-secondary/30">
              <Shield className="w-3 h-3" />
              Admin
            </span>
          )}
          {isAuthenticated && userProfile && (
            <span className="text-sm font-bold text-gold">
              ৳{Number(userProfile.balance).toLocaleString()}
            </span>
          )}
          <Button
            onClick={handleAuth}
            disabled={isLoggingIn}
            variant="ghost"
            size="sm"
            className="h-8 px-3 text-xs rounded-lg"
          >
            {isLoggingIn ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isAuthenticated ? (
              <LogOut className="w-4 h-4" />
            ) : (
              <LogIn className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
