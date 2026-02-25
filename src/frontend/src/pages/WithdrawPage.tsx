import React, { useState } from 'react';
import { Banknote, Clock, CheckCircle2, XCircle, AlertCircle, Loader2, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useMyWithdrawRequests, useSubmitWithdrawRequest } from '../hooks/useQueries';
import type { WithdrawalRequest } from '../backend';

function getStatusBadge(status: string) {
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

function formatTimestamp(createdAt: bigint): string {
  return new Date(Number(createdAt) / 1_000_000).toLocaleDateString('bn-BD', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function isToday(createdAt: bigint): boolean {
  const date = new Date(Number(createdAt) / 1_000_000);
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

export default function WithdrawPage() {
  const [bkashNumber, setBkashNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [formError, setFormError] = useState('');

  const { data: requests, isLoading: requestsLoading } = useMyWithdrawRequests();
  const submitMutation = useSubmitWithdrawRequest();

  const todayCount = requests ? requests.filter((r: WithdrawalRequest) => isToday(r.createdAt)).length : 0;
  const isLimitReached = todayCount >= 2;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!bkashNumber.trim()) {
      setFormError('বিকাশ নম্বর দিন।');
      return;
    }
    if (bkashNumber.trim().length < 11) {
      setFormError('সঠিক বিকাশ নম্বর দিন (১১ সংখ্যা)।');
      return;
    }

    const amountNum = parseInt(amount, 10);
    if (!amount || isNaN(amountNum) || amountNum < 100) {
      setFormError('সর্বনিম্ন ১০০ টাকা উইথড্র করতে হবে।');
      return;
    }

    try {
      await submitMutation.mutateAsync({ number: bkashNumber.trim(), amount: BigInt(amountNum) });
      setBkashNumber('');
      setAmount('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('daily limit')) {
        setFormError('আজকের জন্য সর্বোচ্চ ২টি উইথড্র রিকোয়েস্ট করা হয়ে গেছে।');
      } else if (msg.includes('100')) {
        setFormError('সর্বনিম্ন ১০০ টাকা উইথড্র করতে হবে।');
      } else {
        setFormError('রিকোয়েস্ট পাঠানো যায়নি। আবার চেষ্টা করুন।');
      }
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
          <Banknote className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-black">উইথড্র</h1>
          <p className="text-muted-foreground text-sm">বিকাশে টাকা তুলুন</p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex gap-2">
        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-300 space-y-0.5">
          <p className="font-semibold">গুরুত্বপূর্ণ তথ্য</p>
          <p>• পেমেন্ট মেথড: শুধুমাত্র <strong>বিকাশ</strong></p>
          <p>• সর্বনিম্ন উইথড্র: <strong>১০০ টাকা</strong></p>
          <p>• দৈনিক সর্বোচ্চ: <strong>২ বার</strong></p>
          <p>• পেমেন্ট ম্যানুয়ালি প্রক্রিয়া করা হয়</p>
        </div>
      </div>

      {/* Daily Limit Warning */}
      {isLimitReached && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-3 flex gap-2">
          <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
          <p className="text-xs text-destructive">
            আজকের জন্য সর্বোচ্চ ২টি উইথড্র রিকোয়েস্ট করা হয়ে গেছে। আগামীকাল আবার চেষ্টা করুন।
          </p>
        </div>
      )}

      {/* Withdraw Form */}
      <Card className="bg-card border-border card-glow">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Banknote className="w-4 h-4 text-primary" />
            উইথড্র রিকোয়েস্ট
            <span className="ml-auto text-xs font-normal text-muted-foreground">
              আজ: {todayCount}/২
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="bkash-number" className="text-sm font-semibold">
                বিকাশ নম্বর
              </Label>
              <Input
                id="bkash-number"
                type="tel"
                placeholder="01XXXXXXXXX"
                value={bkashNumber}
                onChange={(e) => setBkashNumber(e.target.value)}
                disabled={isLimitReached || submitMutation.isPending}
                maxLength={11}
                className="bg-background border-border focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="amount" className="text-sm font-semibold">
                পরিমাণ (টাকা)
              </Label>
              <Input
                id="amount"
                type="number"
                placeholder="সর্বনিম্ন ১০০"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isLimitReached || submitMutation.isPending}
                min={100}
                className="bg-background border-border focus:border-primary"
              />
              <p className="text-[11px] text-muted-foreground">সর্বনিম্ন ১০০ টাকা</p>
            </div>

            {formError && (
              <div className="flex items-center gap-2 text-destructive text-xs bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {formError}
              </div>
            )}

            {submitMutation.isSuccess && (
              <div className="flex items-center gap-2 text-green-400 text-xs bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                রিকোয়েস্ট সফলভাবে পাঠানো হয়েছে! অ্যাডমিন শীঘ্রই প্রক্রিয়া করবেন।
              </div>
            )}

            <Button
              type="submit"
              disabled={isLimitReached || submitMutation.isPending}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
            >
              {submitMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  পাঠানো হচ্ছে...
                </>
              ) : (
                <>
                  <Banknote className="w-4 h-4 mr-2" />
                  উইথড্র রিকোয়েস্ট করুন
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Request History */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden card-glow">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <span className="font-bold text-sm">উইথড্র ইতিহাস</span>
          </div>
          {requests && requests.length > 0 && (
            <Badge variant="outline" className="text-xs border-primary/40 text-primary">
              {requests.length}টি
            </Badge>
          )}
        </div>

        {requestsLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : !requests || requests.length === 0 ? (
          <div className="p-8 text-center">
            <Banknote className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">কোনো উইথড্র রিকোয়েস্ট নেই</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {[...requests]
              .sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
              .map((req: WithdrawalRequest) => (
                <div key={Number(req.id)} className="px-4 py-3 hover:bg-muted/20 transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusBadge(req.status)}
                        <span className="text-xs font-mono text-muted-foreground">{req.number}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">{formatTimestamp(req.createdAt)}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-black text-gold">৳{Number(req.amount)}</p>
                      <p className="text-[10px] text-muted-foreground">বিকাশ</p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
