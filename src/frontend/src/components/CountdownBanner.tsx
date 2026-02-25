import React, { useEffect, useState } from 'react';
import { useCountdownTarget } from '../hooks/useQueries';
import { Timer } from 'lucide-react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateTimeLeft(targetNanos: bigint): TimeLeft | null {
  const targetMs = Number(targetNanos) / 1_000_000;
  const now = Date.now();
  const diff = targetMs - now;

  if (diff <= 0) return null;

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds };
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

export default function CountdownBanner() {
  const { data: targetNanos, isLoading } = useCountdownTarget();
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    if (!targetNanos) return;

    const update = () => {
      setTimeLeft(calculateTimeLeft(targetNanos));
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetNanos]);

  if (isLoading || !targetNanos) return null;

  const isFinished = timeLeft === null;

  if (isFinished) {
    return (
      <div className="w-full bg-primary text-primary-foreground py-2.5 px-4 text-center z-50">
        <p className="text-sm font-bold tracking-wide animate-bounce-in">
          🎉 শুভ যাত্রা শুরু হয়েছে! সবাইকে স্বাগতম 🎉
        </p>
      </div>
    );
  }

  return (
    <div className="w-full bg-primary text-primary-foreground py-2 px-4 z-50">
      <div className="max-w-lg mx-auto flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-3">
        <div className="flex items-center gap-1.5">
          <Timer className="w-3.5 h-3.5 text-accent shrink-0" />
          <span className="text-xs font-semibold text-accent">শুভ যাত্রা শুরু হচ্ছে</span>
        </div>
        <div className="flex items-center gap-1.5">
          {timeLeft.days > 0 && (
            <>
              <TimeUnit value={timeLeft.days} label="দিন" />
              <Colon />
            </>
          )}
          <TimeUnit value={timeLeft.hours} label="ঘণ্টা" />
          <Colon />
          <TimeUnit value={timeLeft.minutes} label="মিনিট" />
          <Colon />
          <TimeUnit value={timeLeft.seconds} label="সেকেন্ড" />
        </div>
      </div>
    </div>
  );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center min-w-[32px]">
      <span className="text-sm font-black text-accent leading-none tabular-nums">{pad(value)}</span>
      <span className="text-[9px] text-primary-foreground/70 leading-none mt-0.5">{label}</span>
    </div>
  );
}

function Colon() {
  return <span className="text-accent font-black text-sm leading-none mb-2">:</span>;
}
