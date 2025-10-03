import { User, Creator, Gift, Transaction, Role, VerificationStatus, Withdrawal, WithdrawalStatus, AuditLog, RiskLevel } from './types';

export const mockUsers: User[] = [
    { id: 'user-1', name: 'Alice', email: 'alice@example.com', role: Role.USER, walletBalance: 25000, avatarUrl: 'https://picsum.photos/seed/alice/200', spendingLimit: 10000, status: 'active' },
    { id: 'user-2', name: 'Bob', email: 'bob@example.com', role: Role.USER, walletBalance: 5000, avatarUrl: 'https://picsum.photos/seed/bob/200', spendingLimit: 5000, status: 'active' },
    { id: 'user-3', name: 'Suspended Sam', email: 'sam@example.com', role: Role.USER, walletBalance: 15000, avatarUrl: 'https://picsum.photos/seed/sam/200', spendingLimit: 5000, status: 'suspended' },
];

export const mockCreators: Creator[] = [
    { id: 'creator-1', name: 'Charlie Creator', email: 'charlie@example.com', role: Role.CREATOR, walletBalance: 0, tiktokHandle: 'charliecreates', followers: 12000, earnings: 54000, verificationStatus: VerificationStatus.VERIFIED, avatarUrl: 'https://picsum.photos/seed/charlie/200', spendingLimit: 0, status: 'active' },
    { id: 'creator-2', name: 'Diana Entertainer', email: 'diana@example.com', role: Role.CREATOR, walletBalance: 0, tiktokHandle: 'dianadances', followers: 500, earnings: 12000, verificationStatus: VerificationStatus.PENDING, avatarUrl: 'https://picsum.photos/seed/diana/200', spendingLimit: 0, status: 'active' },
    { id: 'creator-3', name: 'Eve Artist', email: 'eve@example.com', role: Role.CREATOR, walletBalance: 0, tiktokHandle: 'evepaints', followers: 250000, earnings: 105000, verificationStatus: VerificationStatus.VERIFIED, avatarUrl: 'https://picsum.photos/seed/eve/200', spendingLimit: 0, status: 'active' },
    { id: 'creator-4', name: 'Frank Gamer', email: 'frank@example.com', role: Role.CREATOR, walletBalance: 0, tiktokHandle: 'frankplays', followers: 850, earnings: 3000, verificationStatus: VerificationStatus.REJECTED, avatarUrl: 'https://picsum.photos/seed/frank/200', spendingLimit: 0, status: 'active' },
    { id: 'creator-5', name: 'Suspended Sarah', email: 'sarah@example.com', role: Role.CREATOR, walletBalance: 0, tiktokHandle: 'sarahsings', followers: 50000, earnings: 25000, verificationStatus: VerificationStatus.VERIFIED, avatarUrl: 'https://picsum.photos/seed/sarah/200', spendingLimit: 0, status: 'suspended' },

];

export const mockAdmin: User = { id: 'admin-1', name: 'Admin', email: 'admin@afritok.com', role: Role.ADMIN, walletBalance: 999999, avatarUrl: 'https://picsum.photos/seed/admin/200', spendingLimit: Infinity, status: 'active' };

export const allMockUsers: User[] = [...mockUsers, ...mockCreators, mockAdmin];


export const mockGifts: Gift[] = [
    { id: 'gift-1', name: 'Rose', price: 100, icon: '🌹' },
    { id: 'gift-2', name: 'Diamond', price: 500, icon: '💎' },
    { id: 'gift-3', name: 'Crown', price: 1000, icon: '👑' },
    { id: 'gift-4', name: 'Lion', price: 5000, icon: '🦁' },
    { id: 'gift-5', name: 'Rocket', price: 10000, icon: '🚀' },
    { id: 'gift-6', name: 'Gold Coin', price: 50, icon: '🪙' },
];

export const mockTransactions: Transaction[] = [
    { id: 'tx-1', senderId: 'user-1', receiverId: 'creator-1', giftId: 'gift-3', amount: 1000, adminFee: 100, creatorAmount: 900, timestamp: new Date(Date.now() - 3600000).toISOString() },
    { id: 'tx-2', senderId: 'user-2', receiverId: 'creator-3', giftId: 'gift-1', amount: 100, adminFee: 10, creatorAmount: 90, timestamp: new Date(Date.now() - 7200000).toISOString() },
];

export const mockWithdrawals: Withdrawal[] = [
    { id: 'wd-1', creatorId: 'creator-1', amount: 15000, status: WithdrawalStatus.APPROVED, requestedAt: new Date(Date.now() - 86400000 * 2).toISOString(), reviewedAt: new Date(Date.now() - 86400000).toISOString(), reviewedBy: 'admin-1', riskLevel: RiskLevel.LOW, riskReason: 'Standard withdrawal amount for a trusted creator.' },
    { id: 'wd-2', creatorId: 'creator-3', amount: 50000, status: WithdrawalStatus.PENDING, requestedAt: new Date(Date.now() - 3600000).toISOString(), riskLevel: RiskLevel.MEDIUM, riskReason: 'Amount is higher than average. Review recommended.' },
];

export const mockAuditLogs: AuditLog[] = [
    { id: 'log-1', adminId: 'admin-1', action: 'APPROVE_WITHDRAWAL', target: 'wd-1', details: 'Approved withdrawal of NGN 15,000 for creator-1', timestamp: new Date(Date.now() - 86400000).toISOString() },
    { id: 'log-2', adminId: 'admin-1', action: 'REJECT_CREATOR', target: 'creator-4', details: 'Rejected creator application for frankplays (850 followers)', timestamp: new Date(Date.now() - 86400000 * 3).toISOString() },
];


export const ADMIN_FEE_PERCENTAGE = 0.10; // 10%