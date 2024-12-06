import React from 'react'
import FollowSuggestions from './FollowSuggestions'
import Trending from './Trending'
import { decryptSession, getToken } from '@/lib/session';
import { redirect } from 'next/navigation';
import Search from './Search';

export default async function RightSidebar() {
    const token = getToken();
    const payload = await decryptSession(token);

    if (!payload) return redirect('/login');

    return (
        <div className='w-full flex flex-col gap-5'>
            <Search />

            <FollowSuggestions />

            <Trending />
        </div>
    )
}
