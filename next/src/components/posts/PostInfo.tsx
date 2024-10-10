'use client';
import { PostType } from '@/lib/types';
import Image from 'next/image';
import PostBtns from './PostBtns';
import Link from 'next/link';
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import UserHoverCard from '../UserHoverCard';
import { useState } from 'react';


export default function PostInfo({ post }: { post: PostType }) {
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
                            src={post.author.profile.profilePicture}
                            alt='Post author profile pic' width={50} height={50} className='w-[50px] h-[50px] rounded-full group-hover:outline group-hover:outline-primary/10' />
                    </Link>
                    <div className=''>
                        <HoverCard>
                            <HoverCardTrigger href={`/${post.author.username}`} className='font-bold hover:underline'>{post.author.profile.name}</HoverCardTrigger>
                            <HoverCardContent>
                                <UserHoverCard
                                    author={{
                                        username: post.author.username,
                                        name: post.author.profile.name,
                                        profilePicture: post.author.profile.profilePicture,
                                        bio: post.author.profile.bio,
                                        following: post.author['_count'].following,
                                    }}
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
                    <PostBtns
                        postId={post.id}
                        author={post.author.username}
                        replies={post['_count'].replies}
                        reposts={post['_count'].reposts}
                        likes={post['_count'].likes}
                        reposted={!!post.reposts.length}
                        liked={!!post.likes.length}
                        bookmarked={!!post.bookmarks.length} />
                </div>
            </div>
        </>
    )
}
