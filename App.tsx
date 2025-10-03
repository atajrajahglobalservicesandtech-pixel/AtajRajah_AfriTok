import React, { useState, useMemo, useEffect } from 'react';
import { User, Role, Gift, Creator, Transaction, Withdrawal, AuditLog, WithdrawalStatus, AccountStatus } from './types';
import { mockUsers, mockCreators, mockGifts, mockTransactions, mockWithdrawals, mockAuditLogs } from './constants';
import UserDashboard from './screens/UserDashboard';
import CreatorDashboard from './screens/CreatorDashboard';
import AdminDashboard from './screens/AdminDashboard';
import LoginPage from './screens/LoginPage';
import { ThemeProvider, useTheme } from './hooks/useTheme';

export const AppContext = React.createContext<{
    currentUser: User | null;
    users: User[];
    creators: Creator[];
    gifts: Gift[];
    transactions: Transaction[];
    withdrawals: Withdrawal[];
    auditLogs: AuditLog[];
    adminWalletBalance: number;
    login: (user: User) => void;
    logout: () => void;
    addTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp'>) => void;
    updateCreator: (updatedCreator: Creator) => void;
    updateUser: (updatedUser: User) => void;
    updateUserStatus: (userId: string, status: AccountStatus, adminId: string) => void;
    requestWithdrawal: (withdrawal: Omit<Withdrawal, 'id' | 'requestedAt' | 'status'>) => void;
    processWithdrawal: (withdrawalId: string, status: WithdrawalStatus.APPROVED | WithdrawalStatus.REJECTED, adminId: string) => void;
}>({
    currentUser: null,
    users: [],
    creators: [],
    gifts: [],
    transactions: [],
    withdrawals: [],
    auditLogs: [],
    adminWalletBalance: 0,
    login: () => {},
    logout: () => {},
    addTransaction: () => {},
    updateCreator: () => {},
    updateUser: () => {},
    updateUserStatus: () => {},
    requestWithdrawal: () => {},
    processWithdrawal: () => {},
});

