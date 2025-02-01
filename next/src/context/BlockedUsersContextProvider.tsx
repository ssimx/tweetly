'use client';
import React, { createContext, useContext, useState } from 'react';

interface BlockedUsersContextType {
    blockedUsers: string[],
    addBlockedUser: (username: string) => void;
    removeBlockedUser: (username: string) => void;
};

const BlockedUsersContext = createContext<BlockedUsersContextType | undefined>(undefined);

export const useBlockedUsersContext = () => {
    const context = useContext(BlockedUsersContext);
    if (!context) {
        throw new Error('useFollowSuggestionContext must be used within FollowSuggestionContextProvider');
    }
    return context;
};

export default function BlockedUsersContextProvider({ children }: { children: React.ReactNode }) {
    const [blockedUsers, setBlockedUsers] = useState<string[]>([]);

    const addBlockedUser = (username: string) => {
        setBlockedUsers([...blockedUsers, username]);
    };

    const removeBlockedUser = (username: string) => {
        setBlockedUsers(blockedUsers.toSpliced(blockedUsers.findIndex((user) => user === username), 1));
    };

    return (
        <BlockedUsersContext.Provider value={{ blockedUsers, addBlockedUser, removeBlockedUser }}>
            {children}
        </BlockedUsersContext.Provider>
    )
}
