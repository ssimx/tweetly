'use client';
import { UserInfo } from '@/lib/types';
import { createContext, useContext, useState } from 'react';

type UserContextType = {
    loggedInUser: UserInfo,
    setLoggedInUser: (user: UserInfo) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUserContext = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error("useUserContext must be used within a UserProvider");
    return context;
};

export default function UserContextProvider({ children, userData }: { children: React.ReactNode, userData: UserInfo }) {
    const [loggedInUser, setLoggedInUser] = useState<UserInfo>(userData);

    return (
        <UserContext.Provider 
            value={{ loggedInUser, setLoggedInUser }}>
            {children}
        </UserContext.Provider>
    )
};

export { UserContext };