const AppContent: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>(mockUsers);
    const [creators, setCreators] = useState<Creator[]>(mockCreators);
    const [gifts, setGifts] = useState<Gift[]>(mockGifts);
    const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>(mockWithdrawals);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>(mockAuditLogs);
    const [adminWalletBalance, setAdminWalletBalance] = useState<number>(
        mockTransactions.reduce((acc, tx) => acc + tx.adminFee, 0)
    );

    const { theme } = useTheme();

    useEffect(() => {
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(theme);
    }, [theme]);

    const login = (user: User) => {
        const allUsersAndCreators = [...users, ...creators, ...mockUsers.filter(u => u.role === Role.ADMIN)];
        const fullUser = allUsersAndCreators.find(u => u.id === user.id);
        setCurrentUser(fullUser || user);
    };

    const logout = () => {
        setCurrentUser(null);
    };

    const addAuditLog = (adminId: string, action: string, target: string, details: string) => {
        const newLog: AuditLog = {
            id: `log-${Date.now()}`,
            adminId,
            action,
            target,
            details,
            timestamp: new Date().toISOString(),
        };
        setAuditLogs(prev => [newLog, ...prev]);
    };
    
    const addTransaction = (tx: Omit<Transaction, 'id' | 'timestamp'>) => {
        const newTransaction: Transaction = {
            ...tx,
            id: `tx-${Date.now()}`,
            timestamp: new Date().toISOString(),
        };

        setTransactions(prev => [newTransaction, ...prev]);

        // Update sender wallet
        setUsers(prev => prev.map(u => u.id === tx.senderId ? { ...u, walletBalance: u.walletBalance - tx.amount } : u));
        
        // Update receiver wallet
        setCreators(prev => prev.map(c => 
            c.id === tx.receiverId ? { ...c, earnings: c.earnings + tx.creatorAmount } : c
        ));

        // Update admin wallet
        setAdminWalletBalance(prev => prev + tx.adminFee);

        // Update current user if they are the sender
         if (currentUser && currentUser.id === tx.senderId) {
            setCurrentUser(prevUser => prevUser ? {...prevUser, walletBalance: prevUser.walletBalance - tx.amount} : null);
        }
    };

    const updateCreator = (updatedCreator: Creator) => {
        setCreators(creators.map(c => c.id === updatedCreator.id ? updatedCreator : c));
         if (currentUser && currentUser.id === updatedCreator.id) {
            setCurrentUser(updatedCreator);
        }
    }
    
    const updateUser = (updatedUser: User) => {
        if (updatedUser.role === Role.CREATOR) {
             setCreators(prev => prev.map(u => u.id === updatedUser.id ? (updatedUser as Creator) : u));
        } else {
            setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
        }

        if (currentUser && currentUser.id === updatedUser.id) {
            setCurrentUser(updatedUser);
        }
    }

    const updateUserStatus = (userId: string, status: AccountStatus, adminId: string) => {
        let userFound: User | Creator | undefined;
        
        const newCreators = creators.map(c => {
            if (c.id === userId) {
                userFound = c;
                return { ...c, status };
            }
            return c;
        });

        if (userFound) {
            setCreators(newCreators);
        } else {
            const newUsers = users.map(u => {
                if (u.id === userId) {
                    userFound = u;
                    return { ...u, status };
                }
                return u;
            });
            setUsers(newUsers);
        }

        if (userFound) {
            addAuditLog(adminId, status === 'suspended' ? 'SUSPEND_USER' : 'ACTIVATE_USER', userId, `Set status to ${status} for ${userFound.name}`);
        }
    };

    const requestWithdrawal = (wd: Omit<Withdrawal, 'id' | 'requestedAt' | 'status'>) => {
        const newWithdrawal: Withdrawal = {
            ...wd,
            id: `wd-${Date.now()}`,
            requestedAt: new Date().toISOString(),
            status: WithdrawalStatus.PENDING,
        };
        setWithdrawals(prev => [newWithdrawal, ...prev]);
    };

    const processWithdrawal = (withdrawalId: string, status: WithdrawalStatus.APPROVED | WithdrawalStatus.REJECTED, adminId: string) => {
        const withdrawal = withdrawals.find(w => w.id === withdrawalId);
        if (!withdrawal) return;

        const updatedWithdrawal: Withdrawal = {
            ...withdrawal,
            status,
            reviewedBy: adminId,
            reviewedAt: new Date().toISOString(),
        };

        setWithdrawals(prev => prev.map(w => w.id === withdrawalId ? updatedWithdrawal : w));

        if (status === WithdrawalStatus.APPROVED) {
            const creator = creators.find(c => c.id === withdrawal.creatorId);
            if (creator) {
                updateCreator({ ...creator, earnings: creator.earnings - withdrawal.amount });
            }
        }
        
        addAuditLog(adminId, status === WithdrawalStatus.APPROVED ? 'APPROVE_WITHDRAWAL' : 'REJECT_WITHDRAWAL', withdrawalId, `Processed withdrawal of ${withdrawal.amount} for creator ${withdrawal.creatorId}`);
    };

    const allUsersAndCreators = useMemo(() => [...users, ...creators], [users, creators]);

    const contextValue = useMemo(() => ({
        currentUser,
        users: allUsersAndCreators,
        creators,
        gifts,
        transactions,
        withdrawals,
        auditLogs,
        adminWalletBalance,
        login,
        logout,
        addTransaction,
        updateCreator,
        updateUser,
        updateUserStatus,
        requestWithdrawal,
        processWithdrawal,
    }), [currentUser, users, creators, gifts, transactions, withdrawals, auditLogs, adminWalletBalance]);

    const renderDashboard = () => {
        if (!currentUser) {
            return <LoginPage />;
        }
        switch (currentUser.role) {
            case Role.USER:
                return <UserDashboard />;
            case Role.CREATOR:
                return <CreatorDashboard />;
            case Role.ADMIN:
                return <AdminDashboard allUsers={allUsersAndCreators} allCreators={creators} />;
            default:
                return <LoginPage />;
        }
    };

    return (
        <AppContext.Provider value={contextValue}>
            <div className="bg-light-bg dark:bg-dark-bg min-h-screen text-light-text dark:text-dark-text transition-colors duration-300">
                {renderDashboard()}
            </div>
        </AppContext.Provider>
    );
};

const App: React.FC = () => (
    <ThemeProvider>
        <AppContent />
    </ThemeProvider>
);

export default App;