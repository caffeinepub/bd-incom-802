import React, { useRef, useState, useEffect } from 'react';
import { Play, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useWatchVideo } from '../hooks/useQueries';
import { toast } from 'sonner';
import type { VideoReward } from '../backend';

interface VideoCardProps {
  videoId: number;
  videoRewards: VideoReward[];
}

// Demo video URLs (short public domain videos)
const DEMO_VIDEOS = [
  'https://www.w3schools.com/html/mov_bbb.mp4',
  'https://www.w3schools.com/html/movie.mp4',
  'https://www.w3schools.com/html/mov_bbb.mp4',
  'https://www.w3schools.com/html/movie.mp4',
  'https://www.w3schools.com/html/mov_bbb.mp4',
];

const VIDEO_TITLES = [
  'বিশেষ অফার ভিডিও ১',
  'আয়ের সুযোগ ভিডিও ২',
  'রেফারেল গাইড ভিডিও ৩',
  'স্পিন টিপস ভিডিও ৪',
  'বোনাস ভিডিও ৫',
];

const WATCH_DURATION = 15; // seconds

function isWatchedToday(reward: VideoReward): boolean {
  const now = BigInt(Date.now()) * BigInt(1_000_000);
  const oneDayNanos = BigInt(86_400_000_000_000);
  return now - reward.lastClaimed < oneDayNanos;
}

export default function VideoCard({ videoId, videoRewards }: VideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [watchTime, setWatchTime] = useState(0);
  const [completed, setCompleted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { mutateAsync: watchVideo, isPending } = useWatchVideo();

  const existingReward = videoRewards.find((r) => Number(r.videoId) === videoId);
  const watchedToday = existingReward ? isWatchedToday(existingReward) : false;

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handlePlay = () => {
    if (watchedToday || completed) return;
    setIsPlaying(true);
    setWatchTime(0);

    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }

    intervalRef.current = setInterval(() => {
      setWatchTime((prev) => {
        const next = prev + 1;
        if (next >= WATCH_DURATION) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          handleVideoComplete();
          return WATCH_DURATION;
        }
        return next;
      });
    }, 1000);
  };

  const handleVideoComplete = async () => {
    setIsPlaying(false);
    setCompleted(true);
    try {
      await watchVideo(BigInt(videoId));
      toast.success(`ভিডিও ${videoId} দেখার জন্য ৳২ যোগ হয়েছে!`);
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error?.message || 'ভিডিও রিওয়ার্ড পেতে সমস্যা হয়েছে');
      setCompleted(false);
    }
  };

  const progress = (watchTime / WATCH_DURATION) * 100;
  const isDone = watchedToday || completed;

  return (
    <div className={`bg-card border rounded-xl overflow-hidden card-glow ${isDone ? 'border-primary/40' : 'border-border'}`}>
      {/* Video */}
      <div className="relative bg-black aspect-video">
        <video
          ref={videoRef}
          src={DEMO_VIDEOS[(videoId - 1) % DEMO_VIDEOS.length]}
          className="w-full h-full object-cover"
          muted
          playsInline
          onEnded={() => {
            if (intervalRef.current) clearInterval(intervalRef.current);
          }}
        />
        {!isPlaying && !isDone && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center">
              <Play className="w-6 h-6 text-white ml-0.5" />
            </div>
          </div>
        )}
        {isDone && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <CheckCircle className="w-12 h-12 text-primary" />
          </div>
        )}
        {/* Reward badge */}
        <div className="absolute top-2 right-2 bg-secondary text-secondary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
          ৳২
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold">{VIDEO_TITLES[videoId - 1]}</p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{WATCH_DURATION}s</span>
          </div>
        </div>

        {isPlaying && (
          <div className="mb-2">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>দেখছেন...</span>
              <span>{watchTime}/{WATCH_DURATION}s</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        )}

        {isDone ? (
          <div className="flex items-center gap-2 text-primary text-sm font-medium">
            <CheckCircle className="w-4 h-4" />
            <span>আজকের রিওয়ার্ড পেয়েছেন</span>
          </div>
        ) : (
          <Button
            onClick={handlePlay}
            disabled={isPlaying || isPending}
            size="sm"
            className="w-full green-gradient text-white border-0 rounded-lg font-semibold"
          >
            {isPending ? (
              <>
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                প্রসেস হচ্ছে...
              </>
            ) : isPlaying ? (
              <>
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                দেখছেন ({WATCH_DURATION - watchTime}s বাকি)
              </>
            ) : (
              <>
                <Play className="w-3 h-3 mr-1" />
                ভিডিও দেখুন
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
