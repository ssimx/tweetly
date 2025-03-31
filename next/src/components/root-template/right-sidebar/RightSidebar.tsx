import React from 'react';
import RightSidebarFollowSuggestions from './RightSidebarFollowSuggestions';
import RightSidebarSearch from './RightSidebarSearch';
import RightSidebarTrendingHashtags from './RightSidebarTrendingHashtags';

export default function RightSidebar() {
    return (
        <div className='w-[95%] flex flex-col gap-5 mb-5'>
            <RightSidebarSearch />

            <RightSidebarFollowSuggestions />

            <RightSidebarTrendingHashtags />
        </div>
    )
}
