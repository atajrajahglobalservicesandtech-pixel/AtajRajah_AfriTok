import React, { useState, useContext, useMemo } from 'react';
import { AppContext } from '../App';
import Header from '../components/Header';
import Modal from '../components/Modal';
import { Creator, Gift, Role, VerificationStatus, Transaction } from '../types';
import { ADMIN_FEE_PERCENTAGE } from '../constants';
import { formatCurrency } from '../utils';

const CreatorCard: React.FC<{ creator: Creator, onSendGift: (creator: Creator) => void }> = ({ creator, onSendGift }) => (
    <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-xl shadow-lg p-4 flex flex-col items-center text-center hover:scale-105 transition-transform duration-300">
        <img src={creator.avatarUrl} alt={creator.name} className="w-24 h-24 rounded-full mb-4 border-4 border-primary-light" />
        <h3 className="font-bold text-lg">{creator.name}</h3>
        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">@{creator.tiktokHandle}</p>
        <p className="text-sm font-semibold text-secondary my-2">{creator.followers.toLocaleString()} Followers</p>
        <button 
            onClick={() => onSendGift(creator)}
            className="mt-4 bg-gradient-to-r from-primary-light to-secondary text-white font-bold py-2 px-6 rounded-full hover:opacity-90 transition-opacity"
        >
            Send Gift
        </button>
    </div>
);

