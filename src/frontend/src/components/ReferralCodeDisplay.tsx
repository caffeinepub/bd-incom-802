import React, { useState } from 'react';
import { Copy, Check, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ReferralCodeDisplayProps {
  referralCode: string;
}

export default function ReferralCodeDisplay({ referralCode }: ReferralCodeDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      toast.success('রেফারেল কোড কপি হয়েছে!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('কপি করতে সমস্যা হয়েছে');
    }
  };

  const shareLink = `${window.location.origin}?ref=${referralCode}`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'BD INCOM 802',
          text: `আমার রেফারেল কোড ব্যবহার করুন: ${referralCode}`,
          url: shareLink,
        });
      } catch {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="bg-card border border-secondary/30 rounded-2xl p-5 gold-glow">
      <div className="flex items-center gap-2 mb-3">
        <Share2 className="w-4 h-4 text-secondary" />
        <p className="text-sm font-semibold text-secondary">আপনার রেফারেল কোড</p>
      </div>

      <div className="bg-background rounded-xl p-4 mb-4 text-center border border-border">
        <p className="text-2xl font-black tracking-widest text-gold font-mono">{referralCode || '------'}</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button
          onClick={handleCopy}
          variant="outline"
          className="border-secondary/40 text-secondary hover:bg-secondary/10 rounded-xl"
        >
          {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
          {copied ? 'কপি হয়েছে' : 'কোড কপি'}
        </Button>
        <Button
          onClick={handleShare}
          className="gold-gradient text-secondary-foreground border-0 rounded-xl font-semibold"
        >
          <Share2 className="w-4 h-4 mr-1" />
          শেয়ার করুন
        </Button>
      </div>

      <p className="text-xs text-muted-foreground text-center mt-3">
        প্রতিটি সফল রেফারেলে আপনি পাবেন <span className="text-gold font-bold">৳১৫</span>
      </p>
    </div>
  );
}
