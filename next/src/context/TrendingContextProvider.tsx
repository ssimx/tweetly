'use client';
import { createContext, useContext, useEffect, useState } from "react";

export interface TrendingHashtagsType {
    name: string;
    _count: {
        posts: number;
    };
};

interface TrendingContextType {
    trendingHashtags: TrendingHashtagsType[] | undefined;
};

const TrendingContext = createContext<TrendingContextType | undefined>(undefined);

export const useTrendingContext = () => {
    const context = useContext(TrendingContext);
    if (!context) {
        throw new Error('useTrendingContext must be used within TrendingContextProvider');
    }

    return context;
}

export default function TrendingContextProvider({ children }: { children: React.ReactNode }) {
    const [trendingHashtags, setTrendingHashtags] = useState<TrendingHashtagsType[] | undefined>(undefined);

    const fetchTrendings = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/posts/trending');

            const trendingHashtagsData: TrendingHashtagsType[] = await response.json().then((res) => res.hashtags);
            setTrendingHashtags(() => trendingHashtagsData);
        } catch (error) {
            console.error('Error fetching trendings:', error);
        }
    };

    useEffect(() => {
        fetchTrendings();
    }, [children]);

    return (
        <TrendingContext.Provider value={{ trendingHashtags }}>
            {children}
        </TrendingContext.Provider>
    )
}
