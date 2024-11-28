import React from 'react'
import FollowSuggestions from './FollowSuggestions'
import Trending from './Trending'
import { decryptSession, getToken } from '@/lib/session';
import { redirect } from 'next/navigation';

export default async function RightSidebar() {
    const token = getToken();
    const payload = await decryptSession(token);

    if (!payload) return redirect('/login');

    return (
        <div className='w-full flex flex-col gap-5'>
            <form action='search' className='h-[45px]'>
                <label className="h-full w-full flex items-center gap-4 text-gray-400 rounded-[25px] border px-4">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                        className="h-6 w-6 opacity-50">
                        <path
                            fillRule="evenodd"
                            d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                            clipRule="evenodd" />
                    </svg>
                    <input type="text" className='outline-none' placeholder="Search" />
                </label>
            </form>

            <FollowSuggestions />

            <Trending />
        </div>
    )
}
