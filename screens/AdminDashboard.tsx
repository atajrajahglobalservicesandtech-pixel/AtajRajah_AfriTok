import React, { useContext, useState, useMemo, useEffect } from 'react';
import Header from '../components/Header';
import { AppContext } from '../App';
import { Creator, User, VerificationStatus, WithdrawalStatus, RiskLevel, Role, AccountStatus, Gift } from '../types';
import Sidebar from '../components/Sidebar';
import { formatCurrency } from '../utils';

interface AdminDashboardProps {
    allUsers: User[];
    allCreators: Creator[];
}

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary p-6 rounded-xl shadow-lg flex items-center gap-4">
        <div className="bg-primary-light/10 p-3 rounded-full">{icon}</div>
        <div>
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    </div>
);

const AdminDashboard: React.FC<AdminDashboardProps> = ({allUsers, allCreators}) => {
    const { currentUser, updateCreator, updateUser, updateUserStatus, withdrawals, processWithdrawal, auditLogs, adminWalletBalance, gifts, transactions } = useContext(AppContext);
    const [activeView, setActiveView] = useState('Dashboard');
    
    // Local state for user edits to avoid re-rendering entire table on input change
    const [editingLimits, setEditingLimits] = useState<Record<string, string>>({});

    const pendingCreators = useMemo(() => allCreators.filter(c => c.verificationStatus === VerificationStatus.PENDING), [allCreators]);
    const pendingWithdrawals = useMemo(() => withdrawals.filter(w => w.status === WithdrawalStatus.PENDING), [withdrawals]);
    
    const handleApproval = (creator: Creator, newStatus: VerificationStatus) => {
        updateCreator({ ...creator, verificationStatus: newStatus });
    };
    
    const handleStatusChange = (userId: string, status: AccountStatus) => {
        if (!currentUser) return;
        updateUserStatus(userId, status, currentUser.id);
    }
    
    const handleLimitChange = (userId: string, value: string) => {
        setEditingLimits(prev => ({ ...prev, [userId]: value }));
    };

    const handleLimitSave = (user: User) => {
        const newLimit = parseFloat(editingLimits[user.id]);
        if (!isNaN(newLimit) && newLimit >= 0) {
            updateUser({ ...user, spendingLimit: newLimit });
        }
    };

    const handleWithdrawal = (withdrawalId: string, newStatus: WithdrawalStatus.APPROVED | WithdrawalStatus.REJECTED) => {
        if (!currentUser) return;
        processWithdrawal(withdrawalId, newStatus, currentUser.id);
    }
    
    const navigationItems = [
        { name: 'Dashboard', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>, current: activeView === 'Dashboard' },
        { name: 'Creator Mgt.', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>, current: activeView === 'Creator Mgt.' },
        { name: 'User Mgt.', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-4.66c.12-.144.237-.29.348-.437m-5.165 4.93l-2.828-2.828M7.5 12l2.828 2.828m0 0l2.828 2.828M15 5.25a3 3 0 11-6 0 3 3 0 016 0z" /></svg>, current: activeView === 'User Mgt.' },
        { name: 'Withdrawals', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.75A.75.75 0 013 4.5h.75m0 0h.75A.75.75 0 015.25 6v.75m0 0v.75a.75.75 0 01-.75.75h-.75a.75.75 0 01-.75-.75V7.5m1.5-1.5h.75a.75.75 0 01.75.75v.75m0 0h.75a.75.75 0 01.75.75v.75a.75.75 0 01-.75.75h-.75a.75.75 0 01-.75-.75V9.75m-1.5 0h.75a.75.75 0 01.75.75v.75m0 0h.75a.75.75 0 01.75.75v.75a.75.75 0 01-.75.75h-.75a.75.75 0 01-.75-.75v-1.5m-3 3a.75.75 0 01.75-.75h.75a.75.75 0 01.75.75v.75m0 0h.75a.75.75 0 01.75.75v.75a.75.75 0 01-.75.75h-.75a.75.75 0 01-.75-.75v-1.5m-3 3a.75.75 0 01.75-.75h.75a.75.75 0 01.75.75v.75m0 0h.75a.75.75 0 01.75.75v.75a.75.75 0 01-.75.75h-.75a.75.75 0 01-.75-.75V15m-3 0a.75.75 0 01.75-.75h.75a.75.75 0 01.75.75v.75m0 0h.75a.75.75 0 01.75.75v.75a.75.75 0 01-.75.75h-.75a.75.75 0 01-.75-.75v-4.5m3 4.5a.75.75 0 01.75-.75h.75a.75.75 0 01.75.75v.75m0 0h.75a.75.75 0 01.75.75v.75a.75.75 0 01-.75.75h-.75a.75.75 0 01-.75-.75V15m-3 0a.75.75 0 01.75-.75h.75a.75.75 0 01.75.75v.75m0 0h.75a.75.75 0 01.75.75v.75a.75.75 0 01-.75.75h-.75a.75.75 0 01-.75-.75v-1.5" /></svg>, current: activeView === 'Withdrawals' },
        { name: 'Gifts & Rules', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1014.625 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 119.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 109.375 7.5M12 15v.01M15 12H9" /></svg>, current: activeView === 'Gifts & Rules' },
        { name: 'Audit Logs', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>, current: activeView === 'Audit Logs' },
    ];
    
    const RiskIndicator: React.FC<{level: RiskLevel}> = ({level}) => {
        const colors = {
            [RiskLevel.LOW]: 'bg-green-500',
            [RiskLevel.MEDIUM]: 'bg-yellow-500',
            [RiskLevel.HIGH]: 'bg-red-500',
        };
        return <span className={`px-2 py-1 text-xs font-bold rounded-full text-white ${colors[level]}`}>{level}</span>
    };

    const StatusIndicator: React.FC<{status: AccountStatus}> = ({status}) => {
         const colors = {
            'active': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
            'suspended': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        };
        return <span className={`px-2 py-1 text-xs font-bold rounded-full capitalize ${colors[status]}`}>{status}</span>
    }

    const renderContent = () => {
        switch(activeView) {
            case 'Dashboard':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <StatCard title="Admin Wallet Balance" value={formatCurrency(adminWalletBalance)} icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-primary-light"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 3a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m15-3V6a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6v3m15 0a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25m15 0M4.5 12v6a2.25 2.25 0 002.25 2.25h10.5A2.25 2.25 0 0019.5 18v-6" /></svg>} />
                        <StatCard title="Total Platform Revenue" value={formatCurrency(transactions.reduce((sum, tx) => sum + tx.adminFee, 0))} icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-primary-light"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
                        <StatCard title="Total Users" value={allUsers.filter(u => u.role === Role.USER).length.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-primary-light"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.962c.513-.96 1.487-1.591 2.571-1.82m-2.571 1.82a3.375 3.375 0 00-2.571 1.82m0 0a3.375 3.375 0 00-2.571-1.82m2.571 1.82v-1.82" /></svg>} />
                        <StatCard title="Total Creators" value={allCreators.length.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-primary-light"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>} />
                         <StatCard title="AI Accuracy (Simulated)" value="98.2%" icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-primary-light"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
                    </div>
                );
            case 'Creator Mgt.':
                return (
                     <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary p-6 rounded-xl shadow-lg">
                        <h3 className="text-xl font-bold mb-4">Creator Management</h3>
                        <div className="mb-6">
                            <h4 className="font-bold text-lg mb-2">Pending Applications ({pendingCreators.length})</h4>
                            {pendingCreators.length > 0 ? pendingCreators.map(creator => (
                                <div key={creator.id} className="flex items-center justify-between p-3 bg-light-bg dark:bg-dark-bg rounded-lg mb-2">
                                    <p>{creator.name} (@{creator.tiktokHandle}) - {creator.followers.toLocaleString()} followers</p>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleApproval(creator, VerificationStatus.VERIFIED)} className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded-lg text-sm">Approve</button>
                                        <button onClick={() => handleApproval(creator, VerificationStatus.REJECTED)} className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded-lg text-sm">Reject</button>
                                    </div>
                                </div>
                            )) : <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">No pending applications.</p>}
                        </div>
                        <h4 className="font-bold text-lg mb-2">All Creators</h4>
                        <table className="w-full text-left">
                            <thead><tr className="border-b border-light-border dark:border-dark-border"><th className="p-2">Creator</th><th className="p-2">Followers</th><th className="p-2">Status</th><th className="p-2">Actions</th></tr></thead>
                            <tbody>
                                {allCreators.map(c => (
                                    <tr key={c.id} className="border-b border-light-border/50 dark:border-dark-border/50">
                                        <td className="p-2 font-semibold">{c.name}</td>
                                        <td className="p-2">{c.followers.toLocaleString()}</td>
                                        <td className="p-2"><StatusIndicator status={c.status} /></td>
                                        <td className="p-2">
                                            <button onClick={() => handleStatusChange(c.id, c.status === 'active' ? 'suspended' : 'active')} className={`font-bold py-1 px-3 rounded-lg text-sm text-white ${c.status === 'active' ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-500 hover:bg-blue-600'}`}>
                                                {c.status === 'active' ? 'Suspend' : 'Activate'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            case 'User Mgt.':
                 return (
                     <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary p-6 rounded-xl shadow-lg">
                        <h3 className="text-xl font-bold mb-4">User Management</h3>
                         <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead><tr className="border-b border-light-border dark:border-dark-border"><th className="p-2">User</th><th className="p-2">Spending Limit</th><th className="p-2">Status</th><th className="p-2">Actions</th></tr></thead>
                                <tbody>
                                    {allUsers.filter(u => u.role === Role.USER).map(user => (
                                        <tr key={user.id} className="border-b border-light-border/50 dark:border-dark-border/50">
                                            <td className="p-2 font-semibold">{user.name}</td>
                                            <td className="p-2 flex items-center gap-2">
                                                <input type="number" value={editingLimits[user.id] ?? user.spendingLimit} onChange={(e) => handleLimitChange(user.id, e.target.value)} className="w-24 p-1 rounded bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border" />
                                                <button onClick={() => handleLimitSave(user)} className="bg-primary-light hover:bg-primary-dark text-white font-bold py-1 px-3 text-sm rounded-lg">Save</button>
                                            </td>
                                            <td className="p-2"><StatusIndicator status={user.status} /></td>
                                            <td className="p-2">
                                                <button onClick={() => handleStatusChange(user.id, user.status === 'active' ? 'suspended' : 'active')} className={`font-bold py-1 px-3 rounded-lg text-sm text-white ${user.status === 'active' ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-500 hover:bg-blue-600'}`}>
                                                    {user.status === 'active' ? 'Suspend' : 'Activate'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                 );
            case 'Withdrawals':
                return (
                    <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary p-6 rounded-xl shadow-lg">
                        <h3 className="text-xl font-bold mb-4">Pending Withdrawal Requests ({pendingWithdrawals.length})</h3>
                        <div className="space-y-4">
                            {pendingWithdrawals.length > 0 ? pendingWithdrawals.map(wd => {
                                const creator = allCreators.find(c => c.id === wd.creatorId);
                                return (
                                <div key={wd.id} className="p-4 bg-light-bg dark:bg-dark-bg rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <img src={creator?.avatarUrl} alt={creator?.name} className="w-12 h-12 rounded-full" />
                                            <div>
                                                <p className="font-bold">{creator?.name} <span className="text-sm font-normal text-light-text-secondary dark:text-dark-text-secondary">requests</span> {formatCurrency(wd.amount)}</p>
                                                <p className="text-sm">AI Risk Assessment: {wd.riskLevel && <RiskIndicator level={wd.riskLevel} />}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleWithdrawal(wd.id, WithdrawalStatus.APPROVED)} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">Approve</button>
                                            <button onClick={() => handleWithdrawal(wd.id, WithdrawalStatus.REJECTED)} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">Reject</button>
                                        </div>
                                    </div>
                                    {wd.riskReason && <p className="mt-2 text-sm p-2 bg-gray-200 dark:bg-gray-700 rounded"><strong>AI Reason:</strong> {wd.riskReason}</p>}
                                </div>
                            )}) : <p className="text-center p-4 text-light-text-secondary dark:text-dark-text-secondary">No pending withdrawals.</p>}
                        </div>
                    </div>
                );
             case 'Gifts & Rules':
                return (
                     <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary p-6 rounded-xl shadow-lg">
                        <h3 className="text-xl font-bold mb-4">Gift Management</h3>
                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-4">This is a read-only view. In a real application, an admin would be able to add, edit, and remove gifts.</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {gifts.map(gift => (
                                <div key={gift.id} className="p-4 border border-light-border dark:border-dark-border rounded-lg flex flex-col items-center">
                                    <span className="text-4xl">{gift.icon}</span>
                                    <span className="font-semibold mt-2">{gift.name}</span>
                                    <span className="text-yellow-500 font-bold">{formatCurrency(gift.price)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'Audit Logs':
                return (
                     <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary p-6 rounded-xl shadow-lg">
                        <h3 className="text-xl font-bold mb-4">Admin Audit Logs</h3>
                         <div className="overflow-x-auto max-h-[60vh]">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-light-border dark:border-dark-border">
                                        <th className="p-3">Timestamp</th>
                                        <th className="p-3">Action</th>
                                        <th className="p-3">Target ID</th>
                                        <th className="p-3">Details</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {auditLogs.map(log => (
                                        <tr key={log.id} className="border-b border-light-border/50 dark:border-dark-border/50">
                                            <td className="p-3 text-sm">{new Date(log.timestamp).toLocaleString()}</td>
                                            <td className="p-3"><span className="font-mono text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">{log.action}</span></td>
                                            <td className="p-3 font-mono text-xs">{log.target}</td>
                                            <td className="p-3 text-sm">{log.details}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            default: return null;
        }
    }


    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <div className="flex flex-1 overflow-hidden">
                <Sidebar navigationItems={navigationItems} onSelect={setActiveView} />
                <main className="flex-1 p-8 overflow-y-auto">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;