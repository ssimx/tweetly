'use client';
import { PostInfoType } from '@/lib/types';
import React from 'react'
import Link from 'next/link';
import Image from 'next/image';
import { formatPostDate } from '@/lib/utils';
import PostBtns from './PostBtns';
import { useRouter } from 'next/navigation';

export default function ParentPostInfo({ postInfo }: { postInfo: PostInfoType }) {

    const router = useRouter();

    const handleCardClick = () => {
        router.push(`/${postInfo.author.username}/status/${postInfo.id}`);
    };

    return (
        <div onClick={handleCardClick} className='parent-post'>
            <div className='parent-post-left-side'>
                <Link href={`/${postInfo.author.username}`} className='flex group'>
                    <Image
                        src={`http://localhost:3001/public/profilePictures/${postInfo.author.profile?.profilePicture}`}
                        alt='Post author profile pic' width={50} height={50} className='min-w-[52px] max-w-[52px] h-fit rounded-full group-hover:outline group-hover:outline-primary/10' />
                </Link>

                <div className='border-x h-full origin-top' style={{ transform: 'scaleY(1.23)' }}></div>
            </div>

            <div className='w-full flex flex-col gap-2'>
                <div className='flex gap-2 text-gray-500'>
                    <Link href={`/${postInfo.author.username}`} className='text-black-1 font-bold hover:underline'>{postInfo.author.profile?.name}</Link>
                    <p>@{postInfo.author.username}</p>
                    <p>·</p>
                    <p>{formatPostDate(postInfo.createdAt)}</p>
                </div>

                <div className='post-content'>
                    <p>{postInfo.content}</p>
                </div>

                <div className='!border-t-0 post-btns'>
                    <PostBtns post={postInfo} />
                </div>
            </div>
        </div>
    )
}
