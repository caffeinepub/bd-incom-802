import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserApprovalInfo {
    status: ApprovalStatus;
    principal: Principal;
}
export type Time = bigint;
export interface AdminDashboard {
    activeUsers: bigint;
    users: Array<UserSummary>;
    totalUsers: bigint;
    totalEarnings: bigint;
    pendingActivations: bigint;
}
export interface UserSummary {
    principal: Principal;
    balance: bigint;
    referralCount: bigint;
    isActive: boolean;
}
export interface VideoReward {
    lastClaimed: Time;
    watched: boolean;
    videoId: bigint;
}
export interface RechargeOffer {
    id: bigint;
    title: string;
    description: string;
    operatorName: string;
    timestamp: Time;
}
export interface WithdrawalRequest {
    id: bigint;
    status: WithdrawalStatus;
    principal: Principal;
    createdAt: Time;
    number: string;
    amount: bigint;
}
export type WithdrawalStatus = string;
export interface Notice {
    id: bigint;
    title: string;
    content: string;
    timestamp: Time;
}
export interface UserProfile {
    referralCode: string;
    referrer?: Principal;
    balance: bigint;
    spinsLeft: bigint;
    lastSpinReset: Time;
    isActive: boolean;
    videoRewards: Array<VideoReward>;
}
export enum ApprovalStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addNotice(title: string, content: string): Promise<bigint>;
    addRechargeOffer(operatorName: string, title: string, description: string): Promise<bigint>;
    adminApproveWithdraw(requestId: bigint): Promise<void>;
    adminRejectWithdraw(requestId: bigint): Promise<void>;
    approveActivation(user: Principal): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    assignUserRole(user: Principal, role: UserRole): Promise<void>;
    getActivationRequests(): Promise<Array<[Principal, string]>>;
    getAdminDashboard(): Promise<AdminDashboard>;
    getAllUserProfiles(): Promise<Array<[Principal, UserProfile]>>;
    getAllWithdrawRequests(): Promise<Array<WithdrawalRequest>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCountdownTarget(): Promise<bigint>;
    getMyWithdrawRequests(): Promise<Array<WithdrawalRequest>>;
    getNotices(): Promise<Array<Notice>>;
    getPayNumber(): Promise<string>;
    getProfile(): Promise<UserProfile | null>;
    getRechargeOffers(): Promise<Array<RechargeOffer>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isCallerApproved(): Promise<boolean>;
    listApprovals(): Promise<Array<UserApprovalInfo>>;
    removeNotice(id: bigint): Promise<void>;
    removeRechargeOffer(id: bigint): Promise<void>;
    requestApproval(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setApproval(user: Principal, status: ApprovalStatus): Promise<void>;
    setCountdownTarget(targetTime: bigint): Promise<void>;
    spin(): Promise<bigint>;
    submitActivation(transactionNumber: string, amount: bigint): Promise<boolean>;
    submitReferralCode(referralCode: string): Promise<boolean>;
    submitWithdrawRequest(number: string, amount: bigint): Promise<bigint>;
    watchVideo(videoId: bigint): Promise<void>;
}
