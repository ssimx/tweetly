'use client';
import React, { useState } from 'react';

interface BlockedInfoType {
    username: string,
    isBlockedByTheUser: boolean,
    hasBlockedTheUser: boolean,
    setCanView: React.Dispatch<React.SetStateAction<boolean>>,
}

export default function BlockedInfo({ username, isBlockedByTheUser, hasBlockedTheUser, setCanView }: BlockedInfoType) {
    if (hasBlockedTheUser) {
        return (
            <div>
                <div className='mt-2 feed-hr-line'></div>
                <div className='w-full h-full flex flex-col items-center gap-2 px-10'>
                    <h1 className='mt-5 text-20 font-bold'>You are blocked</h1>
                    <p className='mb-auto'>You can&apos;t follow or see @{`${username}'s`} post.</p>
                </div>
            </div>
        )
    } else if (isBlockedByTheUser) {
        return (
            <div>
                <div className='mt-2 feed-hr-line'></div>
                <div className='w-full h-full flex flex-col items-center gap-2 px-[5%]'>
                    <h1 className='mt-5 text-20 font-bold'>@{`${username}`} is blocked</h1>
                    <div>
                        <p>Are you sure you want to view these posts?</p>
                        <p className='mb-auto'>Viewing posts won&apos;t unblock @{`${username}`}</p>
                    </div>
                    <button
                        className='mt-2 border-primary border px-4 py-2 rounded-xl text-primary font-bold hover:bg-primary hover:text-primary-text'
                        onClick={() => setCanView(true)} >
                        View Posts
                    </button>
                </div>
            </div>
        )
    }
}
