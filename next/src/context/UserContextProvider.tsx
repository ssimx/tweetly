'use client';
import { fetchLoggedInUser } from '@/actions/get-actions';
import { UserInfo } from '@/lib/types';
import { createContext, useContext, useState } from 'react';

type UserContextType = {
    loggedInUser: UserInfo,
    setLoggedInUser: React.Dispatch<React.SetStateAction<UserInfo>>
    followingCount: number,
    setFollowingCount: React.Dispatch<React.SetStateAction<number>>,
    followersCount: number,
    setFollowersCount: React.Dispatch<React.SetStateAction<number>>,
    newFollowing: boolean,
    setNewFollowing: React.Dispatch<React.SetStateAction<boolean>>
    refetchUserData: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUserContext = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error("useUserContext must be used within a UserProvider");
    return context;
};

export default function UserContextProvider({ children, userData }: { children: React.ReactNode, userData: UserInfo }) {
    const [loggedInUser, setLoggedInUser] = useState<UserInfo>(userData);
    const [followingCount, setFollowingCount] = useState(userData._count.following);
    const [followersCount, setFollowersCount] = useState(userData._count.followers);
    const [newFollowing, setNewFollowing] = useState(false);

    const refetchUserData = async () => {
        // Call the backend API again to get the updated user data
        const freshInfo = await fetchLoggedInUser();

        setLoggedInUser(freshInfo); // Update the context with the latest data
    };

    return (
        <UserContext.Provider 
            value={{ loggedInUser, setLoggedInUser, newFollowing, setNewFollowing, followingCount, setFollowingCount, followersCount, setFollowersCount, refetchUserData }}>
            {children}
        </UserContext.Provider>
    )
};

export { UserContext };