import React from 'react';
import { useGetActivationRequests, useApproveActivation, useIsCallerAdmin } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ShieldCheck, CheckCircle, Loader2, Users, AlertCircle } from 'lucide-react';
import type { Principal } from '@dfinity/principal';

export default function AdminActivationsPage() {
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: requests = [], isLoading: requestsLoading } = useGetActivationRequests();
  const { mutateAsync: approveActivation, isPending: approving, variables: approvingUser } = useApproveActivation();

  const handleApprove = async (user: Principal, txn: string) => {
    try {
      await approveActivation(user);
      toast.success(`অ্যাক্টিভেশন অনুমোদন হয়েছে! TrxID: ${txn}`);
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error?.message || 'অনুমোদন করতে সমস্যা হয়েছে');
    }
  };

  if (adminLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
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

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-secondary/20 border border-secondary/30 flex items-center justify-center">
          <ShieldCheck className="w-6 h-6 text-secondary" />
        </div>
        <div>
          <h1 className="text-xl font-black">অ্যাডমিন প্যানেল</h1>
          <p className="text-muted-foreground text-sm">অ্যাক্টিভেশন রিকোয়েস্ট</p>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-card border border-secondary/30 rounded-2xl p-4 gold-glow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-secondary" />
            <span className="text-sm font-semibold">মোট পেন্ডিং রিকোয়েস্ট</span>
          </div>
          <Badge className="bg-secondary/20 text-secondary border-secondary/30 text-lg font-black px-3 py-1">
            {requests.length}
          </Badge>
        </div>
      </div>

      {/* Requests list */}
      {requestsLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-8 text-center card-glow">
          <CheckCircle className="w-12 h-12 text-primary mx-auto mb-3" />
          <p className="font-semibold">কোনো পেন্ডিং রিকোয়েস্ট নেই</p>
          <p className="text-muted-foreground text-sm mt-1">সব রিকোয়েস্ট প্রসেস হয়ে গেছে</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map(([user, txn]) => {
            const isApprovingThis = approving && approvingUser?.toString() === user.toString();
            return (
              <div
                key={user.toString()}
                className="bg-card border border-border rounded-xl p-4 card-glow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs border-secondary/40 text-secondary">
                        পেন্ডিং
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono truncate mb-1">
                      {user.toString()}
                    </p>
                    <div className="bg-background rounded-lg px-3 py-1.5 border border-border inline-block">
                      <p className="text-xs text-muted-foreground">TrxID:</p>
                      <p className="font-mono font-bold text-sm text-gold">{txn}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">পরিমাণ: ৳৫০</p>
                  </div>
                  <Button
                    onClick={() => handleApprove(user, txn)}
                    disabled={isApprovingThis || approving}
                    size="sm"
                    className="green-gradient text-white border-0 rounded-lg font-semibold shrink-0"
                  >
                    {isApprovingThis ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        হচ্ছে...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        অনুমোদন
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
