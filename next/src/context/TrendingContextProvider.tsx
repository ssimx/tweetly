'use client';
import { getTrendingHashtags } from '@/actions/get-actions';
import { createContext, useContext, useEffect, useState } from "react";
import { ErrorResponse, SuccessResponse, TrendingHashtagType } from 'tweetly-shared';

interface TrendingContextType {
    hashtags: TrendingHashtagType[] | undefined,
    setHashtags: React.Dispatch<React.SetStateAction<TrendingHashtagType[] | undefined>>,
};

const TrendingContext = createContext<TrendingContextType | undefined>(undefined);

export const useTrendingContext = () => {
    const context = useContext(TrendingContext);
    if (!context) {
        throw new Error('useTrendingContext must be used within TrendingContextProvider');
    }
    return context;
};

export default function TrendingContextProvider({ children }: { children: React.ReactNode }) {
    const [hashtags, setHashtags] = useState<TrendingHashtagType[] | undefined>(undefined);

    useEffect(() => {
        if (hashtags === undefined) {
            const fetchHashtags = async () => {
                try {
                    const response = await getTrendingHashtags();


                    if (!response.success) {
                        const errorData = response as ErrorResponse;
                        throw new Error(errorData.error.message);
                    }

                    const { data } = response as SuccessResponse<{ hashtags: TrendingHashtagType[] }>;
                    if (data === undefined) throw new Error('Data is missing in response');
                    else if (data.hashtags === undefined) throw new Error('Hashtags property is missing in data response');

                    setHashtags(data.hashtags);
                } catch (error) {
                    console.error('Error fetching trending hashtags:', error);
                }
            };

            fetchHashtags();
        }
    }, [hashtags]);

    return (
        <TrendingContext.Provider value={{ hashtags, setHashtags }}>
            {children}
        </TrendingContext.Provider>
    )
}
