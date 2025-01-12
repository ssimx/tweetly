'use client';
import { createContext, useContext, useState } from "react";

export interface TrendingHashtagType {
    name: string;
    _count: {
        posts: number;
    };
};

interface TrendingContextType {
    hashtags: TrendingHashtagType[] | undefined;
};

const TrendingContext = createContext<TrendingContextType | undefined>(undefined);

export const useTrendingContext = () => {
    const context = useContext(TrendingContext);
    if (!context) {
        throw new Error('useTrendingContext must be used within TrendingContextProvider');
    }

    return context;
}

export default function TrendingContextProvider({ trendingHashtags, children }: { trendingHashtags: TrendingHashtagType[], children: React.ReactNode }) {
    const [hashtags, ] = useState<TrendingHashtagType[]>(trendingHashtags);

    return (
        <TrendingContext.Provider value={{ hashtags }}>
            {children}
        </TrendingContext.Provider>
    )
}
