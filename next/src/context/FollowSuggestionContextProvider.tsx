'use client';
import { FollowSuggestionType } from "@/lib/types";
import { createContext, useContext, useState } from "react";

interface FollowSuggestionContextType {
    suggestions: FollowSuggestionType[] | undefined;
    setSuggestions: React.Dispatch<React.SetStateAction<FollowSuggestionType[]>>;
    updateFollowState: (userId: string, isFollowing: boolean) => void;
};

const FollowSuggestionContext = createContext<FollowSuggestionContextType | undefined>(undefined);

export const useFollowSuggestionContext = () => {
    const context = useContext(FollowSuggestionContext);
    if (!context) {
        throw new Error('useFollowSuggestionContext must be used within FollowSuggestionContextProvider');
    }

    return context;
};

// need persistent variable to keep following state when context re-renders, state doesn't work while navigating the webpage.
// this is good until context remounts, which is exactly what was intended
let savedSuggestions: FollowSuggestionType[];

export default function FollowSuggestionContextProvider({ followSuggestions, children }: { followSuggestions: FollowSuggestionType[], children: React.ReactNode }) {
    const [suggestions, setSuggestions] = useState<FollowSuggestionType[]>(savedSuggestions || followSuggestions);

    const updateFollowState = async (username: string, isFollowing: boolean) => {
        if (suggestions === undefined) return;

        const updatedSuggestions = suggestions.map((user) => (user.username === username ? { ...user, isFollowing } : user));
        setSuggestions(() => {
            return [ ...updatedSuggestions ]
        });
        savedSuggestions = [ ...updatedSuggestions ] as FollowSuggestionType[];
    };

    return (
        <FollowSuggestionContext.Provider value={{ suggestions, setSuggestions, updateFollowState }}>
            { children }
        </FollowSuggestionContext.Provider>
    )
}
