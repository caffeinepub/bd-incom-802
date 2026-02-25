import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  useGetAdminDashboard,
  useIsCallerAdmin,
  useAllWithdrawRequests,
  useAdminApproveWithdraw,
  useAdminRejectWithdraw,
  useCountdownTarget,
  useSetCountdownTarget,
} from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ShieldCheck,
  Users,
  UserCheck,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Banknote,
  Loader2,
  Timer,
} from 'lucide-react';
import { toast } from 'sonner';
import type { WithdrawalRequest } from '../backend';

function truncatePrincipal(principal: string): string {
  if (principal.length <= 16) return principal;
  return `${principal.slice(0, 8)}...${principal.slice(-6)}`;
}

function formatTimestamp(createdAt: bigint): string {
  return new Date(Number(createdAt) / 1_000_000).toLocaleString('bn-BD', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Convert bigint nanoseconds to datetime-local string in BST (UTC+6)
function nanosToDatetimeLocal(nanos: bigint): string {
  const ms = Number(nanos) / 1_000_000;
  // BST offset: UTC+6 = +360 minutes
  const bstOffsetMs = 6 * 60 * 60 * 1000;
  const bstMs = ms + bstOffsetMs;
  const d = new Date(bstMs);
  // Format as YYYY-MM-DDTHH:mm
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  const hours = String(d.getUTCHours()).padStart(2, '0');
  const minutes = String(d.getUTCMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// Convert datetime-local string (BST UTC+6) to bigint nanoseconds
function datetimeLocalToNanos(datetimeLocal: string): bigint {
  // Parse as UTC then subtract BST offset
  const bstOffsetMs = 6 * 60 * 60 * 1000;
  const utcMs = new Date(datetimeLocal).getTime() - bstOffsetMs;
  return BigInt(utcMs) * BigInt(1_000_000);
}

function WithdrawStatusBadge({ status }: { status: string }) {
  switch (status.toLowerCase()) {
    case 'successful':
      return (
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 border text-[10px] px-2 py-0.5">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          সফল
        </Badge>
      );
    case 'rejected':
      return (
        <Badge className="bg-destructive/20 text-destructive border-destructive/30 border text-[10px] px-2 py-0.5">
          <XCircle className="w-3 h-3 mr-1" />
          বাতিল
        </Badge>
      );
    default:
      return (
        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 border text-[10px] px-2 py-0.5">
          <Clock className="w-3 h-3 mr-1" />
          পেন্ডিং
        </Badge>
      );
  }
}

function WithdrawRequestRow({ req }: { req: WithdrawalRequest }) {
  const approveMutation = useAdminApproveWithdraw();
  const rejectMutation = useAdminRejectWithdraw();
  const isPending = req.status.toLowerCase() === 'pending';

  return (
    <div className="px-4 py-3 hover:bg-muted/20 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <WithdrawStatusBadge status={req.status} />
            <span className="font-mono text-xs text-muted-foreground">
              {truncatePrincipal(req.principal.toString())}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
            <span>বিকাশ: <span className="text-foreground font-medium">{req.number}</span></span>
            <span>{formatTimestamp(req.createdAt)}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <p className="text-sm font-black text-gold">৳{Number(req.amount)}</p>
          {isPending && (
            <div className="flex gap-1.5">
              <Button
                size="sm"
                variant="outline"
                className="h-6 px-2 text-[10px] border-green-500/40 text-green-400 hover:bg-green-500/10 hover:text-green-300"
                disabled={approveMutation.isPending || rejectMutation.isPending}
                onClick={() => approveMutation.mutate(req.id)}
              >
                {approveMutation.isPending ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  'অ্যাপ্রুভ'
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-6 px-2 text-[10px] border-destructive/40 text-destructive hover:bg-destructive/10"
                disabled={approveMutation.isPending || rejectMutation.isPending}
                onClick={() => rejectMutation.mutate(req.id)}
              >
                {rejectMutation.isPending ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  'রিজেক্ট'
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CountdownSettingsSection() {
  const { data: targetNanos, isLoading: targetLoading } = useCountdownTarget();
  const setCountdownMutation = useSetCountdownTarget();
  const [datetimeValue, setDatetimeValue] = useState('');

  useEffect(() => {
    if (targetNanos !== undefined && targetNanos > 0n) {
      setDatetimeValue(nanosToDatetimeLocal(targetNanos));
    }
  }, [targetNanos]);

  const handleUpdate = () => {
    if (!datetimeValue) return;
    const nanos = datetimeLocalToNanos(datetimeValue);
    setCountdownMutation.mutate(nanos, {
      onSuccess: () => {
        toast.success('কাউন্টডাউন সময় আপডেট হয়েছে! ✅');
      },
      onError: () => {
        toast.error('আপডেট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      },
    });
  };

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden card-glow">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <Timer className="w-4 h-4 text-accent" />
        <span className="font-bold text-sm">কাউন্টডাউন সেটিংস</span>
      </div>
      <div className="p-4 space-y-4">
        <p className="text-xs text-muted-foreground">
          শুভ যাত্রার টার্গেট তারিখ ও সময় সেট করুন (বাংলাদেশ সময় UTC+6)
        </p>
        {targetLoading ? (
          <Skeleton className="h-10 w-full rounded-xl" />
        ) : (
          <div className="space-y-2">
            <Label htmlFor="countdown-datetime" className="text-xs font-semibold text-foreground">
              তারিখ ও সময়
            </Label>
            <Input
              id="countdown-datetime"
              type="datetime-local"
              value={datetimeValue}
              onChange={(e) => setDatetimeValue(e.target.value)}
              className="bg-background border-border text-foreground text-sm rounded-xl"
            />
          </div>
        )}
        <Button
          onClick={handleUpdate}
          disabled={setCountdownMutation.isPending || !datetimeValue || targetLoading}
          className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-bold rounded-xl"
          size="sm"
        >
          {setCountdownMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              আপডেট হচ্ছে...
            </>
          ) : (
            <>
              <Timer className="w-4 h-4 mr-2" />
              কাউন্টডাউন আপডেট করুন
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: dashboard, isLoading: dashboardLoading } = useGetAdminDashboard();
  const { data: withdrawRequests, isLoading: withdrawLoading } = useAllWithdrawRequests();

  if (adminLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full rounded-2xl" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertCircle className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-xl font-bold mb-2">অ্যাক্সেস নেই</h2>
        <p className="text-muted-foreground text-sm">শুধুমাত্র অ্যাডমিনরা এই পেজ দেখতে পারবেন।</p>
      </div>
    );
  }

  const stats = [
    {
      label: 'মোট ইউজার',
      value: dashboard ? Number(dashboard.totalUsers) : 0,
      icon: Users,
      color: 'text-primary',
      bg: 'bg-primary/10 border-primary/20',
    },
    {
      label: 'অ্যাক্টিভ ইউজার',
      value: dashboard ? Number(dashboard.activeUsers) : 0,
      icon: UserCheck,
      color: 'text-green-400',
      bg: 'bg-green-400/10 border-green-400/20',
    },
    {
      label: 'পেন্ডিং অ্যাক্টিভেশন',
      value: dashboard ? Number(dashboard.pendingActivations) : 0,
      icon: Clock,
      color: 'text-secondary',
      bg: 'bg-secondary/10 border-secondary/20',
    },
    {
      label: 'মোট বিতরণ (BDT)',
      value: dashboard ? Number(dashboard.totalEarnings) : 0,
      icon: TrendingUp,
      color: 'text-gold',
      bg: 'bg-gold/10 border-gold/20',
      prefix: '৳',
    },
  ];

  const pendingWithdrawCount = withdrawRequests
    ? withdrawRequests.filter((r: WithdrawalRequest) => r.status.toLowerCase() === 'pending').length
    : 0;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-secondary/20 border border-secondary/30 flex items-center justify-center">
          <ShieldCheck className="w-6 h-6 text-secondary" />
        </div>
        <div>
          <h1 className="text-xl font-black">অ্যাডমিন ড্যাশবোর্ড</h1>
          <p className="text-muted-foreground text-sm">সকল ইউজারের পরিসংখ্যান</p>
        </div>
      </div>

      {/* Stats Grid */}
      {dashboardLoading ? (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {stats.map(({ label, value, icon: Icon, color, bg, prefix }) => (
            <div
              key={label}
              className={`bg-card border rounded-2xl p-4 card-glow ${bg}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${bg}`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <p className={`text-2xl font-black ${color}`}>
                {prefix}{value.toLocaleString('bn-BD')}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 font-medium">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => navigate({ to: '/admin/activations' })}
          className="flex-1 bg-card border border-secondary/30 rounded-xl p-3 text-center gold-glow hover:bg-secondary/10 transition-colors"
        >
          <Clock className="w-5 h-5 text-secondary mx-auto mb-1" />
          <p className="text-xs font-semibold text-secondary">অ্যাক্টিভেশন রিকোয়েস্ট</p>
        </button>
      </div>

      {/* Countdown Settings */}
      <CountdownSettingsSection />

      {/* Withdraw Requests Management */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden card-glow">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Banknote className="w-4 h-4 text-primary" />
            <span className="font-bold text-sm">উইথড্র রিকোয়েস্ট ম্যানেজমেন্ট</span>
          </div>
          <div className="flex items-center gap-1.5">
            {pendingWithdrawCount > 0 && (
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 border text-[10px] px-2 py-0.5">
                {pendingWithdrawCount} পেন্ডিং
              </Badge>
            )}
            {withdrawRequests && withdrawRequests.length > 0 && (
              <Badge variant="outline" className="text-xs border-primary/40 text-primary">
                মোট {withdrawRequests.length}
              </Badge>
            )}
          </div>
        </div>

        {withdrawLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
          </div>
        ) : !withdrawRequests || withdrawRequests.length === 0 ? (
          <div className="p-8 text-center">
            <Banknote className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">কোনো উইথড্র রিকোয়েস্ট নেই</p>
          </div>
        ) : (
          <ScrollArea className="max-h-[500px]">
            <div className="divide-y divide-border">
              {[...withdrawRequests]
                .sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
                .map((req: WithdrawalRequest) => (
                  <WithdrawRequestRow key={Number(req.id)} req={req} />
                ))}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* User List */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden card-glow">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <span className="font-bold text-sm">ইউজার তালিকা</span>
          </div>
          {dashboard && (
            <Badge variant="outline" className="text-xs border-primary/40 text-primary">
              {Number(dashboard.totalUsers)} জন
            </Badge>
          )}
        </div>

        {dashboardLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
          </div>
        ) : !dashboard || dashboard.users.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">কোনো ইউজার নেই</p>
          </div>
        ) : (
          <ScrollArea className="max-h-[400px]">
            <div className="divide-y divide-border">
              {dashboard.users.map((user) => {
                const principalStr = user.principal.toString();
                return (
                  <div key={principalStr} className="px-4 py-3 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {user.isActive ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          )}
                          <span className="font-mono text-xs text-muted-foreground truncate">
                            {truncatePrincipal(principalStr)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <Badge
                            variant="outline"
                            className={`text-[10px] px-1.5 py-0 ${
                              user.isActive
                                ? 'border-green-400/40 text-green-400'
                                : 'border-muted-foreground/40 text-muted-foreground'
                            }`}
                          >
                            {user.isActive ? 'অ্যাক্টিভ' : 'ইনঅ্যাক্টিভ'}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            রেফারেল: {Number(user.referralCount)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-black text-gold">৳{Number(user.balance)}</p>
                        <p className="text-[10px] text-muted-foreground">ব্যালেন্স</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
