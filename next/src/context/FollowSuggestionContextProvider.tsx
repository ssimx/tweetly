'use client';
import { getFollowSuggestions } from '@/actions/get-actions';
import { createContext, useContext, useEffect, useState } from "react";
import { ErrorResponse, SuccessResponse, UserDataType } from 'tweetly-shared';

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

export default function FollowSuggestionContextProvider({ children }: { children: React.ReactNode }) {
    const [suggestions, setSuggestions] = useState<UserDataType[] | undefined>(undefined);

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

    useEffect(() => {
        if (suggestions === undefined) {
            const fetchHashtags = async () => {
                try {
                    const response = await getFollowSuggestions();

                    if (!response.success) {
                        const errorData = response as ErrorResponse;
                        throw new Error(errorData.error.message);
                    }

                    const { data } = response as SuccessResponse<{ suggestedUsers: UserDataType[] }>;
                    if (data === undefined) throw new Error('Data is missing in response');
                    else if (data.suggestedUsers === undefined) throw new Error('SuggestedUsers property is missing in data response');

                    setSuggestions(data.suggestedUsers);
                } catch (error) {
                    console.error('Error fetching follow suggestions:', error);
                }
            };

            fetchHashtags();
        }
    }, [suggestions]);

    return (
        <FollowSuggestionContext.Provider value={{ suggestions, setSuggestions, updateFollowState }}>
            {children}
        </FollowSuggestionContext.Provider>
    )
}
