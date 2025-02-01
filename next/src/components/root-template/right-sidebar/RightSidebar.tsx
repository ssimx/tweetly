import React from 'react'
import RightSidebarFollowSuggestions from './RightSidebarFollowSuggestions'
import RightSidebarSearch from './RightSidebarSearch';
import RightSidebarTrendingHashtags from './RightSidebarTrendingHashtags';
import { getTrendingHashtags } from '@/data-acess-layer/misc-dto';

export default async function RightSidebar() {
    const hashtags = await getTrendingHashtags();

    return (
        <div className='w-[90%] flex flex-col gap-5'>
            <RightSidebarSearch />

            <RightSidebarFollowSuggestions/>

            <RightSidebarTrendingHashtags hashtags={hashtags} />
        </div>
    )
}
