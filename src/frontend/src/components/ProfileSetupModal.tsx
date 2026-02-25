import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, User } from 'lucide-react';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { toast } from 'sonner';
import type { UserProfile } from '../backend';

export default function ProfileSetupModal() {
  const [name, setName] = useState('');
  const { mutateAsync: saveProfile, isPending } = useSaveCallerUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const newProfile: UserProfile = {
        balance: BigInt(0),
        spinsLeft: BigInt(5),
        lastSpinReset: BigInt(Date.now()) * BigInt(1_000_000),
        referralCode: '',
        referrer: undefined,
        videoRewards: [],
        isActive: false,
      };
      await saveProfile(newProfile);
      toast.success('প্রোফাইল সেটআপ সম্পন্ন হয়েছে!');
    } catch {
      toast.error('প্রোফাইল সেভ করতে সমস্যা হয়েছে');
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent className="bg-card border-border max-w-sm mx-auto rounded-2xl">
        <DialogHeader>
          <div className="flex justify-center mb-3">
            <div className="w-14 h-14 rounded-full green-gradient flex items-center justify-center">
              <User className="w-7 h-7 text-white" />
            </div>
          </div>
          <DialogTitle className="text-center text-xl font-bold">স্বাগতম!</DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            আপনার নাম দিন এবং শুরু করুন
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <Label htmlFor="name" className="text-sm font-medium mb-1.5 block">
              আপনার নাম
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="নাম লিখুন..."
              className="bg-input border-border rounded-xl h-11"
              required
            />
          </div>
          <Button
            type="submit"
            disabled={isPending || !name.trim()}
            className="w-full h-11 font-bold green-gradient text-white border-0 rounded-xl"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                সেভ হচ্ছে...
              </>
            ) : (
              'শুরু করুন →'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
