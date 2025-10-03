import React from 'react';

interface SidebarProps {
    // FIX: Replaced JSX.Element with React.ReactNode to fix "Cannot find namespace 'JSX'" error.
    navigationItems: { name: string; icon: React.ReactNode; current: boolean }[];
    onSelect: (name: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ navigationItems, onSelect }) => {
    return (
        <aside className="w-64 bg-light-bg-secondary dark:bg-dark-bg-secondary p-4 flex flex-col border-r border-light-border dark:border-dark-border">
            <nav className="flex-1 space-y-2">
                {navigationItems.map((item) => (
                    <button
                        key={item.name}
                        onClick={() => onSelect(item.name)}
                        className={`w-full flex items-center p-3 rounded-lg text-left transition-colors ${
                            item.current
                                ? 'bg-primary-light text-white shadow-lg'
                                : 'text-light-text-secondary dark:text-dark-text-secondary hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                    >
                        <div className="w-6 h-6 mr-3">{item.icon}</div>
                        <span className="font-semibold">{item.name}</span>
                    </button>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;
