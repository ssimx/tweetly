'use client';
import { usePathname } from 'next/navigation';
import Trending from './Trending';
import { TrendingHashtagType } from '@/lib/types';
import { useTrendingContext } from '@/context/TrendingContextProvider';
import { useEffect } from 'react';

export default function RightSidebarTrendingHashtags({ hashtags }: { hashtags: TrendingHashtagType[] }) {
    const pathname = usePathname();
    const { setHashtags } = useTrendingContext();

    useEffect(() => {
        setHashtags(hashtags);
    }, [setHashtags, hashtags]);

    if (pathname.startsWith('/explore')) return <></>;
    return (
        <Trending />
    )
}
