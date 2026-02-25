import React, { useState } from 'react';
import { Users, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSubmitReferralCode } from '../hooks/useQueries';
import { toast } from 'sonner';

export default function ReferralCodeInput() {
  const [code, setCode] = useState('');
  const { mutateAsync: submitCode, isPending } = useSubmitReferralCode();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    try {
      await submitCode(code.trim());
      toast.success('রেফারেল কোড সফলভাবে যোগ হয়েছে!');
      setCode('');
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error?.message || 'রেফারেল কোড যোগ করতে সমস্যা হয়েছে');
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-5 card-glow">
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-4 h-4 text-primary" />
        <p className="text-sm font-semibold">রেফারেল কোড দিন</p>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        কারো রেফারেল কোড থাকলে এখানে দিন। অ্যাকাউন্ট অ্যাক্টিভ হলে তিনি ৳১৫ পাবেন।
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <Label htmlFor="refCode" className="text-xs mb-1.5 block">রেফারেল কোড</Label>
          <Input
            id="refCode"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="কোড লিখুন..."
            className="bg-input border-border rounded-xl h-11 font-mono tracking-wider"
          />
        </div>
        <Button
          type="submit"
          disabled={isPending || !code.trim()}
          className="w-full green-gradient text-white border-0 rounded-xl font-semibold"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              যোগ হচ্ছে...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              কোড যোগ করুন
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
