'use client';
import { PostInfoType } from '@/lib/types';
import Image from 'next/image';
import PostBtns from './PostBtns';
import Link from 'next/link';
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import UserHoverCard from './UserHoverCard';
import { useState } from 'react';


export default function PostInfo({ post }: { post: PostInfoType }) {
    const [isFollowing, setIsFollowing] = useState(post.author['_count'].followers === 1);
    const [followers, setFollowers] = useState(post.author.followers.length);

    const postDate = new Date(post.createdAt);
    const postTime = `${postDate.getHours()}:${postDate.getMinutes()}`;
    const postFormatDate = `${postDate.toLocaleString('default', { month: 'short' })} ${postDate.getDate()}, ${postDate.getFullYear()}`;

    return (
        <>
            <div className='post'>
                <div className='post-header'>
                    <Link href={`/${post.author.username}`} className='group'>
                        <Image
                            src={post.author.profile?.profilePicture}
                            alt='Post author profile pic' width={50} height={50} className='rounded-full h-fit group-hover:outline group-hover:outline-primary/10' />
                    </Link>
                    <div className=''>
                        <HoverCard>
                            <HoverCardTrigger href={`/${post.author.username}`} className='font-bold hover:underline'>{post.author.profile?.name}</HoverCardTrigger>
                            <HoverCardContent>
                                <UserHoverCard
                                    author={post.author}
                                    followers={followers} setFollowers={setFollowers}
                                    isFollowing={isFollowing} setIsFollowing={setIsFollowing} />
                            </HoverCardContent>
                        </HoverCard>
                        <p>@{post.author.username}</p>
                    </div>
                </div>
                <div className='post-content'>
                    <p>{post.content}</p>
                </div>
                <div className='post-footer'>
                    <p>{postTime}</p>
                    <p className='px-1'>·</p>
                    <p>{postFormatDate}</p>
                </div>
                <div className='post-btns'>
                    <PostBtns post={post} />
                </div>
            </div>
        </>
    )
}
