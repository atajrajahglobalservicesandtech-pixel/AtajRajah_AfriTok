import React, { useContext } from 'react';
import { AppContext } from '../App';
import { allMockUsers } from '../constants';
import { User, Role } from '../types';

const LoginPage: React.FC = () => {
    const { login } = useContext(AppContext);

    const handleLogin = (user: User) => {
        login(user);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-light to-secondary dark:from-dark-bg dark:to-dark-bg-secondary p-4">
            <div className="w-full max-w-md bg-light-bg-secondary dark:bg-dark-bg-secondary p-8 rounded-2xl shadow-2xl text-center animate-fadeIn">
                <h1 className="text-4xl font-bold mb-2">
                    <span className="text-secondary">Afri</span><span className="text-primary-light">Tok</span>
                </h1>
                <p className="text-light-text-secondary dark:text-dark-text-secondary mb-8">Digital Gifting & Creator Support</p>
                
                <h2 className="text-xl font-semibold mb-4 text-light-text dark:text-dark-text">Select a Role to Continue</h2>
                <div className="space-y-4">
                    {allMockUsers.map((user) => (
                        <button
                            key={user.id}
                            onClick={() => handleLogin(user)}
                            className="w-full flex items-center p-4 bg-white dark:bg-dark-bg rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all"
                        >
                            <img src={user.avatarUrl} alt={user.name} className="w-12 h-12 rounded-full mr-4 border-2 border-primary-light" />
                            <div className="text-left">
                                <p className="font-bold text-lg text-light-text dark:text-dark-text">{user.name}</p>
                                <p className="text-sm capitalize px-2 py-0.5 rounded-full inline-block text-white" style={{
                                    backgroundColor: user.role === Role.ADMIN ? '#EF4444' : user.role === Role.CREATOR ? '#EC4899' : '#4F46E5'
                                }}>{user.role}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
