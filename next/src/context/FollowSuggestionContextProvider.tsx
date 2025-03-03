'use client';
import { createContext, useContext, useState } from "react";
import { UserDataType } from 'tweetly-shared';

interface FollowSuggestionContextType {
    suggestions: UserDataType[] | undefined;
    setSuggestions: React.Dispatch<React.SetStateAction<UserDataType[] | undefined>>;
    updateFollowState: (username: string, isFollowed: boolean) => void;
};

const FollowSuggestionContext = createContext<FollowSuggestionContextType | undefined>(undefined);

export const useFollowSuggestionContext = () => {
    const context = useContext(FollowSuggestionContext);
    if (!context) {
        throw new Error('useFollowSuggestionContext must be used within FollowSuggestionContextProvider');
    }

    return context;
};

export default function FollowSuggestionContextProvider({ followSuggestions, children }: { followSuggestions: UserDataType[], children: React.ReactNode }) {
    const [suggestions, setSuggestions] = useState<UserDataType[] | undefined>(followSuggestions);

    const updateFollowState = (username: string, isFollowed: boolean) => {
        if (suggestions === undefined) return;

        const updatedSuggestions = suggestions.map((user) => {
            if (user.username === username) {
                const updatedCount = user.relationship.isFollowedByViewer !== isFollowed
                    ? {
                        followers: isFollowed ? ++user.stats.followersCount : --user.stats.followersCount,
                        following: user.stats.followingCount
                    }
                    : {
                        followers: user.stats.followersCount,
                        following: user.stats.followingCount
                    };

                return { ...user, relationship: { ...user.relationship, isFollowedByViewer: isFollowed }, _count: updatedCount };
            }
            return user;
        });

        setSuggestions(() => {
            return [...updatedSuggestions];
        });
    };

    return (
        <FollowSuggestionContext.Provider value={{ suggestions, setSuggestions, updateFollowState }}>
            { children }
        </FollowSuggestionContext.Provider>
    )
}
