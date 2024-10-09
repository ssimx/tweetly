'use client';
import { PostInfoType } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';
import { formatPostDate } from '@/lib/utils';
import PostBtns from './PostBtns';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import UserHoverCard from './UserHoverCard';

export default function ReplyPost({ post }: { post: PostInfoType }) {
    const [isFollowing, setIsFollowing] = useState(post.author['_count'].followers === 1);
    const [followers, setFollowers] = useState(post.author.followers.length);
    const router = useRouter();

    const handleCardClick = () => {
        router.push(`/${post.author.username}/status/${post.id}`);
    };

    return (
        <div onClick={() => handleCardClick()} className='post hover:bg-card-hover hover:cursor-pointer'>
            <div className='post-header'>
                <Link href={`/${post.author.username}`} className='group'>
                    <Image
                        src={`http://localhost:3001/public/profilePictures/${post.author.profile?.profilePicture}`}
                        alt='Post author profile pic' width={35} height={35} className='rounded-full h-fit group-hover:outline group-hover:outline-primary/10' />
                </Link>
                <div className='flex gap-2 text-dark-500'>
                    <HoverCard>
                        <HoverCardTrigger href={`/${post.author.username}`} className='text-black-1 font-bold hover:underline'>{post.author.profile?.name}</HoverCardTrigger>
                        <HoverCardContent>
                            <UserHoverCard
                                author={post.author}
                                followers={followers} setFollowers={setFollowers}
                                isFollowing={isFollowing} setIsFollowing={setIsFollowing} />
                        </HoverCardContent>
                    </HoverCard>
                    <p>@{post.author.username}</p>
                    <p>·</p>
                    <p>{formatPostDate(post.createdAt)}</p>
                </div>
            </div>
            <div className='post-content'>
                <p>{post.content}</p>
            </div>
            <div className='!border-t-0 post-btns'>
                <PostBtns post={post} />
            </div>
        </div>
    )
}
