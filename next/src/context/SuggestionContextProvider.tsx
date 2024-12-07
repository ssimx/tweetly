'use client';
import { createContext, useContext, useEffect, useState } from "react";

export interface UserSuggestion {
    username: string;
    profile: {
        name: string;
        bio: string;
        profilePicture: string;
    };
    following: {
        followeeId: number;
    }[];
    followers: {
        followerId: number;
    }[];
    _count: {
        followers: number;
        following: number;
    };
    isFollowing: boolean,
};

interface SuggestionContextType {
    suggestions: UserSuggestion[] | undefined;
    updateFollowState: (userId: string, isFollowing: boolean) => void;
    fetchSuggestions: () => Promise<void>;
};

const SuggestionContext = createContext<SuggestionContextType | undefined>(undefined);

export const useSuggestionContext = () => {
    const context = useContext(SuggestionContext);
    if (!context) {
        throw new Error('useSuggestionContext must be used within SuggestionContextProvider');
    }

    return context;
}

export default function SuggestionContextProvider({ children }: { children: React.ReactNode }) {
    const [suggestions, setSuggestions] = useState<UserSuggestion[] | undefined>(undefined);

    const fetchSuggestions = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/users/followSuggestions', {
                method: 'GET',
            });

            const data: UserSuggestion[] = await response.json().then((res) => {
                const mappedUsers = res.map((user: Omit<UserSuggestion, 'isFollowing'>) => {
                    return { ...user, isFollowing: false };
                });

                return mappedUsers;
            });
            setSuggestions(data);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        }
    };

    const updateFollowState = (username: string, isFollowing: boolean) => {
        if (suggestions === undefined) return;

        setSuggestions((current) => {
            if (!current) return [];
            return current.map((user) => (user.username === username ? { ...user, isFollowing } : user))
        });
    };

    useEffect(() => {
        fetchSuggestions();
    }, [children]);

    return (
        <SuggestionContext.Provider value={{ suggestions, updateFollowState, fetchSuggestions }}>
            { children }
        </SuggestionContext.Provider>
    )
}
