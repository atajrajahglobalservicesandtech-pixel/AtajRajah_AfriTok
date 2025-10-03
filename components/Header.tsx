import React, { useContext } from 'react';
import { AppContext } from '../App';
import { User, Role } from '../types';
import ThemeToggle from './ThemeToggle';
import { formatCurrency } from '../utils';

const Header: React.FC = () => {
    const { currentUser, logout } = useContext(AppContext);

    if (!currentUser) return null;

    const balanceToShow = currentUser.role === Role.CREATOR
        ? (currentUser as any).earnings
        : currentUser.walletBalance;
    
    const balanceLabel = currentUser.role === Role.CREATOR ? "Earnings" : "Balance";

    return (
        <header className="bg-light-bg-secondary dark:bg-dark-bg-secondary p-4 flex justify-between items-center shadow-md sticky top-0 z-20 border-b border-light-border dark:border-dark-border">
            <h1 className="text-xl md:text-2xl font-bold text-primary-light">
                <span className="text-secondary">Afri</span>Tok
            </h1>
            <div className="flex items-center gap-4">
                {currentUser.role !== Role.ADMIN && (
                    <div className="hidden sm:block bg-primary-light/10 dark:bg-primary-dark/20 text-primary-dark dark:text-primary-light font-semibold px-4 py-2 rounded-full">
                        {balanceLabel}: {formatCurrency(balanceToShow)}
                    </div>
                )}
                <ThemeToggle />
                <div className="flex items-center gap-3">
                    <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-10 h-10 rounded-full border-2 border-primary-light" />
                    <div className="hidden md:flex flex-col text-right">
                       <span className="font-semibold text-sm">{currentUser.name}</span>
                       <span className="text-xs text-light-text-secondary dark:text-dark-text-secondary capitalize">{currentUser.role}</span>
                    </div>
                </div>
                 <button
                    onClick={logout}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    Logout
                </button>
            </div>
        </header>
    );
};

export default Header;
