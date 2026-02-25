import React from 'react';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import ReferralCodeDisplay from '../components/ReferralCodeDisplay';
import ReferralCodeInput from '../components/ReferralCodeInput';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, TrendingUp, AlertCircle } from 'lucide-react';
import { Link } from '@tanstack/react-router';

export default function ReferralPage() {
  const { data: userProfile, isLoading } = useGetCallerUserProfile();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    );
  }

  const hasReferrer = !!userProfile?.referrer;
  const referralCode = userProfile?.referralCode || '';
  const isActive = userProfile?.isActive ?? false;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl green-gradient flex items-center justify-center mx-auto mb-3">
          <Users className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-black mb-1">রেফারেল প্রোগ্রাম</h1>
        <p className="text-muted-foreground text-sm">বন্ধুদের আমন্ত্রণ জানান, আয় করুন</p>
      </div>

      {/* How it works */}
      <div className="bg-card border border-border rounded-2xl p-4 card-glow">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-primary" />
          <p className="text-sm font-bold">কীভাবে কাজ করে</p>
        </div>
        <div className="space-y-2">
          {[
            'আপনার রেফারেল কোড বন্ধুকে দিন',
            'বন্ধু অ্যাকাউন্ট খুলে কোড ব্যবহার করুক',
            'বন্ধু অ্যাকাউন্ট অ্যাক্টিভ করলে আপনি পাবেন ৳১৫',
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="text-sm text-muted-foreground">{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Activation warning */}
      {!isActive && (
        <Link to="/activation">
          <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-3 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
            <p className="text-sm text-destructive">
              রেফারেল কোড ব্যবহার করতে আগে অ্যাকাউন্ট অ্যাক্টিভ করুন
            </p>
          </div>
        </Link>
      )}

      {/* Referral code display */}
      {referralCode && <ReferralCodeDisplay referralCode={referralCode} />}

      {/* Referral code input - only if no referrer yet */}
      {!hasReferrer && isActive && <ReferralCodeInput />}

      {/* Referrer info */}
      {hasReferrer && (
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-center">
          <p className="text-sm text-primary font-semibold">✓ আপনি একটি রেফারেল কোড ব্যবহার করেছেন</p>
          <p className="text-xs text-muted-foreground mt-1">
            আপনার রেফারার অ্যাক্টিভেশনের পর ৳১৫ পাবেন
          </p>
        </div>
      )}

      {/* Earnings summary */}
      <div className="bg-card border border-border rounded-2xl p-4 card-glow">
        <p className="text-sm font-bold mb-3">রেফারেল আয়</p>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm">মোট রেফারেল বোনাস</span>
          <span className="text-xl font-black text-gold">৳০</span>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          প্রতিটি সফল রেফারেলে ৳১৫ যোগ হবে
        </p>
      </div>
    </div>
  );
}
