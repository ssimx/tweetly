'use client';
import { fetchLoggedInUser } from '@/actions/get-actions';
import { createContext, useContext, useState } from 'react';
import { ErrorResponse, getErrorMessage, LoggedInUserDataType } from 'tweetly-shared';

type UserContextType = {
    loggedInUser: LoggedInUserDataType,
    setLoggedInUser: React.Dispatch<React.SetStateAction<LoggedInUserDataType>>
    followingCount: number,
    setFollowingCount: React.Dispatch<React.SetStateAction<number>>,
    followersCount: number,
    setFollowersCount: React.Dispatch<React.SetStateAction<number>>,
    newFollowing: boolean,
    setNewFollowing: React.Dispatch<React.SetStateAction<boolean>>,
    refetchUserData: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUserContext = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error("useUserContext must be used within a UserProvider");
    return context;
};

export default function UserContextProvider({ children, userData }: { children: React.ReactNode, userData: LoggedInUserDataType }) {
    const [loggedInUser, setLoggedInUser] = useState<LoggedInUserDataType>(userData);
    const [followingCount, setFollowingCount] = useState(userData.following);
    const [followersCount, setFollowersCount] = useState(userData.followers);
    const [newFollowing, setNewFollowing] = useState(false);

    const refetchUserData = async () => {
        try {
            // Call the backend API again to get the updated user data
            const response = await fetchLoggedInUser();

            if (!response.success) {
                const errorData = response as ErrorResponse;
                throw new Error(errorData.error.message);
            }

            setLoggedInUser(response.data!.user); // Update the context with the latest data
        } catch (error: unknown) {
            const errorMessage = getErrorMessage(error);
            console.error('Log in error:', errorMessage);
        }
};

return (
    <UserContext.Provider
        value={{ loggedInUser, setLoggedInUser, newFollowing, setNewFollowing, followingCount, setFollowingCount, followersCount, setFollowersCount, refetchUserData }}>
        {children}
    </UserContext.Provider>
)
};

export { UserContext };