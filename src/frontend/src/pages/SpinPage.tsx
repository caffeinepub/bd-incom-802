import React, { useState } from 'react';
import { useGetCallerUserProfile, useSpin } from '../hooks/useQueries';
import SpinWheel from '../components/SpinWheel';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Zap, Loader2, Clock, AlertCircle } from 'lucide-react';
import { Link } from '@tanstack/react-router';

export default function SpinPage() {
  const { data: userProfile, isLoading } = useGetCallerUserProfile();
  const { mutateAsync: spin, isPending } = useSpin();
  const [isSpinning, setIsSpinning] = useState(false);
  const [prizeAmount, setPrizeAmount] = useState<number | null>(null);

  const spinsLeft = userProfile ? Number(userProfile.spinsLeft) : 0;
  const isActive = userProfile?.isActive ?? false;

  // Calculate time until reset
  const getTimeUntilReset = () => {
    if (!userProfile) return null;
    const lastReset = Number(userProfile.lastSpinReset) / 1_000_000; // convert to ms
    const resetTime = lastReset + 24 * 60 * 60 * 1000;
    const remaining = resetTime - Date.now();
    if (remaining <= 0) return null;
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}ঘ ${minutes}মি`;
  };

  const handleSpin = async () => {
    if (isSpinning || isPending || spinsLeft === 0) return;
    setIsSpinning(true);
    setPrizeAmount(null);

    try {
      const prize = await spin();
      // Wait for animation to complete (3 seconds)
      setTimeout(() => {
        setIsSpinning(false);
        setPrizeAmount(Number(prize));
        toast.success(`🎉 আপনি জিতেছেন ৳${Number(prize)}!`);
      }, 3000);
    } catch (err: unknown) {
      const error = err as Error;
      setIsSpinning(false);
      toast.error(error?.message || 'স্পিন করতে সমস্যা হয়েছে');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-80 w-full rounded-2xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
      </div>
    );
  }

  const timeUntilReset = getTimeUntilReset();

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-black mb-1">দৈনিক স্পিন</h1>
        <p className="text-muted-foreground text-sm">প্রতিদিন ৫টি স্পিন করুন, পুরস্কার জিতুন</p>
      </div>

      {/* Activation warning */}
      {!isActive && (
        <Link to="/activation">
          <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-3 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
            <p className="text-sm text-destructive">
              স্পিন করতে আগে অ্যাকাউন্ট অ্যাক্টিভ করুন
            </p>
          </div>
        </Link>
      )}

      {/* Spins remaining */}
      <div className="bg-card border border-border rounded-2xl p-4 card-glow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            <span className="font-semibold">আজকের স্পিন</span>
          </div>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${
                  i <= spinsLeft
                    ? 'bg-primary border-primary text-primary-foreground'
                    : 'bg-muted border-border text-muted-foreground'
                }`}
              >
                {i <= spinsLeft ? '⚡' : '○'}
              </div>
            ))}
          </div>
        </div>
        {spinsLeft === 0 && timeUntilReset && (
          <div className="flex items-center gap-2 mt-3 text-muted-foreground text-sm">
            <Clock className="w-4 h-4" />
            <span>রিসেট হবে: {timeUntilReset} পরে</span>
          </div>
        )}
      </div>

      {/* Spin wheel */}
      <div className="bg-card border border-border rounded-2xl p-6 card-glow flex flex-col items-center">
        <SpinWheel isSpinning={isSpinning} prizeAmount={prizeAmount} />

        <Button
          onClick={handleSpin}
          disabled={isSpinning || isPending || spinsLeft === 0 || !isActive}
          className={`mt-6 w-full h-14 text-lg font-black rounded-xl border-0 transition-all ${
            spinsLeft > 0 && isActive
              ? 'green-gradient text-white pulse-gold'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          }`}
        >
          {isSpinning || isPending ? (
            <>
              <Loader2 className="w-6 h-6 mr-2 animate-spin" />
              স্পিন হচ্ছে...
            </>
          ) : spinsLeft === 0 ? (
            <>
              <Clock className="w-5 h-5 mr-2" />
              আজকের স্পিন শেষ
            </>
          ) : (
            <>
              <Zap className="w-6 h-6 mr-2" />
              স্পিন করুন! ({spinsLeft} বাকি)
            </>
          )}
        </Button>
      </div>

      {/* Prize table */}
      <div className="bg-card border border-border rounded-2xl p-4 card-glow">
        <p className="text-sm font-bold mb-3">পুরস্কারের তালিকা</p>
        <div className="grid grid-cols-5 gap-2">
          {[5, 10, 15, 20, 25].map((prize) => (
            <div key={prize} className="bg-primary/10 border border-primary/20 rounded-xl p-2 text-center">
              <p className="text-sm font-black text-gold">৳{prize}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
