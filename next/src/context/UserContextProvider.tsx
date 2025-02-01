'use client';
import { UserInfo } from '@/lib/types';
import { createContext, useContext, useState } from 'react';

type UserContextType = {
    loggedInUser: UserInfo,
    setLoggedInUser: React.Dispatch<React.SetStateAction<UserInfo>>
    refetchUserData: () => void;
    newFollowing: boolean,
    setNewFollowing: React.Dispatch<React.SetStateAction<boolean>>
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUserContext = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error("useUserContext must be used within a UserProvider");
    return context;
};

export default function UserContextProvider({ children, userData }: { children: React.ReactNode, userData: UserInfo }) {
    const [loggedInUser, setLoggedInUser] = useState<UserInfo>(userData);
    const [newFollowing, setNewFollowing] = useState(false);

    const refetchUserData = async () => {
        // Call the backend API again to get the updated user data
        const response = await fetch('http://localhost:3000/api/users', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'reload',
        });

        if (response.ok) {
            const updatedUser = await response.json() as UserInfo;
            setLoggedInUser(() => ({...updatedUser})); // Update the context with the latest data
        }
    };

    return (
        <UserContext.Provider 
            value={{ loggedInUser, setLoggedInUser, refetchUserData, newFollowing, setNewFollowing }}>
            {children}
        </UserContext.Provider>
    )
};

export { UserContext };