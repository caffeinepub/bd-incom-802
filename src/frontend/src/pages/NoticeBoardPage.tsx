import React, { useState } from 'react';
import { Bell, Plus, Trash2, Loader2, AlertCircle, ClipboardList } from 'lucide-react';
import { useGetNotices, useAddNotice, useRemoveNotice, useIsCallerAdmin } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

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

export default function NoticeBoardPage() {
  const { data: notices, isLoading, isError } = useGetNotices();
  const { data: isAdmin } = useIsCallerAdmin();
  const addNotice = useAddNotice();
  const removeNotice = useRemoveNotice();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleAddNotice = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error('শিরোনাম এবং বিষয়বস্তু পূরণ করুন');
      return;
    }
    try {
      await addNotice.mutateAsync({ title: title.trim(), content: content.trim() });
      toast.success('নোটিশ সফলভাবে যোগ হয়েছে!');
      setTitle('');
      setContent('');
    } catch (err: any) {
      toast.error(err?.message || 'নোটিশ যোগ করতে ব্যর্থ হয়েছে');
    }
  };

  const handleRemoveNotice = async (id: bigint) => {
    try {
      await removeNotice.mutateAsync(id);
      toast.success('নোটিশ মুছে ফেলা হয়েছে');
    } catch (err: any) {
      toast.error(err?.message || 'নোটিশ মুছতে ব্যর্থ হয়েছে');
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Page Header */}
      <div className="bg-card border border-secondary/30 rounded-2xl p-5 gold-glow">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl green-gradient flex items-center justify-center">
            <Bell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-gold">নোটিশ বোর্ড</h1>
            <p className="text-xs text-muted-foreground">সকল গুরুত্বপূর্ণ নোটিশ এখানে দেখুন</p>
          </div>
        </div>
      </div>

      {/* Admin: Add Notice Form */}
      {isAdmin && (
        <div className="bg-card border border-primary/30 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Plus className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-primary uppercase tracking-wide">নতুন নোটিশ যোগ করুন</h2>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">শিরোনাম</label>
              <Input
                placeholder="নোটিশের শিরোনাম লিখুন..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-background border-border focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">বিষয়বস্তু</label>
              <Textarea
                placeholder="নোটিশের বিস্তারিত লিখুন..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                className="bg-background border-border focus:border-primary resize-none"
              />
            </div>
            <Button
              onClick={handleAddNotice}
              disabled={addNotice.isPending || !title.trim() || !content.trim()}
              className="w-full green-gradient text-white font-bold"
            >
              {addNotice.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  যোগ হচ্ছে...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  নোটিশ যোগ করুন
                </>
              )}
            </Button>
          </div>
        </div>
      )}

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
          <p className="text-sm text-destructive">নোটিশ লোড করতে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && notices && notices.length === 0 && (
        <div className="bg-card border border-border rounded-2xl p-10 flex flex-col items-center justify-center text-center">
          <ClipboardList className="w-12 h-12 text-muted-foreground mb-3 opacity-50" />
          <p className="text-base font-semibold text-muted-foreground">কোনো নোটিশ নেই</p>
          <p className="text-xs text-muted-foreground mt-1">এখনো কোনো নোটিশ যোগ করা হয়নি।</p>
        </div>
      )}

      {/* Notices List */}
      {!isLoading && notices && notices.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">
            সকল নোটিশ ({notices.length}টি)
          </h2>
          {notices.map((notice) => (
            <div
              key={notice.id.toString()}
              className="bg-card border border-border rounded-xl p-4 hover:border-secondary/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-secondary shrink-0" />
                    <h3 className="text-sm font-bold text-foreground truncate">{notice.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {notice.content}
                  </p>
                  <p className="text-[10px] text-muted-foreground/60 mt-2">
                    📅 {formatDate(notice.timestamp)}
                  </p>
                </div>
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveNotice(notice.id)}
                    disabled={removeNotice.isPending}
                    className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10 w-8 h-8"
                  >
                    {removeNotice.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
