import React from 'react'
import FollowSuggestions from './RightSidebarFollowSuggestions'
import RightSidebarSearch from './RightSidebarSearch';
import RightSidebarTrendingHashtags from './RightSidebarTrendingHashtags';

export default async function RightSidebar() {
    return (
        <div className='w-[90%] flex flex-col gap-5'>
            <RightSidebarSearch />

            <FollowSuggestions />

            <RightSidebarTrendingHashtags />
        </div>
    )
}
