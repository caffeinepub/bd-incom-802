import React, { useState } from 'react';
import { Smartphone, Plus, Trash2, Loader2, AlertCircle, Signal } from 'lucide-react';
import { useGetRechargeOffers, useAddRechargeOffer, useRemoveRechargeOffer, useIsCallerAdmin } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const OPERATORS = ['GP', 'Robi', 'Banglalink', 'Teletalk', 'Airtel'] as const;
type Operator = typeof OPERATORS[number];

const OPERATOR_COLORS: Record<string, string> = {
  GP: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Robi: 'bg-red-500/20 text-red-400 border-red-500/30',
  Banglalink: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  Teletalk: 'bg-green-500/20 text-green-400 border-green-500/30',
  Airtel: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

const OPERATOR_LABELS: Record<string, string> = {
  GP: 'গ্রামীণফোন',
  Robi: 'রবি',
  Banglalink: 'বাংলালিংক',
  Teletalk: 'টেলিটক',
  Airtel: 'এয়ারটেল',
};

function formatDate(timestamp: bigint): string {
  const ms = Number(timestamp) / 1_000_000;
  return new Date(ms).toLocaleString('bn-BD', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function RechargePage() {
  const { data: offers, isLoading, isError } = useGetRechargeOffers();
  const { data: isAdmin } = useIsCallerAdmin();
  const addOffer = useAddRechargeOffer();
  const removeOffer = useRemoveRechargeOffer();

  const [selectedFilter, setSelectedFilter] = useState<Operator | 'All'>('All');
  const [operatorName, setOperatorName] = useState<Operator>('GP');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const filteredOffers = offers
    ? selectedFilter === 'All'
      ? offers
      : offers.filter((o) => o.operatorName === selectedFilter)
    : [];

  const handleAddOffer = async () => {
    if (!title.trim() || !description.trim()) {
      toast.error('শিরোনাম এবং বিবরণ পূরণ করুন');
      return;
    }
    try {
      await addOffer.mutateAsync({ operatorName, title: title.trim(), description: description.trim() });
      toast.success('অফার সফলভাবে যোগ হয়েছে!');
      setTitle('');
      setDescription('');
    } catch (err: any) {
      toast.error(err?.message || 'অফার যোগ করতে ব্যর্থ হয়েছে');
    }
  };

  const handleRemoveOffer = async (id: bigint) => {
    try {
      await removeOffer.mutateAsync(id);
      toast.success('অফার মুছে ফেলা হয়েছে');
    } catch (err: any) {
      toast.error(err?.message || 'অফার মুছতে ব্যর্থ হয়েছে');
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Page Header */}
      <div className="bg-card border border-secondary/30 rounded-2xl p-5 gold-glow">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl gold-gradient flex items-center justify-center">
            <Smartphone className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-gold">ডিজিটাল রিচার্জ বিজনেস</h1>
            <p className="text-xs text-muted-foreground">সকল সিমের সর্বশেষ অফার ও আপডেট</p>
          </div>
        </div>
      </div>

      {/* Admin: Add Offer Form */}
      {isAdmin && (
        <div className="bg-card border border-primary/30 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Plus className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-primary uppercase tracking-wide">নতুন অফার যোগ করুন</h2>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">অপারেটর</label>
              <select
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value as Operator)}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
              >
                {OPERATORS.map((op) => (
                  <option key={op} value={op}>
                    {op} — {OPERATOR_LABELS[op]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">শিরোনাম</label>
              <Input
                placeholder="অফারের শিরোনাম লিখুন..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-background border-border focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">বিবরণ</label>
              <Textarea
                placeholder="অফারের বিস্তারিত বিবরণ লিখুন..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="bg-background border-border focus:border-primary resize-none"
              />
            </div>
            <Button
              onClick={handleAddOffer}
              disabled={addOffer.isPending || !title.trim() || !description.trim()}
              className="w-full gold-gradient text-white font-bold"
            >
              {addOffer.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  যোগ হচ্ছে...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  অফার যোগ করুন
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Operator Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {(['All', ...OPERATORS] as const).map((op) => {
          const isActive = selectedFilter === op;
          return (
            <button
              key={op}
              onClick={() => setSelectedFilter(op)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                isActive
                  ? 'bg-secondary text-secondary-foreground border-secondary'
                  : 'bg-card text-muted-foreground border-border hover:border-secondary/50'
              }`}
            >
              {op === 'All' ? 'সব' : op}
            </button>
          );
        })}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
          <p className="text-sm text-destructive">অফার লোড করতে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && filteredOffers.length === 0 && (
        <div className="bg-card border border-border rounded-2xl p-10 flex flex-col items-center justify-center text-center">
          <Signal className="w-12 h-12 text-muted-foreground mb-3 opacity-50" />
          <p className="text-base font-semibold text-muted-foreground">কোনো অফার নেই</p>
          <p className="text-xs text-muted-foreground mt-1">
            {selectedFilter === 'All'
              ? 'এখনো কোনো অফার যোগ করা হয়নি।'
              : `${selectedFilter} এর কোনো অফার নেই।`}
          </p>
        </div>
      )}

      {/* Offers List */}
      {!isLoading && filteredOffers.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">
            {selectedFilter === 'All' ? 'সকল অফার' : `${selectedFilter} অফার`} ({filteredOffers.length}টি)
          </h2>
          {filteredOffers.map((offer) => {
            const colorClass = OPERATOR_COLORS[offer.operatorName] || 'bg-muted text-muted-foreground border-border';
            return (
              <div
                key={offer.id.toString()}
                className="bg-card border border-border rounded-xl p-4 hover:border-secondary/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${colorClass}`}>
                        {offer.operatorName}
                      </span>
                      <span className="text-[10px] text-muted-foreground/60">
                        {OPERATOR_LABELS[offer.operatorName] || offer.operatorName}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-foreground mb-1">{offer.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {offer.description}
                    </p>
                    <p className="text-[10px] text-muted-foreground/60 mt-2">
                      📅 {formatDate(offer.timestamp)}
                    </p>
                  </div>
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveOffer(offer.id)}
                      disabled={removeOffer.isPending}
                      className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10 w-8 h-8"
                    >
                      {removeOffer.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
