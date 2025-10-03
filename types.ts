export enum Role {
    USER = 'user',
    CREATOR = 'creator',
    ADMIN = 'admin',
}

export enum VerificationStatus {
    PENDING = 'pending',
    VERIFIED = 'verified',
    REJECTED = 'rejected',
}

export enum WithdrawalStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
}

export enum RiskLevel {
    LOW = 'Low',
    MEDIUM = 'Medium',
    HIGH = 'High',
}

export type AccountStatus = 'active' | 'suspended';

export interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
    walletBalance: number;
    avatarUrl: string;
    spendingLimit: number; // Max amount user can spend
    status: AccountStatus;
}

export interface Creator extends User {
    tiktokHandle: string;
    followers: number;
    earnings: number;
    verificationStatus: VerificationStatus;
}

export interface Gift {
    id: string;
    name: string;
    price: number;
    icon: string;
}

export interface Transaction {
    id: string;
    senderId: string;
    receiverId: string;
    giftId: string;
    amount: number; // gift price
    adminFee: number; // 10%
    creatorAmount: number; // 90%
    timestamp: string;
}

export interface Withdrawal {
    id: string;
    creatorId: string;
    amount: number;
    status: WithdrawalStatus;
    requestedAt: string;
    reviewedBy?: string; // Admin ID
    reviewedAt?: string;
    riskLevel?: RiskLevel;
    riskReason?: string;
}

export interface AuditLog {
    id: string;
    adminId: string;
    action: string;
    target: string; // e.g., 'user-1', 'withdrawal-3'
    details: string;
    timestamp: string;
}


export interface VerificationResult {
    plausible_username: boolean;
    follower_check_passed: boolean;
    follower_count_simulated: number;
    verification_code: string;
    user_instructions: string;
}

export interface WithdrawalRiskResult {
    riskLevel: RiskLevel;
    reason: string;
}