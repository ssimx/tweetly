'use client';
import { getErrorMessage } from "@/lib/utils";
import { createContext, useContext, useEffect, useState } from "react";

export interface FollowSuggestionType {
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

interface FollowSuggestionContextType {
    suggestions: FollowSuggestionType[] | undefined;
    updateFollowState: (userId: string, isFollowing: boolean) => void;
};

const FollowSuggestionContext = createContext<FollowSuggestionContextType | undefined>(undefined);

export const useFollowSuggestionContext = () => {
    const context = useContext(FollowSuggestionContext);
    if (!context) {
        throw new Error('useFollowSuggestionContext must be used within FollowSuggestionContextProvider');
    }

    return context;
}

export default function FollowSuggestionContextProvider({ followSuggestions, children }: { followSuggestions: FollowSuggestionType[], children: React.ReactNode }) {
    const [suggestions, setSuggestions] = useState<FollowSuggestionType[]>(followSuggestions);

    // const fetchFollowSuggestions = async (): Promise<void> => {
    //     try {
    //         const response = await fetch('http://localhost:3000/api/users/followSuggestions', {
    //             method: 'GET',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //         });

    //         if (!response.ok) {
    //             const errorData = await response.json();
    //             throw new Error(getErrorMessage(errorData));
    //         }

    //         const followSuggestions: FollowSuggestionType[] = await response.json().then((res) => {
    //             const mappedUsers = res.map((user: Omit<FollowSuggestionType, 'isFollowing'>) => {
    //                 return { ...user, isFollowing: false };
    //             });

    //             return mappedUsers;
    //         });
            
    //         setSuggestions(followSuggestions);
    //         return;
    //     } catch (error) {
    //         const errorMessage = getErrorMessage(error);
    //         console.error('Error fetching trending hashtags:', errorMessage);
    //         return;
    //     }
    // };

    const updateFollowState = async (username: string, isFollowing: boolean) => {
        if (suggestions === undefined) return;

        setSuggestions((current) => {
            if (!current) return [];
            return current.map((user) => (user.username === username ? { ...user, isFollowing } : user))
        });
    };

    // useEffect(() => {
    //     fetchFollowSuggestions();
    // }, [])

    return (
        <FollowSuggestionContext.Provider value={{ suggestions, updateFollowState }}>
            { children }
        </FollowSuggestionContext.Provider>
    )
}
