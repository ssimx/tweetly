'use client';
import { UserInfo } from '@/lib/types';
import { createContext, useContext, useState, useEffect } from 'react';

type UserContextPropTypes = {
    user?: UserInfo,
    setUser?: React.Dispatch<React.SetStateAction<UserInfo | undefined>>,
    updateUser: () => Promise<void>,
};

const UserContext = createContext<UserContextPropTypes | undefined>(undefined);

export const useUserContext = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error("useUserContext must be used within a UserProvider");
    return context;
};

export default function UserContextProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserInfo | undefined>(undefined);

    const fetchUser = async () => {
        const response = await fetch('/api/user');
        const data = await response.json();
        setUser(data);
    };

    useEffect(() => {
        // Fetch user data
        fetchUser();
    }, []);

    const updateUser = async () => {
        await fetchUser();
    };

    return (
        <UserContext.Provider value={{ user, setUser, updateUser }}>
            {children}
        </UserContext.Provider>
    )
};

export { UserContext };