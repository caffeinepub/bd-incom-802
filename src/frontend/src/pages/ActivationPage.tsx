import React, { useState } from 'react';
import { useGetCallerUserProfile, useSubmitActivation, useGetPayNumber } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  CheckCircle,
  Copy,
  Loader2,
  AlertCircle,
  Smartphone,
  ArrowRight,
  Clock,
} from 'lucide-react';

export default function ActivationPage() {
  const { data: userProfile, isLoading } = useGetCallerUserProfile();
  const { data: payNumber = '01831097802' } = useGetPayNumber();
  const { mutateAsync: submitActivation, isPending } = useSubmitActivation();
  const [txNumber, setTxNumber] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleCopyNumber = async () => {
    try {
      await navigator.clipboard.writeText(payNumber);
      toast.success('নম্বর কপি হয়েছে!');
    } catch {
      toast.error('কপি করতে সমস্যা হয়েছে');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txNumber.trim()) return;
    try {
      await submitActivation({ transactionNumber: txNumber.trim(), amount: BigInt(50) });
      setSubmitted(true);
      toast.success('অ্যাক্টিভেশন রিকোয়েস্ট পাঠানো হয়েছে!');
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error?.message || 'সমস্যা হয়েছে, আবার চেষ্টা করুন');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-60 w-full rounded-2xl" />
      </div>
    );
  }

  if (userProfile?.isActive) {
    return (
      <div className="animate-fade-in">
        <div className="bg-card border border-primary/40 rounded-2xl p-6 text-center card-glow">
          <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-black text-primary mb-2">অ্যাকাউন্ট অ্যাক্টিভ!</h2>
          <p className="text-muted-foreground text-sm">
            আপনার অ্যাকাউন্ট সফলভাবে অ্যাক্টিভ হয়েছে এবং ৳৫০ বোনাস যোগ হয়েছে।
          </p>
          <div className="mt-4 bg-primary/10 rounded-xl p-4">
            <p className="text-3xl font-black text-gold">৳{Number(userProfile.balance).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">বর্তমান ব্যালেন্স</p>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="animate-fade-in">
        <div className="bg-card border border-secondary/40 rounded-2xl p-6 text-center gold-glow">
          <Clock className="w-16 h-16 text-secondary mx-auto mb-4" />
          <h2 className="text-xl font-black text-secondary mb-2">রিকোয়েস্ট পাঠানো হয়েছে!</h2>
          <p className="text-muted-foreground text-sm">
            আপনার অ্যাক্টিভেশন রিকোয়েস্ট পর্যালোচনা করা হচ্ছে। অ্যাডমিন অনুমোদন করলে ৳৫০ বোনাস যোগ হবে।
          </p>
          <div className="mt-4 bg-secondary/10 border border-secondary/20 rounded-xl p-3">
            <p className="text-xs text-muted-foreground">ট্রানজেকশন নম্বর</p>
            <p className="font-mono font-bold text-secondary">{txNumber}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-black mb-1">অ্যাকাউন্ট অ্যাক্টিভ করুন</h1>
        <p className="text-muted-foreground text-sm">৳৫০ বোনাস পেতে এখনই পেমেন্ট করুন</p>
      </div>

      {/* bKash payment card */}
      <div className="bg-card border border-secondary/40 rounded-2xl p-5 gold-glow">
        <div className="flex items-center gap-2 mb-4">
          <Smartphone className="w-5 h-5 text-secondary" />
          <h2 className="font-bold text-secondary">বিকাশে পেমেন্ট করুন</h2>
        </div>

        <div className="space-y-3">
          <div className="bg-background rounded-xl p-4 border border-border">
            <p className="text-xs text-muted-foreground mb-1">বিকাশ নম্বর (Send Money)</p>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-black text-gold font-mono tracking-wider">{payNumber}</p>
              <Button
                onClick={handleCopyNumber}
                variant="ghost"
                size="sm"
                className="text-secondary hover:bg-secondary/10"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="bg-secondary/10 border border-secondary/20 rounded-xl p-3 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">পাঠাতে হবে</span>
            <span className="text-xl font-black text-gold">৳৫০</span>
          </div>
        </div>

        {/* Steps */}
        <div className="mt-4 space-y-2">
          {[
            'বিকাশ অ্যাপ খুলুন',
            `${payNumber} নম্বরে ৳৫০ Send Money করুন`,
            'ট্রানজেকশন নম্বর কপি করুন',
            'নিচের ফর্মে সাবমিট করুন',
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-secondary/20 text-secondary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="text-sm text-muted-foreground">{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Submission form */}
      <div className="bg-card border border-border rounded-2xl p-5 card-glow">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="w-4 h-4 text-primary" />
          <h2 className="font-bold">ট্রানজেকশন নম্বর দিন</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="txNumber" className="text-sm mb-1.5 block">
              ট্রানজেকশন নম্বর (TrxID)
            </Label>
            <Input
              id="txNumber"
              value={txNumber}
              onChange={(e) => setTxNumber(e.target.value)}
              placeholder="যেমন: 8N7A6B5C4D"
              className="bg-input border-border rounded-xl h-12 font-mono tracking-wider text-center text-lg"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              বিকাশ থেকে পাওয়া ট্রানজেকশন আইডি দিন
            </p>
          </div>

          <div className="bg-primary/10 border border-primary/20 rounded-xl p-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">পেমেন্ট পরিমাণ</span>
              <span className="font-bold text-primary">৳৫০</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-muted-foreground">অ্যাক্টিভেশন বোনাস</span>
              <span className="font-bold text-gold">+৳৫০</span>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isPending || !txNumber.trim()}
            className="w-full h-12 green-gradient text-white border-0 rounded-xl font-bold text-base"
          >
            {isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                সাবমিট হচ্ছে...
              </>
            ) : (
              <>
                সাবমিট করুন
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
