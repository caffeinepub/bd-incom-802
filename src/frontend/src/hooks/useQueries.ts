import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, UserApprovalInfo, ApprovalStatus, AdminDashboard, WithdrawalRequest, Notice, RechargeOffer } from '../backend';
import type { Principal } from '@dfinity/principal';

// ─── User Profile ────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ─── Admin Check ─────────────────────────────────────────────────────────────

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Approval ────────────────────────────────────────────────────────────────

export function useIsCallerApproved() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerApproved'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerApproved();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRequestApproval() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.requestApproval();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isCallerApproved'] });
    },
  });
}

export function useListApprovals() {
  const { actor, isFetching } = useActor();
  const { data: isAdmin } = useIsCallerAdmin();

  return useQuery<UserApprovalInfo[]>({
    queryKey: ['listApprovals'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listApprovals();
    },
    enabled: !!actor && !isFetching && !!isAdmin,
  });
}

export function useSetApproval() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, status }: { user: Principal; status: ApprovalStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setApproval(user, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listApprovals'] });
    },
  });
}

// ─── Activation ───────────────────────────────────────────────────────────────

export function useSubmitActivation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ transactionNumber, amount }: { transactionNumber: string; amount: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitActivation(transactionNumber, amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetActivationRequests() {
  const { actor, isFetching } = useActor();
  const { data: isAdmin } = useIsCallerAdmin();

  return useQuery<Array<[Principal, string]>>({
    queryKey: ['activationRequests'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getActivationRequests();
    },
    enabled: !!actor && !isFetching && !!isAdmin,
  });
}

export function useApproveActivation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.approveActivation(user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activationRequests'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
    },
  });
}

// ─── Referral ─────────────────────────────────────────────────────────────────

export function useSubmitReferralCode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (referralCode: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitReferralCode(referralCode);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ─── Spin ─────────────────────────────────────────────────────────────────────

export function useSpin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.spin();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ─── Video ────────────────────────────────────────────────────────────────────

export function useWatchVideo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (videoId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.watchVideo(videoId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ─── Pay Number ───────────────────────────────────────────────────────────────

export function useGetPayNumber() {
  const { actor, isFetching } = useActor();

  return useQuery<string>({
    queryKey: ['payNumber'],
    queryFn: async () => {
      if (!actor) return '01831097802';
      return actor.getPayNumber();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────

export function useGetAdminDashboard() {
  const { actor, isFetching } = useActor();
  const { data: isAdmin } = useIsCallerAdmin();

  return useQuery<AdminDashboard>({
    queryKey: ['adminDashboard'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAdminDashboard();
    },
    enabled: !!actor && !isFetching && !!isAdmin,
  });
}

// ─── Withdraw ─────────────────────────────────────────────────────────────────

export function useMyWithdrawRequests() {
  const { actor, isFetching } = useActor();

  return useQuery<WithdrawalRequest[]>({
    queryKey: ['myWithdrawRequests'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyWithdrawRequests();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubmitWithdrawRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ number, amount }: { number: string; amount: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitWithdrawRequest(number, amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myWithdrawRequests'] });
    },
  });
}

export function useAllWithdrawRequests() {
  const { actor, isFetching } = useActor();
  const { data: isAdmin } = useIsCallerAdmin();

  return useQuery<WithdrawalRequest[]>({
    queryKey: ['allWithdrawRequests'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllWithdrawRequests();
    },
    enabled: !!actor && !isFetching && !!isAdmin,
  });
}

export function useAdminApproveWithdraw() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.adminApproveWithdraw(requestId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allWithdrawRequests'] });
    },
  });
}

export function useAdminRejectWithdraw() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.adminRejectWithdraw(requestId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allWithdrawRequests'] });
    },
  });
}

// ─── Countdown ────────────────────────────────────────────────────────────────

export function useCountdownTarget() {
  const { actor, isFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['countdownTarget'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCountdownTarget();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetCountdownTarget() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targetTime: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setCountdownTarget(targetTime);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['countdownTarget'] });
    },
  });
}

// ─── Notice Board ─────────────────────────────────────────────────────────────

export function useGetNotices() {
  const { actor, isFetching } = useActor();

  return useQuery<Notice[]>({
    queryKey: ['notices'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getNotices();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddNotice() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ title, content }: { title: string; content: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addNotice(title, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
    },
  });
}

export function useRemoveNotice() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.removeNotice(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
    },
  });
}

// ─── Digital Recharge Offers ──────────────────────────────────────────────────

export function useGetRechargeOffers() {
  const { actor, isFetching } = useActor();

  return useQuery<RechargeOffer[]>({
    queryKey: ['rechargeOffers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getRechargeOffers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddRechargeOffer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ operatorName, title, description }: { operatorName: string; title: string; description: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addRechargeOffer(operatorName, title, description);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rechargeOffers'] });
    },
  });
}

export function useRemoveRechargeOffer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.removeRechargeOffer(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rechargeOffers'] });
    },
  });
}