const GiftSelection: React.FC<{ gift: Gift, onSelect: () => void, canAfford: boolean }> = ({ gift, onSelect, canAfford }) => (
    <button 
        onClick={onSelect}
        disabled={!canAfford}
        className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
            canAfford ? 'border-light-border dark:border-dark-border hover:border-primary-light hover:scale-105' : 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800'
        }`}
    >
        <span className="text-4xl">{gift.icon}</span>
        <span className="font-semibold">{gift.name}</span>
        <span className="text-sm text-yellow-500 font-bold">{formatCurrency(gift.price)}</span>
    </button>
);

const UserDashboard: React.FC = () => {
    const { currentUser, creators, gifts, addTransaction, transactions } = useContext(AppContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [isGiftModalOpen, setGiftModalOpen] = useState(false);
    const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
    const [sentGiftInfo, setSentGiftInfo] = useState<{gift: Gift, creatorName: string} | null>(null);
    const [activeView, setActiveView] = useState('Discover');

    const handleOpenGiftModal = (creator: Creator) => {
        if(currentUser?.status === 'suspended') {
            alert('Your account is suspended. You cannot send gifts.');
            return;
        }
        setSelectedCreator(creator);
        setGiftModalOpen(true);
    };

    const handleCloseGiftModal = () => {
        setGiftModalOpen(false);
        setSelectedCreator(null);
    };

    const handleSendGift = (gift: Gift) => {
        if (!currentUser || !selectedCreator) return;
        
        if (currentUser.walletBalance < gift.price) {
            alert("Insufficient balance!");
            return;
        }

        if (gift.price > currentUser.spendingLimit) {
            alert(`This gift exceeds your spending limit of ${formatCurrency(currentUser.spendingLimit)}!`);
            return;
        }


        const adminFee = gift.price * ADMIN_FEE_PERCENTAGE;
        const creatorAmount = gift.price - adminFee;

        addTransaction({
            senderId: currentUser.id,
            receiverId: selectedCreator.id,
            giftId: gift.id,
            amount: gift.price,
            adminFee,
            creatorAmount,
        });
        
        setSentGiftInfo({gift, creatorName: selectedCreator.name});
        setTimeout(() => setSentGiftInfo(null), 3000);
        
        handleCloseGiftModal();
    };

    const filteredCreators = useMemo(() => 
        creators.filter(c =>
            c.verificationStatus === VerificationStatus.VERIFIED &&
            c.status === 'active' &&
            (c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
             c.tiktokHandle.toLowerCase().includes(searchTerm.toLowerCase()))
        ), [creators, searchTerm]);
    
    const mySentTransactions = useMemo(() =>
        transactions.filter(t => t.senderId === currentUser?.id), 
    [transactions, currentUser]);
    
    if (!currentUser) return null;

    const renderContent = () => {
        if(activeView === 'Discover') {
            return (
                <>
                    <div className="mb-6">
                        <input
                            type="text"
                            placeholder="Search by name or TikTok handle..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full max-w-lg p-3 rounded-lg bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border dark:border-dark-border focus:ring-2 focus:ring-primary-light focus:outline-none"
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredCreators.map(creator => (
                            <CreatorCard key={creator.id} creator={creator} onSendGift={handleOpenGiftModal} />
                        ))}
                    </div>
                </>
            );
        }

        if(activeView === 'History') {
            return (
                <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-bold mb-4">My Gift History</h3>
                     <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-light-border dark:border-dark-border">
                                    <th className="p-3">To Creator</th>
                                    <th className="p-3">Gift</th>
                                    <th className="p-3">Amount</th>
                                    <th className="p-3">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mySentTransactions.map(tx => {
                                    const gift = gifts.find(g => g.id === tx.giftId);
                                    const creator = creators.find(c => c.id === tx.receiverId);
                                    return (
                                        <tr key={tx.id} className="border-b border-light-border/50 dark:border-dark-border/50">
                                            <td className="p-3 font-semibold">{creator?.name || 'N/A'}</td>
                                            <td className="p-3 flex items-center gap-2"><span className="text-2xl">{gift?.icon}</span> {gift?.name}</td>
                                            <td className="p-3 font-semibold">{formatCurrency(tx.amount)}</td>
                                            <td className="p-3 text-sm text-light-text-secondary dark:text-dark-text-secondary">{new Date(tx.timestamp).toLocaleString()}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )
        }
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 p-4 sm:p-6 md:p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex border-b border-light-border dark:border-dark-border mb-6">
                        <button onClick={() => setActiveView('Discover')} className={`py-3 px-6 font-semibold transition-colors ${activeView === 'Discover' ? 'border-b-2 border-primary-light text-primary-light' : 'text-light-text-secondary dark:text-dark-text-secondary'}`}>
                            Discover Creators
                        </button>
                        <button onClick={() => setActiveView('History')} className={`py-3 px-6 font-semibold transition-colors ${activeView === 'History' ? 'border-b-2 border-primary-light text-primary-light' : 'text-light-text-secondary dark:text-dark-text-secondary'}`}>
                            Gift History
                        </button>
                    </div>

                    {renderContent()}
                </div>
            </main>

            {selectedCreator && (
                <Modal isOpen={isGiftModalOpen} onClose={handleCloseGiftModal} title={`Send a gift to ${selectedCreator.name}`}>
                    <div className="my-4">
                        <p className="text-center text-lg mb-4">Your Balance: <span className="font-bold text-primary-light">{formatCurrency(currentUser.walletBalance)}</span></p>
                        <div className="grid grid-cols-3 gap-4">
                            {gifts.map(gift => (
                                <GiftSelection 
                                    key={gift.id} 
                                    gift={gift} 
                                    onSelect={() => handleSendGift(gift)} 
                                    canAfford={currentUser.walletBalance >= gift.price}
                                />
                            ))}
                        </div>
                    </div>
                </Modal>
            )}
            
            {sentGiftInfo && (
                <div className="fixed bottom-10 right-10 bg-gradient-to-r from-green-400 to-blue-500 text-white p-6 rounded-xl shadow-2xl flex items-center gap-4 animate-giftSent">
                    <div className="text-5xl">{sentGiftInfo.gift.icon}</div>
                    <div>
                        <p className="font-bold text-lg">Gift Sent!</p>
                        <p>You sent a {sentGiftInfo.gift.name} to {sentGiftInfo.creatorName}.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDashboard;