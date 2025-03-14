import React from 'react';
import { Rss, Reply, Image as Media, Heart, UsersRound } from 'lucide-react';

export default function ProfileNoContent({ type, authorized }: { type: 'POSTS' | 'REPLIES' | 'MEDIA' | 'LIKES' | 'FOLLOWERS' | 'FOLLOWING', authorized: boolean }) {
    return (
        <div className='w-full h-full flex flex-col mx-auto mt-[75px]'>
            <div className='flex flex-col items-center gap-4'>
                <div className='w-fit h-fit p-10 rounded-full bg-secondary-foreground'>
                    {type === 'POSTS' && (
                        <Rss size={50} className='text-primary' />
                    )}

                    {type === 'REPLIES' && (
                        <Reply size={50} className='text-primary' />
                    )}

                    {type === 'MEDIA' && (
                        <Media size={50} className='text-primary' />
                    )}

                    {type === 'LIKES' && (
                        <Heart size={50} className='text-primary' />
                    )}

                    {(type === 'FOLLOWERS' || type === 'FOLLOWING') && (
                        <UsersRound size={50} className='text-primary' />
                    )}

                </div>
                {authorized
                    ? <p className='text-secondary-text'>You currently have no {`${type.toLowerCase()}`}.</p>
                    : <p className='text-secondary-text'>User currently has no {`${type.toLowerCase()}`}.</p>
                }
            </div>
        </div>
    )
}
