import React from 'react'
import RightSidebarFollowSuggestions from './RightSidebarFollowSuggestions'
import RightSidebarSearch from './RightSidebarSearch';
import RightSidebarTrendingHashtags from './RightSidebarTrendingHashtags';
import { getTrendingHashtags } from '@/actions/get-actions';

export default async function RightSidebar() {
    const hashtags = await getTrendingHashtags();

    return (
        <div className='w-[95%] flex flex-col gap-5 mb-5'>
            <RightSidebarSearch />

            <RightSidebarFollowSuggestions />

            <RightSidebarTrendingHashtags hashtags={hashtags} />
        </div>
    )
}
