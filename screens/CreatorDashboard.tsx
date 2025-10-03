import React, { useContext, useMemo, useState } from 'react';
import Header from '../components/Header';
import { AppContext } from '../App';
import { Creator, Transaction, VerificationStatus, VerificationResult, WithdrawalRiskResult, Withdrawal, WithdrawalStatus } from '../types';
import Sidebar from '../components/Sidebar';
import { mockGifts } from '../constants';
import { verifyCreatorWithGemini, checkWithdrawalWithGemini } from '../services/geminiService';
import { formatCurrency } from '../utils';

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary p-6 rounded-xl shadow-lg flex items-center gap-4">
        <div className="bg-primary-light/10 p-3 rounded-full">{icon}</div>
        <div>
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    </div>
);

const VerificationPanel: React.FC<{ creator: Creator, onUpdate: (c: Creator) => void }> = ({ creator, onUpdate }) => {
    const [tiktokHandle, setTiktokHandle] = useState(creator.tiktokHandle || '');
    const [isLoading, setIsLoading] = useState(false);
    const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);

    const handleVerify = async () => {
        setIsLoading(true);
        setVerificationResult(null);
        const result = await verifyCreatorWithGemini(tiktokHandle);
        setIsLoading(false);
        if (result) {
            setVerificationResult(result);
            if (result.follower_check_passed) {
                 onUpdate({
                    ...creator,
                    verificationStatus: VerificationStatus.PENDING,
                    tiktokHandle,
                    followers: result.follower_count_simulated
                });
            } else {
                 onUpdate({
                    ...creator,
                    verificationStatus: VerificationStatus.REJECTED,
                    tiktokHandle,
                    followers: result.follower_count_simulated
                });
            }
        }
    };

    if (creator.verificationStatus === VerificationStatus.VERIFIED) {
        return (
             <div className="bg-green-100 dark:bg-green-900/50 border-l-4 border-green-500 p-6 rounded-r-lg">
                <h3 className="text-xl font-bold text-green-800 dark:text-green-300 mb-2">Account Verified!</h3>
                <p className="text-green-700 dark:text-green-400">Congratulations! You are a verified creator and can receive gifts.</p>
            </div>
        );
    }
    
     if (creator.verificationStatus === VerificationStatus.PENDING) {
        return (
             <div className="bg-yellow-100 dark:bg-yellow-900/50 border-l-4 border-yellow-500 p-6 rounded-r-lg">
                <h3 className="text-xl font-bold text-yellow-800 dark:text-yellow-300 mb-2">Verification Pending</h3>
                <p className="text-yellow-700 dark:text-yellow-400">Your application is under review by our admin team. Please check back later.</p>
            </div>
        );
    }

    return (
        <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold mb-4">Become a Verified Creator</h3>
            <p className="mb-4 text-light-text-secondary dark:text-dark-text-secondary">Enter your TikTok handle to start the verification process. You need at least 1,000 followers.</p>
            <div className="flex gap-2 mb-4">
                 <input
                    type="text"
                    placeholder="@yourhandle"
                    value={tiktokHandle}
                    onChange={(e) => setTiktokHandle(e.target.value)}
                    className="flex-grow p-3 rounded-lg bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border focus:ring-2 focus:ring-primary-light focus:outline-none"
                />
                <button onClick={handleVerify} disabled={isLoading || !tiktokHandle} className="bg-primary-light hover:bg-primary-dark text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-50">
                    {isLoading ? 'Verifying...' : 'Verify'}
                </button>
            </div>
            {isLoading && <div className="text-center p-4">Checking with AI...</div>}
            {verificationResult && (
                <div className={`mt-4 p-4 rounded-lg ${verificationResult.follower_check_passed ? 'bg-green-100 dark:bg-green-900/50' : 'bg-red-100 dark:bg-red-900/50'}`}>
                    <h4 className="font-bold text-lg mb-2">{verificationResult.follower_check_passed ? 'Pre-approval Passed!' : 'Pre-approval Failed'}</h4>
                    <p><strong>Simulated Followers:</strong> {verificationResult.follower_count_simulated.toLocaleString()}</p>
                    <p className="mt-2 text-sm">{verificationResult.user_instructions}</p>
                    <p className="font-mono bg-gray-200 dark:bg-gray-700 p-2 rounded mt-2 text-center text-lg tracking-widest">{verificationResult.verification_code}</p>
                </div>
            )}
        </div>
    );
};

