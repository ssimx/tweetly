import React from 'react'
import FollowSuggestions from './FollowSuggestions'
import { decryptSession, getToken } from '@/lib/session';
import { redirect } from 'next/navigation';
import RightSidebarSearch from './RightSidebarSearch';
import RightSidebarTrending from './RightSidebarTrending';

export default async function RightSidebar() {
    const token = getToken();
    const payload = await decryptSession(token);

    if (!payload) return redirect('/login');

    return (
        <div className='w-full flex flex-col gap-5'>
            <RightSidebarSearch />

            <FollowSuggestions />

            <RightSidebarTrending />
        </div>
    )
}
