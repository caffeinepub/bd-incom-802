import React from 'react';
import { Link } from '@tanstack/react-router';
import { useGetCallerUserProfile, useIsCallerAdmin } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import BalanceCard from '../components/BalanceCard';
import SupportCard from '../components/SupportCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Wallet,
  Gift,
  Users,
  Zap,
  Play,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Clock,
} from 'lucide-react';

export default function DashboardPage() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading } = useGetCallerUserProfile();
  const { data: isAdmin } = useIsCallerAdmin();

  const principal = identity?.getPrincipal().toString() || '';

  if (isLoading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      </div>
    );
  }

  const balance = userProfile ? Number(userProfile.balance) : 0;
  const spinsLeft = userProfile ? Number(userProfile.spinsLeft) : 0;
  const isActive = userProfile?.isActive ?? false;
  const videoWatchedCount = userProfile?.videoRewards.filter((r) => {
    const now = BigInt(Date.now()) * BigInt(1_000_000);
    const oneDayNanos = BigInt(86_400_000_000_000);
    return now - r.lastClaimed < oneDayNanos;
  }).length ?? 0;

  // Estimate earnings breakdown
  const videoEarnings = (userProfile?.videoRewards.length ?? 0) * 2;
  const activationBonus = isActive ? 50 : 0;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Main balance card */}
      <div className="bg-card border border-secondary/30 rounded-2xl p-5 gold-glow">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-secondary" />
            <span className="text-sm text-muted-foreground">মোট ব্যালেন্স</span>
          </div>
          {isActive ? (
            <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
              <CheckCircle className="w-3 h-3 mr-1" />
              অ্যাক্টিভ
            </Badge>
          ) : (
            <Badge variant="outline" className="border-destructive/40 text-destructive text-xs">
              <AlertCircle className="w-3 h-3 mr-1" />
              অ্যাক্টিভ নয়
            </Badge>
          )}
        </div>
        <p className="text-5xl font-black text-gold mt-2">৳{balance.toLocaleString()}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {principal.slice(0, 20)}...
        </p>
      </div>

      {/* Activation prompt */}
      {!isActive && (
        <Link to="/activation">
          <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-destructive">অ্যাকাউন্ট অ্যাক্টিভ করুন</p>
              <p className="text-xs text-muted-foreground mt-0.5">৳৫০ বোনাস পেতে এখনই অ্যাক্টিভ করুন</p>
            </div>
            <ChevronRight className="w-5 h-5 text-destructive" />
          </div>
        </Link>
      )}

      {/* Support Card */}
      <SupportCard />

      {/* Earnings breakdown */}
      <div>
        <h2 className="text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wide">আয়ের বিবরণ</h2>
        <div className="grid grid-cols-2 gap-3">
          <BalanceCard
            title="অ্যাক্টিভেশন বোনাস"
            amount={activationBonus}
            icon={Gift}
            color="gold"
            subtitle={isActive ? 'অ্যাক্টিভ' : 'অ্যাক্টিভ নয়'}
          />
          <BalanceCard
            title="ভিডিও রিওয়ার্ড"
            amount={videoEarnings}
            icon={Play}
            color="blue"
            subtitle={`${userProfile?.videoRewards.length ?? 0}টি ভিডিও`}
          />
          <BalanceCard
            title="স্পিন উইনিং"
            amount={Math.max(0, balance - activationBonus - videoEarnings)}
            icon={Zap}
            color="purple"
            subtitle="স্পিন থেকে আয়"
          />
          <BalanceCard
            title="রেফারেল বোনাস"
            amount={0}
            icon={Users}
            color="green"
            subtitle="রেফারেল থেকে আয়"
          />
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wide">দ্রুত অ্যাকশন</h2>
        <div className="space-y-2">
          <Link to="/spin">
            <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between hover:border-primary/40 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl green-gradient flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold">দৈনিক স্পিন</p>
                  <p className="text-xs text-muted-foreground">{spinsLeft}টি স্পিন বাকি আছে</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {spinsLeft > 0 && (
                  <span className="w-6 h-6 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                    {spinsLeft}
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          </Link>

          <Link to="/videos">
            <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between hover:border-primary/40 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center">
                  <Play className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold">ভিডিও দেখুন</p>
                  <p className="text-xs text-muted-foreground">
                    {videoWatchedCount}/5 ভিডিও দেখা হয়েছে আজ
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {videoWatchedCount < 5 && (
                  <span className="text-xs text-primary font-semibold">৳{(5 - videoWatchedCount) * 2} বাকি</span>
                )}
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          </Link>

          <Link to="/referral">
            <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between hover:border-primary/40 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-chart-5/20 border border-chart-5/30 flex items-center justify-center">
                  <Users className="w-5 h-5 text-chart-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">রেফারেল করুন</p>
                  <p className="text-xs text-muted-foreground">প্রতি রেফারেলে ৳১৫</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </Link>
        </div>
      </div>

      {/* Admin link */}
      {isAdmin && (
        <Link to="/admin/activations">
          <div className="bg-secondary/10 border border-secondary/30 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-secondary" />
              <div>
                <p className="text-sm font-semibold text-secondary">অ্যাডমিন প্যানেল</p>
                <p className="text-xs text-muted-foreground">অ্যাক্টিভেশন রিকোয়েস্ট দেখুন</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-secondary" />
          </div>
        </Link>
      )}
    </div>
  );
}