const WithdrawalPanel: React.FC<{ creator: Creator }> = ({ creator }) => {
    const { withdrawals, requestWithdrawal } = useContext(AppContext);
    const [amount, setAmount] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [riskResult, setRiskResult] = useState<WithdrawalRiskResult | null>(null);
    
    const myWithdrawals = useMemo(() => withdrawals.filter(w => w.creatorId === creator.id), [withdrawals, creator.id]);

    const handleRequestWithdrawal = async () => {
        if(creator.status === 'suspended') {
            alert('Your account is suspended. You cannot request withdrawals.');
            return;
        }

        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            alert("Please enter a valid amount.");
            return;
        }
        if (numericAmount > creator.earnings) {
            alert("Withdrawal amount cannot exceed your earnings.");
            return;
        }
        
        setIsLoading(true);
        const aiCheck = await checkWithdrawalWithGemini(numericAmount, creator.earnings);
        setRiskResult(aiCheck);
        
        if(aiCheck.riskLevel === 'High') {
            alert(`Withdrawal blocked by AI: ${aiCheck.reason}`);
            setIsLoading(false);
            return;
        }

        requestWithdrawal({
            creatorId: creator.id,
            amount: numericAmount,
            riskLevel: aiCheck.riskLevel,
            riskReason: aiCheck.reason,
        });

        setIsLoading(false);
        setAmount('');
        setTimeout(() => setRiskResult(null), 5000);
    };

    const getStatusColor = (status: WithdrawalStatus) => ({
        [WithdrawalStatus.PENDING]: 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/50',
        [WithdrawalStatus.APPROVED]: 'text-green-500 bg-green-100 dark:bg-green-900/50',
        [WithdrawalStatus.REJECTED]: 'text-red-500 bg-red-100 dark:bg-red-900/50',
    }[status]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
                 <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-bold mb-4">Request Withdrawal</h3>
                     <p className="mb-4">Available for withdrawal: <span className="font-bold text-green-500">{formatCurrency(creator.earnings)}</span></p>
                    <div className="flex flex-col gap-4">
                        <input
                            type="number"
                            placeholder="Amount in NGN"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="p-3 rounded-lg bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border focus:ring-2 focus:ring-primary-light focus:outline-none"
                            disabled={creator.status === 'suspended'}
                        />
                        <button onClick={handleRequestWithdrawal} disabled={isLoading || creator.earnings <= 0 || creator.status === 'suspended'} className="bg-primary-light hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50">
                            {isLoading ? 'AI is Checking...' : 'Request Payout'}
                        </button>
                    </div>
                    {riskResult && (
                         <div className={`mt-4 p-3 rounded-lg text-sm ${riskResult.riskLevel === 'Low' ? 'bg-green-100 dark:bg-green-900/50' : 'bg-yellow-100 dark:bg-yellow-900/50'}`}>
                            <p><strong>AI Status:</strong> {riskResult.reason}</p>
                        </div>
                    )}
                </div>
            </div>
            <div className="lg:col-span-2 bg-light-bg-secondary dark:bg-dark-bg-secondary p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-bold mb-4">Withdrawal History</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-light-border dark:border-dark-border">
                                <th className="p-3">Date</th>
                                <th className="p-3">Amount</th>
                                <th className="p-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {myWithdrawals.map(wd => (
                                <tr key={wd.id} className="border-b border-light-border/50 dark:border-dark-border/50">
                                    <td className="p-3 text-sm text-light-text-secondary dark:text-dark-text-secondary">{new Date(wd.requestedAt).toLocaleDateString()}</td>
                                    <td className="p-3 font-semibold">{formatCurrency(wd.amount)}</td>
                                    <td className="p-3"><span className={`px-2 py-1 text-xs font-bold rounded-full capitalize ${getStatusColor(wd.status)}`}>{wd.status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
};


const CreatorDashboard: React.FC = () => {
    const { currentUser, transactions, updateCreator } = useContext(AppContext);
    const [activeView, setActiveView] = useState('Dashboard');

    const creator = currentUser as Creator;

    const myTransactions = useMemo(() =>
        transactions.filter(t => t.receiverId === creator.id)
    , [transactions, creator.id]);

    const navigationItems = [
        { name: 'Dashboard', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>, current: activeView === 'Dashboard' },
        { name: 'Withdrawals', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>, current: activeView === 'Withdrawals' },
        { name: 'Verification', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, current: activeView === 'Verification' },
    ];
    
    const renderContent = () => {
        return (
            <>
            {creator.status === 'suspended' && (
                <div className="bg-red-100 dark:bg-red-900/50 border-l-4 border-red-500 p-4 rounded-r-lg mb-6">
                    <h3 className="text-lg font-bold text-red-800 dark:text-red-300">Account Suspended</h3>
                    <p className="text-red-700 dark:text-red-400">Your account is currently suspended. You cannot receive gifts or make withdrawals. Please contact support.</p>
                </div>
            )}
            {
                (() => {
                    switch(activeView) {
                        case 'Dashboard':
                            return (
                                <div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                        <StatCard title="Total Earnings" value={formatCurrency(creator.earnings)} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-light" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 13v-1m-4.5-4.5H6m12 0h-1.5M12 18a6 6 0 100-12 6 6 0 000 12z" /></svg>} />
                                        <StatCard title="Total Gifts Received" value={myTransactions.length.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-light" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>} />
                                        <StatCard title="Followers" value={creator.followers.toLocaleString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-light" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>} />
                                    </div>
                                    <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary p-6 rounded-xl shadow-lg">
                                        <h3 className="text-xl font-bold mb-4">Recent Gifts</h3>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="border-b border-light-border dark:border-dark-border">
                                                        <th className="p-3">Gift</th>
                                                        <th className="p-3">Amount</th>
                                                        <th className="p-3">Date</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {myTransactions.slice(0, 5).map(tx => {
                                                        const gift = mockGifts.find(g => g.id === tx.giftId);
                                                        return (
                                                            <tr key={tx.id} className="border-b border-light-border/50 dark:border-dark-border/50">
                                                                <td className="p-3 flex items-center gap-2"><span className="text-2xl">{gift?.icon}</span> {gift?.name}</td>
                                                                <td className="p-3 font-semibold text-green-500">+{formatCurrency(tx.creatorAmount)}</td>
                                                                <td className="p-3 text-sm text-light-text-secondary dark:text-dark-text-secondary">{new Date(tx.timestamp).toLocaleString()}</td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            );
                        case 'Withdrawals':
                            return <WithdrawalPanel creator={creator} />;
                        case 'Verification':
                             return <VerificationPanel creator={creator} onUpdate={updateCreator} />;
                        default: return null;
                    }
                })()
            }
            </>
        );
    }

    if (!creator) return null;

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

export default CreatorDashboard;