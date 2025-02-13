'use client';
import { FollowSuggestionType } from "@/lib/types";
import { createContext, useContext, useState } from "react";

interface FollowSuggestionContextType {
    suggestions: FollowSuggestionType[] | undefined;
    setSuggestions: React.Dispatch<React.SetStateAction<FollowSuggestionType[] | undefined>>;
    updateFollowState: (username: string, isFollowed: boolean) => void;
    updateFollowersCount: (username: string, type: 'increase' | 'decrease') => void;
    updateFollowingCount: (username: string, type: 'increase' | 'decrease') => void;
};

const FollowSuggestionContext = createContext<FollowSuggestionContextType | undefined>(undefined);

export const useFollowSuggestionContext = () => {
    const context = useContext(FollowSuggestionContext);
    if (!context) {
        throw new Error('useFollowSuggestionContext must be used within FollowSuggestionContextProvider');
    }

    return context;
};

export default function FollowSuggestionContextProvider({ followSuggestions, children }: { followSuggestions: FollowSuggestionType[], children: React.ReactNode }) {
    const [suggestions, setSuggestions] = useState<FollowSuggestionType[] | undefined>(followSuggestions ?? undefined);

    const updateFollowState = (username: string, isFollowed: boolean) => {
        if (suggestions === undefined) return;

        const updatedSuggestions = suggestions.map((user) => {
            if (user.username === username) {
                const updatedCount = user.isFollowed !== isFollowed
                    ? {
                        followers: isFollowed ? ++user._count.followers : --user._count.followers,
                        following: user._count.following
                    }
                    : {
                        followers: user._count.followers,
                        following: user._count.following
                    };

                return { ...user, isFollowed, _count: updatedCount };
            }
            return user;
        });

        setSuggestions(() => {
            return [...updatedSuggestions];
        });
    };

    const updateFollowersCount = (username: string, type: 'increase' | 'decrease') => {
        if (suggestions === undefined) return;

        const updatedSuggestions = suggestions.map((user) => (user.username === username ? {
            ...user, _count: { followers: type === 'increase' ? user._count.followers + 1 : user._count.followers - 1, following: user._count.following }
        } : user));

        setSuggestions(() => {
            return [...updatedSuggestions]
        });
    };

    const updateFollowingCount = (username: string, type: 'increase' | 'decrease') => {
        if (suggestions === undefined) return;

        const updatedSuggestions = suggestions.map((user) => (user.username === username ? {
            ...user, _count: { followers: user._count.followers, following: type === 'increase' ? user._count.following + 1 : user._count.following - 1 }
        } : user));

        setSuggestions(() => {
            return [...updatedSuggestions]
        });
    };

    return (
        <FollowSuggestionContext.Provider value={{ suggestions, setSuggestions, updateFollowState, updateFollowersCount, updateFollowingCount }}>
            { children }
        </FollowSuggestionContext.Provider>
    )
}
