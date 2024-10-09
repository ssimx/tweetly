'use client';
import { PostInfoType } from '@/lib/types';
import Image from 'next/image';
import PostBtns from './PostBtns';
import Link from 'next/link';
import ParentPostInfo from './ParentPostInfo';
import { useEffect, useRef, useState } from 'react';
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import UserHoverCard from './UserHoverCard';

export default function ReplyInfo({ replyPost, parentPost }: { replyPost: PostInfoType, parentPost: PostInfoType }) {
    const [isFollowing, setIsFollowing] = useState(replyPost.author['_count'].followers === 1);
    const [followers, setFollowers] = useState(replyPost.author.followers.length);

    const replyDate = new Date(replyPost.createdAt);
    const replyTime = `${replyDate.getHours()}:${replyDate.getMinutes()}`;
    const replyFormatDate = `${replyDate.toLocaleString('default', { month: 'short' })} ${replyDate.getDate()}, ${replyDate.getFullYear()}`;
    const parentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        parentRef.current && parentRef.current.scrollIntoView();
    }, []);

    return (
        <div className='flex flex-col'>
            <ParentPostInfo postInfo={parentPost} />

            <div className='post' ref={parentRef}>
                <div className='post-header'>
                    <Link href={`/${replyPost.author.username}`} className='group'>
                        <Image
                            src={replyPost.author.profile?.profilePicture}
                            alt='Post author profile pic' width={50} height={50} className='w-[52px] rounded-full h-fit group-hover:outline group-hover:outline-primary/10' />
                    </Link>
                    <div className=''>
                        <HoverCard>
                            <HoverCardTrigger href={`/${replyPost.author.username}`} className='font-bold hover:underline'>{replyPost.author.profile?.name}</HoverCardTrigger>
                            <HoverCardContent>
                                <UserHoverCard
                                    author={replyPost.author}
                                    followers={followers} setFollowers={setFollowers}
                                    isFollowing={isFollowing} setIsFollowing={setIsFollowing} />
                            </HoverCardContent>
                        </HoverCard>
                        <p className='text-dark-500'>@{replyPost.author.username}</p>
                    </div>
                </div>
                <div className='post-content'>
                    <p>{replyPost.content}</p>
                </div>
                <div className='post-footer'>
                    <p>{replyTime}</p>
                    <p className='px-1'>·</p>
                    <p>{replyFormatDate}</p>
                </div>
                <div className='post-btns'>
                    <PostBtns post={replyPost} />
                </div>
            </div>
        </div>
    )
}
