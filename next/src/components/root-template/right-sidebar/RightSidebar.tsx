import React, { useEffect, useState } from 'react'
import RightSidebarFollowSuggestions from './RightSidebarFollowSuggestions'
import RightSidebarSearch from './RightSidebarSearch';
import RightSidebarTrendingHashtags from './RightSidebarTrendingHashtags';
import { getTrendingHashtags } from '@/actions/get-actions';
import { TrendingHashtagType } from '@/lib/types';

export default function RightSidebar() {
    const [hashtags, setHashtags] = useState<TrendingHashtagType[]>([]); 

    useEffect(() => {
        const fetchHashtags = async () => {
            try {
                const data = await getTrendingHashtags();
                setHashtags(data);
            } catch (error) {
                console.error('Error fetching trending hashtags:', error);
            }
        };

        fetchHashtags();
    }, []);

    return (
        <div className='w-[95%] flex flex-col gap-5 mb-5'>
            <RightSidebarSearch />

            <RightSidebarFollowSuggestions />

            <RightSidebarTrendingHashtags hashtags={hashtags} />
        </div>
    )
}
