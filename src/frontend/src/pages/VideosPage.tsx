import React from 'react';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import VideoCard from '../components/VideoCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Play, AlertCircle } from 'lucide-react';
import { Link } from '@tanstack/react-router';

export default function VideosPage() {
  const { data: userProfile, isLoading } = useGetCallerUserProfile();

  const isActive = userProfile?.isActive ?? false;
  const videoRewards = userProfile?.videoRewards ?? [];

  // Count today's watched videos
  const todayWatched = videoRewards.filter((r) => {
    const now = BigInt(Date.now()) * BigInt(1_000_000);
    const oneDayNanos = BigInt(86_400_000_000_000);
    return now - r.lastClaimed < oneDayNanos;
  }).length;

  const totalEarnable = (5 - todayWatched) * 2;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full rounded-2xl" />
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl gold-gradient flex items-center justify-center mx-auto mb-3">
          <Play className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-black mb-1">ভিডিও রিওয়ার্ড</h1>
        <p className="text-muted-foreground text-sm">প্রতিটি ভিডিও দেখুন, ৳২ আয় করুন</p>
      </div>

      {/* Stats */}
      <div className="bg-card border border-secondary/30 rounded-2xl p-4 gold-glow">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-2xl font-black text-gold">{todayWatched}</p>
            <p className="text-xs text-muted-foreground">আজ দেখেছেন</p>
          </div>
          <div>
            <p className="text-2xl font-black text-primary">{5 - todayWatched}</p>
            <p className="text-xs text-muted-foreground">বাকি আছে</p>
          </div>
          <div>
            <p className="text-2xl font-black text-gold">৳{totalEarnable}</p>
            <p className="text-xs text-muted-foreground">আয় করতে পারবেন</p>
          </div>
        </div>
      </div>

      {/* Activation warning */}
      {!isActive && (
        <Link to="/activation">
          <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-3 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
            <p className="text-sm text-destructive">
              ভিডিও দেখতে আগে অ্যাকাউন্ট অ্যাক্টিভ করুন
            </p>
          </div>
        </Link>
      )}

      {/* Video cards */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((videoId) => (
          <VideoCard
            key={videoId}
            videoId={videoId}
            videoRewards={videoRewards}
          />
        ))}
      </div>

      <p className="text-xs text-muted-foreground text-center pb-2">
        প্রতিদিন রিসেট হয় · প্রতিটি ভিডিও ১৫ সেকেন্ড
      </p>
    </div>
  );
}
